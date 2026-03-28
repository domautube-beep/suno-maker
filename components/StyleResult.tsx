"use client";

import { SunoOutput } from "@/lib/types";
import OutputBlock from "./OutputBlock";

interface StyleResultProps {
  output: SunoOutput;
  forensicLog?: string;
  onOutputEdit?: (field: "style" | "lyrics", newContent: string) => void;
  // 다음 단계(Lyrics)로 이동
  onNextPhase: () => void;
  // 처음부터 다시
  onBack: () => void;
}

export default function StyleResult({
  output,
  forensicLog,
  onOutputEdit,
  onNextPhase,
  onBack,
}: StyleResultProps) {
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

        {/* 다음 단계 안내 */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "16px 20px",
          }}
        >
          <p style={{ fontSize: "12px", color: "#737373", lineHeight: "1.6" }}>
            Style of Music이 생성됐습니다. 오른쪽 프리뷰에서 수정하거나, 블록에서 직접 편집 후 다음 단계로 이동하세요.
          </p>
        </div>
      </div>

      {/* 하단 고정 — 다음 단계 버튼 */}
      <div style={{ borderTop: "1px solid #e5e5e5", padding: "16px", backgroundColor: "#fff" }}>
        <button
          onClick={onNextPhase}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            backgroundColor: "#f97316",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
          className="hover:opacity-90 transition-all"
        >
          다음: 가사 생성으로
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
