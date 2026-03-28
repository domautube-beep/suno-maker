"use client";

import { useState } from "react";

interface VocalSelectorProps {
  onSubmit: (value: string) => void;
  onSkip: () => void;
}

const VOCAL_CATEGORIES = [
  {
    id: "voice_type",
    label: "보컬 타입",
    options: [
      { label: "남성 저음", value: "male, low baritone, deep chest resonance" },
      { label: "남성 중음", value: "male, mid-range tenor, warm natural presence" },
      { label: "남성 고음", value: "male, high tenor, bright falsetto capable" },
      { label: "여성 저음", value: "female, low alto, rich warm depth" },
      { label: "여성 중음", value: "female, mid-range mezzo, clear and balanced" },
      { label: "여성 고음", value: "female, high soprano, airy and light" },
      { label: "듀엣 (남녀)", value: "male-female duet, alternating verses, harmony chorus" },
      { label: "그룹 보컬", value: "group vocal, layered unison, call-and-response" },
    ],
  },
  {
    id: "timbre",
    label: "음색",
    options: [
      { label: "허스키", value: "husky grain, rough warmth, textured edge" },
      { label: "매끈한", value: "smooth silk, clean resonance, polished tone" },
      { label: "거친", value: "raw rasp, gritty attack, distorted edge" },
      { label: "공기감", value: "airy breathy, whisper-close, soft presence" },
      { label: "파워풀", value: "powerful chest, full projection, bold resonance" },
      { label: "따뜻한", value: "warm natural, soft grain, intimate tone" },
      { label: "맑은", value: "crystal clear, bell-like, pure tone" },
      { label: "나른한", value: "lazy drawl, half-sung, drowsy tone" },
      { label: "금속성", value: "metallic edge, sharp resonance, cutting presence" },
      { label: "어쿠스틱", value: "acoustic natural, unprocessed, organic feel" },
      { label: "소울풀", value: "soulful richness, gospel-influenced, deep emotion" },
      { label: "보이스크랙", value: "intentional voice crack, vulnerable break, emotional fracture" },
    ],
  },
  {
    id: "delivery",
    label: "딜리버리",
    options: [
      { label: "대화체", value: "conversational intimacy, talking-singing, natural phrasing" },
      { label: "감정폭발", value: "emotional outburst, crescendo peaks, raw vulnerability" },
      { label: "나른한", value: "laid-back lazy, half-whisper, effortless cool" },
      { label: "리드미컬", value: "rhythmic precision, percussive delivery, groove-locked" },
      { label: "서정적", value: "lyrical flowing, sustained legato, poetic phrasing" },
      { label: "랩", value: "rap flow, rhythmic speech, sharp articulation, punchline delivery" },
      { label: "속삭임", value: "whisper singing, ASMR-close, breath-heavy" },
      { label: "샤우팅", value: "belting, powerful shout, maximum projection" },
      { label: "스캣/애드립", value: "scat improvisation, vocal runs, ad-lib ornaments" },
      { label: "담담한", value: "deadpan delivery, emotionally flat, understated cool" },
      { label: "격앙", value: "agitated delivery, rising tension, urgent pacing" },
      { label: "플로우 전환", value: "switching flows, verse-chorus contrast, dynamic range" },
    ],
  },
  {
    id: "space",
    label: "공간감",
    options: [
      { label: "가까운 (Dry)", value: "close-mic dry, intimate distance, minimal reverb" },
      { label: "중간 (Room)", value: "medium room, balanced wet/dry, natural space" },
      { label: "넓은 (Hall)", value: "large hall, wide reverb, distant ethereal" },
      { label: "대성당", value: "cathedral reverb, massive tail, sacred space" },
      { label: "Lo-Fi", value: "lo-fi filtered, tape warmth, vintage compression" },
      { label: "플레이트", value: "plate reverb, vintage warm, classic studio" },
      { label: "야외/오픈", value: "outdoor ambience, open air, natural echo" },
      { label: "전화/라디오", value: "telephone filter, lo-bandwidth, retro broadcast" },
    ],
  },
];

// 상충 그룹
const CONFLICT_GROUPS = [
  ["허스키", "맑은"],
  ["매끈한", "거친"],
  ["파워풀", "공기감"],
  ["대화체", "샤우팅"],
  ["나른한", "감정폭발"],
  ["속삭임", "샤우팅"],
  ["가까운 (Dry)", "넓은 (Hall)"],
];

function getDisabledOptions(selected: string[]): Set<string> {
  const disabled = new Set<string>();
  for (const sel of selected) {
    for (const group of CONFLICT_GROUPS) {
      if (group.includes(sel)) {
        for (const opt of group) {
          if (opt !== sel) disabled.add(opt);
        }
      }
    }
  }
  return disabled;
}

