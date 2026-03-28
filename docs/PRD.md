# PRD: R3ALAUDE — Suno v5.5 프롬프트 & 가사 생성기

> 버전: 1.0 | 작성일: 2026-03-28 | 상태: 구현 진행 중

---

## 1. 제품 개요

### 제품 비전

> Suno로 음악을 만드는 크리에이터가, 프롬프트 규칙을 외우지 않아도 Suno v5.5의 파싱 구조를 완벽하게 활용할 수 있도록 대화 기반의 프롬프트 생성 엔진을 제공한다.

### 배경 및 맥락

- 기존: GPT로 직접 Suno 프롬프트/가사를 작성 (규칙 매번 입력 필요, 일관성 낮음)
- 전환: Claude Code가 SUNO_SYSTEM.md 규칙서를 내장한 생성 엔진으로 동작
- 웹앱은 입력 수집과 결과 출력/복사 인터페이스만 담당
- API 비용 없음: Claude Code가 직접 생성 엔진 역할 (외부 AI API 호출 없음)
- 사용자: 릴슨 (1인 사용, Suno 음악 크리에이터)

### 핵심 원칙

1. 입력 최소화: 질문 3개로 완전한 프롬프트 생성
2. 규칙 내재화: 사용자가 Suno 규칙을 몰라도 규칙을 지킨 출력 보장
3. 투명성: 왜 이렇게 생성됐는지 프로듀서 분석 노트로 근거 표시
4. 수정 루프: 결과 → 수정 요청 → 반영의 대화형 루프 지원
5. 화이트 테마 강제: 다크모드 무시, 항상 화이트 배경

---

## 2. 사용자 플로우

### 전체 흐름 (Phase Map)

```
[Phase 1: 대화 입력]
  앱 진입
    → 봇 인사 + 첫 질문: "제일 중요한 한 문장이 뭔가요?"
    → 사용자: 핵심 문장 입력 (필수)
    → 봇: "어떤 느낌이면 좋겠어요?"
    → 사용자: 느낌 입력 OR "맡길게" 스킵 (선택)
    → 봇: "가사 언어만 알려주세요."
    → 사용자: 한국어 / English / 한국어+English 중 선택
    → 확인 카드: 입력 요약 표시 → "생성 시작" 버튼
    → 봇: "Forensic Translation 시작..."

[Phase 2: 생성]
  입력 완료 신호 → demoGenerator (현재) / 실제 생성 엔진 (추후)
  SUNO_SYSTEM.md 규칙 기반 생성:
    → Forensic Translation: 입력 → 물리적 사운드 태그 변환
    → Style of Music 생성 (GLOBAL META + VOCAL PROFILE)
    → Lyrics 생성 (VOCAL PROFILE + 섹션별 가사)

[Phase 3: 결과 출력]
  결과 화면 전환
    → 프로듀서 분석 노트 (Forensic Translation 근거)
    → Style of Music 블록 (복사 버튼, 900자 카운터)
    → Lyrics 블록 (복사 버튼)
    → 수정 입력창 (하단 고정)

[Phase 4: 수정 루프]
  수정 요청 입력
    → 수정 이력 대화 형태 표시
    → Claude Code에서 반영 → 출력 업데이트 (현재: 수동 / 추후: 자동)
    → "처음부터 다시" 버튼으로 Phase 1 리셋
```

### 사용자 여정 시나리오 (대표 케이스)

```
시나리오: "새벽에 전화 못 받은 게 후회되는 노래"

1. [진입] 앱 열기 → 화이트 화면 + 챗 인터페이스
2. [Q1] "제일 중요한 한 문장이 뭔가요?"
   → 입력: "새벽 3시에 온 전화를 못 받았다"
3. [Q2] "어떤 느낌이면 좋겠어요?"
   → 입력: "조용한데 계속 생각나는, 차가운 느낌"
   → 오른쪽 LivePreview: TEXTURE & MOOD 섹션 실시간 업데이트
4. [Q3] "가사 언어만 알려주세요."
   → 선택: 한국어
   → LivePreview: LYRICS CONFIG + SONG FORM 추가
5. [확인 카드] 입력 요약 표시 → "생성 시작"
6. [결과] Style of Music + Lyrics 2블록 출력
   → 프로듀서 분석 노트: "차가운" → "cold digital textures, sparse arrangement" 변환 근거 표시
7. [복사] Style of Music 복사 → Suno 붙여넣기
8. [수정] "2절 장면 더 구체적으로 해줘" 요청
   → 수정 이력 대화 표시
```

