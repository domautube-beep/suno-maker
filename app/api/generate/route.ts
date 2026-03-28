import { NextRequest, NextResponse } from "next/server";

// Vercel 함수 타임아웃 60초로 확장
export const maxDuration = 60;

// Style of Music + 프로듀서 분석 노트 AI 생성
export async function POST(req: NextRequest) {
  const { inputs, apiKey, provider } = await req.json();

  if (!apiKey || !provider || !inputs) {
    return NextResponse.json({ error: "API 키, provider, inputs가 필요합니다." }, { status: 400 });
  }

  const prompt = buildStylePrompt(inputs);

  try {
    let resultText = "";

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
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        const msg = err.error?.message || "";
        if (msg.includes("API key")) return NextResponse.json({ error: "API 키가 유효하지 않습니다. 키를 확인해주세요." }, { status: res.status });
        if (msg.includes("quota") || msg.includes("rate")) return NextResponse.json({ error: "API 사용량 초과. 잠시 후 다시 시도해주세요." }, { status: res.status });
        return NextResponse.json({ error: msg || "Claude API 호출 실패" }, { status: res.status });
      }
      const data = await res.json();
      resultText = data.content?.[0]?.text || "";

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
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        const msg2 = err.error?.message || "";
        if (msg2.includes("API key") || msg2.includes("Incorrect")) return NextResponse.json({ error: "API 키가 유효하지 않습니다. 키를 확인해주세요." }, { status: res.status });
        if (msg2.includes("quota") || msg2.includes("rate")) return NextResponse.json({ error: "API 사용량 초과. 잠시 후 다시 시도해주세요." }, { status: res.status });
        return NextResponse.json({ error: msg2 || "OpenAI API 호출 실패" }, { status: res.status });
      }
      const data = await res.json();
      resultText = data.choices?.[0]?.message?.content || "";

    } else if (provider === "gemini") {
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
        const msg3 = err.error?.message || "";
        if (msg3.includes("quota") || msg3.includes("rate") || msg3.includes("exceeded")) return NextResponse.json({ error: "Gemini 무료 사용량 초과. 1분 후 다시 시도하거나, Claude/GPT 키를 사용해주세요." }, { status: res.status });
        if (msg3.includes("API key")) return NextResponse.json({ error: "API 키가 유효하지 않습니다." }, { status: res.status });
        return NextResponse.json({ error: msg3 || "Gemini API 실패" }, { status: res.status });
      }
      const data = await res.json();
      resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    // 결과 파싱: ---STYLE--- 과 ---NOTES--- 구분자로 분리
    const stylePart = extractSection(resultText, "STYLE");
    const notesPart = extractSection(resultText, "NOTES");

    return NextResponse.json({
      style: stylePart || resultText,
      forensicLog: notesPart || "",
    });
  } catch {
    return NextResponse.json({ error: "API 호출 중 오류 발생" }, { status: 500 });
  }
}

