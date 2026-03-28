"use client";

import { useState } from "react";
import { buildLyricsRules, DEFAULT_BANNED_WORDS } from "@/lib/lyricsRules";
import { Provider } from "./ApiKeyGate";

interface LyricsSectionProps {
  lyricsContent: string;
  style: string;
  language: string;
  currentSettings?: Record<string, string>;
  apiKey: string;
  provider: Provider;
  onLanguageChange?: (lang: string) => void;
  onLyricsUpdate?: (lyrics: string) => void;
  onGenerateVariation?: () => void;
  trackNumber?: number;
}

// === 송폼 블록 ===
const SONG_BLOCKS = [
  { id: "verse", label: "Verse", color: "#3b82f6" },
  { id: "pre", label: "Pre-Chorus", color: "#8b5cf6" },
  { id: "hook", label: "Hook", color: "#f97316" },
  { id: "chorus", label: "Chorus", color: "#ef4444" },
  { id: "bridge", label: "Bridge", color: "#10b981" },
  { id: "outro", label: "Outro", color: "#6b7280" },
];

const SONG_FORM_PRESETS = [
  { label: "Pop/K-Pop", blocks: ["verse", "pre", "chorus", "verse", "pre", "chorus", "bridge", "chorus", "outro"] },
  { label: "Hip-Hop", blocks: ["verse", "hook", "verse", "hook", "bridge", "hook", "outro"] },
  { label: "R&B", blocks: ["verse", "hook", "chorus", "verse", "hook", "chorus", "bridge", "chorus", "outro"] },
  { label: "Ballad", blocks: ["verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"] },
  { label: "EDM", blocks: ["verse", "pre", "chorus", "verse", "pre", "chorus", "bridge", "chorus", "outro"] },
  { label: "Rock", blocks: ["verse", "pre", "chorus", "verse", "pre", "chorus", "bridge", "chorus", "outro"] },
  { label: "Lo-Fi", blocks: ["verse", "chorus", "verse", "chorus", "bridge", "outro"] },
  { label: "Trot", blocks: ["verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"] },
];

// === 가사 밀도 ===
const DENSITY_OPTIONS = [
  { label: "짧게", value: "short", desc: "Verse 2줄, Chorus 2줄" },
  { label: "보통", value: "medium", desc: "Verse 4줄, Chorus 4줄" },
  { label: "길게", value: "long", desc: "Verse 6줄+, Chorus 4줄+" },
];

// === 감정 흐름 ===
const EMOTION_ARCS = [
  { label: "잔잔→폭발", value: "시작은 조용하고 친밀하게, 점진적으로 고조되어 코러스에서 폭발. 브릿지에서 침잠 후 마지막 코러스에서 최고조.", bars: [1, 2, 4, 2, 1, 4, 5, 2] },
  { label: "일정하게", value: "처음부터 끝까지 일정한 에너지. 그루브와 반복으로 중독성 유지.", bars: [3, 3, 3, 3, 3, 3, 3, 3] },
  { label: "폭발→잔잔", value: "강렬하게 시작해서 점점 내려놓는 구조. 마지막에 속삭이듯 끝남.", bars: [5, 4, 3, 4, 3, 2, 2, 1] },
  { label: "롤러코스터", value: "벌스에서 낮고 코러스에서 높은 극적 대비. 섹션마다 에너지 급변.", bars: [2, 1, 5, 2, 1, 5, 2, 1] },
];

// === VOCAL PROFILE 옵션 ===
const VP_VOICE_TYPE = [
  { label: "남성 저음", value: "Male low baritone, deep chest resonance, grounded presence" },
  { label: "남성 중음", value: "Male mid-range tenor, warm natural presence, conversational" },
  { label: "남성 고음", value: "Male high tenor, bright falsetto capable, airy top register" },
  { label: "여성 저음", value: "Female low alto, rich warm depth, smoky undertone" },
  { label: "여성 중음", value: "Female mid-range mezzo, soulful with slight rasp, clear" },
  { label: "여성 고음", value: "Female high soprano, airy and light, crystalline top notes" },
  { label: "듀엣 (남녀)", value: "Male-female duet, alternating verses, harmonized chorus, call-and-response" },
  { label: "듀엣 (남남)", value: "Male-male duet, contrasting registers, harmonic blend, tag-team verses" },
  { label: "듀엣 (여여)", value: "Female-female duet, interweaving harmonies, shared melodic lines" },
  { label: "그룹", value: "Group vocal, multi-part harmony, layered ensemble, distributed lines" },
  { label: "소년 목소리", value: "Young male voice, bright and pure, pre-break register, innocent tone" },
  { label: "소녀 목소리", value: "Young female voice, clear and bright, sweet high register, youthful energy" },
];

