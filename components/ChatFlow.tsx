"use client";

import { useState, useEffect, useRef } from "react";
import { STEPS } from "@/lib/steps";
import { ChatMessage, SunoInput } from "@/lib/types";
import { generateGuide } from "@/lib/guideEngine";
import ChatBubble from "./ChatBubble";
import TextInput from "./TextInput";
import SelectGrid from "./SelectGrid";
import VibeSelector from "./VibeSelector";
import VocalSelector from "./VocalSelector";
import GenreSelector from "./GenreSelector";
import InstrumentSelector from "./InstrumentSelector";
import TextureSelector from "./TextureSelector";
import { getGenrePreset, getTempoLabel } from "@/lib/genrePresets";
import ConfirmCard from "./ConfirmCard";
import ProgressBar from "./ProgressBar";

interface ChatFlowProps {
  onComplete: (inputs: SunoInput) => void;
  onInputChange: (inputs: Partial<SunoInput>) => void;
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
  vocal: "",
  reverb: "",
  language: "",
};

export default function ChatFlow({ onComplete, onInputChange }: ChatFlowProps) {
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

    // 원샷 모드 → 모든 설정 AI 추천으로 채우고 바로 완료
    if (stepId === "mode" && value === "oneshot") {
      addMessage("bot", "원샷 모드! AI가 모든 설정을 추천값으로 채울게요.");
      const oneshotInputs: SunoInput = {
        ...updated,
        genre: "",
        instruments: "",
        vibe: "",
        tempo: "",
        timeSignature: "",
        era: "",
        texture: "",
        vocal: "",
        reverb: "",
        language: "ko",
      };
      setInputs(oneshotInputs);
      onInputChange(oneshotInputs);
      setTimeout(() => {
        addMessage("bot", "Forensic Translation 시작...");
        setTimeout(() => onComplete(oneshotInputs), 800);
      }, 500);
      return;
    }

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
      {/* 이대로 생성하기 — 프로그레스바 위 (핵심 문장 입력 후 항상 표시) */}
      {inputs.oneLiner && step.type !== "confirm" && step.id !== "oneLiner" && (
        <div style={{ padding: "8px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <button
            onClick={() => {
              addMessage("bot", "현재 설정으로 바로 생성할게요!");
              setTimeout(() => onComplete(inputs), 500);
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

              {step.id === "vocal" && (
                <VocalSelector
                  onSubmit={(val) => handleAnswer(step.id, val)}
                  onSkip={() => handleSkip(step.id)}
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

              {step.type === "text" && step.id !== "vibe" && step.id !== "vocal" && step.id !== "instruments" && (
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