---

## 3. 기능 명세

### 3.1 대화 입력 플로우 (ChatFlow)

**위치:** `components/ChatFlow.tsx`

| 기능 | 설명 | 상태 |
|------|------|------|
| 스텝 순차 진행 | STEPS 배열 기반 순서대로 질문 | 구현 완료 |
| 봇 메시지 딜레이 | 자연스러운 대화감 (400~800ms) | 구현 완료 |
| 자동 스크롤 | 새 메시지 추가 시 하단 자동 스크롤 | 구현 완료 |
| 스텝 건너뛰기 | 선택 스텝에 "맡길게" 스킵 버튼 | 구현 완료 |
| 프로그레스바 클릭 | 이전 스텝 클릭 시 해당 질문으로 복귀 | 구현 완료 |
| 실시간 프리뷰 연동 | 입력값 변경 시 LivePreview 즉시 업데이트 | 구현 완료 |
| 확인 카드 | 입력 요약 + 생성 시작 + 다시 입력 버튼 | 구현 완료 |

**스텝 정의 (`lib/steps.ts`):**

```
Step 1: oneLiner — 핵심 한 문장 (text input, 필수)
Step 2: vibe    — 느낌/분위기 (text input, 선택, "맡길게" 스킵 가능)
Step 3: language — 가사 언어 (select: ko / en / mixed)
Step 4: confirm  — 입력 확인 카드 (요약 + 생성 버튼)
```

### 3.2 실시간 프리뷰 (LivePreview)

**위치:** `components/LivePreview.tsx`, `lib/previewEngine.ts`

- PC(lg 이상)에서만 표시 (오른쪽 400px 패널)
- 입력 단계에 따라 점진적으로 섹션 추가
- 각 섹션: 영문 프롬프트 + 한국어 해석 2줄 구성

**섹션 표시 규칙:**

| 입력 상태 | 표시 섹션 |
|----------|----------|
| oneLiner 입력 | IDENTITY |
| vibe 입력 (키워드 매칭) | TEXTURE & MOOD |
| vibe 입력 (자유 입력) | TEXTURE & MOOD (변환 대기 표시) |
| language 선택 | LYRICS CONFIG |
| oneLiner + language 완료 | SONG FORM + AUTO-HOOK ENGINE |

**Forensic Translation 키워드 매핑 (현재 구현):**

| 한국어 키워드 | 물리적 태그 (영문) |
|-------------|----------------|
| 어두운 | dark minor chords, low-end heavy, shadowy reverb |
| 몽환적 | dreamy pads, wide reverb, ethereal atmosphere |
| 밝은 | bright major progression, open voicing, airy high-end |
| 감성적 | emotional dynamics, intimate space, gentle swells |
| 에너지틱 | driving rhythm, punchy drums, high energy builds |
| 차가운 | cold digital textures, sparse arrangement, metallic sheen |
| 따뜻한 | warm analog tones, soft saturation, cozy mid-range |
| 긴장감 | tension building, dissonant layers, suspenseful progression |
| 편안한 | relaxed groove, gentle rhythm, comfortable space |
| 웅장한 | epic orchestral swells, massive reverb, cinematic scale |
| 레트로 | vintage tape warmth, analog hiss, retro drum machine |
| 거친 | raw distortion, aggressive attack, gritty texture |
| 부드러운 | smooth legato, soft attack, silk-like texture |
| 중독적 | hypnotic loop, repetitive hook pattern, addictive groove lock |

> 미매핑 자유 입력은 "Forensic Translation pending" 상태로 표시. 실제 생성 시 Claude Code가 변환.

### 3.3 프로그레스바 (ProgressBar)

**위치:** `components/ProgressBar.tsx`