const VP_TIMBRE = [
  { label: "허스키", value: "Husky grain, rough warmth, textured edge, slight grit on sustains" },
  { label: "매끈한", value: "Smooth silk, clean resonance, polished tone, studio-refined clarity" },
  { label: "공기감", value: "Airy breathy, whisper-close, soft presence, ASMR-adjacent intimacy" },
  { label: "아날로그", value: "Warm analog texture, slight breathiness, vintage tape saturation" },
  { label: "파워풀", value: "Powerful chest projection, full resonance, bold dynamic range" },
  { label: "소울풀", value: "Soulful richness, gospel-influenced warmth, deep emotional color" },
  { label: "크리스탈", value: "Crystal clear, pristine high frequencies, bell-like purity, transparent" },
  { label: "메탈릭", value: "Metallic edge, sharp overtones, industrial sheen, cutting presence" },
  { label: "스모키", value: "Smoky darkness, low-register warmth, jazz-club intimacy, shadowy" },
  { label: "나른한", value: "Lazy warmth, sleepy texture, half-awake softness, pillow-talk quality" },
];

const VP_ARTICULATION = [
  { label: "자연스러운", value: "Natural flow, clear consonants, relaxed delivery, effortless diction" },
  { label: "정밀한", value: "Precise diction, crisp consonants, sharp word boundaries" },
  { label: "흘리는", value: "Flowing legato, blurred word edges, dreamy connected phrasing" },
  { label: "끊어치는", value: "Staccato attack, punchy syllables, rhythmic word separation" },
  { label: "속사포", value: "Rapid-fire delivery, machine-gun syllables, compressed breath, dense packing" },
  { label: "늘어지는", value: "Stretched vowels, elongated phrasing, drawn-out delivery, languid" },
  { label: "뱉는", value: "Spit-style attack, aggressive onset, percussive consonants, hard edge" },
];

const VP_DELIVERY = [
  { label: "속삭임→벨팅", value: "Starts whispered and close, builds to confident belting, dynamic range" },
  { label: "대화체", value: "Conversational intimacy throughout, natural phrasing, storytelling tone" },
  { label: "감정폭발", value: "Emotional outburst peaks, crescendo-driven, cathartic release" },
  { label: "나른한", value: "Laid-back lazy delivery, half-whisper, effortless cool, behind-beat feel" },
  { label: "랩 플로우", value: "Rhythmic precision, sharp articulation, groove-locked, punchline delivery" },
  { label: "일정한 힘", value: "Consistent power, sustained energy, confident projection throughout" },
  { label: "노래하듯 랩", value: "Melodic rap, singing-rapping hybrid, auto-tune ready, melodic flow" },
  { label: "절규", value: "Screaming intensity, raw primal energy, throat-tearing passion, punk edge" },
  { label: "흥얼거림", value: "Humming and murmuring, gentle half-melody, casual and intimate" },
  { label: "선언적", value: "Declarative authority, anthem-style projection, commanding presence" },
];

