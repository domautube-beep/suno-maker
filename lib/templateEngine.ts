// 템플릿 조합 엔진
// 사용자 선택값 → 태그 변환 → 템플릿 매칭 → 문장 조합
// 나중에 Claude API로 교체할 때 이 파일만 바꾸면 됨

import { SunoInput } from "./types";
import { INTROS } from "./templates/intros";
import { RHYTHMS } from "./templates/rhythms";
import { DYNAMICS } from "./templates/dynamics";
import { SPACES } from "./templates/spaces";
import { EMOTIONS } from "./templates/emotions";

// 사용자 입력 → 매칭 태그 변환
function inputToTags(inputs: SunoInput): string[] {
  const tags: string[] = [];

  // 템포 → 속도 태그
  const tempoMap: Record<string, string> = {
    very_slow: "slow", slow: "slow", mid_slow: "mid",
    mid: "mid", mid_fast: "fast", fast: "fast",
    very_fast: "fast", ultra: "fast",
  };
  if (inputs.tempo) tags.push(tempoMap[inputs.tempo] || "mid");

  // 박자
  if (inputs.timeSignature === "shuffle") tags.push("shuffle", "swing", "bouncy");
  if (inputs.timeSignature === "halftime") tags.push("halftime", "trap");
  if (inputs.timeSignature === "3/4") tags.push("waltz", "gentle");
  if (inputs.timeSignature === "6/8") tags.push("waltz", "flowing");

  // 장르 → 태그
  const genreTagMap: Record<string, string[]> = {
    "K-Pop": ["pop", "kpop", "energetic", "bright"], "Pop": ["pop", "clean", "catchy"],
    "Hip-Hop": ["hiphop", "groove", "urban"], "Trap": ["trap", "aggressive", "modern"],
    "R&B": ["rnb", "soul", "groove", "warm"], "Neo Soul": ["soul", "warm", "organic"],
    "Ballad": ["ballad", "emotional", "intimate"], "Lo-Fi": ["lofi", "warm", "vintage", "relaxed"],
    "EDM": ["edm", "energetic", "dance", "explosive"], "House": ["house", "dance", "groove"],
    "Techno": ["techno", "mechanical", "hypnotic"], "Rock": ["rock", "powerful", "raw"],
    "Metal": ["rock", "intense", "aggressive"], "Punk": ["punk", "raw", "intense"],
    "Jazz": ["jazz", "organic", "swing"], "Blues": ["blues", "warm", "organic"],
    "Cinematic": ["cinematic", "epic", "grand"], "Ambient": ["ambient", "dreamy", "spacious"],
    "Synthwave": ["vintage", "analog", "warm"], "Acoustic": ["acoustic", "intimate", "organic"],
    "Trot": ["pop", "bright", "bouncy"], "Reggae": ["reggae", "bounce", "relaxed"],
    "Bossa Nova": ["jazz", "gentle", "warm"], "Disco": ["dance", "groove", "energetic"],
    "Funk": ["funky", "groove", "energetic"], "Gospel": ["soul", "powerful", "warm"],
  };
  if (inputs.genre) {
    const firstGenre = inputs.genre.split("+")[0].trim();
    const gTags = genreTagMap[firstGenre];
    if (gTags) tags.push(...gTags);
  }

  // 느낌 → 태그
  const vibeTagMap: Record<string, string[]> = {
    "어두운": ["dark", "intense"], "밝은": ["bright", "uplifting"],
    "몽환적": ["dreamy", "ethereal", "floating"], "감성적": ["emotional", "intimate"],
    "에너지틱": ["energetic", "powerful"], "차가운": ["cold", "modern", "digital"],
    "따뜻한": ["warm", "analog"], "긴장감": ["intense", "suspenseful"],
    "편안한": ["relaxed", "gentle"], "웅장한": ["epic", "grand", "cinematic"],
    "레트로": ["vintage", "analog", "warm"], "거친": ["raw", "aggressive"],
    "부드러운": ["gentle", "smooth"], "중독적": ["hypnotic", "repetitive"],
    "우울한": ["dark", "melancholy", "lonely"], "나른한": ["relaxed", "lazy"],
    "서정적": ["emotional", "reflective"], "그루비": ["groove", "funky"],
    "미니멀": ["minimal", "sparse"], "공간감": ["spacious", "wide"],
  };
  if (inputs.vibe) {
    for (const [keyword, vTags] of Object.entries(vibeTagMap)) {
      if (inputs.vibe.includes(keyword)) tags.push(...vTags);
    }
  }

  // 텍스처 → 태그
  const textureTagMap: Record<string, string[]> = {
    "Lo-Fi Tape Warmth": ["lofi", "warm", "vintage"], "Analog Saturation": ["analog", "warm"],
    "Cold Digital": ["digital", "cold", "modern"], "Vinyl Crackle": ["vintage", "lofi"],
    "Wall of Sound": ["dense", "intense", "wall"], "미니멀": ["minimal", "sparse"],
    "매끈한": ["clean", "polished"], "거친": ["raw", "aggressive"],
    "몽환적": ["dreamy", "ethereal"], "사이키델릭": ["psychedelic", "experimental"],
    "레트로": ["vintage", "analog"], "인더스트리얼": ["industrial", "mechanical"],
  };
  if (inputs.texture) {
    for (const [keyword, tTags] of Object.entries(textureTagMap)) {
      if (inputs.texture.includes(keyword)) tags.push(...tTags);
    }
  }

  // 리버브 → 태그
  const reverbTagMap: Record<string, string[]> = {
    dry: ["dry", "intimate", "close"], room: ["room", "natural", "balanced"],
    hall: ["hall", "wide", "grand"], cathedral: ["cathedral", "massive", "epic"],
    lofi_filter: ["lofi", "warm", "vintage"], plate: ["plate", "studio", "warm"],
  };
  if (inputs.reverb && reverbTagMap[inputs.reverb]) {
    tags.push(...reverbTagMap[inputs.reverb]);
  }

  // 기본 태그 (아무것도 없을 때)
  if (tags.length === 0) tags.push("mid", "pop", "clean", "balanced");

  return [...new Set(tags)]; // 중복 제거
}

