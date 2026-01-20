import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { updateTagSchema } from '@/lib/validations/tag';
import { updateTag, deleteTag } from '@/lib/db/queries/tags';
import { getUser } from '@/lib/auth/actions';

// PATCH /api/tags/[id] - Update tag
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
    const validatedData = updateTagSchema.parse(body);

    const updated = await updateTag(id, user.id, validatedData);
    
    if (!updated) {
      return createErrorResponse('NOT_FOUND', '标签不存在', 404);
    }

    return createSuccessResponse(updated);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('VALIDATION_ERROR', '请求参数验证失败', 400);
    }
    console.error('Failed to update tag:', error);
    return createErrorResponse('SERVER_ERROR', '更新标签失败', 500);
  }
}

// DELETE /api/tags/[id] - Delete tag
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return createErrorResponse('AUTH_ERROR', '请先登录', 401);
  }

  const { id } = await params;

  try {
    await deleteTag(id, user.id);
    return createSuccessResponse({ message: '标签已删除' });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return createErrorResponse('SERVER_ERROR', '删除标签失败', 500);
  }
}
