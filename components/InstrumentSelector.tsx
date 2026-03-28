"use client";

import { useState } from "react";

interface InstrumentSelectorProps {
  onSubmit: (value: string) => void;
  onSkip: () => void;
  genre?: string;
}

// 악기 대분류 → 소분류 (악기 + 스타일/연주법)
const INSTRUMENT_CATEGORIES = [
  {
    id: "keys",
    label: "건반/피아노",
    options: [
      { label: "그랜드 피아노", value: "grand piano, expressive dynamics" },
      { label: "어쿠스틱 피아노", value: "acoustic piano, natural tone" },
      { label: "일렉트릭 피아노 (Rhodes)", value: "Rhodes electric piano, warm bell-like tone" },
      { label: "Wurlitzer", value: "Wurlitzer electric piano, gritty bark tone" },
      { label: "클래비넷", value: "clavinet, funky percussive pluck" },
      { label: "하프시코드", value: "harpsichord, baroque plucked strings" },
      { label: "오르간 (Hammond)", value: "Hammond organ, rotary speaker warmth" },
      { label: "교회 오르간", value: "church organ, pipe organ, sacred resonance" },
      { label: "어코디언", value: "accordion, bellows-driven reed" },
    ],
  },
  {
    id: "synth",
    label: "신스/전자",
    options: [
      { label: "아날로그 신스 패드", value: "analog synth pad, warm sustained chords" },
      { label: "디지털 신스 리드", value: "digital synth lead, bright cutting melody" },
      { label: "슈퍼소우 리드", value: "supersaw lead, massive detuned stack" },
      { label: "FM 신스", value: "FM synthesis, metallic bell-like tones" },
      { label: "모듈러 신스", value: "modular synth, evolving sequences" },
      { label: "신스 아르페지오", value: "synth arpeggio, rhythmic pattern sequence" },
      { label: "신스 베이스", value: "synth bass, deep sub oscillator" },
      { label: "보코더", value: "vocoder, robotic harmonic voice" },
      { label: "신스 스트링", value: "synth strings, lush pad ensemble" },
      { label: "글리치/그래뉼러", value: "glitch synthesis, granular texture, digital artifacts" },
    ],
  },
  {
    id: "guitar",
    label: "기타",
    options: [
      { label: "어쿠스틱 기타 (스트럼)", value: "acoustic guitar strumming, rhythmic chords" },
      { label: "어쿠스틱 기타 (핑거피킹)", value: "acoustic guitar fingerpicking, delicate arpeggios" },
      { label: "나일론 기타 (클래식)", value: "nylon string classical guitar, warm fingerstyle" },
      { label: "일렉기타 (클린)", value: "clean electric guitar, chorus shimmer" },
      { label: "일렉기타 (크런치)", value: "crunch electric guitar, light overdrive" },
      { label: "일렉기타 (디스토션)", value: "distorted electric guitar, heavy power chords" },
      { label: "일렉기타 (리드/솔로)", value: "electric guitar lead, expressive solo bends" },
      { label: "뮤트 기타", value: "muted electric guitar, palm-muted rhythmic chug" },
      { label: "슬라이드 기타", value: "slide guitar, bluesy glissando" },
      { label: "12현 기타", value: "12-string guitar, shimmering doubled strings" },
    ],
  },
  {
    id: "bass",
    label: "베이스",
    options: [
      { label: "일렉 베이스 (핑거)", value: "fingerstyle electric bass, warm round tone" },
      { label: "일렉 베이스 (슬랩)", value: "slap bass, funky percussive pop" },
      { label: "일렉 베이스 (픽)", value: "pick bass, aggressive attack definition" },
      { label: "업라이트 베이스", value: "upright acoustic bass, woody walking lines" },
      { label: "프렛리스 베이스", value: "fretless bass, smooth gliding legato" },
      { label: "808 서브 베이스", value: "808 sub bass, deep sustained low-end" },
      { label: "신스 베이스 (Reese)", value: "Reese bass, detuned saw oscillator growl" },
      { label: "애시드 베이스 (TB-303)", value: "acid bass, TB-303 squelchy filter resonance" },
    ],
  },
  {
    id: "drums",
    label: "드럼/퍼커션",
    options: [
      { label: "어쿠스틱 드럼킷", value: "acoustic drum kit, natural recording" },
      { label: "브러시 드럼", value: "brush drums, soft jazz sweep" },
      { label: "808 드럼머신", value: "808 drum machine, electronic kick and snare" },
      { label: "909 드럼머신", value: "909 drum machine, punchy house kicks" },
      { label: "LinnDrum", value: "LinnDrum, 80s digital drum machine" },
      { label: "트랩 하이햇", value: "trap hi-hats, rapid 1/32 rolls with pitch bends" },
      { label: "핑거스냅/클랩", value: "finger snaps and claps, organic percussion" },
      { label: "카혼", value: "cajon, acoustic box percussion" },
      { label: "콩가/봉고", value: "congas and bongos, latin hand drums" },
      { label: "탬버린/셰이커", value: "tambourine and shaker, rhythmic accents" },
      { label: "타이코", value: "taiko drums, massive impact percussion" },
    ],
  },
  {
    id: "strings",
    label: "현악기",
    options: [
      { label: "바이올린", value: "violin, expressive bowed strings" },
      { label: "첼로", value: "cello, deep rich bowed resonance" },
      { label: "비올라", value: "viola, warm mid-range strings" },
      { label: "스트링 앙상블", value: "string ensemble, lush orchestral section" },
      { label: "피치카토 스트링", value: "pizzicato strings, plucked rhythmic accents" },
      { label: "하프", value: "harp, glissando arpeggios" },
      { label: "우쿨렐레", value: "ukulele, bright island strum" },
      { label: "만돌린", value: "mandolin, tremolo picking" },
      { label: "반조", value: "banjo, bright country fingerpicking" },
      { label: "시타르", value: "sitar, Indian resonant drone strings" },
      { label: "가야금/거문고", value: "gayageum, Korean traditional plucked zither" },
    ],
  },
  {
    id: "brass_wind",
    label: "관악기",
    options: [
      { label: "트럼펫", value: "trumpet, bright brass melody" },
      { label: "트롬본", value: "trombone, warm slide brass" },
      { label: "색소폰 (알토)", value: "alto saxophone, smooth jazz melody" },
      { label: "색소폰 (테너)", value: "tenor saxophone, rich soulful tone" },
      { label: "플루트", value: "flute, airy breathy woodwind" },
      { label: "클라리넷", value: "clarinet, warm woody reed" },
      { label: "오보에", value: "oboe, nasal expressive double reed" },
      { label: "프렌치 혼", value: "French horn, noble heroic brass" },
      { label: "브라스 섹션", value: "brass section, punchy horn stabs" },
      { label: "하모니카", value: "harmonica, bluesy mouth harp bends" },
      { label: "대금/피리", value: "daegeum, Korean bamboo flute, airy traditional" },
    ],
  },
  {
    id: "texture",
    label: "텍스처/FX",
    options: [
      { label: "앰비언트 패드", value: "ambient pad, evolving atmospheric texture" },
      { label: "필드 레코딩 (비/바람)", value: "field recording, rain and wind ambience" },
      { label: "비닐 크랙클", value: "vinyl crackle, lo-fi record noise" },
      { label: "테이프 히스", value: "tape hiss, analog noise floor" },
      { label: "리버스 심벌", value: "reverse cymbal, rising tension swell" },
      { label: "보컬 쵸핑", value: "vocal chops, sliced pitched vocal samples" },
      { label: "화이트 노이즈 스윕", value: "white noise sweep, build-up riser" },
      { label: "글리치 FX", value: "glitch effects, stutter and buffer repeat" },
      { label: "드론", value: "sustained drone, continuous harmonic bed" },
      { label: "벨/차임", value: "bells and chimes, metallic resonant tone" },
    ],
  },
];

