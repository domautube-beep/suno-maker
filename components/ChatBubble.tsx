"use client";

import { useState } from "react";

interface ChatBubbleProps {
  role: "bot" | "user";
  content: string;
  tooltip?: string;
}

export default function ChatBubble({ role, content, tooltip }: ChatBubbleProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (role === "bot") {
    return (
      <div className="flex gap-3 items-start">
        <img src="/avatar.png" alt="R3" className="w-7 h-7 rounded-md object-cover flex-shrink-0 mt-0.5" />
        <div className="relative">
          <div className="bg-surface border border-border rounded-2xl rounded-tl-md px-4 py-3">
            <span className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
              {content}
            </span>
            {tooltip && (
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: showTooltip ? "#f97316" : "#e5e5e5",
                  color: showTooltip ? "#fff" : "#737373",
                  fontSize: "10px",
                  fontWeight: 700,
                  marginLeft: "6px",
                  verticalAlign: "middle",
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.2s",
                }}
              >
                ?
              </button>
            )}
          </div>

          {/* 툴팁 */}
          {showTooltip && tooltip && (
            <div
              className="animate-fadeIn"
              style={{
                marginTop: "8px",
                padding: "12px 16px",
                backgroundColor: "#0a0a0a",
                color: "#e5e5e5",
                borderRadius: "12px",
                fontSize: "12px",
                lineHeight: "1.6",
                maxWidth: "360px",
                position: "relative",
              }}
            >
              {/* 화살표 */}
              <div
                style={{
                  position: "absolute",
                  top: "-5px",
                  left: "16px",
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#0a0a0a",
                  transform: "rotate(45deg)",
                }}
              />
              {tooltip}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div className="bg-foreground rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%]">
        <p className="text-sm text-white leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
