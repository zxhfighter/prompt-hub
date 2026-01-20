import { NextRequest } from 'next/server';
import { getUser } from '@/lib/auth/actions';
import { createOpenAI } from '@ai-sdk/openai';
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
    const { content, suggestions } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: '请提供提示词内容' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if OpenRouter API key is configured
    if (!env.OPENAI_API_KEY && !env.OPENROUTER_API_KEY) {
      // Return mock streaming response if no API key
      const encoder = new TextEncoder();
      const mockContent = `# 优化后的提示词
... (mock content omitted for brevity) ...`;

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

    // Determine API Key and Base URL
    // Prioritize OPENAI_API_KEY, fallback to OPENROUTER_API_KEY
    const apiKey = env.OPENAI_API_KEY || env.OPENROUTER_API_KEY;
    const baseURL = env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1';
    const modelName = env.OPENAI_MODEL || 'google/gemini-2.0-flash-001';

    // Create OpenAI client (compatible with OpenRouter/DeepSeek etc)
    const openai = createOpenAI({
      apiKey,
      baseURL,
    });

    // Build system prompt with optional suggestions context
    let systemPrompt = `你是一个专业的 AI 提示词优化专家。请优化用户提供的提示词，使其更清晰、更有效、更结构化。

优化时请遵循以下原则：
1. 明确角色定位
2. 清晰的任务描述
3. 规范的输入输出格式
4. 添加必要的约束条件
5. 提供示例（如适用）`;

    if (suggestions && Array.isArray(suggestions) && suggestions.length > 0) {
      systemPrompt += `\n\n请重点关注以下改进建议：\n${suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
    }

    systemPrompt += `\n\n请直接输出优化后的提示词，使用 Markdown 格式，不需要解释优化原因。`;

    // Use Vercel AI SDK for streaming
    const result = streamText({
      model: openai(modelName),
      system: systemPrompt,
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
