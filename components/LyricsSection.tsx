"use client";

import { useState } from "react";
import { LYRICS_RULES } from "@/lib/lyricsRules";

interface LyricsSectionProps {
  vocalProfile: string;
  style: string;
  onLyricsUpdate?: (lyrics: string) => void;
}

export default function LyricsSection({ vocalProfile, style, onLyricsUpdate }: LyricsSectionProps) {
  const [language, setLanguage] = useState("ko");
  const [lyrics, setLyrics] = useState("");
  const [showRules, setShowRules] = useState(false);

  // Claude에 보낼 가사 생성 프롬프트 조합
  const buildLyricsPrompt = () => {
    return [
      `아래 설정에 맞는 Suno v5.5용 가사를 작성해줘.`,
      ``,
      `=== 가사 작성 규칙 ===`,
      LYRICS_RULES,
      ``,
      `=== Style of Music (참고) ===`,
      style,
      ``,
      `=== VOCAL PROFILE (가사 상단에 포함) ===`,
      vocalProfile.split("\n").filter((l) => l.startsWith("[")).join("\n"),
      ``,
      `=== 설정 ===`,
      `가사 언어: ${language === "ko" ? "한국어" : language === "en" ? "English" : "한국어 + English 믹스"}`,
      ``,
      `위 규칙과 설정에 맞게 VOCAL PROFILE + 전체 가사를 Suno Lyrics 필드에 바로 붙여넣을 수 있는 형태로 출력해줘.`,
    ].join("\n");
  };

  const handleGenerateWithClaude = async () => {
    const prompt = buildLyricsPrompt();

    // 클립보드에 복사
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    // claude.ai 열기
    window.open("https://claude.ai/new", "_blank");

    alert("가사 생성 프롬프트가 복사되었습니다.\nClaude 채팅창에 붙여넣기(Ctrl+V) 하세요.\n\n생성된 가사를 아래 입력창에 붙여넣으면 됩니다.");
  };

  const handlePasteLyrics = () => {
    if (lyrics.trim()) {
      onLyricsUpdate?.(lyrics);
    }
  };

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: "16px", overflow: "hidden" }}>
      {/* 헤더 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Lyrics</h3>
          <p style={{ fontSize: "11px", color: "#a3a3a3", marginTop: "2px" }}>Suno 'Lyrics' 필드에 붙여넣기</p>
        </div>
        <button
          onClick={() => setShowRules(!showRules)}
          style={{ fontSize: "10px", color: "#f97316", border: "1px solid #f97316", borderRadius: "9999px", padding: "4px 12px", backgroundColor: "#fff", cursor: "pointer" }}
        >
          {showRules ? "규칙 닫기" : "작성 규칙 보기"}
        </button>
      </div>

      {/* 가사 작성 규칙 (토글) */}
      {showRules && (
        <div style={{ padding: "16px 20px", backgroundColor: "#fff7ed", borderBottom: "1px solid #e5e5e5" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, color: "#f97316", marginBottom: "8px" }}>가사 작성 규칙</p>
          <pre style={{ fontSize: "11px", color: "#525252", whiteSpace: "pre-wrap", lineHeight: "1.6", maxHeight: "300px", overflowY: "auto" }}>
            {LYRICS_RULES}
          </pre>
        </div>
      )}

      {/* 언어 선택 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>가사 언어</p>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { label: "한국어", value: "ko" },
            { label: "English", value: "en" },
            { label: "한국어 + English", value: "mixed" },
          ].map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: language === lang.value ? 600 : 400,
                backgroundColor: language === lang.value ? "#0a0a0a" : "#fafafa",
                color: language === lang.value ? "#fff" : "#525252",
                border: "1px solid #e5e5e5",
                cursor: "pointer",
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* 가사 생성 or 입력 영역 */}
      <div style={{ padding: "20px" }}>
        {!lyrics.trim() ? (
          // 가사 아직 없음 → 생성 버튼
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <button
              onClick={handleGenerateWithClaude}
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
                marginBottom: "12px",
              }}
              className="hover:opacity-90 transition-all"
            >
              Claude에서 가사 생성하기 →
            </button>
            <p style={{ fontSize: "11px", color: "#a3a3a3" }}>
              프롬프트가 클립보드에 복사되고 claude.ai가 열립니다
            </p>

            <div style={{ marginTop: "20px", borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>생성된 가사 붙여넣기</p>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Claude에서 생성된 가사를 여기에 붙여넣으세요..."
                style={{
                  width: "100%",
                  minHeight: "150px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "12px",
                  padding: "12px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  resize: "vertical",
                  outline: "none",
                }}
              />
              <button
                onClick={handlePasteLyrics}
                disabled={!lyrics.trim()}
                style={{
                  marginTop: "8px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "12px",
                  backgroundColor: lyrics.trim() ? "#0a0a0a" : "#e5e5e5",
                  color: lyrics.trim() ? "#fff" : "#a3a3a3",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: lyrics.trim() ? "pointer" : "not-allowed",
                }}
              >
                가사 적용하기
              </button>
            </div>
          </div>
        ) : (
          // 가사 있음 → 표시 + 편집/복사
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginBottom: "8px" }}>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(lyrics);
                  alert("복사되었습니다!");
                }}
                style={{ fontSize: "11px", color: "#a3a3a3", border: "1px solid #e5e5e5", borderRadius: "9999px", padding: "4px 12px", backgroundColor: "#fff", cursor: "pointer" }}
              >
                복사
              </button>
              <button
                onClick={() => setLyrics("")}
                style={{ fontSize: "11px", color: "#a3a3a3", border: "1px solid #e5e5e5", borderRadius: "9999px", padding: "4px 12px", backgroundColor: "#fff", cursor: "pointer" }}
              >
                다시 생성
              </button>
            </div>
            <pre style={{ fontSize: "12px", color: "#0a0a0a", whiteSpace: "pre-wrap", lineHeight: "1.7", fontFamily: "monospace" }}>
              {lyrics}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
