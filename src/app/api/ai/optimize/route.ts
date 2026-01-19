import { NextRequest } from 'next/server';

// POST /api/ai/optimize - Optimize prompt (streaming)
export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: '请提供提示词内容' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send start event
        controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'));
        
        // TODO: Replace with actual OpenAI streaming call
        // For now, simulate streaming with mock content
        const optimizedContent = `# 优化后的提示词

## 角色定位
你是一个专业的助手，擅长${content.slice(0, 20)}...

## 核心任务
请根据用户的需求，提供高质量的输出。

## 输入要求
- 用户会提供具体的问题或任务
- 你需要理解上下文并给出准确回应

## 输出规范
1. 使用清晰的结构
2. 提供具体的示例
3. 确保回答完整`;

        // Simulate streaming chunks
        const chunks = optimizedContent.split('\n');
        for (const chunk of chunks) {
          await new Promise(resolve => setTimeout(resolve, 50));
          controller.enqueue(
            encoder.encode(`data: {"type":"chunk","content":"${chunk.replace(/"/g, '\\"')}\\n"}\n\n`)
          );
        }
        
        // Send done event
        controller.enqueue(
          encoder.encode(`data: {"type":"done","fullContent":"${optimizedContent.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"}\n\n`)
        );
        
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: '优化失败' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
