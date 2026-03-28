"use client";

import { SunoOutput } from "@/lib/types";
import OutputBlock from "./OutputBlock";
// LyricsSection은 page.tsx에서 직접 사용

interface OutputPanelProps {
  output: SunoOutput;
  forensicLog?: string;
  onModify: (request: string) => void;
  onBack: () => void;
  modifyHistory: { request: string; response: string }[];
  onOutputEdit?: (field: "style" | "lyrics", newContent: string) => void;
  onGenerateVariation?: () => void;
  trackNumber?: number;
}

export default function OutputPanel({
  output,
  forensicLog,
  onBack,
  modifyHistory,
  onOutputEdit,
  onModify,
  onGenerateVariation,
  trackNumber = 1,
}: OutputPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 pb-6">
        <button
          onClick={onBack}
          className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          처음부터 다시
        </button>

        {/* 프로듀서 분석 노트 */}
        {forensicLog && (
          <div className="bg-accent-light border border-accent-muted/30 rounded-2xl px-5 py-4">
            <h3 className="text-xs font-semibold text-accent mb-2">
              프로듀서 분석 노트
            </h3>
            <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
              {forensicLog}
            </pre>
          </div>
        )}

        {/* Style of Music — Suno "Style of Music" 필드 */}
        <OutputBlock
          title="Style of Music"
          subtitle="Suno 'Style of Music' 필드에 붙여넣기"
          content={output.style}
          charLimit={900}
          onEdit={(newContent) => onOutputEdit?.("style", newContent)}
        />

        {/* Lyrics — 가사 생성 영역 (OutputPanel에서는 미사용) */}

        {/* 비슷한 곡 더 만들기 배너 */}
        {onGenerateVariation && (
          <div
            style={{
              border: "2px solid #f97316",
              borderRadius: "16px",
              padding: "20px",
              background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
              marginTop: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "12px",
                backgroundColor: "#f97316", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#0a0a0a" }}>
                  Track {trackNumber + 1} — 비슷한 곡 하나 더?
                </p>
                <p style={{ fontSize: "11px", color: "#737373" }}>
                  같은 톤 & 무드, 다른 변주. 앨범처럼 이어지는 플레이리스트.
                </p>
              </div>
            </div>
            <button
              onClick={onGenerateVariation}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                backgroundColor: "#f97316",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
              className="hover:opacity-90 transition-all"
            >
              비슷한 느낌으로 다음 곡 생성하기 →
            </button>
          </div>
        )}

        {/* 수정 히스토리 */}
        {modifyHistory.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-medium text-text-muted">수정 이력</h3>
            {modifyHistory.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-end">
                  <div className="bg-foreground rounded-2xl rounded-tr-md px-4 py-2 max-w-[85%]">
                    <p className="text-xs text-white">{item.request}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                    R3
                  </div>
                  <div className="bg-surface border border-border rounded-2xl rounded-tl-md px-4 py-2 max-w-[85%]">
                    <p className="text-xs text-text-secondary">{item.response}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 고정 — 수정 대화 입력 */}
      <div className="border-t border-border px-4 py-3 bg-white">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            className="flex-1 bg-white border border-border rounded-full px-4 py-2.5 text-sm text-text-primary placeholder-text-disabled focus:outline-none focus:border-foreground transition-colors"
            placeholder="수정 요청 (예: 더 어둡게, 템포 올려, 2절 바꿔)"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                onModify((e.target as HTMLInputElement).value.trim());
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
              if (input.value.trim()) {
                onModify(input.value.trim());
                input.value = "";
              }
            }}
            style={{ backgroundColor: "#0a0a0a" }}
            className="h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:opacity-80 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-text-muted text-center mt-1.5">
          오른쪽 프리뷰에서 항목별 수정도 가능합니다
        </p>
      </div>
    </div>
  );
}