// 태그 매칭 점수 계산
function matchScore(templateTags: string[], inputTags: string[]): number {
  let score = 0;
  for (const tag of templateTags) {
    if (inputTags.includes(tag)) score++;
  }
  return score;
}

// 상위 N개 중 랜덤 선택
function pickBestRandom<T extends { tags: string[] }>(templates: T[], inputTags: string[], topN: number = 3): T {
  const scored = templates.map((t) => ({ template: t, score: matchScore(t.tags, inputTags) }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, Math.min(topN, scored.length));
  return top[Math.floor(Math.random() * top.length)].template;
}

// BPM 문자열 생성
function getBpmString(tempo: string): string {
  const bpmMap: Record<string, number> = {
    very_slow: 58, slow: 72, mid_slow: 85,
    mid: 100, mid_fast: 118, fast: 130,
    very_fast: 155, ultra: 180,
  };
  const base = bpmMap[tempo] || 100;
  // ±5 랜덤 변동
  const actual = base + Math.floor(Math.random() * 11) - 5;
  return `${actual} BPM`;
}

// 메인 생성 함수
export function generateStyle(inputs: SunoInput): string {
  const tags = inputToTags(inputs);

  // 각 파트에서 최적 템플릿 선택
  const intro = pickBestRandom(INTROS, tags);
  const rhythm = pickBestRandom(RHYTHMS, tags);
  const dynamic = pickBestRandom(DYNAMICS, tags);
  const space = pickBestRandom(SPACES, tags);
  const emotion = pickBestRandom(EMOTIONS, tags);

  // 장르명
  const genreName = inputs.genre ? inputs.genre.split("+")[0].trim() : "";

  // BPM
  const bpm = inputs.tempo ? getBpmString(inputs.tempo) : "";

  // 박자
  const timeSig = inputs.timeSignature && inputs.timeSignature !== "4/4"
    ? `${inputs.timeSignature} time signature.`
    : "";

  // 악기 (사용자 선택)
  const instruments = inputs.instruments
    ? `Key instrumentation: ${inputs.instruments}.`
    : "";

  // 조합
  const parts: string[] = [];
  if (genreName) parts.push(`${genreName}.`);
  if (bpm) parts.push(`Anchored at ${bpm}.`);
  if (timeSig) parts.push(timeSig);
  parts.push(intro.text);
  parts.push(rhythm.text);
  if (instruments) parts.push(instruments);
  parts.push(dynamic.text);
  parts.push(space.text);
  parts.push(emotion.text);

  return parts.join(" ");
}
