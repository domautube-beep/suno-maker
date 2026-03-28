// 장르별 추천 프리셋
// steps.ts의 genre value(소문자)를 키로 사용

export interface GenrePreset {
  tempo: string;           // 추천 BPM 슬롯 (steps.ts 옵션 value와 일치)
  timeSignature: string;   // 추천 박자
  era: string;             // 추천 시대
  texture: string;         // 추천 텍스처
  reverb: string;          // 추천 리버브
  style: string;           // Style of Music 기본 템플릿 (900자 이하, 보컬 단어 절대 금지)
}

// 장르 value(steps.ts 기준 소문자) → 프리셋 매핑
export const GENRE_PRESETS: Record<string, GenrePreset> = {
  kpop: {
    tempo: "mid_fast",
    timeSignature: "4/4",
    era: "2020s",
    texture: "clean_digital",
    reverb: "room",
    style: "K-Pop, synth-driven layered hooks with punchy 4/4 pulse at 118 BPM. Bright synth stabs and filtered chord progressions anchor the verse. Snappy clap-snare with tight 808 kick creates a polished rhythmic foundation. Pre-hook builds with rising synth arpeggios and chord stab layers. Chorus explodes with stacked synth brass, wide stereo pad swells, and driving four-on-the-floor energy. Bridge strips to atmospheric pads with subtle piano. Final chorus adds brass section layers and rhythmic fill space. Clean digital production with punchy compression, bright high-end presence, and controlled stereo width that expands verse-to-chorus.",
  },
  pop: {
    tempo: "mid_fast",
    timeSignature: "4/4",
    era: "2020s",
    texture: "clean_digital",
    reverb: "room",
    style: "Pop, clean production with catchy melodic hooks at 112 BPM. Acoustic guitar strums blend with programmed drums and warm bass synth. Verse keeps minimal with fingerpicked guitar and soft kick. Chorus opens with full band energy, layered backing harmonies, and bright tambourine accents. Bridge features stripped-back piano with ambient reverb tails. Final chorus adds clap layers and cymbal rides for climactic lift. Radio-ready mix balance with clear space, punchy low-end, and airy high-frequency shimmer.",
  },
  hiphop: {
    tempo: "mid_slow",
    timeSignature: "4/4",
    era: "2020s",
    texture: "raw_gritty",
    reverb: "dry",
    style: "Hip-Hop, 808 sub bass heavy groove at 90 BPM with boom-bap influenced drums. Deep 808 kicks hit with sustained low-end rumble. Crisp snare on 2 and 4 with layered clap. Hi-hats roll in 1/16 patterns with ghost note variations. Dark piano chords provide harmonic movement in the verse. Chorus adds melodic synth pads and atmospheric textures. Bridge strips to ambient drone with reversed cymbal swells. Lo-fi tape saturation on the master bus, dry close-mic presence, punchy sidechain compression.",
  },
  trap: {
    tempo: "mid_fast",
    timeSignature: "4/4",
    era: "2020s",
    texture: "clean_digital",
    reverb: "room",
    style: "Trap, aggressive 808 pattern at 140 BPM with rapid hi-hat rolls and heavy sub bass. Rolling 1/32 hi-hat patterns with pitch bends and stutters. Deep 808 bass slides between notes with heavy distortion. Sparse dark piano melodies create tension in the verse. Chorus layers atmospheric synth pads with ethereal textures. Drill-influenced sliding 808 patterns with grimy character. Clean digital production with surgical low-end, crisp transients, and wide stereo hi-hat placement.",
  },
  boombap: {
    tempo: "mid_slow",
    timeSignature: "4/4",
    era: "90s",
    texture: "analog_vintage",
    reverb: "room",
    style: "Boom Bap, classic hip-hop groove at 88 BPM with hard-hitting drum breaks. Punchy kick on 1 and 3 with sharp snare backbeat. Vinyl-sampled horn stabs and soul chops loop through the verse. Warm bass line with round low-end attack. Hi-hats swing in dotted patterns with natural feel. Dusty record crackle and tape hiss add vintage character. Analog warmth, medium room ambience, and tight drum compression.",
  },
  rnb: {
    tempo: "mid_slow",
    timeSignature: "4/4",
    era: "2010s",
    texture: "analog_vintage",
    reverb: "plate",
    style: "R&B, groove-locked neo-soul influence at 85 BPM with laid-back swing pocket. Warm Rhodes electric piano provides lush chord voicings. Muted bass guitar locks with brushed snare and finger snaps. Subtle 1/16 hi-hat shuffle adds organic groove. Verse keeps intimate with sparse arrangement. Chorus layers warm pad swells and bass movement. Bridge features solo piano with ambient reverb. Analog warmth with soft tape saturation, vintage plate reverb character, and intimate stereo imaging.",
  },
  neosoul: {
    tempo: "mid_slow",
    timeSignature: "4/4",
    era: "2010s",
    texture: "analog_vintage",
    reverb: "plate",
    style: "Neo Soul, organic groove at 82 BPM with vintage Rhodes and live drum feel. Warm Rhodes comping with extended jazz chord voicings. Live drum kit with brushed snare and ghost notes on kick. Walking bass guitar adds melodic low-end. Wah-wah electric guitar accents add texture between phrases. Chorus builds with layered keyboard stabs and tambourine. Analog tape warmth with gentle compression, plate reverb on drums, and intimate stereo image.",
  },
  gospel: {
    tempo: "mid",
    timeSignature: "4/4",
    era: "2010s",
    texture: "spacious",
    reverb: "hall",
    style: "Gospel, powerful uplifting arrangement at 100 BPM with church organ foundation. Hammond organ provides full harmonic bed with sustained chords. Live drum kit with hard snare and driving kick. Bass guitar walks with energetic bounce. Piano comping adds rhythmic punctuation. Choir pad textures build throughout the arrangement. Chorus reaches peak with full organ swells and cymbal crashes. Large hall reverb, wide stereo choir placement, and dramatic dynamic range.",
  },
  ballad: {
    tempo: "slow",
    timeSignature: "4/4",
    era: "2010s",
    texture: "analog_vintage",
    reverb: "hall",
    style: "Ballad, piano-driven emotional arrangement at 72 BPM with orchestral swells. Grand piano provides the harmonic foundation with expressive dynamics. Strings enter gradually from verse 2 with sustained legato lines. Soft brushed drums maintain gentle pulse without overwhelming. Chorus builds with full string section, warm bass, and cymbal swells. Bridge strips to solo piano with long reverb tail. Final chorus adds French horn and cello counter-melody. Warm analog recording feel with wide hall reverb and intimate piano presence.",
  },
  lofi: {
    tempo: "mid_slow",
    timeSignature: "4/4",
    era: "90s",
    texture: "lofi_warm",
    reverb: "plate",
    style: "Lo-Fi, tape-saturated chill groove at 80 BPM with dusty vinyl character. Jazzy Rhodes piano chords with warm detuned quality. Boom-bap style drums with vinyl crackle and tape hiss. Mellow bass with soft attack and round tone. Ambient room noise and rain texture add atmosphere. Gentle guitar fingerpicking weaves through the arrangement. Lo-fi tape saturation across the mix bus, vinyl crackle on the master, warm compression that glues everything together.",
  },
  acoustic: {
    tempo: "mid",
    timeSignature: "4/4",
    era: "2010s",
    texture: "analog_vintage",
    reverb: "room",
    style: "Acoustic, organic instrument-driven at 95 BPM with natural warmth. Steel-string acoustic guitar fingerpicking provides the foundation. Light percussion with cajon and shaker maintain gentle pulse. Upright bass adds warm low-end support. Mandolin accents add texture between phrases. Piano enters in the chorus for harmonic fullness. Natural room recording with minimal processing, warm analog character, and intimate acoustic space.",
  },
  folk: {
    tempo: "mid",
    timeSignature: "4/4",
    era: "vintage",
    texture: "analog_vintage",
    reverb: "room",
    style: "Folk, storytelling acoustic arrangement at 96 BPM with natural character. Fingerpicked acoustic guitar provides the melodic and harmonic foundation. Harmonica adds expressive fills between phrases. Upright bass or acoustic bass walks softly beneath. Hand percussion like tambourine and snare drum keep time. Chorus adds acoustic guitar layers and fuller arrangement. Vintage analog recording feel with natural room sound and minimal compression.",
  },
  edm: {
    tempo: "fast",
    timeSignature: "4/4",
    era: "2020s",
    texture: "clean_digital",
    reverb: "hall",
    style: "EDM, high-energy dance production at 128 BPM with four-on-the-floor kick. Massive supersaw lead synths create the main hook. Punchy kick drum with tight sidechain compression on pads. Build-up sections use rising white noise sweeps and snare rolls. Drop explodes with full frequency spectrum synth stacks. Breakdown strips to atmospheric pads with filtered arpeggios. Final drop adds extra synth layers and pitch-shifted FX. Clean digital mastering with maximum loudness and wide stereo field.",
  },
  disco: {
    tempo: "mid_fast",
    timeSignature: "4/4",
    era: "vintage",
    texture: "analog_vintage",
    reverb: "room",
    style: "Disco, four-on-the-floor groove at 118 BPM with funky bass and strings. Driving kick on every beat with tight snare on 2 and 4. Funky bass guitar with popping attack locks with the kick. Lush string section provides rhythmic chord stabs. Rhodes piano and clavinet add percussive comping. Wah-wah guitar accents on the offbeats. Analog warmth with natural room reverb and bouncy groove feel.",
  },
  citypop: {
    tempo: "mid",
    timeSignature: "4/4",
    era: "80s",
    texture: "analog_vintage",
    reverb: "plate",
    style: "City Pop, polished Japanese pop-funk at 104 BPM with lush arrangement. Warm Rhodes comping over extended jazz-pop chord changes. Fretless bass with smooth melodic movement. Mellow drum machine programming with live percussion layers. Bright guitar chord stabs on the offbeats. Flugelhorn or trumpet provides melodic fills. Lush string pads swell through the chorus. Warm 80s analog production with plate reverb, subtle chorus on synths, and wide stereo imaging.",
  },
  rock: {
    tempo: "mid_fast",
    timeSignature: "4/4",
    era: "2000s",
    texture: "raw_gritty",
    reverb: "room",
    style: "Rock, electric guitar-driven energy at 120 BPM with powerful drum kit. Distorted electric guitar riffs anchor the verse with palm-muted chugs. Full drum kit with heavy kick and crashing cymbals. Bass guitar locks tight with the kick drum pattern. Chorus explodes with open chord strums and doubled guitar layers. Bridge features clean guitar arpeggios with ambient delay. Final chorus adds power chord variations and drum fills. Raw recording feel with room mic ambience, guitar amp saturation, and punchy drum compression.",
  },
  indie: {
    tempo: "mid",
    timeSignature: "4/4",
    era: "2010s",
    texture: "analog_vintage",
    reverb: "room",
    style: "Indie, textured guitar-driven arrangement at 100 BPM with unique character. Jangly clean guitar arpeggios weave over warm bass movement. Brushed or minimal drum kit keeps a light-footed pulse. Vintage keys or organ add harmonic texture in the background. Chorus opens with fuller guitar strums and added percussion. Bridge strips to ambient guitar with long reverb. Warm analog recording with natural room sound and relaxed compression.",
  },
  punk: {
    tempo: "fast",
    timeSignature: "4/4",
    era: "vintage",
    texture: "raw_gritty",
    reverb: "dry",
    style: "Punk, raw fast energy at 160 BPM with aggressive drive. Distorted power chords on electric guitar with relentless strumming. Pounding kick and snare with no ghost notes, pure attack. Bass guitar buzzes with high gain and forward tone. Arrangement stays minimal and loud throughout. No breakdown sections, just full energy from start to end. Dry close-mic recording, aggressive compression, and maximum raw character.",
  },
  metal: {
    tempo: "fast",
    timeSignature: "4/4",
    era: "2000s",
    texture: "raw_gritty",
    reverb: "room",
    style: "Metal, heavy guitar-driven intensity at 150 BPM with tight precision. Down-tuned distorted guitars deliver chugging riff patterns. Double kick drum with blast beats in intense sections. Thick bass guitar follows the rhythm guitar with added low-end weight. Bridge features a melodic guitar solo with whammy bar. Breakdown drops to half-time with massive low-end impact. Aggressive room recording with heavy compression, distorted amp character, and powerful mix presence.",
  },
  synthwave: {
    tempo: "mid_fast",
    timeSignature: "4/4",
    era: "80s",
    texture: "analog_vintage",
    reverb: "plate",
    style: "Synthwave, retro 80s synthesizer-driven at 110 BPM with nostalgic character. Analog-style polysynth pads create warm harmonic beds. Arpeggiated bass synth with filter sweeps drives the groove. Linn drum machine patterns with gated reverb snare. Bright lead synth with chorus effect plays melodic hooks. Warm sub bass adds modern low-end weight. 80s-style gated reverb on percussion, analog chorus on synths, warm tape saturation, and vintage plate reverb character.",
  },
  house: {
    tempo: "fast",
    timeSignature: "4/4",
    era: "2020s",
    texture: "clean_digital",
    reverb: "room",
    style: "House, groovy four-on-the-floor at 124 BPM with deep bass movement. Classic house kick with warm low-end punch. Offbeat hi-hats create signature house rhythm. Deep bass synth with filter modulation drives the groove. Soulful piano chords and organ stabs add musical depth. Percussion layers include shakers, congas, and claps. Breakdown builds tension with filtered sweeps. Clean production with warm low-end, punchy transients, and balanced stereo spread.",
  },
  techno: {
    tempo: "fast",
    timeSignature: "4/4",
    era: "2020s",
    texture: "clean_digital",
    reverb: "hall",
    style: "Techno, hypnotic four-on-the-floor pulse at 130 BPM with industrial edge. Relentless kick drum drives the groove with tight low-end. Modular synth sequences create evolving patterns over 16-bar cycles. Metallic hi-hats and clap percussion maintain mechanical precision. Dark atmospheric pads build tension across sections. Acid bassline with filter sweeps adds movement. Arrangement strips and builds through texture changes. Surgical digital production with massive sub presence and industrial spatial depth.",
  },
  ambient: {
    tempo: "very_slow",
    timeSignature: "4/4",
    era: "2020s",
    texture: "spacious",
    reverb: "cathedral",
    style: "Ambient, textural sound design at 60 BPM with no traditional rhythm. Evolving synthesizer pads create slowly shifting harmonics. Granular processing of acoustic instruments produces ethereal textures. Field recordings and found sounds add organic depth. Reverse reverb tails create ghostly atmospheric movement. Sub bass drones provide low-end foundation. Massive reverb with infinite decay, wide stereo panorama, and spatial depth that creates an immersive soundscape.",
  },
  cinematic: {
    tempo: "slow",
    timeSignature: "4/4",
    era: "2020s",
    texture: "spacious",
    reverb: "cathedral",
    style: "Cinematic, epic orchestral arrangement at 68 BPM with massive scale dynamics. Full string section provides lush sustained harmonies. Brass section adds power in climactic moments. Timpani and taiko drums create dramatic rhythmic impact. Ethereal choir textures float above the orchestra. Harp arpeggios add delicate detail. Piano provides intimate moments in stripped sections. Massive reverb space with cathedral depth, wide orchestral stereo imaging, and dramatic dynamic range.",
  },
  classical: {
    tempo: "slow",
    timeSignature: "4/4",
    era: "vintage",
    texture: "spacious",
    reverb: "hall",
    style: "Classical, formal orchestral composition at 76 BPM with structured movement. String quartet provides the melodic and harmonic foundation. Piano adds expressive solo passages between themes. Woodwind instruments add color and melodic variation. Brass section enters sparingly for emphasis. Dynamic contrast between pianissimo and fortissimo is key. Natural concert hall recording with warm reverb, balanced orchestral placement, and authentic acoustic character.",
  },
  orchestral: {
    tempo: "slow",
    timeSignature: "4/4",
    era: "2020s",
    texture: "spacious",
    reverb: "cathedral",
    style: "Orchestral, full ensemble at 72 BPM with sweeping dynamics. Complete string section from violin to double bass provides rich texture. Brass section delivers powerful accents and sustained chords. Woodwinds carry melodic material with expressive phrasing. Percussion section drives rhythm with timpani and orchestral snare. Harp and piano add delicate harmonic detail. Cathedral reverb with wide orchestral imaging and broad dynamic range from soft pizzicato to full fortissimo climax.",
  },
  jazz: {
    tempo: "mid",
    timeSignature: "4/4",
    era: "vintage",
    texture: "analog_vintage",
    reverb: "room",
    style: "Jazz, complex chord voicing with swing groove at 100 BPM. Upright bass provides walking bass lines with woody tone. Ride cymbal maintains swing pattern with ghost notes on snare. Piano comping with extended jazz harmonies and tritone substitutions. Muted trumpet adds melodic phrases between sections. Brush drums for intimate sections, sticks for energetic passages. Analog recording warmth with natural room ambience and authentic acoustic space.",
  },
  blues: {
    tempo: "mid_slow",
    timeSignature: "4/4",
    era: "vintage",
    texture: "analog_vintage",
    reverb: "room",
    style: "Blues, 12-bar groove at 88 BPM with soul and grit. Electric guitar with warm overdrive delivers expressive string bends. Bass guitar locks with the kick drum in a loose shuffle feel. Drum kit with brushed snare adds organic pocket. Hammond organ stabs add harmonic color. Guitar solo with vibrato and slide technique carries the melody. Warm analog tone with natural room sound and vintage amp character.",
  },
  reggae: {
    tempo: "mid_slow",
    timeSignature: "4/4",
    era: "vintage",
    texture: "analog_vintage",
    reverb: "room",
    style: "Reggae, laid-back one-drop groove at 84 BPM with roots character. Electric guitar plays skank chords on the offbeats with clean tone. Bass guitar carries the melody with prominent forward tone. Drum kit with kick on beat 3 and rimshot snare pattern. Organ provides sustained chord pads in the background. Melodica or harmonica adds melodic fills. Warm analog sound with room reverb and relaxed mix balance.",
  },
  latin: {
    tempo: "mid_fast",
    timeSignature: "4/4",
    era: "vintage",
    texture: "analog_vintage",
    reverb: "room",
    style: "Latin, rhythmically complex arrangement at 115 BPM with Afro-Cuban feel. Clave pattern drives the rhythmic foundation throughout. Congas and bongos provide dense percussion layering. Piano montuno pattern with syncopated chord stabs. Bass tumbao line with forward percussive attack. Brass section delivers punchy horn arrangements. Timbales and cowbell add bright metallic accents. Live recording warmth with natural room ambience and energetic arrangement.",
  },
  trot: {
    tempo: "mid_fast",
    timeSignature: "2/4",
    era: "vintage",
    texture: "clean_digital",
    reverb: "plate",
    style: "Trot, bright melodic hook density at 115 BPM with traditional Korean bounce. Accordion and keyboard provide melodic accompaniment with bright tonal character. Electric guitar with clean tone adds rhythmic strums. Bass follows traditional root-fifth movement with bounce. Drum kit maintains steady 2/4 pulse with snare accents. Trumpet or saxophone adds melodic fills between phrases. Bright clean production with warm plate reverb and traditional arrangement grammar.",
  },
  bossanova: {
    tempo: "mid_slow",
    timeSignature: "4/4",
    era: "vintage",
    texture: "analog_vintage",
    reverb: "room",
    style: "Bossa Nova, intimate Brazilian groove at 82 BPM with gentle sway. Nylon-string guitar provides both melodic and rhythmic elements with syncopated pattern. Upright bass adds soft walking lines. Brushed snare and light percussion maintain whisper-quiet pulse. Piano adds sparse chord voicings in the gaps. Flute or flute-like melody floats over the arrangement. Warm close-mic recording with intimate room character and soft natural ambience.",
  },
};

