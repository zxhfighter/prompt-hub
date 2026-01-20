import { db } from '@/lib/db';
import { prompts, promptVersions, promptTags, tags } from '@/lib/db/schema';
import { eq, and, desc, ilike, or, sql, inArray } from 'drizzle-orm';
import type { PromptStatus } from '@/types';

export interface CreatePromptInput {
  userId: string;
  title: string;
  content: string;
  tagIds?: string[];
  publish?: boolean;
  description?: string;
}

export interface UpdatePromptInput {
  title?: string;
  content?: string;
  tagIds?: string[];
}

// Get prompts list with filtering
export async function getPrompts({
  userId,
  status,
  search,
  tagIds,
  page = 1,
  limit = 20,
}: {
  userId: string;
  status?: PromptStatus;
  search?: string;
  tagIds?: string[];
  page?: number;
  limit?: number;
}) {
  const offset = (page - 1) * limit;

  // Build base query
  let baseQuery = db
    .selectDistinct({
      id: prompts.id,
      title: prompts.title,
      status: prompts.status,
      draftContent: prompts.draftContent,
      currentVersionId: prompts.currentVersionId,
      createdAt: prompts.createdAt,
      updatedAt: prompts.updatedAt,
      // Add version content for searching
      versionContent: promptVersions.content,
    })
    .from(prompts)
    .leftJoin(promptVersions, eq(prompts.currentVersionId, promptVersions.id));

  // Build conditions
  const conditions = [eq(prompts.userId, userId)];
  
  if (status) {
    if (status === 'published') {
      conditions.push(inArray(prompts.status, ['published', 'published_with_updates']));
    } else {
      conditions.push(eq(prompts.status, status));
    }
  }
  
  if (search) {
    conditions.push(
      or(
        ilike(prompts.title, `%${search}%`),
        ilike(prompts.draftContent, `%${search}%`),
        ilike(promptVersions.content, `%${search}%`)
      )!
    );
  }

  if (tagIds && tagIds.length > 0) {
    // Subquery to find prompt IDs that have at least one of the tags
    const subquery = db
      .select({ promptId: promptTags.promptId })
      .from(promptTags)
      .where(inArray(promptTags.tagId, tagIds));
    
    conditions.push(inArray(prompts.id, subquery));
  }

  // Execute query with pagination
  const result = await baseQuery
    .where(and(...conditions))
    .orderBy(desc(prompts.updatedAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(prompts)
    .leftJoin(promptVersions, eq(prompts.currentVersionId, promptVersions.id))
    .where(and(...conditions));

  const total = Number(countResult[0]?.count || 0);

  // Get tags for each prompt
  const promptIds = result.map((p) => p.id);
  const promptTagsResult = promptIds.length > 0
    ? await db
        .select({
          promptId: promptTags.promptId,
          tagId: tags.id,
          tagName: tags.name,
          tagColor: tags.color,
        })
        .from(promptTags)
        .innerJoin(tags, eq(promptTags.tagId, tags.id))
        .where(inArray(promptTags.promptId, promptIds))
    : [];

  // Get current versions
  const versionsResult = result
    .filter((p) => p.currentVersionId)
    .map((p) => p.currentVersionId!)
    .length > 0
    ? await db
        .select({
          id: promptVersions.id,
          versionNumber: promptVersions.versionNumber,
          publishedAt: promptVersions.publishedAt,
        })
        .from(promptVersions)
        .where(
          inArray(
            promptVersions.id,
            result.filter((p) => p.currentVersionId).map((p) => p.currentVersionId!)
          )
        )
    : [];

  // Combine results
  const promptsWithDetails = result.map((prompt) => ({
    ...prompt,
    tags: promptTagsResult
      .filter((pt) => pt.promptId === prompt.id)
      .map((pt) => ({
        id: pt.tagId,
        name: pt.tagName,
        color: pt.tagColor,
      })),
    currentVersion: versionsResult.find((v) => v.id === prompt.currentVersionId) || null,
  }));

  return {
    data: promptsWithDetails,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get single prompt by ID
export async function getPromptById(promptId: string, userId: string) {
  const result = await db
    .select()
    .from(prompts)
    .where(and(eq(prompts.id, promptId), eq(prompts.userId, userId)))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const prompt = result[0];

  // Get current version
  let currentVersion = null;
  if (prompt.currentVersionId) {
    const versionResult = await db
      .select()
      .from(promptVersions)
      .where(eq(promptVersions.id, prompt.currentVersionId))
      .limit(1);
    currentVersion = versionResult[0] || null;
  }

  // Get tags
  const tagsResult = await db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
      createdAt: tags.createdAt,
    })
    .from(promptTags)
    .innerJoin(tags, eq(promptTags.tagId, tags.id))
    .where(eq(promptTags.promptId, promptId));

  return {
    ...prompt,
    currentVersion,
    tags: tagsResult.map((t) => ({ ...t, userId })),
  };
}

// Create prompt
export async function createPrompt(input: CreatePromptInput) {
  const { userId, title, content, tagIds, publish, description } = input;

  // Create prompt
  const [newPrompt] = await db
    .insert(prompts)
    .values({
      userId,
      title,
      draftContent: publish ? null : content,
      status: publish ? 'published' : 'draft',
    })
    .returning();

  // If publishing, create version
  if (publish) {
    const [version] = await db
      .insert(promptVersions)
      .values({
        promptId: newPrompt.id,
        versionNumber: 1,
        content,
        description,
        isPublished: true,
        publishedAt: new Date(),
      })
      .returning();

    // Update prompt with current version
    await db
      .update(prompts)
      .set({ currentVersionId: version.id })
      .where(eq(prompts.id, newPrompt.id));
  }

  // Add tags
  if (tagIds && tagIds.length > 0) {
    await db.insert(promptTags).values(
      tagIds.map((tagId) => ({
        promptId: newPrompt.id,
        tagId,
      }))
    );
  }

  return newPrompt;
}

// Update prompt (save draft)
export async function updatePrompt(
  promptId: string,
  userId: string,
  input: UpdatePromptInput
) {
  const { title, content, tagIds } = input;

  // Update prompt
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  
  if (title !== undefined) {
    updateData.title = title;
  }
  
  if (content !== undefined) {
    updateData.draftContent = content;
    // If already published, mark as having updates
    const [existing] = await db
      .select({ status: prompts.status })
      .from(prompts)
      .where(eq(prompts.id, promptId));
    
    if (existing?.status === 'published') {
      updateData.status = 'published_with_updates';
    }
  }

  const [updated] = await db
    .update(prompts)
    .set(updateData)
    .where(and(eq(prompts.id, promptId), eq(prompts.userId, userId)))
    .returning();

  // Update tags if provided
  if (tagIds !== undefined) {
    await db.delete(promptTags).where(eq(promptTags.promptId, promptId));
    if (tagIds.length > 0) {
      await db.insert(promptTags).values(
        tagIds.map((tagId) => ({
          promptId,
          tagId,
        }))
      );
    }
  }

  return updated;
}

// Delete prompt
export async function deletePrompt(promptId: string, userId: string) {
  await db
    .delete(prompts)
    .where(and(eq(prompts.id, promptId), eq(prompts.userId, userId)));
}

// Publish new version
export async function publishVersion(
  promptId: string,
  userId: string,
  description?: string
) {
  // Get current prompt
  const [prompt] = await db
    .select()
    .from(prompts)
    .where(and(eq(prompts.id, promptId), eq(prompts.userId, userId)));

  if (!prompt) {
    throw new Error('Prompt not found');
  }

  // Get next version number
  const [lastVersion] = await db
    .select({ versionNumber: promptVersions.versionNumber })
    .from(promptVersions)
    .where(eq(promptVersions.promptId, promptId))
    .orderBy(desc(promptVersions.versionNumber))
    .limit(1);

  const newVersionNumber = (lastVersion?.versionNumber || 0) + 1;

  // Get content to publish
  const content = prompt.draftContent || 
    (prompt.currentVersionId 
      ? (await db.select().from(promptVersions).where(eq(promptVersions.id, prompt.currentVersionId)))[0]?.content 
      : '');

  // Create new version
  const [newVersion] = await db
    .insert(promptVersions)
    .values({
      promptId,
      versionNumber: newVersionNumber,
      content: content || '',
      description,
      isPublished: true,
      publishedAt: new Date(),
    })
    .returning();

  // Update prompt
  await db
    .update(prompts)
    .set({
      currentVersionId: newVersion.id,
      draftContent: null,
      status: 'published',
      updatedAt: new Date(),
    })
    .where(eq(prompts.id, promptId));

  return newVersion;
}

// Get versions for a prompt
export async function getVersions(promptId: string) {
  return db
    .select()
    .from(promptVersions)
    .where(eq(promptVersions.promptId, promptId))
    .orderBy(desc(promptVersions.versionNumber));
}

// Get single version
export async function getVersion(versionId: string) {
  const [version] = await db
    .select()
    .from(promptVersions)
    .where(eq(promptVersions.id, versionId));
  return version || null;
}
