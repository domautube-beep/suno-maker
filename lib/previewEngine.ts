// 입력값 기반 실시간 프리뷰 생성
// 대화 진행에 따라 점진적으로 프롬프트가 채워짐

import { SunoInput, PreviewSection } from "./types";

// 장르 → 영문 태그 매핑
const GENRE_MAP: Record<string, string> = {
  // 내부 키
  kpop: "synth-driven, layered hooks, 4/4 pulse",
  rnb: "groove-locked, laid-back pocket, neo-soul influence",
  hiphop: "808 bass, trap hi-hats, boom-bap elements",
  ballad: "piano-driven, emotional build, orchestral swells",
  edm: "build-drop structure, synthesizer lead, four-on-the-floor",
  lofi: "tape saturation, dusty samples, jazzy chords",
  rock: "electric guitar driven, drum kit energy, distorted edge",
  trot: "melodic hook density, bright vocal presence, traditional bounce",
  jazz: "complex chord voicing, swing groove, improvisation space",
  cinematic: "orchestral layers, epic scale, dramatic dynamics",
  pop: "clean production, catchy hooks, radio-ready mix",
  indie: "unique texture, experimental arrangement, lo-fi character",
  // 표시명 키 (GenreSelector에서 이 형태로 전달됨)
  "K-Pop": "synth-driven, layered hooks, 4/4 pulse",
  "R&B": "groove-locked, laid-back pocket, neo-soul influence",
  "R&B / Soul": "groove-locked, laid-back pocket, neo-soul influence",
  "Neo Soul": "warm organic, analog grooves, soulful harmonies",
  "Hip-Hop": "808 bass, trap hi-hats, boom-bap elements",
  "Trap": "808 bass, dark pads, rapid hi-hats, aggressive pocket",
  "Boom Bap": "dusty samples, head-nod groove, classic drum breaks",
  "Gangsta Rap": "808 bass, aggressive delivery, street-level production",
  "Ballad": "piano-driven, emotional build, orchestral swells",
  "EDM / Dance": "build-drop structure, synthesizer lead, four-on-the-floor",
  "Lo-Fi": "tape saturation, dusty samples, jazzy chords",
  "Rock": "electric guitar driven, drum kit energy, distorted edge",
  "Alt / Indie": "unique texture, experimental arrangement, lo-fi character",
  "Punk": "fast aggressive, raw power chords, DIY energy",
  "Metal": "heavy distortion, double bass, aggressive riffs",
  "Pop": "clean production, catchy hooks, radio-ready mix",
  "Dance Pop": "clean synths, four-on-the-floor, catchy hooks",
  "City Pop": "retro synths, groovy bass, nostalgic warmth",
  "Disco / Funk": "groovy bass, funky rhythm, four-on-the-floor",
  "Trot": "melodic hook density, bright vocal presence, traditional bounce",
  "Jazz": "complex chord voicing, swing groove, improvisation space",
  "Blues": "12-bar progression, raw emotion, guitar bends",
  "Cinematic": "orchestral layers, epic scale, dramatic dynamics",
  "Classical": "orchestral arrangement, dynamic range, compositional depth",
  "Orchestral": "full orchestra, symphonic layers, cinematic scale",
  "Ambient": "atmospheric pads, minimal rhythm, spacious textures",
  "Deep House": "warm four-on-the-floor, soulful chords, deep bass",
  "Afro House": "tribal percussion, polyrhythmic groove, organic textures",
  "Melodic House": "emotional progressive groove, arpeggiated melodies, building energy",
  "UK Garage": "syncopated 2-step, chopped vocals, shuffled rhythm",
  "deephouse": "warm four-on-the-floor, soulful chords, deep bass",
  "afrohouse": "tribal percussion, polyrhythmic groove, organic textures",
  "melodichouse": "emotional progressive groove, arpeggiated melodies, building energy",
  "ukgarage": "syncopated 2-step, chopped vocals, shuffled rhythm",
  "Synthwave": "retro synths, 80s drum machines, nostalgic neon",
  "House": "four-on-the-floor, warm bass, groovy loops",
  "Techno": "mechanical rhythm, hypnotic loops, industrial textures",
  "Reggae": "offbeat rhythm, warm bass, island groove",
  "Latin": "rhythmic percussion, warm tones, dance-ready groove",
  "Bossa Nova": "gentle rhythm, jazzy chords, warm acoustic",
  "Acoustic": "natural instruments, intimate recording, organic warmth",
  "Folk": "acoustic guitar, storytelling, earthy warmth",
  "Gospel": "choir harmonies, soulful energy, uplifting dynamics",
};

