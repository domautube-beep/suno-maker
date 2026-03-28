// 선택 요약 — 이 노래가 어떻게 나올지 예측 설명
// 수노 결과와 비교해서 뭘 고쳐야 할지 알려주는 내비게이션

import { SunoInput } from "./types";

export interface SongPrediction {
  title: string;      // 섹션 제목
  prediction: string;  // 예측 설명
}

export function generatePrediction(inputs: Partial<SunoInput>): SongPrediction[] {
  const predictions: SongPrediction[] = [];

  if (!inputs.oneLiner) return predictions;

  // 1. 전체 방향
  predictions.push({
    title: "전체 방향",
    prediction: buildDirectionText(inputs),
  });

  // 2. 사운드 예상
  if (inputs.genre || inputs.vibe || inputs.texture) {
    predictions.push({
      title: "사운드 예상",
      prediction: buildSoundText(inputs),
    });
  }

  // 3. 리듬/그루브
  if (inputs.tempo || inputs.timeSignature || inputs.genre) {
    predictions.push({
      title: "리듬/그루브",
      prediction: buildRhythmText(inputs),
    });
  }

  // 4. 보컬 예상
  if (inputs.vocal || inputs.reverb) {
    predictions.push({
      title: "보컬 예상",
      prediction: buildVocalText(inputs),
    });
  }

  // 5. 이 곡의 감정/느낌
  if (inputs.oneLiner) {
    predictions.push({
      title: "이 곡의 감정",
      prediction: buildEmotionText(inputs),
    });
  }

  // 6. 수노 체크포인트
  predictions.push({
    title: "Suno 체크포인트",
    prediction: buildCheckpointText(inputs),
  });

  return predictions;
}

function buildDirectionText(inputs: Partial<SunoInput>): string {
  const parts: string[] = [];

  parts.push(`"${inputs.oneLiner}"를 중심으로`);

  if (inputs.genre) {
    const genres = inputs.genre.split("+").map((g) => g.trim());
    if (genres.length >= 2) {
      parts.push(`${genres.join(" x ")} 퓨전 스타일의`);
    } else {
      parts.push(`${genres[0]} 스타일의`);
    }
  }

  if (inputs.era) {
    const eraLabel: Record<string, string> = {
      "80s": "80년대", "90s": "90년대", "2000s": "2000년대",
      "2010s": "2010년대", "2020s": "현대적인", futuristic: "미래적인", vintage: "빈티지한",
    };
    parts.push(`${eraLabel[inputs.era] || inputs.era} 감성을 가진`);
  }

  parts.push("곡이 나올 거예요.");

  if (inputs.vibe) {
    const vibes = inputs.vibe.split(/[,+]/).map((v) => v.trim()).filter(Boolean).slice(0, 3);
    parts.push(`전체적으로 ${vibes.join(", ")} 느낌이 지배적일 거예요.`);
  }

  return parts.join(" ");
}

