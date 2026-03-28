// 리듬 패턴 — BPM/박자/장르별 리듬 묘사

export interface RhythmTemplate {
  text: string;
  tags: string[];
}

export const RHYTHMS: RhythmTemplate[] = [
  // 느린
  { text: "Gentle pulse with brushed percussion and sustained bass notes, breathing space between each beat.", tags: ["slow", "jazz", "acoustic", "intimate"] },
  { text: "Minimal rhythmic framework with soft kick and finger snaps, leaving room for melodic expression.", tags: ["slow", "ballad", "minimal", "warm"] },
  { text: "Slow swaying rhythm with emphasis on downbeats, creating a lullaby-like rocking motion.", tags: ["slow", "waltz", "gentle", "dreamy"] },
  { text: "Sparse beat programming with deep sub bass pulses and delayed snare creating a hypnotic slow groove.", tags: ["slow", "ambient", "electronic", "hypnotic"] },

  // 중간
  { text: "Tight pocket groove with crisp snare on 2 and 4, locked bass and kick creating a solid foundation.", tags: ["mid", "pop", "clean", "solid"] },
  { text: "Syncopated hi-hat patterns with ghost notes adding organic feel to a programmed drum foundation.", tags: ["mid", "rnb", "groove", "organic"] },
  { text: "Boom-bap drum pattern with vinyl-textured samples, head-nodding swing on the hi-hats.", tags: ["mid", "hiphop", "boombap", "vintage"] },
  { text: "Neo-soul influenced rhythm with lazy swing, muted percussion accents, and deep pocket bass.", tags: ["mid", "soul", "groove", "warm"] },
  { text: "Reggae-influenced offbeat rhythm with emphasis on the and-beats, creating a natural bounce.", tags: ["mid", "reggae", "bounce", "relaxed"] },

  // 빠른
  { text: "Four-on-the-floor kick pattern with offbeat hi-hats and driving energy pushing relentlessly forward.", tags: ["fast", "house", "edm", "dance"] },
  { text: "Double-time hi-hat rolls with trap-influenced patterns, 808 kick creating rhythmic anchor points.", tags: ["fast", "trap", "aggressive", "modern"] },
  { text: "Driving eighth-note rhythm with powerful kick-snare pattern and crash cymbal accents on transitions.", tags: ["fast", "rock", "powerful", "driving"] },
  { text: "Mechanical precision rhythm with sequenced percussion, unwavering tempo creating hypnotic repetition.", tags: ["fast", "techno", "mechanical", "hypnotic"] },
  { text: "Breakbeat-influenced rhythm with chopped drum patterns creating unpredictable but groovy feel.", tags: ["fast", "dnb", "breakbeat", "complex"] },

  // 셔플/스윙
  { text: "Shuffled groove with triplet-based swing feel, giving every beat a natural bouncing quality.", tags: ["shuffle", "blues", "swing", "bouncy"] },
  { text: "Half-time feel with rapid hi-hat subdivisions creating contrast between slow body and fast detail.", tags: ["halftime", "trap", "contrast", "modern"] },

  // 추가 — latin rhythms
  { text: "Son clave pattern (3-2) on rimshot underpinning a tumbao bass montuno, the rhythmic spine of Afro-Cuban music.", tags: ["latin", "salsa", "clave", "tumbao"] },
  { text: "Rumba clave (2-3) driving a layered Cuban percussion ensemble — congas, bongo, timbales and guiro locked in poly-rhythmic conversation.", tags: ["latin", "afrocuban", "clave", "percussion"] },
  { text: "Tumbao bass pattern syncopating across the barline, pushing forward of the beat and creating irresistible forward propulsion.", tags: ["latin", "salsa", "tumbao", "bass"] },
  { text: "Baiao rhythmic framework with zabumba kick marking the downbeat and triangle cutting through syncopated sixteenth patterns.", tags: ["latin", "forró", "rhythmic", "percussion"] },

  // 추가 — afrobeat patterns
  { text: "Afrobeat interlocking rhythm section with multiple percussion voices weaving a dense polyrhythmic fabric over a steady bass ostinato.", tags: ["afrobeat", "african", "polyrhythm", "groove"] },
  { text: "Highlife-influenced rhythm with hand drums and shakers creating a rolling triplet feel, guitar playing interlocking melodic-rhythmic phrases.", tags: ["afrobeat", "highlife", "groove", "organic"] },
  { text: "Afrofusion pattern with talking drum accents punctuating a modern drum kit groove, traditional and contemporary elements perfectly balanced.", tags: ["afrobeat", "fusion", "modern", "percussion"] },

  // 추가 — k-pop specific patterns
  { text: "K-pop production rhythm with crisp punchy snare, layered electronic percussion fills, and precise quantized hi-hat sixteenth patterns.", tags: ["kpop", "pop", "clean", "modern"] },
  { text: "K-pop dance track beat with filtered down-beat kick, syncopated snare clap layers, and a driving eighth-note hi-hat that never relents.", tags: ["kpop", "dance", "energetic", "tight"] },

  // 추가 — jazz brushwork
  { text: "Jazz brush technique on snare creating a whispering swish rhythm, wire brushes tracing circular patterns while the ride cymbal marks gentle triplet time.", tags: ["jazz", "brushwork", "intimate", "swing"] },
  { text: "Bossa nova brushed rhythm with feather-light left hand ghost strokes and right hand tracing the characteristic syncopated samba pattern on snare.", tags: ["jazz", "bossanova", "brushwork", "intimate"] },

  // 추가 — electronic glitch patterns
  { text: "Glitch percussion pattern with time-stretched drum fragments, micro-edits, and stutter effects creating a fractured rhythmic grid that still locks.", tags: ["electronic", "glitch", "experimental", "modern"] },
  { text: "IDM-inspired glitch rhythm with rapidly gate-sequenced percussion events and deliberately broken quantization suggesting human imperfection.", tags: ["electronic", "glitch", "idm", "complex"] },

  // 추가 — world music rhythms
  { text: "Middle Eastern mizaan rhythmic cycle with doumbek leading a 9/8 or 10/8 pattern, creating an asymmetric groove foreign to Western ears.", tags: ["world", "middleeastern", "asymmetric", "percussion"] },
  { text: "Indian tabla rhythm with a teentaal (16-beat) theka pattern, mridangam providing complementary tonal bass strokes in rhythmic dialogue.", tags: ["world", "indian", "tabla", "complex"] },
  { text: "West African djembe pattern driving a six-against-four polyrhythm, the dundun bass drum anchoring the feel while the sangban weaves between beats.", tags: ["world", "african", "polyrhythm", "percussion"] },
];
