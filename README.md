# R3ALAUDE — Suno v5.5 Song Production System

AI 기반 Suno v5.5 프롬프트/가사 자동 생성 웹앱.
주제를 입력하면 Style of Music + 가사 + 파라미터를 한 번에 생성합니다.

**Live:** https://suno-maker-six.vercel.app

## 특징

- **대화형 설정**: 핵심 문장 → 장르 → 악기 → 느낌 → BPM → 박자 → 시대 → 텍스처 → 리버브 순서로 대화하며 곡 설정
- **AI 스타일 생성**: 설정 기반 Style of Music 프롬프트 자동 생성 (Sonnet)
- **AI 가사 생성**: 독백→가사 2단계 시스템, 19곡 분석 기반 작법 (Opus)
- **워싱**: 스타일 프롬프트의 장르/시대감 충돌 자동 해소 + 900자 조정
- **후처리**: 클리셰 자동감지/수정 + AI 5항목 채점 + 8점 미만 자동개선
- **레퍼런스 분석**: 참고곡 입력 시 장르/모티프/수사법/구조 분석 → 가사에 반영
- **라이브 프리뷰**: 실시간으로 선택 결과 확인 + 수정
- **멀티트랙**: 같은 설정으로 앨범 내 변주곡 생성
- **프리셋**: 스타일 저장/불러오기/편집/삭제
- **예상 Cost**: 세션별 API 비용 추적 (USD + KRW)
- **AI 지침 복사**: 설정+요청사항을 다른 LLM에 붙여넣기 가능
- **3개 Provider**: Claude / GPT / Gemini 중 선택 (사용자 API 키)

## 기술 스택

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Vercel 배포

## 설치 및 실행

```bash
# 클론
git clone https://github.com/domautube-beep/suno-maker.git
cd suno-maker

# 의존성 설치
npm install

# 개발 서버
npm run dev
```

http://localhost:3000 에서 실행됩니다.

**API 키 필요**: 접속 시 Claude / GPT / Gemini API 키를 입력하면 됩니다. 서버에 저장하지 않으며 sessionStorage(탭 닫으면 삭제)로만 관리합니다.

## Vercel 배포

```bash
# Vercel CLI
npm i -g vercel
vercel link
vercel --prod
```

## 폴더 구조

```
app/              — 페이지 및 레이아웃
app/api/          — API 라우트 (generate-stream, lyrics-stream, lyrics, validate-key)
components/       — UI 컴포넌트 (ChatFlow, LyricsSection, LivePreview, etc.)
lib/              — 유틸리티 (lyricsRules, essayEngine, costTracker, etc.)
docs/             — R3ALAUDE 시스템 프롬프트 (완전판 + GPTs판)
data/             — 참조 데이터
```

## 가사 시스템 (R3ALAUDE v3.1)

19곡 실전 분석에서 추출한 10개 작법 패턴:

1. 의성어/의태어 = 리듬의 뼈대
2. 한영 코드스위칭 라임 시스템 (앵커링/지연인식/감정변화신호)
3. 짧은 문장 + em-dash 호흡 악보
4. 하나의 확장 은유
5. 훅 = 단순 반복 (미니멀/의성어/제목/선언/무의미음절)
6. 한국어 어미 라임 + 반복 최면
7. 애드립 = 에너지
8. 말장난/동음이의어
9. 모티프 = 발견
10. 서사 = 감정의 여정

상세: `docs/R3ALAUDE-SYSTEM-PROMPT.md` (21,790자)
GPTs용: `docs/R3ALAUDE-GPTs.md` (14,557자, 영어)

## 라이선스

MIT
