import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { updatePromptSchema, deletePromptSchema } from '@/lib/validations/prompt';

// Mock data
const mockPrompt = {
  id: '1',
  userId: 'u1',
  title: '文章写作助手',
  currentVersionId: 'v1',
  draftContent: null,
  status: 'published',
  tags: [],
  currentVersion: {
    id: 'v1',
    versionNumber: 1,
    content: '# 文章写作助手\n\n你是一个专业的写作助手...',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// GET /api/prompts/[id] - Get prompt by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // TODO: Fetch from database with user validation
  if (id !== '1') {
    return createErrorResponse('NOT_FOUND', '提示词不存在', 404);
  }

  return createSuccessResponse(mockPrompt);
}

// PATCH /api/prompts/[id] - Update prompt (save draft)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const validatedData = updatePromptSchema.parse(body);

    // TODO: Update prompt in database
    const updatedPrompt = {
      ...mockPrompt,
      id,
      ...validatedData,
      status: 'published_with_updates',
      updatedAt: new Date(),
    };

    return createSuccessResponse(updatedPrompt);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('VALIDATION_ERROR', '请求参数验证失败', 400);
    }
    return createErrorResponse('SERVER_ERROR', '更新提示词失败', 500);
  }
}

// DELETE /api/prompts/[id] - Delete prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    deletePromptSchema.parse(body);

    // TODO: Delete prompt from database
    console.log('Deleting prompt:', id);

    return createSuccessResponse({ message: '提示词已删除' });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('VALIDATION_ERROR', '请输入 DELETE 确认删除', 400);
    }
    return createErrorResponse('SERVER_ERROR', '删除提示词失败', 500);
  }
}