// 장르 한국어 레이블 매핑
const GENRE_KO_MAP: Record<string, string> = {
  kpop: "K-Pop", rnb: "R&B", hiphop: "힙합", ballad: "발라드", edm: "EDM",
  lofi: "Lo-Fi", rock: "록", trot: "트로트", jazz: "재즈", cinematic: "시네마틱",
  pop: "팝", indie: "인디",
  // 표시명 → 한국어 (이미 같거나 변환)
  "K-Pop": "K-Pop", "R&B": "R&B", "R&B / Soul": "R&B / 소울", "Neo Soul": "네오 소울",
  "Hip-Hop": "힙합", "Trap": "트랩", "Boom Bap": "붐뱁", "Gangsta Rap": "갱스타 랩",
  "Ballad": "발라드", "EDM / Dance": "EDM / 댄스", "Lo-Fi": "Lo-Fi",
  "Rock": "록", "Alt / Indie": "얼터너티브 / 인디", "Punk": "펑크", "Metal": "메탈",
  "Pop": "팝", "Dance Pop": "댄스 팝", "City Pop": "시티 팝", "Disco / Funk": "디스코 / 펑크",
  "Trot": "트로트", "Jazz": "재즈", "Blues": "블루스",
  "Cinematic": "시네마틱", "Classical": "클래식", "Orchestral": "오케스트라",
  "Ambient": "앰비언트", "Synthwave": "신스웨이브", "House": "하우스", "Techno": "테크노",
  "Reggae": "레게", "Latin": "라틴", "Bossa Nova": "보사노바",
  "Acoustic": "어쿠스틱", "Folk": "포크", "Gospel": "가스펠",
};

// 시대 → 영문 태그 매핑
const ERA_MAP: Record<string, string> = {
  "80s": "80s synth character, gated reverb, drum machine",
  "90s": "90s warm pads, groovy bass, natural drums",
  "2000s": "Y2K glitch, pop-hybrid, digital sheen",
  "2010s": "modern clean production, EDM influence, polished mix",
  "2020s": "hyperpop elements, trendy mixing, genre-fluid",
  futuristic: "experimental synthesis, unconventional structure",
  vintage: "analog warmth, vinyl character, classic recording",
};

// 시대 한국어 레이블 매핑
const ERA_KO_MAP: Record<string, string> = {
  "80s": "1980년대",
  "90s": "1990년대",
  "2000s": "2000년대",
  "2010s": "2010년대",
  "2020s": "2020년대",
  futuristic: "미래적",
  vintage: "빈티지",
};

// 텍스처(질감) → 영문 태그 매핑
const TEXTURE_MAP: Record<string, string> = {
  lofi_warm: "tape saturation, vinyl crackle, warm compression",
  clean_digital: "precision mixing, clean synthesis, modern clarity",
  analog_vintage: "analog warmth, soft compression, vintage color",
  raw_gritty: "raw distortion, aggressive attack, unpolished edge",
  dreamy: "wide reverb, phase effects, ethereal layers",
  spacious: "wide stereo, ambient layers, spatial depth",
  dense: "layered stacking, full arrangement, wall of sound",
  minimal: "sparse elements, space as instrument, restraint",
};

// 텍스처 한국어 레이블 매핑
const TEXTURE_KO_MAP: Record<string, string> = {
  lofi_warm: "Lo-Fi 따뜻함",
  clean_digital: "깔끔한 디지털",
  analog_vintage: "아날로그 빈티지",
  raw_gritty: "거친 질감",
  dreamy: "몽환적",
  spacious: "넓은 공간감",
  dense: "풍성한 레이어",
  minimal: "미니멀",
};

// 리버브 → 영문 태그 매핑
const REVERB_MAP: Record<string, string> = {
  dry: "close-mic, intimate distance, minimal reverb",
  room: "medium room, balanced wet/dry, natural space",
  hall: "large hall, wide reverb, distant presence",
  cathedral: "cathedral reverb, massive tail, sacred space",
  lofi_filter: "lo-fi filtered, tape warmth, vintage compression",
  plate: "plate reverb, vintage warm, classic studio",
};

// 리버브 한국어 레이블 매핑
const REVERB_KO_MAP: Record<string, string> = {
  dry: "Dry (가까운 공간)",
  room: "Room (자연스러운 룸)",
  hall: "Hall (넓은 홀)",
  cathedral: "Cathedral (대성당)",
  lofi_filter: "Lo-Fi 필터",
  plate: "Plate (스튜디오 플레이트)",
};

