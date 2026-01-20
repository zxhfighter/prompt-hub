import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { getTags } from '@/lib/db/queries/tags';
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
