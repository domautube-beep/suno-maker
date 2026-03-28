#!/bin/bash
# R3ALAUDE 자동 설치 & 실행 스크립트
# 사용법: 압축 해제 후 터미널에서 ./setup.sh

echo ""
echo "  ██████╗ ██████╗  █████╗ ██╗      █████╗ ██╗   ██╗██████╗ ███████╗"
echo "  ██╔══██╗╚════██╗██╔══██╗██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝"
echo "  ██████╔╝ █████╔╝███████║██║     ███████║██║   ██║██║  ██║█████╗  "
echo "  ██╔══██╗ ╚═══██╗██╔══██║██║     ██╔══██║██║   ██║██║  ██║██╔══╝  "
echo "  ██║  ██║██████╔╝██║  ██║███████╗██║  ██║╚██████╔╝██████╔╝███████╗"
echo "  ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝"
echo ""
echo "  Suno v5.5 프롬프트 & 가사 생성기"
echo "  ────────────────────────────────"
echo ""

# Node.js 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "   https://nodejs.org 에서 설치 후 다시 실행해주세요."
    exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
    echo "❌ Node.js 18 이상이 필요합니다. (현재: $(node -v))"
    exit 1
fi

echo "✅ Node.js $(node -v) 확인"

# 의존성 설치
echo ""
echo "📦 패키지 설치 중..."
npm install --silent 2>/dev/null

if [ $? -ne 0 ]; then
    echo "❌ 패키지 설치 실패"
    exit 1
fi

echo "✅ 패키지 설치 완료"

# 서버 시작
echo ""
echo "🚀 R3ALAUDE 시작 중..."
echo ""
echo "  종료하려면 Ctrl+C"
echo ""

# 2초 후 브라우저 자동 열기
(sleep 2 && open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null || start http://localhost:3000 2>/dev/null) &

npm run dev
