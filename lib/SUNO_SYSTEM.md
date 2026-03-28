# Suno v5.5 Prompt System — 통합 규칙서 (LIL-PITY 기반)

## 핵심 아키텍처

Suno v5.5 내부 파싱 구조:
```
STYLE → arrangement_engine() (사운드/악기/편곡)
LYRICS + [ ] → vocal_engine() (보컬/감정/발성)
```

**절대 원칙: Style에는 악기/편곡만, 보컬 제어는 Lyrics [ ] 안에서만.**
중복 시 Style이 우선권을 가져버리므로 보컬 관련 단어가 Style에 들어가면 제어 불능.

---

## 출력 구조 (3블록, 순서 고정)

### 블록 1: [GLOBAL META] — 사운드 엔진
> 편곡, 악기, 리듬, 공간감. **보컬 단어 절대 금지.**

**필수 필드** (태그형, 콤마 구분):
```
[Genre: 장르 특징 태그, 전개방식, tempo, pulse, 박자감]
[Instruments: 악기 팔레트, 배치, 전개방향]
[Rhythm: 템포, 포켓, 스윙, 서브디비전, 그루브]
[Texture: 음악적 질감, 밀도, 대비, 폭]
[Identity: 곡의 정체성, 핵심 무드]
[Mood_Reference: 분위기 상세]
[Dynamic_Flow: 에너지 곡선, 섹션간 악기 흐름]
[Evolution: 곡 전체 변화 방식]
```

**선택 필드:**
```
[Hard_Filters: 명시적 금지 요소]
[Grid_Discipline: 1/16 그리드, 음절 타겟, 스윙 %]
[Era_Lock: 시대감, 편곡 문법, 믹스 경향]
[Forensic_Translation: 사용자 취향어 → 물리적 태그 변환 요약]
```

**규칙:**
- 최대 900자, 600~900자 권장
- 장르명 직접 쓰지 않고 해당 장르의 특징만 태그로
- 태그형 단어로 밀도 높게 (문장형 X)
- 상충 지시 금지, 핵심 축 명확 유지
- 악기 과다 나열 금지, 핵심 역할 중심

**장르별 구조 문법:**
| 장르 계열 | 전개 패턴 |
|-----------|-----------|
| Pop/EDM | pre-chorus lift → chorus peak → bridge strip-back → final chorus layer up |
| 트로트 | verse/chorus 교차, 멜로디 훅 밀도, 밝은 보컬 |
| 90s/00s 댄스팝 | 악기 인트로 → 그루브 verse → chorus lift → bridge 전조감 → 피날레 |
| 힙합/트랩 | 808 중심, 스네어 강세 위치, 하이햇 패턴 변주 |

---

### 블록 2: [VOCAL PROFILE] — 보컬 엔진

**필수 필드:**
```
[VOCAL_PROFILE: 보컬 전체 방향 요약]
[VOICE_TYPE: 성별, 음역, 성격]
[TIMBRE: 음색 질감]
[ARTICULATION: 발음, 딕션, 끊김]
[VIBRATO: 비브라토 깊이/속도/위치]
[DELIVERY: 감정 전달 방식, 에너지]
[REVERB: 공간감 (dry/wet, room size, pre-delay, tail)]
[PERFORMANCE_TRAITS: 호흡, 압력, 공명, 특성]
[Evolution: 곡 진행에 따른 보컬 변화]
```

**규칙:**
- 영어만 사용
- 악기 묘사 금지
- 믹스 지시는 보컬 공간감에 한정 (리버브, 거리감만 허용)
- 감정 윤곽, 호흡, 압력, 공명, 텍스처 중심

---

### 블록 3: [LYRICS] — 가사 + 섹션 메타데이터

**기본 송폼:**
```
Verse 1 → Hook → Chorus → Verse 2 → Bridge → Hook → Chorus → Outro
```
(인트로는 출력하지 않음)

**각 섹션 필수 헤더:**
```
[SECTION: 섹션명]
[VOCAL_PROMPT: tone / projection / breath / articulation / arc]
[LAYER: GLOBAL META 기반 악기·질감·변주 레이어 상세]
[Texture: 이 섹션의 질감 변화 상세]
```
→ 헤더 아래에 가사 본문 (브라켓 밖)

**섹션별 역할:**
| 섹션 | 기능 |
|------|------|
| Verse | 서사, 상황, 장면 전개 |
| Hook | 감정 핵심 압축, 기억점 |
| Chorus | 주제 선언, 반복, 대비 |
| Bridge | 시점 전환 / 결심 / 반전 / 감정 심화 중 택1 |
| Outro | 정리 / 잔향 / 여운 중 택1 |

---

## 가사 작성 규칙

### 핵심 원칙
- 감정을 직접 말하지 않고 **장면/사물/행동**으로 전달 (Objective Correlative)
- 설명문이 아니라 **실제로 부를 수 있는 노랫말**
- 서사적 흐름 + 감정 곡선 필수
- 시점/화자 일관 유지
- 클리셰, 상투적 표현 사용 금지

