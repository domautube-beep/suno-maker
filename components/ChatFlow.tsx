"use client";

import { useState, useEffect, useRef } from "react";
import { STEPS } from "@/lib/steps";
import { ChatMessage, SunoInput } from "@/lib/types";
import { generateGuide } from "@/lib/guideEngine";
import ChatBubble from "./ChatBubble";
import TextInput from "./TextInput";
import SelectGrid from "./SelectGrid";
import VibeSelector from "./VibeSelector";
import GenreSelector from "./GenreSelector";
import InstrumentSelector from "./InstrumentSelector";
import TextureSelector from "./TextureSelector";
import { getGenrePreset, getTempoLabel } from "@/lib/genrePresets";
import ConfirmCard from "./ConfirmCard";
import ProgressBar from "./ProgressBar";

// 핵심 문장 입력 + AI 확장 + 레퍼런스 추천
function OneLinerInput({ placeholder, onSubmit, onAutoFill, onQuickStart, apiKey, provider }: {
  placeholder?: string;
  onSubmit: (val: string) => void;
  onAutoFill?: (settings: Record<string, string>) => void;
  onQuickStart?: (oneLiner: string, settings: Record<string, string>) => void;
  apiKey?: string;
  provider?: string;
}) {
  const [value, setValue] = useState("");
  const [expanding, setExpanding] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{
    artist: string; title: string; reason: string;
    genre: string; tempo: string; era: string; texture: string; reverb: string; vibe: string;
  }> | null>(null);
  const [selectedRef, setSelectedRef] = useState(-1);

  const handleExpand = async () => {
    if (!value.trim() || !apiKey || !provider) return;
    if (!confirm("AI가 핵심 문장을 더 풍부하게 확장합니다. API 크레딧이 소량 소모됩니다. 계속할까요?")) return;

    setExpanding(true);
    try {
      const res = await fetch("/api/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `다음은 사용자가 작성한 곡의 핵심 문장입니다. 반드시 이 문장을 기반으로 확장하세요.

원문: ${value.trim()}

위 원문을 더 풍부하게 확장하세요:
- 원래 감정과 의미를 유지
- 장면, 상황, 감각을 구체적으로 추가
- 2~3문장으로 확장
- 곡의 방향을 설명하는 문장으로 (가사 아님)
- 한국어로
- 확장된 문장만 출력하세요. 설명, 인사, 질문 금지.`,
          apiKey,
          provider,
        }),
      });
      const data = await res.json();
      if (data.lyrics) {
        setValue(data.lyrics.trim());
      }
    } catch { /* 무시 */ }
    setExpanding(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 bg-white border border-border rounded-full px-4 py-2.5 text-sm text-text-primary placeholder-text-disabled focus:outline-none focus:border-foreground transition-colors"
          placeholder={placeholder || "이 노래가 뭔지 한 문장으로..."}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) { e.preventDefault(); onSubmit(value.trim()); } }}
        />
        <button
          onClick={() => value.trim() && onSubmit(value.trim())}
          disabled={!value.trim()}
          style={{ backgroundColor: value.trim() ? "#0a0a0a" : "#e5e5e5" }}
          className="h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:opacity-80 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 버튼 영역 */}
      {value.trim().length > 0 && apiKey && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {/* 30자 미만: 더 풍부하게 */}
          {value.trim().length < 30 && (
            <button onClick={handleExpand} disabled={expanding}
              style={{ padding: "8px 16px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600,
                backgroundColor: expanding ? "#e5e5e5" : "#fff7ed", color: expanding ? "#a3a3a3" : "#f97316",
                border: "1px solid rgba(249,115,22,0.3)", cursor: expanding ? "wait" : "pointer",
                display: "flex", alignItems: "center", gap: "6px" }}>
              {expanding ? "확장 중..." : "⚡ AI로 더 풍부하게"}
            </button>
          )}

          {/* 레퍼런스 추천 */}
          <button onClick={async () => {
            if (!value.trim()) return;
            if (!confirm("AI가 핵심 문장을 분석해서 참고할 곡과 설정을 추천합니다. API 크레딧이 소모됩니다.")) return;
            setAnalyzing(true);
            try {
              const res = await fetch("/api/lyrics", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: `너는 음악 프로듀서 겸 A&R 디렉터다. 아래 핵심 문장을 음악적으로 분석해라.

핵심 문장: "${value.trim()}"

=== 분석 프레임워크 ===
1. 감정 온도: 이 문장이 품고 있는 감정의 종류와 강도 (차가운/따뜻한/뜨거운, 내향/외향)
2. 에너지 곡선: 이 감정이 곡에서 어떤 에너지 흐름으로 표현되어야 하는가
3. 장르 엔진: 이 감정을 가장 잘 전달할 수 있는 장르는 무엇인가 (리듬, 악기, 편곡 관점)
4. 시대 물리학: 어떤 시대의 프로덕션 문법이 이 감정에 맞는가
5. 보컬 물리학: 이 감정을 전달하는 보컬의 물리적 특성 (밝기, 질감, 거리감)
6. 리듬 모션: 적절한 템포와 리듬 운동감

=== 레퍼런스 선정 기준 ===
단순히 "비슷한 주제"가 아니라:
- 이 감정을 "소리로 표현하는 방식"이 유사한 곡
- 프로덕션 접근법(편곡 밀도, 리듬 패턴, 공간감)이 참고할 만한 곡
- 가사의 "작법"(서사 구조, 수사법, 줄 길이)이 참고할 만한 곡

아래 JSON 배열로만 출력. 설명 없이. 3개 곡 각각 별도 설정:
[
  {
    "artist": "아티스트명",
    "title": "곡명",
    "reason": "이 곡을 참고하는 이유 1줄 (프로덕션/가사/감정 관점)",
    "genre": "장르 (Pop/K-Pop/Hip-Hop/Trap/R&B/Ballad/Lo-Fi/EDM/Rock/House/Deep House/Afro House/Techno/Ambient/Synthwave/Jazz/Blues/Cinematic/Folk/Acoustic 중)",
    "tempo": "very_slow/slow/mid_slow/mid/mid_fast/fast 중",
    "era": "80s/90s/2000s/2010s/2020s/vintage/futuristic 중",
    "texture": "lofi_warm/clean_digital/analog_vintage/raw_gritty/dreamy/spacious/dense/minimal 중",
    "reverb": "dry/room/hall/cathedral/lofi_filter/plate 중",
    "vibe": "느낌 2~3개 한국어 쉼표 구분"
  }
]
3개 곡은 서로 다른 장르/시대/질감으로 다양하게 추천해라. 같은 설정 3개가 나오면 안 됨.`, apiKey, provider }),
              });
              const data = await res.json();
              if (data.lyrics) {
                try {
                  const arrMatch = data.lyrics.match(/\[[\s\S]*\]/);
                  if (arrMatch) {
                    const parsed = JSON.parse(arrMatch[0]);
                    if (Array.isArray(parsed)) {
                      setRecommendations(parsed);
                      setSelectedRef(-1);
                    }
                  }
                } catch { /* 파싱 실패 */ }
              }
            } catch {}
            setAnalyzing(false);
          }} disabled={analyzing}
            style={{ padding: "8px 16px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600,
              backgroundColor: analyzing ? "#e5e5e5" : "#fff", color: analyzing ? "#a3a3a3" : "#0a0a0a",
              border: "1px solid #d4d4d4", cursor: analyzing ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: "6px" }}>
            {analyzing ? "분석 중..." : "🔍 레퍼런스 추천받기"}
          </button>
        </div>
      )}

      {/* 추천 결과 — 3개 카드 선택 */}
      {recommendations && (
        <div style={{ padding: "14px", backgroundColor: "#fafafa", borderRadius: "12px", border: "1px solid #e5e5e5" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", marginBottom: "10px" }}>AI 추천 레퍼런스 — 하나를 선택하세요</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
            {recommendations.map((rec, idx) => (
              <button key={idx} onClick={() => setSelectedRef(idx)} style={{
                padding: "12px", borderRadius: "10px", textAlign: "left",
                backgroundColor: selectedRef === idx ? "#0a0a0a" : "#fff",
                color: selectedRef === idx ? "#fff" : "#0a0a0a",
                border: selectedRef === idx ? "2px solid #f97316" : "1px solid #e5e5e5",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <p style={{ fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  {rec.artist} - {rec.title}
                </p>
                <p style={{ fontSize: "10px", color: selectedRef === idx ? "#a3a3a3" : "#737373", marginBottom: "6px" }}>
                  {rec.reason}
                </p>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {[rec.genre, rec.era, rec.vibe, rec.texture].filter(Boolean).map((tag, i) => (
                    <span key={i} style={{
                      padding: "2px 8px", borderRadius: "9999px", fontSize: "9px",
                      backgroundColor: selectedRef === idx ? "#333" : "#f5f5f5",
                      color: selectedRef === idx ? "#d4d4d4" : "#737373",
                    }}>{tag}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => {
              if (selectedRef < 0) { alert("레퍼런스를 선택해주세요."); return; }
              const rec = recommendations[selectedRef];
              const settings = { genre: rec.genre, tempo: rec.tempo, era: rec.era, texture: rec.texture, reverb: rec.reverb, vibe: rec.vibe };
              onAutoFill?.(settings);
              onQuickStart?.(value.trim(), settings);
            }} disabled={selectedRef < 0} style={{
              flex: 1, padding: "10px", borderRadius: "10px",
              backgroundColor: selectedRef >= 0 ? "#f97316" : "#e5e5e5",
              color: selectedRef >= 0 ? "#fff" : "#a3a3a3",
              fontSize: "12px", fontWeight: 600, border: "none",
              cursor: selectedRef >= 0 ? "pointer" : "not-allowed",
            }}>
              선택한 레퍼런스로 시작
            </button>
            <button onClick={() => {
              setRecommendations(null);
              onSubmit(value.trim());
            }} style={{ padding: "10px 16px", borderRadius: "10px", border: "1px solid #e5e5e5",
              backgroundColor: "#fff", fontSize: "12px", color: "#737373", cursor: "pointer" }}>
              직접 설정
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ChatFlowProps {
  onComplete: (inputs: SunoInput) => void;
  onInputChange: (inputs: Partial<SunoInput>) => void;
  onAutoFill?: (settings: Record<string, string>) => void;
  apiKey?: string;
  provider?: string;
}

const DEFAULT_INPUT: SunoInput = {
  oneLiner: "",
  vibe: "",
  genre: "",
  instruments: "",
  tempo: "",
  timeSignature: "",
  era: "",
  texture: "",
  reverb: "",
  language: "",
};

export default function ChatFlow({ onComplete, onInputChange, onAutoFill, apiKey, provider }: ChatFlowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState<SunoInput>(DEFAULT_INPUT);
  const [showInput, setShowInput] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addMessage = (role: "bot" | "user", content: string, tooltip?: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, role, content, tooltip, timestamp: Date.now() },
    ]);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      addMessage("bot", STEPS[0].question, STEPS[0].tooltip);
      setShowInput(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 다음 스텝 + 가이드 메시지
  const advanceStep = (stepIndex: number, stepId: string, value: string) => {
    const nextStep = stepIndex + 1;
    if (nextStep >= STEPS.length) return;

    setCurrentStep(nextStep);
    setShowInput(false);

    const next = STEPS[nextStep];

    // 가이드 메시지 생성
    // 전체 inputs 맥락을 전달해서 다음 스텝 추천
    const latestInputs = { ...inputs, [stepId]: value };
    const guide = generateGuide(stepId, value, latestInputs);

    if (next.type === "confirm") {
      if (guide) {
        setTimeout(() => addMessage("bot", guide), 300);
        setTimeout(() => setShowInput(true), 700);
      } else {
        setTimeout(() => setShowInput(true), 300);
      }
      return;
    }

    if (guide) {
      // 가이드 → 다음 질문
      setTimeout(() => addMessage("bot", guide), 300);
      setTimeout(() => {
        addMessage("bot", next.question, next.tooltip);
        setShowInput(true);
      }, 900);
    } else {
      setTimeout(() => {
        addMessage("bot", next.question, next.tooltip);
        setShowInput(true);
      }, 400);
    }
  };

  const handleAnswer = (stepId: string, value: string) => {
    const step = STEPS.find((s) => s.id === stepId);
    if (!step) return;

    if (value) {
      const opt = step.options?.find((o) => o.value === value);
      addMessage("user", opt?.label || value);
    } else {
      addMessage("user", step.skipLabel || "맡길게");
    }

    const updated = { ...inputs, [stepId]: value };
    setInputs(updated);
    onInputChange(updated);

    advanceStep(currentStep, stepId, value);
  };

  const handleSkip = (stepId: string) => {
    const step = STEPS.find((s) => s.id === stepId);
    addMessage("user", step?.skipLabel || "맡길게");
    const updated = { ...inputs, [stepId]: "" };
    setInputs(updated);
    onInputChange(updated);
    advanceStep(currentStep, stepId, "");
  };

  const handleStepClick = (targetIndex: number) => {
    // 뒤로 가기 — 해당 스텝 다시 선택
    if (targetIndex < currentStep) {
      addMessage("bot", `${STEPS[targetIndex].question}`, STEPS[targetIndex].tooltip);
      setCurrentStep(targetIndex);
      setShowInput(true);
      return;
    }
    // 앞으로 점프 — 중간 스텝 스킵, 해당 스텝으로 바로 이동
    if (targetIndex > currentStep) {
      // 중간 스텝들은 빈 값으로 채움
      const updated = { ...inputs };
      for (let i = currentStep; i < targetIndex; i++) {
        const s = STEPS[i];
        if (s.id !== "confirm" && s.id !== "mode") {
          (updated as Record<string, string>)[s.id] = (updated as Record<string, string>)[s.id] || "";
        }
      }
      setInputs(updated);
      onInputChange(updated);
      addMessage("bot", `${STEPS[targetIndex].question}`, STEPS[targetIndex].tooltip);
      setCurrentStep(targetIndex);
      setShowInput(true);
    }
  };

  const handleConfirm = () => {
    addMessage("bot", "Forensic Translation 시작...");
    setTimeout(() => onComplete(inputs), 800);
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentStep(0);
    setInputs(DEFAULT_INPUT);
    setShowInput(false);
    onInputChange(DEFAULT_INPUT);
    setTimeout(() => {
      addMessage("bot", STEPS[0].question, STEPS[0].tooltip);
      setShowInput(true);
    }, 300);
  };

  const step = STEPS[currentStep];

  // 실제로 값이 입력된 스텝 ID 집합 (프로그레스바에 전달)
  const completedSteps = new Set<string>();
  for (const [key, val] of Object.entries(inputs)) {
    if (val && typeof val === "string" && val.trim()) {
      completedSteps.add(key);
    }
  }

  // select 타입에서 skipLabel 있으면 스킵 가능
  const canSkipSelect = step.type === "select" && !!step.skipLabel;

  return (
    <div className="flex flex-col h-full">
      {/* 이대로 생성하기 — 프로그레스바 위 (뭐든 1개 이상 입력 후 표시) */}
      {completedSteps.size > 0 && step.type !== "confirm" && (
        <div style={{ padding: "8px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <button
            onClick={() => {
              // Style 탭(confirm)으로 이동 — 브리핑 보여주고 최종 생성
              const confirmIndex = STEPS.findIndex((s) => s.type === "confirm");
              if (confirmIndex >= 0) {
                addMessage("bot", "설정을 정리했어요. 확인하고 생성해주세요.");
                setCurrentStep(confirmIndex);
                setShowInput(true);
              }
            }}
            style={{
              color: "#f97316",
              fontSize: "12px",
              fontWeight: 600,
              border: "1.5px solid #f97316",
              borderRadius: "9999px",
              padding: "8px 0",
              width: "100%",
            }}
            className="text-center hover:bg-accent-light transition-colors"
          >
            나머지는 AI에게 맡기고, 이대로 생성하기 →
          </button>
        </div>
      )}

      <ProgressBar activeIndex={currentStep} onStepClick={handleStepClick} completedSteps={completedSteps} />

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4 pb-8">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} role={msg.role} content={msg.content} tooltip={msg.tooltip} />
          ))}

          {showInput && (
            <div className="pt-1 space-y-2">
              {step.id === "genre" && (
                <GenreSelector
                  onSubmit={(val) => handleAnswer(step.id, val)}
                  onSkip={() => handleSkip(step.id)}
                  oneLiner={inputs.oneLiner}
                />
              )}

              {step.id === "instruments" && (
                <InstrumentSelector
                  onSubmit={(val) => handleAnswer(step.id, val)}
                  onSkip={() => handleSkip(step.id)}
                  genre={inputs.genre}
                />
              )}

              {step.id === "vibe" && (
                <VibeSelector
                  onSubmit={(val) => handleAnswer(step.id, val)}
                  onSkip={() => handleSkip(step.id)}
                  oneLiner={inputs.oneLiner}
                  genre={inputs.genre}
                />
              )}

              {step.type === "text" && step.id === "oneLiner" && (
                <OneLinerInput
                  placeholder={step.placeholder}
                  onSubmit={(val) => handleAnswer(step.id, val)}
                  onAutoFill={(settings) => {
                    const filled = { ...inputs, ...settings };
                    setInputs(filled as SunoInput);
                    onInputChange(filled);
                    onAutoFill?.(settings);
                  }}
                  onQuickStart={(oneLiner, settings) => {
                    // Chat Flow 스킵 → 바로 result phase
                    const filled = { ...DEFAULT_INPUT, oneLiner, ...settings } as SunoInput;
                    setInputs(filled);
                    onInputChange(filled);
                    onComplete(filled);
                  }}
                  apiKey={apiKey}
                  provider={provider}
                />
              )}

              {step.type === "text" && step.id !== "vibe" && step.id !== "instruments" && step.id !== "oneLiner" && (
                <TextInput
                  placeholder={step.placeholder}
                  required={step.required}
                  skipLabel={!step.required ? step.skipLabel : undefined}
                  onSubmit={(val) => handleAnswer(step.id, val)}
                  onSkip={!step.required ? () => handleSkip(step.id) : undefined}
                />
              )}

              {step.id === "texture" && (
                <TextureSelector
                  onSubmit={(val) => handleAnswer(step.id, val)}
                  onSkip={() => handleSkip(step.id)}
                  genre={inputs.genre}
                />
              )}

              {step.type === "select" && step.options && step.id !== "genre" && step.id !== "texture" && (
                <div className="space-y-2">
                  {/* 장르 프리셋 기반 추천값 표시 */}
                  {(() => {
                    const preset = inputs.genre ? getGenrePreset(inputs.genre) : null;
                    if (!preset) return null;

                    // 현재 스텝에 맞는 추천값 찾기
                    const recMap: Record<string, { value: string; label: string }> = {
                      tempo: { value: preset.tempo, label: getTempoLabel(preset.tempo) },
                      timeSignature: { value: preset.timeSignature, label: preset.timeSignature },
                      era: { value: preset.era, label: preset.era },
                      reverb: { value: preset.reverb, label: preset.reverb },
                    };
                    const rec = recMap[step.id];
                    if (!rec) return null;

                    const matchingOpt = step.options?.find((o) => o.value === rec.value);
                    if (!matchingOpt) return null;

                    return (
                      <div className="space-y-1.5">
                        <p style={{ fontSize: "11px", color: "#f97316", fontWeight: 600 }}>추천</p>
                        <button
                          onClick={() => handleAnswer(step.id, matchingOpt.value)}
                          style={{
                            backgroundColor: "#fff7ed",
                            color: "#f97316",
                            borderColor: "#f97316",
                            animation: "pulse-rec 2s ease-in-out infinite",
                          }}
                          className="px-4 py-2 rounded-full text-xs font-medium border transition-all"
                        >
                          {matchingOpt.label}
                        </button>
                        <p style={{ fontSize: "10px", color: "#a3a3a3" }}>또는 아래에서 직접 골라보세요</p>
                        <style>{`@keyframes pulse-rec { 0%,100%{opacity:1;border-color:#f97316} 50%{opacity:0.5;border-color:#fdba74} }`}</style>
                      </div>
                    );
                  })()}
                  <SelectGrid
                    options={step.options}
                    onSelect={(val) => handleAnswer(step.id, val)}
                  />
                  {canSkipSelect && (
                    <button
                      onClick={() => handleSkip(step.id)}
                      style={{ color: "#a3a3a3", fontSize: "12px" }}
                      className="w-full text-center py-2 hover:text-text-primary transition-colors"
                    >
                      {step.skipLabel}
                    </button>
                  )}
                </div>
              )}

              {step.type === "confirm" && (
                <ConfirmCard
                  inputs={inputs}
                  onConfirm={handleConfirm}
                  onReset={handleReset}
                  onEditStep={(stepId) => {
                    const idx = STEPS.findIndex((s) => s.id === stepId);
                    if (idx >= 0) {
                      addMessage("bot", `${STEPS[idx].question}`, STEPS[idx].tooltip);
                      setCurrentStep(idx);
                      setShowInput(true);
                    }
                  }}
                />
              )}

              {/* (이대로 생성하기는 프로그레스바 위로 이동) */}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* 하단 고정 — 추가 대화 입력 */}
      <div style={{ borderTop: "1px solid #e5e5e5", padding: "12px 16px", backgroundColor: "#fff" }}>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            className="flex-1 bg-white border border-border rounded-full px-4 py-2.5 text-sm text-text-primary placeholder-text-disabled focus:outline-none focus:border-foreground transition-colors"
            placeholder="추가 요청사항을 자유롭게 입력하세요..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                const val = (e.target as HTMLInputElement).value.trim();
                addMessage("user", val);
                addMessage("bot", `"${val}" — 반영할게요. 프롬프트 생성 시 참고됩니다.`);
                // extra 필드에 누적
                setInputs((prev) => ({ ...prev, extra: (prev as unknown as Record<string, string>).extra ? `${(prev as unknown as Record<string, string>).extra}, ${val}` : val }));
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
              if (input.value.trim()) {
                const val = input.value.trim();
                addMessage("user", val);
                addMessage("bot", `"${val}" — 반영할게요.`);
                setInputs((prev) => ({ ...prev, extra: (prev as unknown as Record<string, string>).extra ? `${(prev as unknown as Record<string, string>).extra}, ${val}` : val }));
                input.value = "";
              }
            }}
            style={{ backgroundColor: "#0a0a0a" }}
            className="h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:opacity-80 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
