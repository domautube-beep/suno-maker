"use client";

import { useState, useRef, useEffect } from "react";
import { PreviewSection, SunoInput } from "@/lib/types";
import { generatePrediction } from "@/lib/selectionExplainer";

interface LivePreviewProps {
  sections: PreviewSection[];
  onSectionUpdate?: (sectionId: string, newEnglish: string) => void;
  onAutoGenerate?: () => void;
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

  // 장르 선택 섹션 (단일 선택)
  genre: {
    singleSelect: true,
    categories: [
      { label: "장르", options: [
        { label: "K-Pop", value: "synth-driven, layered hooks, 4/4 pulse" },
        { label: "R&B", value: "groove-locked, laid-back pocket, neo-soul influence" },
        { label: "힙합", value: "808 bass, trap hi-hats, boom-bap elements" },
        { label: "발라드", value: "piano-driven, emotional build, orchestral swells" },
        { label: "EDM", value: "build-drop structure, synthesizer lead, four-on-the-floor" },
        { label: "Lo-Fi", value: "tape saturation, dusty samples, jazzy chords" },
        { label: "록", value: "electric guitar driven, drum kit energy, distorted edge" },
        { label: "트로트", value: "melodic hook density, bright vocal presence, traditional bounce" },
        { label: "재즈", value: "complex chord voicing, swing groove, improvisation space" },
        { label: "시네마틱", value: "orchestral layers, epic scale, dramatic dynamics" },
        { label: "팝", value: "clean production, catchy hooks, radio-ready mix" },
        { label: "인디", value: "unique texture, experimental arrangement, lo-fi character" },
      ]},
    ],
  },

  // 시대 선택 섹션 (단일 선택)
  era: {
    singleSelect: true,
    categories: [
      { label: "시대", options: [
        { label: "80년대", value: "80s synth character, gated reverb, drum machine" },
        { label: "90년대", value: "90s warm pads, groovy bass, natural drums" },
        { label: "2000년대", value: "Y2K glitch, pop-hybrid, digital sheen" },
        { label: "2010년대", value: "modern clean production, EDM influence, polished mix" },
        { label: "2020년대", value: "hyperpop elements, trendy mixing, genre-fluid" },
        { label: "미래적", value: "experimental synthesis, unconventional structure" },
        { label: "빈티지", value: "analog warmth, vinyl character, classic recording" },
      ]},
    ],
  },

  // 텍스처 선택 섹션 — id는 "texture-step"으로 vibe의 texture와 구분
  "texture-step": {
    singleSelect: true,
    categories: [
      { label: "질감", options: [
        { label: "Lo-Fi 따뜻함", value: "tape saturation, vinyl crackle, warm compression" },
        { label: "깔끔한 디지털", value: "precision mixing, clean synthesis, modern clarity" },
        { label: "아날로그 빈티지", value: "analog warmth, soft compression, vintage color" },
        { label: "거친 질감", value: "raw distortion, aggressive attack, unpolished edge" },
        { label: "몽환적", value: "wide reverb, phase effects, ethereal layers" },
        { label: "넓은 공간감", value: "wide stereo, ambient layers, spatial depth" },
        { label: "풍성한 레이어", value: "layered stacking, full arrangement, wall of sound" },
        { label: "미니멀", value: "sparse elements, space as instrument, restraint" },
      ]},
    ],
  },

  // 리버브 선택 섹션 (단일 선택)
  reverb: {
    singleSelect: true,
    categories: [
      { label: "리버브", options: [
        { label: "Dry (가까운)", value: "close-mic, intimate distance, minimal reverb" },
        { label: "Room", value: "medium room, balanced wet/dry, natural space" },
        { label: "Hall (넓은 홀)", value: "large hall, wide reverb, distant presence" },
        { label: "Cathedral (대성당)", value: "cathedral reverb, massive tail, sacred space" },
        { label: "Lo-Fi 필터", value: "lo-fi filtered, tape warmth, vintage compression" },
        { label: "Plate (스튜디오)", value: "plate reverb, vintage warm, classic studio" },
      ]},
    ],
  },

