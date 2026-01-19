import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { updateTagSchema } from '@/lib/validations/tag';

// PATCH /api/tags/[id] - Update tag
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const validatedData = updateTagSchema.parse(body);

    // TODO: Update tag in database
    const updatedTag = {
      id,
      userId: 'mock-user-id',
      name: validatedData.name || 'Updated Tag',
      color: validatedData.color || '#6366f1',
      createdAt: new Date(),
    };

    return createSuccessResponse(updatedTag);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('VALIDATION_ERROR', '请求参数验证失败', 400);
    }
    return createErrorResponse('SERVER_ERROR', '更新标签失败', 500);
  }
}

// DELETE /api/tags/[id] - Delete tag
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // TODO: Delete tag from database
  console.log('Deleting tag:', id);

  return createSuccessResponse({ message: '标签已删除' });
}
