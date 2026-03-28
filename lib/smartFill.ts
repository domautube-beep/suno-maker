// 스마트 필 — 사용자 선택값 전체를 교차 참조해서 빈 값을 연관성 있게 채움
// 우선순위: 1.사용자 직접 선택 → 2.장르 프리셋 → 3.느낌 기반 추론 → 4.교차 추론

import { SunoInput } from "./types";
import { getGenrePreset } from "./genrePresets";

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// 느낌 키워드 분석
function analyzeVibe(vibe: string) {
  return {
    dark: ["어두운", "우울한", "긴장감", "거친"].some((k) => vibe.includes(k)),
    bright: ["밝은", "에너지틱", "유쾌한", "희망적"].some((k) => vibe.includes(k)),
    sexy: ["섹시한", "그루비"].some((k) => vibe.includes(k)),
    epic: ["웅장한"].some((k) => vibe.includes(k)),
    futuristic: ["미래적", "디지털"].some((k) => vibe.includes(k)),
    intimate: ["친밀한", "편안한"].some((k) => vibe.includes(k)),
    warm: ["따뜻한", "아날로그"].some((k) => vibe.includes(k)),
    retro: ["레트로", "아날로그"].some((k) => vibe.includes(k)),
    chill: ["나른한", "몽환적", "편안한"].some((k) => vibe.includes(k)),
    cold: ["차가운"].some((k) => vibe.includes(k)),
    heavy: ["무거운", "폭발적", "격렬한"].some((k) => vibe.includes(k)),
    minimal: ["미니멀"].some((k) => vibe.includes(k)),
    addictive: ["중독적"].some((k) => vibe.includes(k)),
    experimental: ["실험적"].some((k) => vibe.includes(k)),
  };
}

