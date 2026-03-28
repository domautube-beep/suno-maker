// 감정 곡선 — 곡 전체의 감정 아크

export interface EmotionTemplate {
  text: string;
  tags: string[];
}

export const EMOTIONS: EmotionTemplate[] = [
  { text: "Overall emotional arc: quiet vulnerability building to cathartic release, the sound of breaking through.", tags: ["dark", "intense", "cathartic", "build"] },
  { text: "Overall emotional arc: bittersweet nostalgia wrapped in warm sonic blankets, memories glowing softly.", tags: ["nostalgic", "warm", "gentle", "melancholy"] },
  { text: "Overall emotional arc: defiant energy rising from silence, tension exploding into liberation.", tags: ["intense", "aggressive", "powerful", "explosive"] },
  { text: "Overall emotional arc: dreamy floating sensation, drifting between consciousness and imagination.", tags: ["dreamy", "ethereal", "floating", "ambient"] },
  { text: "Overall emotional arc: joyful celebration with infectious groove, pure feel-good energy radiating outward.", tags: ["bright", "happy", "energetic", "uplifting"] },
  { text: "Overall emotional arc: deep solitude and quiet ache, beauty found in the spaces between notes.", tags: ["lonely", "dark", "intimate", "sparse"] },
  { text: "Overall emotional arc: romantic tension building through musical dialogue, two voices finding harmony.", tags: ["romantic", "warm", "intimate", "tender"] },
  { text: "Overall emotional arc: urban night drive atmosphere, city lights reflecting off wet asphalt.", tags: ["urban", "cool", "night", "modern"] },
  { text: "Overall emotional arc: epic journey from intimate whisper to overwhelming orchestral grandeur.", tags: ["epic", "cinematic", "grand", "progressive"] },
  { text: "Overall emotional arc: playful mischief with unexpected turns, keeping the listener guessing.", tags: ["playful", "quirky", "experimental", "fun"] },
  { text: "Overall emotional arc: raw confessional honesty, stripped-down emotion with nowhere to hide.", tags: ["raw", "honest", "intimate", "vulnerable"] },
  { text: "Overall emotional arc: hypnotic repetition inducing trance-like state, consciousness dissolving into rhythm.", tags: ["hypnotic", "trance", "repetitive", "meditative"] },
  { text: "Overall emotional arc: wistful longing for something just out of reach, time standing still in a golden moment.", tags: ["nostalgic", "wistful", "gentle", "reflective"] },
  { text: "Overall emotional arc: fierce independence and self-empowerment, sound of standing tall alone.", tags: ["powerful", "confident", "bold", "anthem"] },

  // 추가 — anger to acceptance
  { text: "Overall emotional arc: opening in hot-blooded fury with aggressive tension, gradually surrendering resistance, arriving at a hard-won calm of acceptance by the final bar.", tags: ["angry", "tense", "cathartic", "acceptance"] },
  { text: "Overall emotional arc: raw anger burning its own oxygen, fire giving way to ash, and quiet understanding settling in the silence after the last note.", tags: ["angry", "intense", "dark", "resolution"] },

  // 추가 — chaos to order
  { text: "Overall emotional arc: dissonant chaotic opening gradually organizing into harmonic coherence, the satisfaction of watching disorder resolve into structure.", tags: ["chaotic", "complex", "tension", "resolution"] },
  { text: "Overall emotional arc: frantic scattered energy in early sections consolidating into locked groove certainty, entropy collapsing beautifully into rhythmic order.", tags: ["chaotic", "energetic", "progressive", "resolution"] },

  // 추가 — sunrise hope
  { text: "Overall emotional arc: beginning in pre-dawn stillness with a single fragile melodic thread, light gradually accumulating until the arrangement blooms into full radiant warmth.", tags: ["hopeful", "uplifting", "warm", "bright"] },
  { text: "Overall emotional arc: quiet anticipation of something new, the sonic equivalent of the first light cresting the horizon, pure possibility expressed through ascending harmonic motion.", tags: ["hopeful", "gentle", "ascending", "warm"] },

  // 추가 — midnight confession
  { text: "Overall emotional arc: late-night vulnerability under cover of darkness, the kind of honesty only possible when the world is asleep and the only witness is the music.", tags: ["intimate", "dark", "vulnerable", "nocturnal"] },
  { text: "Overall emotional arc: a secret carried in minor-key harmonies, whispered truths passed between close-mic instruments in a room that feels private and hushed.", tags: ["intimate", "confessional", "dark", "sparse"] },

  // 추가 — carnival energy
  { text: "Overall emotional arc: whirling carnival exuberance with bright timbres and rapid harmonic motion, barely contained excitement spilling over into joyful rhythmic abandon.", tags: ["carnival", "bright", "energetic", "playful"] },
  { text: "Overall emotional arc: fairground energy mixing wonder and slight vertigo, major-key melodies spinning in dizzying circles over an irresistible rhythmic carousel.", tags: ["carnival", "playful", "energetic", "bright"] },

  // 추가 — spiritual transcendence
  { text: "Overall emotional arc: earthbound opening ascending through layers of harmonic richness toward a transcendent peak, the music becoming a vehicle for something beyond the physical.", tags: ["spiritual", "transcendent", "epic", "ascending"] },
  { text: "Overall emotional arc: meditative stillness cracking open into moments of overwhelming sacred beauty, the kind of awe that silences the analytical mind.", tags: ["spiritual", "meditative", "sacred", "ethereal"] },

  // 추가 — rebellious youth
  { text: "Overall emotional arc: youthful defiance channeled through high-energy urgency, the sound of not yet knowing limits and not caring to learn them.", tags: ["rebellious", "energetic", "aggressive", "youthful"] },
  { text: "Overall emotional arc: restless teen frustration detonating into electric release, the raw liberating joy of making noise without apology.", tags: ["rebellious", "raw", "intense", "youthful"] },

  // 추가 — melancholic rain
  { text: "Overall emotional arc: gentle sadness like rain on a window, not grief but the quiet beauty of feeling everything slowly, the melancholy that is also somehow comforting.", tags: ["melancholy", "gentle", "reflective", "nostalgic"] },
  { text: "Overall emotional arc: grey-sky mood sustained throughout, minor harmonics floating in soft reverb like mist, an ache that feels familiar and strangely welcome.", tags: ["melancholy", "dark", "ambient", "intimate"] },
];
