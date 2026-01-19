import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { createTagSchema, updateTagSchema } from '@/lib/validations/tag';
import type { Tag } from '@/types';

// Mock tags
const mockTags: Tag[] = [
  { id: 't1', userId: 'u1', name: '写作', color: '#6366f1', createdAt: new Date() },
  { id: 't2', userId: 'u1', name: 'GPT-4', color: '#10b981', createdAt: new Date() },
  { id: 't3', userId: 'u1', name: '开发', color: '#f59e0b', createdAt: new Date() },
];

// GET /api/tags - List user's tags
export async function GET() {
  // TODO: Get user from session and fetch their tags
  return createSuccessResponse(mockTags);
}

// POST /api/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTagSchema.parse(body);

    // TODO: Create tag in database
    const newTag: Tag = {
      id: crypto.randomUUID(),
      userId: 'mock-user-id',
      name: validatedData.name,
      color: validatedData.color || '#6366f1',
      createdAt: new Date(),
    };

    return createSuccessResponse(newTag);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('VALIDATION_ERROR', '请求参数验证失败', 400);
    }
    return createErrorResponse('SERVER_ERROR', '创建标签失败', 500);
  }
}
