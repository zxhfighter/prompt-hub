import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { publishVersionSchema } from '@/lib/validations/prompt';
import { getVersions, publishVersion, getPromptById } from '@/lib/db/queries/prompts';
import { getUser } from '@/lib/auth/actions';

// GET /api/prompts/[id]/versions - List versions
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
    // Verify ownership
    const prompt = await getPromptById(id, user.id);
    if (!prompt) {
      return createErrorResponse('NOT_FOUND', '提示词不存在', 404);
    }

    const versions = await getVersions(id);
    return createSuccessResponse(versions);
  } catch (error) {
    console.error('Failed to get versions:', error);
    return createErrorResponse('SERVER_ERROR', '获取版本列表失败', 500);
  }
}

// POST /api/prompts/[id]/versions - Publish new version
export async function POST(
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
    const validatedData = publishVersionSchema.parse(body);

    const newVersion = await publishVersion(id, user.id, validatedData.description);

    return createSuccessResponse(newVersion);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('VALIDATION_ERROR', '请求参数验证失败', 400);
    }
    if (error instanceof Error && error.message === 'Prompt not found') {
      return createErrorResponse('NOT_FOUND', '提示词不存在', 404);
    }
    console.error('Failed to publish version:', error);
    return createErrorResponse('SERVER_ERROR', '发布版本失败', 500);
  }
}