- 5단계 파이프라인 시각화
- 라벨: 핵심문장 → 느낌 → 언어 → 스타일프롬프트 → 가사생성
- 완료된 스텝은 채워진 상태, 현재 스텝 강조
- 클릭 시 해당 스텝으로 복귀 (진행 중인 스텝 이전만 가능)

### 3.4 결과 출력 패널 (OutputPanel + OutputBlock)

**위치:** `components/OutputPanel.tsx`, `components/OutputBlock.tsx`

| 영역 | 내용 |
|------|------|
| 프로듀서 분석 노트 | Forensic Translation 과정 표시 (오렌지 테두리 박스) |
| Style of Music 블록 | Suno "Style of Music" 필드 붙여넣기용, 복사 버튼, 900자 카운터 |
| Lyrics 블록 | Suno "Lyrics" 필드 붙여넣기용, 복사 버튼 (VOCAL PROFILE + 섹션 가사) |
| 수정 입력창 | 하단 고정, "수정 요청 (예: 더 어둡게, 템포 올려, 2절 가사 바꿔)" |
| 수정 이력 | 요청/응답 대화 버블 형태 표시 |
| 처음부터 다시 | 좌상단 뒤로가기 버튼 |

**복사 버튼 동작:**
- 클릭 시 클립보드 복사
- "복사 완료" 상태 2초 표시 후 원상복귀
- 전체 복사 없음. 블록별(Style / Lyrics) 독립 복사만

**출력 블록 직접 편집:**
- OutputBlock 내 텍스트 직접 수정 가능 (onOutputChange 콜백)
- 수정 후 재복사 가능

### 3.5 수정 루프

**현재 구현:**
- 수정 요청 입력 → `console.log`로 출력 (Claude Code에서 수동 반영)
- 요청/응답 이력 대화 형태 표시

**추후 구현 (Phase 2):**
- Claude API 연동 시 자동 반영
- 섹션별 대화형 수정 (특정 섹션만 지정해서 수정)

### 3.6 헤더 (Header)

**위치:** `components/Header.tsx`

- 브랜드명: R3ALAUDE
- Phase별 표시:
  - chat phase: 브랜드명만
  - result phase: 브랜드명 + "새로 만들기" 버튼

---

## 4. Suno v5.5 프롬프트 생성 로직

> 상세 규칙은 `lib/SUNO_SYSTEM.md` 참조. 본 섹션은 PRD 관점의 요약.

### 4.1 핵심 아키텍처 (Suno 내부 파싱)

```
사용자가 Suno에 입력하는 두 필드:

[Style of Music 필드]
  → Suno 내부: arrangement_engine() 처리
  → 역할: 악기, 편곡, 리듬, 공간감, 질감
  → 절대 금지: 보컬 관련 단어 (보컬, 목소리, 남성, 여성, 가수 등)

[Lyrics 필드]
  → Suno 내부: vocal_engine() 처리
  → 역할: 보컬 제어 + 가사
  → 구성: VOCAL PROFILE 명령어 블록 + 섹션별 가사
```

**핵심 원칙: 절대 분리**
Style에 보컬 단어가 들어가면 arrangement_engine이 우선권을 가져 vocal_engine 제어가 불가능해짐.

### 4.2 출력 구조 (3블록)

**블록 1: GLOBAL META (Style of Music 필드로 복사)**

```
[Genre: ...]       — 장르 특징 태그 (장르명 직접 사용 금지)
[Instruments: ...]  — 악기 팔레트, 배치
[Rhythm: ...]      — 템포, 그루브, 포켓
[Texture: ...]     — 음악적 질감, 밀도
[Identity: ...]    — 곡의 정체성, 핵심 무드
[Mood_Reference: ...] — 분위기 상세
[Dynamic_Flow: ...] — 에너지 곡선, 섹션간 악기 흐름
[Evolution: ...]   — 곡 전체 변화 방식
```

- 최대 900자 (600~900자 권장)
- 태그형 단어 중심 (문장형 지양)
- 선택 필드: Hard_Filters, Grid_Discipline, Era_Lock, Forensic_Translation

**블록 2: VOCAL PROFILE (Lyrics 필드 상단)**

