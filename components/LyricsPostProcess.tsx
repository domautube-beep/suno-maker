"use client";

import { useState } from "react";
import { Provider } from "./ApiKeyGate";

// 뿌수노 46개 + R3ALAUDE 확장 — 한국어 가사 클리셰 감지용
const CLICHE_LIST = [
  "빛나다", "빛나", "눈부시", "반짝이", "아련하", "설레임",
  "영원히", "운명", "기적", "꿈꾸", "별빛",
  "함께라면", "행복해", "소중해", "곁에 있어줘", "내 손을 잡아",
  "떠나지 마", "언제나 너야", "변하지 않을게",
  "혼자인 것 같아", "숨이 막혀", "기억 속에", "잊을 수가 없어",
  "포근하", "따스하", "처럼 느껴져", "인 것 같아",
  "그래도 괜찮아", "결국 잘 될 거야",
  "편의점", "섬유유연제", "형광등", "가로등", "버스정류장",
  "새벽 감성", "차가운 바람", "뜨거운 눈물",
  "흘러가", "날아가", "녹아내리", "흩어지", "스며들어", "물들다",
  "먹먹하", "괜찮은 척", "텅 빈",
  "네온", "네온빛", "번져", "퍼져", "접어",
];

// 채점 항목
const SCORE_LABELS: Record<string, string> = {
  scene: "장면",
  hook: "후크",
  rhythm: "리듬",
  originality: "독창성",
  emotion: "감정",
};

function scoreColor(s: number) {
  if (s >= 8) return "#22c55e";
  if (s >= 6) return "#eab308";
  if (s >= 4) return "#f97316";
  return "#ef4444";
}

interface Props {
  lyrics: string;
  apiKey: string;
  provider: Provider;
  onUpdate: (newLyrics: string) => void;
}

// API 호출 헬퍼
async function callStream(prompt: string, apiKey: string, provider: Provider): Promise<string> {
  const res = await fetch("/api/lyrics-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, apiKey, provider }),
  });
  if (!res.ok) return "";
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value, { stream: true }).split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const d = line.slice(6).trim();
      if (d === "[DONE]") break;
      try {
        const p = JSON.parse(d);
        if (p.text) full += p.text;
      } catch {}
    }
  }
  return full;
}