// 장르 → 어울리는 기본값 매핑 (genrePresets에 없는 장르용)
const GENRE_DEFAULTS: Record<string, Partial<SunoInput>> = {
  // 팝 계열
  "K-Pop": { tempo: "mid_fast", timeSignature: "4/4", era: "2020s", texture: "clean_digital", reverb: "room" },
  "Pop": { tempo: "mid_fast", timeSignature: "4/4", era: "2020s", texture: "clean_digital", reverb: "room" },
  "Dance Pop": { tempo: "fast", timeSignature: "4/4", era: "2020s", texture: "clean_digital", reverb: "hall" },
  "City Pop": { tempo: "mid", timeSignature: "4/4", era: "80s", texture: "analog_vintage", reverb: "plate" },
  "Disco": { tempo: "fast", timeSignature: "4/4", era: "80s", texture: "analog_vintage", reverb: "room" },
  "Funk": { tempo: "mid_fast", timeSignature: "4/4", era: "90s", texture: "analog_vintage", reverb: "room" },
  // R&B 계열
  "R&B": { tempo: "mid_slow", timeSignature: "4/4", era: "2010s", texture: "analog_vintage", reverb: "plate" },
  "Neo Soul": { tempo: "mid_slow", timeSignature: "4/4", era: "2000s", texture: "analog_vintage", reverb: "plate" },
  "Soul": { tempo: "mid", timeSignature: "4/4", era: "vintage", texture: "analog_vintage", reverb: "room" },
  "Gospel": { tempo: "mid", timeSignature: "4/4", era: "vintage", texture: "spacious", reverb: "hall" },
  // 힙합 계열
  "Hip-Hop": { tempo: "mid_slow", timeSignature: "4/4", era: "2020s", texture: "raw_gritty", reverb: "dry" },
  "Trap": { tempo: "mid_fast", timeSignature: "4/4", era: "2020s", texture: "clean_digital", reverb: "room" },
  "Boom Bap": { tempo: "mid_slow", timeSignature: "4/4", era: "90s", texture: "lofi_warm", reverb: "room" },
  "Cloud Rap": { tempo: "mid_slow", timeSignature: "4/4", era: "2020s", texture: "dreamy", reverb: "hall" },
  "Drill": { tempo: "mid_fast", timeSignature: "4/4", era: "2020s", texture: "clean_digital", reverb: "room" },
  "Phonk": { tempo: "mid_fast", timeSignature: "4/4", era: "90s", texture: "lofi_warm", reverb: "room" },
  // 록 계열
  "Rock": { tempo: "mid_fast", timeSignature: "4/4", era: "2000s", texture: "raw_gritty", reverb: "room" },
  "Alt Rock": { tempo: "mid", timeSignature: "4/4", era: "2010s", texture: "raw_gritty", reverb: "room" },
  "Metal": { tempo: "fast", timeSignature: "4/4", era: "2010s", texture: "dense", reverb: "room" },
  "Punk Rock": { tempo: "very_fast", timeSignature: "4/4", era: "2000s", texture: "raw_gritty", reverb: "dry" },
  "Shoegaze": { tempo: "mid", timeSignature: "4/4", era: "90s", texture: "dreamy", reverb: "cathedral" },
  "Post-Rock": { tempo: "mid", timeSignature: "4/4", era: "2010s", texture: "spacious", reverb: "hall" },
  "Grunge": { tempo: "mid_fast", timeSignature: "4/4", era: "90s", texture: "raw_gritty", reverb: "room" },
  // 일렉트로닉
  "EDM": { tempo: "fast", timeSignature: "4/4", era: "2020s", texture: "clean_digital", reverb: "hall" },
  "House": { tempo: "fast", timeSignature: "4/4", era: "2020s", texture: "clean_digital", reverb: "room" },
  "Deep House": { tempo: "fast", timeSignature: "4/4", era: "2020s", texture: "analog_vintage", reverb: "room" },
  "Techno": { tempo: "fast", timeSignature: "4/4", era: "2020s", texture: "clean_digital", reverb: "hall" },
  "Trance": { tempo: "fast", timeSignature: "4/4", era: "2010s", texture: "spacious", reverb: "hall" },
  "Dubstep": { tempo: "mid_fast", timeSignature: "4/4", era: "2010s", texture: "dense", reverb: "room" },
  "Ambient": { tempo: "very_slow", timeSignature: "4/4", era: "2020s", texture: "spacious", reverb: "cathedral" },
  "Synthwave": { tempo: "mid_fast", timeSignature: "4/4", era: "80s", texture: "analog_vintage", reverb: "plate" },
  "Future Bass": { tempo: "mid_fast", timeSignature: "4/4", era: "2020s", texture: "clean_digital", reverb: "hall" },
  "Hyperpop": { tempo: "fast", timeSignature: "4/4", era: "2020s", texture: "clean_digital", reverb: "room" },
  "Chillwave": { tempo: "mid_slow", timeSignature: "4/4", era: "2010s", texture: "dreamy", reverb: "plate" },
  "Vaporwave": { tempo: "mid_slow", timeSignature: "4/4", era: "80s", texture: "lofi_warm", reverb: "plate" },
  // 감성
  "Ballad": { tempo: "slow", timeSignature: "4/4", era: "2010s", texture: "analog_vintage", reverb: "hall" },
  "Lo-Fi": { tempo: "mid_slow", timeSignature: "4/4", era: "90s", texture: "lofi_warm", reverb: "plate" },
  "Acoustic": { tempo: "mid", timeSignature: "4/4", era: "2010s", texture: "analog_vintage", reverb: "room" },
  "Folk": { tempo: "mid", timeSignature: "4/4", era: "vintage", texture: "analog_vintage", reverb: "room" },
  "Dream Pop": { tempo: "mid", timeSignature: "4/4", era: "2010s", texture: "dreamy", reverb: "hall" },
  // 재즈/블루스
  "Jazz": { tempo: "mid", timeSignature: "4/4", era: "vintage", texture: "analog_vintage", reverb: "room" },
  "Smooth Jazz": { tempo: "mid_slow", timeSignature: "4/4", era: "2000s", texture: "analog_vintage", reverb: "plate" },
  "Blues": { tempo: "mid_slow", timeSignature: "shuffle", era: "vintage", texture: "analog_vintage", reverb: "room" },
  "Bossa Nova": { tempo: "mid_slow", timeSignature: "4/4", era: "vintage", texture: "analog_vintage", reverb: "room" },
  // 월드
  "Reggae": { tempo: "mid", timeSignature: "4/4", era: "vintage", texture: "analog_vintage", reverb: "room" },
  "Reggaeton": { tempo: "mid_fast", timeSignature: "4/4", era: "2020s", texture: "clean_digital", reverb: "room" },
  "Latin": { tempo: "mid_fast", timeSignature: "4/4", era: "2010s", texture: "clean_digital", reverb: "room" },
  "Afrobeat": { tempo: "mid_fast", timeSignature: "4/4", era: "2020s", texture: "analog_vintage", reverb: "room" },
  "Trot": { tempo: "mid_fast", timeSignature: "2/4", era: "vintage", texture: "clean_digital", reverb: "plate" },
  // 시네마틱
  "Cinematic": { tempo: "slow", timeSignature: "4/4", era: "2020s", texture: "spacious", reverb: "cathedral" },
  "Epic": { tempo: "mid", timeSignature: "4/4", era: "2020s", texture: "dense", reverb: "cathedral" },
  "Orchestral": { tempo: "mid", timeSignature: "4/4", era: "2020s", texture: "spacious", reverb: "hall" },
  "Classical": { tempo: "mid", timeSignature: "4/4", era: "vintage", texture: "spacious", reverb: "hall" },
};