```
[VOCAL_PROFILE: ...]  — 보컬 전체 방향 요약
[VOICE_TYPE: ...]     — 성별, 음역, 성격
[TIMBRE: ...]         — 음색 질감
[ARTICULATION: ...]   — 발음, 딕션
[VIBRATO: ...]        — 비브라토 깊이/속도/위치
[DELIVERY: ...]       — 감정 전달 방식
[REVERB: ...]         — 공간감 (dry/wet, room size, pre-delay, tail)
[PERFORMANCE_TRAITS: ...] — 호흡, 압력, 공명, 특성
[Evolution: ...]      — 곡 진행에 따른 보컬 변화
```

- 영어만 사용
- 악기 묘사 금지
- 보컬 공간감에 한정

**블록 3: LYRICS (Lyrics 필드 VOCAL PROFILE 아래)**

```
[SECTION: 섹션명]
[VOCAL_PROMPT: tone / projection / breath / articulation / arc]
[LAYER: 악기·질감·변주 레이어 상세]
[Texture: 이 섹션의 질감 변화]
(가사 본문 — 브라켓 밖에 위치)
```

### 4.3 Forensic Translation 파이프라인

```
입력: 사용자의 모호한 취향 표현 (예: "차갑고 중독적인")

Step 1 — 감정 방향 추론
  → introspective / euphoric / aggressive / melancholic 등

Step 2 — 리듬 추론
  → BPM 범위, 그루브 타입, 포켓 특성

Step 3 — 질감 추론
  → 악기 팔레트, 공간감, 믹스 특성

Step 4 — 편곡 추론
  → 섹션별 밀도 변화 (sparse verse → layered chorus 등)

Step 5 — 보컬 추론
  → 성별, 음역, 발성 특성, 에너지 곡선

출력: GLOBAL META + VOCAL PROFILE의 각 필드
```

### 4.4 Auto-Hook Engine (vΩ.2)

Hook과 Chorus에 자동 적용되는 7가지 규칙:

| 규칙 | 설명 |
|------|------|
| Repetition Mandate | 1~3개 앵커 구절 의도적 반복 |
| Antithesis & Mirroring | 대립/거울 구조 (go/stop, you/me 등) |
| Internal Rhyme Chains | 발음 연결 체인 (의미보다 소리) |
| Hook 길이 제한 | 한국어: 4~10음절 / 영어: 4~8음절 |
| Parenthetical Rhythm | 괄호 = 리듬 마커 (pause, echo, callback) |
| Bounce Architecture | 짧/중/짧/길 패턴으로 리듬 평탄화 방지 |
| Memory Loop | 마지막 훅 라인이 첫 훅 라인 회수 |

### 4.5 가사 작성 핵심 규칙

**언어 공통:**
- Objective Correlative: 감정 직접 안 씀. 장면/사물/행동으로 전달
- 대구법 최우선 (바이브와 그루브를 결정하는 핵심)
- 내부 라임 체인 (모음/자음 흐름)
- 클리셰 금지 목록 준수 (SUNO_SYSTEM.md 참조)

**한국어:**
- 조사/어미 포함 실제 발화 리듬 점검
- 2~5어절 단위 덩어리감
- 모음·종성 반복으로 훅 접착력
- 발음 꼬이는 자음 연쇄 회피
- 문어체 금지

**영어:**
- 구어체 우선
- 자연스러운 stress 패턴
- Singable phrase 우선

**랩/힙합:**
- 스네어 위치에 강세 정렬
- 펀치라인은 포인트에만 (남발 금지)
- 숨 끊기는 지점 고려한 줄 나눔

### 4.6 기본 송폼

```
Verse 1 → Hook → Chorus → Verse 2 → Bridge → Hook → Chorus → Outro
```

(인트로 없음. 첫 섹션은 항상 Verse 1)

### 4.7 Switch System

분위기/에너지 전환이 필요한 경우:

```
[Switch]
[Genre: ...]
[VOCAL_PROMPT: ...]
[Texture: ...]
```

이후 모든 섹션에 적용됨.

### 4.8 절대 금지 목록

**Style에:**
- 아티스트/프로듀서/브랜드명
- "in the style of", "type beat", "feat", "prod by"
- 보컬 관련 단어
- 같은 의미 형용사 과다 중복
- 장르 과다 혼합 (2개까지)