function buildSoundText(inputs: Partial<SunoInput>): string {
  const parts: string[] = [];

  // 장르별 핵심 악기/사운드
  const genreSounds: Record<string, string> = {
    "K-Pop": "신스 스탭 + 808 킥이 중심. 프리코러스에서 에너지가 올라가고 코러스에서 터질 거예요.",
    "Pop": "기타/피아노 + 프로그래밍 드럼. 깔끔하고 캐치한 사운드.",
    "Hip-Hop": "808 서브베이스가 울리고 스네어가 강하게 때릴 거예요. 하이햇 롤이 공간을 채울 거예요.",
    "Trap": "무거운 808 슬라이드 + 롤링 하이햇. 어둡고 공격적인 비트.",
    "R&B": "Rhodes 피아노 + 부드러운 베이스 라인. 그루브가 살아있는 따뜻한 사운드.",
    "Ballad": "피아노가 주도하고 스트링이 점진적으로 들어올 거예요. 감정 곡선이 핵심.",
    "EDM": "빌드업에서 긴장이 올라가고 드롭에서 폭발할 거예요. 신스 리드가 주인공.",
    "Lo-Fi": "따뜻한 테이프 노이즈 위에 재즈 피아노 + 붐뱁 드럼. 편안한 분위기.",
    "Rock": "일렉기타 리프가 이끌고 드럼이 드라이브할 거예요. 디스토션이 에너지를 줄 거예요.",
    "Techno": "4온더플로어 킥이 끊임없이 밀어주고, 모듈러 시퀀스가 점진적으로 변화할 거예요.",
    "House": "그루비한 킥 + 오프비트 하이햇. 소울풀한 코드가 몸을 움직이게 할 거예요.",
    "Jazz": "복잡한 코드 보이싱 위에 스윙 리듬. 즉흥적인 느낌이 나올 거예요.",
    "Cinematic": "오케스트라가 웅장하게 깔리고, 타이코/팀파니가 임팩트를 줄 거예요.",
    "Ambient": "리듬 없이 패드가 천천히 변화할 거예요. 공간 자체가 음악이 될 거예요.",
    "Synthwave": "아날로그 신스 아르페지오 + 게이트 리버브 스네어. 레트로 무드.",
    "Acoustic": "통기타 핑거피킹 + 가벼운 퍼커션. 자연스럽고 따뜻한 사운드.",
    "Trot": "밝은 키보드 멜로디 + 2/4 바운스 드럼. 멜로디가 귀에 꽂힐 거예요.",
  };

  if (inputs.genre) {
    const firstGenre = inputs.genre.split("+")[0].trim();
    if (genreSounds[firstGenre]) {
      parts.push(genreSounds[firstGenre]);
    }
  }

  if (inputs.texture) {
    const textures = inputs.texture.split(",").map((t) => t.trim()).slice(0, 2);
    parts.push(`질감은 ${textures.join(" + ")} 계열. 믹스 톤에 직접적으로 영향.`);
  }

  return parts.join(" ") || "장르/느낌/질감을 선택하면 사운드 예상이 표시됩니다.";
}

function buildRhythmText(inputs: Partial<SunoInput>): string {
  const parts: string[] = [];

  if (inputs.tempo) {
    const bpmRange: Record<string, string> = {
      very_slow: "50~65 BPM, 매우 느린 호흡",
      slow: "66~80 BPM, 느린 호흡",
      mid_slow: "81~95 BPM, 여유로운 그루브",
      mid: "96~110 BPM, 안정적인 페이스",
      mid_fast: "111~125 BPM, 활기찬 에너지",
      fast: "126~140 BPM, 댄스 에너지",
      very_fast: "141~170 BPM, 고속 드라이브",
      ultra: "171+ BPM, 극한 속도",
    };
    parts.push(bpmRange[inputs.tempo] || inputs.tempo);
  }

  if (inputs.timeSignature) {
    const sigFeel: Record<string, string> = {
      "4/4": "기본 4비트 — 쿵짝쿵짝",
      "3/4": "왈츠 3비트 — 쿵짝짝",
      "6/8": "6/8 — 둥실둥실 흔들리는 느낌",
      "2/4": "2비트 — 빠른 쿵짝",
      "5/4": "5비트 — 불규칙한 긴장감",
      "7/8": "7/8 — 비대칭 그루브",
      shuffle: "셔플 — 바운스 있는 스윙",
      halftime: "하프타임 — 느린 체감, 빠른 하이햇",
    };
    parts.push(sigFeel[inputs.timeSignature] || inputs.timeSignature);
  }

  return parts.join(". ") + "." || "BPM/박자를 선택하면 리듬 예상이 표시됩니다.";
}

