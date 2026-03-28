@AGENTS.md

# suno-maker

## 프로젝트 설명
Suno v5.5 기준 프롬프트/가사 자동 생성 웹앱.
주제/분위기를 입력하면 가사 + 스타일 프롬프트 + 제외 스타일 + 제목을 생성하고, Suno에 바로 복붙할 수 있도록 출력한다.

## 기술 스택
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4

## 폴더 구조
```
app/           — 페이지 및 레이아웃
app/api/       — API 라우트 (추후 생성 로직)
components/    — UI 컴포넌트
lib/           — 유틸리티, 프롬프트 로직
```

## 빌드 & 실행
```bash
npm run dev    # 개발 서버 (localhost:3000)
npm run build  # 프로덕션 빌드
npm start      # 프로덕션 실행
```

## 규칙
- 코드 주석은 한국어로 작성
- 변수명은 영어, camelCase 사용
- Suno v5.5 프롬프트 파싱 규칙 기반
- 파일 수정 시 변경 내용 설명 포함
