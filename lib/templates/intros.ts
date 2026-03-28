// 도입부 — 곡의 첫 느낌을 잡는 문장
// 장르/템포에 따라 필터링됨

export interface IntroTemplate {
  text: string;
  tags: string[]; // 어울리는 장르/느낌 태그
}

export const INTROS: IntroTemplate[] = [
  // 느린/감성적
  { text: "Slow-burning emotional build from whisper-quiet opening, gradual layering of instruments revealing depth over time.", tags: ["slow", "ballad", "emotional", "intimate"] },
  { text: "Gentle melodic introduction with sparse instrumentation, each note carrying weight in open space.", tags: ["slow", "acoustic", "minimal", "warm"] },
  { text: "Atmospheric opening with sustained pad textures floating beneath a solitary melodic figure.", tags: ["slow", "ambient", "dreamy", "spacious"] },
  { text: "Delicate piano-led introduction with room ambience, building emotional tension through harmonic movement.", tags: ["slow", "ballad", "piano", "intimate"] },
  { text: "Hushed opening with filtered textures gradually unveiling the full sonic palette.", tags: ["slow", "lofi", "warm", "intimate"] },

  // 중간 템포/그루비
  { text: "Groove-locked mid-tempo foundation with interlocking rhythmic elements establishing an immediate pocket.", tags: ["mid", "groove", "rnb", "funky"] },
  { text: "Laid-back rhythmic introduction with syncopated patterns creating a head-nodding groove from the first bar.", tags: ["mid", "hiphop", "groove", "relaxed"] },
  { text: "Warm groove entry with bass-driven foundation and organic percussion establishing the rhythmic identity.", tags: ["mid", "soul", "warm", "groove"] },
  { text: "Mid-tempo pulse with carefully layered elements, each instrument finding its rhythmic pocket.", tags: ["mid", "pop", "clean", "balanced"] },
  { text: "Steady rhythmic bed with melodic hooks weaving through a polished production framework.", tags: ["mid", "pop", "catchy", "bright"] },

  // 빠른/에너지틱
  { text: "High-energy opening that hits immediately with full production force and driving momentum.", tags: ["fast", "edm", "energetic", "powerful"] },
  { text: "Explosive entry with rapid-fire rhythmic elements and pulsating bass driving forward motion.", tags: ["fast", "trap", "aggressive", "intense"] },
  { text: "Instantly engaging uptempo groove with bright melodic hooks and punchy drum patterns.", tags: ["fast", "pop", "bright", "energetic"] },
  { text: "Relentless four-on-the-floor pulse with building synthesizer layers creating unstoppable momentum.", tags: ["fast", "techno", "house", "hypnotic"] },
  { text: "Aggressive sonic attack with distorted textures and powerful rhythmic drive from the opening beat.", tags: ["fast", "rock", "raw", "intense"] },

  // 추가 — slow/ambient/ethereal
  { text: "Ethereal ambient introduction with slowly evolving pad swells and delicate bell tones suspended in infinite reverb.", tags: ["slow", "ambient", "ethereal", "atmospheric"] },
  { text: "Mist-like opening with granular textures dissolving in and out, creating an uncertain dreamlike space before the melody emerges.", tags: ["slow", "ambient", "ethereal", "experimental"] },

  // 추가 — slow/jazz/smoky
  { text: "Smoky late-night jazz introduction with brushed snare, upright bass walking softly, and a solitary horn tracing a lazy melodic arc.", tags: ["slow", "jazz", "smoky", "intimate"] },
  { text: "Cool jazz club opening with muted trumpet over a sparse piano voicing, blue-note harmonies hanging in warm cigarette haze.", tags: ["slow", "jazz", "smoky", "nocturnal"] },

  // 추가 — slow/classical/majestic
  { text: "Majestic classical introduction with sustained string ensemble establishing a noble harmonic foundation before the main theme arrives.", tags: ["slow", "classical", "majestic", "orchestral"] },
  { text: "Grand orchestral prelude with deep brass chords and shimmering cymbal rolls building inexorable tension toward a decisive downbeat.", tags: ["slow", "classical", "majestic", "cinematic"] },

  // 추가 — mid/funk/groovy
  { text: "Tight funk introduction with a staccato rhythm guitar chop locking into a popping bass line, establishing an irresistible pocket immediately.", tags: ["mid", "funk", "groovy", "tight"] },
  { text: "Vintage funk entry with wah-filtered guitar riff, punchy horns, and a drummer dropping ghost notes into every subdivided beat.", tags: ["mid", "funk", "groovy", "vintage"] },

  // 추가 — mid/indie/quirky
  { text: "Quirky indie opening with off-kilter guitar arpeggios and a whimsical melodic motif that defies predictable phrase lengths.", tags: ["mid", "indie", "quirky", "playful"] },
  { text: "Lo-fi indie introduction with detuned piano chords, loose brushed percussion, and a wandering bass that keeps the listener pleasantly off-balance.", tags: ["mid", "indie", "quirky", "lofi"] },

  // 추가 — mid/latin/rhythmic
  { text: "Latin rhythmic introduction with cascading percussion layers — clave, congas, timbales — interlocking before the harmonic content enters.", tags: ["mid", "latin", "rhythmic", "percussion"] },
  { text: "Bossa nova-influenced opening with nylon-string guitar outlining rich jazz-inflected chords over a gentle samba pulse.", tags: ["mid", "latin", "rhythmic", "warm"] },

  // 추가 — fast/metal/crushing
  { text: "Crushing metal introduction with down-tuned guitar chug, triggered double-kick patterns, and a wall of distortion declaring immediate sonic dominance.", tags: ["fast", "metal", "crushing", "aggressive"] },
  { text: "Riff-first metal entry dropping a polyrhythmic guitar figure over a blast-beat foundation, no build-up, pure kinetic force from beat one.", tags: ["fast", "metal", "crushing", "intense"] },

  // 추가 — fast/dnb/frenetic
  { text: "Frenetic drum and bass opening with a 174 BPM Amen break chopped into unpredictable fragments over a deep sub bass line.", tags: ["fast", "dnb", "frenetic", "breakbeat"] },
  { text: "Neurofunk intro with surgical bass modulation and stuttering reese oscillations establishing a dark mechanical tension at breakneck tempo.", tags: ["fast", "dnb", "frenetic", "dark"] },

  // 추가 — fast/disco/sparkling
  { text: "Sparkling disco introduction with shimmering hi-hat sixteenth notes, a four-on-the-floor kick, and a rising orchestral string stab announcing the dance floor.", tags: ["fast", "disco", "sparkling", "dance"] },
  { text: "Glittering uptempo disco entry with bright Rhodes chords, punchy brass hits, and a walking bass line inviting immediate movement.", tags: ["fast", "disco", "sparkling", "bright"] },
];
