// 사용자 선택 기반 맥락형 가이드
// 이전 선택 전체를 참고해서 다음 스텝에 대한 구체적 추천

import { SunoInput } from "./types";
import { getGenrePreset, getTempoLabel } from "./genrePresets";

// 스텝 순서: 핵심 → 모드 → 장르 → 느낌 → BPM → 박자 → 시대 → 텍스처 → 보컬 → 리버브 → 언어

export function generateGuide(stepId: string, value: string, allInputs?: Partial<SunoInput>): string | null {
  if (!value.trim()) return null;
  const ctx = allInputs || {};

  switch (stepId) {
    case "oneLiner": return guideAfterOneLiner(value);
    case "mode": return null;
    case "genre": return guideAfterGenre(value, ctx);
    case "vibe": return guideAfterVibe(value, ctx);
    case "tempo": return guideAfterTempo(value, ctx);
    case "timeSignature": return guideAfterTimeSignature(value, ctx);
    case "era": return guideAfterEra(value, ctx);
    case "texture": return guideAfterTexture(value, ctx);
    case "vocal": return guideAfterVocal(value, ctx);
    case "reverb": return guideAfterReverb(value, ctx);
    case "language": return guideAfterLanguage(value, ctx);
    default: return null;
  }
}

function guideAfterOneLiner(value: string): string {
  const darkWords = ["밤", "어둠", "눈물", "이별", "혼자", "잊", "아프", "끝", "떠나"];
  const brightWords = ["빛", "웃", "사랑", "함께", "시작", "희망", "봄"];
  const nostalgicWords = ["기억", "추억", "그때", "다시", "돌아", "녹지"];

  if (darkWords.some((w) => value.includes(w)))
    return `"${value}" — 어두운 감정선이네요. Hip-Hop, Trap, R&B 같은 장르가 잘 어울릴 것 같아요.`;
  if (brightWords.some((w) => value.includes(w)))
    return `"${value}" — 밝은 에너지가 느껴져요. K-Pop, Pop, EDM 쪽이 잘 맞을 것 같아요.`;
  if (nostalgicWords.some((w) => value.includes(w)))
    return `"${value}" — 향수와 여운이 느껴져요. Lo-Fi, R&B, Synthwave가 어울릴 것 같아요.`;

  return `"${value}" — 흥미로운 주제네요. 어떤 장르로 풀어볼지 골라주세요.`;
}

// 장르 선택 후 → 느낌 추천
function guideAfterGenre(value: string, ctx: Partial<SunoInput>): string {
  const preset = getGenrePreset(value);

  // 장르 특성 설명 + 느낌 추천
  const genreAdvice: Record<string, string> = {
    "K-Pop": "K-Pop이면 밝고 에너지틱한 느낌이 기본이에요. '중독적', '매끈한' 쪽을 추천해요.",
    "Pop": "Pop이면 깔끔하고 캐치한 느낌이 핵심이에요. '밝은', '에너지틱' 쪽이 잘 맞아요.",
    "Hip-Hop": "힙합이면 '거친', '중독적' 느낌이 자연스러워요. 어두운 쪽으로 가도 좋아요.",
    "Trap": "트랩이면 어둡고 무거운 분위기가 기본이에요. '어두운', '중독적', '무거운'을 추천해요.",
    "R&B": "R&B면 '따뜻한', '감성적', '그루비' 느낌이 잘 어울려요. 부드러운 쪽으로 가보세요.",
    "Ballad": "발라드면 '감성적', '서정적' 느낌이 핵심이에요. '쓸쓸한'도 좋은 선택이에요.",
    "EDM": "EDM이면 '에너지틱', '폭발적' 느낌이 필수예요. '중독적'도 좋아요.",
    "Lo-Fi": "Lo-Fi면 '따뜻한', '편안한', '나른한' 느낌이 자연스러워요. 레트로도 잘 어울려요.",
    "Rock": "록이면 '에너지틱', '거친' 느낌이 기본이에요. 강렬하게 가고 싶으면 '격렬한'도.",
    "Techno": "테크노면 '중독적', '차가운', '미니멀' 느낌이 핵심이에요. 기계적이고 반복적인 매력.",
    "House": "하우스면 '그루비', '따뜻한' 느낌이 잘 맞아요. 소울풀한 쪽으로 가도 좋아요.",
    "Jazz": "재즈면 '세련된', '따뜻한', '부드러운' 느낌이에요. 아날로그 질감이 찰떡.",
    "Cinematic": "시네마틱이면 '웅장한', '긴장감', '몰입감' 느낌이에요. 에픽하게 가보세요.",
    "Ambient": "앰비언트면 '몽환적', '편안한', '공간감' 느낌이에요. 미니멀하게.",
    "Synthwave": "신스웨이브면 '레트로', '몽환적' 느낌이 핵심이에요. 80년대 감성.",
    "Acoustic": "어쿠스틱이면 '따뜻한', '편안한', '친밀한' 느낌이 자연스러워요.",
    "Trot": "트로트면 '밝은', '유쾌한' 느낌이 기본이에요. 에너지틱하게.",
  };

  const firstGenre = value.split("+")[0].trim();
  const advice = genreAdvice[firstGenre];

  if (advice) return `${value} 장르 좋아요. ${advice}`;
  return `${value} 장르로 갈게요. 이 장르에 맞는 분위기를 골라보세요.`;
}