const VP_REVERB = [
  { label: "드라이", value: "Close-mic dry, intimate distance, minimal reverb, raw presence" },
  { label: "룸", value: "Medium room reverb, balanced wet/dry, natural space" },
  { label: "확장형", value: "Intimate space expanding to cathedral, dynamic reverb shift" },
  { label: "홀", value: "Large hall reverb, wide and distant, ethereal presence" },
  { label: "빈티지", value: "Vintage plate reverb, warm tail, classic studio color" },
  { label: "Lo-Fi", value: "Lo-fi filtered reverb, tape warmth, vintage compression" },
  { label: "대성당", value: "Cathedral reverb, massive tail 4s+, sacred immersive space" },
  { label: "야외", value: "Open-air outdoor ambience, natural echo, unconfined space" },
  { label: "전화기", value: "Telephone filter, narrow bandwidth, lo-fi distortion, retro effect" },
  { label: "스타디움", value: "Stadium-sized reverb, crowd-echo ambience, arena scale" },
];

const VP_EVOLUTION = [
  { label: "속삭임→열정", value: "Whisper intimacy → conversational strength → soaring passion → resolved warmth" },
  { label: "일관된 힘", value: "Consistent confident delivery → subtle intensity shifts → powerful finale" },
  { label: "폭발→침잠", value: "Bold opening → controlled descent → whispered bridge → gentle resolution" },
  { label: "점진적 상승", value: "Close whisper verse → open supported chorus → exposed bridge → layered final chorus with doubles" },
  { label: "감정 롤러코스터", value: "Intimate verse → explosive chorus → stripped bridge → cathartic finale" },
  { label: "독백→합창", value: "Solo whisper start → gradual harmony layers → full choir finale → unified resolution" },
  { label: "거친→세련", value: "Raw unfiltered opening → progressively polished delivery → refined emotional control" },
  { label: "마스크 벗기", value: "Guarded controlled verse → cracks in bridge → fully exposed vulnerable finale" },
];

// === 장르별 가이드 ===
const GENRE_GUIDES: Record<string, string> = {
  hiphop: "힙합/랩: 라임 밀도 높게, 펀치라인 필수, 플로우 변주, 스네어 위치에 강세 정렬, A/B bars(장면→반전)",
  rnb: "R&B: 리듬감 있는 프레이징, 그루브 반복, 허밍 가능한 멜로디, 감성적 딜리버리",
  ballad: "발라드: 감정적 서사, 긴 호흡, 서정적 이미지, 절제된 반복, 감정 곡선 중시",
  edm: "EDM/댄스: 짧은 반복 훅, 에너지 상승 구조, 챈트 가능한 코러스, Build→Drop 연동",
  rock: "록: 선언적이고 강렬한 문장, 파워풀한 코러스, 반항적 에너지, Bridge 폭발/침잠",
  kpop: "K-Pop: 캐치한 훅, 한영 믹스 자연스럽게, Pre-Chorus 리프트 → Chorus 피크",
  pop: "팝: 클린하고 보편적인 어휘, 기억하기 쉬운 멜로디 라인, 라디오 친화적",
  trot: "트로트: 직설적 감정, 반복 후렴, 대중적 어휘, 멜로디 훅 밀도",
  lofi: "Lo-Fi: 나른한 어투, 일상 장면 묘사, 느슨한 리듬감, 자유 구조 허용",
  jazz: "재즈: 세련된 어휘, 은유적 표현, 스윙 리듬에 맞는 프레이징",
  cinematic: "시네마틱: 장대한 서사, 시각적 이미지, 감정 스케일 극대화",
  indie: "인디: 독특한 관점, 실험적 구조, 개인적이고 솔직한 어투",
};

// === 버튼 컴포넌트 ===
function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: "9999px", fontSize: "11px",
      fontWeight: selected ? 600 : 400,
      backgroundColor: selected ? "#0a0a0a" : "#fff",
      color: selected ? "#fff" : "#d4d4d4",
      border: selected ? "1px solid #0a0a0a" : "1px solid #e5e5e5",
      cursor: "pointer", transition: "all 0.15s ease",
    }}>
      {label}
    </button>
  );
}

function SectionLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <p style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      {sub && <p style={{ fontSize: "10px", color: "#a3a3a3", marginTop: "2px" }}>{sub}</p>}
    </div>
  );
}

function SubLabel({ label }: { label: string }) {
  return <p style={{ fontSize: "10px", fontWeight: 600, color: "#737373", marginBottom: "6px" }}>{label}</p>;
}

