"use client";

import { useState } from "react";
import { LYRICS_RULES } from "@/lib/lyricsRules";

interface LyricsSectionProps {
  // 자동 생성된 보컬 프로필 (generateDemo에서 [] 명령어들)
  lyricsContent: string;
  // 생성된 Style of Music
  style: string;
  // 현재 언어
  language: string;
  // 모든 입력 설정
  currentSettings?: Record<string, string>;
  onLanguageChange?: (lang: string) => void;
  // 아래는 미사용이지만 page.tsx 호환용
  onLyricsUpdate?: (lyrics: string) => void;
  onGenerateVariation?: () => void;
  trackNumber?: number;
}

// 송폼 프리셋
const SONG_FORMS = [
  { label: "기본", value: "Verse 1 → Hook → Chorus → Verse 2 → Bridge → Hook → Chorus → Outro", desc: "V-H-C-V-B-H-C-O" },
  { label: "짧게", value: "Verse 1 → Chorus → Verse 2 → Chorus → Outro", desc: "V-C-V-C-O" },
  { label: "랩", value: "Verse 1 → Verse 2 → Hook → Chorus → Bridge → Chorus", desc: "V-V-H-C-B-C" },
  { label: "발라드", value: "Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Final Chorus", desc: "V-C-V-C-B-C" },
];

// 감정 흐름 프리셋
const EMOTION_ARCS = [
  { label: "잔잔→폭발", value: "시작은 조용하고 친밀하게, 점진적으로 감정이 고조되어 코러스에서 폭발. 브릿지에서 다시 가라앉았다가 마지막 코러스에서 최고조.", bars: [1, 2, 4, 2, 1, 4, 5, 2] },
  { label: "일정하게", value: "처음부터 끝까지 일정한 에너지. 감정 변화보다 그루브와 반복으로 중독성 유지.", bars: [3, 3, 3, 3, 3, 3, 3, 3] },
  { label: "폭발→잔잔", value: "강렬하게 시작해서 점점 감정을 내려놓는 구조. 마지막에 속삭이듯 끝남.", bars: [5, 4, 3, 4, 3, 2, 2, 1] },
  { label: "롤러코스터", value: "벌스에서 낮고 코러스에서 높은 극적인 대비. 섹션마다 에너지가 급변.", bars: [2, 1, 5, 2, 1, 5, 2, 1] },
];

// 가사 밀도 프리셋
const DENSITY_OPTIONS = [
  { label: "짧게", value: "short", desc: "Verse 2줄, Chorus 2줄 — 미니멀하고 여백이 많은 가사" },
  { label: "보통", value: "medium", desc: "Verse 4줄, Chorus 4줄 — 표준적인 가사 분량" },
  { label: "길게", value: "long", desc: "Verse 6줄+, Chorus 4줄+ — 스토리텔링이 풍부한 가사" },
];

// 보컬 설정 옵션
const VOICE_TYPES = [
  { label: "남성 저음", value: "male, low baritone, deep chest resonance" },
  { label: "남성 중음", value: "male, mid-range tenor, warm natural presence" },
  { label: "남성 고음", value: "male, high tenor, bright falsetto capable" },
  { label: "여성 저음", value: "female, low alto, rich warm depth" },
  { label: "여성 중음", value: "female, mid-range mezzo, clear and balanced" },
  { label: "여성 고음", value: "female, high soprano, airy and light" },
];

const TIMBRES = [
  { label: "허스키", value: "husky grain, rough warmth, textured edge" },
  { label: "매끈한", value: "smooth silk, clean resonance, polished tone" },
  { label: "공기감", value: "airy breathy, whisper-close, soft presence" },
  { label: "파워풀", value: "powerful chest, full projection, bold resonance" },
  { label: "소울풀", value: "soulful richness, gospel-influenced, deep emotion" },
  { label: "거친", value: "raw rasp, gritty attack, distorted edge" },
];

const DELIVERIES = [
  { label: "대화체", value: "conversational intimacy, natural phrasing" },
  { label: "감정폭발", value: "emotional outburst, crescendo peaks, belting" },
  { label: "나른한", value: "laid-back lazy, half-whisper, effortless cool" },
  { label: "리드미컬", value: "rhythmic precision, groove-locked, punchy" },
  { label: "랩", value: "rap flow, sharp articulation, punchline delivery" },
  { label: "속삭임", value: "whisper singing, ASMR-close, breath-heavy" },
];

