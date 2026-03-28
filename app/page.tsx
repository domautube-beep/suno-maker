"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AppPhase, SunoInput, SunoOutput, PreviewSection } from "@/lib/types";
import { generatePreview } from "@/lib/previewEngine";
import { generateDemo } from "@/lib/demoGenerator";
import { smartFill } from "@/lib/smartFill";
import Header from "@/components/Header";
import ChatFlow from "@/components/ChatFlow";
import LivePreview from "@/components/LivePreview";
import StyleResult from "@/components/StyleResult";
import LyricsSection from "@/components/LyricsSection";
import ProgressBar from "@/components/ProgressBar";

export default function Home() {
  // 3단계 phase: chat → style → lyrics
  const [phase, setPhase] = useState<AppPhase>("chat");
  const [previewSections, setPreviewSections] = useState<PreviewSection[]>([]);
  const [currentInputs, setCurrentInputs] = useState<Partial<SunoInput>>({});
  const [output, setOutput] = useState<SunoOutput | null>(null);
  const [forensicLog, setForensicLog] = useState("");
  const [generating, setGenerating] = useState(false);
  const [chatKey, setChatKey] = useState(0); // ChatFlow 강제 리마운트용
  const [showToast, setShowToast] = useState(false);
  const [trackNumber, setTrackNumber] = useState(1);

  // useRef로 flashToast 참조 — 의존성 배열 무한루프 방지
  const flashToastRef = useRef<() => void>(() => {});

  // identity 섹션 직접 수정 시 영문 오버라이드 저장
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

  // currentInputs 변경 → style/lyrics phase일 때 output + 프리뷰 자동 재생성
  useEffect(() => {
    if (phase === "chat") return;
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
    // 섹션 ID → SunoInput 필드 매핑
    const fieldMap: Record<string, keyof SunoInput> = {
      genre: "genre",
      texture: "vibe",
      "texture-step": "texture",
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
      setIdentityOverride(newEnglish);
      setPreviewSections((prev) =>
        prev.map((s) => s.id === "identity" ? { ...s, english: newEnglish } : s)
      );
      return;
    }

    const inputKey = fieldMap[sectionId];
    if (inputKey) {
      setCurrentInputs((prev) => ({ ...prev, [inputKey]: newEnglish }));
    }
  }, []);

  // Phase 1 완료 — chat에서 style로 전환
  // 빈 값을 AI 추론값으로 채워서 프리뷰에 전부 표시
  const handleChatComplete = useCallback((inputs: SunoInput) => {
    console.log("=== R3ALAUDE 입력 ===");
    console.log(JSON.stringify(inputs, null, 2));

    // smartFill — 사용자 선택 + 장르 프리셋 + 느낌 추론으로 빈 값 채움
    const filled = smartFill(inputs);

    setCurrentInputs(filled);

    const { output: demoOutput, forensicLog: log } = generateDemo(filled);
    setOutput(demoOutput);
    setForensicLog(log);

    // 프리뷰도 채워진 값으로 생성
    const sections = generatePreview(filled);
    setPreviewSections(sections);

    setPhase("style");
  }, []);

  // Phase 2 완료 — style에서 lyrics로 전환
  const handleGoToLyrics = useCallback(() => {
    setPhase("lyrics");
  }, []);

  // 변주 생성 — 같은 톤/무드, 다른 조합
  const handleGenerateVariation = useCallback(() => {
    const inputs = currentInputs as SunoInput;
    if (!inputs.oneLiner && !inputs.genre) return;

    setTrackNumber((prev) => prev + 1);

    const { output: newOutput, forensicLog: newLog } = generateDemo(inputs);
    setOutput(newOutput);
    setForensicLog(newLog + `\n\n[Track ${trackNumber + 1} — 변주 생성]`);

    // 프리뷰도 갱신
    const sections = generatePreview(currentInputs);
    setPreviewSections(sections);

    // style phase로 돌아가서 새 Style 확인
    setPhase("style");
    flashToastRef.current();
  }, [currentInputs, trackNumber]);

  // 전체 리셋
  const handleReset = useCallback(() => {
    setPhase("chat");
    setPreviewSections([]);
    setCurrentInputs({});
    setOutput(null);
    setForensicLog("");
    setGenerating(false);
    setIdentityOverride(null);
    setTrackNumber(1);
    setChatKey((prev) => prev + 1);
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

      {/* Phase 1: 입력 단계 */}
      {phase === "chat" && (
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-5xl flex">
            <div className="flex-1 min-w-0 overflow-y-auto border-r border-border">
              <ChatFlow
                key={chatKey}
                onComplete={handleChatComplete}
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

      {/* Phase 2: Style 단계 */}
      {phase === "style" && output && (
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-5xl flex">
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
              {/* style phase에서 프로그레스바 — Style 탭 활성화 */}
              <ProgressBar activeIndex={10} appPhase="style" />
              <div className="flex-1 overflow-hidden">
              <StyleResult
                output={output}
                forensicLog={forensicLog}
                onOutputEdit={(field, newContent) => {
                  setOutput((prev) =>
                    prev ? { ...prev, [field]: newContent } : prev
                  );
                }}
                onNextPhase={handleGoToLyrics}
                onBack={handleReset}
              />
              </div>
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

      {/* Phase 3: Lyrics 단계 */}
      {phase === "lyrics" && output && (
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-5xl flex">
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col border-r border-border">
              {/* lyrics phase에서 프로그레스바 — Lyrics 탭 활성화 */}
              <ProgressBar activeIndex={11} appPhase="lyrics" />
              <div className="flex-1 overflow-y-auto p-4 pb-6">
              <button
                onClick={() => setPhase("style")}
                className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 mb-4"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Style로 돌아가기
              </button>
              <LyricsSection
                vocalProfile={output.lyrics}
                style={output.style}
                onLyricsUpdate={(newLyrics) => {
                  setOutput((prev) =>
                    prev ? { ...prev, lyrics: newLyrics } : prev
                  );
                }}
                onGenerateVariation={handleGenerateVariation}
                trackNumber={trackNumber}
              />
              </div>
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