**가사에:**
- 빛나다, 흘러가, 날아가, 영원히, 꿈꾸, 별빛, 눈부시, 운명, 기적, 반짝이
- 함께라면, 행복해, 소중해, 곁에 있어줘, 내 손을 잡아, 떠나지 마, 언제나 너야
- 편의점, 섬유유연제, 형광등, 가로등, 버스정류장, 새벽 감성, 기억 속에
- 잊을 수가 없어, 괜찮은 척, 그래도 괜찮아

---

## 5. 디자인 시스템

### 5.1 브랜드 정체성

- 브랜드명: R3ALAUDE
- 한 단어: 프로페셔널, 미니멀, 음악적
- 레퍼런스: 모던 B&W 음악 툴 (Splice, Ableton Live UI)
- 강제 화이트 테마 (다크모드 비활성화)

### 5.2 컬러 팔레트

| 변수 | 값 | 용도 |
|------|----|------|
| `--background` | `#ffffff` | 전체 배경 |
| `--foreground` | `#0a0a0a` | 기본 텍스트, 봇 아바타 |
| `--surface` | `#fafafa` | 카드, 섹션 배경 |
| `--surface-hover` | `#f5f5f5` | 호버 상태 |
| `--surface-alt` | `#f0f0f0` | 대체 배경 |
| `--border` | `#e5e5e5` | 기본 테두리 |
| `--border-strong` | `#d4d4d4` | 강조 테두리 |
| `--text-primary` | `#0a0a0a` | 주요 텍스트 |
| `--text-secondary` | `#525252` | 보조 텍스트 |
| `--text-muted` | `#a3a3a3` | 희미한 텍스트 |
| `--text-disabled` | `#d4d4d4` | 비활성 텍스트 |
| `--accent` | `#f97316` | 오렌지. 핵심 액션만 사용 |
| `--accent-hover` | `#ea580c` | 오렌지 호버 |
| `--accent-light` | `#fff7ed` | 오렌지 배경 (프로듀서 노트 박스) |
| `--accent-muted` | `#fdba74` | 오렌지 보더 (약하게) |
| `--success` | `#22c55e` | 복사 완료 등 성공 상태 |
| `--error` | `#ef4444` | 에러 상태 |

### 5.3 타이포그래피

- **기본 폰트:** Geist Sans (Next.js 기본 제공)
- **모노 폰트:** Geist Mono (프롬프트 결과 표시용)

| 요소 | 크기 | 굵기 | 용도 |
|------|------|------|------|
| 브랜드명 | 14px | 700 | 헤더 로고 |
| 섹션 제목 | 13px | 600 | OutputBlock 타이틀 |
| 봇 메시지 | 14px | 400 | ChatBubble |
| 사용자 메시지 | 14px | 400 | ChatBubble (우측 정렬) |
| 프롬프트 결과 | 13px | 400 (mono) | OutputBlock 내용 |
| 라벨/캡션 | 11~12px | 400~500 | 보조 설명 |

### 5.4 레이아웃

- 전체 최대 너비: `max-w-5xl` (1024px)
- 페이지 중앙 정렬
- Chat Phase 분할:
  - 좌측: 대화 영역 (`flex-1`)
  - 우측: LivePreview (`w-[400px]`, PC만, `hidden lg:block`)
  - 구분선: `border-r border-border`
- Result Phase 분할:
  - 좌측: OutputPanel (`flex-1`)
  - 우측: LivePreview (`w-[400px]`, 구분선 `border-l`)

### 5.5 컴포넌트 스타일

**채팅 버블:**
- 봇: 좌측 정렬, `bg-surface border border-border rounded-2xl rounded-tl-md`
- 사용자: 우측 정렬, `bg-foreground text-white rounded-2xl rounded-tr-md`
- 봇 아바타: 24×24px 검정 정사각형에 흰 텍스트 "R3"

**입력창:**
- 테두리: `border border-border rounded-xl`
- 포커스: `border-foreground` (검정 테두리)
- 전체 너비

**선택 그리드:**
- 버튼형 선택지
- 선택 시 `bg-foreground text-white`