// 느낌 키워드 → 물리적 태그 매핑 (Forensic Translation)
const VIBE_MAP: Record<string, { en: string; ko: string }> = {
  "어두운": { en: "dark minor chords, low-end heavy, shadowy reverb", ko: "어두운 마이너 코드, 저음 강조, 그림자 같은 리버브" },
  "몽환적": { en: "dreamy pads, wide reverb, ethereal atmosphere, floating feel", ko: "몽환적 패드, 넓은 리버브, 공중에 뜨는 느낌" },
  "밝은": { en: "bright major progression, open voicing, airy high-end", ko: "밝은 메이저 진행, 열린 보이싱, 경쾌한 고음역" },
  "감성적": { en: "emotional dynamics, intimate space, gentle swells", ko: "감정적 다이내믹, 친밀한 공간감, 부드러운 볼륨 변화" },
  "에너지틱": { en: "driving rhythm, punchy drums, high energy builds", ko: "추진력 있는 리듬, 펀치감 있는 드럼, 고에너지 빌드업" },
  "차가운": { en: "cold digital textures, sparse arrangement, metallic sheen", ko: "차가운 디지털 질감, 절제된 편곡, 금속성 광택" },
  "따뜻한": { en: "warm analog tones, soft saturation, cozy mid-range", ko: "따뜻한 아날로그 톤, 부드러운 새추레이션, 포근한 중음역" },
  "긴장감": { en: "tension building, dissonant layers, suspenseful progression", ko: "긴장 고조, 불협화 레이어, 서스펜스 진행" },
  "편안한": { en: "relaxed groove, gentle rhythm, comfortable space", ko: "편안한 그루브, 부드러운 리듬, 여유로운 공간" },
  "웅장한": { en: "epic orchestral swells, massive reverb, cinematic scale", ko: "웅장한 오케스트라 스웰, 대형 리버브, 시네마틱 스케일" },
  "레트로": { en: "vintage tape warmth, analog hiss, retro drum machine, 80s synth character", ko: "빈티지 테이프 따뜻함, 아날로그 히스, 레트로 드럼머신" },
  "거친": { en: "raw distortion, aggressive attack, gritty texture", ko: "거친 디스토션, 공격적 어택, 그릿 질감" },
  "부드러운": { en: "smooth legato, soft attack, silk-like texture", ko: "부드러운 레가토, 소프트 어택, 실크 같은 질감" },
  "중독적": { en: "hypnotic loop, repetitive hook pattern, addictive groove lock", ko: "최면적 루프, 반복 훅 패턴, 중독성 그루브" },
  "우울한": { en: "melancholic minor progression, heavy atmosphere, introspective weight", ko: "우울한 마이너 진행, 무거운 분위기, 내면 응시" },
  "희망적": { en: "uplifting chord progression, rising energy, bright resolution", ko: "상승하는 코드 진행, 밝은 해결감" },
  "폭발적": { en: "explosive drop, maximum impact, wall of sound", ko: "폭발적 드롭, 최대 임팩트, 사운드 벽" },
  "나른한": { en: "lazy groove, half-tempo feel, drowsy atmosphere", ko: "나른한 그루브, 하프템포, 졸린 분위기" },
  "매끈한": { en: "polished production, smooth transitions, clean mix", ko: "깔끔한 프로덕션, 매끈한 전환" },
  "아날로그": { en: "analog warmth, tape saturation, vintage character", ko: "아날로그 따뜻함, 테이프 새추레이션" },
  "디지털": { en: "digital precision, clean synthesis, modern production", ko: "디지털 정밀함, 클린 신스" },
  "공간감": { en: "wide stereo field, ambient reverb, spatial depth", ko: "넓은 스테레오, 앰비언트 리버브, 공간 깊이" },
  "친밀한": { en: "close-mic intimacy, whisper distance, personal space", ko: "가까운 마이크, 속삭이는 거리감" },
  "거리감": { en: "distant positioning, large room reverb, far-field presence", ko: "먼 거리감, 큰 룸 리버브" },
  "세련된": { en: "sophisticated arrangement, elegant voicing, refined production", ko: "세련된 편곡, 우아한 보이싱" },
  "실험적": { en: "experimental structure, unconventional sounds, boundary-pushing", ko: "실험적 구조, 비관습적 사운드" },
  "미니멀": { en: "minimal arrangement, sparse elements, space as instrument", ko: "미니멀 편곡, 공간을 악기처럼 사용" },
  "복잡한": { en: "complex arrangement, layered textures, dense instrumentation", ko: "복잡한 편곡, 겹겹이 쌓인 질감" },
};