// === 메인 컴포넌트 ===
export default function LyricsSection({
  style, language, currentSettings, apiKey, provider, onLyricsUpdate,
}: LyricsSectionProps) {
  // 송폼 + 드래그
  const [songFormBlocks, setSongFormBlocks] = useState<string[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // 가사 설정
  const [density, setDensity] = useState("");
  const [emotionArc, setEmotionArc] = useState(-1);

  // Vocal Profile
  const [vpVoice, setVpVoice] = useState(-1);
  const [vpTimbre, setVpTimbre] = useState(-1);
  const [vpArticulation, setVpArticulation] = useState(-1);
  const [vpDelivery, setVpDelivery] = useState(-1);
  const [vpReverb, setVpReverb] = useState(-1);
  const [vpEvolution, setVpEvolution] = useState(-1);

  // 금지어
  const [bannedWords, setBannedWords] = useState(DEFAULT_BANNED_WORDS);
  const [showBannedEdit, setShowBannedEdit] = useState(false);

  // 생성 상태
  const [generating, setGenerating] = useState(false);
  const [generatedLyrics, setGeneratedLyrics] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // 선택 완료 여부
  const isReady = songFormBlocks.length >= 3 && density && emotionArc >= 0 && vpVoice >= 0 && vpTimbre >= 0 && vpDelivery >= 0 && vpReverb >= 0 && vpEvolution >= 0;

  // Vocal Profile 프롬프트 조합
  const buildVocalProfile = () => {
    if (!isReady) return "";
    const voice = VP_VOICE_TYPE[vpVoice];
    const timbre = VP_TIMBRE[vpTimbre];
    const artic = vpArticulation >= 0 ? VP_ARTICULATION[vpArticulation] : VP_ARTICULATION[0];
    const deliv = VP_DELIVERY[vpDelivery];
    const reverb = VP_REVERB[vpReverb];
    const evo = VP_EVOLUTION[vpEvolution];

    return [
      `[VOCAL_PROFILE: ${voice.value.split(",")[0]}, ${timbre.value.split(",")[0]}, ${deliv.value.split(",")[0]}]`,
      `[VOICE_TYPE: ${voice.value}]`,
      `[TIMBRE: ${timbre.value}]`,
      `[ARTICULATION: ${artic.value}]`,
      `[VIBRATO: Subtle and controlled, deepens during emotional peaks]`,
      `[DELIVERY: ${deliv.value}]`,
      `[REVERB: ${reverb.value}]`,
      `[PERFORMANCE_TRAITS: Controlled breath support, natural crescendo into hook]`,
      `[Evolution: ${evo.value}]`,
    ].join("\n");
  };

  // 전체 프롬프트
  const buildFullPrompt = () => {
    const selectedArc = EMOTION_ARCS[emotionArc];
    const selectedDensity = DENSITY_OPTIONS.find((d) => d.value === density)!;
    const langLabel = language === "ko" ? "한국어" : language === "en" ? "English" : language === "ja" ? "日本語" : "한국어 + English 믹스";
    const genre = currentSettings?.genre || "";
    const genreGuide = GENRE_GUIDES[genre] || "";

    const settingsLines: string[] = [];
    if (currentSettings?.oneLiner) settingsLines.push(`핵심 문장: "${currentSettings.oneLiner}"`);
    if (currentSettings?.genre) settingsLines.push(`장르: ${currentSettings.genre}`);
    if (currentSettings?.vibe) settingsLines.push(`느낌: ${currentSettings.vibe}`);
    if (currentSettings?.era) settingsLines.push(`시대감: ${currentSettings.era}`);
    if (currentSettings?.texture) settingsLines.push(`질감: ${currentSettings.texture}`);
    if (currentSettings?.tempo) settingsLines.push(`템포: ${currentSettings.tempo}`);
    if (currentSettings?.instruments) settingsLines.push(`악기: ${currentSettings.instruments}`);
    if (currentSettings?.reverb) settingsLines.push(`리버브: ${currentSettings.reverb}`);

    const parts = [
      `아래 설정에 맞는 Suno v5.5용 가사를 작성해줘.`,
      ``,
      `=== 가사 작성 규칙 ===`,
      buildLyricsRules(bannedWords),
      ``,
    ];

    if (settingsLines.length > 0) {
      parts.push(`=== 곡 설정 ===`, settingsLines.join("\n"), ``);
    }

    parts.push(`=== Style of Music ===`, style, ``);
    parts.push(`=== VOCAL PROFILE (가사 최상단에 그대로 포함) ===`, buildVocalProfile(), ``);
    // 송폼 → 라벨로 변환
    const songFormLabels = songFormBlocks.map((id) => SONG_BLOCKS.find((b) => b.id === id)?.label || id);

    parts.push(`=== 가사 구조 ===`);
    parts.push(`가사 언어: ${langLabel}`);
    parts.push(`송폼 구조: ${songFormLabels.join(" → ")}`);
    parts.push(`가사 밀도: ${selectedDensity.desc}`);
    parts.push(`감정 흐름: ${selectedArc.value}`);
    parts.push(``);

    if (genreGuide) {
      parts.push(`=== 장르 작법 ===`, genreGuide, ``);
    }

    parts.push(`=== 출력 ===`);
    parts.push(`1. VOCAL PROFILE 명령어를 맨 위에 그대로 출력`);
    parts.push(`2. 각 섹션: [SECTION] + [VOCAL_PROMPT] + [LAYER] + [Texture] + 가사`);
    parts.push(`3. 감정 흐름에 따라 VOCAL_PROMPT와 LAYER 강도를 섹션마다 변화`);
    parts.push(`4. 코드블록 없이 텍스트만 출력`);
    parts.push(`5. Suno Lyrics 필드에 바로 붙여넣을 수 있는 형태`);

    return parts.join("\n");
  };

  // API 호출
  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildFullPrompt(), apiKey, provider }),
      });
      const data = await res.json();
      if (data.lyrics) {
        setGeneratedLyrics(data.lyrics);
        onLyricsUpdate?.(data.lyrics);
      } else {
        setError(data.error || "생성 실패");
      }
    } catch {
      setError("API 호출 실패");
    }
    setGenerating(false);
  };

  const handleCopyLyrics = async () => {
    await navigator.clipboard.writeText(generatedLyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: "16px", overflow: "hidden" }}>
      {/* 헤더 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Lyrics</h3>
        <p style={{ fontSize: "11px", color: "#a3a3a3", marginTop: "2px" }}>보컬 + 가사 설정 → AI 가사 생성</p>
      </div>

      {/* 1. VOCAL PROFILE */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <SectionLabel label="Vocal Profile" sub="Suno가 보컬을 렌더링하는 방식을 결정합니다" />

        <SubLabel label="Voice Type" />
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {VP_VOICE_TYPE.map((v, i) => <Pill key={v.label} label={v.label} selected={vpVoice === i} onClick={() => setVpVoice(i)} />)}
        </div>

        <SubLabel label="Timbre (음색)" />
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {VP_TIMBRE.map((t, i) => <Pill key={t.label} label={t.label} selected={vpTimbre === i} onClick={() => setVpTimbre(i)} />)}
        </div>

        <SubLabel label="Articulation (발음)" />
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {VP_ARTICULATION.map((a, i) => <Pill key={a.label} label={a.label} selected={vpArticulation === i} onClick={() => setVpArticulation(i)} />)}
        </div>

        <SubLabel label="Delivery (전달 방식)" />
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {VP_DELIVERY.map((d, i) => <Pill key={d.label} label={d.label} selected={vpDelivery === i} onClick={() => setVpDelivery(i)} />)}
        </div>

        <SubLabel label="Reverb (공간감)" />
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {VP_REVERB.map((r, i) => <Pill key={r.label} label={r.label} selected={vpReverb === i} onClick={() => setVpReverb(i)} />)}
        </div>

        <SubLabel label="Evolution (보컬 변화)" />
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {VP_EVOLUTION.map((e, i) => <Pill key={e.label} label={e.label} selected={vpEvolution === i} onClick={() => setVpEvolution(i)} />)}
        </div>
      </div>

      {/* 2. SONG FORM */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <SectionLabel label="Song Form" sub="프리셋 선택 후 자유롭게 수정 가능" />

        {/* 프리셋 */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {SONG_FORM_PRESETS.map((preset) => (
            <Pill key={preset.label} label={preset.label}
              selected={JSON.stringify(songFormBlocks) === JSON.stringify(preset.blocks)}
              onClick={() => setSongFormBlocks([...preset.blocks])} />
          ))}
        </div>

        {/* 현재 구조 — 드래그앤드랍 + 삭제 */}
        {songFormBlocks.length > 0 && (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "12px", padding: "12px", backgroundColor: "#fafafa", borderRadius: "12px", border: "1px solid #e5e5e5" }}>
            {songFormBlocks.map((blockId, idx) => {
              const block = SONG_BLOCKS.find((b) => b.id === blockId);
              if (!block) return null;
              const isDragging = dragIdx === idx;
              const isDragOver = dragOverIdx === idx;
              return (
                <div key={idx}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                  onDrop={() => {
                    if (dragIdx === null || dragIdx === idx) return;
                    const next = [...songFormBlocks];
                    const [moved] = next.splice(dragIdx, 1);
                    next.splice(idx, 0, moved);
                    setSongFormBlocks(next);
                    setDragIdx(null);
                    setDragOverIdx(null);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    padding: "4px 10px", borderRadius: "8px",
                    backgroundColor: block.color + "18",
                    border: isDragOver ? `2px solid ${block.color}` : `1px solid ${block.color}40`,
                    fontSize: "11px", fontWeight: 600, color: block.color,
                    cursor: "grab", opacity: isDragging ? 0.4 : 1,
                    transition: "opacity 0.15s, border 0.15s",
                  }}>
                  <span style={{ cursor: "grab", marginRight: "2px", fontSize: "10px", color: "#a3a3a3" }}>⠿</span>
                  <span>{block.label}</span>
                  <button onClick={() => {
                    const next = [...songFormBlocks];
                    next.splice(idx, 1);
                    setSongFormBlocks(next);
                  }} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: block.color, fontSize: "14px", lineHeight: 1, padding: "0 2px",
                  }}>×</button>
                </div>
              );
            })}
          </div>
        )}

        {/* 블록 추가 버튼 */}
        <SubLabel label="섹션 추가" />
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {SONG_BLOCKS.map((block) => (
            <button key={block.id}
              onClick={() => setSongFormBlocks((prev) => [...prev, block.id])}
              style={{
                padding: "5px 12px", borderRadius: "8px", fontSize: "10px", fontWeight: 600,
                backgroundColor: "#fff", color: block.color,
                border: `1px solid ${block.color}40`, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "4px",
              }}>
              <span style={{ fontSize: "14px", lineHeight: 1 }}>+</span> {block.label}
            </button>
          ))}
        </div>

        {/* 구조 미리보기 */}
        {songFormBlocks.length > 0 && (
          <p style={{ fontSize: "10px", color: "#a3a3a3", marginTop: "8px", fontFamily: "monospace" }}>
            {songFormBlocks.map((id) => SONG_BLOCKS.find((b) => b.id === id)?.label || id).join(" → ")}
          </p>
        )}
      </div>

      {/* 3. Density */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <SectionLabel label="Density" />
        <div style={{ display: "flex", gap: "6px" }}>
          {DENSITY_OPTIONS.map((d) => <Pill key={d.value} label={d.label} selected={density === d.value} onClick={() => setDensity(d.value)} />)}
        </div>
        {density && <p style={{ fontSize: "10px", color: "#a3a3a3", marginTop: "6px" }}>{DENSITY_OPTIONS.find((d) => d.value === density)?.desc}</p>}
      </div>

      {/* 3. EMOTION ARC */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <SectionLabel label="Emotion Arc" />
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {EMOTION_ARCS.map((arc, i) => <Pill key={arc.label} label={arc.label} selected={emotionArc === i} onClick={() => setEmotionArc(i)} />)}
        </div>
        {emotionArc >= 0 && (
          <>
            <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "40px", marginTop: "10px", padding: "0 4px" }}>
              {EMOTION_ARCS[emotionArc].bars.map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h * 7}px`,
                  backgroundColor: h >= 4 ? "#f97316" : h >= 2 ? "#fdba74" : "#fed7aa",
                  borderRadius: "3px", transition: "all 0.3s ease",
                }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", padding: "0 4px" }}>
              <span style={{ fontSize: "9px", color: "#d4d4d4" }}>Verse</span>
              <span style={{ fontSize: "9px", color: "#d4d4d4" }}>Chorus</span>
              <span style={{ fontSize: "9px", color: "#d4d4d4" }}>Bridge</span>
              <span style={{ fontSize: "9px", color: "#d4d4d4" }}>Outro</span>
            </div>
          </>
        )}
      </div>

      {/* 4. BANNED WORDS */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SectionLabel label="Banned Words" />
          <button onClick={() => setShowBannedEdit(!showBannedEdit)}
            style={{ fontSize: "10px", color: "#a3a3a3", background: "none", border: "none", cursor: "pointer" }}>
            {showBannedEdit ? "닫기" : "편집"}
          </button>
        </div>
        {showBannedEdit ? (
          <textarea value={bannedWords} onChange={(e) => setBannedWords(e.target.value)}
            style={{ width: "100%", minHeight: "60px", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "8px", fontSize: "11px", fontFamily: "monospace", resize: "vertical", outline: "none" }}
            placeholder="쉼표로 구분" />
        ) : (
          <p style={{ fontSize: "10px", color: "#a3a3a3", lineHeight: "1.6" }}>{bannedWords}</p>
        )}
      </div>

      {/* 생성 영역 */}
      <div style={{ padding: "20px" }}>
        {/* 로딩 */}
        {generating && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <svg className="animate-spin" style={{ margin: "0 auto 16px" }} width="32" height="32" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="4" fill="none" />
              <path style={{ opacity: 0.75 }} fill="#f97316" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#0a0a0a" }}>가사 생성 중...</p>
          </div>
        )}

        {/* 에러 */}
        {!generating && error && (
          <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", color: "#dc2626" }}>{error}</p>
          </div>
        )}

        {/* 생성 결과 */}
        {!generating && generatedLyrics && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <SectionLabel label="생성된 가사" />
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={handleCopyLyrics} style={{
                  padding: "5px 12px", borderRadius: "9999px", fontSize: "10px", fontWeight: 600,
                  backgroundColor: copied ? "#f0fdf4" : "#fff", color: copied ? "#16a34a" : "#a3a3a3",
                  border: copied ? "1px solid #bbf7d0" : "1px solid #e5e5e5", cursor: "pointer",
                }}>{copied ? "복사됨!" : "복사"}</button>
                <button onClick={handleGenerate} style={{
                  padding: "5px 12px", borderRadius: "9999px", fontSize: "10px", fontWeight: 600,
                  backgroundColor: "#fff7ed", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)", cursor: "pointer",
                }}>다시 생성</button>
              </div>
            </div>
            <pre style={{
              fontSize: "12px", color: "#0a0a0a", whiteSpace: "pre-wrap", lineHeight: "1.7",
              fontFamily: "monospace", maxHeight: "500px", overflowY: "auto",
              padding: "16px", backgroundColor: "#fafafa", borderRadius: "12px", border: "1px solid #e5e5e5",
            }}>{generatedLyrics}</pre>
            <p style={{ fontSize: "10px", color: "#a3a3a3", marginTop: "8px", textAlign: "center" }}>
              Suno의 Lyrics 필드에 붙여넣으세요
            </p>
          </div>
        )}

        {/* 생성 버튼 */}
        {!generating && !generatedLyrics && (
          !isReady ? (
            <p style={{ fontSize: "12px", color: "#d4d4d4", fontWeight: 500, textAlign: "center", padding: "12px 0" }}>
              Vocal Profile + Density + Emotion Arc를 모두 선택해주세요
            </p>
          ) : (
            <button onClick={handleGenerate} style={{
              width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "#f97316",
              color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              가사 생성하기
            </button>
          )
        )}
      </div>
    </div>
  );
}
