import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { createPromptSchema } from '@/lib/validations/prompt';
import type { PromptListItem, Tag, PromptStatus } from '@/types';

// Mock data - will be replaced with database queries
const mockPrompts: PromptListItem[] = [
  {
    id: '1',
    title: '文章写作助手 - 长文内容生成',
    status: 'published' as PromptStatus,
    tags: [
      { id: 't1', userId: 'u1', name: '写作', color: '#6366f1', createdAt: new Date() },
    ] as Tag[],
    currentVersion: { versionNumber: 3, publishedAt: new Date() },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
  },
];

// GET /api/prompts - List prompts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') as PromptStatus | null;
  const search = searchParams.get('search');

  // TODO: Replace with actual database query
  let filteredPrompts = [...mockPrompts];
  
  if (status) {
    filteredPrompts = filteredPrompts.filter(p => p.status === status);
  }
  
  if (search) {
    filteredPrompts = filteredPrompts.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = filteredPrompts.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedPrompts = filteredPrompts.slice(startIndex, startIndex + limit);

  return createSuccessResponse(paginatedPrompts, {
    page,
    limit,
    total,
    totalPages,
  });
}

// POST /api/prompts - Create prompt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPromptSchema.parse(body);

    // TODO: Get user from session
    const userId = 'mock-user-id';

    // TODO: Create prompt in database
    const newPrompt = {
      id: crypto.randomUUID(),
      userId,
      title: validatedData.title,
      status: validatedData.publish ? 'published' : 'draft',
      draftContent: validatedData.publish ? null : validatedData.content,
      currentVersion: validatedData.publish
        ? {
            id: crypto.randomUUID(),
            versionNumber: 1,
            content: validatedData.content,
            publishedAt: new Date(),
          }
        : null,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return createSuccessResponse(newPrompt);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('VALIDATION_ERROR', '请求参数验证失败', 400);
    }
    return createErrorResponse('SERVER_ERROR', '创建提示词失败', 500);
  }
}
