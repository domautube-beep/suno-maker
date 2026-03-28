// 데모 프롬프트 생성기
// Suno v5.5 실제 입력 형식에 맞춤: Style of Music + Lyrics

import { SunoInput, SunoOutput } from "./types";
import { getGenrePreset } from "./genrePresets";

// 핵심 문장 + 느낌 → 곡 전체 감정 요약 (영문, Style 끝에 추가)
function buildEmotionSummary(oneLiner: string, vibe: string, genre: string): string {
  const darkWords = ["밤", "어둠", "눈물", "이별", "혼자", "잊", "아프", "끝", "떠나", "사라"];
  const brightWords = ["빛", "웃", "사랑", "함께", "시작", "희망", "봄", "아침"];
  const nostalgicWords = ["기억", "추억", "그때", "다시", "돌아", "녹지"];
  const intenseWords = ["불", "폭발", "미치", "질주", "전쟁", "분노", "소리쳐", "달리"];
  const lonelyWords = ["혼자", "외로", "쓸쓸", "텅", "빈"];

  const isDark = darkWords.some((w) => oneLiner.includes(w));
  const isBright = brightWords.some((w) => oneLiner.includes(w));
  const isNostalgic = nostalgicWords.some((w) => oneLiner.includes(w));
  const isIntense = intenseWords.some((w) => oneLiner.includes(w));
  const isLonely = lonelyWords.some((w) => oneLiner.includes(w));

  // 느낌 키워드도 반영
  const vibeHas = (kw: string) => vibe.includes(kw);

  if (isIntense) return "Overall emotional arc: raw defiance building to cathartic release, tension exploding into liberation.";
  if (isDark && isLonely) return "Overall emotional arc: deep solitude and quiet ache, intimate pain echoing in empty space.";
  if (isDark && isNostalgic) return "Overall emotional arc: bittersweet longing wrapped in shadow, memories that refuse to fade.";
  if (isDark) return "Overall emotional arc: dark introspection, emotional weight carried through restrained intensity.";
  if (isBright && isNostalgic) return "Overall emotional arc: warm nostalgia glowing with gentle hope, looking back with a soft smile.";
  if (isBright) return "Overall emotional arc: radiant energy and forward momentum, bright emotions lifting upward.";
  if (isNostalgic) return "Overall emotional arc: wistful remembrance, time standing still in a moment that won't let go.";
  if (isLonely) return "Overall emotional arc: quiet solitude, the beauty and ache of being alone with your thoughts.";

  if (vibeHas("긴장감")) return "Overall emotional arc: mounting tension and suspense, unresolved energy seeking release.";
  if (vibeHas("몽환적")) return "Overall emotional arc: dreamlike drift between reality and imagination, floating in ethereal space.";
  if (vibeHas("웅장한")) return "Overall emotional arc: epic grandeur building from silence to overwhelming scale.";

  return "Overall emotional arc: evolving emotional journey from intimate beginning to resonant conclusion.";
}

