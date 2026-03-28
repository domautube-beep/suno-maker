"use client";

import { SunoInput } from "@/lib/types";
import { STEPS } from "@/lib/steps";
import { getGenrePreset, getTempoLabel } from "@/lib/genrePresets";

interface ConfirmCardProps {
  inputs: SunoInput;
  onConfirm: () => void;
  onReset: () => void;
  onEditStep?: (stepId: string) => void;
}

function getLabel(stepId: string, value: string): string {
  const step = STEPS.find((s) => s.id === stepId);
  if (!step?.options) return value;
  return step.options.find((o) => o.value === value)?.label || value;
}

// 랜덤 선택 헬퍼
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// AI가 빈 값을 사용자 선택 기반 + 랜덤으로 채움
function getDisplayValue(key: string, value: string, inputs: SunoInput): { text: string; isAI: boolean } {
  if (value && value.trim()) {
    const short = value.length > 40 ? value.substring(0, 37) + "..." : value;
    return { text: short, isAI: false };
  }

  // 장르 프리셋 기반 or 완전 랜덤
  const preset = inputs.genre ? getGenrePreset(inputs.genre) : null;

  const randomPools: Record<string, string[]> = {
    genre: ["K-Pop", "R&B", "Hip-Hop", "Pop", "Lo-Fi", "Rock", "EDM", "Ballad", "Jazz", "Synthwave", "Indie", "Ambient"],
    instruments: [
      "piano + synth pad + drums",
      "acoustic guitar + bass + percussion",
      "Rhodes piano + 808 drums + synth",
      "electric guitar + drum kit + bass",
      "strings + piano + ambient pad",
      "synth lead + 808 bass + hi-hats",
    ],
    vibe: [
      "감성적, 몽환적", "어두운, 중독적", "밝은, 에너지틱",
      "따뜻한, 편안한", "차가운, 미니멀", "거친, 폭발적",
      "레트로, 그루비", "웅장한, 긴장감", "나른한, 부드러운",
    ],
    tempo: ["Very Slow (50~65)", "Slow (66~80)", "Mid Slow (81~95)", "Mid (96~110)", "Mid Fast (111~125)", "Fast (126~140)"],
    timeSignature: ["4/4", "3/4", "6/8", "셔플"],
    era: ["80s 레트로", "90s 감성", "2000s Y2K", "2010s 모던", "2020s 현대", "빈티지"],
    texture: ["Lo-Fi 따뜻한", "깔끔 디지털", "아날로그 빈티지", "거친 Raw", "몽환 Dreamy", "넓은 공간감"],
    vocal: [
      "남성 중음, 따뜻한", "남성 저음, 허스키", "남성 고음, 파워풀",
      "여성 중음, 매끈한", "여성 고음, 공기감", "여성 저음, 소울풀",
    ],
    reverb: ["Dry (가까운)", "Room", "Hall (넓은)", "Plate (스튜디오)", "Lo-Fi 필터"],
    language: ["한국어", "English", "한국어 + English"],
  };

  // 프리셋이 있으면 프리셋 기반, 없으면 완전 랜덤
  if (preset) {
    const presetValues: Record<string, string> = {
      tempo: getTempoLabel(preset.tempo),
      timeSignature: preset.timeSignature,
      era: preset.era,
      reverb: preset.reverb,
      texture: preset.texture,
    };
    if (presetValues[key]) return { text: presetValues[key], isAI: true };
  }

  const pool = randomPools[key];
  if (pool) return { text: pickRandom(pool), isAI: true };

  return { text: "AI 랜덤", isAI: true };
}

export default function ConfirmCard({ inputs, onConfirm, onReset, onEditStep }: ConfirmCardProps) {
  // 언어는 Lyrics 단계에서 선택하므로 여기서 제외
  const fields = [
    { key: "oneLiner", label: "핵심" },
    { key: "genre", label: "장르" },
    { key: "instruments", label: "악기" },
    { key: "vibe", label: "느낌" },
    { key: "tempo", label: "BPM" },
    { key: "timeSignature", label: "박자" },
    { key: "era", label: "시대" },
    { key: "texture", label: "질감" },
    { key: "vocal", label: "보컬" },
    { key: "reverb", label: "리버브" },
  ];

  const filledCount = fields.filter((f) => {
    const val = (inputs as unknown as Record<string, string>)[f.key];
    return val && val.trim();
  }).length;

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: "16px", overflow: "hidden" }}>
      {/* 헤더 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5", backgroundColor: "#fafafa" }}>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "#0a0a0a" }}>최종 브리핑</p>
        <p style={{ fontSize: "11px", color: "#737373", marginTop: "4px" }}>
          {filledCount}개 직접 설정 / {fields.length - filledCount}개 AI 추론
        </p>
      </div>

      {/* 설정 목록 */}
      <div style={{ padding: "16px 20px" }}>
        {fields.map((field) => {
          const rawValue = (inputs as unknown as Record<string, string>)[field.key] || "";
          const { text, isAI } = getDisplayValue(field.key, rawValue, inputs);
          return (
            <div key={field.key} className="confirm-row" style={{ display: "flex", gap: "8px", padding: "8px 0", borderBottom: "1px solid #f5f5f5", alignItems: "center", borderRadius: "8px", paddingLeft: "8px", paddingRight: "8px", transition: "background-color 0.15s ease", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f5f5f5"; e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
              onClick={() => onEditStep?.(field.key)}
            >
              <span style={{ fontSize: "12px", color: "#a3a3a3", width: "48px", flexShrink: 0 }}>{field.label}</span>
              <span style={{
                fontSize: "12px",
                color: isAI ? "#d4d4d4" : "#0a0a0a",
                fontStyle: isAI ? "italic" : "normal",
                flex: 1,
              }}>
                {text}
                {isAI && <span style={{ fontSize: "10px", color: "#f97316", marginLeft: "4px" }}>AI</span>}
              </span>
              {onEditStep && (
                <button
                  onClick={() => onEditStep(field.key)}
                  style={{ fontSize: "10px", color: "#a3a3a3", border: "1px solid #e5e5e5", borderRadius: "9999px", padding: "3px 10px", backgroundColor: "#fff", cursor: "pointer", flexShrink: 0 }}
                >
                  수정
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 버튼 */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e5e5", display: "flex", gap: "8px" }}>
        <button
          onClick={onConfirm}
          style={{ flex: 1, backgroundColor: "#f97316", color: "#fff", padding: "12px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" }}
        >
          이 설정으로 Style 생성하기
        </button>
        <button
          onClick={onReset}
          style={{ padding: "12px 16px", borderRadius: "12px", fontSize: "13px", color: "#737373", border: "1px solid #e5e5e5", backgroundColor: "#fff", cursor: "pointer" }}
        >
          다시
        </button>
      </div>
    </div>
  );
}
