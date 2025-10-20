import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { history = [], prompt = '', system = 'You are a helpful assistant for a group chat.' } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), { status: 500 });
    }

    const messages = [
      { role: 'system', content: system },
      ...history,
      { role: 'user', content: prompt },
    ];

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, stream: true, temperature: 0.6 }),
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      return new Response(JSON.stringify({ error: `OpenAI error ${upstream.status}: ${text}` }), { status: 500 });
    }

    // Pass-through SSE stream
    return new Response(upstream.body as any, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'Internal error' }), { status: 500 });
  }
}


