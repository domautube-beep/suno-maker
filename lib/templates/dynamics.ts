// 다이나믹/전개 — 섹션 간 에너지 흐름

export interface DynamicTemplate {
  text: string;
  tags: string[];
}

export const DYNAMICS: DynamicTemplate[] = [
  { text: "Verse stays minimal and intimate, chorus opens dramatically with full instrumentation, bridge strips back to raw emotion before the final climactic chorus.", tags: ["pop", "ballad", "contrast", "build"] },
  { text: "Gradual intensity build throughout, each section adding new layers without removing previous ones, peaking at the final section.", tags: ["cinematic", "epic", "progressive", "build"] },
  { text: "Consistent energy level with textural variation rather than dynamic shifts, maintaining a hypnotic steady-state groove.", tags: ["techno", "house", "hypnotic", "steady"] },
  { text: "Drop-based structure with tension-building verses leading to explosive chorus drops, sudden dynamic contrasts.", tags: ["edm", "dubstep", "explosive", "contrast"] },
  { text: "Call-and-response dynamics between sparse and dense sections, creating a conversational push-pull energy.", tags: ["jazz", "soul", "organic", "conversational"] },
  { text: "Raw energy throughout with controlled chaos, slight pull-back in bridge before final explosive release.", tags: ["rock", "punk", "raw", "intense"] },
  { text: "Minimalist approach where single element additions and subtractions create all dynamic movement.", tags: ["minimal", "ambient", "subtle", "restraint"] },
  { text: "Wave-like dynamics with swelling crescendos and gentle decrescendos creating an oceanic breathing rhythm.", tags: ["ambient", "dreamy", "organic", "flowing"] },
  { text: "Staircase dynamics building step by step, each verse slightly bigger than the last, chorus maintaining peak energy.", tags: ["pop", "kpop", "energetic", "build"] },
  { text: "Trap-influenced dynamics with sudden mutes and drops, using silence as a rhythmic weapon between dense sections.", tags: ["trap", "hiphop", "modern", "contrast"] },

  // 추가 — verse-prechorus-chorus lift
  { text: "Verse at low simmer, pre-chorus adds harmonic tension and rhythmic urgency, chorus erupts with full frequency spectrum and maximum harmonic density.", tags: ["pop", "kpop", "lift", "build"] },
  { text: "Three-stage elevation: intimate verse with sparse arrangement, pre-chorus stacking rhythmic layers for anticipation, chorus unleashing complete sonic width.", tags: ["pop", "dance", "lift", "energetic"] },

  // 추가 — slow burn to explosion
  { text: "Extended slow burn introduction lasting the entire first verse, resisting the impulse to reveal the full arrangement until the chorus detonates with maximum impact.", tags: ["rock", "cinematic", "slow burn", "explosive"] },
  { text: "Patience-rewarding slow build across multiple sections, each bar adding imperceptible texture until the arrangement crosses an invisible threshold into full release.", tags: ["ambient", "progressive", "slow burn", "build"] },

  // 추가 — constant energy with textural shifts
  { text: "Sustained high energy throughout with no dynamic drop — interest maintained through constant timbral evolution, tone-color shifts replacing volume changes.", tags: ["techno", "edm", "hypnotic", "steady"] },
  { text: "Locked groove energy level from start to finish, forward motion sustained by progressive harmonic and textural mutation rather than any rise or fall in intensity.", tags: ["house", "techno", "steady", "hypnotic"] },

  // 추가 — strip-down bridge to final chorus payoff
  { text: "Bridge strips production to bare bones — single instrument or rhythmic element only — creating maximum contrast before the final chorus reinstates full sonic force.", tags: ["pop", "ballad", "contrast", "payoff"] },
  { text: "Mid-song deconstruction removing all but the core melodic motif, rebuilding instrument by instrument through the bridge to make the final chorus feel earned.", tags: ["pop", "rock", "strip-down", "payoff"] },

  // 추가 — intro crescendo to immediate chorus
  { text: "Introduction itself builds to a full crescendo, bypassing any verse, and drops directly into the first chorus with zero delay — pure immediacy from bar one.", tags: ["pop", "kpop", "immediate", "energetic"] },
  { text: "Compressed four-bar intro crescendo using reversed cymbal swells and filter automation, the chorus arriving before the listener has time to settle.", tags: ["edm", "pop", "immediate", "explosive"] },

  // 추가 — genre-specific dynamics: trot
  { text: "Trot-style dynamics with bouncing duple rhythmic energy, accordion-driven sections giving way to brass-heavy chorus payoffs in traditional call-and-response fashion.", tags: ["trot", "korean", "bouncy", "traditional"] },

  // 추가 — genre-specific dynamics: reggae
  { text: "Reggae dynamic flow with laid-back verse grooves giving maximum space before the chorus cements the one-drop pattern into an irresistible rhythmic lock.", tags: ["reggae", "rootsreggae", "groove", "laid-back"] },
  { text: "Dub-influenced reggae dynamics with sections dropped out entirely — kick disappears, bass drops to sub only — before the full mix crashes back in.", tags: ["reggae", "dub", "contrast", "bass-heavy"] },

  // 추가 — genre-specific dynamics: metal
  { text: "Metal dynamics cycling through breakdowns that halve the tempo and clean sections that release tension before the full-band riff re-enters with crushing force.", tags: ["metal", "breakdown", "contrast", "aggressive"] },
  { text: "Progressive metal dynamic structure with extended quiet passages of clean tones and odd-meter figures resolving into polyrhythmic heavy sections of maximum density.", tags: ["metal", "progressive", "complex", "contrast"] },

  // 추가 — cinematic/film score dynamics
  { text: "Film-score dynamic arc: quiet thematic statement, rising harmonic tension through development sections, and a full orchestral climax followed by still, reflective coda.", tags: ["cinematic", "orchestral", "epic", "arc"] },
  { text: "Action-sequence dynamics with sudden stop-start rhythmic bursts, silence used as punctuation, re-entries arriving on unexpected beats to maintain tension.", tags: ["cinematic", "action", "contrast", "tension"] },

  // 추가 — jazz dynamics
  { text: "Jazz dynamics governed by collective improvisation — sections swell and recede organically as soloists and rhythm section respond to each other in real time.", tags: ["jazz", "organic", "conversational", "live"] },

  // 추가 — indie/alternative dynamics
  { text: "Quiet-loud-quiet indie dynamic structure: introspective verse, explosive distorted chorus, return to sparse intimacy, final chorus doubling the previous peak.", tags: ["indie", "alternative", "contrast", "emotional"] },

  // 추가 — electronic/future bass dynamics
  { text: "Future bass dynamic blueprint: chopped melodic buildup over rising white-noise swell, super-saw drop slamming into maximum harmonic saturation.", tags: ["futurebass", "edm", "drop", "explosive"] },
];
