"use client";

import { useState, useRef, useEffect } from "react";
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
  onRegenerateStyle?: () => Promise<void>;
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
  style, language, currentSettings, apiKey, provider, onLyricsUpdate, onRegenerateStyle,
}: LyricsSectionProps) {
  // 핵심 문장 — Chat Flow에서 가져오되 수정 가능
  const [coreMessage, setCoreMessage] = useState(currentSettings?.oneLiner || "");

  // 언어
  const [lyricsLang, setLyricsLang] = useState(language || "");

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

    const parts = [
      `아래 설정에 맞는 Suno v5.5용 가사를 작성해줘.`,
    ];

    // 핵심 문장 브레인스토밍 지침
    if (coreMessage.trim()) {
      parts.push(``);
      parts.push(`=== 핵심 문장 브레인스토밍 (가장 중요) ===`);
      parts.push(`"${coreMessage.trim()}"`);
      parts.push(``);
      parts.push(`이 핵심 문장을 아래 7가지 관점으로 해석하고, 가사 전체에 반영해라:`);
      parts.push(`1. 씨드 이미지 — 이 문장에서 가장 강렬한 시각적 이미지 1개를 뽑아 곡 전체의 모티프로 사용`);
      parts.push(`2. 감정 방향 — 이 문장이 품고 있는 감정의 정체와 온도를 파악해 Verse→Chorus→Bridge 감정 곡선에 반영`);
      parts.push(`3. 장면 고정 — 이 문장이 발화되는 물리적 공간/상황 1개를 설정하고 곡 전체의 배경으로 고정`);
      parts.push(`4. Hook 후보 — 이 문장을 4~10음절로 압축해 Hook Core Line 후보를 만들어라. 원문 그대로 써도 되고, 핵심만 뽑아도 됨`);
      parts.push(`5. 대립 축 — 이 문장에 숨은 대립(과거/현재, 나/너, 말/침묵, 움직임/정지 등)을 찾아 대구법의 축으로 활용`);
      parts.push(`6. 서사 기점 — 이 문장이 곡의 어느 지점인지 판단해라: 시작(설정)인지, 중간(갈등)인지, 끝(결말)인지. 그에 맞게 서사를 앞뒤로 확장`);
      parts.push(`7. 금지어 연상 차단 — 이 문장에서 연상되는 클리셰(금지 표현 목록 참조)를 의식적으로 피하고, 예상 밖의 이미지로 전개`);
    }

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

    parts.push(`=== 가사 구조 ===`);
    parts.push(`가사 언어: ${langLabel}`);
    parts.push(`송폼 구조: ${songFormLabels.join(" → ")}`);
    parts.push(`가사 밀도: ${selectedDensity.desc}`);
    parts.push(`감정 흐름: ${selectedArc.value}`);
    parts.push(``);

    if (genreGuide) {
      parts.push(`=== 장르 작법 ===`, genreGuide, ``);
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
    parts.push(`2. 각 섹션: [SECTION] + [VOCAL_PROMPT] + [LAYER] + [Texture] + 가사`);
    parts.push(`3. 감정 흐름에 따라 VOCAL_PROMPT와 LAYER 강도를 섹션마다 변화`);
    parts.push(`4. 코드블록 없이 텍스트만 출력`);
    parts.push(`5. Suno Lyrics 필드에 바로 붙여넣을 수 있는 형태`);

    return parts.join("\n");
  };

  // 스트리밍 텍스트 + 자동 스크롤
  const [streamingLyrics, setStreamingLyrics] = useState("");
  const streamRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (streamingLyrics) {
      // pre 내부 스크롤
      if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
      // 부모 스크롤 컨테이너도 하단으로
      const scrollParent = streamRef.current?.closest(".overflow-y-auto") as HTMLElement | null;
      if (scrollParent) scrollParent.scrollTop = scrollParent.scrollHeight;
      // fallback: window
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, [streamingLyrics]);

  // API 호출 (스트리밍)
  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setStreamingLyrics("");
    try {
      const res = await fetch("/api/lyrics-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildFullPrompt(), apiKey, provider }),
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

    // 1. 스타일 재생성 (변주) — 완료까지 대기
    if (onRegenerateStyle) {
      await onRegenerateStyle();
    }

    // 2. 가사 생성 (스트리밍)
    setGenerating(true);
    try {
      const nextNum = trackNumber + 1;
      const prompt = buildFullPrompt() + `\n\n=== 추가 지침 ===\nTrack ${nextNum}. 이전 트랙과 같은 톤/무드/장르 유지, 완전히 새로운 가사. 같은 앨범의 다른 곡처럼. 시점/장면/소품을 바꾸고 Hook도 새로 만들어라.`;
      const res = await fetch("/api/lyrics-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, apiKey, provider }),
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

      {/* 2. VOCAL PROFILE */}
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
            }}>{generatedLyrics}</pre>

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
                  const prompt = buildFullPrompt() + `\n\n=== 추가 지침 ===\nTrack ${nextNum}. 같은 톤/무드, 새 가사. Style 동일 유지.`;
                  const res = await fetch("/api/lyrics-stream", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt, apiKey, provider }),
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
    </div>
  );
}
