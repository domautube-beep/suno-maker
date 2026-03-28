"use client";

import { useState, useEffect } from "react";
import { LYRICS_RULES } from "@/lib/lyricsRules";

interface LyricsSectionProps {
  vocalProfile: string;
  style: string;
  onLyricsUpdate?: (lyrics: string) => void;
}

export default function LyricsSection({ vocalProfile, style, onLyricsUpdate }: LyricsSectionProps) {
  const [language, setLanguage] = useState("ko");
  const [lyrics, setLyrics] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [mode, setMode] = useState<"select" | "claude" | "api">("select");

  // localStorage에서 API 키 로드
  useEffect(() => {
    const saved = localStorage.getItem("r3alaude_api_key");
    if (saved) setApiKey(saved);
  }, []);

  // API 키 저장
  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("r3alaude_api_key", key);
  };

  // 가사 생성 프롬프트 조합
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
      vocalProfile.split("\n").filter((l: string) => l.startsWith("[")).join("\n"),
      ``,
      `=== 설정 ===`,
      `가사 언어: ${language === "ko" ? "한국어" : language === "en" ? "English" : "한국어 + English 믹스"}`,
      ``,
      `위 규칙과 설정에 맞게 VOCAL PROFILE + 전체 가사를 Suno Lyrics 필드에 바로 붙여넣을 수 있는 형태로 출력해줘.`,
    ].join("\n");
  };

  // 방법 1: Claude.ai 나란히 열기
  const handleOpenClaude = async () => {
    const prompt = buildLyricsPrompt();

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

    // 현재 창 왼쪽으로
    try {
      const halfW = Math.floor(screen.width / 2);
      window.moveTo(0, 0);
      window.resizeTo(halfW, screen.height);
    } catch {
      // 일부 브라우저에서 차단될 수 있음
    }

    // Claude.ai 오른쪽에 열기
    const halfW = Math.floor(screen.width / 2);
    window.open(
      "https://claude.ai/new",
      "claude-lyrics",
      `width=${halfW},height=${screen.height},left=${halfW},top=0`
    );

    setMode("claude");
  };

  // 방법 2: API로 직접 생성
  const handleGenerateWithApi = async () => {
    if (!apiKey) { setShowApiInput(true); return; }

    setGenerating(true);
    try {
      const res = await fetch("/api/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildLyricsPrompt(),
          apiKey,
        }),
      });
      const data = await res.json();
      if (data.lyrics) {
        setLyrics(data.lyrics);
        onLyricsUpdate?.(data.lyrics);
      } else if (data.error) {
        alert(`오류: ${data.error}`);
      }
    } catch (err) {
      alert("API 호출 실패. API 키를 확인해주세요.");
    }
    setGenerating(false);
  };

  // 가사 적용
  const handleApplyLyrics = () => {
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
          <p style={{ fontSize: "11px", color: "#a3a3a3", marginTop: "2px" }}>Suno Lyrics 필드에 붙여넣기</p>
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
                flex: 1, padding: "8px", borderRadius: "9999px", fontSize: "12px",
                fontWeight: language === lang.value ? 600 : 400,
                backgroundColor: language === lang.value ? "#0a0a0a" : "#fafafa",
                color: language === lang.value ? "#fff" : "#525252",
                border: "1px solid #e5e5e5", cursor: "pointer",
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* 메인 영역 */}
      <div style={{ padding: "20px" }}>
        {lyrics.trim() ? (
          // 가사 있음 → 표시
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginBottom: "8px" }}>
              <button onClick={async () => { await navigator.clipboard.writeText(lyrics); alert("복사되었습니다!"); }}
                style={{ fontSize: "11px", color: "#a3a3a3", border: "1px solid #e5e5e5", borderRadius: "9999px", padding: "4px 12px", backgroundColor: "#fff", cursor: "pointer" }}>
                복사
              </button>
              <button onClick={() => { setLyrics(""); setMode("select"); }}
                style={{ fontSize: "11px", color: "#a3a3a3", border: "1px solid #e5e5e5", borderRadius: "9999px", padding: "4px 12px", backgroundColor: "#fff", cursor: "pointer" }}>
                다시 생성
              </button>
            </div>
            <pre style={{ fontSize: "12px", color: "#0a0a0a", whiteSpace: "pre-wrap", lineHeight: "1.7", fontFamily: "monospace" }}>
              {lyrics}
            </pre>
          </div>
        ) : mode === "select" ? (
          // 방법 선택
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* 방법 1: Claude.ai */}
            <button
              onClick={handleOpenClaude}
              style={{
                padding: "16px", borderRadius: "12px", backgroundColor: "#f97316",
                color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
              className="hover:opacity-90 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
              Claude.ai에서 가사 생성 (무료)
            </button>
            <p style={{ fontSize: "10px", color: "#a3a3a3", textAlign: "center", marginTop: "-4px" }}>
              화면이 나란히 열리고, 프롬프트가 자동 복사됩니다. 붙여넣기만 하세요.
            </p>

            {/* 구분선 */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e5e5" }} />
              <span style={{ fontSize: "11px", color: "#a3a3a3" }}>또는</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e5e5" }} />
            </div>

            {/* 방법 2: API */}
            <button
              onClick={() => apiKey ? handleGenerateWithApi() : setShowApiInput(true)}
              style={{
                padding: "14px", borderRadius: "12px",
                backgroundColor: "#0a0a0a", color: "#fff",
                fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
              className="hover:opacity-80 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
              {apiKey ? "API로 자동 생성 (원클릭)" : "API 키 입력하고 자동 생성"}
            </button>
            {apiKey && (
              <p style={{ fontSize: "10px", color: "#22c55e", textAlign: "center", marginTop: "-4px" }}>
                API 키 저장됨. 버튼 하나로 가사가 자동 생성됩니다.
              </p>
            )}

            {/* API 키 입력 */}
            {showApiInput && (
              <div style={{ padding: "12px", border: "1px solid #e5e5e5", borderRadius: "12px", backgroundColor: "#fafafa" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, marginBottom: "8px" }}>Anthropic API 키</p>
                <p style={{ fontSize: "10px", color: "#737373", marginBottom: "8px" }}>
                  console.anthropic.com에서 발급. 브라우저에만 저장되며 서버에 전송되지 않습니다.
                </p>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    defaultValue={apiKey}
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e5e5",
                      fontSize: "12px", fontFamily: "monospace", outline: "none",
                    }}
                    onChange={(e) => saveApiKey(e.target.value)}
                  />
                  <button
                    onClick={() => { setShowApiInput(false); if (apiKey) handleGenerateWithApi(); }}
                    style={{
                      padding: "8px 16px", borderRadius: "8px", backgroundColor: "#0a0a0a",
                      color: "#fff", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer",
                    }}
                  >
                    저장
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : mode === "claude" ? (
          // Claude.ai로 생성 후 붙여넣기 안내
          <div>
            <div style={{ padding: "16px", backgroundColor: "#f0fdf4", borderRadius: "12px", marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#16a34a", marginBottom: "8px" }}>가사 생성 프롬프트가 복사되었습니다!</p>
              <ol style={{ fontSize: "12px", color: "#525252", lineHeight: "2", paddingLeft: "20px", margin: 0 }}>
                <li>오른쪽에 열린 <strong>Claude.ai</strong> 채팅창에 <strong>Ctrl+V</strong> (붙여넣기)</li>
                <li>Claude가 가사를 생성하면 <strong>전체 선택 → 복사</strong></li>
                <li>아래 입력창에 <strong>붙여넣기</strong></li>
              </ol>
            </div>

            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Claude에서 생성된 가사를 여기에 붙여넣으세요..."
              style={{
                width: "100%", minHeight: "200px", border: "1px solid #e5e5e5", borderRadius: "12px",
                padding: "12px", fontSize: "12px", fontFamily: "monospace", resize: "vertical", outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                onClick={handleApplyLyrics}
                disabled={!lyrics.trim()}
                style={{
                  flex: 1, padding: "12px", borderRadius: "12px",
                  backgroundColor: lyrics.trim() ? "#f97316" : "#e5e5e5",
                  color: lyrics.trim() ? "#fff" : "#a3a3a3",
                  fontSize: "13px", fontWeight: 700, border: "none",
                  cursor: lyrics.trim() ? "pointer" : "not-allowed",
                }}
              >
                가사 적용하기
              </button>
              <button
                onClick={() => setMode("select")}
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", backgroundColor: "#fff", fontSize: "12px", color: "#737373", cursor: "pointer" }}
              >
                뒤로
              </button>
            </div>
          </div>
        ) : null}

        {/* 로딩 */}
        {generating && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <svg className="animate-spin" style={{ margin: "0 auto 12px" }} width="24" height="24" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="4" fill="none" />
              <path style={{ opacity: 0.75 }} fill="#f97316" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p style={{ fontSize: "13px", color: "#f97316", fontWeight: 600 }}>가사 생성 중...</p>
          </div>
        )}
      </div>
    </div>
  );
}
