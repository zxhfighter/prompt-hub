import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { createTagSchema } from '@/lib/validations/tag';
import { getTags, createTag } from '@/lib/db/queries/tags';
import { getUser } from '@/lib/auth/actions';

// GET /api/tags - List user's tags
export async function GET() {
  const user = await getUser();
  if (!user) {
    return createErrorResponse('AUTH_ERROR', '请先登录', 401);
  }

  try {
    const tagsList = await getTags(user.id);
    return createSuccessResponse(tagsList);
  } catch (error) {
    console.error('Failed to get tags:', error);
    return createErrorResponse('SERVER_ERROR', '获取标签列表失败', 500);
  }
}

// POST /api/tags - Create new tag
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return createErrorResponse('AUTH_ERROR', '请先登录', 401);
  }

  try {
    const body = await request.json();
    const validatedData = createTagSchema.parse(body);

    const newTag = await createTag({
      userId: user.id,
      name: validatedData.name,
      color: validatedData.color,
    });

    return createSuccessResponse(newTag);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('VALIDATION_ERROR', '请求参数验证失败', 400);
    }
    console.error('Failed to create tag:', error);
    return createErrorResponse('SERVER_ERROR', '创建标签失败', 500);
  }
}
