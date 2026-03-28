import { NextRequest } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { prompt, apiKey, provider } = await req.json();

  if (!apiKey || !prompt || !provider) {
    return new Response(JSON.stringify({ error: "필수값 누락" }), { status: 400 });
  }

  try {
    if (provider === "claude") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4096, stream: true, messages: [{ role: "user", content: prompt }] }),
      });
      if (!res.ok) { const e = await res.json(); return new Response(JSON.stringify({ error: e.error?.message || "Claude 실패" }), { status: res.status }); }
      return new Response(transformClaudeSSE(res.body!), { headers: sseHeaders() });

    } else if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "gpt-4o", max_tokens: 4096, stream: true, messages: [{ role: "user", content: prompt }] }),
      });
      if (!res.ok) { const e = await res.json(); return new Response(JSON.stringify({ error: e.error?.message || "OpenAI 실패" }), { status: res.status }); }
      return new Response(transformOpenAISSE(res.body!), { headers: sseHeaders() });

    } else if (provider === "gemini") {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 4096 } }),
      });
      if (!res.ok) {
        const e = await res.json();
        const m = e.error?.message || "";
        if (m.includes("quota") || m.includes("exceeded")) return new Response(JSON.stringify({ error: "Gemini 사용량 초과" }), { status: 429 });
        return new Response(JSON.stringify({ error: m || "Gemini 실패" }), { status: res.status });
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return new Response(fakeStream(text), { headers: sseHeaders() });
    }

    return new Response(JSON.stringify({ error: "지원하지 않는 provider" }), { status: 400 });
  } catch {
    return new Response(JSON.stringify({ error: "API 호출 오류" }), { status: 500 });
  }
}

function sseHeaders() {
  return { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" };
}

function transformClaudeSSE(body: ReadableStream): ReadableStream {
  const reader = body.getReader();
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  return new ReadableStream({
    async pull(c) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { c.enqueue(enc.encode("data: [DONE]\n\n")); c.close(); return; }
        for (const line of dec.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6);
          if (d === "[DONE]") { c.enqueue(enc.encode("data: [DONE]\n\n")); c.close(); return; }
          try { const p = JSON.parse(d); if (p.type === "content_block_delta" && p.delta?.text) c.enqueue(enc.encode(`data: ${JSON.stringify({ text: p.delta.text })}\n\n`)); } catch {}
        }
      }
    },
  });
}

function transformOpenAISSE(body: ReadableStream): ReadableStream {
  const reader = body.getReader();
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  return new ReadableStream({
    async pull(c) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { c.enqueue(enc.encode("data: [DONE]\n\n")); c.close(); return; }
        for (const line of dec.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") { c.enqueue(enc.encode("data: [DONE]\n\n")); c.close(); return; }
          try { const p = JSON.parse(d); const t = p.choices?.[0]?.delta?.content; if (t) c.enqueue(enc.encode(`data: ${JSON.stringify({ text: t })}\n\n`)); } catch {}
        }
      }
    },
  });
}

function fakeStream(text: string): ReadableStream {
  let i = 0;
  const enc = new TextEncoder();
  return new ReadableStream({
    pull(c) {
      if (i >= text.length) { c.enqueue(enc.encode("data: [DONE]\n\n")); c.close(); return; }
      c.enqueue(enc.encode(`data: ${JSON.stringify({ text: text.slice(i, i + 15) })}\n\n`));
      i += 15;
    },
  });
}
