import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { createPromptSchema } from '@/lib/validations/prompt';
import { getPrompts, createPrompt } from '@/lib/db/queries/prompts';
import { getUser } from '@/lib/auth/actions';
import type { PromptStatus } from '@/types';

// GET /api/prompts - List prompts
export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return createErrorResponse('AUTH_ERROR', '请先登录', 401);
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') as PromptStatus | null;
  const search = searchParams.get('search') || undefined;

  try {
    const result = await getPrompts({
      userId: user.id,
      status: status || undefined,
      search,
      page,
      limit,
    });

    return createSuccessResponse(result.data, result.pagination);
  } catch (error) {
    console.error('Failed to get prompts:', error);
    return createErrorResponse('SERVER_ERROR', '获取提示词列表失败', 500);
  }
}

// POST /api/prompts - Create prompt
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return createErrorResponse('AUTH_ERROR', '请先登录', 401);
  }

  try {
    const body = await request.json();
    const validatedData = createPromptSchema.parse(body);

    const newPrompt = await createPrompt({
      userId: user.id,
      title: validatedData.title,
      content: validatedData.content,
      tagIds: validatedData.tagIds,
      publish: validatedData.publish,
    });

    return createSuccessResponse(newPrompt);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('VALIDATION_ERROR', '请求参数验证失败', 400);
    }
    console.error('Failed to create prompt:', error);
    return createErrorResponse('SERVER_ERROR', '创建提示词失败', 500);
  }
}
