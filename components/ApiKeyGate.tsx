"use client";

import { useState } from "react";

// API 키 접두어로 provider 자동 판별
export type Provider = "claude" | "openai" | "gemini" | null;

export function detectProvider(key: string): Provider {
  const trimmed = key.trim();
  if (trimmed.startsWith("sk-ant-")) return "claude";
  if (trimmed.startsWith("sk-")) return "openai";
  if (trimmed.startsWith("AIza")) return "gemini";
  return null;
}

const PROVIDER_LABELS: Record<string, string> = {
  claude: "Claude (Anthropic)",
  openai: "GPT (OpenAI)",
  gemini: "Gemini (Google)",
};

interface ApiKeyGateProps {
  onKeySubmit: (key: string, provider: Provider) => void;
}

export default function ApiKeyGate({ onKeySubmit }: ApiKeyGateProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const detected = detectProvider(key);

  const handleSubmit = () => {
    if (!key.trim()) { setError("API 키를 입력해주세요."); return; }
    if (!detected) { setError("지원하지 않는 키 형식입니다. Claude, GPT, Gemini 키를 입력해주세요."); return; }
    onKeySubmit(key.trim(), detected);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", backgroundColor: "#fafafa", padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "420px", backgroundColor: "#fff",
        borderRadius: "20px", border: "1px solid #e5e5e5",
        padding: "40px 32px", textAlign: "center",
      }}>
        {/* 로고 */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.5px" }}>
            R3ALAUDE
          </h1>
          <p style={{ fontSize: "12px", color: "#a3a3a3", marginTop: "4px" }}>
            Suno v5.5 프롬프트 & 가사 생성기
          </p>
        </div>

        {/* 안내 */}
        <div style={{ marginBottom: "24px", textAlign: "left" }}>
          <p style={{ fontSize: "13px", color: "#525252", lineHeight: "1.7", marginBottom: "12px" }}>
            가사 생성을 위해 AI API 키가 필요합니다.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { prefix: "sk-ant-...", label: "Claude (Anthropic)", url: "https://console.anthropic.com/settings/keys" },
              { prefix: "sk-...", label: "GPT (OpenAI)", url: "https://platform.openai.com/api-keys" },
              { prefix: "AIza...", label: "Gemini (Google)", url: "https://aistudio.google.com/apikey" },
            ].map((p) => (
              <div key={p.prefix} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#a3a3a3", fontFamily: "monospace" }}>{p.prefix}</span>
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "11px", color: "#f97316", textDecoration: "none" }}>
                  {p.label} →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 키 입력 */}
        <div style={{ position: "relative", marginBottom: "12px" }}>
          <input
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="API 키 붙여넣기"
            style={{
              width: "100%", padding: "14px 16px", borderRadius: "12px",
              border: error ? "1px solid #ef4444" : "1px solid #e5e5e5",
              fontSize: "14px", fontFamily: "monospace", outline: "none",
              backgroundColor: "#fff",
            }}
          />
          {/* 자동 판별 뱃지 */}
          {detected && (
            <span style={{
              position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
              fontSize: "10px", fontWeight: 600, color: "#16a34a",
              backgroundColor: "#f0fdf4", padding: "3px 8px", borderRadius: "6px",
              border: "1px solid #bbf7d0",
            }}>
              {PROVIDER_LABELS[detected]}
            </span>
          )}
        </div>

        {/* 에러 */}
        {error && <p style={{ fontSize: "11px", color: "#ef4444", marginBottom: "12px", textAlign: "left" }}>{error}</p>}

        {/* 보안 안내 */}
        <p style={{ fontSize: "10px", color: "#d4d4d4", marginBottom: "16px" }}>
          키는 브라우저 메모리에만 존재하며, 저장되지 않습니다. 새로고침 시 사라집니다.
        </p>

        {/* 시작 버튼 */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%", padding: "14px", borderRadius: "12px",
            backgroundColor: detected ? "#0a0a0a" : "#e5e5e5",
            color: detected ? "#fff" : "#a3a3a3",
            fontSize: "14px", fontWeight: 700, border: "none",
            cursor: detected ? "pointer" : "not-allowed",
          }}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
