"use client";

import { useState, useRef, useEffect } from "react";
import { PreviewSection, SunoInput } from "@/lib/types";
import { generatePrediction } from "@/lib/selectionExplainer";
import { GENRE_CATEGORIES } from "@/lib/genreData";

interface LivePreviewProps {
  sections: PreviewSection[];
  onSectionUpdate?: (sectionId: string, newEnglish: string) => void;
  generating?: boolean;
  isReady?: boolean;
  currentInputs?: Partial<SunoInput>; // 선택 요약용
}

// 섹션별 편집 UI 타입
type SelectorOption = { label: string; value: string };
type SelectorCategory = { label: string; options: SelectorOption[]; multiSelect?: boolean };
type SectionConfig = { categories: SelectorCategory[]; singleSelect?: boolean } | null;

const SECTION_SELECTOR: Record<string, SectionConfig> = {
  identity: null, // 직접 입력

  // 장르 — genreData.ts에서 동적 생성 (GenreSelector와 동일 데이터)
  genre: {
    singleSelect: true,
    categories: GENRE_CATEGORIES.map((cat) => ({
      label: cat.label,
      options: cat.options.map((opt) => ({ label: opt, value: opt })),
    })),
  },

  // 시대
  era: {
    singleSelect: true,
    categories: [
      { label: "시대", options: [
        { label: "80년대", value: "80s" },
        { label: "90년대", value: "90s" },
        { label: "2000년대", value: "2000s" },
        { label: "2010년대", value: "2010s" },
        { label: "2020년대", value: "2020s" },
        { label: "미래적", value: "futuristic" },
        { label: "빈티지", value: "vintage" },
      ]},
    ],
  },

  // 텍스처 (질감) — 대분류+소분류
  "texture-step": {
    singleSelect: true,
    categories: [
      { label: "온도감", options: [
        { label: "Lo-Fi 따뜻함", value: "lofi_warm" },
        { label: "깔끔한 디지털", value: "clean_digital" },
        { label: "아날로그 빈티지", value: "analog_vintage" },
      ]},
      { label: "밀도", options: [
        { label: "미니멀", value: "minimal" },
        { label: "풍성한 레이어", value: "dense" },
      ]},
      { label: "표면감", options: [
        { label: "거친 질감", value: "raw_gritty" },
        { label: "몽환적", value: "dreamy" },
        { label: "넓은 공간감", value: "spacious" },
      ]},
    ],
  },

  // 리버브 — 대분류+소분류
  reverb: {
    singleSelect: true,
    categories: [
      { label: "가까운", options: [
        { label: "Dry (가까운)", value: "dry" },
        { label: "Room", value: "room" },
      ]},
      { label: "넓은", options: [
        { label: "Hall (넓은 홀)", value: "hall" },
        { label: "Cathedral (대성당)", value: "cathedral" },
      ]},
      { label: "캐릭터", options: [
        { label: "Lo-Fi 필터", value: "lofi_filter" },
        { label: "Plate (스튜디오)", value: "plate" },
      ]},
    ],
  },

  // 느낌/분위기 (vibe) — VibeSelector와 동일 데이터
  texture: {
    categories: [
      { label: "분위기", multiSelect: true, options: [
        "어두운", "밝은", "몽환적", "감성적", "긴장감", "편안한", "우울한", "희망적", "신비로운", "섹시한", "쓸쓸한", "유쾌한",
      ].map((v) => ({ label: v, value: v })) },
      { label: "에너지", multiSelect: true, options: [
        "에너지틱", "부드러운", "웅장한", "차분한", "폭발적", "나른한", "점진적", "격렬한", "고요한", "압도적",
      ].map((v) => ({ label: v, value: v })) },
      { label: "질감", multiSelect: true, options: [
        "따뜻한", "차가운", "거친", "매끈한", "레트로", "미래적", "아날로그", "디지털", "촉촉한", "건조한", "무거운", "가벼운",
      ].map((v) => ({ label: v, value: v })) },
      { label: "특성", multiSelect: true, options: [
        "중독적", "세련된", "실험적", "미니멀", "복잡한", "공간감", "친밀한", "거리감", "그루비", "서정적", "파괴적", "몰입감",
      ].map((v) => ({ label: v, value: v })) },
    ],
  },

  // 언어
  "lyrics-config": {
    singleSelect: true,
    categories: [
      { label: "언어", options: [
        { label: "한국어", value: "ko" },
        { label: "English", value: "en" },
        { label: "日本語", value: "ja" },
        { label: "한국어+English", value: "mixed" },
      ]},
    ],
  },

  // 구조
  structure: {
    singleSelect: true,
    categories: [
      { label: "구조", options: [
        { label: "기본 (V-H-C-V-B-H-C-O)", value: "Verse 1 → Hook → Chorus → Verse 2 → Bridge → Hook → Chorus → Outro" },
        { label: "짧게 (V-C-V-C-O)", value: "Verse 1 → Chorus → Verse 2 → Chorus → Outro" },
        { label: "랩 (V-V-H-C-B-C)", value: "Verse 1 → Verse 2 → Hook → Chorus → Bridge → Chorus" },
        { label: "발라드 (V-C-V-C-B-C)", value: "Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Final Chorus" },
      ]},
    ],
  },

  engine: null,
};

