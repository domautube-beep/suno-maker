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

  // 영문 설명 → 내부 키 역매핑 (프리뷰에서 선택한 값을 원래 키로 변환)
  const reverseMap: Record<string, Record<string, string>> = {
    genre: {
      "synth-driven, layered hooks, 4/4 pulse": "kpop",
      "groove-locked, laid-back pocket, neo-soul influence": "rnb",
      "808 bass, trap hi-hats, boom-bap elements": "hiphop",
      "piano-driven, emotional build, orchestral swells": "ballad",
      "build-drop structure, synthesizer lead, four-on-the-floor": "edm",
      "tape saturation, dusty samples, jazzy chords": "lofi",
      "electric guitar driven, drum kit energy, distorted edge": "rock",
      "melodic hook density, bright vocal presence, traditional bounce": "trot",
      "complex chord voicing, swing groove, improvisation space": "jazz",
      "orchestral layers, epic scale, dramatic dynamics": "cinematic",
      "clean production, catchy hooks, radio-ready mix": "pop",
      "unique texture, experimental arrangement, lo-fi character": "indie",
    },
    era: {
      "80s synth character, gated reverb, drum machine": "80s",
      "90s warm pads, groovy bass, natural drums": "90s",
      "Y2K glitch, pop-hybrid, digital sheen": "2000s",
      "modern clean production, EDM influence, polished mix": "2010s",
      "hyperpop elements, trendy mixing, genre-fluid": "2020s",
      "experimental synthesis, unconventional structure": "futuristic",
      "analog warmth, vinyl character, classic recording": "vintage",
    },
    "texture-step": {
      "tape saturation, vinyl crackle, warm compression": "lofi_warm",
      "precision mixing, clean synthesis, modern clarity": "clean_digital",
      "analog warmth, soft compression, vintage color": "analog_vintage",
      "raw distortion, aggressive attack, unpolished edge": "raw_gritty",
      "wide reverb, phase effects, ethereal layers": "dreamy",
      "wide stereo, ambient layers, spatial depth": "spacious",
      "layered stacking, full arrangement, wall of sound": "dense",
      "sparse elements, space as instrument, restraint": "minimal",
    },
    reverb: {
      "close-mic, intimate distance, minimal reverb": "dry",
      "medium room, balanced wet/dry, natural space": "room",
      "large hall, wide reverb, distant presence": "hall",
      "cathedral reverb, massive tail, sacred space": "cathedral",
      "lo-fi filtered, tape warmth, vintage compression": "lofi_filter",
      "plate reverb, vintage warm, classic studio": "plate",
    },
    "lyrics-config": {
      "Korean lyrics, 2-5 eojeol phrasing, vowel-chain hooks": "ko",
      "English lyrics, natural stress pattern, singable phrases": "en",
      "Japanese lyrics, mora-based phrasing, vowel-open hooks": "ja",
      "Korean + English mixed lyrics, bilingual hook design": "mixed",
    },
  };

  // 프리뷰 섹션 수정
  const handleSectionUpdate = useCallback((sectionId: string, newEnglish: string) => {
    const fieldMap: Record<string, keyof SunoInput> = {
      genre: "genre", texture: "vibe", "texture-step": "texture",
      era: "era", vocal: "vocal", reverb: "reverb",
      "lyrics-config": "language", instruments: "instruments",
    };

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
      setIdentityOverride(newEnglish);
      setPreviewSections((prev) =>
        prev.map((s) => s.id === "identity" ? { ...s, english: newEnglish } : s)
      );
      return;
    }

    const inputKey = fieldMap[sectionId];
    if (inputKey) {
      // 역매핑: 영문 설명 → 내부 키값으로 변환
      const sectionReverseMap = reverseMap[sectionId];
      const resolvedValue = sectionReverseMap?.[newEnglish] || newEnglish;
      setCurrentInputs((prev) => ({ ...prev, [inputKey]: resolvedValue }));

      // 프리뷰 섹션도 즉시 업데이트 (useEffect 대기 없이)
      setPreviewSections((prev) =>
        prev.map((s) => s.id === sectionId ? { ...s, english: newEnglish } : s)
      );
      flashToastRef.current();
    }
  }, []);

  // AI로 Style of Music 생성
  const generateStyle = useCallback(async (inputs: Record<string, string>) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, apiKey, provider }),
      });
      const data = await res.json();
      if (data.style) {
        setOutput({ style: data.style, lyrics: "" });
        setForensicLog(data.forensicLog || "");
      } else if (data.error) {
        setForensicLog(`[에러] ${data.error}`);
        setOutput({ style: "", lyrics: "" });
      }
    } catch {
      setForensicLog("[에러] API 호출 실패");
      setOutput({ style: "", lyrics: "" });
    }
    setGenerating(false);
  }, [apiKey, provider]);

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
              <ProgressBar activeIndex={10} appPhase="result" />

              <div className="p-4 space-y-4 pb-8">
                {/* 처음부터 다시 */}
                <button onClick={handleReset}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  처음부터 다시
                </button>

                {/* 스타일 생성 중 로딩 */}
                {generating && (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <svg className="animate-spin" style={{ margin: "0 auto 16px" }} width="32" height="32" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="4" fill="none" />
                      <path style={{ opacity: 0.75 }} fill="#f97316" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#0a0a0a" }}>Style of Music 생성 중...</p>
                    <p style={{ fontSize: "11px", color: "#a3a3a3", marginTop: "4px" }}>AI가 설정을 분석하고 스타일 프롬프트를 작성하고 있습니다</p>
                  </div>
                )}

                {/* 생성 완료 시 표시 */}
                {!generating && output && (
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
