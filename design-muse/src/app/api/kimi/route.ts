import { NextRequest, NextResponse } from 'next/server';

const KIMI_API_BASE = 'https://api.moonshot.cn/v1';

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    const apiKey = process.env.KIMI_API_KEY;

    if (!apiKey || apiKey === 'your-api-key-here') {
      return NextResponse.json(
        { error: '请先在 .env.local 中配置 KIMI_API_KEY' },
        { status: 400 }
      );
    }

    if (action === 'image') {
      const { prompt, model = 'moonshot-v1-auto' } = data;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 180000);

      const response = await fetch(`${KIMI_API_BASE}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          prompt,
          size: '1024x1024',
          n: 1
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.text();
        return NextResponse.json(
          { error: `图像生成失败: ${response.status} - ${errorData}` },
          { status: response.status }
        );
      }

      const result = await response.json();
      return NextResponse.json(result);
    }

    const { prompt, systemPrompt, temperature = 0.7, maxTokens = 8000 } = data;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(`${KIMI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'moonshot-v1-32k',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: `API 请求失败: ${response.status} - ${errorData}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : '服务器内部错误';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
