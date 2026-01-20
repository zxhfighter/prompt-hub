import { db } from '@/lib/db';
import { tags, promptTags } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export interface CreateTagInput {
  userId: string;
  name: string;
  color?: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
}

// Get all tags for a user
export async function getTags(userId: string) {
  return db
    .select()
    .from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(tags.name);
}

// Get tags with prompt counts
export async function getTagsWithCounts(userId: string) {
  return db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
      count: sql<number>`count(${promptTags.promptId})::int`,
    })
    .from(tags)
    .leftJoin(promptTags, eq(tags.id, promptTags.tagId))
    .where(eq(tags.userId, userId))
    .groupBy(tags.id, tags.name, tags.color)
    .orderBy(sql`count(${promptTags.promptId}) desc`);
}

// Get tag by ID
export async function getTagById(tagId: string, userId: string) {
  const [tag] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.userId, userId)));
  return tag || null;
}

// Create tag
export async function createTag(input: CreateTagInput) {
  const [newTag] = await db
    .insert(tags)
    .values({
      userId: input.userId,
      name: input.name,
      color: input.color || '#6366f1',
    })
    .returning();
  return newTag;
}

// Update tag
export async function updateTag(
  tagId: string,
  userId: string,
  input: UpdateTagInput
) {
  const updateData: Record<string, unknown> = {};
  
  if (input.name !== undefined) {
    updateData.name = input.name;
  }
  if (input.color !== undefined) {
    updateData.color = input.color;
  }

  const [updated] = await db
    .update(tags)
    .set(updateData)
    .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
    .returning();
  
  return updated;
}

// Delete tag
export async function deleteTag(tagId: string, userId: string) {
  await db
    .delete(tags)
    .where(and(eq(tags.id, tagId), eq(tags.userId, userId)));
}
