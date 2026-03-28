"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AppPhase, SunoInput, SunoOutput, PreviewSection } from "@/lib/types";
import { generatePreview } from "@/lib/previewEngine";
import { generateDemo } from "@/lib/demoGenerator";
import { smartFill } from "@/lib/smartFill";
import Header from "@/components/Header";
import ChatFlow from "@/components/ChatFlow";
import LivePreview from "@/components/LivePreview";
import OutputBlock from "@/components/OutputBlock";
import LyricsSection from "@/components/LyricsSection";
import ProgressBar from "@/components/ProgressBar";
import ApiKeyGate, { Provider } from "@/components/ApiKeyGate";

export default function Home() {
  // API 키 (세션 메모리만, 저장 안 함)
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<Provider>(null);

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

  // currentInputs 변경 → result phase일 때 output + 프리뷰 재생성
  useEffect(() => {
    if (phase !== "result") return;
    const inputs = currentInputs as SunoInput;
    if (!inputs.oneLiner && !inputs.genre) return;

    const prev = prevInputsRef.current as SunoInput;
    // 언어만 변경된 경우: 가사만 재생성, 스타일은 유지
    const onlyLanguageChanged = prev.oneLiner === inputs.oneLiner
      && prev.genre === inputs.genre && prev.vibe === inputs.vibe
      && prev.tempo === inputs.tempo && prev.era === inputs.era
      && prev.texture === inputs.texture && prev.reverb === inputs.reverb
      && prev.vocal === inputs.vocal && prev.instruments === inputs.instruments
      && prev.timeSignature === inputs.timeSignature
      && prev.language !== inputs.language;

    if (onlyLanguageChanged && output) {
      // 스타일 유지, 가사만 재생성
      const { output: newOutput, forensicLog: newLog } = generateDemo(inputs);
      setOutput({ style: output.style, lyrics: newOutput.lyrics });
      setForensicLog(newLog);
    } else {
      // 전체 재생성 (스타일 + 가사)
      const { output: newOutput, forensicLog: newLog } = generateDemo(inputs);
      setOutput(newOutput);
      setForensicLog(newLog);
    }

    prevInputsRef.current = { ...currentInputs };

    const newSections = generatePreview(currentInputs);
    setPreviewSections(identityOverride
      ? newSections.map((s) => s.id === "identity" ? { ...s, english: identityOverride } : s)
      : newSections
    );

    flashToastRef.current();
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
    }
  }, []);

  // 대화 완료 → result phase
  const handleComplete = useCallback((inputs: SunoInput) => {
    const filled = smartFill(inputs);
    setCurrentInputs(filled);

    const { output: demoOutput, forensicLog: log } = generateDemo(filled);
    setOutput(demoOutput);
    setForensicLog(log);

    const sections = generatePreview(filled);
    setPreviewSections(sections);

    setPhase("result");
  }, []);

  // 가사만 재생성 (스타일 유지)
  const handleRegenerateLyrics = useCallback(() => {
    const inputs = currentInputs as SunoInput;
    if (!inputs.oneLiner && !inputs.genre) return;

    const { output: newOutput } = generateDemo(inputs);
    setOutput((prev) => prev ? { ...prev, lyrics: newOutput.lyrics } : newOutput);
    flashToastRef.current();
  }, [currentInputs]);

  // 변주 생성 (스타일 + 가사 모두 새로 생성)
  const handleGenerateVariation = useCallback(() => {
    const inputs = currentInputs as SunoInput;
    if (!inputs.oneLiner && !inputs.genre) return;

    setTrackNumber((prev) => prev + 1);

    const { output: newOutput, forensicLog: newLog } = generateDemo(inputs);
    setOutput(newOutput);
    setForensicLog(newLog + `\n\n[Track ${trackNumber + 1} — 변주 생성]`);

    const sections = generatePreview(currentInputs);
    setPreviewSections(sections);

    flashToastRef.current();
  }, [currentInputs, trackNumber]);

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
    return <ApiKeyGate onKeySubmit={(key, prov) => { setApiKey(key); setProvider(prov); }} />;
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
      {phase === "result" && output && (
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

                {/* 프로듀서 분석 노트 */}
                {forensicLog && (
                  <div style={{ backgroundColor: "#fff7ed", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "16px", padding: "16px 20px" }}>
                    <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#f97316", marginBottom: "8px" }}>프로듀서 분석 노트</h3>
                    <pre style={{ fontSize: "11px", color: "#525252", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{forensicLog}</pre>
                  </div>
                )}

                {/* Style of Music */}
                <OutputBlock
                  title="Style of Music"
                  subtitle="Suno 'Style of Music' 필드에 붙여넣기"
                  content={output.style}
                  charLimit={900}
                  onEdit={(newContent) => setOutput((prev) => prev ? { ...prev, style: newContent } : prev)}
                />

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
