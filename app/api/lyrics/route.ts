import { NextRequest, NextResponse } from "next/server";

// 3개 provider 대응 가사 생성 API
export async function POST(req: NextRequest) {
  const { prompt, apiKey, provider } = await req.json();

  if (!apiKey || !prompt || !provider) {
    return NextResponse.json({ error: "API 키, 프롬프트, provider가 필요합니다." }, { status: 400 });
  }

  try {
    let lyrics = "";

    if (provider === "claude") {
      // Anthropic Claude API
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return NextResponse.json({ error: err.error?.message || "Claude API 호출 실패" }, { status: res.status });
      }
      const data = await res.json();
      lyrics = data.content?.[0]?.text || "";

    } else if (provider === "openai") {
      // OpenAI GPT API
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 4096,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return NextResponse.json({ error: err.error?.message || "OpenAI API 호출 실패" }, { status: res.status });
      }
      const data = await res.json();
      lyrics = data.choices?.[0]?.message?.content || "";

    } else if (provider === "gemini") {
      // Google Gemini API
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 4096 },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        const msg3 = err.error?.message || "";
        if (msg3.includes("quota") || msg3.includes("rate") || msg3.includes("exceeded")) return NextResponse.json({ error: "Gemini 무료 사용량 초과. 1분 후 다시 시도하거나, Claude/GPT 키를 사용해주세요." }, { status: res.status });
        return NextResponse.json({ error: msg3 || "Gemini API 실패" }, { status: res.status });
      }
      const data = await res.json();
      lyrics = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    } else {
      return NextResponse.json({ error: `지원하지 않는 provider: ${provider}` }, { status: 400 });
    }

    return NextResponse.json({ lyrics });
  } catch {
    return NextResponse.json({ error: "API 호출 중 오류 발생" }, { status: 500 });
  }
}
