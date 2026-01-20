import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { getUser } from '@/lib/auth/actions';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { env } from '@/lib/env';
import type { DiagnoseResult } from '@/types';

const diagnoseSchema = z.object({
  overallScore: z.number().min(0).max(10),
  scores: z.object({
    clarity: z.object({
      score: z.number().min(0).max(10),
      feedback: z.string(),
    }),
    completeness: z.object({
      score: z.number().min(0).max(10),
      feedback: z.string(),
    }),
    effectiveness: z.object({
      score: z.number().min(0).max(10),
      feedback: z.string(),
    }),
    structure: z.object({
      score: z.number().min(0).max(10),
      feedback: z.string(),
    }),
  }),
  suggestions: z.array(z.string()),
});

// POST /api/ai/diagnose - Diagnose prompt quality
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return createErrorResponse('AUTH_ERROR', '请先登录', 401);
  }

  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return createErrorResponse('VALIDATION_ERROR', '请提供提示词内容', 400);
    }

    // Determine API Key and Base URL
    // Prioritize OPENAI_API_KEY, fallback to OPENROUTER_API_KEY
    const apiKey = env.OPENAI_API_KEY || env.OPENROUTER_API_KEY;
    const baseURL = env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1';
    const modelName = env.OPENAI_MODEL || 'google/gemini-2.0-flash-001';

    if (!apiKey) {
      // Return mock result if no API key
      const mockResult: DiagnoseResult = {
        overallScore: 7.5,
        scores: {
          clarity: { score: 8, feedback: '表达较为清晰，建议添加更具体的任务描述' },
          completeness: { score: 7, feedback: '基本信息完整，可以添加输入输出示例' },
          effectiveness: { score: 8, feedback: '结构合理，能够引导 AI 输出' },
          structure: { score: 7, feedback: '格式可以更规范，建议使用标准模板' },
        },
        suggestions: [
          '建议添加具体的输出格式示例',
          '可以增加角色定位说明',
          '考虑添加 few-shot 示例提升效果',
        ],
      };
      return createSuccessResponse(mockResult);
    }

    // Create OpenAI client (compatible with OpenRouter/DeepSeek etc)
    const openai = createOpenAI({
      apiKey,
      baseURL,
    });

    // Call API to analyze prompt
    const { object } = await generateObject({
      model: openai(modelName),
      schema: diagnoseSchema,
      prompt: `你是一个专业的 AI 提示词分析专家。请分析以下提示词的质量，从清晰度、完整性、有效性、结构四个维度评分（0-10分），并给出改进建议。

提示词内容：
${content}

请用中文回答，评分要客观公正，建议要具体可操作。`,
    });

    return createSuccessResponse(object as DiagnoseResult);
  } catch (error) {
    console.error('Diagnose error:', error);
    return createErrorResponse('SERVER_ERROR', '诊断失败，请稍后重试', 500);
  }
}