// 장르별 추천 악기 — 장르명은 GenreSelector 소분류와 정확히 매칭
const GENRE_INSTRUMENTS: Record<string, string[]> = {
  // 팝/댄스
  "K-Pop": ["아날로그 신스 패드", "808 드럼머신", "일렉기타 (클린)", "신스 아르페지오"],
  "J-Pop": ["어쿠스틱 피아노", "아날로그 신스 패드", "어쿠스틱 드럼킷", "일렉기타 (클린)"],
  "Pop": ["어쿠스틱 기타 (스트럼)", "어쿠스틱 드럼킷", "그랜드 피아노", "신스 베이스"],
  "Dance Pop": ["슈퍼소우 리드", "909 드럼머신", "신스 베이스", "아날로그 신스 패드"],
  "Synth Pop": ["아날로그 신스 패드", "디지털 신스 리드", "808 드럼머신", "신스 아르페지오"],
  "Electro Pop": ["디지털 신스 리드", "808 드럼머신", "신스 베이스", "보코더"],
  "City Pop": ["일렉트릭 피아노 (Rhodes)", "일렉 베이스 (핑거)", "어쿠스틱 드럼킷", "아날로그 신스 패드"],
  "Disco": ["일렉 베이스 (핑거)", "브라스 섹션", "909 드럼머신", "아날로그 신스 패드"],
  "Funk": ["일렉 베이스 (슬랩)", "클래비넷", "브라스 섹션", "어쿠스틱 드럼킷"],
  "Nu Disco": ["신스 베이스", "909 드럼머신", "아날로그 신스 패드", "일렉기타 (클린)"],
  // R&B/소울
  "R&B": ["일렉트릭 피아노 (Rhodes)", "핑거스냅/클랩", "일렉 베이스 (핑거)", "아날로그 신스 패드"],
  "Neo Soul": ["일렉트릭 피아노 (Rhodes)", "업라이트 베이스", "브러시 드럼", "Wurlitzer"],
  "Soul": ["오르간 (Hammond)", "일렉 베이스 (핑거)", "어쿠스틱 드럼킷", "브라스 섹션"],
  "Gospel": ["그랜드 피아노", "오르간 (Hammond)", "어쿠스틱 드럼킷", "탬버린/셰이커"],
  "Contemporary R&B": ["아날로그 신스 패드", "808 드럼머신", "일렉트릭 피아노 (Rhodes)", "신스 베이스"],
  "Alternative R&B": ["아날로그 신스 패드", "808 드럼머신", "일렉기타 (클린)", "앰비언트 패드"],
  // 힙합/랩
  "Hip-Hop": ["808 서브 베이스", "808 드럼머신", "트랩 하이햇", "아날로그 신스 패드"],
  "Trap": ["808 서브 베이스", "트랩 하이햇", "808 드럼머신", "보컬 쵸핑"],
  "Boom Bap": ["808 드럼머신", "어쿠스틱 피아노", "일렉 베이스 (핑거)", "비닐 크랙클"],
  "Cloud Rap": ["아날로그 신스 패드", "808 서브 베이스", "트랩 하이햇", "앰비언트 패드"],
  "Drill": ["808 서브 베이스", "트랩 하이햇", "808 드럼머신", "디지털 신스 리드"],
  "Phonk": ["808 드럼머신", "808 서브 베이스", "보컬 쵸핑", "비닐 크랙클"],
  "Lo-Fi Hip-Hop": ["일렉트릭 피아노 (Rhodes)", "808 드럼머신", "비닐 크랙클", "업라이트 베이스"],
  "Trip-Hop": ["어쿠스틱 드럼킷", "신스 베이스", "앰비언트 패드", "일렉기타 (클린)"],
  // 록/메탈
  "Rock": ["일렉기타 (디스토션)", "어쿠스틱 드럼킷", "일렉 베이스 (픽)", "일렉기타 (리드/솔로)"],
  "Alt Rock": ["일렉기타 (크런치)", "어쿠스틱 드럼킷", "일렉 베이스 (핑거)", "아날로그 신스 패드"],
  "Indie Rock": ["일렉기타 (클린)", "어쿠스틱 드럼킷", "일렉 베이스 (핑거)", "어쿠스틱 기타 (스트럼)"],
  "Punk Rock": ["일렉기타 (디스토션)", "어쿠스틱 드럼킷", "일렉 베이스 (픽)", "핑거스냅/클랩"],
  "Metal": ["일렉기타 (디스토션)", "어쿠스틱 드럼킷", "일렉 베이스 (픽)", "일렉기타 (리드/솔로)"],
  "Progressive Rock": ["그랜드 피아노", "아날로그 신스 패드", "일렉기타 (클린)", "어쿠스틱 드럼킷"],
  "Shoegaze": ["일렉기타 (클린)", "앰비언트 패드", "리버스 심벌", "일렉 베이스 (핑거)"],
  "Post-Rock": ["일렉기타 (클린)", "앰비언트 패드", "어쿠스틱 드럼킷", "스트링 앙상블"],
  "Grunge": ["일렉기타 (디스토션)", "어쿠스틱 드럼킷", "일렉 베이스 (픽)", "일렉기타 (크런치)"],
  // 일렉트로닉
  "EDM": ["슈퍼소우 리드", "909 드럼머신", "신스 베이스", "화이트 노이즈 스윕"],
  "House": ["909 드럼머신", "아날로그 신스 패드", "일렉 베이스 (핑거)", "핑거스냅/클랩"],
  "Deep House": ["아날로그 신스 패드", "909 드럼머신", "신스 베이스", "일렉트릭 피아노 (Rhodes)"],
  "Techno": ["모듈러 신스", "909 드럼머신", "애시드 베이스 (TB-303)", "글리치 FX"],
  "Trance": ["아날로그 신스 패드", "슈퍼소우 리드", "909 드럼머신", "신스 아르페지오"],
  "Dubstep": ["신스 베이스 (Reese)", "808 드럼머신", "디지털 신스 리드", "화이트 노이즈 스윕"],
  "Drum & Bass": ["신스 베이스 (Reese)", "어쿠스틱 드럼킷", "아날로그 신스 패드", "앰비언트 패드"],
  "Ambient": ["앰비언트 패드", "드론", "필드 레코딩 (비/바람)", "리버스 심벌"],
  "Synthwave": ["아날로그 신스 패드", "LinnDrum", "신스 아르페지오", "신스 베이스"],
  "Future Bass": ["슈퍼소우 리드", "808 드럼머신", "보컬 쵸핑", "신스 아르페지오"],
  "Chillwave": ["아날로그 신스 패드", "808 드럼머신", "일렉기타 (클린)", "비닐 크랙클"],
  "Hyperpop": ["디지털 신스 리드", "808 드럼머신", "보코더", "글리치 FX"],
  "IDM": ["모듈러 신스", "글리치 FX", "FM 신스", "앰비언트 패드"],
  "Vaporwave": ["FM 신스", "808 드럼머신", "일렉트릭 피아노 (Rhodes)", "비닐 크랙클"],
  "Electro Swing": ["어쿠스틱 피아노", "909 드럼머신", "브라스 섹션", "일렉 베이스 (핑거)"],
  // 감성/어쿠스틱
  "Ballad": ["그랜드 피아노", "스트링 앙상블", "어쿠스틱 기타 (핑거피킹)", "첼로"],
  "Lo-Fi": ["일렉트릭 피아노 (Rhodes)", "808 드럼머신", "비닐 크랙클", "어쿠스틱 기타 (핑거피킹)"],
  "Acoustic": ["어쿠스틱 기타 (핑거피킹)", "카혼", "하모니카", "우쿨렐레"],
  "Folk": ["어쿠스틱 기타 (스트럼)", "만돌린", "하모니카", "업라이트 베이스"],
  "Singer-Songwriter": ["어쿠스틱 기타 (핑거피킹)", "그랜드 피아노", "첼로", "카혼"],
  "Dream Pop": ["일렉기타 (클린)", "앰비언트 패드", "신스 아르페지오", "리버스 심벌"],
  "Bedroom Pop": ["어쿠스틱 기타 (핑거피킹)", "808 드럼머신", "아날로그 신스 패드", "비닐 크랙클"],
  // 재즈/블루스
  "Jazz": ["어쿠스틱 피아노", "업라이트 베이스", "브러시 드럼", "색소폰 (테너)"],
  "Smooth Jazz": ["일렉트릭 피아노 (Rhodes)", "일렉 베이스 (핑거)", "브러시 드럼", "색소폰 (알토)"],
  "Bebop": ["어쿠스틱 피아노", "업라이트 베이스", "어쿠스틱 드럼킷", "트럼펫"],
  "Jazz Fusion": ["일렉트릭 피아노 (Rhodes)", "일렉 베이스 (슬랩)", "어쿠스틱 드럼킷", "디지털 신스 리드"],
  "Bossa Nova": ["나일론 기타 (클래식)", "업라이트 베이스", "브러시 드럼", "플루트"],
  "Blues": ["슬라이드 기타", "하모니카", "업라이트 베이스", "브러시 드럼"],
  "Swing": ["어쿠스틱 피아노", "업라이트 베이스", "어쿠스틱 드럼킷", "트럼펫"],
  // 월드/전통
  "Reggae": ["일렉기타 (클린)", "일렉 베이스 (핑거)", "어쿠스틱 드럼킷", "오르간 (Hammond)"],
  "Latin": ["나일론 기타 (클래식)", "콩가/봉고", "일렉 베이스 (핑거)", "트럼펫"],
  "Reggaeton": ["808 서브 베이스", "808 드럼머신", "디지털 신스 리드", "콩가/봉고"],
  "Afrobeat": ["어쿠스틱 드럼킷", "일렉기타 (클린)", "브라스 섹션", "콩가/봉고"],
  "Trot": ["어코디언", "어쿠스틱 드럼킷", "일렉기타 (클린)", "트럼펫"],
  "Flamenco": ["나일론 기타 (클래식)", "카혼", "핑거스냅/클랩", "플루트"],
  // 시네마틱/클래식
  "Cinematic": ["스트링 앙상블", "프렌치 혼", "타이코", "하프"],
  "Epic": ["스트링 앙상블", "타이코", "브라스 섹션", "프렌치 혼"],
  "Orchestral": ["스트링 앙상블", "프렌치 혼", "하프", "플루트"],
  "Classical": ["그랜드 피아노", "바이올린", "첼로", "플루트"],
  "Soundtrack": ["스트링 앙상블", "아날로그 신스 패드", "어쿠스틱 피아노", "앰비언트 패드"],
  "Chiptune": ["FM 신스", "디지털 신스 리드", "808 드럼머신", "신스 아르페지오"],
};

