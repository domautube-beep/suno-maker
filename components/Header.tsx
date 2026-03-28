"use client";

import { AppPhase } from "@/lib/types";

interface HeaderProps {
  phase: AppPhase;
  onReset: () => void;
}

export default function Header({ phase, onReset }: HeaderProps) {
  const handleLogoClick = () => {
    if (window.confirm("새로 작성하시겠습니까?")) {
      onReset();
    }
  };

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
        {/* chat이 아닌 모든 phase(style, lyrics)에서 새로 만들기 표시 */}
        {phase !== "chat" && (
          <button
            onClick={handleLogoClick}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            새로 만들기
          </button>
        )}
      </div>
    </header>
  );
}
