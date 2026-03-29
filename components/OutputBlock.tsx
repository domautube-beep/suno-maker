"use client";

import { useState, useRef, useEffect } from "react";

interface OutputBlockProps {
  title: string;
  subtitle: string;
  content: string;
  charLimit?: number;
  // 직접 편집 완료 시 호출 (편집된 전체 텍스트 반환)
  onEdit?: (newContent: string) => void;
}

export default function OutputBlock({
  title,
  subtitle,
  content,
  charLimit,
  onEdit,
}: OutputBlockProps) {
  const [copied, setCopied] = useState(false);
  // 직접 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 편집 모드 진입 시 포커스 + 내용 최신화
  useEffect(() => {
    if (isEditing) {
      setEditValue(content);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isEditing, content]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onEdit?.(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(content);
    setIsEditing(false);
  };

  const charCount = content.length;
  const isOver = charLimit ? charCount > charLimit : false;

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <p className="text-[11px] text-text-muted mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {charLimit && (
            <span className={"text-xs font-mono " + (isOver ? "text-error" : "text-text-muted")}>
              {charCount}/{charLimit}
            </span>
          )}
          {!isEditing && (
            <button
              onClick={handleCopy}
              className={
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all " +
                (copied
                  ? "bg-accent-light text-accent"
                  : "border border-border text-text-muted hover:text-text-primary hover:border-foreground")
              }
            >
              {copied ? "복사됨" : "복사"}
            </button>
          )}
        </div>
      </div>

      {/* 본문 — 편집 모드 / 보기 모드 전환 */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full px-5 py-4 text-xs text-text-primary font-mono whitespace-pre-wrap leading-relaxed resize-none outline-none bg-white min-h-[200px]"
          style={{ minHeight: "200px" }}
        />
      ) : (
        <pre className="px-5 py-4 text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto">
          {content}
        </pre>
      )}

      {/* 하단 편집 안내 / 저장·취소 버튼 */}
      <div className="px-5 py-2.5 border-t border-border">
        {isEditing ? (
          // 편집 모드 — 저장/취소
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-white hover:bg-gray-800 transition-all"
            >
              저장
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              취소
            </button>
          </div>
        ) : (
          // 보기 모드 — 편집 안내 버튼
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-text-muted hover:text-accent transition-colors"
          >
            직접 편집하거나, 오른쪽 프리뷰에서 수정하세요
          </button>
        )}
      </div>
    </div>
  );
}