export function generateDemo(inputs: SunoInput): { output: SunoOutput; forensicLog: string } {
  const { oneLiner, vibe, genre, tempo, timeSignature, era, texture, reverb, language } = inputs;

  // 장르 프리셋 조회 (있으면 프리셋 기반, 없으면 범용 베이스 스타일 사용)
  const preset = getGenrePreset(genre);

  // 프로듀서 분석 노트 (Forensic Translation 근거)
  const forensicLog = [
    `[프로듀서 분석 노트]`,
    ``,
    `핵심: "${oneLiner}"`,
    vibe ? `느낌: "${vibe}"` : `느낌: 미지정 → 핵심 문장에서 추론`,
    genre ? `장르: ${genre}${preset ? " (프리셋 적용됨)" : " (범용 베이스 스타일)"}` : "",
    tempo ? `템포: ${tempo}` : "",
    timeSignature ? `박자: ${timeSignature}` : "",
    era ? `시대: ${era}` : "",
    texture ? `질감: ${texture}` : "",
    reverb ? `리버브: ${reverb}` : "",
    `언어: ${language === "ko" ? "한국어" : language === "en" ? "English" : "한국어+English"}`,
    ``,
    `[Forensic Translation]`,
    `"${oneLiner}" 분석:`,
    `  → 감정 방향: introspective, unresolved tension, quiet defiance`,
    `  → 리듬 추론: mid-tempo groove, 86-92 BPM, laid-back pocket`,
    `  → 질감 추론: warm analog, soft tape saturation, intimate space`,
    `  → 편곡 추론: minimal verse → layered chorus → stripped bridge`,
    `  → 보컬 추론: intimate male vocal, conversational to emotional`,
    vibe ? `  → 느낌 보정: "${vibe}" 반영` : ``,
    preset
      ? `  → 장르 프리셋: ${genre} 전용 Style 템플릿 적용`
      : genre
      ? `  → 장르 특성: ${genre} 요소 반영 (범용)`
      : "",
    era && !preset ? `  → 시대 특성: ${era} 사운드 반영` : "",
    texture && !preset ? `  → 텍스처: ${texture} 프로덕션 반영` : "",
  ].filter(Boolean).join("\n");

  // =============================================
  // Style of Music — 장르 프리셋 우선 적용, 900자 이하
  // =============================================

  // 시대별 사운드 특성 설명 (프리셋 없을 때만 사용)
  const eraStyleMap: Record<string, string> = {
    "80s": "80s synth character with gated reverb and drum machine programming.",
    "90s": "90s warm pads with groovy bass and natural drum recording.",
    "2000s": "Y2K glitch elements with pop-hybrid production and digital sheen.",
    "2010s": "Modern clean production with EDM influence and polished mix.",
    "2020s": "Hyperpop elements with trendy mixing and genre-fluid approach.",
    futuristic: "Experimental synthesis with unconventional structural progression.",
    vintage: "Analog warmth with vinyl character and classic recording approach.",
  };

  // 텍스처별 프로덕션 설명 (프리셋 없을 때만 사용)
  const textureStyleMap: Record<string, string> = {
    lofi_warm: "Tape saturation with vinyl crackle and warm compression throughout.",
    clean_digital: "Precision mixing with clean synthesis and modern clarity.",
    analog_vintage: "Analog warmth with soft compression and vintage color.",
    raw_gritty: "Raw distortion with aggressive attack and unpolished edge.",
    dreamy: "Wide reverb with phase effects and ethereal layering.",
    spacious: "Wide stereo field with ambient layers and spatial depth.",
    dense: "Layered stacking with full arrangement and wall of sound approach.",
    minimal: "Sparse elements with space as an instrument and deliberate restraint.",
  };

  // BPM 슬롯 → 실제 BPM 문자열 매핑
  const bpmMap: Record<string, string> = {
    very_slow: "58 BPM",
    slow: "72 BPM",
    mid_slow: "85 BPM",
    mid: "100 BPM",
    mid_fast: "118 BPM",
    fast: "130 BPM",
    very_fast: "155 BPM",
    ultra: "180 BPM",
  };

  // 한글 장르명 → 영문 변환 매핑
  const koreanToEnglish: Record<string, string> = {
    "케이팝": "K-Pop", "팝": "Pop", "댄스팝": "Dance Pop", "신스팝": "Synth Pop",
    "시티팝": "City Pop", "디스코": "Disco", "펑크": "Funk", "풍크": "Funk",
    "알앤비": "R&B", "소울": "Soul", "네오소울": "Neo Soul", "가스펠": "Gospel",
    "힙합": "Hip-Hop", "트랩": "Trap", "붐뱁": "Boom Bap", "드릴": "Drill",
    "발라드": "Ballad", "로파이": "Lo-Fi", "어쿠스틱": "Acoustic", "포크": "Folk",
    "록": "Rock", "얼터너티브": "Alternative Rock", "인디록": "Indie Rock",
    "메탈": "Metal", "프로그레시브": "Progressive Rock", "그런지": "Grunge",
    "이디엠": "EDM", "하우스": "House", "테크노": "Techno", "트랜스": "Trance",
    "덥스텝": "Dubstep", "앰비언트": "Ambient", "신스웨이브": "Synthwave",
    "시네마틱": "Cinematic", "오케스트라": "Orchestral", "클래식": "Classical",
    "재즈": "Jazz", "블루스": "Blues", "레게": "Reggae", "라틴": "Latin",
    "보사노바": "Bossa Nova", "트로트": "Trot", "빈티지": "Vintage",
    "밴드": "Band", "락": "Rock", "랩": "Rap",
    "어메리칸": "American", "브리티시": "British", "코리안": "Korean",
  };

  // 장르 문자열을 영문으로 변환
  function translateGenreToEnglish(input: string): string {
    if (!input) return "";
    let result = input;
    // 한글 키워드를 영문으로 치환
    for (const [ko, en] of Object.entries(koreanToEnglish)) {
      result = result.replace(new RegExp(ko, "gi"), en);
    }
    // 남은 한글이 있으면 원본 유지 (알 수 없는 한글)
    return result;
  }

  // 장르를 영문으로 변환
  const genreEnglish = translateGenreToEnglish(genre);

  // 기본 베이스 스타일 (장르 프리셋이 없을 때 사용)
  const baseStyle = `Mid-tempo groove anchored at 88 BPM with a laid-back 1/16 swing pocket. Warm analog synth pads provide the harmonic bed while a muted electric guitar delivers sparse melodic fragments in the verse. 808 sub bass locks with a crisp rimshot pattern, creating a hypnotic low-end groove. Hi-hats maintain subtle syncopation with ghost notes adding organic texture. Lo-fi piano chords emerge in the pre-hook, layering warmth into the mid-range. The chorus opens with full drum programming, layered synth stacks, and ambient pad swells that widen the stereo field dramatically. Bridge strips to solo piano with atmospheric reverb tails. Final chorus adds harmonic instrument layers and rhythmic variation for climactic density.`;

  // Style of Music 조합 — 프리셋 기반 + 모든 사용자 설정 반영
  let style: string;

  // 1단계: 기본 스타일 선택
  if (preset) {
    style = preset.style;
  } else {
    const genrePrefix = genreEnglish ? `${genreEnglish}, ` : "";
    style = genrePrefix + baseStyle;
  }

  // 2단계: BPM 교체
  if (tempo && bpmMap[tempo]) {
    style = style.replace(/\d+ BPM/i, bpmMap[tempo]);
  }

  // 3단계: 박자 교체
  if (timeSignature && timeSignature !== "4/4") {
    // 기존 4/4 교체
    style = style.replace(/4\/4/g, timeSignature);
    // 박자 관련 설명 없으면 추가
    if (!style.includes(timeSignature)) {
      style += ` ${timeSignature} time signature feel.`;
    }
  }

  // 4단계: 악기 반영 — 사용자가 선택한 악기를 Style에 삽입
  if (inputs.instruments) {
    style += ` Instrumentation: ${inputs.instruments}.`;
  }

  // 5단계: 시대 반영
  if (era && eraStyleMap[era] && (!preset || preset.era !== era)) {
    style += ` ${eraStyleMap[era]}`;
  }

  // 6단계: 텍스처 반영
  if (texture) {
    // textureStyleMap에 있으면 사용, 없으면 직접 삽입
    if (textureStyleMap[texture]) {
      style += ` ${textureStyleMap[texture]}`;
    } else {
      // 사용자 직접 입력 (한글 포함 가능) → 영문 변환 시도
      style += ` Production texture: ${texture}.`;
    }
  }

  // 7단계: 곡 전체 감정 요약 추가 (핵심 문장 + 느낌 기반)
  const emotionSummary = buildEmotionSummary(oneLiner, vibe, genre);
  if (emotionSummary) {
    style += ` ${emotionSummary}`;
  }

  // 900자 초과해도 전체 출력 (사용자가 직접 편집 가능)

  // =============================================
  // Lyrics — VOCAL PROFILE + 섹션별 가사
  // =============================================
  const isKo = language === "ko" || language === "mixed";

  // reverb 입력값에 따른 REVERB 필드 값 결정
  const reverbProfileMap: Record<string, string> = {
    dry: "close-mic, intimate distance, minimal reverb, 0% wet",
    room: "medium room reverb, 25% wet, balanced natural space",
    hall: "large hall reverb, 40% wet, distant presence, long tail",
    cathedral: "cathedral reverb, 60% wet, massive tail 4s, sacred space",
    lofi_filter: "lo-fi filtered reverb, tape warmth, vintage compression, 20% wet",
    plate: "plate reverb, 30% wet, pre-delay 20ms, warm tail 1.2s",
  };
  const reverbProfile = reverb && reverbProfileMap[reverb]
    ? reverbProfileMap[reverb]
    : "medium plate, 30% wet, pre-delay 20ms, warm tail 1.2s";

  // 사용자 vocal 입력 파싱 — "|" 구분자로 타입/음색/딜리버리/공간감 분리
  const vocalParts = inputs.vocal ? inputs.vocal.split("|").map((p) => p.trim()).filter(Boolean) : [];

  // 사용자 입력이 있으면 해당 값 사용, 없으면 기본값
  const voiceType = vocalParts.find((p) => p.includes("male") || p.includes("female") || p.includes("duet") || p.includes("group"))
    || "male, mid-range tenor, warm natural presence";
  const timbre = vocalParts.find((p) => p.includes("grain") || p.includes("silk") || p.includes("rasp") || p.includes("breathy") || p.includes("powerful") || p.includes("warm") || p.includes("crystal") || p.includes("soulful") || p.includes("metallic"))
    || "soft grain, natural warmth, slight rasp on sustained notes";
  const delivery = vocalParts.find((p) => p.includes("conversational") || p.includes("emotional") || p.includes("laid-back") || p.includes("rhythmic") || p.includes("lyrical") || p.includes("rap") || p.includes("whisper") || p.includes("belting") || p.includes("scat") || p.includes("deadpan"))
    || "conversational verse, supported chest chorus, raw whisper bridge";
  const vocalSpace = vocalParts.find((p) => p.includes("close-mic") || p.includes("medium room") || p.includes("large hall") || p.includes("lo-fi") || p.includes("cathedral") || p.includes("outdoor") || p.includes("telephone"))
    || "";

  // VOCAL_PROFILE 요약 — 사용자 입력 기반
  const profileSummary = vocalParts.length > 0
    ? vocalParts.map((p) => p.split(",")[0]).join(", ")
    : "intimate storyteller, vulnerability over power, controlled emotional range";

  const vocalProfile = [
    `[VOCAL_PROFILE: ${profileSummary}]`,
    `[VOICE_TYPE: ${voiceType}]`,
    `[TIMBRE: ${timbre}]`,
    `[ARTICULATION: relaxed consonants, flowing legato, occasional breathy onset]`,
    `[VIBRATO: minimal, slow controlled, phrase-end only]`,
    `[DELIVERY: ${delivery}]`,
    `[REVERB: ${vocalSpace || reverbProfile}]`,
    `[PERFORMANCE_TRAITS: audible breath before key phrases, natural crescendo into hook]`,
    `[Evolution: close whisper verse → open supported chorus → exposed vulnerable bridge → layered final chorus with doubles]`,
  ].join("\n");

  const lyricsBody = isKo ? [
    ``,
    `[SECTION: Verse 1]`,
    `[VOCAL_PROMPT: soft, close-mic warmth, measured breath, gentle conversational tone, slow build]`,
    `[LAYER: muted guitar arpeggios, lo-fi piano, ambient pad, minimal percussion]`,
    `[Texture: sparse, intimate room, warm lo-fi haze]`,
    ``,
    `시계는 멈춘 척 해도 손끝은 떨려`,
    `네 이름 세 글자가 혀끝에 걸려`,
    `지운 줄 알았던 번호가 자동완성 돼`,
    `습관이 기억보다 오래 산다는 걸 깨`,
    ``,
    `[SECTION: Hook]`,
    `[VOCAL_PROMPT: lifted chest voice, rhythmic precision, hook delivery, slight urgency]`,
    `[LAYER: 808 bass enters, finger snaps, synth swell, density increase]`,
    `[Texture: warmth expands, stereo widens, pulse locks in]`,
    ``,
    `꿈은 녹지 않아 (녹지 않아)`,
    `네가 남긴 자리 아직 따뜻해`,
    `꿈은 녹지 않아`,
    ``,
    `[SECTION: Chorus]`,
    `[VOCAL_PROMPT: full emotional projection, sustained notes, powerful but controlled, peak arc]`,
    `[LAYER: full drums, bass groove, layered synth, vocal doubles, maximum arrangement]`,
    `[Texture: full density, bright high-end, deep low-end, widest stereo]`,
    ``,
    `녹지 않는 꿈 안에서 너를 만나`,
    `깨지 않는 밤 안에서 너를 안아`,
    `아침이 와도 난 여기 서 있을게`,
    `녹지 않는 이 꿈이 끝나지 않게`,
    ``,
    `[SECTION: Verse 2]`,
    `[VOCAL_PROMPT: slightly more confident, flowing narrative, emotional weight building]`,
    `[LAYER: verse 1 base, added rimshot, subtle counter melody, bass movement]`,
    `[Texture: evolved warmth, more rhythmic presence, still intimate]`,
    ``,
    `서랍 속 사진은 빛이 바랬지만`,
    `웃고 있는 너는 아직 선명한데`,
    `계절이 바뀌어도 멈춘 장면 하나`,
    `되감기만 해도 심장이 뛰는 밤`,
    ``,
    `[SECTION: Bridge]`,
    `[VOCAL_PROMPT: vulnerable, stripped back, breath-heavy, raw exposed emotion, whisper close]`,
    `[LAYER: piano solo, ambient drone, all other instruments drop]`,
    `[Texture: sudden strip-back, exposed intimacy, silence as texture]`,
    ``,
    `잊는 법을 몰라서가 아니야`,
    `잊고 싶지 않아서 여기 서 있어`,
    ``,
    `[SECTION: Hook]`,
    `[VOCAL_PROMPT: returning energy, recognition, emotional lock-in]`,
    `[LAYER: instruments gradually re-enter, building from bridge silence]`,
    `[Texture: rebuilding density, warmth returning]`,
    ``,
    `꿈은 녹지 않아 (녹지 않아)`,
    `네가 남긴 자리 아직 따뜻해`,
    `꿈은 녹지 않아`,
    ``,
    `[SECTION: Chorus]`,
    `[VOCAL_PROMPT: maximum emotion, ad-lib doubles, climactic sustained delivery]`,
    `[LAYER: full arrangement, added harmony vocals, ambient swell, peak density]`,
    `[Texture: maximum width, brightest mix, emotional peak]`,
    ``,
    `녹지 않는 꿈 안에서 너를 만나`,
    `깨지 않는 밤 안에서 너를 안아`,
    `아침이 와도 난 여기 서 있을게`,
    `녹지 않는 이 꿈이 끝나지 않게`,
    ``,
    `[SECTION: Outro]`,
    `[VOCAL_PROMPT: fading whisper, gentle release, breath dissolving]`,
    `[LAYER: piano sustain, ambient reverb tail, instruments fade one by one]`,
    `[Texture: dissolving, returning to intimate space, silence approaching]`,
    ``,
    `꿈은 녹지 않아...`,
    `(녹지 않아...)`,
  ].join("\n") : [
    ``,
    `[SECTION: Verse 1]`,
    `[VOCAL_PROMPT: soft, intimate, measured phrasing, conversational]`,
    `[LAYER: muted guitar, piano, ambient pad, minimal]`,
    `[Texture: sparse, warm, close]`,
    ``,
    `(English lyrics — "${oneLiner}")`,
    `(Claude Code에서 실제 생성 시 작성됩니다)`,
  ].join("\n");

  const lyrics = vocalProfile + lyricsBody;

  return {
    output: { style, lyrics },
    forensicLog,
  };
}
