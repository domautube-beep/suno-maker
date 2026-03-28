"use client";

import { useState } from "react";

interface TextureSelectorProps {
  onSubmit: (value: string) => void;
  onSkip: () => void;
  genre?: string;
}

// 장르별 추천 질감 조합
const GENRE_TEXTURES: Record<string, string[]> = {
  "K-Pop": ["매끈한 (Polished)", "밀도 높은 (Dense)", "Crisp Clean"],
  "Pop": ["매끈한 (Polished)", "중간 룸 (Room)", "적당한 (Balanced)"],
  "Hip-Hop": ["거친 (Raw/Gritty)", "좁고 가까운 (Intimate)", "Lo-Fi Tape Warmth"],
  "Gangsta Rap": ["거친 (Raw/Gritty)", "무거운 (Heavy)", "좁고 가까운 (Intimate)"],
  "Trap": ["거친 (Raw/Gritty)", "무한 공간 (Infinite)", "인더스트리얼 (Industrial)"],
  "Drill": ["Cold Digital", "거친 (Raw/Gritty)", "미니멀 (Sparse)"],
  "Boom Bap": ["Lo-Fi Tape Warmth", "Vinyl Crackle", "오가닉 (Organic)"],
  "Emo Rap": ["몽환적 (Dreamy)", "거친 (Raw/Gritty)", "좁고 가까운 (Intimate)"],
  "R&B": ["부드러운 (Smooth)", "Analog Saturation", "중간 룸 (Room)"],
  "Neo Soul": ["Analog Saturation", "오가닉 (Organic)", "부드러운 (Smooth)"],
  "Ballad": ["부드러운 (Smooth)", "넓은 홀 (Wide Hall)", "적당한 (Balanced)"],
  "EDM": ["글래시 (Glassy)", "밀도 높은 (Dense)", "넓은 홀 (Wide Hall)"],
  "Lo-Fi": ["Lo-Fi Tape Warmth", "Vinyl Crackle", "좁고 가까운 (Intimate)"],
  "Rock": ["거친 (Raw/Gritty)", "중간 룸 (Room)", "오가닉 (Organic)"],
  "Metal": ["무거운 (Heavy)", "Wall of Sound", "거친 (Raw/Gritty)"],
  "Punk": ["거친 (Raw/Gritty)", "좁고 가까운 (Intimate)", "부서지는 (Crushed)"],
  "Techno": ["Cold Digital", "미니멀 (Sparse)", "인더스트리얼 (Industrial)"],
  "House": ["부드러운 (Smooth)", "중간 룸 (Room)", "적당한 (Balanced)"],
  "Trance": ["몽환적 (Dreamy)", "넓은 홀 (Wide Hall)", "사이키델릭 (Psychedelic)"],
  "Jazz": ["Analog Saturation", "오가닉 (Organic)", "중간 룸 (Room)"],
  "Blues": ["Analog Saturation", "거친 (Raw/Gritty)", "오가닉 (Organic)"],
  "Cinematic": ["넓은 홀 (Wide Hall)", "밀도 높은 (Dense)", "시네마틱 (Cinematic)"],
  "Ambient": ["몽환적 (Dreamy)", "무한 공간 (Infinite)", "사이키델릭 (Psychedelic)"],
  "Synthwave": ["Analog Saturation", "레트로 (Retro)", "미래적 (Futuristic)"],
  "Trot": ["Crisp Clean", "적당한 (Balanced)", "매끈한 (Polished)"],
  "Reggae": ["오가닉 (Organic)", "Analog Saturation", "중간 룸 (Room)"],
  "Latin": ["오가닉 (Organic)", "적당한 (Balanced)", "부드러운 (Smooth)"],
  "Afrobeats": ["오가닉 (Organic)", "적당한 (Balanced)", "중간 룸 (Room)"],
  "Disco": ["매끈한 (Polished)", "Analog Saturation", "레트로 (Retro)"],
  "Funk": ["Analog Saturation", "오가닉 (Organic)", "거친 (Raw/Gritty)"],
  "Folk": ["오가닉 (Organic)", "좁고 가까운 (Intimate)", "Analog Saturation"],
  "Acoustic": ["오가닉 (Organic)", "좁고 가까운 (Intimate)", "Crisp Clean"],
  "Gospel": ["넓은 홀 (Wide Hall)", "오가닉 (Organic)", "부드러운 (Smooth)"],
  "City Pop": ["Analog Saturation", "레트로 (Retro)", "매끈한 (Polished)"],
  "Dance Pop": ["매끈한 (Polished)", "밀도 높은 (Dense)", "글래시 (Glassy)"],
  "Shoegaze": ["Wall of Sound", "몽환적 (Dreamy)", "무한 공간 (Infinite)"],
  "Grunge": ["거친 (Raw/Gritty)", "무거운 (Heavy)", "오가닉 (Organic)"],
};