// 결과에서 섹션 추출
function extractSection(text: string, label: string): string {
  const regex = new RegExp(`---${label}---\\n([\\s\\S]*?)(?:---[A-Z]+---|$)`);
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

// Style of Music 생성 프롬프트
function buildStylePrompt(inputs: Record<string, string>): string {
  const parts = [
    `Suno v5.5의 "Style of Music" 필드에 들어갈 프롬프트를 생성해줘.`,
    ``,
    `=== 사용자 설정 ===`,
  ];

  const tempoLabels: Record<string, string> = {
    very_slow: "Very Slow (50~65 BPM)", slow: "Slow (66~80 BPM)",
    mid_slow: "Mid Slow (81~95 BPM)", mid: "Mid (96~110 BPM)",
    mid_fast: "Mid Fast (111~125 BPM)", fast: "Fast (126~140 BPM)",
    very_fast: "Very Fast (141~170 BPM)", ultra: "Ultra (171+ BPM)",
  };
  const eraLabels: Record<string, string> = {
    "80s": "1980s", "90s": "1990s", "2000s": "2000s", "2010s": "2010s",
    "2020s": "2020s", futuristic: "Futuristic", vintage: "Vintage",
  };
  const textureLabels: Record<string, string> = {
    lofi_warm: "Lo-Fi Tape Warmth", clean_digital: "Clean Digital",
    analog_vintage: "Analog Vintage", raw_gritty: "Raw Gritty",
    dreamy: "Dreamy", spacious: "Spacious", dense: "Dense Layers", minimal: "Minimal",
  };
  const reverbLabels: Record<string, string> = {
    dry: "Dry (Close-mic)", room: "Room", hall: "Large Hall",
    cathedral: "Cathedral", lofi_filter: "Lo-Fi Filter", plate: "Plate (Studio)",
  };

  if (inputs.oneLiner) parts.push(`핵심 문장: "${inputs.oneLiner}"`);
  if (inputs.genre) parts.push(`장르: ${inputs.genre}`);
  if (inputs.vibe) parts.push(`느낌/분위기: ${inputs.vibe}`);
  if (inputs.tempo) parts.push(`템포: ${tempoLabels[inputs.tempo] || inputs.tempo}`);
  if (inputs.timeSignature) parts.push(`박자: ${inputs.timeSignature}`);
  if (inputs.era) parts.push(`시대감: ${eraLabels[inputs.era] || inputs.era}`);
  if (inputs.texture) parts.push(`질감: ${textureLabels[inputs.texture] || inputs.texture}`);
  if (inputs.reverb) parts.push(`리버브: ${reverbLabels[inputs.reverb] || inputs.reverb}`);
  if (inputs.instruments) parts.push(`악기: ${inputs.instruments}`);
  if (inputs.vocal) parts.push(`보컬 방향: ${inputs.vocal}`);

  parts.push(``, `=== 규칙 ===`);
  parts.push(`=== 작성 순서 (Suno 파싱 우선순위) ===`);
  parts.push(`반드시 이 순서대로 한 문단으로 작성:`);
  parts.push(`1) 장르명 + BPM + 박자 (첫 문장)`);
  parts.push(`2) 리듬/드럼 패턴 (킥, 스네어, 하이햇 배치)`);
  parts.push(`3) 베이스 (톤, 패턴)`);
  parts.push(`4) 핵심 악기 (기타, 피아노, 신스 등 — 역할과 톤)`);
  parts.push(`5) 텍스처/공간감 (리버브, 스테레오, 질감)`);
  parts.push(`6) 섹션별 다이내믹스 (Verse→Chorus→Bridge 변화)`);
  parts.push(`7) Emotional arc (마지막 한 문장)`);
  parts.push(``);
  parts.push(`=== 엄격 규칙 ===`);
  parts.push(`- 반드시 600~900자 영문. 900자 절대 초과 금지.`);
  parts.push(`- 한 문단으로 이어서 작성 (줄바꿈 없이)`);
  parts.push(`- 보컬 관련 단어 절대 금지 (vocal, singing, voice 등)`);
  parts.push(`- Hz, kHz, ms, dB, % 수치 절대 금지 (BPM 숫자만 허용)`);
  parts.push(`- 아티스트명, 프로듀서명, "type beat", "in the style of" 금지`);
  parts.push(``);
  parts.push(`=== 출력 형식 ===`);
  parts.push(`아래 두 섹션을 구분자로 나눠서 출력해줘:`);
  parts.push(``);
  parts.push(`---STYLE---`);
  parts.push(`(여기에 Style of Music 영문 프롬프트)`);
  parts.push(``);
  parts.push(`---NOTES---`);
  parts.push(`(여기에 프로듀서 분석 노트 — 한국어로 작성)`);
  parts.push(`프로듀서 분석 노트에는:`);
  parts.push(`- 핵심 문장에서 추론한 감정 방향`);
  parts.push(`- 리듬/질감/편곡/보컬/장르 추론 근거`);
  parts.push(`- 사용자 설정과 AI 판단의 차이점 (있다면)`);
  parts.push(`- Forensic Translation: 모호한 한국어 표현 → 물리적 사운드 태그 변환 과정`);

  return parts.join("\n");
}