export default function LivePreview({ sections, onSectionUpdate, generating, isReady = false, currentInputs }: LivePreviewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 팝오버 외부 클릭 감지
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setEditingId(null);
        setExpandedCat(null);
        setSelectedTags([]);
      }
    };
    if (editingId) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editingId]);

  const handleStartEdit = (section: PreviewSection) => {
    setEditingId(section.id);
    setEditValue(section.english);
    setExpandedCat(null);

    // multiSelect 섹션: 기존 선택값을 selectedTags에 복원
    const config = SECTION_SELECTOR[section.id];
    if (config && !config.singleSelect && section.english) {
      const existingValues = section.english.split(",").map((v) => v.trim()).filter(Boolean);
      // config의 options에 있는 값만 복원 (직접 입력 등 무효값 제외)
      const allValidValues = new Set(config.categories.flatMap((c) => c.options.map((o) => o.value)));
      const validTags = existingValues.filter((v) => allValidValues.has(v));
      setSelectedTags(validTags);
    } else {
      setSelectedTags([]);
    }
  };

  const handleSave = (sectionId: string, value?: string) => {
    const finalValue = value || (selectedTags.length > 0 ? selectedTags.join(", ") : editValue);
    onSectionUpdate?.(sectionId, finalValue);
    setEditingId(null);
    setExpandedCat(null);
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const selectorConfig = editingId ? SECTION_SELECTOR[editingId] : null;

  if (sections.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2 px-6">
          <div className="text-2xl text-text-disabled">{"{ }"}</div>
          <p className="text-xs text-text-muted">대화가 진행되면 프롬프트가 생성됩니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Live Preview</h2>

        {/* 선택 요약 — 사용자가 고른 항목의 의미 설명 */}
        {currentInputs && (() => {
          const lines = generatePrediction(currentInputs);
          if (lines.length === 0) return null;
          return (
            <div
              style={{
                backgroundColor: "#fafafa",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "4px",
              }}
            >
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#f97316", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                선택 요약
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {lines.map((line) => (
                  <div key={line.title}>
                    <p style={{ fontSize: "10px", fontWeight: 600, color: "#0a0a0a", marginBottom: "2px" }}>{line.title}</p>
                    <p style={{ fontSize: "11px", color: "#525252", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                      {line.prediction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {sections.map((section) => {
          const isHovered = hoveredId === section.id;
          const isEditing = editingId === section.id;
          const canEdit = SECTION_SELECTOR[section.id] !== undefined;

          return (
            <div
              key={section.id}
              className="relative"
              onMouseEnter={() => setHoveredId(section.id)}
              onMouseLeave={() => !isEditing && setHoveredId(null)}
            >
              {/* 카드 */}
              <div
                className={`border rounded-xl overflow-hidden transition-all cursor-default ${
                  isEditing ? "border-accent" : isHovered && canEdit ? "border-border-strong" : "border-border"
                }`}
                onClick={() => canEdit && !isEditing && handleStartEdit(section)}
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                    {section.label}
                  </span>
                  {isHovered && canEdit && !isEditing && (
                    <span className="text-[10px] text-text-muted">클릭하여 수정</span>
                  )}
                </div>
                <div className="px-4 py-3 border-b border-border/50">
                  <pre className="text-xs text-text-primary font-mono whitespace-pre-wrap leading-relaxed">
                    {section.english}
                  </pre>
                </div>
                <div className="px-4 py-2.5 bg-surface">
                  <p className="text-[11px] text-text-muted leading-relaxed">{section.korean}</p>
                </div>
              </div>

              {/* 수정 팝오버 (툴팁 스타일) */}
              {isEditing && (
                <div
                  ref={popoverRef}
                  className="absolute left-0 right-0 top-full mt-2 z-50 animate-fadeIn"
                >
                  <div
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "16px",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                      padding: "16px",
                    }}
                  >
                    {/* 화살표 */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-6px",
                        left: "24px",
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRight: "none",
                        borderBottom: "none",
                        transform: "rotate(45deg)",
                      }}
                    />

                    {/* 선택지가 있는 섹션 */}
                    {selectorConfig && (
                      <div className="space-y-3">
                        {/* 선택된 태그 */}
                        {selectedTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {selectedTags.map((tag) => {
                              // value에서 label 찾기
                              let displayLabel = tag.split(",")[0];
                              for (const cat of selectorConfig.categories) {
                                const found = cat.options.find((o) => o.value === tag);
                                if (found) { displayLabel = found.label; break; }
                              }
                              return (
                                <button
                                  key={tag}
                                  onClick={() => toggleTag(tag)}
                                  style={{ backgroundColor: "#fff7ed", color: "#f97316", borderColor: "rgba(249,115,22,0.3)" }}
                                  className="px-2 py-1 rounded-full text-[10px] font-medium border flex items-center gap-1"
                                >
                                  {displayLabel}
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* 대분류 탭 */}
                        <div style={{ display: "flex", gap: "4px" }}>
                          {selectorConfig.categories.map((cat) => {
                            const sectionValues = section.english.split(",").map((v) => v.trim());
                            const hasSel = cat.options.some((o) => selectedTags.includes(o.value) || sectionValues.includes(o.value));
                            return (
                              <button
                                key={cat.label}
                                onClick={() => setExpandedCat(expandedCat === cat.label ? null : cat.label)}
                                style={{
                                  flex: 1,
                                  backgroundColor: expandedCat === cat.label ? "#0a0a0a" : "#fafafa",
                                  color: expandedCat === cat.label ? "#fff" : hasSel ? "#f97316" : "#525252",
                                  borderColor: expandedCat === cat.label ? "#0a0a0a" : "#e5e5e5",
                                }}
                                className="py-1.5 rounded-full text-[10px] font-medium border transition-all"
                              >
                                {hasSel ? `${cat.label} ✓` : cat.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* 소분류 */}
                        {expandedCat && (
                          <div style={{ paddingLeft: "12px", borderLeft: "2px solid #e5e5e5" }} className="flex flex-wrap gap-1.5">
                            {selectorConfig.categories
                              .find((c) => c.label === expandedCat)
                              ?.options.map((opt) => {
                                const currentValues = section.english.split(",").map((v) => v.trim());
                                const isSelected = selectedTags.includes(opt.value) || currentValues.includes(opt.value);
                                return (
                                  <button
                                    key={opt.value}
                                    onClick={() => {
                                      if (selectorConfig.singleSelect) {
                                        handleSave(section.id, opt.value);
                                      } else {
                                        toggleTag(opt.value);
                                      }
                                    }}
                                    style={{
                                      backgroundColor: isSelected ? "#0a0a0a" : "#fff",
                                      color: isSelected ? "#fff" : "#737373",
                                      borderColor: isSelected ? "#0a0a0a" : "#e5e5e5",
                                    }}
                                    className="px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all"
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                          </div>
                        )}

                        {/* 적용 버튼 */}
                        {selectedTags.length > 0 && (
                          <button
                            onClick={() => handleSave(section.id, selectedTags.join(", "))}
                            style={{ backgroundColor: "#f97316", animation: "pulse-submit 1.5s ease-in-out infinite" }}
                            className="w-full py-2 rounded-lg text-xs font-semibold text-white"
                          >
                            적용
                          </button>
                        )}

                        <style>{`
                          @keyframes pulse-submit {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.7; }
                          }
                        `}</style>
                      </div>
                    )}

                    {/* 직접 입력 섹션 */}
                    {!selectorConfig && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          className="w-full bg-white border border-border rounded-lg px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave(section.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          placeholder="새로 작성..."
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(section.id)}
                            style={{ backgroundColor: "#0a0a0a" }}
                            className="px-4 py-2 rounded-lg text-xs font-medium text-white"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 rounded-lg text-xs text-text-muted hover:text-text-primary"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 안내 */}
      {!isReady && (
        <div className="p-4 border-t border-border">
          <p style={{ color: "#a3a3a3", fontSize: "11px", textAlign: "center" }}>
            프롬프트가 완성되면 여기서 수정할 수 있어요
          </p>
        </div>
      )}
      {isReady && (
        <div className="p-4 border-t border-border">
          <p style={{ color: "#a3a3a3", fontSize: "11px", textAlign: "center" }}>
            섹션을 클릭하면 수정이 즉시 반영됩니다
          </p>
        </div>
      )}
    </div>
  );
}