**OutputBlock:**
- `bg-surface border border-border rounded-2xl`
- 타이틀 영역 + 본문(모노 폰트) + 푸터(복사 버튼, 자수 카운터)

**스크롤바:**
- 너비: 5px
- 색상: `--gray-300`
- 트랙: 투명

**애니메이션:**
- fadeIn: `opacity: 0 + translateY(6px)` → `opacity: 1 + translateY(0)`, 300ms ease-out
- 새 메시지/입력창 등장에 사용

### 5.6 간격 시스템

4px 배수: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 48px`

---

## 6. 데이터 흐름

### 6.1 상태 구조 (page.tsx)

```typescript
// AppPhase: 현재 단계
phase: "chat" | "result"

// SunoInput: 수집된 입력값
inputs: {
  oneLiner: string   // 핵심 한 문장
  vibe: string       // 느낌/분위기 (빈 문자열 가능)
  language: string   // "ko" | "en" | "mixed"
}

// SunoOutput: 최종 생성 결과
output: {
  style: string    // Style of Music 필드 (GLOBAL META)
  lyrics: string   // Lyrics 필드 (VOCAL PROFILE + 섹션 가사)
} | null

// PreviewSection[]: 실시간 프리뷰 데이터
previewSections: [
  { id, label, english, korean }
]

// Forensic Translation 분석 노트
forensicLog: string

// 수정 이력
modifyHistory: [
  { request: string, response: string }
]
```

### 6.2 입력 → 생성 흐름

```
[사용자 입력 변경 시]
handleInputChange(inputs)
  → generatePreview(inputs)    // lib/previewEngine.ts
  → setPreviewSections(result) // LivePreview 업데이트

[생성 완료 시]
handleComplete(inputs)
  → generateDemo(inputs)       // lib/demoGenerator.ts (현재)
  → setOutput(demoOutput)
  → setForensicLog(log)
  → setPhase("result")

[추후: 실제 생성 엔진 연결 시]
handleComplete(inputs)
  → POST /api/generate
  → 서버에서 SUNO_SYSTEM.md 기반 생성
  → Response: { style, lyrics, forensicLog }
```

### 6.3 출력 → 수정 흐름

```
[블록 직접 편집]
onOutputChange(key, value)
  → setOutput({ ...output, [key]: value })
  → 즉시 반영

[수정 요청]
handleModify(request)
  → setModifyHistory([...prev, { request, response }])
  → console.log(request)    // 현재: Claude Code에서 수동 반영
  → 추후: POST /api/modify → 결과로 output 업데이트