// 느낌 선택 후 → BPM 추천
function guideAfterVibe(value: string, ctx: Partial<SunoInput>): string {
  const preset = ctx.genre ? getGenrePreset(ctx.genre) : null;
  const tags = value.split(/[,+]/g).map((t) => t.trim()).filter(Boolean);

  let bpmAdvice = "";
  if (preset) {
    const label = getTempoLabel(preset.tempo);
    bpmAdvice = ` ${ctx.genre}에는 ${label}이 잘 맞아요.`;
  } else {
    // 느낌 기반 BPM 추론
    if (tags.some((t) => ["에너지틱", "폭발적", "격렬한"].includes(t))) {
      bpmAdvice = " 에너지 높은 느낌이니 Fast(126~140) 이상을 추천해요.";
    } else if (tags.some((t) => ["나른한", "편안한", "차분한"].includes(t))) {
      bpmAdvice = " 차분한 느낌이니 Slow(66~80) 또는 Mid Slow(81~95)를 추천해요.";
    } else if (tags.some((t) => ["감성적", "서정적", "몽환적"].includes(t))) {
      bpmAdvice = " 감성적인 느낌이니 Mid Slow(81~95)가 잘 맞을 거예요.";
    }
  }

  if (tags.length >= 3) return `${tags.slice(0, 3).join(", ")} 조합이면 독특한 사운드가 나올 거예요.${bpmAdvice} 다음은 BPM이에요.`;
  return `'${tags.join(", ")}' 느낌 좋아요.${bpmAdvice} 다음은 BPM을 골라주세요.`;
}

// BPM 선택 후 → 박자 추천
function guideAfterTempo(value: string, ctx: Partial<SunoInput>): string {
  const label = getTempoLabel(value);
  const preset = ctx.genre ? getGenrePreset(ctx.genre) : null;

  let sigAdvice = "대부분의 장르는 4/4가 기본이에요.";
  if (preset) {
    if (preset.timeSignature === "2/4") sigAdvice = `${ctx.genre}에는 2/4 바운스가 전통적이에요.`;
    else if (preset.timeSignature === "shuffle") sigAdvice = `${ctx.genre}에는 셔플(스윙) 그루브가 잘 어울려요.`;
    else sigAdvice = `${ctx.genre}에는 ${preset.timeSignature} 박자가 기본이에요.`;
  }

  return `${label}로 잡을게요. ${sigAdvice}`;
}

// 박자 선택 후 → 시대 추천
function guideAfterTimeSignature(value: string, ctx: Partial<SunoInput>): string {
  const preset = ctx.genre ? getGenrePreset(ctx.genre) : null;

  let eraAdvice = "";
  if (preset) {
    const eraLabels: Record<string, string> = {
      "80s": "80년대", "90s": "90년대", "2000s": "2000년대",
      "2010s": "2010년대", "2020s": "현대적", futuristic: "미래적", vintage: "빈티지",
    };
    eraAdvice = ` ${ctx.genre}에는 ${eraLabels[preset.era] || preset.era} 사운드가 자연스러워요.`;
  }

  return `박자 설정 완료.${eraAdvice} 어떤 시대의 사운드를 원하세요?`;
}

// 시대 선택 후 → 텍스처 추천
function guideAfterEra(value: string, ctx: Partial<SunoInput>): string {
  const eraTexture: Record<string, string> = {
    "80s": "80년대면 아날로그 빈티지 질감이 잘 어울려요.",
    "90s": "90년대면 따뜻한 아날로그 또는 Lo-Fi 질감이 좋아요.",
    "2000s": "2000년대면 깔끔 디지털과 아날로그의 중간이에요.",
    "2010s": "2010년대면 깔끔한 디지털 프로덕션이 자연스러워요.",
    "2020s": "현대적이면 깔끔 디지털이 기본이지만, Lo-Fi나 거친 질감도 트렌디해요.",
    futuristic: "미래적이면 깔끔 디지털이나 글리치 계열이 어울려요.",
    vintage: "빈티지면 아날로그 빈티지나 Lo-Fi 따뜻함이 필수예요.",
  };

  const advice = eraTexture[value] || "시대감 설정 완료.";
  return `${advice} 다음은 사운드 질감을 골라주세요.`;
}

