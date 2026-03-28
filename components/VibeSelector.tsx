"use client";

import { useState } from "react";

interface VibeSelectorProps {
  onSubmit: (value: string) => void;
  onSkip: () => void;
  oneLiner?: string;
  genre?: string; // 장르 기반 추천 추가
}

const VIBE_CATEGORIES = [
  {
    id: "mood",
    label: "분위기",
    options: ["어두운", "밝은", "몽환적", "감성적", "긴장감", "편안한", "우울한", "희망적", "신비로운", "섹시한", "쓸쓸한", "유쾌한"],
  },
  {
    id: "energy",
    label: "에너지",
    options: ["에너지틱", "부드러운", "웅장한", "차분한", "폭발적", "나른한", "점진적", "격렬한", "고요한", "압도적"],
  },
  {
    id: "texture",
    label: "질감",
    options: ["따뜻한", "차가운", "거친", "매끈한", "레트로", "미래적", "아날로그", "디지털", "촉촉한", "건조한", "무거운", "가벼운"],
  },
  {
    id: "character",
    label: "특성",
    options: ["중독적", "세련된", "실험적", "미니멀", "복잡한", "공간감", "친밀한", "거리감", "그루비", "서정적", "파괴적", "몰입감"],
  },
];

const CONFLICT_GROUPS = [
  ["어두운", "밝은"],
  ["우울한", "유쾌한", "희망적"],
  ["긴장감", "편안한"],
  ["에너지틱", "나른한", "고요한"],
  ["폭발적", "차분한"],
  ["격렬한", "부드러운"],
  ["따뜻한", "차가운"],
  ["거친", "매끈한"],
  ["레트로", "미래적"],
  ["아날로그", "디지털"],
  ["무거운", "가벼운"],
  ["촉촉한", "건조한"],
  ["미니멀", "복잡한"],
  ["친밀한", "거리감"],
  ["서정적", "파괴적"],
];