```

### 6.4 파일별 역할 요약

| 파일 | 역할 |
|------|------|
| `app/page.tsx` | 전체 상태 관리, Phase 전환, 컴포넌트 조합 |
| `lib/types.ts` | 전역 타입 정의 (ChatMessage, SunoInput, SunoOutput, PreviewSection, AppPhase) |
| `lib/steps.ts` | 대화 스텝 정의 (STEPS 배열) |
| `lib/previewEngine.ts` | 실시간 프리뷰 생성 (입력 → PreviewSection[]) |
| `lib/demoGenerator.ts` | 데모 프롬프트 생성 (입력 → SunoOutput + forensicLog) |
| `lib/SUNO_SYSTEM.md` | Suno v5.5 생성 규칙서 (Claude Code 참조용) |
| `components/Header.tsx` | 상단 헤더 (브랜드명, 새로 만들기) |
| `components/ProgressBar.tsx` | 5단계 파이프라인 프로그레스 |
| `components/ChatFlow.tsx` | 대화 입력 플로우 전체 관리 |
| `components/ChatBubble.tsx` | 봇/사용자 메시지 버블 |
| `components/TextInput.tsx` | 텍스트 입력창 (스킵 버튼 포함) |
| `components/SelectGrid.tsx` | 선택지 그리드 |
| `components/MultiSelectGrid.tsx` | 다중 선택 그리드 (현재 미사용) |
| `components/ConfirmCard.tsx` | 입력 확인 카드 |
| `components/LivePreview.tsx` | 실시간 프롬프트 프리뷰 패널 |
| `components/OutputPanel.tsx` | 결과 출력 패널 (전체 레이아웃) |
| `components/OutputBlock.tsx` | 결과 블록 (복사, 편집) |

---

## 7. 화면 설계

### 7.1 Chat Phase — PC (lg 이상)

```
┌─────────────────────────────────────────────────────┐
│  R3ALAUDE                                            │  ← 헤더 (border-b)
├─────────────────────────────────────────────────────┤
│  [○──○──○──○──○]  프로그레스바                        │
├──────────────────────────┬──────────────────────────┤
│                          │                           │
│  [R3] 제일 중요한 한 문장 │  IDENTITY                 │
│       이 뭔가요?          │  Core concept: "..."     │
│                          │                           │
│          [사용자 입력]   │  TEXTURE & MOOD           │
│                          │  dark minor chords...    │
│  ┌────────────────────┐  │  어두운 마이너 코드...     │
│  │ 입력창...    [전송] │  │                           │
│  └────────────────────┘  │  SONG FORM                │
│                          │  Verse 1 → Hook → ...    │
│                          │                           │
│          (좌측: 대화)    │      (우측: LivePreview)  │
│                          │                           │
└──────────────────────────┴──────────────────────────┘
```

### 7.2 Chat Phase — 모바일 (375px)

```
┌───────────────────┐
│  R3ALAUDE         │  ← 헤더
├───────────────────┤
│ [○──○──○──○──○]  │  ← 프로그레스바
├───────────────────┤
│                   │
│ [R3] 한 문장이    │
│      뭔가요?      │
│                   │
│      [사용자 답변] │
│                   │
│ ┌───────────────┐ │
│ │ 입력...  [→]  │ │  ← 입력창 (대화 바로 아래 따라다님)
│ └───────────────┘ │
│                   │
└───────────────────┘
```

(LivePreview 숨김 — `hidden lg:block`)

### 7.3 Result Phase — PC

```
┌─────────────────────────────────────────────────────┐
│  R3ALAUDE                  [새로 만들기]              │
├──────────────────────────┬──────────────────────────┤
│ ← 처음부터 다시           │                           │
│                          │  IDENTITY                 │
│ ┌──────────────────────┐ │  ...                      │
│ │ 프로듀서 분석 노트    │ │                           │
│ │ (오렌지 박스)         │ │  TEXTURE & MOOD           │
│ └──────────────────────┘ │  ...                      │
│                          │                           │
│ ┌──────────────────────┐ │  SONG FORM                │
│ │ Style of Music   [복사]│ │  ...                      │
│ │ (모노폰트 프롬프트)    │ │                           │
│ │ 847/900              │ │                           │
│ └──────────────────────┘ │                           │
│                          │                           │
│ ┌──────────────────────┐ │                           │
│ │ Lyrics           [복사]│ │                           │
│ │ (VOCAL PROFILE +     │ │                           │
│ │  섹션별 가사)         │ │                           │
│ └──────────────────────┘ │                           │
│                          │                           │
│ ─────────────────────── │                           │
│ [수정 요청 입력...] [→]  │                           │
└──────────────────────────┴──────────────────────────┘
```

---

## 8. 기술 아키텍처

### 8.1 기술 스택

| 구분 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | 릴슨 기존 스택, SSR 옵션 확보 |
| 언어 | TypeScript | 타입 안전성, 에디터 자동완성 |
| 스타일링 | Tailwind CSS v4 | 유틸리티 우선, 빠른 반응형 구현 |
| 폰트 | Geist Sans / Geist Mono | Next.js 기본 제공, 별도 설치 불필요 |
| 외부 API | 없음 | Claude Code가 직접 생성 엔진 역할 |

### 8.2 현재 생성 방식 (Phase 1)

```
입력 완료 → demoGenerator.ts → 하드코딩된 예시 프롬프트 반환
```

이 방식은 UI/UX 검증용 데모. 실제 생성은 Claude Code가 직접 SUNO_SYSTEM.md 규칙을 읽고 수행.

**Claude Code 생성 프로세스:**
1. 사용자가 console.log 출력 확인 (입력값)
2. Claude Code가 SUNO_SYSTEM.md 규칙 기반으로 실제 프롬프트 생성
3. demoGenerator.ts 또는 결과 상태를 직접 업데이트

### 8.3 추후 API 구조 (Phase 2)

```
app/api/
├── generate/route.ts    — POST: SunoInput → SunoOutput + forensicLog
└── modify/route.ts      — POST: SunoOutput + request → 수정된 SunoOutput
```

---

## 9. 품질 체크리스트

### 9.1 생성 품질 (Claude Code 생성 시 필수 확인)

- [ ] Style에 보컬 단어 없는가 (vocal, voice, singer, 남성, 여성, 보컬 등)
- [ ] 브라켓 안은 전부 영어인가
- [ ] 가사는 브라켓 밖에 있는가
- [ ] 금지 아티스트명/모방 지시 없는가
- [ ] 훅이 4~10음절(한국어) 또는 4~8음절(영어)인가
- [ ] Auto-Hook Engine 7가지 규칙 적용됐는가
- [ ] 클리셰 금지 목록 위반 없는가
- [ ] 시점/화자가 일관적인가
- [ ] 섹션별 기능이 겹치지 않는가 (Verse는 서사, Chorus는 주제 선언)
- [ ] 감정 곡선이 있는가 (verse 절제 → chorus 해방)
- [ ] Style이 600~900자 범위인가
- [ ] 송폼이 V1→Hook→Chorus→V2→Bridge→Hook→Chorus→Outro 순서인가

### 9.2 UI 품질

- [ ] 모바일(375px)에서 레이아웃 깨지지 않는가
- [ ] 복사 버튼이 정상 동작하는가
- [ ] LivePreview가 입력에 따라 실시간 업데이트되는가
- [ ] 스크롤이 새 메시지에 따라 자동으로 내려가는가
- [ ] 화이트 테마가 강제 적용되는가 (다크모드 무시)

---

## 10. Phase 2 확장 계획

### 10.1 Claude API 연동 (핵심)

- `/api/generate` 라우트 생성
- SUNO_SYSTEM.md를 system prompt로 전달
- 실시간 스트리밍 응답으로 생성 중 타이핑 효과 표시
- 수정 요청 자동 반영

### 10.2 Suno API 연동 (Suno API 공개 시)

- Style + Lyrics를 Suno API로 직접 전송
- 생성된 음악 링크/임베드 결과 화면에 표시
- 재생성, 변형 버튼 추가

### 10.3 히스토리 기능

- 생성 기록 로컬 저장 (LocalStorage)
- 과거 생성 결과 불러오기
- 즐겨찾기 (좋은 프롬프트 보관)

### 10.4 프리셋 시스템

- 장르별 프리셋 (트로트, R&B, 힙합, 팝 등)
- 릴슨 자주 쓰는 조합 저장
- 원클릭 프리셋 적용

### 10.5 섹션별 부분 수정

- 현재: 전체 수정 요청만 가능
- 추후: 특정 섹션(예: Chorus만) 지정해서 수정 요청
- 섹션 클릭 → 해당 섹션 하이라이트 + 수정 입력창 연결

### 10.6 Forensic Translation 확장

- 현재: 키워드 매핑 14개
- 추후: 더 많은 자유 표현 매핑 추가
- "내가 좋아하는 아티스트" 입력 → 해당 사운드 태그 변환 (아티스트명은 출력에 포함 안 함)

---

## 11. 제외 사항 (Out of Scope)

| 항목 | 제외 이유 | 가능 시점 |
|------|----------|----------|
| 다중 사용자 | 1인 사용 도구 | 불필요 |
| 회원가입/로그인 | 1인 사용 도구 | 불필요 |
| 클라우드 저장 | 로컬 사용으로 충분 | Phase 2 (LocalStorage) |
| Suno API 직접 연동 | API 미공개 | API 공개 시 |
| 실시간 음악 재생 | 외부 플레이어 사용 | Suno API 연동 시 |
| 모바일 앱 | 웹으로 충분 | 필요 시 PWA |
| 다국어 UI | 한국어 단일 사용자 | 불필요 |

---

> 최종 업데이트: 2026-03-28
> 담당: 릴슨 (릴슨 프로젝트)
> 규칙서 참조: `lib/SUNO_SYSTEM.md`