// 장르 value에서 프리셋 찾기
// - steps.ts의 genre value(소문자)와 일치하면 바로 반환
// - 복수 선택("kpop+pop" 형태) 시 첫 번째 기준으로 적용
export function getGenrePreset(genreInput: string): GenrePreset | null {
  if (!genreInput) return null;

  // 복수 선택 → 첫 번째 장르 기준
  const firstGenre = genreInput.split("+")[0].trim().toLowerCase();

  // 정확 매칭 (steps.ts value 기준 소문자)
  if (GENRE_PRESETS[firstGenre]) return GENRE_PRESETS[firstGenre];

  // 부분 매칭 (방어적 처리)
  for (const [key, preset] of Object.entries(GENRE_PRESETS)) {
    if (
      firstGenre.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(firstGenre)
    ) {
      return preset;
    }
  }

  return null;
}

// 추천 tempo를 사람이 읽기 쉬운 레이블로 변환
export function getTempoLabel(tempo: string): string {
  const labels: Record<string, string> = {
    very_slow: "Very Slow (50~65 BPM)",
    slow: "Slow (66~80 BPM)",
    mid_slow: "Mid Slow (81~95 BPM)",
    mid: "Mid (96~110 BPM)",
    mid_fast: "Mid Fast (111~125 BPM)",
    fast: "Fast (126~140 BPM)",
    very_fast: "Very Fast (141~170 BPM)",
    ultra: "Ultra (171+ BPM)",
  };
  return labels[tempo] || tempo;
}