function buildVocalText(inputs: Partial<SunoInput>): string {
  const parts: string[] = [];

  if (inputs.vocal) {
    const vocalParts = inputs.vocal.split("|").map((v) => v.trim()).slice(0, 2);
    parts.push(`${vocalParts.join(", ")} 스타일 보컬이 나올 거예요.`);
  }

  if (inputs.reverb) {
    const reverbFeel: Record<string, string> = {
      dry: "거의 리버브 없이 바로 앞에서 부르는 느낌.",
      room: "자연스러운 방 안에서 부르는 느낌.",
      hall: "넓은 공연장에서 울리는 느낌.",
      cathedral: "대성당에서 울려 퍼지는 느낌.",
      lofi_filter: "빈티지 필터를 거친 따뜻한 느낌.",
      plate: "클래식 스튜디오 리버브 느낌.",
    };
    parts.push(reverbFeel[inputs.reverb] || "");
  }

  return parts.join(" ") || "보컬/리버브를 선택하면 보컬 예상이 표시됩니다.";
}

function buildEmotionText(inputs: Partial<SunoInput>): string {
  const oneLiner = inputs.oneLiner || "";
  const vibe = inputs.vibe || "";

  const darkWords = ["밤", "어둠", "눈물", "이별", "혼자", "잊", "아프", "끝", "떠나"];
  const brightWords = ["빛", "웃", "사랑", "함께", "시작", "희망", "봄"];
  const nostalgicWords = ["기억", "추억", "그때", "다시", "돌아", "녹지"];
  const intenseWords = ["불", "폭발", "미치", "질주", "전쟁", "분노", "소리쳐", "달리"];

  const isDark = darkWords.some((w) => oneLiner.includes(w));
  const isBright = brightWords.some((w) => oneLiner.includes(w));
  const isNostalgic = nostalgicWords.some((w) => oneLiner.includes(w));
  const isIntense = intenseWords.some((w) => oneLiner.includes(w));

  if (isIntense) return "이 곡은 억눌린 에너지가 폭발하는 카타르시스를 줄 거예요. 점점 고조되다가 터지는 구조. 듣는 사람이 숨을 참다가 내뱉는 느낌.";
  if (isDark && isNostalgic) return "이 곡은 잊고 싶지만 잊히지 않는 기억의 무게를 담아요. 쓸쓸하면서도 아름다운, 새벽녘 같은 감정.";
  if (isDark) return "이 곡은 어두운 내면을 조용히 들여다보는 느낌이에요. 무겁지만 솔직한, 혼자만의 시간 같은 감정.";
  if (isBright) return "이 곡은 앞으로 나아가는 밝은 에너지를 담아요. 듣는 사람에게 힘을 주는, 창문을 활짝 여는 느낌.";
  if (isNostalgic) return "이 곡은 시간이 멈춘 순간을 붙잡는 느낌이에요. 따뜻하면서 쓸쓸한, 오래된 사진첩을 넘기는 감정.";

  if (vibe.includes("긴장감")) return "이 곡은 불안한 기대감을 줄 거예요. 뭔가 터질 것 같은, 숨을 참고 있는 느낌.";
  if (vibe.includes("몽환적")) return "이 곡은 꿈과 현실 사이를 떠다니는 느낌이에요. 경계가 흐릿한, 부유하는 감정.";
  if (vibe.includes("웅장한")) return "이 곡은 광활한 공간에서 울려 퍼지는 느낌이에요. 가슴이 벅차오르는 순간.";

  return "이 곡은 처음엔 조용히 시작해서 감정이 점점 깊어지는 여정이에요. 끝까지 들으면 여운이 남는 곡.";
}

function buildCheckpointText(inputs: Partial<SunoInput>): string {
  const checks: string[] = [];

  checks.push("Suno로 생성 후 확인할 것:");

  if (inputs.genre) checks.push(`• 장르 느낌이 ${inputs.genre.split("+")[0].trim()}에 맞는지`);
  if (inputs.tempo) checks.push("• BPM이 의도한 속도감과 맞는지");
  if (inputs.vibe) checks.push("• 전체 분위기가 선택한 느낌과 일치하는지");
  if (inputs.vocal) checks.push("• 보컬 음색과 딜리버리가 맞는지");
  if (inputs.reverb) checks.push("• 보컬 공간감(리버브)이 적절한지");

  if (checks.length === 1) checks.push("• 선택을 더 하면 체크포인트가 추가됩니다");

  return checks.join("\n");
}
