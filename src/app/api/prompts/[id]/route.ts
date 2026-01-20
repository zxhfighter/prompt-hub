import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { updatePromptSchema, deletePromptSchema } from '@/lib/validations/prompt';
import { getPromptById, updatePrompt, deletePrompt } from '@/lib/db/queries/prompts';
import { getUser } from '@/lib/auth/actions';

// GET /api/prompts/[id] - Get prompt by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return createErrorResponse('AUTH_ERROR', '请先登录', 401);
  }

  const { id } = await params;

  try {
    const prompt = await getPromptById(id, user.id);
    
    if (!prompt) {
      return createErrorResponse('NOT_FOUND', '提示词不存在', 404);
    }

    return createSuccessResponse(prompt);
  } catch (error) {
    console.error('Failed to get prompt:', error);
    return createErrorResponse('SERVER_ERROR', '获取提示词失败', 500);
  }
}

// PATCH /api/prompts/[id] - Update prompt (save draft)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return createErrorResponse('AUTH_ERROR', '请先登录', 401);
  }

  const { id } = await params;
  
  try {
    const body = await request.json();
    const validatedData = updatePromptSchema.parse(body);

    const updated = await updatePrompt(id, user.id, validatedData);
    
    if (!updated) {
      return createErrorResponse('NOT_FOUND', '提示词不存在', 404);
    }

    return createSuccessResponse(updated);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('VALIDATION_ERROR', '请求参数验证失败', 400);
    }
    console.error('Failed to update prompt:', error);
    return createErrorResponse('SERVER_ERROR', '更新提示词失败', 500);
  }
}

// DELETE /api/prompts/[id] - Delete prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return createErrorResponse('AUTH_ERROR', '请先登录', 401);
  }

  const { id } = await params;
  
  try {
    const body = await request.json();
    deletePromptSchema.parse(body);

    await deletePrompt(id, user.id);

    return createSuccessResponse({ message: '提示词已删除' });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('VALIDATION_ERROR', '请输入 DELETE 确认删除', 400);
    }
    console.error('Failed to delete prompt:', error);
    return createErrorResponse('SERVER_ERROR', '删除提示词失败', 500);
  }
}
