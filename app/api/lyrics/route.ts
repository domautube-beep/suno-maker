import { NextRequest, NextResponse } from "next/server";

// 서버 사이드 환경변수로 Claude 호출 → 가사 생성
export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다." }, { status: 500 });
  }

  if (!prompt) {
    return NextResponse.json({ error: "프롬프트가 필요합니다." }, { status: 400 });
  }

  try {
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
      return NextResponse.json({ error: err.error?.message || "API 호출 실패" }, { status: res.status });
    }

    const data = await res.json();
    const lyrics = data.content?.[0]?.text || "";

    return NextResponse.json({ lyrics });
  } catch {
    return NextResponse.json({ error: "API 호출 중 오류 발생" }, { status: 500 });
  }
}