const TEXTURE_CATEGORIES = [
  {
    id: "warmth",
    label: "온도감",
    options: [
      "Lo-Fi Tape Warmth", "Analog Saturation", "Vinyl Crackle",
      "Cold Digital", "Icy Sheen", "Crisp Clean",
      "따뜻한 진공관 (Tube Warmth)", "촉촉한 (Wet/Humid)",
    ],
  },
  {
    id: "density",
    label: "밀도",
    options: [
      "미니멀 (Sparse)", "적당한 (Balanced)", "풍성한 (Layered)",
      "밀도 높은 (Dense)", "Wall of Sound", "오버드라이브 (Overdriven)",
      "무거운 (Heavy)", "가벼운 (Light/Airy)",
    ],
  },
  {
    id: "surface",
    label: "표면감",
    options: [
      "매끈한 (Polished)", "거친 (Raw/Gritty)", "부서지는 (Crushed)",
      "부드러운 (Smooth)", "사포질 (Sandpaper)", "글래시 (Glassy)",
      "벨벳 (Velvet)", "메탈릭 (Metallic)", "먼지낀 (Dusty)",
    ],
  },
  {
    id: "space",
    label: "공간감",
    options: [
      "좁고 가까운 (Intimate)", "중간 룸 (Room)", "넓은 홀 (Wide Hall)",
      "무한 공간 (Infinite)", "야외 (Open Air)", "폐쇄적 (Claustrophobic)",
      "지하실 (Basement)", "스타디움 (Stadium)", "수중 (Underwater)",
    ],
  },
  {
    id: "character",
    label: "캐릭터",
    options: [
      "몽환적 (Dreamy)", "사이키델릭 (Psychedelic)", "시네마틱 (Cinematic)",
      "인더스트리얼 (Industrial)", "오가닉 (Organic)", "글리치 (Glitch)",
      "레트로 (Retro)", "미래적 (Futuristic)", "언더그라운드 (Underground)",
      "고딕 (Gothic)", "앤틱 (Antique)", "네오 (Neo/Modern)",
    ],
  },
];

// 상충 그룹
const CONFLICT_GROUPS = [
  ["Lo-Fi Tape Warmth", "Cold Digital", "Icy Sheen"],
  ["매끈한 (Polished)", "거친 (Raw/Gritty)", "부서지는 (Crushed)"],
  ["좁고 가까운 (Intimate)", "넓은 홀 (Wide Hall)", "무한 공간 (Infinite)"],
  ["미니멀 (Sparse)", "Wall of Sound"],
  ["오가닉 (Organic)", "글리치 (Glitch)"],
  ["레트로 (Retro)", "미래적 (Futuristic)"],
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

export default function TextureSelector({ onSubmit, onSkip, genre = "" }: TextureSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  // 장르 기반 추천 질감
  const firstGenre = genre.split("+")[0].trim();
  const recommended = new Set(GENRE_TEXTURES[firstGenre] || []);

  const disabledOptions = getDisabledOptions(selected);

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
      {/* 추천 질감 (선택 전에만) */}
      {selected.length === 0 && recommended.size > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(Array.from(recommended))}
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
            {Array.from(recommended).map((tex) => (
              <button
                key={tex}
                onClick={() => toggleOption(tex)}
                style={{
                  backgroundColor: "#fff7ed",
                  color: "#f97316",
                  borderColor: "#f97316",
                  animation: "pulse-tex 2s ease-in-out infinite",
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              >
                {tex}
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

      {/* 대분류 — 양끝맞춤 */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "6px" }}>
        {TEXTURE_CATEGORIES.map((cat) => {
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

      {/* 소분류 — 들여쓰기 + 상충 비활성 */}
      {expandedCat && (
        <div className="animate-fadeIn" style={{ paddingLeft: "20px", borderLeft: "2px solid #e5e5e5" }}>
          <div className="flex flex-wrap gap-1.5">
            {TEXTURE_CATEGORIES.find((c) => c.id === expandedCat)?.options.map((opt) => {
              const isSelected = selected.includes(opt);
              const isDisabled = disabledOptions.has(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleOption(opt)}
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
                  {opt}
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
          placeholder="직접 입력 (예: 비닐 느낌, 물속 같은)"
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
            animation: selected.length > 0 ? "pulse-tex 1.5s ease-in-out infinite" : "none",
          }}
          className="h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:opacity-80 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes pulse-tex {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
