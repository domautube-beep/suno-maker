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

  // 세션 상태 복원
  const [phase, setPhase] = useState<AppPhase>(() => {
    if (typeof window !== "undefined") return (sessionStorage.getItem("r3_phase") as AppPhase) || "chat";
    return "chat";
  });
  const [previewSections, setPreviewSections] = useState<PreviewSection[]>([]);
  const [currentInputs, setCurrentInputs] = useState<Partial<SunoInput>>(() => {
    if (typeof window !== "undefined") { try { return JSON.parse(sessionStorage.getItem("r3_inputs") || "{}"); } catch { return {}; } }
    return {};
  });
  const [output, setOutput] = useState<SunoOutput | null>(() => {
    if (typeof window !== "undefined") { try { return JSON.parse(sessionStorage.getItem("r3_output") || "null"); } catch { return null; } }
    return null;
  });
  const [forensicLog, setForensicLog] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("r3_log") || "";
    return "";
  });
  const [generating, setGenerating] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // 모바일 프리뷰 바텀시트
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // 세션 상태 저장
  useEffect(() => { sessionStorage.setItem("r3_phase", phase); }, [phase]);
  useEffect(() => { sessionStorage.setItem("r3_inputs", JSON.stringify(currentInputs)); }, [currentInputs]);
  useEffect(() => { if (output) sessionStorage.setItem("r3_output", JSON.stringify(output)); }, [output]);
  useEffect(() => { sessionStorage.setItem("r3_log", forensicLog); }, [forensicLog]);

  // 복원 시 프리뷰 재생성
  useEffect(() => {
    if (phase === "result" && Object.keys(currentInputs).length > 0) {
      const sections = generatePreview(currentInputs);
      setPreviewSections(sections);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashToastRef = useRef<() => void>(() => {});
  const [identityOverride, setIdentityOverride] = useState<string | null>(null);

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
  const styleStreamRef = useRef<HTMLPreElement>(null);

  const userScrolledStyleRef = useRef(false);

  useEffect(() => {
    if (!generating) { userScrolledStyleRef.current = false; return; }
    const handler = () => { userScrolledStyleRef.current = true; };
    window.addEventListener("wheel", handler, { passive: true });
    return () => window.removeEventListener("wheel", handler);
  }, [generating]);

  useEffect(() => {
    if (!streamingText || userScrolledStyleRef.current) return;
    if (styleStreamRef.current) styleStreamRef.current.scrollTop = styleStreamRef.current.scrollHeight;
    const scrollParent = styleStreamRef.current?.closest(".overflow-y-auto") as HTMLElement | null;
    if (scrollParent) scrollParent.scrollTop = scrollParent.scrollHeight;
  }, [streamingText]);

  const generateStyle = useCallback(async (inputs: Record<string, string>) => {
    setGenerating(true);
    setStreamingText("");
    setForensicLog("");
    // 스트리밍 영역으로 스크롤
    setTimeout(() => styleStreamRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
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

  // 퀵스타트 모드 — 스타일 완료 후 가사도 자동 생성
  const [autoLyrics, setAutoLyrics] = useState(false);

  // 대화 완료 → result phase + AI 스타일 생성
  const handleComplete = useCallback((inputs: SunoInput) => {
    const filled = smartFill(inputs);
    setCurrentInputs(filled);

    const sections = generatePreview(filled);
    setPreviewSections(sections);

    setPhase("result");
    generateStyle(filled as unknown as Record<string, string>);
  }, [generateStyle]);

  // 퀵스타트: Chat Flow 스킵 + 스타일 + 가사 한방 생성
  const handleQuickStart = useCallback((inputs: SunoInput) => {
    const filled = smartFill(inputs);
    setCurrentInputs(filled);

    const sections = generatePreview(filled);
    setPreviewSections(sections);

    setPhase("result");
    setAutoLyrics(true);
    generateStyle(filled as unknown as Record<string, string>);
  }, [generateStyle]);

  // 스타일 재생성 (프리뷰에서 수정 후)
  const handleRegenerateStyle = useCallback(() => {
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
    setAutoLyrics(false);
    setChatKey((prev) => prev + 1);
    // 세션 스토리지 초기화
    sessionStorage.removeItem("r3_phase");
    sessionStorage.removeItem("r3_inputs");
    sessionStorage.removeItem("r3_output");
    sessionStorage.removeItem("r3_log");
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
            <div className="flex-1 min-w-0 overflow-y-auto lg:border-r border-border">
              <ChatFlow
                key={chatKey}
                onComplete={handleComplete}
                onQuickStart={handleQuickStart}
                onInputChange={handleInputChange}
                onAutoFill={(settings) => {
                  setCurrentInputs((prev) => ({ ...prev, ...settings }));
                }}
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
            <div className="flex-1 min-w-0 overflow-y-auto lg:border-r border-border">
              <ProgressBar activeIndex={9} appPhase="result" />

              <div className="p-4 space-y-4 pb-24 lg:pb-8">
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
                      <pre ref={styleStreamRef} style={{
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

                {/* 생성 완료 또는 진행 중에도 표시 (LyricsSection 언마운트 방지) */}
                {output && (output.style || generating) && (
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
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "-8px" }}>
                  <button onClick={handleRegenerateStyle}
                    style={{ fontSize: "11px", color: "#f97316", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    스타일 다시 생성
                  </button>
                  <button onClick={() => {
                    const name = prompt("프리셋 이름을 입력하세요 (예: R&B 감성)");
                    if (!name || !output.style) return;
                    const presets = JSON.parse(localStorage.getItem("r3_style_presets") || "{}");
                    presets[name] = { style: output.style, notes: forensicLog, inputs: currentInputs };
                    localStorage.setItem("r3_style_presets", JSON.stringify(presets));
                    alert(`"${name}" 프리셋이 저장되었습니다.`);
                  }} style={{ fontSize: "11px", color: "#737373", background: "none", border: "none", cursor: "pointer" }}>
                    프리셋 저장
                  </button>
                </div>

                {/* 프리셋 불러오기 */}
                {(() => {
                  const presets = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("r3_style_presets") || "{}") : {};
                  const keys = Object.keys(presets);
                  if (keys.length === 0) return null;
                  return (
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "-4px" }}>
                      <span style={{ fontSize: "10px", color: "#a3a3a3", lineHeight: "28px" }}>프리셋:</span>
                      {keys.map((k) => (
                        <button key={k} onClick={() => {
                          const p = presets[k];
                          setOutput((prev) => prev ? { ...prev, style: p.style } : { style: p.style, lyrics: "" });
                          setForensicLog(p.notes || "");
                          if (p.inputs) setCurrentInputs(p.inputs);
                        }} style={{
                          padding: "4px 10px", borderRadius: "9999px", fontSize: "10px",
                          backgroundColor: "#fff", color: "#525252", border: "1px solid #e5e5e5", cursor: "pointer",
                        }}>
                          {k}
                        </button>
                      ))}
                    </div>
                  );
                })()}
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
                  onRegenerateStyle={() => { return generateStyle(currentInputs as Record<string, string>); }}
                  autoGenerate={autoLyrics}
                />
                  </>
                )}
              </div>
            </div>

            {/* 오른쪽: 프리뷰 (데스크탑) */}
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

      {/* 모바일 프리뷰 플로팅 버튼 (< 1024px) */}
      {previewSections.length > 0 && (
        <button
          onClick={() => setMobilePreviewOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg"
          style={{
            backgroundColor: "#f97316",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          프리뷰
        </button>
      )}

      {/* 모바일 프리뷰 바텀시트 (< 1024px) */}
      {mobilePreviewOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          {/* 오버레이 */}
          <div
            className="flex-shrink-0"
            style={{ height: "10vh", backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setMobilePreviewOpen(false)}
          />
          {/* 바텀시트 본체 */}
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.15)",
              animation: "slide-up 0.3s ease-out",
            }}
          >
            {/* 핸들 + 닫기 */}
            <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: "36px", height: "4px", borderRadius: "2px", backgroundColor: "#d4d4d4", margin: "0 auto" }} />
              <button
                onClick={() => setMobilePreviewOpen(false)}
                style={{ position: "absolute", right: "16px", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* 프리뷰 콘텐츠 */}
            <div className="flex-1 overflow-y-auto">
              <LivePreview
                sections={previewSections}
                onSectionUpdate={handleSectionUpdate}
                isReady={phase === "result"}
                generating={generating}
                currentInputs={currentInputs}
              />
            </div>
          </div>
          <style>{`
            @keyframes slide-up {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