// 느낌 조합 → 기본값 (장르 없을 때)
function inferFromVibe(v: ReturnType<typeof analyzeVibe>): Partial<SunoInput> {
  // 복합 조합 우선
  if (v.sexy && v.epic) return { genre: pick(["R&B", "Deep House"]), tempo: "mid", era: "2020s", texture: "spacious", reverb: "hall" };
  if (v.sexy && v.futuristic) return { genre: pick(["Future Bass", "Deep House"]), tempo: "mid_fast", era: "2020s", texture: "clean_digital", reverb: "hall" };
  if (v.sexy && v.intimate) return { genre: pick(["R&B", "Neo Soul"]), tempo: "mid_slow", era: "2010s", texture: "analog_vintage", reverb: "plate" };
  if (v.epic && v.futuristic) return { genre: pick(["Cinematic", "EDM", "Trance"]), tempo: "mid_fast", era: "futuristic", texture: "spacious", reverb: "cathedral" };
  if (v.epic && v.dark) return { genre: pick(["Cinematic", "Metal"]), tempo: "mid", era: "2020s", texture: "dense", reverb: "cathedral" };
  if (v.dark && v.cold) return { genre: pick(["Techno", "Ambient"]), tempo: "mid", era: "2020s", texture: "clean_digital", reverb: "hall" };
  if (v.dark && v.heavy) return { genre: pick(["Metal", "Trap", "Dubstep"]), tempo: "fast", era: "2020s", texture: "dense", reverb: "room" };
  if (v.dark && v.addictive) return { genre: pick(["Techno", "Trap"]), tempo: "mid_fast", era: "2020s", texture: "clean_digital", reverb: "room" };
  if (v.bright && v.retro) return { genre: pick(["City Pop", "Disco", "Synthwave"]), tempo: "mid_fast", era: "80s", texture: "analog_vintage", reverb: "plate" };
  if (v.chill && v.warm) return { genre: pick(["Lo-Fi", "Bossa Nova"]), tempo: "mid_slow", era: "90s", texture: "lofi_warm", reverb: "plate" };
  if (v.chill && v.retro) return { genre: pick(["Lo-Fi", "City Pop", "Chillwave"]), tempo: "mid_slow", era: "90s", texture: "lofi_warm", reverb: "plate" };
  if (v.minimal && v.cold) return { genre: pick(["Ambient", "Techno"]), tempo: "slow", era: "2020s", texture: "minimal", reverb: "hall" };
  if (v.experimental) return { genre: pick(["IDM", "Hyperpop", "Post-Rock"]), tempo: pick(["mid", "fast"]), era: "2020s", texture: pick(["clean_digital", "raw_gritty"]), reverb: pick(["room", "hall"]) };

  // 단일 느낌
  if (v.sexy) return { genre: pick(["R&B", "Neo Soul", "Deep House"]), tempo: "mid_slow", era: "2010s", texture: "analog_vintage", reverb: "plate" };
  if (v.epic) return { genre: pick(["Cinematic", "Orchestral", "Epic"]), tempo: "mid", era: "2020s", texture: "spacious", reverb: "cathedral" };
  if (v.futuristic) return { genre: pick(["Synthwave", "Future Bass", "Techno"]), tempo: "mid_fast", era: "futuristic", texture: "clean_digital", reverb: "hall" };
  if (v.intimate) return { genre: pick(["Acoustic", "Lo-Fi", "Singer-Songwriter"]), tempo: "mid_slow", era: "2010s", texture: "analog_vintage", reverb: "room" };
  if (v.dark) return { genre: pick(["Hip-Hop", "Trap", "Ambient"]), tempo: "mid_slow", era: "2020s", texture: "raw_gritty", reverb: "room" };
  if (v.bright) return { genre: pick(["K-Pop", "Pop", "EDM"]), tempo: "mid_fast", era: "2020s", texture: "clean_digital", reverb: "room" };
  if (v.warm) return { genre: pick(["R&B", "Lo-Fi", "Jazz"]), tempo: "mid_slow", era: "90s", texture: "analog_vintage", reverb: "plate" };
  if (v.retro) return { genre: pick(["Synthwave", "City Pop", "Disco"]), tempo: "mid_fast", era: "80s", texture: "analog_vintage", reverb: "plate" };
  if (v.chill) return { genre: pick(["Lo-Fi", "Ambient", "Chillwave"]), tempo: "slow", era: "2010s", texture: "lofi_warm", reverb: "plate" };
  if (v.cold) return { genre: pick(["Techno", "Ambient"]), tempo: "mid", era: "2020s", texture: "clean_digital", reverb: "hall" };
  if (v.heavy) return { genre: pick(["Metal", "Rock", "Dubstep"]), tempo: "fast", era: "2010s", texture: "dense", reverb: "room" };
  if (v.addictive) return { genre: pick(["House", "Techno", "K-Pop"]), tempo: "mid_fast", era: "2020s", texture: "clean_digital", reverb: "room" };

  return {};
}