// 장르 + 핵심 문장 → 추천 매핑
function getRecommended(oneLiner: string, genre: string): Set<string> {
  const rec = new Set<string>();

  // 장르별 추천 (우선)
  const genreVibes: Record<string, string[]> = {
    "K-Pop": ["에너지틱", "밝은", "중독적", "매끈한"],
    "Pop": ["밝은", "에너지틱", "매끈한", "유쾌한"],
    "Dance Pop": ["에너지틱", "밝은", "중독적"],
    "City Pop": ["레트로", "따뜻한", "감성적", "그루비"],
    "R&B": ["감성적", "따뜻한", "부드러운", "그루비", "친밀한"],
    "Neo Soul": ["따뜻한", "부드러운", "아날로그", "서정적"],
    "Hip-Hop": ["거친", "중독적", "에너지틱", "어두운"],
    "Trap": ["어두운", "거친", "중독적", "무거운"],
    "Boom Bap": ["레트로", "거친", "그루비"],
    "Ballad": ["감성적", "서정적", "부드러운", "쓸쓸한"],
    "Lo-Fi": ["따뜻한", "편안한", "레트로", "나른한", "몽환적"],
    "EDM": ["에너지틱", "폭발적", "중독적", "밝은"],
    "Rock": ["에너지틱", "거친", "폭발적", "격렬한"],
    "Alt Rock": ["실험적", "거친", "몰입감"],
    "Indie Rock": ["실험적", "감성적", "아날로그"],
    "Metal": ["격렬한", "파괴적", "무거운", "어두운"],
    "Punk": ["격렬한", "거친", "에너지틱"],
    "Techno": ["중독적", "미니멀", "차가운", "디지털", "공간감"],
    "House": ["그루비", "에너지틱", "따뜻한", "중독적"],
    "Ambient": ["몽환적", "편안한", "공간감", "미니멀", "고요한"],
    "Synthwave": ["레트로", "몽환적", "따뜻한", "아날로그"],
    "Jazz": ["부드러운", "따뜻한", "세련된", "아날로그"],
    "Blues": ["따뜻한", "감성적", "거친", "아날로그"],
    "Cinematic": ["웅장한", "몰입감", "공간감", "긴장감"],
    "Acoustic": ["따뜻한", "편안한", "친밀한"],
    "Trot": ["밝은", "유쾌한", "에너지틱"],
    "Reggae": ["편안한", "따뜻한", "나른한", "그루비"],
    "Bossa Nova": ["편안한", "따뜻한", "부드러운", "나른한"],
    "Disco": ["에너지틱", "밝은", "그루비", "레트로"],
    "Funk": ["그루비", "에너지틱", "따뜻한", "중독적"],
    "Trance": ["몽환적", "에너지틱", "공간감", "중독적"],
    "Epic": ["웅장한", "폭발적", "긴장감", "몰입감"],
    "Gangsta Rap": ["어두운", "거친", "중독적", "무거운", "에너지틱"],
    "Drill": ["어두운", "거친", "긴장감", "중독적"],
    "Emo Rap": ["우울한", "감성적", "어두운", "몽환적"],
    "Gospel": ["따뜻한", "웅장한", "밝은", "서정적"],
    "Soul": ["따뜻한", "부드러운", "감성적", "아날로그"],
    "Dubstep": ["폭발적", "거친", "에너지틱", "디지털"],
    "Drum and Bass": ["에너지틱", "긴장감", "중독적", "격렬한"],
    "Latin": ["에너지틱", "따뜻한", "그루비", "밝은"],
    "Afrobeats": ["그루비", "에너지틱", "따뜻한", "중독적"],
    "Country": ["따뜻한", "서정적", "편안한", "아날로그"],
    "Folk": ["따뜻한", "편안한", "서정적", "친밀한"],
    "Progressive Rock": ["실험적", "웅장한", "복잡한", "몰입감"],
    "Grunge": ["거친", "우울한", "격렬한", "아날로그"],
    "New Wave": ["레트로", "실험적", "디지털", "에너지틱"],
    "Shoegaze": ["몽환적", "거친", "공간감", "무거운"],
  };

  // 장르 기반 추천 추가
  if (genre) {
    const genres = genre.split("+").map((g) => g.trim());
    for (const g of genres) {
      const vibes = genreVibes[g];
      if (vibes) vibes.forEach((v) => rec.add(v));
    }
  }

  // 핵심 문장 기반 추가
  const darkWords = ["밤", "어둠", "그림자", "눈물", "이별", "혼자", "잊", "아프", "끝", "떠나", "사라"];
  const brightWords = ["빛", "웃", "사랑", "함께", "시작", "희망", "봄", "아침"];
  const nostalgicWords = ["기억", "추억", "그때", "다시", "돌아", "시간", "옛", "녹지"];
  const intenseWords = ["불", "폭발", "미치", "질주", "전쟁", "분노"];

  if (darkWords.some((w) => oneLiner.includes(w))) { rec.add("어두운"); rec.add("우울한"); }
  if (brightWords.some((w) => oneLiner.includes(w))) { rec.add("밝은"); rec.add("희망적"); }
  if (nostalgicWords.some((w) => oneLiner.includes(w))) { rec.add("몽환적"); rec.add("감성적"); rec.add("쓸쓸한"); }
  if (intenseWords.some((w) => oneLiner.includes(w))) { rec.add("격렬한"); rec.add("폭발적"); }

  // 기본값 — 랜덤하게 3개 선택
  if (rec.size === 0) {
    const defaults = ["감성적", "몽환적", "중독적", "그루비", "에너지틱", "따뜻한", "어두운", "세련된", "편안한", "거친"];
    const shuffled = defaults.sort(() => Math.random() - 0.5);
    shuffled.slice(0, 3).forEach((v) => rec.add(v));
  }

  return rec;
}

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