export default function LyricsSection({
  lyricsContent,
  style,
  language,
  currentSettings,
  onLanguageChange,
}: LyricsSectionProps) {
  const [songForm, setSongForm] = useState(0);
  const [emotionArc, setEmotionArc] = useState(0);
  const [density, setDensity] = useState("medium");
  const [copied, setCopied] = useState(false);

  // 보컬 스타일 디테일 설정
  const [voiceType, setVoiceType] = useState(0);
  const [timbre, setTimbre] = useState(1);
  const [delivery, setDelivery] = useState(0);

  // 보컬 프로필 명령어 — 사용자 선택 기반으로 동적 생성
  const vocalProfileLines = [
    `[VOCAL_PROFILE: ${VOICE_TYPES[voiceType].value.split(",")[0]}, ${TIMBRES[timbre].value.split(",")[0]}, ${DELIVERIES[delivery].value.split(",")[0]}]`,
    `[VOICE_TYPE: ${VOICE_TYPES[voiceType].value}]`,
    `[TIMBRE: ${TIMBRES[timbre].value}]`,
    `[ARTICULATION: relaxed consonants, flowing legato, occasional breathy onset]`,
    `[VIBRATO: minimal, slow controlled, phrase-end only]`,
    `[DELIVERY: ${DELIVERIES[delivery].value}]`,
    `[PERFORMANCE_TRAITS: audible breath before key phrases, natural crescendo into hook]`,
  ].join("\n");

  // 설정 요약
  const buildSettingsSummary = () => {
    if (!currentSettings) return "";
    const lines: string[] = [];
    if (currentSettings.oneLiner) lines.push(`핵심 문장: "${currentSettings.oneLiner}"`);
    if (currentSettings.genre) lines.push(`장르: ${currentSettings.genre}`);
    if (currentSettings.vibe) lines.push(`느낌/분위기: ${currentSettings.vibe}`);
    if (currentSettings.era) lines.push(`시대감: ${currentSettings.era}`);
    if (currentSettings.texture) lines.push(`질감: ${currentSettings.texture}`);
    if (currentSettings.tempo) lines.push(`템포: ${currentSettings.tempo}`);
    if (currentSettings.instruments) lines.push(`악기: ${currentSettings.instruments}`);
    return lines.join("\n");
  };

  // 가사 프롬프트 조합
  const buildFullPrompt = () => {
    const selectedForm = SONG_FORMS[songForm];
    const selectedArc = EMOTION_ARCS[emotionArc];
    const selectedDensity = DENSITY_OPTIONS.find((d) => d.value === density)!;
    const langLabel = language === "ko" ? "한국어" : language === "en" ? "English" : language === "ja" ? "日本語" : "한국어 + English 믹스";

    return [
      `아래 설정에 맞는 Suno v5.5용 가사를 작성해줘.`,
      ``,
      `=== 가사 작성 규칙 ===`,
      LYRICS_RULES,
      ``,
      `=== 곡 설정 (사운드 방향) ===`,
      buildSettingsSummary(),
      ``,
      `=== Style of Music (생성 완료된 스타일 — 가사의 리듬감/밀도 참고) ===`,
      style,
      ``,
      `=== VOCAL PROFILE (가사 최상단에 그대로 포함할 것) ===`,
      vocalProfileLines,
      ``,
      `=== 가사 구조 설정 ===`,
      `가사 언어: ${langLabel}`,
      `송폼 구조: ${selectedForm.value}`,
      `가사 밀도: ${selectedDensity.desc}`,
      `감정 흐름: ${selectedArc.value}`,
      ``,
      `=== 장르별 작법 가이드 ===`,
      `- 힙합/랩: 라임 밀도 높게, 펀치라인 필수, 플로우 변주`,
      `- 발라드: 감정적 서사, 긴 호흡, 서정적 이미지`,
      `- R&B: 리듬감 있는 프레이징, 그루브 반복, 허밍 가능한 멜로디`,
      `- EDM/댄스: 짧은 반복 훅, 에너지 상승 구조, 챈트 가능`,
      `- 록: 선언적이고 강렬한 문장, 파워풀한 코러스`,
      `- 트로트: 직설적 감정, 반복되는 후렴, 대중적 어휘`,
      ``,
      `=== 출력 형식 ===`,
      `1. VOCAL PROFILE 명령어를 맨 위에 그대로 출력`,
      `2. 각 섹션: [SECTION: 이름] + [VOCAL_PROMPT: ...] + [LAYER: ...] + [Texture: ...] + 가사`,
      `3. 감정 흐름에 따라 VOCAL_PROMPT와 LAYER의 강도를 섹션마다 변화시킬 것`,
      `4. 코드블록 없이 텍스트만 출력`,
      `5. Suno Lyrics 필드에 바로 붙여넣을 수 있는 형태로 출력`,
    ].join("\n");
  };

  // 프롬프트 복사
  const handleCopyPrompt = async () => {
    const prompt = buildFullPrompt();
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // 프롬프트 복사 + Claude.ai 열기
  const handleCopyAndOpen = async () => {
    await handleCopyPrompt();
    try {
      const halfW = Math.floor(screen.width / 2);
      window.moveTo(0, 0);
      window.resizeTo(halfW, screen.height);
    } catch { /* 브라우저 제한 */ }
    const halfW = Math.floor(screen.width / 2);
    window.open("https://claude.ai/new", "claude-lyrics", `width=${halfW},height=${screen.height},left=${halfW},top=0`);
  };

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: "16px", overflow: "hidden" }}>
      {/* 헤더 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Lyrics 프롬프트 생성기</h3>
        <p style={{ fontSize: "11px", color: "#a3a3a3", marginTop: "2px" }}>
          설정을 선택하면 가사 생성 프롬프트가 조합됩니다
        </p>
      </div>

      {/* 1. 가사 언어 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Language</p>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { label: "한국어", value: "ko" },
            { label: "English", value: "en" },
            { label: "日本語", value: "ja" },
            { label: "KO + EN", value: "mixed" },
          ].map((lang) => (
            <button
              key={lang.value}
              onClick={() => onLanguageChange?.(lang.value)}
              style={{
                flex: 1, padding: "8px", borderRadius: "9999px", fontSize: "12px",
                fontWeight: language === lang.value ? 600 : 400,
                backgroundColor: language === lang.value ? "#0a0a0a" : "#fff",
                color: language === lang.value ? "#fff" : "#a3a3a3",
                border: language === lang.value ? "1px solid #0a0a0a" : "1px solid #e5e5e5",
                cursor: "pointer",
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 가사 밀도 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Density</p>
        <div style={{ display: "flex", gap: "6px" }}>
          {DENSITY_OPTIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDensity(d.value)}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: "12px", fontSize: "12px",
                fontWeight: density === d.value ? 600 : 400,
                backgroundColor: density === d.value ? "#0a0a0a" : "#fff",
                color: density === d.value ? "#fff" : "#a3a3a3",
                border: density === d.value ? "1px solid #0a0a0a" : "1px solid #e5e5e5",
                cursor: "pointer", textAlign: "center",
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: "10px", color: "#a3a3a3", marginTop: "6px" }}>
          {DENSITY_OPTIONS.find((d) => d.value === density)?.desc}
        </p>
      </div>

      {/* 3. 송폼 구조 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Song Form</p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {SONG_FORMS.map((form, i) => (
            <button
              key={form.label}
              onClick={() => setSongForm(i)}
              style={{
                flex: 1, minWidth: "70px", padding: "10px 8px", borderRadius: "12px", fontSize: "12px",
                fontWeight: songForm === i ? 600 : 400,
                backgroundColor: songForm === i ? "#0a0a0a" : "#fff",
                color: songForm === i ? "#fff" : "#a3a3a3",
                border: songForm === i ? "1px solid #0a0a0a" : "1px solid #e5e5e5",
                cursor: "pointer", textAlign: "center",
              }}
            >
              {form.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: "10px", color: "#a3a3a3", marginTop: "6px", fontFamily: "monospace" }}>
          {SONG_FORMS[songForm].desc}
        </p>
      </div>

      {/* 4. 보컬 스타일 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vocal Style</p>

        {/* 음역 */}
        <p style={{ fontSize: "10px", fontWeight: 600, color: "#737373", marginBottom: "6px" }}>음역</p>
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {VOICE_TYPES.map((v, i) => (
            <button key={v.label} onClick={() => setVoiceType(i)}
              style={{
                padding: "6px 12px", borderRadius: "9999px", fontSize: "11px",
                fontWeight: voiceType === i ? 600 : 400,
                backgroundColor: voiceType === i ? "#0a0a0a" : "#fff",
                color: voiceType === i ? "#fff" : "#a3a3a3",
                border: voiceType === i ? "1px solid #0a0a0a" : "1px solid #e5e5e5",
                cursor: "pointer",
              }}>
              {v.label}
            </button>
          ))}
        </div>

        {/* 음색 */}
        <p style={{ fontSize: "10px", fontWeight: 600, color: "#737373", marginBottom: "6px" }}>음색</p>
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {TIMBRES.map((t, i) => (
            <button key={t.label} onClick={() => setTimbre(i)}
              style={{
                padding: "6px 12px", borderRadius: "9999px", fontSize: "11px",
                fontWeight: timbre === i ? 600 : 400,
                backgroundColor: timbre === i ? "#0a0a0a" : "#fff",
                color: timbre === i ? "#fff" : "#a3a3a3",
                border: timbre === i ? "1px solid #0a0a0a" : "1px solid #e5e5e5",
                cursor: "pointer",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 딜리버리 */}
        <p style={{ fontSize: "10px", fontWeight: 600, color: "#737373", marginBottom: "6px" }}>딜리버리</p>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {DELIVERIES.map((d, i) => (
            <button key={d.label} onClick={() => setDelivery(i)}
              style={{
                padding: "6px 12px", borderRadius: "9999px", fontSize: "11px",
                fontWeight: delivery === i ? 600 : 400,
                backgroundColor: delivery === i ? "#0a0a0a" : "#fff",
                color: delivery === i ? "#fff" : "#a3a3a3",
                border: delivery === i ? "1px solid #0a0a0a" : "1px solid #e5e5e5",
                cursor: "pointer",
              }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. 감정 흐름 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Emotion Arc</p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {EMOTION_ARCS.map((arc, i) => (
            <button
              key={arc.label}
              onClick={() => setEmotionArc(i)}
              style={{
                flex: 1, minWidth: "70px", padding: "10px 8px", borderRadius: "12px", fontSize: "12px",
                fontWeight: emotionArc === i ? 600 : 400,
                backgroundColor: emotionArc === i ? "#0a0a0a" : "#fff",
                color: emotionArc === i ? "#fff" : "#a3a3a3",
                border: emotionArc === i ? "1px solid #0a0a0a" : "1px solid #e5e5e5",
                cursor: "pointer", textAlign: "center",
              }}
            >
              {arc.label}
            </button>
          ))}
        </div>
        {/* 에너지 시각화 바 */}
        <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "40px", marginTop: "10px", padding: "0 4px" }}>
          {EMOTION_ARCS[emotionArc].bars.map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h * 7}px`,
              backgroundColor: h >= 4 ? "#f97316" : h >= 2 ? "#fdba74" : "#fed7aa",
              borderRadius: "3px",
              transition: "height 0.3s ease, background-color 0.3s ease",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", padding: "0 4px" }}>
          <span style={{ fontSize: "9px", color: "#d4d4d4" }}>Verse</span>
          <span style={{ fontSize: "9px", color: "#d4d4d4" }}>Chorus</span>
          <span style={{ fontSize: "9px", color: "#d4d4d4" }}>Bridge</span>
          <span style={{ fontSize: "9px", color: "#d4d4d4" }}>Outro</span>
        </div>
      </div>

      {/* 프롬프트 생성 버튼 */}
      <div style={{ padding: "20px" }}>
        {copied ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", backgroundColor: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#16a34a" }}>프롬프트 복사됨!</span>
            </div>
            <p style={{ fontSize: "11px", color: "#737373", marginTop: "8px" }}>
              Claude.ai에 붙여넣기 → 생성된 가사를 Suno Lyrics에 직접 붙여넣기
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={handleCopyAndOpen}
              style={{
                padding: "14px", borderRadius: "12px", backgroundColor: "#f97316",
                color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              프롬프트 복사 + Claude.ai 열기
            </button>
            <button
              onClick={handleCopyPrompt}
              style={{
                padding: "10px", borderRadius: "12px", backgroundColor: "#fff",
                color: "#737373", fontSize: "12px", fontWeight: 500,
                border: "1px solid #e5e5e5", cursor: "pointer",
              }}
            >
              프롬프트만 복사
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
