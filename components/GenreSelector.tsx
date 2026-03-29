"use client";

import { useState } from "react";
import { GENRE_CATEGORIES, GENRE_DESCRIPTIONS } from "@/lib/genreData";

interface GenreSelectorProps {
  onSubmit: (value: string) => void;
  onSkip: () => void;
  oneLiner?: string;
}

// 핵심 문장 → 추천 장르 매핑
function getRecommendedGenres(oneLiner: string): Set<string> {
  const rec = new Set<string>();
  const darkWords = ["밤", "어둠", "그림자", "눈물", "이별", "혼자", "잊", "아프", "끝", "떠나", "사라"];
  const brightWords = ["빛", "웃", "사랑", "함께", "시작", "희망", "봄", "아침", "따뜻"];
  const nostalgicWords = ["기억", "추억", "그때", "다시", "돌아", "시간", "옛", "녹지"];
  const intenseWords = ["불", "폭발", "미치", "질주", "전쟁", "분노", "파괴"];
  const chillWords = ["새벽", "밤", "혼자", "조용", "고요", "비", "커피"];

  const isDark = darkWords.some((w) => oneLiner.includes(w));
  const isBright = brightWords.some((w) => oneLiner.includes(w));
  const isNostalgic = nostalgicWords.some((w) => oneLiner.includes(w));
  const isIntense = intenseWords.some((w) => oneLiner.includes(w));
  const isChill = chillWords.some((w) => oneLiner.includes(w));

  if (isDark) { rec.add("Hip-Hop"); rec.add("Trap"); rec.add("Ambient"); rec.add("Emo Rap"); }
  if (isBright) { rec.add("K-Pop"); rec.add("Pop"); rec.add("Dance Pop"); rec.add("EDM"); }
  if (isNostalgic) { rec.add("Lo-Fi"); rec.add("Synthwave"); rec.add("City Pop"); rec.add("R&B"); rec.add("Ballad"); }
  if (isIntense) { rec.add("Rock"); rec.add("Metal"); rec.add("Techno"); rec.add("Punk"); }
  if (isChill) { rec.add("Lo-Fi"); rec.add("Ambient"); rec.add("Bossa Nova"); rec.add("Jazz"); }

  // 장르명/스타일 직접 언급 감지
  const genreKeywords: Record<string, string[]> = {
    "K-Pop": ["케이팝", "k-pop", "kpop", "아이돌"],
    "Pop": ["팝", "pop", "대중"],
    "Hip-Hop": ["힙합", "hip-hop", "hiphop", "랩", "rap"],
    "Trap": ["트랩", "trap", "808"],
    "R&B": ["알앤비", "r&b", "rnb", "소울", "soul"],
    "Ballad": ["발라드", "ballad", "슬픈"],
    "EDM": ["이디엠", "edm", "클럽", "club", "드롭"],
    "Lo-Fi": ["로파이", "lo-fi", "lofi", "새벽", "감성"],
    "Rock": ["록", "rock", "기타", "guitar"],
    "Techno": ["테크노", "techno"],
    "House": ["하우스", "house"],
    "Jazz": ["재즈", "jazz", "스윙"],
    "Blues": ["블루스", "blues"],
    "Funk": ["펑크", "풍크", "funk", "그루브", "groove"],
    "Disco": ["디스코", "disco"],
    "Reggae": ["레게", "reggae"],
    "Latin": ["라틴", "latin", "살사", "삼바"],
    "Bossa Nova": ["보사노바", "bossa"],
    "Metal": ["메탈", "metal", "헤비"],
    "Punk": ["펑크", "punk"],
    "Acoustic": ["어쿠스틱", "acoustic", "통기타"],
    "Folk": ["포크", "folk"],
    "Cinematic": ["시네마틱", "cinematic", "영화", "epic", "에픽"],
    "Ambient": ["앰비언트", "ambient"],
    "Synthwave": ["신스웨이브", "synthwave", "레트로", "80s", "80년대"],
    "City Pop": ["시티팝", "citypop", "city pop"],
    "Trot": ["트로트", "trot", "뽕짝"],
    "Dance Pop": ["댄스팝", "dance"],
    "Drum & Bass": ["드럼앤베이스", "dnb", "drum"],
    "Indie Rock": ["인디", "indie"],
  };

  const lower = oneLiner.toLowerCase();
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      rec.add(genre);
    }
  }

  if (rec.size === 0) { rec.add("Pop"); rec.add("R&B"); rec.add("K-Pop"); }
  return rec;
}

// GENRE_CATEGORIES는 lib/genreData.ts에서 import

