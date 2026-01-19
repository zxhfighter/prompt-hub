import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import type { DiagnoseResult } from '@/types';

// POST /api/ai/diagnose - Diagnose prompt quality
export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return createErrorResponse('VALIDATION_ERROR', '请提供提示词内容', 400);
    }

    // TODO: Call OpenAI API to analyze prompt
    // For now, return mock result
    const result: DiagnoseResult = {
      overallScore: 8.5,
      scores: {
        clarity: { score: 9, feedback: '表达清晰明确，目标定义良好' },
        completeness: { score: 8, feedback: '包含了主要信息，可以添加更多示例' },
        effectiveness: { score: 8, feedback: '结构合理，能够有效引导 AI 输出' },
        structure: { score: 9, feedback: '格式规范，易于理解和维护' },
      },
      suggestions: [
        '建议添加输出格式的具体示例',
        '可以增加错误处理的说明',
        '考虑添加 few-shot 示例提升效果',
      ],
    };

    return createSuccessResponse(result);
  } catch {
    return createErrorResponse('SERVER_ERROR', '诊断失败', 500);
  }
}
