import { NextRequest } from 'next/server';
import { getUser } from '@/lib/auth/actions';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import { env } from '@/lib/env';

// POST /api/ai/optimize - Optimize prompt (streaming)
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return new Response(
      JSON.stringify({ error: { code: 'AUTH_ERROR', message: '请先登录' } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: '请提供提示词内容' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if OpenRouter API key is configured
    if (!env.OPENROUTER_API_KEY) {
      // Return mock streaming response if no API key
      const encoder = new TextEncoder();
      const mockContent = `# 优化后的提示词

## 角色定位
你是一个专业的助手，专注于${content.slice(0, 30)}...相关任务。

## 核心任务
根据用户需求，提供高质量、结构化的输出。

## 输入规范
- 用户会提供具体的问题或需求
- 请仔细理解上下文和意图

## 输出要求
1. 使用清晰的结构和格式
2. 提供具体可操作的内容
3. 确保回答完整准确

## 示例
输入：[用户示例输入]
输出：[期望的输出格式]`;

      const stream = new ReadableStream({
        async start(controller) {
          const chunks = mockContent.split('\n');
          for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, 30));
            controller.enqueue(encoder.encode(chunk + '\n'));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Create OpenRouter client
    const openrouter = createOpenRouter({
      apiKey: env.OPENROUTER_API_KEY,
    });

    // Use Vercel AI SDK for streaming with OpenRouter
    const result = streamText({
      model: openrouter('google/gemini-2.0-flash-001'),
      system: `你是一个专业的 AI 提示词优化专家。请优化用户提供的提示词，使其更清晰、更有效、更结构化。

优化时请遵循以下原则：
1. 明确角色定位
2. 清晰的任务描述
3. 规范的输入输出格式
4. 添加必要的约束条件
5. 提供示例（如适用）

请直接输出优化后的提示词，使用 Markdown 格式，不需要解释优化原因。`,
      prompt: `请优化以下提示词：

${content}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Optimize error:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: '优化失败' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