export default function VocalSelector({ onSubmit, onSkip }: VocalSelectorProps) {
  const [selected, setSelected] = useState<Record<string, { label: string; value: string }>>({});
  const [customText, setCustomText] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>("voice_type");

  const selectedLabels = Object.values(selected).map((s) => s.label);
  const disabledOptions = getDisabledOptions(selectedLabels);

  const selectOption = (catId: string, label: string, value: string) => {
    if (disabledOptions.has(label)) return;
    // 같은 카테고리에서 이미 선택된 거면 해제
    if (selected[catId]?.label === label) {
      setSelected((prev) => { const next = { ...prev }; delete next[catId]; return next; });
      return;
    }
    setSelected((prev) => ({ ...prev, [catId]: { label, value } }));
  };

  const removeSelection = (catId: string) => {
    setSelected((prev) => { const next = { ...prev }; delete next[catId]; return next; });
    setExpandedCat(catId);
  };

  const toggleCategory = (catId: string) => {
    setExpandedCat((prev) => (prev === catId ? null : catId));
  };

  const handleSubmit = () => {
    const parts = Object.values(selected).map((s) => s.value);
    if (customText.trim()) parts.push(customText.trim());
    if (parts.length === 0) { onSkip(); return; }
    onSubmit(parts.join(" | "));
  };

  const selectedCount = Object.keys(selected).length;

  return (
    <div className="space-y-3">
      {/* 선택된 태그 */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {VOCAL_CATEGORIES.map((cat) => {
            const sel = selected[cat.id];
            if (!sel) return null;
            return (
              <button
                key={cat.id}
                onClick={() => removeSelection(cat.id)}
                style={{ backgroundColor: "#fff7ed", color: "#f97316", borderColor: "rgba(249,115,22,0.3)" }}
                className="px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1 transition-all hover:opacity-80"
              >
                {sel.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* 대분류 — 양끝맞춤 + 체크 */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "6px" }}>
        {VOCAL_CATEGORIES.map((cat) => {
          const hasSelection = !!selected[cat.id];
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              style={{
                flex: 1,
                backgroundColor: expandedCat === cat.id ? "#0a0a0a" : hasSelection ? "#f0f0f0" : "#fafafa",
                color: expandedCat === cat.id ? "#ffffff" : hasSelection ? "#f97316" : "#525252",
                borderColor: expandedCat === cat.id ? "#0a0a0a" : "#e5e5e5",
              }}
              className="py-2 rounded-full text-xs font-medium border transition-all"
            >
              {hasSelection ? `${cat.label} ✓` : cat.label}
            </button>
          );
        })}
      </div>

      {/* 소분류 — 들여쓰기 */}
      {expandedCat && (
        <div className="animate-fadeIn" style={{ paddingLeft: "20px", borderLeft: "2px solid #e5e5e5" }}>
          <div className="flex flex-wrap gap-1.5">
            {VOCAL_CATEGORIES.find((c) => c.id === expandedCat)?.options.map((opt) => {
              const isSelected = selected[expandedCat]?.label === opt.label;
              const isDisabled = disabledOptions.has(opt.label);
              return (
                <button
                  key={opt.label}
                  onClick={() => selectOption(expandedCat, opt.label, opt.value)}
                  disabled={isDisabled}
                  style={{
                    backgroundColor: isSelected ? "#0a0a0a" : isDisabled ? "#fafafa" : "#ffffff",
                    color: isSelected ? "#ffffff" : isDisabled ? "#d4d4d4" : "#737373",
                    borderColor: isSelected ? "#0a0a0a" : "#e5e5e5",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    textDecoration: isDisabled ? "line-through" : "none",
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 직접 입력 */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 bg-white border border-border rounded-full px-4 py-2.5 text-sm text-text-primary placeholder-text-disabled focus:outline-none focus:border-foreground transition-colors"
          placeholder="추가 보컬 설명 (예: 비브라토 적게)"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(); } }}
        />
        <button
          onClick={onSkip}
          className="px-4 py-2.5 rounded-full text-sm font-medium border border-border text-text-secondary hover:border-foreground hover:text-text-primary transition-all flex-shrink-0"
        >
          맡길게
        </button>
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: selectedCount > 0 || customText.trim() ? "#f97316" : "#e5e5e5",
            animation: selectedCount > 0 ? "pulse-submit 1.5s ease-in-out infinite" : "none",
          }}
          className="h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <style>{`
        @keyframes pulse-submit {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
