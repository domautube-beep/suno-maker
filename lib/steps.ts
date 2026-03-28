export type StepType = "text" | "select" | "confirm";

export interface StepOption {
  label: string;
  value: string;
}

export interface Step {
  id: string;
  question: string;
  tooltip?: string;
  type: StepType;
  placeholder?: string;
  options?: StepOption[];
  required?: boolean;
  skipLabel?: string;
}

export const STEPS: Step[] = [
  {
    id: "oneLiner",
    question: "주제를 정해봅시다. 제일 중요한 문장을 적어주세요. 자세히 적을수록 좋아요.",
    tooltip: "이 노래의 핵심을 한 문장으로 써주세요. 여기서 장르, 리듬, 악기, 분위기를 자동 추론합니다. 예: \"네가 없는 방은 너무 조용해\", \"달리다 보면 어딘가 닿겠지\"",
    type: "text",
    placeholder: "이 노래가 뭔지 한 문장으로...",
    required: true,
  },
  {
    id: "genre",
    question: "장르 방향은요?",
    tooltip: "장르를 먼저 정하면 BPM, 박자, 텍스처, 리버브를 추천해드려요. 복수 선택하면 퓨전 스타일이 됩니다.",
    type: "select",
    options: [
      // 팝/댄스 계열
      { label: "K-Pop", value: "kpop" },
      { label: "Pop", value: "pop" },
      { label: "EDM / Dance", value: "edm" },
      { label: "Disco / Funk", value: "disco" },
      { label: "City Pop", value: "citypop" },
      // R&B / 소울 계열
      { label: "R&B / Soul", value: "rnb" },
      { label: "Neo Soul", value: "neosoul" },
      { label: "Gospel", value: "gospel" },
      // 힙합 계열
      { label: "Hip-Hop", value: "hiphop" },
      { label: "Trap", value: "trap" },
      { label: "Boom Bap", value: "boombap" },
      // 감성/어쿠스틱 계열
      { label: "Ballad", value: "ballad" },
      { label: "Lo-Fi", value: "lofi" },
      { label: "Acoustic", value: "acoustic" },
      { label: "Folk", value: "folk" },
      // 록/메탈 계열
      { label: "Rock", value: "rock" },
      { label: "Alt / Indie", value: "indie" },
      { label: "Punk", value: "punk" },
      { label: "Metal", value: "metal" },
      // 일렉트로닉 계열
      { label: "Synthwave", value: "synthwave" },
      { label: "House", value: "house" },
      { label: "Techno", value: "techno" },
      { label: "Ambient", value: "ambient" },
      // 클래식/시네마틱
      { label: "Cinematic", value: "cinematic" },
      { label: "Classical", value: "classical" },
      { label: "Orchestral", value: "orchestral" },
      // 월드/전통
      { label: "Jazz", value: "jazz" },
      { label: "Blues", value: "blues" },
      { label: "Reggae", value: "reggae" },
      { label: "Latin", value: "latin" },
      { label: "Trot", value: "trot" },
      { label: "Bossa Nova", value: "bossanova" },
    ],
    skipLabel: "맡길게",
  },
  {
    id: "instruments",
    question: "악기 구성은요?",
    tooltip: "곡의 핵심 악기를 2~3개 선택하면 최적. 장르에 맞는 추천이 표시됩니다. Suno Style of Music에 직접 반영돼요.",
    type: "text",
    required: false,
    skipLabel: "맡길게",
  },
  {
    id: "vibe",
    question: "어떤 느낌이면 좋겠어요?",
    tooltip: "분위기·에너지·질감·특성을 선택하거나 자유롭게 써주세요. 오렌지색으로 표시된 건 핵심 문장 기반 추천이에요.",
    type: "text",
    required: false,
    skipLabel: "맡길게",
  },
  {
    id: "tempo",
    question: "템포/BPM은?",
    tooltip: "곡의 속도감. 장르에 따라 적절한 BPM이 다릅니다. 발라드 60~80, Lo-Fi 73~85, K-Pop 110~130, EDM 128~140.",
    type: "select",
    options: [
      { label: "Very Slow (50~65 BPM)", value: "very_slow" },
      { label: "Slow (66~80 BPM)", value: "slow" },
      { label: "Mid Slow (81~95 BPM)", value: "mid_slow" },
      { label: "Mid (96~110 BPM)", value: "mid" },
      { label: "Mid Fast (111~125 BPM)", value: "mid_fast" },
      { label: "Fast (126~140 BPM)", value: "fast" },
      { label: "Very Fast (141~170 BPM)", value: "very_fast" },
      { label: "Ultra (171+ BPM)", value: "ultra" },
    ],
    skipLabel: "맡길게",
  },
  {
    id: "timeSignature",
    question: "박자감은?",
    tooltip: "곡의 박자 구조. 대부분의 팝/댄스는 4/4, 왈츠는 3/4, 복잡한 프로그레시브는 변박.",
    type: "select",
    options: [
      { label: "4/4 (기본, 팝/록/힙합/EDM)", value: "4/4" },
      { label: "3/4 (왈츠, 서정적)", value: "3/4" },
      { label: "6/8 (발라드, 흔들리는 느낌)", value: "6/8" },
      { label: "2/4 (행진곡, 트로트)", value: "2/4" },
      { label: "5/4 (변박, 실험적)", value: "5/4" },
      { label: "7/8 (프로그레시브, 복잡)", value: "7/8" },
      { label: "셔플 (스윙감, 바운스)", value: "shuffle" },
      { label: "하프타임 (느린 체감, 빠른 하이햇)", value: "halftime" },
    ],
    skipLabel: "맡길게",
  },
  {
    id: "era",
    question: "시대감은요?",
    tooltip: "어떤 시대의 사운드를 원하는지. 편곡 문법과 믹스 경향이 달라집니다.",
    type: "select",
    options: [
      { label: "80s 레트로", value: "80s" },
      { label: "90s 감성", value: "90s" },
      { label: "2000s Y2K", value: "2000s" },
      { label: "2010s 모던", value: "2010s" },
      { label: "2020s 현대", value: "2020s" },
      { label: "미래적", value: "futuristic" },
      { label: "빈티지 클래식", value: "vintage" },
    ],
    skipLabel: "맡길게",
  },
  {
    id: "texture",
    question: "사운드 질감은 어떤 느낌으로?",
    tooltip: "온도감(따뜻한/차가운), 밀도(미니멀/풍성), 표면감(매끈/거친), 공간감(좁은/넓은), 캐릭터(몽환/인더스트리얼)를 조합할 수 있어요.",
    type: "select",
    options: [
      { label: "Lo-Fi 따뜻한", value: "lofi_warm" },
      { label: "깔끔 디지털", value: "clean_digital" },
      { label: "아날로그 빈티지", value: "analog_vintage" },
      { label: "거친 Raw", value: "raw_gritty" },
      { label: "몽환 Dreamy", value: "dreamy" },
      { label: "공간감 넓은", value: "spacious" },
      { label: "밀도 높은", value: "dense" },
      { label: "미니멀 스파스", value: "minimal" },
    ],
    skipLabel: "맡길게",
  },
  {
    id: "vocal",
    question: "보컬은 어떤 느낌으로?",
    tooltip: "보컬 타입·음색·딜리버리·공간감. Suno Lyrics의 VOCAL PROFILE 명령어로 변환됩니다.",
    type: "text",
    required: false,
    skipLabel: "맡길게",
  },
  {
    id: "reverb",
    question: "보컬 공간감은?",
    tooltip: "보컬이 어디서 부르는 느낌인지. 가까운 속삭임부터 콘서트홀까지.",
    type: "select",
    options: [
      { label: "Dry (가까운 속삭임)", value: "dry" },
      { label: "Room (방 안)", value: "room" },
      { label: "Hall (공연장)", value: "hall" },
      { label: "Cathedral (대성당)", value: "cathedral" },
      { label: "Lo-Fi (테이프 필터)", value: "lofi_filter" },
      { label: "Plate (빈티지 리버브)", value: "plate" },
    ],
    skipLabel: "맡길게",
  },
  {
    id: "confirm",
    question: "",
    type: "confirm",
  },
];