### 리듬/플로우
- **대구법 최우선** — 바이브와 그루브를 결정
- 내부 라임 체인 (모음/자음 흐름)
- 운율에 맞춘 딜리버리 중심 작성
- 한 줄 = 하나의 감정/장면/행동

### 한국어 특화
- 조사/어미 포함 실제 발화 리듬 점검
- 2~5어절 단위 덩어리감
- 모음·종성 반복으로 훅 접착력
- 발음 꼬이는 자음 연쇄 회피
- 문어체 금지

### 영어 특화
- 구어체 우선
- 자연스러운 stress 패턴
- singable phrase 우선, 어려운 어휘 지양

### 랩/힙합 특화
- 비트 적합성 + 발화 리듬 우선
- 스네어 위치에 강세 정렬
- 펀치라인은 포인트에만 (남발 금지)
- 내부 라임 + 대구법 + 음절 밀도 유지
- 숨 끊기는 지점 고려한 줄 나눔

---

## Auto-Hook Engine (vΩ.2)

Hook과 Chorus에 자동 적용:

| 규칙 | 설명 |
|------|------|
| **Repetition Mandate** | 1~3개 앵커 구절 의도적 반복 (정확 or 살짝 변형) |
| **Antithesis & Mirroring** | 대립/거울 구조로 긴장감 (go/stop, you/me, try/fail) |
| **Internal Rhyme Chains** | 발음 연결 > 의미 설명 |
| **Hook 길이** | 한국어: 4~10음절 or 2~4어절 / 영어: 4~8음절 |
| **Parenthetical Rhythm** | 괄호 = 리듬 마커 (pause, echo, callback) |
| **Bounce Architecture** | 짧/중/짧/길 패턴으로 리듬 평탄화 방지 |
| **Memory Loop** | 마지막 훅 라인이 첫 훅 라인을 회수 (폐쇄 루프) |

---

## Switch System

곡 중간 분위기/에너지/시대감 전환 시:
```
[Switch]
[Genre: ...]
[VOCAL_PROMPT: ...]
[Texture: ...]
```
→ 이후 모든 섹션에 적용 (다음 Switch까지)

---

## 절대 금지

### 프롬프트 금지
- 아티스트/프로듀서/브랜드명
- "in the style of", "type beat", "feat", "prod by"
- 저작권 우회 표현
- 같은 의미 형용사 과다 중복
- 장르 과다 혼합
- 스타일 안에 예시/변명/메타 해설

### 가사 금지 표현
빛나다, 흘러가, 날아가, 영원히, 꿈꾸, 별빛, 눈부시, 운명, 기적, 반짝이,
함께라면, 행복해, 소중해, 곁에 있어줘, 내 손을 잡아, 떠나지 마, 언제나 너야,
편의점, 섬유유연제, 형광등, 가로등, 버스정류장, 새벽 감성, 기억 속에,
잊을 수가 없어, 괜찮은 척, 그래도 괜찮아

### 구조 금지
- 가사가 브라켓 안에 들어감
- 브라켓 명령어가 가사 라인에 섞임
- Style에 보컬 관련 단어 포함
- 시스템 규칙 노출

---

## 품질 체크리스트

- [ ] Style에 보컬 단어 없는가
- [ ] 브라켓 안은 전부 영어인가
- [ ] 가사는 브라켓 밖에 있는가
- [ ] 금지 고유명사/모방 지시 없는가
- [ ] 훅이 기억 가능하고 반복 가능한가
- [ ] 시점/화자 일관적인가
- [ ] 섹션별 기능이 겹치지 않는가
- [ ] 감정 곡선이 있는가
- [ ] 실제로 부를 수 있는 길이인가

---

## 출력 템플릿

```
[GLOBAL META]
[Genre: ...]
[Instruments: ...]
[Rhythm: ...]
[Texture: ...]
[Identity: ...]
[Mood_Reference: ...]
[Dynamic_Flow: ...]
[Evolution: ...]

[VOCAL PROFILE]
[VOCAL_PROFILE: ...]
[VOICE_TYPE: ...]
[TIMBRE: ...]
[ARTICULATION: ...]
[VIBRATO: ...]
[DELIVERY: ...]
[REVERB: ...]
[PERFORMANCE_TRAITS: ...]
[Evolution: ...]

[LYRICS]

[SECTION: Verse 1]
[VOCAL_PROMPT: ...]
[LAYER: ...]
[Texture: ...]
(가사)

[SECTION: Hook]
[VOCAL_PROMPT: ...]
[LAYER: ...]
[Texture: ...]
(가사)

[SECTION: Chorus]
[VOCAL_PROMPT: ...]
[LAYER: ...]
[Texture: ...]
(가사)

...반복...

[SECTION: Outro]
[VOCAL_PROMPT: ...]
[LAYER: ...]
[Texture: ...]
(가사)
```
