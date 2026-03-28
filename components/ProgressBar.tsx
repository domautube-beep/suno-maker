"use client";

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

interface ProgressBarProps {
  activeIndex: number;
  onStepClick?: (index: number) => void;
  completedSteps?: Set<string>; // 실제로 값이 입력된 스텝 ID
}

export default function ProgressBar({ activeIndex, onStepClick, completedSteps }: ProgressBarProps) {
  return (
    <div data-progressbar style={{ padding: "24px 24px", borderBottom: "1px solid #e5e5e5", cursor: "pointer" }}>
      <div style={{ display: "flex", gap: "2px", marginBottom: "8px" }}>
        {PIPELINE.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isCurrent = i === activeIndex;
          // 완료된 스텝 + 미래 스텝 모두 클릭 가능 (원하는 곳으로 점프)
          const isClickable = !!onStepClick && i !== activeIndex;

          // 실제로 값이 입력된 스텝만 오렌지
          const hasValue = completedSteps?.has(step.id) || false;
          let bg = "#e5e5e5"; // 미선택: 연한 회색
          if (hasValue) bg = "#f97316"; // 실제 입력됨: 오렌지
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
          const isCompleted = i < activeIndex;
          const isCurrent = i === activeIndex;

          const hasValue2 = completedSteps?.has(step.id) || false;
          let color = "#d4d4d4"; // 미선택: 연한 회색
          let fontWeight = 400;
          if (hasValue2) { color = "#f97316"; fontWeight = 500; } // 입력됨: 오렌지
          if (isCurrent) { color = "#0a0a0a"; fontWeight = 600; } // 현재: 검정 볼드
          const isClickable2 = !!onStepClick && i !== activeIndex;

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
