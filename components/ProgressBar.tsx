"use client";

import { AppPhase } from "@/lib/types";

const PIPELINE = [
  { id: "oneLiner", label: "핵심" },
  { id: "genre", label: "장르" },
  { id: "instruments", label: "악기" },
  { id: "vibe", label: "느낌" },
  { id: "tempo", label: "BPM" },
  { id: "timeSignature", label: "박자" },
  { id: "era", label: "시대" },
  { id: "texture", label: "텍스처" },
  { id: "vocal", label: "보컬" },
  { id: "reverb", label: "리버브" },
  { id: "style", label: "Style" },
  { id: "lyrics", label: "Lyrics" },
];

// Style/Lyrics 탭의 파이프라인 인덱스
const STYLE_INDEX = 10;
const LYRICS_INDEX = 11;

interface ProgressBarProps {
  activeIndex: number;
  onStepClick?: (index: number) => void;
  completedSteps?: Set<string>; // 실제로 값이 입력된 스텝 ID
  // phase를 받아 Style/Lyrics 탭과 실제 화면을 연결
  appPhase?: AppPhase;
}

export default function ProgressBar({ activeIndex, onStepClick, completedSteps, appPhase }: ProgressBarProps) {
  // phase 기반으로 오버라이드할 활성 인덱스 결정
  // style phase → Style 탭(10) 활성화
  // lyrics phase → Lyrics 탭(11) 활성화
  // chat phase → 실제 activeIndex 사용
  const resolvedActiveIndex =
    appPhase === "style" ? STYLE_INDEX :
    appPhase === "lyrics" ? LYRICS_INDEX :
    activeIndex;

  return (
    <div data-progressbar style={{ padding: "24px 24px", borderBottom: "1px solid #e5e5e5", cursor: "pointer" }}>
      <div style={{ display: "flex", gap: "2px", marginBottom: "8px" }}>
        {PIPELINE.map((step, i) => {
          const isCurrent = i === resolvedActiveIndex;
          const isClickable = !!onStepClick && i !== resolvedActiveIndex;

          // 실제로 값이 입력된 스텝만 오렌지
          // style/lyrics phase일 때는 chat 스텝(0~9)을 모두 완료된 것으로 표시
          const isCompletedByPhase = (appPhase === "style" || appPhase === "lyrics") && i < STYLE_INDEX;
          const hasValue = completedSteps?.has(step.id) || isCompletedByPhase || false;
          let bg = "#e5e5e5"; // 미선택: 연한 회색
          if (hasValue) bg = "#f97316"; // 입력됨: 오렌지
          if (isCurrent) bg = "#f97316"; // 현재: 오렌지 깜빡임

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(i)}
              disabled={!isClickable}
              style={{
                flex: 1,
                height: "5px",
                borderRadius: "9999px",
                backgroundColor: bg,
                border: "none",
                cursor: isClickable ? "pointer" : "default",
                transition: "all 0.2s ease",
                animation: isCurrent ? "pulse-bar 1.5s ease-in-out infinite" : "none",
              }}
            />
          );
        })}
      </div>

      <div style={{ display: "flex" }}>
        {PIPELINE.map((step, i) => {
          const isCurrent = i === resolvedActiveIndex;

          const isCompletedByPhase2 = (appPhase === "style" || appPhase === "lyrics") && i < STYLE_INDEX;
          const hasValue2 = completedSteps?.has(step.id) || isCompletedByPhase2 || false;
          let color = "#d4d4d4"; // 미선택: 연한 회색
          let fontWeight = 400;
          if (hasValue2) { color = "#f97316"; fontWeight = 500; } // 입력됨: 오렌지
          if (isCurrent) { color = "#0a0a0a"; fontWeight = 600; } // 현재: 검정 볼드
          const isClickable2 = !!onStepClick && i !== resolvedActiveIndex;

          return (
            <span
              key={step.id}
              onClick={() => isClickable2 && onStepClick?.(i)}
              style={{
                flex: 1,
                fontSize: "9px",
                textAlign: "center",
                color,
                fontWeight,
                cursor: isClickable2 ? "pointer" : "default",
                transition: "color 0.3s ease",
              }}
            >
              {step.label}
            </span>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse-bar {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* 프로그레스바 호버 효과 */}
      <style>{`
        div[data-progressbar]:hover button {
          height: 10px !important;
          border-radius: 5px !important;
        }
        div[data-progressbar] button:hover {
          height: 18px !important;
          border-radius: 9px !important;
          box-shadow: 0 2px 8px rgba(249,115,22,0.3);
          transform: scaleX(1.05);
        }
        div[data-progressbar]:hover span {
          font-size: 10px !important;
        }
        div[data-progressbar] span:hover {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #f97316 !important;
        }
      `}</style>
    </div>
  );
}
