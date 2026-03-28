import { NextRequest, NextResponse } from "next/server";

// 사용자 API 키로 Claude 호출 → 가사 생성
export async function POST(req: NextRequest) {
  const { prompt, apiKey } = await req.json();

  if (!apiKey || !prompt) {
    return NextResponse.json({ error: "API 키와 프롬프트가 필요합니다." }, { status: 400 });
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
  } catch (err) {
    return NextResponse.json({ error: "API 호출 중 오류 발생" }, { status: 500 });
  }
}
