'use strict';

/**
 * Simple OpenAI chat wrapper for group chat prompts.
 * POST { system, history: [{role, content}], prompt } -> { reply }
 */

async function callOpenAI(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.6 }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }
  const json = await res.json();
  return (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || '';
}

exports.handler = async (event) => {
  try {
    if (event.requestContext && event.requestContext.http && event.requestContext.http.method !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const history = Array.isArray(body.history) ? body.history : [];
    const system = body.system || 'You are a helpful assistant for a group chat.';
    const prompt = body.prompt || '';

    const messages = [
      { role: 'system', content: system },
      ...history,
      { role: 'user', content: prompt },
    ];

    const answer = await callOpenAI(messages);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ reply: answer }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: err && err.message ? err.message : 'Internal error' }),
    };
  }
};


