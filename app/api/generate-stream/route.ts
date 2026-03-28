import { NextRequest } from "next/server";

export const maxDuration = 60;

// 스트리밍 Style 생성
export async function POST(req: NextRequest) {
  const { inputs, apiKey, provider } = await req.json();

  if (!apiKey || !provider || !inputs) {
    return new Response(JSON.stringify({ error: "API 키, provider, inputs 필요" }), { status: 400 });
  }

  const prompt = buildStylePrompt(inputs);

  try {
    if (provider === "claude") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          stream: true,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return new Response(JSON.stringify({ error: err.error?.message || "Claude API 실패" }), { status: res.status });
      }
      // Claude SSE → 텍스트 스트림 변환
      return new Response(transformClaudeStream(res.body!), {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
      });

    } else if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 2048,
          stream: true,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return new Response(JSON.stringify({ error: err.error?.message || "OpenAI API 실패" }), { status: res.status });
      }
      return new Response(transformOpenAIStream(res.body!), {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
      });

    } else if (provider === "gemini") {
      // Gemini는 스트리밍 미지원 → 일반 응답을 청크로 보냄
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2048 },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        const msg = err.error?.message || "";
        if (msg.includes("quota") || msg.includes("exceeded")) {
          return new Response(JSON.stringify({ error: "Gemini 무료 사용량 초과. 1분 후 다시 시도하세요." }), { status: 429 });
        }
        return new Response(JSON.stringify({ error: msg || "Gemini API 실패" }), { status: res.status });
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      // 가짜 스트리밍: 청크로 나눠서 전송
      return new Response(simulateStream(text), {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
      });
    }

    return new Response(JSON.stringify({ error: "지원하지 않는 provider" }), { status: 400 });
  } catch {
    return new Response(JSON.stringify({ error: "API 호출 중 오류" }), { status: 500 });
  }
}

// Claude SSE → 텍스트 스트림
function transformClaudeStream(body: ReadableStream): ReadableStream {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n")); controller.close(); return; }
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") { controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n")); controller.close(); return; }
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`));
              }
            } catch { /* 무시 */ }
          }
        }
      }
    },
  });
}

// OpenAI SSE → 텍스트 스트림
function transformOpenAIStream(body: ReadableStream): ReadableStream {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n")); controller.close(); return; }
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") { controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n")); controller.close(); return; }
            try {
              const parsed = JSON.parse(data);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch { /* 무시 */ }
          }
        }
      }
    },
  });
}

// Gemini 가짜 스트리밍: 10자씩 나눠서 전송
function simulateStream(text: string): ReadableStream {
  let offset = 0;
  const encoder = new TextEncoder();
  return new ReadableStream({
    pull(controller) {
      if (offset >= text.length) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }
      const chunk = text.slice(offset, offset + 10);
      offset += 10;
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
    },
  });
}

// 프롬프트 빌더 (generate/route.ts와 동일)
function buildStylePrompt(inputs: Record<string, string>): string {
  const tempoLabels: Record<string, string> = {
    very_slow: "Very Slow (50~65 BPM)", slow: "Slow (66~80 BPM)",
    mid_slow: "Mid Slow (81~95 BPM)", mid: "Mid (96~110 BPM)",
    mid_fast: "Mid Fast (111~125 BPM)", fast: "Fast (126~140 BPM)",
    very_fast: "Very Fast (141~170 BPM)", ultra: "Ultra (171+ BPM)",
  };
  const parts = [`Suno v5.5의 "Style of Music" 필드에 들어갈 프롬프트를 생성해줘.`, ``, `=== 사용자 설정 ===`];
  if (inputs.oneLiner) parts.push(`핵심 문장: "${inputs.oneLiner}"`);
  if (inputs.genre) parts.push(`장르: ${inputs.genre}`);
  if (inputs.vibe) parts.push(`느낌: ${inputs.vibe}`);
  if (inputs.tempo) parts.push(`템포: ${tempoLabels[inputs.tempo] || inputs.tempo}`);
  if (inputs.timeSignature) parts.push(`박자: ${inputs.timeSignature}`);
  if (inputs.era) parts.push(`시대감: ${inputs.era}`);
  if (inputs.texture) parts.push(`질감: ${inputs.texture}`);
  if (inputs.reverb) parts.push(`리버브: ${inputs.reverb}`);
  if (inputs.instruments) parts.push(`악기: ${inputs.instruments}`);

  parts.push(``, `=== 작성 순서 (Suno 파싱 우선순위) ===`);
  parts.push(`반드시 이 순서대로 한 문단으로 작성:`);
  parts.push(`1) 장르명 + BPM + 박자`);
  parts.push(`2) 리듬/드럼 패턴`);
  parts.push(`3) 베이스`);
  parts.push(`4) 핵심 악기`);
  parts.push(`5) 텍스처/공간감`);
  parts.push(`6) 섹션별 다이내믹스`);
  parts.push(`7) Emotional arc (마지막 한 문장)`);
  parts.push(``);
  parts.push(`=== 엄격 규칙 ===`);
  parts.push(`- 600~900자 영문. 900자 절대 초과 금지.`);
  parts.push(`- 한 문단으로 (줄바꿈 없이)`);
  parts.push(`- 보컬 단어 절대 금지`);
  parts.push(`- Hz, ms, dB, % 수치 금지`);
  parts.push(`- 아티스트명, "type beat" 금지`);
  parts.push(``);
  parts.push(`=== 출력 ===`);
  parts.push(`---STYLE---`);
  parts.push(`(Style of Music 영문)`);
  parts.push(`---NOTES---`);
  parts.push(`(프로듀서 분석 노트 한국어)`);

  return parts.join("\n");
}