// 텍스처 선택 후 → 보컬 추천
function guideAfterTexture(value: string, ctx: Partial<SunoInput>): string {
  let vocalAdvice = "";

  // 장르 기반 보컬 추천
  const genreVocal: Record<string, string> = {
    "Hip-Hop": "힙합이니 랩 딜리버리나 리드미컬한 보컬이 잘 맞아요.",
    "Trap": "트랩이면 나른한 오토튠 보컬이나 랩이 어울려요.",
    "R&B": "R&B면 부드럽고 소울풀한 보컬이 핵심이에요.",
    "Ballad": "발라드면 서정적이고 감정적인 보컬이 필수예요.",
    "Techno": "테크노면 미니멀한 보컬이나 샘플 느낌이 잘 맞아요.",
    "Rock": "록이면 파워풀하거나 거친 보컬이 에너지를 줘요.",
    "Lo-Fi": "Lo-Fi면 공기감 있고 나른한 보컬이 자연스러워요.",
    "Jazz": "재즈면 부드럽고 따뜻한 보컬이 분위기를 살려요.",
  };

  const firstGenre = ctx.genre?.split("+")[0].trim() || "";
  vocalAdvice = genreVocal[firstGenre] || "다음은 보컬 스타일을 골라주세요.";

  return `질감 설정 완료. ${vocalAdvice}`;
}

// 보컬 선택 후 → 리버브 추천
function guideAfterVocal(value: string, ctx: Partial<SunoInput>): string {
  // 보컬 스타일 기반 리버브 추천
  const isRap = value.toLowerCase().includes("rap");
  const isWhisper = value.toLowerCase().includes("whisper") || value.toLowerCase().includes("breathy");
  const isPowerful = value.toLowerCase().includes("powerful") || value.toLowerCase().includes("belt");

  if (isRap) return "랩 보컬이면 Dry(가까운)나 Room이 가사 전달력에 좋아요.";
  if (isWhisper) return "속삭이는 보컬이면 Dry(가까운)로 친밀감을 극대화하거나, Lo-Fi로 분위기를 낼 수 있어요.";
  if (isPowerful) return "파워풀한 보컬이면 Hall(공연장)이나 Plate로 웅장함을 더할 수 있어요.";

  // 장르 기반 리버브 추천
  const preset = ctx.genre ? getGenrePreset(ctx.genre) : null;
  if (preset) {
    const reverbLabels: Record<string, string> = {
      dry: "Dry(가까운)", room: "Room", hall: "Hall(공연장)",
      cathedral: "Cathedral(대성당)", lofi_filter: "Lo-Fi", plate: "Plate(스튜디오)",
    };
    return `보컬 설정 완료. ${ctx.genre}에는 ${reverbLabels[preset.reverb] || preset.reverb} 리버브를 추천해요.`;
  }

  return "보컬 설정 완료. 보컬 공간감(리버브)을 골라주세요.";
}

// 리버브 선택 후 → 언어
function guideAfterReverb(value: string, ctx: Partial<SunoInput>): string {
  const reverbNames: Record<string, string> = {
    dry: "가까운 속삭임", room: "방 안", hall: "공연장",
    cathedral: "대성당", lofi_filter: "Lo-Fi", plate: "스튜디오",
  };
  return `${reverbNames[value] || value} 공간감으로 갈게요. 마지막! 가사 언어만 정하면 끝이에요.`;
}

// 언어 선택 후 → 확인
function guideAfterLanguage(value: string, ctx: Partial<SunoInput>): string {
  const langNames: Record<string, string> = { ko: "한국어", en: "English", mixed: "한영 믹스" };
  const genre = ctx.genre?.split("+")[0].trim() || "";

  let summary = `${langNames[value] || value} 가사로 갈게요.`;

  // 전체 요약
  const parts: string[] = [];
  if (genre) parts.push(genre);
  if (ctx.vibe) parts.push(ctx.vibe.split(",")[0].trim());
  if (ctx.tempo) parts.push(getTempoLabel(ctx.tempo));

  if (parts.length > 0) {
    summary += ` ${parts.join(" + ")} 조합의 곡이 될 거예요. 확인하고 생성해볼게요!`;
  }

  return summary;
}
