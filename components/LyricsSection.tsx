"use client";

import { useState, useRef, useEffect } from "react";
import { buildLyricsRules, DEFAULT_BANNED_WORDS } from "@/lib/lyricsRules";
import { buildProsePoetryPrompt } from "@/lib/essayEngine";
import { calculateCost } from "@/lib/costTracker";
import { Provider } from "./ApiKeyGate";
import LyricsPostProcess from "./LyricsPostProcess";

interface LyricsSectionProps {
  lyricsContent: string;
  style: string;
  language: string;
  currentSettings?: Record<string, string>;
  apiKey: string;
  provider: Provider;
  onLyricsUpdate?: (lyrics: string) => void;
  onRegenerateStyle?: () => Promise<void>;
  autoGenerate?: boolean;
  onCostAdd?: (costUsd: number) => void;
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

// === 작법 기법 태그 ===
const TECHNIQUE_TAGS = [
  { id: "parallelism", label: "대구법", desc: "미러링/대립 구조로 긴장감과 리듬 생성", emoji: "⟷" },
  { id: "internal_rhyme", label: "내부라임", desc: "줄 안에서 모음/자음 흐름을 연결", emoji: "🔗" },
  { id: "show_dont_tell", label: "장면묘사", desc: "감정을 직접 말하지 않고 사물/행동으로 표현", emoji: "👁" },
  { id: "rhythm_markers", label: "리듬마커", desc: "—, (), ~, 의성어로 호흡/끊김/에코 표현", emoji: "—" },
  { id: "repetition_hook", label: "반복훅", desc: "핵심 구절을 의도적으로 반복해 기억에 남김", emoji: "🔁" },
  { id: "object_motif", label: "소품모티프", desc: "2~3개 사물을 반복 사용하되 맥락을 변화", emoji: "🔑" },
  { id: "punchline", label: "펀치라인", desc: "반전/임팩트가 있는 결정적 한 줄", emoji: "💥" },
  { id: "ko_en_mix", label: "한영교차", desc: "한국어+영어를 교차 배치해 라임 강화", emoji: "🌐" },
  { id: "bounce", label: "바운스", desc: "짧은 줄과 긴 줄을 교차해 리듬 평탄화 방지", emoji: "📊" },
  { id: "memory_loop", label: "메모리루프", desc: "마지막 훅이 첫 훅을 회수하는 폐쇄 루프", emoji: "♻" },
  { id: "metaphor", label: "비유/은유", desc: "상징과 은유로 가사에 깊이를 더함", emoji: "🌀" },
  { id: "emotion_cross", label: "감정교차", desc: "감정을 사물에 이입시켜 간접 표현", emoji: "🪞" },
];

// === 버튼 컴포넌트 ===
function Pill({ label, selected, dimmed, onClick }: { label: string; selected: boolean; dimmed?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: "9999px", fontSize: "11px",
      fontWeight: selected ? 600 : 400,
      backgroundColor: selected ? "#0a0a0a" : "#fff",
      color: selected ? "#fff" : dimmed ? "#d4d4d4" : "#0a0a0a",
      border: selected ? "1px solid #0a0a0a" : dimmed ? "1px solid #e5e5e5" : "1px solid #a3a3a3",
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
  style, language, currentSettings, apiKey, provider, onLyricsUpdate, onRegenerateStyle, autoGenerate, onCostAdd,
}: LyricsSectionProps) {
  // 핵심 문장 — Chat Flow에서 가져오되 수정 가능
  const [coreMessage, setCoreMessage] = useState(currentSettings?.oneLiner || "");

  // 언어
  const [lyricsLang, setLyricsLang] = useState(language || "");

  // 레퍼런스 곡
  const [reference, setReference] = useState("");
  const [refAnalysis, setRefAnalysis] = useState("");
  const [analyzingRef, setAnalyzingRef] = useState(false);

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

  // 작법 기법 태그 — 기본 전부 ON
  const [techniques, setTechniques] = useState<Record<string, boolean>>(
    () => Object.fromEntries(TECHNIQUE_TAGS.map((t) => [t.id, true]))
  );

  const toggleTechnique = (id: string) => {
    setTechniques((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 트랙 관리
  const [tracks, setTracks] = useState<{ id: number; lyrics: string }[]>([]);
  const [activeTrack, setActiveTrack] = useState(0); // 현재 보고 있는 트랙 인덱스
  const trackNumber = tracks.length;

  // 생성 상태
  const [generating, setGenerating] = useState(false);
  const [generatedLyrics, setGeneratedLyrics] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // 선택 완료 여부
  const isReady = lyricsLang && songFormBlocks.length >= 3 && density && emotionArc >= 0 && vpVoice >= 0 && vpTimbre >= 0 && vpDelivery >= 0 && vpReverb >= 0 && vpEvolution >= 0;

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
    const langLabel = lyricsLang === "ko" ? "한국어" : lyricsLang === "en" ? "English" : lyricsLang === "ja" ? "日本語" : "한국어 + English 믹스";
    const genre = currentSettings?.genre || "";
    const genreGuide = GENRE_GUIDES[genre] || "";

    const settingsLines: string[] = [];
    if (currentSettings?.genre) settingsLines.push(`장르: ${currentSettings.genre}`);
    if (currentSettings?.vibe) settingsLines.push(`느낌: ${currentSettings.vibe}`);
    if (currentSettings?.era) settingsLines.push(`시대감: ${currentSettings.era}`);
    if (currentSettings?.texture) settingsLines.push(`질감: ${currentSettings.texture}`);
    if (currentSettings?.tempo) settingsLines.push(`템포: ${currentSettings.tempo}`);
    if (currentSettings?.instruments) settingsLines.push(`악기: ${currentSettings.instruments}`);
    if (currentSettings?.reverb) settingsLines.push(`리버브: ${currentSettings.reverb}`);

    const parts: string[] = [];

    // STEP 1: 산문시 생성 (가사의 원재료) — 항상 실행
    const topic = coreMessage.trim() || settingsLines.join(", ") || genre || "자유 주제";
    parts.push(buildProsePoetryPrompt(
      topic,
      genre,
      lyricsLang,
      reference.trim() && refAnalysis ? `레퍼런스 "${reference.trim()}" 분석:\n${refAnalysis}` : undefined
    ));
    parts.push(``);

    // STEP 2: 독백 → 가사 작성
    parts.push(`=== STEP 2: 독백을 바탕으로 가사 작성 ===`);
    parts.push(`위 독백의 감정, 모티프, 반복 구절을 가져와서 "${genre}" 장르의 가사를 새로 써라.`);
    parts.push(`독백을 그대로 옮기거나 번역하지 마라. 독백은 "감정의 씨앗"일 뿐이다.`);
    parts.push(`가사는 장르의 작법에 맞게 완전히 새로 쓰되, 독백의 핵심 감정과 모티프만 가져와라.`);
    parts.push(`- 독백에서 자연스럽게 반복된 구절 → 훅으로 발전시켜라`);
    parts.push(`- 독백의 모티프(사물/장면) → 가사 전체에서 의미가 변하며 재등장`);
    parts.push(`- 장르별 음절수, 문장 길이, 애드립, 리듬감을 철저히 따라라`);
    parts.push(``);

    parts.push(``);
    parts.push(`=== 가사 작성 규칙 ===`);
    parts.push(buildLyricsRules(bannedWords));
    parts.push(``);

    if (settingsLines.length > 0) {
      parts.push(`=== 곡 설정 ===`, settingsLines.join("\n"), ``);
    }

    parts.push(`=== Style of Music ===`, style, ``);
    parts.push(`=== VOCAL PROFILE (가사 최상단에 그대로 포함) ===`, buildVocalProfile(), ``);
    // 송폼 → 라벨로 변환
    const songFormLabels = songFormBlocks.map((id) => SONG_BLOCKS.find((b) => b.id === id)?.label || id);

    if (reference.trim() && refAnalysis) {
      parts.push(`=== 레퍼런스 곡 — 반드시 적용 ===`);
      parts.push(`레퍼런스: "${reference.trim()}"`);
      parts.push(``);
      parts.push(refAnalysis);
      parts.push(``);
      parts.push(`위 분석 결과를 가사에 반드시 반영해라:`);
      parts.push(`1. "장르 가사법에서 따라야 할 것 3가지"를 그대로 적용`);
      parts.push(`2. "모티프 운용법에서 배울 것"을 이번 가사의 모티프 구조에 적용`);
      parts.push(`3. "수사법 중 적용할 것"을 가사 작성 시 실제로 사용`);
      parts.push(`4. 레퍼런스의 구조(Verse/Chorus/Bridge 역할 분배)를 참고`);
      parts.push(`5. 라임/플로우 패턴을 참고하되, 가사 내용은 완전히 새로 써라`);
      parts.push(`아티스트명/곡명 직접 언급 금지. 가사 베끼기 금지.`);
      parts.push(``);
    }

    parts.push(`=== 가사 구조 ===`);
    if (lyricsLang === "ko") {
      parts.push(`가사 언어: 한국어 전용. 영어 단어, 영어 문장, 영어 감탄사 모두 절대 금지. 100% 한국어만 사용. "yeah", "oh", "baby" 같은 영어도 금지. 한국어 감탄사("아", "오", "음")만 허용.`);
    } else if (lyricsLang === "en") {
      parts.push(`가사 언어: English only. No Korean, no Japanese. 100% English lyrics.`);
    } else if (lyricsLang === "ja") {
      parts.push(`가사 언어: 日本語のみ. 英語禁止、韓国語禁止. 100%日本語で作成.`);
    } else {
      parts.push(`가사 언어: 한국어 + English 믹스. 자연스러운 한영 교차 허용.`);
    }
    parts.push(`송폼 구조: ${songFormLabels.join(" → ")}`);
    parts.push(`가사 밀도: ${selectedDensity.desc}`);
    parts.push(`감정 흐름: ${selectedArc.value}`);
    parts.push(``);

    if (genreGuide) {
      parts.push(`=== 장르 작법 (필수 적용) ===`);
      parts.push(`이 장르의 가사법을 반드시 따라라. 위 "가사 작성 규칙"의 장르별 작법 섹션도 함께 적용할 것.`);
      parts.push(genreGuide);
      parts.push(``);
    }

    // 기법 태그 → 강조/약화 지침
    const enabledTechs = TECHNIQUE_TAGS.filter((t) => techniques[t.id]);
    const disabledTechs = TECHNIQUE_TAGS.filter((t) => !techniques[t.id]);

    if (enabledTechs.length > 0) {
      parts.push(`=== 적극 활용할 기법 ===`);
      enabledTechs.forEach((t) => parts.push(`- ${t.label}: ${t.desc}`));
      parts.push(``);
    }

    if (disabledTechs.length > 0) {
      parts.push(`=== 사용하지 말 것 ===`);
      disabledTechs.forEach((t) => parts.push(`- ${t.label}: 이 기법은 이번 가사에서 사용 금지`));
      parts.push(``);
    }

    parts.push(`=== 출력 ===`);
    parts.push(`1. VOCAL PROFILE 명령어를 맨 위에 그대로 출력`);
    parts.push(`2. 각 섹션: [SECTION] + [VOCAL_PROMPT] + [LAYER] + [Texture] + 가사. 메타데이터는 태그 3~5개로 짧게 (긴 문장 금지)`);
    parts.push(`3. 감정 흐름에 따라 VOCAL_PROMPT와 LAYER 강도를 섹션마다 변화`);
    parts.push(`4. 코드블록 없이 텍스트만 출력`);
    parts.push(`5. Suno Lyrics 필드에 바로 붙여넣을 수 있는 형태`);

    return parts.join("\n");
  };

  // 스트리밍 텍스트 + 자동 스크롤 (사용자 스크롤 시 해제)
  const [streamingLyrics, setStreamingLyrics] = useState("");
  const streamRef = useRef<HTMLPreElement>(null);
  const userScrolledRef = useRef(false);

  // 퀵스타트: 언어/성별 선택 모달
  const [quickModal, setQuickModal] = useState(false);
  const [quickLang, setQuickLang] = useState("ko");
  const [quickVoice, setQuickVoice] = useState(1); // 남성 중음
  const [autoStarted, setAutoStarted] = useState(false);
  const prevStyleRef = useRef("");

  useEffect(() => {
    if (!autoGenerate || !style || style.length < 50 || autoStarted || generating || tracks.length > 0) return;
    if (style === prevStyleRef.current) return;
    prevStyleRef.current = style;
    // 모달 표시
    setQuickModal(true);
  }, [autoGenerate, style, generating, tracks.length, autoStarted]);

  // 모달에서 확인 후 실행
  const handleQuickConfirm = () => {
    setQuickModal(false);
    setAutoStarted(true);

    const vt = quickVoice, tm = 3, ar = 0, dl = 1, rv = 1, ev = 3;
    setLyricsLang(quickLang); setDensity("medium"); setEmotionArc(0);
    setVpVoice(vt); setVpTimbre(tm); setVpArticulation(ar);
    setVpDelivery(dl); setVpReverb(rv); setVpEvolution(ev);

    const genre = currentSettings?.genre?.toLowerCase() || "";
    let form: string[];
    if (genre.includes("hip") || genre.includes("rap") || genre.includes("trap")) {
      form = ["verse", "hook", "verse", "hook", "bridge", "hook", "outro"];
    } else if (genre.includes("ballad") || genre.includes("folk")) {
      form = ["verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"];
    } else {
      form = ["verse", "pre", "chorus", "verse", "pre", "chorus", "bridge", "chorus", "outro"];
    }
    setSongFormBlocks(form);

    const refText = (currentSettings as Record<string, string>)?._reference || "";
    if (refText) setReference(refText);
    const core = currentSettings?.oneLiner || coreMessage || "";

    // 가사 생성 (직접 프롬프트, style 완성값 사용)
    const run = async () => {
      setGenerating(true);
      setStreamingLyrics("");
      setTimeout(() => streamRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

      const formLabels = form.map((id) => SONG_BLOCKS.find((b) => b.id === id)?.label || id);
      const vp = [
        `[VOCAL_PROFILE: ${VP_VOICE_TYPE[vt].value.split(",")[0]}, ${VP_TIMBRE[tm].value.split(",")[0]}, ${VP_DELIVERY[dl].value.split(",")[0]}]`,
        `[VOICE_TYPE: ${VP_VOICE_TYPE[vt].value}]`, `[TIMBRE: ${VP_TIMBRE[tm].value}]`,
        `[DELIVERY: ${VP_DELIVERY[dl].value}]`, `[REVERB: ${VP_REVERB[rv].value}]`,
        `[Evolution: ${VP_EVOLUTION[ev].value}]`,
      ].join("\n");

      const langLabel = quickLang === "ko" ? "한국어 — 반드시 한국어로만. 영어 금지." :
        quickLang === "en" ? "English only. No Korean." :
        quickLang === "ja" ? "日本語のみ." : "한국어 + English 믹스.";

      const prompt = [
        `아래 설정에 맞는 Suno v5.5용 가사를 작성해줘.`,
        core ? `\n=== 핵심 문장 ===\n"${core}"\n` : "",
        refText ? `=== 레퍼런스 곡 (50% 반영) ===\n"${refText}"의 구조/진행법/작성법을 50% 참고. 아티스트명/곡명 언급 금지.\n` : "",
        `=== 가사 작성 규칙 ===\n${buildLyricsRules(bannedWords)}`,
        `\n=== Style of Music ===\n${style}`,
        `\n=== VOCAL PROFILE ===\n${vp}`,
        `\n=== 가사 구조 ===`,
        `가사 언어: ${langLabel}`,
        `송폼: ${formLabels.join(" → ")}`,
        `가사 밀도: Verse 4줄, Chorus 4줄`,
        `감정 흐름: ${EMOTION_ARCS[0].value}`,
        `\n=== 출력 ===\n1. VOCAL PROFILE 맨 위에 출력\n2. 각 섹션: [SECTION] + [VOCAL_PROMPT] + [LAYER] + [Texture] + 가사. 메타데이터는 태그 3~5개로 짧게 (긴 문장 금지)\n3. 코드블록 없이 텍스트만`,
      ].join("\n");

      try {
        const res = await fetch("/api/lyrics-stream", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, apiKey, provider }),
        });
        if (!res.ok) { setError("가사 생성 실패"); setGenerating(false); setAutoStarted(false); return; }
        const reader = res.body?.getReader();
        if (!reader) { setGenerating(false); setAutoStarted(false); return; }
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const d = line.slice(6).trim();
            if (d === "[DONE]") break;
            try { const p = JSON.parse(d); if (p.text) { full += p.text; setStreamingLyrics(full); } } catch {}
          }
        }
        if (full) {
          setTracks([{ id: 1, lyrics: full }]);
          setActiveTrack(0);
          setGeneratedLyrics(full);
          setStreamingLyrics("");
          onLyricsUpdate?.(full);
        }
      } catch { setError("API 호출 실패"); setAutoStarted(false); }
      setGenerating(false);
    };