export default function GenreSelector({ onSubmit, onSkip, oneLiner = "" }: GenreSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const recommended = getRecommendedGenres(oneLiner);

  // 단일 선택 — 선택하면 바로 제출
  const toggleOption = (option: string) => {
    onSubmit(option);
  };

  const toggleCategory = (catId: string) => {
    setExpandedCat((prev) => (prev === catId ? null : catId));
  };

  const handleSubmit = () => {
    const parts: string[] = [];
    if (selected.length > 0) parts.push(selected.join(" + "));
    if (customText.trim()) parts.push(customText.trim());
    if (parts.length === 0) { onSkip(); return; }
    onSubmit(parts.join(" + "));
  };

  return (
    <div className="space-y-3">
      {/* 추천 장르 (선택 전에만 표시) */}
      {selected.length === 0 && recommended.size > 0 && (
        <div className="space-y-2">
          <p style={{ fontSize: "11px", color: "#f97316", fontWeight: 600 }}>
            추천 장르
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(recommended).slice(0, 6).map((genre) => {
              const desc = GENRE_DESCRIPTIONS[genre];
              return (
                <div key={genre} className="genre-tip-wrap" style={{ position: "relative", display: "inline-block" }}>
                  <button
                    onClick={() => toggleOption(genre)}
                    style={{
                      backgroundColor: "#fff7ed",
                      color: "#f97316",
                      borderColor: "#f97316",
                      animation: "pulse-recommend 2s ease-in-out infinite",
                    }}
                    className="px-4 py-2 rounded-full text-xs font-medium border transition-all"
                  >
                    {genre}
                  </button>
                  {desc && (
                    <div className="genre-tip" style={{
                      position: "absolute", bottom: "calc(100% + 6px)", left: "0",
                      backgroundColor: "#0a0a0a", color: "#fff", borderRadius: "8px",
                      padding: "6px 10px", fontSize: "10px", lineHeight: "1.4",
                      whiteSpace: "nowrap", zIndex: 50, pointerEvents: "none",
                      opacity: 0, transition: "opacity 0.15s",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}>
                      {desc}
                      <div style={{ position: "absolute", bottom: "-4px", left: "12px",
                        width: "8px", height: "8px", backgroundColor: "#0a0a0a",
                        transform: "rotate(45deg)" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: "10px", color: "#a3a3a3" }}>
            또는 아래에서 직접 골라보세요
          </p>
        </div>
      )}

      {/* 선택된 장르 — 단일 선택이므로 바로 제출됨, 이 영역은 표시 안 됨 */}

      {/* 대분류 — {TOTAL_GENRE_COUNT}개 장르 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "5px" }}>
        {GENRE_CATEGORIES.map((cat) => {
          const hasSelection = cat.options.some((opt) => selected.includes(opt));
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              style={{
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
            {GENRE_CATEGORIES.find((c) => c.id === expandedCat)?.options.map((opt) => {
              const isSelected = selected.includes(opt);
              const isRecommended = recommended.has(opt) && !isSelected;
              const desc = GENRE_DESCRIPTIONS[opt];
              return (
                <div key={opt} className="genre-tip-wrap" style={{ position: "relative", display: "inline-block" }}>
                  <button
                    onClick={() => toggleOption(opt)}
                    style={{
                      backgroundColor: isSelected ? "#0a0a0a" : "#ffffff",
                      color: isSelected ? "#ffffff" : isRecommended ? "#f97316" : "#737373",
                      borderColor: isSelected ? "#0a0a0a" : isRecommended ? "#f97316" : "#e5e5e5",
                      animation: isRecommended ? "pulse-recommend 2s ease-in-out infinite" : "none",
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:border-gray-400"
                  >
                    {opt}
                  </button>
                  {desc && (
                    <div className="genre-tip" style={{
                      position: "absolute", bottom: "calc(100% + 6px)", left: "0",
                      backgroundColor: "#0a0a0a", color: "#fff", borderRadius: "8px",
                      padding: "6px 10px", fontSize: "10px", lineHeight: "1.4",
                      whiteSpace: "nowrap", zIndex: 50, pointerEvents: "none",
                      opacity: 0, transition: "opacity 0.15s",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}>
                      {desc}
                      <div style={{ position: "absolute", bottom: "-4px", left: "12px",
                        width: "8px", height: "8px", backgroundColor: "#0a0a0a",
                        transform: "rotate(45deg)" }} />
                    </div>
                  )}
                </div>
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
          placeholder="직접 입력 (예: Future Garage, UK Bass)"
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
            animation: selected.length > 0 ? "pulse-genre 1.5s ease-in-out infinite" : "none",
          }}
          className="h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:opacity-80 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes pulse-genre {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes pulse-recommend {
          0%, 100% { opacity: 1; border-color: #f97316; }
          50% { opacity: 0.5; border-color: #fdba74; }
        }
        .genre-tip-wrap:hover .genre-tip {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