  texture: {
    categories: [
      { label: "분위기", multiSelect: true, options: [
        { label: "어두운", value: "dark minor chords, shadowy reverb" },
        { label: "몽환적", value: "dreamy pads, ethereal atmosphere" },
        { label: "밝은", value: "bright major progression, airy high-end" },
        { label: "감성적", value: "emotional dynamics, gentle swells" },
        { label: "긴장감", value: "tension building, suspenseful progression" },
      ]},
      { label: "에너지", multiSelect: true, options: [
        { label: "에너지틱", value: "driving rhythm, punchy drums, high energy" },
        { label: "편안한", value: "relaxed groove, gentle rhythm" },
        { label: "웅장한", value: "epic orchestral swells, cinematic scale" },
        { label: "미니멀", value: "stripped back, minimal energy" },
      ]},
      { label: "질감", multiSelect: true, options: [
        { label: "따뜻한", value: "warm analog tones, soft saturation" },
        { label: "차가운", value: "cold digital textures, metallic sheen" },
        { label: "거친", value: "raw distortion, gritty texture" },
        { label: "레트로", value: "vintage tape warmth, retro character" },
        { label: "Lo-Fi", value: "lo-fi warmth, vinyl crackle" },
      ]},
    ],
  },
  vocal: {
    categories: [
      { label: "타입", options: [
        { label: "남성 저음", value: "male, low baritone, deep chest resonance" },
        { label: "남성 중음", value: "male, mid-range tenor, warm natural presence" },
        { label: "남성 고음", value: "male, high tenor, bright falsetto capable" },
        { label: "여성 저음", value: "female, low alto, rich warm depth" },
        { label: "여성 중음", value: "female, mid-range mezzo, clear and balanced" },
        { label: "여성 고음", value: "female, high soprano, airy and light" },
      ]},
      { label: "음색", options: [
        { label: "허스키", value: "husky grain, rough warmth, textured edge" },
        { label: "매끈한", value: "smooth silk, clean resonance, polished tone" },
        { label: "공기감", value: "airy breathy, whisper-close, soft presence" },
        { label: "파워풀", value: "powerful chest, full projection, bold resonance" },
        { label: "따뜻한", value: "warm natural, soft grain, intimate tone" },
        { label: "소울풀", value: "soulful richness, gospel-influenced, deep emotion" },
      ]},
      { label: "딜리버리", options: [
        { label: "대화체", value: "conversational intimacy, natural phrasing" },
        { label: "감정폭발", value: "emotional outburst, crescendo peaks" },
        { label: "나른한", value: "laid-back lazy, half-whisper, effortless cool" },
        { label: "리드미컬", value: "rhythmic precision, groove-locked" },
        { label: "랩", value: "rap flow, sharp articulation, punchline delivery" },
        { label: "속삭임", value: "whisper singing, ASMR-close, breath-heavy" },
      ]},
      { label: "공간감", options: [
        { label: "Dry", value: "close-mic dry, intimate distance" },
        { label: "Room", value: "medium room, balanced wet/dry" },
        { label: "Hall", value: "large hall, wide reverb, distant" },
        { label: "Lo-Fi", value: "lo-fi filtered, tape warmth" },
      ]},
    ],
  },
  "lyrics-config": {
    singleSelect: true,
    categories: [
      { label: "언어", options: [
        { label: "한국어", value: "Korean lyrics, 2-5 eojeol phrasing, vowel-chain hooks" },
        { label: "English", value: "English lyrics, natural stress pattern, singable phrases" },
        { label: "日本語", value: "Japanese lyrics, mora-based phrasing, vowel-open hooks" },
        { label: "한국어+English", value: "Korean + English mixed lyrics, bilingual hook design" },
      ]},
    ],
  },
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

export default function LivePreview({ sections, onSectionUpdate, onAutoGenerate, generating, isReady = false, currentInputs }: LivePreviewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false); // 프리뷰에서 수정이 발생했는지
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
    setSelectedTags([]);
  };

  const handleSave = (sectionId: string, value?: string) => {
    const finalValue = value || (selectedTags.length > 0 ? selectedTags.join(", ") : editValue);
    onSectionUpdate?.(sectionId, finalValue);
    setHasChanges(true);
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
                            const hasSel = cat.options.some((o) => selectedTags.includes(o.value) || section.english.includes(o.value));
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
                                const isSelected = selectedTags.includes(opt.value) || section.english === opt.value;
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