    run();
  };

  // 가사 sessionStorage 저장
  useEffect(() => {
    if (generatedLyrics) sessionStorage.setItem("r3_lyrics", generatedLyrics);
  }, [generatedLyrics]);

  // 가사 sessionStorage 복원
  useEffect(() => {
    const saved = sessionStorage.getItem("r3_lyrics");
    if (saved && !generatedLyrics && tracks.length === 0) {
      setGeneratedLyrics(saved);
      setTracks([{ id: 1, lyrics: saved }]);
      setActiveTrack(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 사용자 스크롤 감지
  useEffect(() => {
    if (!generating) { userScrolledRef.current = false; return; }
    const scrollParent = streamRef.current?.closest(".overflow-y-auto") as HTMLElement | null;
    const target = scrollParent || window;
    const handler = () => { userScrolledRef.current = true; };
    target.addEventListener("wheel", handler, { passive: true });
    target.addEventListener("touchmove", handler, { passive: true });
    return () => { target.removeEventListener("wheel", handler); target.removeEventListener("touchmove", handler); };
  }, [generating]);

  useEffect(() => {
    if (!streamingLyrics || userScrolledRef.current) return;
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
    const scrollParent = streamRef.current?.closest(".overflow-y-auto") as HTMLElement | null;
    if (scrollParent) scrollParent.scrollTop = scrollParent.scrollHeight;
  }, [streamingLyrics]);

  // API 호출 (스트리밍)
  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setStreamingLyrics("");
    const promptText = buildFullPrompt();
    setTimeout(() => streamRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    try {
      const res = await fetch("/api/lyrics-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, apiKey, provider, useOpus: true }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "생성 실패");
        setGenerating(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setError("스트림 없음"); setGenerating(false); return; }

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) { fullText += parsed.text; setStreamingLyrics(fullText); }
          } catch { /* 무시 */ }
        }
      }

      if (fullText) {
        const newTrack = { id: trackNumber + 1, lyrics: fullText };
        setTracks((prev) => [...prev, newTrack]);
        setActiveTrack(tracks.length);
        setGeneratedLyrics(fullText);
        setStreamingLyrics("");
        onLyricsUpdate?.(fullText);
        // 비용 추적 (Opus)
        const cost = calculateCost(promptText, fullText, provider || "claude", "opus");
        onCostAdd?.(cost.costUsd);
      }
    } catch {
      setError("API 호출 실패");
    }
    setGenerating(false);
  };

  // 다음 트랙 생성 — 스타일 변주 + 새 가사 (스트리밍)
  const handleGenerateNextTrack = async () => {
    setError("");
    setStreamingLyrics("");
    // 페이지 상단으로 스크롤 (스타일 스트리밍이 상단에서 시작)
    window.scrollTo({ top: 0, behavior: "smooth" });
    const scrollParent = streamRef.current?.closest(".overflow-y-auto") as HTMLElement | null;
    if (scrollParent) scrollParent.scrollTop = 0;

    // 1. 스타일 재생성 (변주) — 완료까지 대기
    if (onRegenerateStyle) {
      await onRegenerateStyle();
    }

    // 2. 가사 생성 (스트리밍)
    setGenerating(true);
    setTimeout(() => streamRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    try {
      const nextNum = trackNumber + 1;
      const prevHooks = tracks.map((t) => {
        const m = t.lyrics.match(/\[SECTION: Hook\][\s\S]*?\n([^\[\n]+)/);
        return m ? `Track ${t.id}: "${m[1].trim()}"` : null;
      }).filter(Boolean).join("\n");
      const prompt = buildFullPrompt() + `\n\n${prevHooks ? `=== 이전 트랙 Hook (겹치면 안 됨) ===\n${prevHooks}\n\n` : ""}=== 앨범 변주 지침 (Track ${nextNum}) ===
이것은 같은 앨범의 ${nextNum}번째 곡이다. 핵심 규칙:

1. 같은 앨범의 "다른 곡"이다 — 비슷한 곡이 아니라 완전히 다른 곡
2. 장르/무드 방향은 유지하되, 다음을 모두 바꿔라:
   - BPM을 ±10~20 변경
   - 리듬 패턴을 완전히 다르게 (예: 직진→스윙, 4/4→셔플)
   - 핵심 악기 1~2개 교체 (예: 피아노→기타, 808→라이브드럼)
   - 곡 구조의 에너지 분배를 반전 (1번이 잔잔→폭발이었으면 이번은 폭발→잔잔)
3. 가사 변주 원칙:
   - 같은 화자의 감성을 완전히 다른 모티프로 표현
   - 새로운 환경, 새로운 감정, 새로운 시선으로 바라보는 가사
   - 이전 곡이 "비 오는 밤의 그리움"이었다면 이번은 "빈 커피잔의 기다림"처럼 — 감성의 결은 같되 표현의 세계가 다름
   - Hook은 반드시 새로운 구절 — 이전 곡과 한 단어도 겹치면 안 됨
   - 소품/이미지/배경을 전부 교체
4. 마치 같은 사람이 다른 날, 다른 장소에서 다른 마음으로 쓴 곡처럼`;
      const res = await fetch("/api/lyrics-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, apiKey, provider, useOpus: true }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "생성 실패");
        setGenerating(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setError("스트림 없음"); setGenerating(false); return; }

      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") break;
          try { const p = JSON.parse(d); if (p.text) { fullText += p.text; setStreamingLyrics(fullText); } } catch {}
        }
      }

      if (fullText) {
        const newTrack = { id: nextNum, lyrics: fullText };
        setTracks((prev) => [...prev, newTrack]);
        setActiveTrack(tracks.length);
        setGeneratedLyrics(fullText);
        setStreamingLyrics("");
        onLyricsUpdate?.(fullText);
      }
    } catch {
      setError("API 호출 실패");
    }
    setGenerating(false);
  };

  // 산문시/STEP 마커 제거하고 가사만 추출
  const extractLyricsOnly = (text: string): string => {
    return text
      .replace(/---PROSE---[\s\S]*?---END_PROSE---\n*/g, "")
      .replace(/^=== STEP \d[\s\S]*?(?=\[VOCAL_PROFILE|\[SECTION|$)/gm, "")
      .trim();
  };

  const handleCopyLyrics = async () => {
    await navigator.clipboard.writeText(extractLyricsOnly(generatedLyrics));
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

      {/* 0. 핵심 문장 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <SectionLabel label="Core Message" sub="이 곡이 전달하려는 핵심 한 줄 (가사의 방향을 결정합니다)" />
        <textarea
          value={coreMessage}
          onChange={(e) => setCoreMessage(e.target.value)}
          placeholder="예: 새벽 4시, 아직도 너의 흔적이 남은 이 방에서"
          style={{
            width: "100%", minHeight: "56px", border: "1px solid #e5e5e5", borderRadius: "12px",
            padding: "12px 14px", fontSize: "13px", resize: "vertical", outline: "none",
            lineHeight: "1.6", color: "#0a0a0a",
          }}
        />
      </div>

      {/* 1. LANGUAGE */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <SectionLabel label="Language" sub="가사 언어를 선택하세요" />
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { label: "한국어", value: "ko" },
            { label: "English", value: "en" },
            { label: "日本語", value: "ja" },
            { label: "KO + EN", value: "mixed" },
          ].map((lang) => (
            <Pill key={lang.value} label={lang.label}
              selected={lyricsLang === lang.value}
              dimmed={!!lyricsLang && lyricsLang !== lang.value}
              onClick={() => setLyricsLang(lang.value)} />
          ))}
        </div>
      </div>

      {/* 2. REFERENCE */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <SectionLabel label="Reference" sub="참고할 곡이 있으면 입력 후 분석 버튼을 눌러주세요 (선택사항)" />
        <div style={{ display: "flex", gap: "8px", marginBottom: refAnalysis ? "12px" : "0" }}>
          <input
            type="text"
            value={reference}
            onChange={(e) => { setReference(e.target.value); setRefAnalysis(""); }}
            placeholder='예: 아이유 - 밤편지'
            style={{
              flex: 1, border: "1px solid #e5e5e5", borderRadius: "12px",
              padding: "12px 14px", fontSize: "13px", outline: "none", color: "#0a0a0a",
            }}
          />
          {reference.trim() && !refAnalysis && (
            <button
              onClick={async () => {
                setAnalyzingRef(true);
                try {
                  const res = await fetch("/api/lyrics-stream", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      prompt: `"${reference.trim()}" 이 곡을 분석해줘.

파트1 — 장르 + 가사법 분석 (한국어, 각 항목 2~3줄):
1. 장르 판별: 이 곡의 장르와 서브장르. 해당 장르의 가사 작법 특성은 무엇인가.
2. 모티프: 이 곡의 핵심 모티프는 무엇인가. 어떤 발견/관찰/인사이트에서 나왔는가. 모티프가 곡 전체에서 어떻게 발전하는가.
3. 수사법: 도치, 대구, 직유, 은유, 비유, 영탄, 대치 등 어떤 수사법을 사용했는가. 각각의 효과는 무엇인가.
4. 구조: Verse/Chorus/Bridge 각 역할과 서사 전개. 감정 흐름과 Hook 기억법.
5. 라임/플로우: 라임 배치(각운, 내부라임, 두운 등). 줄 길이와 리듬 패턴.
6. 이 곡만의 작법: 다른 곡과 구분되는 독특한 가사 작성법.

파트2 — 가사 생성 가이드 (이 분석을 바탕으로 새 가사를 쓸 때 따를 지침):
- 이 곡의 장르 가사법에서 반드시 따라야 할 것 3가지
- 이 곡의 모티프 운용법에서 배울 것
- 이 곡의 수사법 중 적용할 것

파트2 — 설정 추천 (JSON, 마지막에 추가):
---SETTINGS---
{"voiceType":0~5,"timbre":0~5,"delivery":0~5,"reverb":0~5,"evolution":0~4,"density":"short/medium/long","emotionArc":0~3,"songForm":"pop/hiphop/rnb/ballad/edm/rock/lofi/trot"}
voiceType: 0=남저 1=남중 2=남고 3=여저 4=여중 5=여고
timbre: 0=허스키 1=매끈 2=공기감 3=아날로그 4=파워풀 5=소울풀
delivery: 0=속삭임→벨팅 1=대화체 2=감정폭발 3=나른한 4=랩플로우 5=일정한힘
reverb: 0=드라이 1=룸 2=확장형 3=홀 4=빈티지 5=LoFi
evolution: 0=속삭임→열정 1=일관된힘 2=폭발→침잠 3=점진적상승 4=감정롤러코스터
emotionArc: 0=잔잔→폭발 1=일정하게 2=폭발→잔잔 3=롤러코스터
songForm: pop/hiphop/rnb/ballad/edm/rock/lofi/trot 중
density: short/medium/long 중`,
                      apiKey, provider,
                    }),
                  });
                  if (!res.ok) { setAnalyzingRef(false); return; }
                  const reader = res.body?.getReader();
                  if (!reader) { setAnalyzingRef(false); return; }
                  const decoder = new TextDecoder();
                  let full = "";
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    for (const line of decoder.decode(value, { stream: true }).split("\n")) {
                      if (!line.startsWith("data: ")) continue;
                      const d = line.slice(6).trim();
                      if (d === "[DONE]") break;
                      try { const p = JSON.parse(d); if (p.text) { full += p.text; setRefAnalysis(full); } } catch {}
                    }
                  }
                  // 설정 자동 채우기 — 다양한 JSON 포맷 대응
                  const settingsBlock = full.match(/---SETTINGS---[\s\S]*/)?.[0] || "";
                  const jsonMatch = settingsBlock.match(/\{[\s\S]*?\}/);
                  if (jsonMatch) {
                    try {
                      const s = JSON.parse(jsonMatch[0]);
                      if (typeof s.voiceType === "number") setVpVoice(s.voiceType);
                      if (typeof s.timbre === "number") setVpTimbre(s.timbre);
                      if (typeof s.delivery === "number") setVpDelivery(s.delivery);
                      if (typeof s.reverb === "number") setVpReverb(s.reverb);
                      if (typeof s.evolution === "number") setVpEvolution(s.evolution);
                      if (s.density) setDensity(s.density);
                      if (typeof s.emotionArc === "number") setEmotionArc(s.emotionArc);
                      if (s.songForm) {
                        const formMap: Record<string, string[]> = {
                          pop: ["verse", "pre", "chorus", "verse", "pre", "chorus", "bridge", "chorus", "outro"],
                          hiphop: ["verse", "hook", "verse", "hook", "bridge", "hook", "outro"],
                          rnb: ["verse", "hook", "chorus", "verse", "hook", "chorus", "bridge", "chorus", "outro"],
                          ballad: ["verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
                          edm: ["verse", "pre", "chorus", "verse", "pre", "chorus", "bridge", "chorus", "outro"],
                          rock: ["verse", "pre", "chorus", "verse", "pre", "chorus", "bridge", "chorus", "outro"],
                          lofi: ["verse", "chorus", "verse", "chorus", "bridge", "outro"],
                          trot: ["verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
                        };
                        setSongFormBlocks(formMap[s.songForm] || formMap.pop);
                      }
                      // 분석 텍스트에서 SETTINGS 부분 + 코드블록 제거
                      setRefAnalysis(full.replace(/---SETTINGS---[\s\S]*$/, "").replace(/```[\s\S]*?```/g, "").trim());
                    } catch { /* 파싱 실패 — 분석 텍스트 그대로 유지 */ }
                  }
                } catch {}
                setAnalyzingRef(false);
              }}
              disabled={analyzingRef}
              style={{
                padding: "12px 20px", borderRadius: "12px", fontSize: "12px", fontWeight: 600,
                backgroundColor: analyzingRef ? "#e5e5e5" : "#0a0a0a",
                color: analyzingRef ? "#a3a3a3" : "#fff",
                border: "none", cursor: analyzingRef ? "wait" : "pointer", whiteSpace: "nowrap",
              }}
            >
              {analyzingRef ? "분석 중..." : "분석하기"}
            </button>
          )}
        </div>
        {refAnalysis && (
          <div style={{ padding: "12px", backgroundColor: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#16a34a", marginBottom: "6px" }}>분석 완료 — 가사 생성에 반영됩니다</p>
            <pre style={{ fontSize: "11px", color: "#525252", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>{refAnalysis}</pre>
          </div>
        )}
      </div>

      {/* 3. VOCAL PROFILE */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <SectionLabel label="Vocal Profile" sub="Suno가 보컬을 렌더링하는 방식을 결정합니다" />

        <SubLabel label="Voice Type" />
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {VP_VOICE_TYPE.map((v, i) => <Pill key={v.label} label={v.label} selected={vpVoice === i} dimmed={vpVoice >= 0 && vpVoice !== i} onClick={() => setVpVoice(i)} />)}
        </div>

        <SubLabel label="Timbre (음색)" />
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {VP_TIMBRE.map((t, i) => <Pill key={t.label} label={t.label} selected={vpTimbre === i} dimmed={vpTimbre >= 0 && vpTimbre !== i} onClick={() => setVpTimbre(i)} />)}
        </div>

        <SubLabel label="Articulation (발음)" />
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {VP_ARTICULATION.map((a, i) => <Pill key={a.label} label={a.label} selected={vpArticulation === i} dimmed={vpArticulation >= 0 && vpArticulation !== i} onClick={() => setVpArticulation(i)} />)}
        </div>

        <SubLabel label="Delivery (전달 방식)" />
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {VP_DELIVERY.map((d, i) => <Pill key={d.label} label={d.label} selected={vpDelivery === i} dimmed={vpDelivery >= 0 && vpDelivery !== i} onClick={() => setVpDelivery(i)} />)}
        </div>

        <SubLabel label="Reverb (공간감)" />
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
          {VP_REVERB.map((r, i) => <Pill key={r.label} label={r.label} selected={vpReverb === i} dimmed={vpReverb >= 0 && vpReverb !== i} onClick={() => setVpReverb(i)} />)}
        </div>

        <SubLabel label="Evolution (보컬 변화)" />
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {VP_EVOLUTION.map((e, i) => <Pill key={e.label} label={e.label} selected={vpEvolution === i} dimmed={vpEvolution >= 0 && vpEvolution !== i} onClick={() => setVpEvolution(i)} />)}
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
          {DENSITY_OPTIONS.map((d) => <Pill key={d.value} label={d.label} selected={density === d.value} dimmed={!!density && density !== d.value} onClick={() => setDensity(d.value)} />)}
        </div>
        {density && <p style={{ fontSize: "10px", color: "#a3a3a3", marginTop: "6px" }}>{DENSITY_OPTIONS.find((d) => d.value === density)?.desc}</p>}
      </div>

      {/* 3. EMOTION ARC */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <SectionLabel label="Emotion Arc" />
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {EMOTION_ARCS.map((arc, i) => <Pill key={arc.label} label={arc.label} selected={emotionArc === i} dimmed={emotionArc >= 0 && emotionArc !== i} onClick={() => setEmotionArc(i)} />)}
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
        {/* 스트리밍 생성 중 */}
        {generating && (
          <div style={{ padding: "16px", backgroundColor: "#0a0a0a", borderRadius: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f97316", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#a3a3a3" }}>가사 생성 중...</span>
            </div>
            {streamingLyrics ? (
              <pre ref={streamRef} style={{
                fontSize: "11px", color: "#d4d4d4", fontFamily: "monospace",
                whiteSpace: "pre-wrap", lineHeight: "1.6",
                maxHeight: "400px", overflowY: "auto",
              }}>{streamingLyrics}<span style={{ animation: "blink 1s infinite" }}>▊</span></pre>
            ) : (
              <p style={{ fontSize: "11px", color: "#525252" }}>AI가 가사를 작성하고 있습니다...</p>
            )}
            <style>{`
              @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
              @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            `}</style>
          </div>
        )}

        {/* 에러 */}
        {!generating && error && (
          <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", color: "#dc2626" }}>{error}</p>
          </div>
        )}

        {/* 생성 결과 */}
        {!generating && tracks.length > 0 && (
          <div>
            {/* 트랙 네비게이션 */}
            {tracks.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                {/* ← 이전 */}
                <button onClick={() => {
                  const prev = Math.max(0, activeTrack - 1);
                  setActiveTrack(prev);
                  setGeneratedLyrics(tracks[prev].lyrics);
                }} disabled={activeTrack === 0} style={{
                  width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #e5e5e5",
                  backgroundColor: activeTrack === 0 ? "#fafafa" : "#fff",
                  color: activeTrack === 0 ? "#d4d4d4" : "#0a0a0a",
                  cursor: activeTrack === 0 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  fontSize: "14px", fontWeight: 700,
                }}>←</button>

                {/* 트랙 탭들 */}
                <div style={{ display: "flex", gap: "4px", overflowX: "auto", flex: 1, paddingBottom: "2px" }}>
                  {tracks.map((track, idx) => (
                    <button key={track.id} onClick={() => {
                      setActiveTrack(idx);
                      setGeneratedLyrics(track.lyrics);
                    }} style={{
                      padding: "6px 14px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600,
                      backgroundColor: activeTrack === idx ? "#0a0a0a" : "#fff",
                      color: activeTrack === idx ? "#fff" : "#737373",
                      border: activeTrack === idx ? "1px solid #0a0a0a" : "1px solid #d4d4d4",
                      cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      Track {track.id}
                    </button>
                  ))}
                </div>

                {/* → 다음 */}
                <button onClick={() => {
                  const next = Math.min(tracks.length - 1, activeTrack + 1);
                  setActiveTrack(next);
                  setGeneratedLyrics(tracks[next].lyrics);
                }} disabled={activeTrack === tracks.length - 1} style={{
                  width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #e5e5e5",
                  backgroundColor: activeTrack === tracks.length - 1 ? "#fafafa" : "#fff",
                  color: activeTrack === tracks.length - 1 ? "#d4d4d4" : "#0a0a0a",
                  cursor: activeTrack === tracks.length - 1 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  fontSize: "14px", fontWeight: 700,
                }}>→</button>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <SectionLabel label={tracks.length > 1 ? `Track ${tracks[activeTrack]?.id} 가사` : "생성된 가사"} />
              <button onClick={handleCopyLyrics} style={{
                padding: "5px 12px", borderRadius: "9999px", fontSize: "10px", fontWeight: 600,
                backgroundColor: copied ? "#f0fdf4" : "#fff", color: copied ? "#16a34a" : "#a3a3a3",
                border: copied ? "1px solid #bbf7d0" : "1px solid #e5e5e5", cursor: "pointer",
              }}>{copied ? "복사됨!" : "복사"}</button>
            </div>
            <pre style={{
              fontSize: "12px", color: "#0a0a0a", whiteSpace: "pre-wrap", lineHeight: "1.7",
              fontFamily: "monospace", maxHeight: "400px", overflowY: "auto",
              padding: "16px", backgroundColor: "#fafafa", borderRadius: "12px", border: "1px solid #e5e5e5",
            }}>{(() => {
              // 산문시 부분 제거하고 가사만 표시
              const cleaned = generatedLyrics
                .replace(/---PROSE---[\s\S]*?---END_PROSE---\n*/g, "")
                .replace(/^=== STEP [12][\s\S]*?(?=\[VOCAL_PROFILE|\[SECTION|$)/gm, "")
                .trim();
              return cleaned || generatedLyrics;
            })()}</pre>

            {/* 산문시 보기 (접기/펼치기) */}
            {generatedLyrics.includes("---PROSE---") && (() => {
              const match = generatedLyrics.match(/---PROSE---\n?([\s\S]*?)---END_PROSE---/);
              if (!match) return null;
              return (
                <details style={{ marginTop: "8px" }}>
                  <summary style={{
                    fontSize: "11px", fontWeight: 600, color: "#f97316", cursor: "pointer",
                    padding: "8px 12px", backgroundColor: "#fff7ed", borderRadius: "10px",
                    border: "1px solid #fed7aa", userSelect: "none",
                  }}>
                    독백 원본 보기 (가사의 씨앗)
                  </summary>
                  <pre style={{
                    fontSize: "12px", color: "#525252", whiteSpace: "pre-wrap", lineHeight: "1.8",
                    fontFamily: "inherit", padding: "16px", backgroundColor: "#fffbeb",
                    borderRadius: "0 0 12px 12px", border: "1px solid #fed7aa", borderTop: "none",
                    maxHeight: "300px", overflowY: "auto",
                  }}>{match[1].trim()}</pre>
                </details>
              );
            })()}

            {/* 후처리 패널 — 클리셰 감지 + AI 채점 */}
            <LyricsPostProcess
              lyrics={generatedLyrics}
              apiKey={apiKey}
              provider={provider}
              onUpdate={(newLyrics) => {
                setGeneratedLyrics(newLyrics);
                // 현재 트랙도 업데이트
                setTracks((prev) =>
                  prev.map((t, i) => i === activeTrack ? { ...t, lyrics: newLyrics } : t)
                );
                onLyricsUpdate?.(newLyrics);
              }}
            />

            {/* 작법 기법 태그 토글 */}
            <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e5e5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.05em" }}>작법 기법 조정</p>
                <p style={{ fontSize: "9px", color: "#a3a3a3" }}>ON = 강화 / OFF = 제거</p>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                {TECHNIQUE_TAGS.map((tag) => {
                  const isOn = techniques[tag.id];
                  return (
                    <div key={tag.id} style={{ position: "relative" }} className="technique-tag-wrap">
                      <button onClick={() => toggleTechnique(tag.id)}
                        style={{
                          padding: "5px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600,
                          backgroundColor: isOn ? "#0a0a0a" : "#fff",
                          color: isOn ? "#fff" : "#d4d4d4",
                          border: isOn ? "1px solid #0a0a0a" : "1px solid #e5e5e5",
                          cursor: "pointer", transition: "all 0.15s ease",
                          display: "flex", alignItems: "center", gap: "4px",
                        }}>
                        <span style={{ fontSize: "12px" }}>{tag.emoji}</span>
                        {tag.label}
                      </button>
                      {/* 호버 툴팁 */}
                      <div className="technique-tooltip" style={{
                        position: "absolute", bottom: "calc(100% + 8px)", left: "0",
                        backgroundColor: "#0a0a0a", color: "#fff", borderRadius: "12px",
                        padding: "12px 16px", width: "260px", zIndex: 50,
                        pointerEvents: "none", opacity: 0, transition: "opacity 0.2s",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
                      }}>
                        <p style={{ fontSize: "11px", fontWeight: 700, marginBottom: "4px", color: "#f97316" }}>{tag.emoji} {tag.label}</p>
                        <p style={{ fontSize: "10px", color: "#a3a3a3", marginBottom: "8px", lineHeight: "1.5" }}>{tag.desc}</p>
                        <div style={{ position: "absolute", bottom: "-5px", left: "20px", transform: "rotate(45deg)", width: "10px", height: "10px", backgroundColor: "#0a0a0a" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <style>{`
                .technique-tag-wrap:hover .technique-tooltip { opacity: 1 !important; }
              `}</style>
              <button onClick={handleGenerate} style={{
                width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#f97316",
                color: "#fff", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                기법 조정 후 재생성
              </button>
            </div>

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

      {/* 앨범 트랙 추가 — 가사 생성 완료 시에만 표시 */}
      {!generating && generatedLyrics && (
        <div style={{ borderTop: "1px solid #e5e5e5", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              backgroundColor: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#0a0a0a" }}>
                Track {trackNumber + 1} — 다음 곡
              </p>
              <p style={{ fontSize: "10px", color: "#a3a3a3" }}>
                같은 톤 & 무드, 다른 가사
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleGenerateNextTrack}
              style={{
                flex: 1, padding: "12px", borderRadius: "10px",
                backgroundColor: "#0a0a0a", color: "#fff",
                fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer",
              }}
            >
              Style + Lyrics 모두 생성
            </button>
            <button
              onClick={async () => {
                setGenerating(true); setError(""); setStreamingLyrics("");
                try {
                  const nextNum = trackNumber + 1;
                  const prevH = tracks.map((t) => { const m = t.lyrics.match(/\[SECTION: Hook\][\s\S]*?\n([^\[\n]+)/); return m ? `Track ${t.id}: "${m[1].trim()}"` : null; }).filter(Boolean).join("\n");
                  const prompt = buildFullPrompt() + `\n\n${prevH ? `=== 이전 Hook (겹치면 안 됨) ===\n${prevH}\n\n` : ""}=== 앨범 변주 지침 (Track ${nextNum}) ===
같은 앨범 ${nextNum}번째 곡. Style 유지, 가사는 완전히 다르게:
- 같은 화자의 감성을 다른 모티프, 다른 환경, 다른 감정으로 표현
- 새로운 마음으로 바라보는 스타일로 다시 쓴 가사
- Hook 완전 새로 — 이전 곡과 한 단어도 겹치지 마
- 같은 사람이 다른 날, 다른 장소에서 다른 마음으로 쓴 곡처럼`;
                  const res = await fetch("/api/lyrics-stream", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt, apiKey, provider, useOpus: true }),
                  });
                  if (!res.ok) { const e = await res.json(); setError(e.error || "실패"); setGenerating(false); return; }
                  const reader = res.body?.getReader();
                  if (!reader) { setError("스트림 없음"); setGenerating(false); return; }
                  const decoder = new TextDecoder();
                  let fullText = "";
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    for (const line of decoder.decode(value, { stream: true }).split("\n")) {
                      if (!line.startsWith("data: ")) continue;
                      const d = line.slice(6).trim();
                      if (d === "[DONE]") break;
                      try { const p = JSON.parse(d); if (p.text) { fullText += p.text; setStreamingLyrics(fullText); } } catch {}
                    }
                  }
                  if (fullText) {
                    const newTrack = { id: nextNum, lyrics: fullText };
                    setTracks((prev) => [...prev, newTrack]);
                    setActiveTrack(tracks.length);
                    setGeneratedLyrics(fullText);
                    setStreamingLyrics("");
                    onLyricsUpdate?.(fullText);
                  }
                } catch { setError("API 호출 실패"); }
                setGenerating(false);
              }}
              style={{
                flex: 1, padding: "12px", borderRadius: "10px",
                backgroundColor: "#fff", color: "#0a0a0a",
                fontSize: "12px", fontWeight: 600, border: "1px solid #d4d4d4", cursor: "pointer",
              }}
            >
              Lyrics만 생성
            </button>
          </div>

          {trackNumber > 1 && (
            <p style={{ fontSize: "10px", color: "#a3a3a3", textAlign: "center", marginTop: "8px" }}>
              현재 {trackNumber}곡 생성됨
            </p>
          )}
        </div>
      )}

      {/* 퀵스타트 모달 — 언어/성별 선택 */}
      {quickModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setQuickModal(false)} />
          <div style={{ position: "relative", backgroundColor: "#fff", borderRadius: "20px", padding: "28px", width: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px", textAlign: "center" }}>가사 생성 설정</h3>

            <p style={{ fontSize: "11px", fontWeight: 600, color: "#737373", marginBottom: "8px" }}>가사 언어</p>
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
              {[{ l: "한국어", v: "ko" }, { l: "English", v: "en" }, { l: "日本語", v: "ja" }, { l: "KO+EN", v: "mixed" }].map((o) => (
                <button key={o.v} onClick={() => setQuickLang(o.v)} style={{
                  flex: 1, padding: "8px", borderRadius: "9999px", fontSize: "12px", fontWeight: quickLang === o.v ? 600 : 400,
                  backgroundColor: quickLang === o.v ? "#0a0a0a" : "#fff",
                  color: quickLang === o.v ? "#fff" : "#a3a3a3",
                  border: quickLang === o.v ? "1px solid #0a0a0a" : "1px solid #e5e5e5", cursor: "pointer",
                }}>{o.l}</button>
              ))}
            </div>

            <p style={{ fontSize: "11px", fontWeight: 600, color: "#737373", marginBottom: "8px" }}>보컬 타입</p>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "20px" }}>
              {VP_VOICE_TYPE.slice(0, 6).map((v, i) => (
                <button key={v.label} onClick={() => setQuickVoice(i)} style={{
                  padding: "6px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: quickVoice === i ? 600 : 400,
                  backgroundColor: quickVoice === i ? "#0a0a0a" : "#fff",
                  color: quickVoice === i ? "#fff" : "#a3a3a3",
                  border: quickVoice === i ? "1px solid #0a0a0a" : "1px solid #e5e5e5", cursor: "pointer",
                }}>{v.label}</button>
              ))}
            </div>

            <button onClick={handleQuickConfirm} style={{
              width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "#f97316",
              color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer",
            }}>
              가사 생성 시작
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