export default function LyricsPostProcess({ lyrics, apiKey, provider, onUpdate }: Props) {
  // 클리셰 감지
  const found = CLICHE_LIST.filter((w) => lyrics.includes(w));
  const [fixingCliche, setFixingCliche] = useState(false);

  // AI 채점
  const [scoring, setScoring] = useState(false);
  const [scores, setScores] = useState<Record<string, number | string> | null>(null);
  const [improving, setImproving] = useState(false);

  // 클리셰 자동 수정
  const handleFixCliche = async () => {
    if (!found.length || fixingCliche) return;
    setFixingCliche(true);
    try {
      const fixed = await callStream(
        `아래 가사에서 클리셰 표현을 구체적인 장면/행동/사물로 교체해줘.
T.S.엘리엇 Objective Correlative 원칙: 감정을 직접 말하지 말고 사물·행동·장면으로 보여줘라.

클리셰 목록: ${found.join(", ")}

기존 가사:
${lyrics}

수정된 가사만 출력 (포맷 그대로 유지, 설명 없이):`,
        apiKey,
        provider
      );
      if (fixed.trim()) onUpdate(fixed.trim());
    } catch {}
    setFixingCliche(false);
  };

  // AI 채점
  const handleScore = async () => {
    if (scoring) return;
    setScoring(true);
    setScores(null);
    try {
      const raw = await callStream(
        `다음 가사를 5가지 기준으로 각 0~10점 채점하고 JSON으로만 출력. 설명없이 JSON만.
{"scene":점수,"hook":점수,"rhythm":점수,"originality":점수,"emotion":점수,"feedback":"한줄 핵심 피드백 (한국어 30자 이내)","best":"베스트 라인 (원문)","worst":"아쉬운 라인 (원문)"}
기준: scene=장면구체성(Objective Correlative), hook=후크 강도/기억성, rhythm=음절 리듬감, originality=독창성/참신함, emotion=감정 전달력

가사:
${lyrics.slice(0, 1500)}`,
        apiKey,
        provider
      );
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setScores(parsed);
    } catch {}
    setScoring(false);
  };

  // 8점 이상 자동 개선
  const handleImprove = async () => {
    if (!scores || improving) return;
    setImproving(true);
    try {
      const lowKeys = Object.keys(SCORE_LABELS).filter(
        (k) => typeof scores[k] === "number" && (scores[k] as number) < 8
      );
      if (!lowKeys.length) { setImproving(false); return; }

      const guideMap: Record<string, string> = {
        scene: "추상어를 구체적 사물/장소/행동으로 교체 (Objective Correlative)",
        hook: "훅을 더 짧고 강렬하게. 한 번 듣고 따라 부를 수 있게",
        rhythm: "줄 길이 변화 + 내부 라임 강화",
        originality: "비유/이미지를 참신하게, 상투적 표현 제거",
        emotion: "감정을 직접 표현 말고 장면/행동으로만 보여줘",
      };

      const fixed = await callStream(
        `가사를 개선해서 모든 항목 8점 이상으로 만들어줘.

낮은 항목:
${lowKeys.map((k) => `- ${SCORE_LABELS[k]}(${scores[k]}점): ${guideMap[k]}`).join("\n")}

기존 가사:
${lyrics}

개선된 가사만 출력 (포맷 그대로 유지, 설명 없이):`,
        apiKey,
        provider
      );
      if (fixed.trim()) onUpdate(fixed.trim());

      // 재채점
      const raw2 = await callStream(
        `다음 가사를 5가지 기준으로 각 0~10점 채점하고 JSON으로만 출력.
{"scene":점수,"hook":점수,"rhythm":점수,"originality":점수,"emotion":점수,"feedback":"한줄피드백","best":"베스트라인","worst":"아쉬운라인"}

가사:
${fixed.trim().slice(0, 1500)}`,
        apiKey,
        provider
      );
      try {
        setScores(JSON.parse(raw2.replace(/```json|```/g, "").trim()));
      } catch {}
    } catch {}
    setImproving(false);
  };

  const total = scores
    ? Math.round(
        Object.keys(SCORE_LABELS).reduce((s, k) => s + ((scores[k] as number) || 0), 0) /
          Object.keys(SCORE_LABELS).length *
          10
      ) / 10
    : 0;
  const needsFix = scores && total < 8;

  return (
    <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* 클리셰 감지 */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "12px",
          border: found.length ? "1px solid #fecaca" : "1px solid #bbf7d0",
          backgroundColor: found.length ? "#fef2f2" : "#f0fdf4",
        }}
      >
        {found.length === 0 ? (
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#16a34a", margin: 0 }}>
            클리셰 없음
          </p>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#dc2626", margin: 0 }}>
                클리셰 {found.length}개 발견
              </p>
              <button
                onClick={handleFixCliche}
                disabled={fixingCliche}
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor: fixingCliche ? "#f5f5f5" : "#0a0a0a",
                  color: fixingCliche ? "#a3a3a3" : "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: fixingCliche ? "wait" : "pointer",
                }}
              >
                {fixingCliche ? "수정 중..." : "자동 수정"}
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {found.map((w) => (
                <span
                  key={w}
                  style={{
                    padding: "2px 10px",
                    borderRadius: "9999px",
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* AI 채점 */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "12px",
          border: "1px solid #e5e5e5",
          backgroundColor: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: scores ? "12px" : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#0a0a0a", margin: 0 }}>
              AI 가사 채점
            </p>
            {scores && (
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: "9999px",
                  backgroundColor: scoreColor(total),
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                {total}/10
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {needsFix && (
              <button
                onClick={handleImprove}
                disabled={improving}
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor: improving ? "#f5f5f5" : "#f97316",
                  color: improving ? "#a3a3a3" : "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: improving ? "wait" : "pointer",
                }}
              >
                {improving ? "개선 중..." : "8점↑ 자동개선"}
              </button>
            )}
            <button
              onClick={handleScore}
              disabled={scoring}
              style={{
                padding: "4px 12px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: scoring ? "#f5f5f5" : "#0a0a0a",
                color: scoring ? "#a3a3a3" : "#fff",
                fontSize: "11px",
                fontWeight: 700,
                cursor: scoring ? "wait" : "pointer",
              }}
            >
              {scoring ? "채점 중..." : "채점"}
            </button>
          </div>
        </div>

        {scores && (
          <>
            {/* 5항목 점수 바 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", marginBottom: "10px" }}>
              {Object.entries(SCORE_LABELS).map(([k, label]) => {
                const val = (scores[k] as number) || 0;
                return (
                  <div
                    key={k}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "10px",
                      backgroundColor: "#fafafa",
                      textAlign: "center",
                      border: val < 8 ? "1px solid #fecaca" : "1px solid #e5e5e5",
                    }}
                  >
                    <p style={{ fontSize: "10px", color: "#737373", fontWeight: 600, marginBottom: "4px" }}>
                      {label}
                    </p>
                    <p style={{ fontSize: "16px", fontWeight: 900, color: scoreColor(val), margin: 0 }}>
                      {val}
                    </p>
                    <div
                      style={{
                        height: "3px",
                        borderRadius: "3px",
                        backgroundColor: "#e5e5e5",
                        marginTop: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(val / 10) * 100}%`,
                          backgroundColor: scoreColor(val),
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 피드백 */}
            {scores.feedback && (
              <div style={{ padding: "8px 12px", borderRadius: "10px", backgroundColor: "#fafafa", marginBottom: "8px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", marginBottom: "2px" }}>
                  피드백
                </p>
                <p style={{ fontSize: "12px", color: "#0a0a0a", margin: 0 }}>{scores.feedback as string}</p>
              </div>
            )}

            {/* 베스트 / 아쉬운 라인 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {scores.best && (
                <div style={{ padding: "8px 10px", borderRadius: "10px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <p style={{ fontSize: "10px", fontWeight: 800, color: "#16a34a", marginBottom: "3px" }}>
                    베스트
                  </p>
                  <p style={{ fontSize: "11px", color: "#0a0a0a", margin: 0, lineHeight: "1.5" }}>
                    {scores.best as string}
                  </p>
                </div>
              )}
              {scores.worst && (
                <div style={{ padding: "8px 10px", borderRadius: "10px", backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                  <p style={{ fontSize: "10px", fontWeight: 800, color: "#d97706", marginBottom: "3px" }}>
                    수정 추천
                  </p>
                  <p style={{ fontSize: "11px", color: "#0a0a0a", margin: 0, lineHeight: "1.5" }}>
                    {scores.worst as string}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