// 메인 함수: 빈 값을 스마트하게 채움
export function smartFill(inputs: SunoInput): SunoInput {
  const vibe = analyzeVibe(inputs.vibe || "");
  const preset = inputs.genre ? getGenrePreset(inputs.genre) : null;
  const firstGenre = inputs.genre?.split("+")[0].trim() || "";
  const genreDefaults = GENRE_DEFAULTS[firstGenre] || {};
  const vibeInferred = inferFromVibe(vibe);

  // 우선순위: 사용자 선택 > 장르 프리셋 > 장르 기본값 > 느낌 추론 > 기본값
  return {
    oneLiner: inputs.oneLiner || "",
    genre: inputs.genre || vibeInferred.genre || "Pop",
    instruments: inputs.instruments || "",
    vibe: inputs.vibe || "",
    tempo: inputs.tempo || preset?.tempo || genreDefaults.tempo as string || vibeInferred.tempo as string || "mid",
    timeSignature: inputs.timeSignature || preset?.timeSignature || genreDefaults.timeSignature as string || "4/4",
    era: inputs.era || preset?.era || genreDefaults.era as string || vibeInferred.era as string || "2020s",
    texture: inputs.texture || preset?.texture || genreDefaults.texture as string || vibeInferred.texture as string || "clean_digital",
    reverb: inputs.reverb || preset?.reverb || genreDefaults.reverb as string || vibeInferred.reverb as string || "room",
    language: inputs.language || "ko",
  };
}