export default function VibeSelector({ onSubmit, onSkip, oneLiner = "", genre = "" }: VibeSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const disabledOptions = getDisabledOptions(selected);
  const recommended = getRecommended(oneLiner, genre);

  const toggleOption = (option: string) => {
    if (disabledOptions.has(option)) return;
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option]
    );
  };

  const toggleCategory = (catId: string) => {
    setExpandedCat((prev) => (prev === catId ? null : catId));
  };

  const handleSubmit = () => {
    const parts: string[] = [];
    if (selected.length > 0) parts.push(selected.join(", "));
    if (customText.trim()) parts.push(customText.trim());
    if (parts.length === 0) { onSkip(); return; }
    onSubmit(parts.join(" + "));
  };

  return (
    <div className="space-y-3">
      {/* 추천 느낌 (선택 전에만 표시) */}
      {selected.length === 0 && recommended.size > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(Array.from(recommended).slice(0, 6))}
              style={{ backgroundColor: "#0a0a0a" }}
              className="px-4 py-2 rounded-full text-xs font-semibold text-white hover:opacity-80 transition-all"
            >
              추천 모두 선택
            </button>
            <p style={{ fontSize: "10px", color: "#a3a3a3" }}>
              또는 아래에서 하나씩
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(recommended).slice(0, 6).map((vibe) => (
              <button
                key={vibe}
                onClick={() => toggleOption(vibe)}
                style={{
                  backgroundColor: "#fff7ed",
                  color: "#f97316",
                  borderColor: "#f97316",
                  animation: "pulse-recommend 2s ease-in-out infinite",
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              >
                {vibe}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 태그 */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleOption(tag)}
              style={{ backgroundColor: "#fff7ed", color: "#f97316", borderColor: "rgba(249,115,22,0.3)" }}
              className="px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1 transition-all hover:opacity-80"
            >
              {tag}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-1.5" style={{ display: "flex", justifyContent: "space-between" }}>
        {VIBE_CATEGORIES.map((cat) => {
          // 이 카테고리에서 선택된 옵션이 있는지
          const hasSelection = cat.options.some((opt) => selected.includes(opt));
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

      {expandedCat && (
        <div className="animate-fadeIn" style={{ paddingLeft: "20px", borderLeft: "2px solid #e5e5e5" }}>
          <div className="flex flex-wrap gap-1.5">
            {VIBE_CATEGORIES.find((c) => c.id === expandedCat)?.options.map((opt) => {
              const isSelected = selected.includes(opt);
              const isDisabled = disabledOptions.has(opt);
              const isRecommended = recommended.has(opt) && !isSelected && !isDisabled;
              return (
                <button
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  disabled={isDisabled}
                  style={{
                    backgroundColor: isSelected ? "#0a0a0a" : isDisabled ? "#fafafa" : "#ffffff",
                    color: isSelected ? "#ffffff" : isDisabled ? "#d4d4d4" : isRecommended ? "#f97316" : "#737373",
                    borderColor: isSelected ? "#0a0a0a" : isRecommended ? "#f97316" : "#e5e5e5",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    textDecoration: isDisabled ? "line-through" : "none",
                    animation: isRecommended ? "pulse-recommend 2s ease-in-out infinite" : "none",
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 bg-white border border-border rounded-full px-4 py-2.5 text-sm text-text-primary placeholder-text-disabled focus:outline-none focus:border-foreground transition-colors"
          placeholder="직접 입력도 가능 (예: 비 오는 느낌)"
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
            backgroundColor: selected.length > 0 || customText.trim() ? "#f97316" : "#0a0a0a",
            animation: selected.length > 0 ? "pulse-submit 1.5s ease-in-out infinite" : "none",
          }}
          className="h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:opacity-80 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes pulse-recommend {
          0%, 100% { opacity: 1; border-color: #f97316; }
          50% { opacity: 0.5; border-color: #fdba74; }
        }
        @keyframes pulse-submit {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
