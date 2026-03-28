"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AppPhase, SunoInput, SunoOutput, PreviewSection } from "@/lib/types";
import { generatePreview } from "@/lib/previewEngine";
import { generateDemo } from "@/lib/demoGenerator";
import Header from "@/components/Header";
import ChatFlow from "@/components/ChatFlow";
import LivePreview from "@/components/LivePreview";
import OutputPanel from "@/components/OutputPanel";

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("chat");
  const [previewSections, setPreviewSections] = useState<PreviewSection[]>([]);
  const [currentInputs, setCurrentInputs] = useState<Partial<SunoInput>>({});
  const [output, setOutput] = useState<SunoOutput | null>(null);
  const [forensicLog, setForensicLog] = useState("");
  const [generating, setGenerating] = useState(false);
  const [chatKey, setChatKey] = useState(0); // ChatFlow 강제 리마운트용
  const [showToast, setShowToast] = useState(false);
  const [modifyHistory, setModifyHistory] = useState<
    { request: string; response: string }[]
  >([]);

  // result phase에서 currentInputs 변경 시 output 재생성
  // useRef로 flashToast 참조 — 의존성 배열 무한루프 방지
  const flashToastRef = useRef<() => void>(() => {});

  // identity 섹션 직접 수정 시 영문 오버라이드 저장
  // (previewEngine은 oneLiner(한국어)를 기반으로 섹션을 생성하므로 별도 보관)
  const [identityOverride, setIdentityOverride] = useState<string | null>(null);

  // 대화 중 입력 변경
  const handleInputChange = useCallback((inputs: Partial<SunoInput>) => {
    setCurrentInputs(inputs);
    const sections = generatePreview(inputs);
    setPreviewSections(sections);
  }, []);

  // 토스트 표시
  const flashToast = useCallback(() => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, []);

  // ref 최신화 — flashToast가 바뀌어도 useEffect 재실행 안 함
  useEffect(() => {
    flashToastRef.current = flashToast;
  }, [flashToast]);

  // currentInputs 변경 → result phase일 때 output + 프리뷰 자동 재생성
  useEffect(() => {
    if (phase !== "result") return;
    const inputs = currentInputs as SunoInput;
    if (!inputs.oneLiner) return;

    // output 재생성
    const { output: newOutput, forensicLog: newLog } = generateDemo(inputs);
    setOutput(newOutput);
    setForensicLog(newLog);

    // 프리뷰 재생성 — previewEngine이 최신 inputs 기반으로 한국어 해석까지 새로 생성
    const newSections = generatePreview(currentInputs);
    // identity 섹션 오버라이드 적용 (사용자가 직접 수정한 영문값 유지)
    setPreviewSections(identityOverride
      ? newSections.map((s) => s.id === "identity" ? { ...s, english: identityOverride } : s)
      : newSections
    );

    flashToastRef.current();
  // identityOverride는 의존성에서 제외 — 섹션 저장 시에만 변경되므로 무한루프 없음
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInputs, phase]);

  // 프리뷰 섹션 수정 → currentInputs만 업데이트
  // output + 프리뷰 재생성은 currentInputs 감지 useEffect가 담당
  const handleSectionUpdate = useCallback((sectionId: string, newEnglish: string) => {
    // 섹션 ID → SunoInput 필드 매핑 (previewEngine이 생성하는 모든 섹션 ID 포함)
    const fieldMap: Record<string, keyof SunoInput> = {
      genre: "genre",
      texture: "vibe",         // vibe 기반 TEXTURE & MOOD 섹션
      "texture-step": "texture", // texture 스텝 기반 TEXTURE 섹션
      era: "era",
      vocal: "vocal",
      reverb: "reverb",
      "lyrics-config": "language",
      instruments: "instruments",
    };

    // structure 수정 — Lyrics에 Song Form 태그 반영
    if (sectionId === "structure") {
      setOutput((prev) => {
        if (!prev) return prev;
        if (prev.lyrics.includes("[Song Form:")) {
          return { ...prev, lyrics: prev.lyrics.replace(/\[Song Form:.*?\]/, `[Song Form: ${newEnglish}]`) };
        }
        return { ...prev, lyrics: prev.lyrics + `\n\n[Song Form: ${newEnglish}]` };
      });
      setPreviewSections((prev) =>
        prev.map((s) => s.id === "structure" ? { ...s, english: newEnglish } : s)
      );
      flashToastRef.current();
      return;
    }

    if (sectionId === "identity") {
      // identity는 oneLiner(한국어) 기반이므로 영문 오버라이드만 저장
      // currentInputs.oneLiner는 건드리지 않음 → 한국어 분석 로직 유지
      setIdentityOverride(newEnglish);
      // 프리뷰만 즉시 업데이트 (useEffect 재실행 없이)
      setPreviewSections((prev) =>
        prev.map((s) => s.id === "identity" ? { ...s, english: newEnglish } : s)
      );
      return;
    }

    const inputKey = fieldMap[sectionId];
    if (inputKey) {
      // currentInputs 업데이트 → useEffect가 output + 프리뷰 재생성 담당
      setCurrentInputs((prev) => ({ ...prev, [inputKey]: newEnglish }));
    }
  }, []);

  // 대화 완료 (확인 버튼)
  const handleComplete = useCallback((inputs: SunoInput) => {
    console.log("=== R3ALAUDE 입력 ===");
    console.log(JSON.stringify(inputs, null, 2));

    const { output: demoOutput, forensicLog: log } = generateDemo(inputs);
    setOutput(demoOutput);
    setForensicLog(log);
    setModifyHistory([]);
    setPhase("result");
  }, []);

  // 수정 요청
  const handleModify = useCallback((request: string) => {
    if (!request.trim()) return;
    setModifyHistory((prev) => [
      ...prev,
      {
        request,
        response: `수정 요청 접수: "${request}"\n→ Claude Code에서 반영하면 업데이트됩니다.`,
      },
    ]);
    console.log("=== R3ALAUDE 수정 요청 ===");
    console.log(request);
  }, []);

  // 리셋
  const handleReset = useCallback(() => {
    setPhase("chat");
    setPreviewSections([]);
    setCurrentInputs({});
    setOutput(null);
    setForensicLog("");
    setModifyHistory([]);
    setGenerating(false);
    setIdentityOverride(null);
    setChatKey((prev) => prev + 1); // ChatFlow 강제 리마운트
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background relative">
      <Header phase={phase} onReset={handleReset} />

      {/* 수정 토스트 */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(10, 10, 10, 0.85)",
            color: "#fff",
            padding: "16px 32px",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: 600,
            zIndex: 9999,
            pointerEvents: "none",
            animation: "toast-fade 2s ease-in-out",
          }}
        >
          수정되었습니다
        </div>
      )}
      <style>{`
        @keyframes toast-fade {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {phase === "chat" && (
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-5xl flex">
            <div className="flex-1 min-w-0 overflow-y-auto border-r border-border">
              <ChatFlow
                key={chatKey}
                onComplete={handleComplete}
                onInputChange={handleInputChange}
              />
            </div>
            <div className="w-[400px] flex-shrink-0 hidden lg:flex flex-col overflow-hidden">
              <LivePreview
                sections={previewSections}
                onSectionUpdate={handleSectionUpdate}
                generating={generating}
                currentInputs={currentInputs}
              />
            </div>
          </div>
        </div>
      )}

      {phase === "result" && output && (
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-5xl flex">
            <div className="flex-1 min-w-0 overflow-hidden">
              <OutputPanel
                output={output}
                forensicLog={forensicLog}
                onModify={handleModify}
                onBack={handleReset}
                modifyHistory={modifyHistory}
                onOutputEdit={(field, newContent) => {
                  setOutput((prev) =>
                    prev ? { ...prev, [field]: newContent } : prev
                  );
                }}
              />
            </div>
            <div className="w-[400px] flex-shrink-0 hidden lg:flex flex-col overflow-hidden border-l border-border">
              <LivePreview
                sections={previewSections}
                onSectionUpdate={handleSectionUpdate}
                isReady={true}
                currentInputs={currentInputs}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
