import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { publishVersionSchema } from '@/lib/validations/prompt';

// Mock versions
const mockVersions = [
  {
    id: 'v3',
    versionNumber: 3,
    description: '优化了输出格式',
    changelog: null,
    isPublished: true,
    publishedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'v2',
    versionNumber: 2,
    description: '添加了变量支持',
    changelog: null,
    isPublished: true,
    publishedAt: new Date('2024-01-12'),
    createdAt: new Date('2024-01-12'),
  },
  {
    id: 'v1',
    versionNumber: 1,
    description: '初始版本',
    changelog: null,
    isPublished: true,
    publishedAt: new Date('2024-01-10'),
    createdAt: new Date('2024-01-10'),
  },
];

// GET /api/prompts/[id]/versions - List versions
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('Fetching versions for prompt:', id);
  
  return createSuccessResponse(mockVersions);
}

// POST /api/prompts/[id]/versions - Publish new version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const validatedData = publishVersionSchema.parse(body);

    // TODO: Get current draft content and create new version
    const newVersion = {
      id: crypto.randomUUID(),
      promptId: id,
      versionNumber: mockVersions.length + 1,
      content: '# New version content',
      description: validatedData.description || null,
      changelog: null, // TODO: Generate with AI
      isPublished: true,
      publishedAt: new Date(),
      createdAt: new Date(),
    };

    return createSuccessResponse(newVersion);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('VALIDATION_ERROR', '请求参数验证失败', 400);
    }
    return createErrorResponse('SERVER_ERROR', '发布版本失败', 500);
  }
}