// 입력 → 실시간 프리뷰 생성
export function generatePreview(inputs: Partial<SunoInput>): PreviewSection[] {
  const sections: PreviewSection[] = [];

  // 1단계: 핵심 문장 — "Core concept:" 라벨 없이 문장 그대로 표시
  if (inputs.oneLiner) {
    sections.push({
      id: "identity",
      label: "IDENTITY",
      english: `"${inputs.oneLiner}"`,
      korean: "이 문장에서 리듬, 악기, 질감을 추론합니다",
    });
  }

  // 2단계: 장르 섹션 — 장르별 특징 태그 표시
  if (inputs.genre) {
    const genreTags = GENRE_MAP[inputs.genre];
    const genreKo = GENRE_KO_MAP[inputs.genre] || inputs.genre;
    sections.push({
      id: "genre",
      label: "GENRE",
      english: genreTags || inputs.genre,
      korean: genreTags ? `${genreKo} 장르 특성 반영` : `${inputs.genre} 장르`,
    });
  }

  // 3단계: 시대 섹션
  if (inputs.era) {
    const eraTags = ERA_MAP[inputs.era];
    const eraKo = ERA_KO_MAP[inputs.era] || inputs.era;
    sections.push({
      id: "era",
      label: "ERA",
      english: eraTags || inputs.era,
      korean: eraTags ? `${eraKo} 시대 사운드 특성` : `${inputs.era} 시대`,
    });
  }

  // 4단계: 텍스처 섹션
  if (inputs.texture) {
    const textureTags = TEXTURE_MAP[inputs.texture];
    const textureKo = TEXTURE_KO_MAP[inputs.texture] || inputs.texture;
    sections.push({
      id: "texture-step",
      label: "TEXTURE",
      english: textureTags || inputs.texture,
      korean: textureTags ? `${textureKo} 프로덕션 질감` : `${inputs.texture} 질감`,
    });
  }

  // 5단계: 느낌 → 물리적 사운드 태그로 변환
  if (inputs.vibe) {
    const matchedVibes: { en: string; ko: string }[] = [];
    for (const [keyword, tags] of Object.entries(VIBE_MAP)) {
      if (inputs.vibe.includes(keyword)) {
        matchedVibes.push(tags);
      }
    }

    if (matchedVibes.length > 0) {
      sections.push({
        id: "texture",
        label: "TEXTURE & MOOD",
        english: matchedVibes.map((v) => v.en).join(", "),
        korean: matchedVibes.map((v) => v.ko).join(", "),
      });
    } else {
      // 매핑 안 된 자유 입력
      sections.push({
        id: "texture",
        label: "TEXTURE & MOOD",
        english: `"${inputs.vibe}" → physical sound tags pending`,
        korean: `"${inputs.vibe}" → 물리적 사운드 태그로 변환 대기`,
      });
    }
  }

  // 리버브 섹션
  if (inputs.reverb) {
    const reverbTags = REVERB_MAP[inputs.reverb];
    const reverbKo = REVERB_KO_MAP[inputs.reverb] || inputs.reverb;
    sections.push({
      id: "reverb",
      label: "REVERB",
      english: reverbTags || inputs.reverb,
      korean: reverbTags ? `${reverbKo} 공간감 설정` : `${inputs.reverb} 리버브`,
    });
  }

  // 보컬 프로파일
  if (inputs.vocal) {
    sections.push({
      id: "vocal",
      label: "VOCAL PROFILE",
      english: inputs.vocal,
      korean: "보컬 타입, 음색, 딜리버리, 공간감 설정",
    });
  }

  // 4단계: 언어 설정
  if (inputs.language) {
    const langMap: Record<string, { en: string; ko: string }> = {
      ko: {
        en: "Korean lyrics, 2-5 eojeol phrasing, vowel-chain hooks",
        ko: "한국어 가사, 2~5어절 프레이징, 모음 연쇄 훅",
      },
      en: {
        en: "English lyrics, natural stress pattern, singable phrases",
        ko: "영어 가사, 자연스러운 강세, 부르기 쉬운 프레이즈",
      },
      ja: {
        en: "Japanese lyrics, mora-based phrasing, vowel-open hooks",
        ko: "일본어 가사, 모라 기반 프레이징, 모음 개방 훅",
      },
      mixed: {
        en: "Korean + English mixed lyrics, bilingual hook design",
        ko: "한국어 + 영어 믹스, 이중언어 훅 설계",
      },
    };
    const lang = langMap[inputs.language] || langMap["ko"];
    sections.push({
      id: "lyrics-config",
      label: "LYRICS CONFIG",
      english: lang.en,
      korean: lang.ko,
    });
  }

  // 모든 입력 완료 시 — 구조 프리뷰
  if (inputs.oneLiner && inputs.language) {
    sections.push({
      id: "structure",
      label: "SONG FORM",
      english: "Verse 1 → Hook → Chorus → Verse 2 → Bridge → Hook → Chorus → Outro",
      korean: "벌스1 → 훅 → 코러스 → 벌스2 → 브릿지 → 훅 → 코러스 → 아웃트로",
    });

    sections.push({
      id: "engine",
      label: "AUTO-HOOK ENGINE",
      english: "Repetition Mandate + Antithesis + Internal Rhyme + Memory Loop",
      korean: "반복 앵커 + 대립 구조 + 내부 라임 체인 + 기억 루프 자동 적용",
    });
  }

  return sections;
}
