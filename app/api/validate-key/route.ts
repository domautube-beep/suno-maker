import { NextRequest, NextResponse } from "next/server";

// API 키 유효성 검증 — 최소 비용 요청으로 확인
export async function POST(req: NextRequest) {
  const { apiKey, provider } = await req.json();

  if (!apiKey || !provider) {
    return NextResponse.json({ valid: false, error: "API 키와 provider가 필요합니다." });
  }

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
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      if (res.ok) return NextResponse.json({ valid: true });
      const err = await res.json();
      const msg = err.error?.message || "";
      if (msg.includes("key")) return NextResponse.json({ valid: false, error: "API 키가 유효하지 않습니다. console.anthropic.com에서 확인해주세요." });
      if (msg.includes("credit") || msg.includes("billing")) return NextResponse.json({ valid: false, error: "API 크레딧이 없습니다. 결제 정보를 확인해주세요." });
      return NextResponse.json({ valid: false, error: msg || "Claude API 검증 실패" });

    } else if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { "Authorization": `Bearer ${apiKey}` },
      });
      if (res.ok) return NextResponse.json({ valid: true });
      const err = await res.json();
      const msg = err.error?.message || "";
      if (msg.includes("Incorrect") || msg.includes("invalid")) return NextResponse.json({ valid: false, error: "API 키가 유효하지 않습니다. platform.openai.com에서 확인해주세요." });
      return NextResponse.json({ valid: false, error: msg || "OpenAI API 검증 실패" });

    } else if (provider === "gemini") {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (res.ok) return NextResponse.json({ valid: true });
      const err = await res.json();
      const msg = err.error?.message || "";
      if (msg.includes("API key")) return NextResponse.json({ valid: false, error: "API 키가 유효하지 않습니다. aistudio.google.com에서 확인해주세요." });
      return NextResponse.json({ valid: false, error: msg || "Gemini API 검증 실패" });
    }

    return NextResponse.json({ valid: false, error: "지원하지 않는 provider" });
  } catch {
    return NextResponse.json({ valid: false, error: "네트워크 오류. 인터넷 연결을 확인해주세요." });
  }
}