// 상충 그룹 (보통 같은 역할의 악기끼리)
const CONFLICT_GROUPS = [
  ["808 서브 베이스", "신스 베이스 (Reese)", "애시드 베이스 (TB-303)"], // 베이스는 보통 1개
  ["808 드럼머신", "909 드럼머신", "LinnDrum"], // 드럼머신은 보통 1개
];

function getDisabledOptions(selected: string[]): Set<string> {
  const disabled = new Set<string>();
  for (const sel of selected) {
    for (const group of CONFLICT_GROUPS) {
      if (group.some((g) => sel.includes(g))) {
        for (const opt of group) {
          if (!sel.includes(opt)) {
            // 소분류 label에 이 텍스트가 포함된 걸 찾아서 disable
            disabled.add(opt);
          }
        }
      }
    }
  }
  return disabled;
}

function getRecommended(genre: string): Set<string> {
  const rec = new Set<string>();
  if (!genre) return rec;
  const firstGenre = genre.split("+")[0].trim();

  // 정확한 매칭
  if (GENRE_INSTRUMENTS[firstGenre]) {
    GENRE_INSTRUMENTS[firstGenre].forEach((i) => rec.add(i));
    return rec;
  }

  // 부분 매칭 — 장르명이 포함된 키 찾기
  for (const [key, instruments] of Object.entries(GENRE_INSTRUMENTS)) {
    if (key.toLowerCase().includes(firstGenre.toLowerCase()) ||
        firstGenre.toLowerCase().includes(key.toLowerCase())) {
      instruments.forEach((i) => rec.add(i));
      return rec;
    }
  }

  // 기본 추천
  ["그랜드 피아노", "어쿠스틱 드럼킷", "일렉 베이스 (핑거)"].forEach((i) => rec.add(i));
  return rec;
}

