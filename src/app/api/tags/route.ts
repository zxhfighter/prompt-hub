import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { getTags, createTag } from '@/lib/db/queries/tags';
import { getUser } from '@/lib/auth/actions';

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return createErrorResponse('AUTH_ERROR', '请先登录', 401);
  }

  try {
    const tags = await getTags(user.id);
    return createSuccessResponse(tags);
  } catch (error) {
    console.error('Failed to get tags:', error);
    return createErrorResponse('SERVER_ERROR', '获取标签列表失败', 500);
  }
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return createErrorResponse('AUTH_ERROR', '请先登录', 401);
  }

  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return createErrorResponse('VALIDATION_ERROR', '请输入标签名', 400);
    }

    const tag = await createTag({
      userId: user.id,
      name: name.trim(),
      color: color || '#6366f1',
    });

    return Response.json({ data: tag }, { status: 201 });
  } catch (error) {
    console.error('Failed to create tag:', error);
    return createErrorResponse('SERVER_ERROR', '创建标签失败', 500);
  }
}
