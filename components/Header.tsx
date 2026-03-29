"use client";

import { useState } from "react";
import { AppPhase } from "@/lib/types";

interface HeaderProps {
  phase: AppPhase;
  onReset: () => void;
  totalCostUsd?: number;
  callCount?: number;
}

export default function Header({ phase, onReset, totalCostUsd = 0, callCount = 0 }: HeaderProps) {
  const [showCost, setShowCost] = useState(false);

  const handleLogoClick = () => {
    if (window.confirm("새로 작성하시겠습니까?")) {
      onReset();
    }
  };

  const krw = Math.ceil(totalCostUsd * 1400);

  return (
    <header className="border-b border-border px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img src="/avatar.png" alt="R3ALAUDE" className="w-8 h-8 rounded-lg object-cover" />
          <h1 className="text-lg font-bold text-text-primary tracking-tight">
            R3ALAUDE
          </h1>
          <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded border border-border">
            v5.5
          </span>
        </button>
        <div className="flex items-center gap-3">
          {/* 예상 코스트 */}
          {callCount > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowCost((v) => !v)}
                className="text-xs text-text-muted hover:text-text-primary transition-colors"
                style={{
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  border: "1px solid #e5e5e5",
                  backgroundColor: showCost ? "#f5f5f5" : "transparent",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                예상 Cost
              </button>
              {showCost && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  backgroundColor: "#0a0a0a", color: "#fff", borderRadius: "12px",
                  padding: "14px 18px", width: "220px", zIndex: 100,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
                  fontSize: "12px",
                }}>
                  <p style={{ fontWeight: 700, marginBottom: "10px", color: "#f97316" }}>이번 세션 API 비용</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#a3a3a3" }}>API 호출</span>
                    <span style={{ fontWeight: 600 }}>{callCount}회</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#a3a3a3" }}>예상 비용 (USD)</span>
                    <span style={{ fontWeight: 600 }}>${totalCostUsd < 0.01 ? totalCostUsd.toFixed(4) : totalCostUsd.toFixed(3)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "#a3a3a3" }}>예상 비용 (KRW)</span>
                    <span style={{ fontWeight: 600 }}>약 {krw.toLocaleString()}원</span>
                  </div>
                  <p style={{ fontSize: "10px", color: "#737373", lineHeight: "1.4" }}>
                    * 토큰 수 추정 기반. 실제 비용과 차이가 있을 수 있습니다.
                  </p>
                  <div style={{
                    position: "absolute", top: "-5px", right: "16px",
                    width: "10px", height: "10px", backgroundColor: "#0a0a0a",
                    transform: "rotate(45deg)",
                  }} />
                </div>
              )}
            </div>
          )}
          {/* 새로 만들기 */}
          {phase === "result" && (
            <button
              onClick={handleLogoClick}
              className="text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              새로 만들기
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
