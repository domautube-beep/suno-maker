"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AppPhase, SunoInput, SunoOutput, PreviewSection } from "@/lib/types";
import { generatePreview } from "@/lib/previewEngine";
import { smartFill } from "@/lib/smartFill";
import Header from "@/components/Header";
import ChatFlow from "@/components/ChatFlow";
import LivePreview from "@/components/LivePreview";
import OutputBlock from "@/components/OutputBlock";
import LyricsSection from "@/components/LyricsSection";
import ProgressBar from "@/components/ProgressBar";
import ApiKeyGate, { Provider } from "@/components/ApiKeyGate";

export default function Home() {
  // API 키 — sessionStorage (새로고침 유지, 탭 닫으면 사라짐)
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("r3_apikey") || "";
    return "";
  });
  const [provider, setProvider] = useState<Provider>(() => {
    if (typeof window !== "undefined") return (sessionStorage.getItem("r3_provider") as Provider) || null;
    return null;
  });

  // 2단계: chat → result (Style + Lyrics 한 화면)
  const [phase, setPhase] = useState<AppPhase>("chat");
  const [previewSections, setPreviewSections] = useState<PreviewSection[]>([]);
  const [currentInputs, setCurrentInputs] = useState<Partial<SunoInput>>({});
  const [output, setOutput] = useState<SunoOutput | null>(null);
  const [forensicLog, setForensicLog] = useState("");
  const [generating, setGenerating] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [trackNumber, setTrackNumber] = useState(1);

  const flashToastRef = useRef<() => void>(() => {});
  const [identityOverride, setIdentityOverride] = useState<string | null>(null);
  // 이전 입력 추적 — 언어만 바뀌었는지 판별용
  const prevInputsRef = useRef<Partial<SunoInput>>({});

  const handleInputChange = useCallback((inputs: Partial<SunoInput>) => {
    setCurrentInputs(inputs);
    const sections = generatePreview(inputs);
    setPreviewSections(sections);
  }, []);

  const flashToast = useCallback(() => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, []);

  useEffect(() => {
    flashToastRef.current = flashToast;
  }, [flashToast]);

  // currentInputs 변경 → 프리뷰만 업데이트 (스타일 재생성은 명시적 버튼으로)
  useEffect(() => {
    if (phase !== "result") return;

    const newSections = generatePreview(currentInputs);
    setPreviewSections(identityOverride
      ? newSections.map((s) => s.id === "identity" ? { ...s, english: identityOverride } : s)
      : newSections
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInputs, phase]);

  // AI로 Style of Music 생성 (스트리밍)
  const [streamingText, setStreamingText] = useState("");

  const generateStyle = useCallback(async (inputs: Record<string, string>) => {
    setGenerating(true);
    setStreamingText("");
    setForensicLog("");
    try {
      const res = await fetch("/api/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, apiKey, provider }),
      });

      if (!res.ok) {
        const err = await res.json();
        setForensicLog(`[에러] ${err.error || "API 실패"}`);
        setGenerating(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setForensicLog("[에러] 스트림 없음"); setGenerating(false); return; }

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setStreamingText(fullText);
              }
            } catch { /* 무시 */ }
          }
        }
      }

      // ---STYLE--- / ---NOTES--- 파싱
      const styleMatch = fullText.match(/---STYLE---\n?([\s\S]*?)(?:---NOTES---|$)/);
      const notesMatch = fullText.match(/---NOTES---\n?([\s\S]*?)$/);
      const style = styleMatch ? styleMatch[1].trim() : fullText;
      const notes = notesMatch ? notesMatch[1].trim() : "";

      setOutput((prev) => prev ? { ...prev, style } : { style, lyrics: "" });
      setForensicLog(notes);
      setStreamingText("");
    } catch {
      setForensicLog("[에러] API 호출 실패");
    }
    setGenerating(false);
  }, [apiKey, provider]);

  // 프리뷰 섹션 수정
  const handleSectionUpdate = useCallback((sectionId: string, newValue: string) => {
    const fieldMap: Record<string, keyof SunoInput> = {
      genre: "genre", texture: "vibe", "texture-step": "texture",
      era: "era", reverb: "reverb",
      "lyrics-config": "language", instruments: "instruments",
    };

    if (sectionId === "structure") {
      setPreviewSections((prev) =>
        prev.map((s) => s.id === "structure" ? { ...s, english: newValue } : s)
      );
      flashToastRef.current();
      return;
    }

    if (sectionId === "identity") {
      setIdentityOverride(newValue);
      setPreviewSections((prev) =>
        prev.map((s) => s.id === "identity" ? { ...s, english: newValue } : s)
      );
      return;
    }

    const inputKey = fieldMap[sectionId];
    if (inputKey) {
      const updatedInputs = { ...currentInputs, [inputKey]: newValue };
      setCurrentInputs(updatedInputs);

      // 프리뷰 섹션도 즉시 업데이트
      setPreviewSections((prev) =>
        prev.map((s) => s.id === sectionId ? { ...s, english: newValue } : s)
      );
      flashToastRef.current();

      // 스타일에 영향주는 설정 변경 시 자동 재생성
      const styleFields = ["genre", "vibe", "texture", "era", "reverb", "instruments"];
      if (styleFields.includes(inputKey)) {
        generateStyle(updatedInputs as Record<string, string>);
      }
    }
  }, [currentInputs, generateStyle]);

  // 대화 완료 → result phase + AI 스타일 생성
  const handleComplete = useCallback((inputs: SunoInput) => {
    const filled = smartFill(inputs);
    setCurrentInputs(filled);

    const sections = generatePreview(filled);
    setPreviewSections(sections);

    setPhase("result");
    generateStyle(filled as unknown as Record<string, string>);
  }, [generateStyle]);

  // 스타일 재생성 (프리뷰에서 수정 후)
  const handleRegenerateStyle = useCallback(() => {
    generateStyle(currentInputs as Record<string, string>);
  }, [currentInputs, generateStyle]);

  // 변주 생성 (스타일 새로 생성)
  const handleGenerateVariation = useCallback(() => {
    setTrackNumber((prev) => prev + 1);
    generateStyle(currentInputs as Record<string, string>);
  }, [currentInputs, generateStyle]);

  // 리셋
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

  // API 키 미입력 시 게이트 표시
  if (!apiKey || !provider) {
    return <ApiKeyGate onKeySubmit={(key, prov) => {
      setApiKey(key);
      setProvider(prov);
      sessionStorage.setItem("r3_apikey", key);
      sessionStorage.setItem("r3_provider", prov || "");
    }} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background relative">
      <Header phase={phase} onReset={handleReset} />

      {/* 토스트 */}
      {showToast && (
        <div style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(10, 10, 10, 0.85)", color: "#fff",
          padding: "16px 32px", borderRadius: "16px", fontSize: "14px",
          fontWeight: 600, zIndex: 9999, pointerEvents: "none",
          animation: "toast-fade 2s ease-in-out",
        }}>
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

      {/* Phase 1: 입력 */}
      {phase === "chat" && (
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-5xl flex">
            <div className="flex-1 min-w-0 overflow-y-auto border-r border-border">
              <ChatFlow
                key={chatKey}
                onComplete={handleComplete}
                onInputChange={handleInputChange}
                apiKey={apiKey}
                provider={provider || undefined}
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

      {/* Phase 2: 결과 (Style + Lyrics 한 화면) */}
      {phase === "result" && (
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-5xl flex">
            {/* 왼쪽: 결과 */}
            <div className="flex-1 min-w-0 overflow-y-auto border-r border-border">
              <ProgressBar activeIndex={9} appPhase="result" />

              <div className="p-4 space-y-4 pb-8">
                {/* 처음부터 다시 */}
                <button onClick={handleReset}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  처음부터 다시
                </button>

                {/* 스타일 생성 중 — 스트리밍 표시 */}
                {generating && (
                  <div style={{ padding: "16px", backgroundColor: "#0a0a0a", borderRadius: "16px", position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f97316", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#a3a3a3" }}>생성 중...</span>
                    </div>
                    {streamingText ? (
                      <pre style={{
                        fontSize: "11px", color: "#d4d4d4", fontFamily: "monospace",
                        whiteSpace: "pre-wrap", lineHeight: "1.6",
                        maxHeight: "300px", overflowY: "auto",
                      }}>{streamingText}<span style={{ animation: "blink 1s infinite" }}>▊</span></pre>
                    ) : (
                      <p style={{ fontSize: "11px", color: "#525252" }}>AI가 설정을 분석하고 있습니다...</p>
                    )}
                    <style>{`
                      @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                    `}</style>
                  </div>
                )}

                {/* 생성 실패 시 */}
                {!generating && (!output || !output.style) && forensicLog && (
                  <div style={{ padding: "20px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "16px" }}>
                    <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626", marginBottom: "8px" }}>Style 생성 실패</h3>
                    <p style={{ fontSize: "12px", color: "#525252", lineHeight: "1.6", marginBottom: "12px" }}>{forensicLog}</p>
                    <button onClick={handleRegenerateStyle} style={{
                      padding: "10px 20px", borderRadius: "10px", backgroundColor: "#f97316",
                      color: "#fff", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer",
                    }}>다시 생성하기</button>
                  </div>
                )}

                {/* 생성 완료 시 표시 */}
                {!generating && output && output.style && (
                  <>
                {/* 프로듀서 분석 노트 */}
                {forensicLog && (
                  <div style={{ backgroundColor: "#fff7ed", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "16px", padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#f97316" }}>프로듀서 분석 노트</h3>
                    </div>
                    <pre style={{ fontSize: "11px", color: "#525252", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{forensicLog}</pre>
                  </div>
                )}

                {/* Style of Music */}
                <div>
                <OutputBlock
                  title="Style of Music"
                  subtitle="Suno 'Style of Music' 필드에 붙여넣기"
                  content={output.style}
                  charLimit={900}
                  onEdit={(newContent) => setOutput((prev) => prev ? { ...prev, style: newContent } : prev)}
                />
                <button onClick={handleRegenerateStyle}
                  style={{ fontSize: "11px", color: "#f97316", background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginTop: "-8px" }}>
                  스타일 다시 생성
                </button>
                </div>

                {/* Lyrics — 가사 설정 + 생성 */}
                <LyricsSection
                  lyricsContent={output.lyrics}
                  style={output.style}
                  language={currentInputs.language as string || ""}
                  currentSettings={currentInputs as Record<string, string>}
                  apiKey={apiKey}
                  provider={provider}
                  onLyricsUpdate={(newLyrics) => setOutput((prev) => prev ? { ...prev, lyrics: newLyrics } : prev)}
                  onLanguageChange={(lang) => setCurrentInputs((prev) => ({ ...prev, language: lang }))}
                  onRegenerateStyle={() => generateStyle(currentInputs as Record<string, string>)}
                  onGenerateVariation={handleGenerateVariation}
                  trackNumber={trackNumber}
                />
                  </>
                )}
              </div>
            </div>

            {/* 오른쪽: 프리뷰 */}
            <div className="w-[400px] flex-shrink-0 hidden lg:flex flex-col overflow-hidden">
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
