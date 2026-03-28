// 장르 대분류 → 소분류 데이터
// Suno v5.5가 인식하는 장르명 기준, 영문으로 표기

export interface GenreCategory {
  id: string;
  label: string;
  options: string[];
}

export const GENRE_CATEGORIES: GenreCategory[] = [
  {
    id: "pop",
    label: "팝/댄스",
    options: [
      "K-Pop", "J-Pop", "C-Pop", "Pop", "Dance Pop", "Synth Pop", "Electro Pop",
      "City Pop", "Bubblegum Pop", "Teen Pop", "Indie Pop", "Art Pop",
      "Power Pop", "Baroque Pop", "Dream Pop", "Noise Pop", "Chamber Pop",
      "Sophisti-Pop", "Euro Pop", "Latin Pop",
    ],
  },
  {
    id: "rnb",
    label: "R&B/소울",
    options: [
      "R&B", "Neo Soul", "Soul", "Gospel", "Motown", "Quiet Storm",
      "Contemporary R&B", "Alternative R&B", "PBR&B", "Funk",
      "P-Funk", "Disco", "Nu Disco", "Boogie",
    ],
  },
  {
    id: "hiphop",
    label: "힙합/랩",
    options: [
      "Hip-Hop", "Trap", "Boom Bap", "Cloud Rap", "Drill", "UK Drill",
      "Mumble Rap", "Conscious Rap", "Gangsta Rap", "Emo Rap",
      "Lo-Fi Hip-Hop", "Jazz Rap", "Phonk", "Old School Hip-Hop",
      "K-Hip-Hop", "Crunk", "Grime", "Trip-Hop",
    ],
  },
  {
    id: "rock",
    label: "록/메탈",
    options: [
      "Rock", "Alt Rock", "Indie Rock", "Punk Rock", "Post Punk",
      "Metal", "Heavy Metal", "Nu Metal", "Progressive Rock", "Prog Metal",
      "Garage Rock", "Grunge", "Psychedelic Rock", "Stoner Rock",
      "Shoegaze", "Post-Rock", "Math Rock", "Emo", "Pop Punk",
      "Hardcore", "Metalcore", "Deathcore", "Black Metal", "Death Metal",
      "Doom Metal", "Thrash Metal", "Power Metal", "Symphonic Metal",
      "Folk Rock", "Blues Rock", "Southern Rock", "Surf Rock",
      "Britpop", "Madchester", "New Wave", "Gothic Rock",
    ],
  },
  {
    id: "electronic",
    label: "일렉트로닉",
    options: [
      "EDM", "House", "Deep House", "Tech House", "Progressive House",
      "Tropical House", "Future House", "Acid House",
      "Techno", "Minimal Techno", "Detroit Techno", "Industrial Techno",
      "Trance", "Psytrance", "Progressive Trance", "Uplifting Trance",
      "Dubstep", "Riddim", "Brostep",
      "Drum & Bass", "Liquid DnB", "Neurofunk", "Jungle",
      "Ambient", "Dark Ambient", "Ambient House",
      "Synthwave", "Retrowave", "Vaporwave", "Future Funk",
      "IDM", "Glitch", "Breakbeat", "UK Garage", "2-Step",
      "Hardstyle", "Hardcore", "Gabber", "Happy Hardcore",
      "Chillwave", "Chillstep", "Downtempo", "Electronica",
      "Hyperpop", "PC Music", "Deconstructed Club",
      "Future Bass", "Future Garage", "Wave",
      "Electro Swing", "Nu Jazz",
    ],
  },
  {
    id: "acoustic",
    label: "감성/어쿠스틱",
    options: [
      "Ballad", "Lo-Fi", "Lo-Fi Beats", "Acoustic", "Folk",
      "Singer-Songwriter", "Soft Rock", "Adult Contemporary",
      "Coffeehouse", "Unplugged", "Americana", "Country",
      "Country Pop", "Bluegrass", "Neo-Folk", "Anti-Folk",
      "Bedroom Pop", "Chill Pop", "Sad Pop",
    ],
  },
  {
    id: "jazz_blues",
    label: "재즈/블루스",
    options: [
      "Jazz", "Smooth Jazz", "Cool Jazz", "Bebop", "Free Jazz",
      "Jazz Fusion", "Acid Jazz", "Modal Jazz", "Swing",
      "Big Band", "Bossa Nova", "Latin Jazz",
      "Blues", "Delta Blues", "Chicago Blues", "Electric Blues",
      "Soul Blues", "Blues Rock",
    ],
  },
  {
    id: "world",
    label: "월드/전통",
    options: [
      "Reggae", "Dancehall", "Dub", "Ska", "Rocksteady",
      "Latin", "Salsa", "Reggaeton", "Dembow", "Bachata", "Cumbia",
      "Afrobeat", "Afropop", "Amapiano", "Highlife",
      "Flamenco", "Fado", "Celtic", "Polka",
      "Bollywood", "Qawwali", "Bhangra",
      "K-Trad Fusion", "Trot", "Enka",
      "Middle Eastern", "Turkish Pop", "Arabic Pop",
      "Caribbean", "Soca", "Calypso", "Zouk",
      "Bossa Nova", "MPB", "Samba", "Forró",
    ],
  },
  {
    id: "cinematic",
    label: "시네마틱/클래식",
    options: [
      "Cinematic", "Epic", "Orchestral", "Film Score", "Soundtrack",
      "Trailer Music", "Dark Cinematic",
      "Classical", "Baroque", "Romantic", "Contemporary Classical",
      "Minimalist", "Post-Classical", "Neoclassical",
      "New Age", "Meditation", "Spa Music",
      "Video Game Music", "Chiptune", "8-Bit",
    ],
  },
  {
    id: "experimental",
    label: "실험/아방가르드",
    options: [
      "Experimental", "Avant-Garde", "Noise", "Industrial",
      "Art Rock", "Art Pop", "Krautrock",
      "Musique Concrète", "Drone", "Microtonal",
      "Sound Design", "Field Recording", "Generative",
      "Spoken Word", "Poetry Slam",
    ],
  },
  {
    id: "kids_holiday",
    label: "키즈/시즌",
    options: [
      "Children's Music", "Lullaby", "Nursery Rhyme",
      "Christmas", "Holiday", "Halloween",
      "Wedding Music", "Graduation",
      "Worship", "Hymn", "CCM",
    ],
  },
];

// 전체 장르 수 계산용
export const TOTAL_GENRE_COUNT = GENRE_CATEGORIES.reduce((sum, cat) => sum + cat.options.length, 0);