export default function InstrumentSelector({ onSubmit, onSkip, genre = "" }: InstrumentSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const recommended = getRecommended(genre);

  const toggleOption = (label: string, value: string) => {
    setSelected((prev) => {
      const existing = prev.find((s) => s === value);
      if (existing) return prev.filter((s) => s !== value);
      return [...prev, value];
    });
  };

  const toggleCategory = (catId: string) => {
    setExpandedCat((prev) => (prev === catId ? null : catId));
  };

  const handleSubmit = () => {
    const parts: string[] = [];
    if (selected.length > 0) parts.push(selected.join(", "));
    if (customText.trim()) parts.push(customText.trim());
    if (parts.length === 0) { onSkip(); return; }
    onSubmit(parts.join(", "));
  };

  return (
    <div className="space-y-3">
      {/* 추천 악기 (선택 전에만) */}
      {selected.length === 0 && recommended.size > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const allRec: string[] = [];
                for (const inst of Array.from(recommended)) {
                  for (const cat of INSTRUMENT_CATEGORIES) {
                    const found = cat.options.find((o) => o.label === inst);
                    if (found) { allRec.push(found.value); break; }
                  }
                }
                setSelected(allRec);
              }}
              style={{ backgroundColor: "#0a0a0a" }}
              className="px-4 py-2 rounded-full text-xs font-semibold text-white hover:opacity-80 transition-all"
            >
              추천 모두 선택
            </button>
            <p style={{ fontSize: "10px", color: "#a3a3a3" }}>
              2~3종류 추천. 아래에서 하나씩도 가능
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(recommended).map((inst) => {
              let matchValue = "";
              for (const cat of INSTRUMENT_CATEGORIES) {
                const found = cat.options.find((o) => o.label === inst);
                if (found) { matchValue = found.value; break; }
              }
              return (
                <button
                  key={inst}
                  onClick={() => matchValue && toggleOption(inst, matchValue)}
                  style={{
                    backgroundColor: "#fff7ed",
                    color: "#f97316",
                    borderColor: "#f97316",
                    animation: "pulse-inst 2s ease-in-out infinite",
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                >
                  {inst}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 선택된 악기 태그 */}
      {selected.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {selected.map((val) => {
              // value에서 짧은 이름 추출
              const shortName = val.split(",")[0];
              return (
                <button
                  key={val}
                  onClick={() => setSelected((prev) => prev.filter((s) => s !== val))}
                  style={{ backgroundColor: "#fff7ed", color: "#f97316", borderColor: "rgba(249,115,22,0.3)" }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1 transition-all hover:opacity-80"
                >
                  {shortName}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: "10px", color: selected.length >= 2 && selected.length <= 3 ? "#22c55e" : "#a3a3a3" }}>
            {selected.length}개 선택됨 {selected.length >= 2 && selected.length <= 3 ? "— 적절한 조합이에요!" : selected.length > 3 ? "— 좀 많을 수 있어요" : "— 2~3개 추천"}
          </p>
        </div>
      )}

      {/* 대분류 — 2행 그리드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
        {INSTRUMENT_CATEGORIES.map((cat) => {
          const hasSelection = cat.options.some((opt) => selected.includes(opt.value));
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              style={{
                backgroundColor: expandedCat === cat.id ? "#0a0a0a" : hasSelection ? "#f0f0f0" : "#fafafa",
                color: expandedCat === cat.id ? "#ffffff" : hasSelection ? "#f97316" : "#525252",
                borderColor: expandedCat === cat.id ? "#0a0a0a" : "#e5e5e5",
              }}
              className="py-2 rounded-full text-[11px] font-medium border transition-all"
            >
              {hasSelection ? `${cat.label} ✓` : cat.label}
            </button>
          );
        })}
      </div>

      {/* 소분류 — 들여쓰기 */}
      {expandedCat && (
        <div className="animate-fadeIn" style={{ paddingLeft: "20px", borderLeft: "2px solid #e5e5e5" }}>
          <div className="flex flex-wrap gap-1.5">
            {INSTRUMENT_CATEGORIES.find((c) => c.id === expandedCat)?.options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              const isRecommended = recommended.has(opt.label) && !isSelected;
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleOption(opt.label, opt.value)}
                  style={{
                    backgroundColor: isSelected ? "#0a0a0a" : "#ffffff",
                    color: isSelected ? "#ffffff" : isRecommended ? "#f97316" : "#737373",
                    borderColor: isSelected ? "#0a0a0a" : isRecommended ? "#f97316" : "#e5e5e5",
                    animation: isRecommended ? "pulse-inst 2s ease-in-out infinite" : "none",
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 직접 입력 */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 bg-white border border-border rounded-full px-4 py-2.5 text-sm text-text-primary placeholder-text-disabled focus:outline-none focus:border-foreground transition-colors"
          placeholder="직접 입력 (예: kalimba, steel pan)"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(); } }}
        />
        <button
          onClick={onSkip}
          className="px-4 py-2.5 rounded-full text-sm font-medium border border-border text-text-secondary hover:border-foreground hover:text-text-primary transition-all flex-shrink-0"
        >
          맡길게
        </button>
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: selected.length > 0 || customText.trim() ? "#f97316" : "#0a0a0a",
            animation: selected.length >= 2 ? "pulse-go 1.5s ease-in-out infinite" : "none",
          }}
          className="h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:opacity-80 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes pulse-inst { 0%,100%{opacity:1;border-color:#f97316} 50%{opacity:0.5;border-color:#fdba74} }
        @keyframes pulse-go { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.08)} }
      `}</style>
    </div>
  );
}
