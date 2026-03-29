// 독백 기반 가사 생성 엔진
// 주제 → 짧은 독백(500~800자) → 모티프/훅 추출 → 가사
// 산문시가 아니라 "혼잣말"에 가까운 톤

export function buildProsePoetryPrompt(
  topic: string,
  genre: string,
  language: string,
  additionalContext?: string
): string {
  const langMap: Record<string, string> = {
    ko: "반드시 한국어로만 써라. 영어 단어 하나도 쓰지 마라.",
    en: "Write in English only.",
    ja: "日本語のみで書け。",
    mixed: "한국어를 기본으로, 영어를 자연스럽게 섞어라.",
  };
  const langGuide = langMap[language] || langMap.ko;

  return `
=== 독백 작성 (가사의 씨앗) ===

주제: "${topic}"
장르: ${genre}
${langGuide}
${additionalContext ? `참고: ${additionalContext}` : ""}

아래 규칙대로 짧은 독백을 써라. 이 독백에서 가사의 핵심이 나온다.

■ 분량: 500~800자. 짧게 써라. 길면 안 된다.
■ 톤: 혼잣말, 일기, 친구한테 카톡 보내듯. 문학이 아니다.
  "나 오늘 이런 일이 있었는데" 하고 시작할 수 있는 톤이어야 한다.
■ 핵심: 이 독백 안에서 자연스럽게 반복되는 구절이 하나 있어야 한다.
  그게 나중에 훅이 된다. 억지로 만들지 말고 자연스럽게 나오게.
■ 모티프: 주제 속에서 하나의 사물/행동/장면을 찾아라.
  그게 독백 처음과 끝에서 다른 의미로 등장해야 한다.
■ 감정: 솔직하게. "사랑이 아프다"가 맞으면 그냥 그렇게 써라.
  과한 비유, 과한 수사 금지. 반발짝만 특별하면 된다.
■ 운율: 읽으면 리듬이 느껴지는 단어 배치. 비슷한 소리가 이어지는 문장.

독백을 ---PROSE--- 와 ---END_PROSE--- 사이에 출력해라.

---PROSE---
(여기에 독백)
---END_PROSE---
`.trim();
}

// 독백에서 파싱
export function parseProsePoetry(fullText: string): { prose: string; rest: string } {
  const match = fullText.match(/---PROSE---\n?([\s\S]*?)---END_PROSE---/);
  if (match) {
    const prose = match[1].trim();
    const rest = fullText.slice(fullText.indexOf("---END_PROSE---") + "---END_PROSE---".length).trim();
    return { prose, rest };
  }
  return { prose: "", rest: fullText };
}
