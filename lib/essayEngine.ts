// 산문시 기반 가사 생성 엔진
// 주제 → 단어 파생 → 산문시(서사+운율+훅+수사법) → 가사 변환
// 1회 API 호출로 산문시+가사 모두 생성

export function buildProsePoetryPrompt(
  topic: string,
  genre: string,
  language: string,
  additionalContext?: string
): string {
  const langGuide = language === "ko"
    ? "한국어로 작성. 문어체 금지, 입으로 내뱉는 말처럼."
    : language === "en"
    ? "Write in English. Spoken-word feel, like talking to yourself."
    : language === "ja"
    ? "日本語で書く。独り言のように、口語体で。"
    : "한국어 + English 자연스럽게 섞어서.";

  return `
=== STEP 1: 산문시 작성 (가사의 원재료) ===

주제: "${topic}"
장르: ${genre}
${additionalContext ? `참고: ${additionalContext}` : ""}

아래 순서대로 산문시를 작성해라. 이 산문시가 가사의 원재료가 된다.

1) 단어 파생 (30~50개)
   주제에서 자연스럽게 떠오르는 단어들을 내부적으로 뽑아라.
   - 사물, 장면, 행동, 감정, 소리, 냄새, 촉감
   - 일반적인 사람이 이 주제에서 공감할 수 있는 것들
   - 특이하거나 억지스러운 단어 금지
   단어 목록은 출력하지 마. 내부적으로만 사용.

2) 산문시 작성 (2500~3000자)
   위 단어들을 조합해서 산문시를 써라.
   ${langGuide}

   ■ 산문시란: 줄바꿈 없이 흐르는 글이지만, 단어 배치에 운율이 있다.
     읽었을 때 리듬이 느껴져야 한다. 모음과 자음의 반복, 문장 길이의 완급.
     가사로 변환할 때 자연스럽게 줄이 끊어질 수 있는 리듬감이 있어야 한다.

   ■ 서사 구조: 시작(상황 설정) → 갈등(감정 충돌) → 전환(깨달음/변화) → 결말(열린 or 닫힌)

   ■ 훅 후보 2~3개: 산문시 안에서 자연스럽게 반복되는 핵심 구절.
     같은 구절이 다른 맥락에서 다시 등장하면서 의미가 달라지거나 깊어지도록.
     이 구절이 나중에 가사의 Hook/Chorus가 된다.

   ■ 수사법 — 글의 흐름에서 자연스럽게:
     - 대구: 비슷한 구조로 대비 ("가면 갈수록 멀어지는데, 멀어질수록 선명해지는")
     - 도치: 강조점 이동
     - 은유/직유: 감정을 사물에 빗대기
     - 영탄: 감정이 터지는 순간
     - 반복: 핵심 단어/구절이 변주되며 돌아오기

   ■ 모티프: 산문시 전체를 관통하는 하나의 사물/장면/관찰.
     처음에 한 가지 의미 → 끝에서 다른 의미로 돌아온다.

   ■ 운율: 단어 배치가 리듬을 만들어야 한다.
     같은 모음이 이어지거나, 비슷한 길이의 구절이 반복되거나, 끊어지는 타이밍이 일정하거나.
     시를 소리 내어 읽었을 때 음악이 들려야 한다.

   산문시를 ---PROSE--- 와 ---END_PROSE--- 사이에 출력해라.

---PROSE---
(여기에 산문시)
---END_PROSE---
`.trim();
}

// 산문시에서 파싱
export function parseProsePoetry(fullText: string): { prose: string; rest: string } {
  const match = fullText.match(/---PROSE---\n?([\s\S]*?)---END_PROSE---/);
  if (match) {
    const prose = match[1].trim();
    const rest = fullText.slice(fullText.indexOf("---END_PROSE---") + "---END_PROSE---".length).trim();
    return { prose, rest };
  }
  return { prose: "", rest: fullText };
}

// 에세이에서 파싱
export function parseEssay(fullText: string): { essay: string; rest: string } {
  const essayMatch = fullText.match(/---ESSAY---\n?([\s\S]*?)---END_ESSAY---/);
  if (essayMatch) {
    const essay = essayMatch[1].trim();
    const rest = fullText.slice(fullText.indexOf("---END_ESSAY---") + "---END_ESSAY---".length).trim();
    return { essay, rest };
  }
  return { essay: "", rest: fullText };
}
