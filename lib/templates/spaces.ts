// 공간감/텍스처 — 믹스의 질감과 공간 묘사

export interface SpaceTemplate {
  text: string;
  tags: string[];
}

export const SPACES: SpaceTemplate[] = [
  { text: "Intimate close-mic presence with dry, upfront mix placing every element within arm's reach.", tags: ["dry", "intimate", "close", "raw"] },
  { text: "Natural room ambience with balanced wet/dry ratio, instruments occupying a realistic acoustic space.", tags: ["room", "natural", "balanced", "organic"] },
  { text: "Wide hall reverb creating a sense of grand scale, instruments floating in a vast acoustic environment.", tags: ["hall", "wide", "grand", "spacious"] },
  { text: "Cathedral-like reverb with massive decay tails, creating an overwhelming sense of sacred space.", tags: ["cathedral", "massive", "epic", "sacred"] },
  { text: "Lo-fi filtered space with tape-saturated warmth, everything slightly blurred and nostalgically hazy.", tags: ["lofi", "warm", "vintage", "hazy"] },
  { text: "Plate reverb warmth with classic studio character, polished but not sterile production quality.", tags: ["plate", "studio", "warm", "polished"] },
  { text: "Hyper-wide stereo field with elements panned hard left and right, creating an immersive headphone experience.", tags: ["wide", "stereo", "immersive", "modern"] },
  { text: "Compressed and dense mix with elements fighting for space, creating an intense wall of sound.", tags: ["dense", "compressed", "intense", "wall"] },
  { text: "Sparse arrangement with generous space between elements, each instrument breathing in its own pocket.", tags: ["minimal", "sparse", "breathing", "clean"] },
  { text: "Analog warmth with soft tape saturation on the mix bus, gentle harmonic distortion adding character.", tags: ["analog", "tape", "warm", "vintage"] },
  { text: "Crystal-clear digital production with surgical precision, every frequency occupying its designated space.", tags: ["digital", "clean", "precise", "modern"] },
  { text: "Psychedelic spatial effects with swirling phasers and flangers creating a disorienting dreamlike environment.", tags: ["psychedelic", "effects", "dreamy", "experimental"] },

  // 추가 — telephone/radio filter
  { text: "Telephone-filtered mid-range texture with extreme high and low frequencies rolled off, creating a lo-fi vintage telephone presence.", tags: ["telephone", "filter", "vintage", "lo-fi"] },
  { text: "AM radio bandpass filter applied to the full mix, simulating the compressed tinny warmth of transistor radio broadcast.", tags: ["radio", "filter", "vintage", "compressed"] },
  { text: "Walkie-talkie frequency-limited texture with slight distortion and background hiss adding gritty communicator character.", tags: ["filter", "distorted", "gritty", "lo-fi"] },

  // 추가 — outdoor/open air
  { text: "Open-air outdoor ambience with subtle natural reverb from surrounding environment, fresh and unconfined sonic space.", tags: ["outdoor", "open", "natural", "spacious"] },
  { text: "Stadium outdoor sound with long air delay and diffuse early reflections suggesting an enormous open-air concert environment.", tags: ["outdoor", "stadium", "grand", "wide"] },
  { text: "Field recording texture with gentle wind ambience and distant environmental sounds bleeding into the musical space.", tags: ["outdoor", "field", "natural", "ambient"] },

  // 추가 — basement/underground
  { text: "Basement club sound with low ceiling short reflections, thick low-mid buildup, and an aggressive direct presence that feels underground.", tags: ["basement", "club", "underground", "dense"] },
  { text: "Underground bunker reverb with damp concrete reflections, slightly muffled high-frequency response, and a raw industrial spatial character.", tags: ["underground", "industrial", "raw", "dense"] },

  // 추가 — 80s gated reverb
  { text: "Iconic 1980s gated reverb on snare with explosive initial hit and hard noise-gated decay cutoff, the defining drum texture of the decade.", tags: ["80s", "gated", "vintage", "drum"] },
  { text: "Full 80s production space with gated reverb on drums, dense chorus effects on guitars, and a bright airy mix characteristic of that era.", tags: ["80s", "vintage", "gated", "bright"] },

  // 추가 — 90s warm room
  { text: "90s warm room sound with short to medium room reverb, slightly dark high-frequency response, and the comfortable lived-in quality of analog recording.", tags: ["90s", "warm", "room", "analog"] },
  { text: "Grunge-era recording space with wooden room ambience, slightly compressed mix bus, and instruments sitting naturally in an imperfect acoustic environment.", tags: ["90s", "grunge", "room", "raw"] },

  // 추가 — futuristic metallic space
  { text: "Futuristic metallic space with resonant alloy reflections, shimmer reverb tails extending into harmonic upper partials, and a cold precision suggesting technology.", tags: ["futuristic", "metallic", "digital", "cold"] },
  { text: "Sci-fi spatial texture with pitch-shifted reverb returns creating alien harmonic resonances in an imagined zero-gravity acoustic environment.", tags: ["futuristic", "scifi", "experimental", "cold"] },

  // 추가 — underwater/submerged feel
  { text: "Underwater submerged texture with heavy low-pass filtering, slow modulation effects simulating fluid medium, and a muffled pressure giving the mix a suffocating depth.", tags: ["underwater", "submerged", "filtered", "dreamy"] },
  { text: "Deep ocean pressure sound design with resonant hydrophone-like frequency coloration and slow undulating chorus suggesting complete submersion.", tags: ["underwater", "ambient", "submerged", "atmospheric"] },

  // 추가 — spring reverb/small room
  { text: "Spring reverb character with its characteristic metallic drip and bouncy feedback decay, a distinctly vintage hardware spatial color.", tags: ["spring", "vintage", "warm", "character"] },

  // 추가 — binaural/3D audio
  { text: "Binaural-engineered spatial mix with HRTF-processed elements appearing to originate from outside the head, creating full three-dimensional placement.", tags: ["binaural", "3d", "immersive", "headphone"] },
];
