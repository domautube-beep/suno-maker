"use client";

import { useState, useEffect, useRef } from "react";
import { LYRICS_RULES } from "@/lib/lyricsRules";

interface LyricsSectionProps {
  // 자동 생성된 보컬 프로필 + 데모 가사 (generateDemo 결과)
  lyricsContent: string;
  // 생성된 Style of Music
  style: string;
  // 현재 설정된 언어
  language: string;
  // 현재 모든 입력 설정 (프롬프트에 포함)
  currentSettings?: Record<string, string>;
  onLyricsUpdate?: (lyrics: string) => void;
  onLanguageChange?: (lang: string) => void;
  onGenerateVariation?: () => void;
  trackNumber?: number;
}

export default function LyricsSection({
  lyricsContent,
  style,
  language,
  currentSettings,
  onLyricsUpdate,
  onLanguageChange,
  onGenerateVariation,
  trackNumber = 1,
}: LyricsSectionProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(lyricsContent);
  // 사용자가 Claude.ai에서 가사를 생성하고 붙여넣은 적이 있는지
  const [hasCustomLyrics, setHasCustomLyrics] = useState(false);
  // 가사 생성 후 설정이 변경되었는지
  const [settingsChanged, setSettingsChanged] = useState(false);
  // 설정 변경 감지용 — 가사 생성 시점의 설정 스냅샷
  const settingsSnapshotRef = useRef<string>("");
  // Claude.ai 붙여넣기 모드
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedLyrics, setPastedLyrics] = useState("");

  // 가사 내용 변경 시 편집값 동기화
  useEffect(() => {
    if (!isEditing) {
      setEditValue(lyricsContent);
    }
  }, [lyricsContent, isEditing]);

  // 설정 변경 감지
  useEffect(() => {
    if (!hasCustomLyrics) return;
    const currentSnapshot = JSON.stringify(currentSettings || {});
    if (settingsSnapshotRef.current && settingsSnapshotRef.current !== currentSnapshot) {
      setSettingsChanged(true);
    }
  }, [currentSettings, hasCustomLyrics]);

  // 복사
  const handleCopy = async () => {
    await navigator.clipboard.writeText(lyricsContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 편집 저장
  const handleSave = () => {
    onLyricsUpdate?.(editValue);
    setIsEditing(false);
  };

  // 설정 요약 텍스트 생성
  const buildSettingsSummary = () => {
    if (!currentSettings) return "";
    const lines: string[] = [];
    if (currentSettings.oneLiner) lines.push(`핵심 문장: "${currentSettings.oneLiner}"`);
    if (currentSettings.genre) lines.push(`장르: ${currentSettings.genre}`);
    if (currentSettings.vibe) lines.push(`느낌: ${currentSettings.vibe}`);
    if (currentSettings.era) lines.push(`시대: ${currentSettings.era}`);
    if (currentSettings.texture) lines.push(`질감: ${currentSettings.texture}`);
    if (currentSettings.tempo) lines.push(`템포: ${currentSettings.tempo}`);
    if (currentSettings.reverb) lines.push(`리버브: ${currentSettings.reverb}`);
    if (currentSettings.instruments) lines.push(`악기: ${currentSettings.instruments}`);
    if (currentSettings.vocal) lines.push(`보컬: ${currentSettings.vocal}`);
    return lines.join("\n");
  };

  // 가사 생성 프롬프트 — 모든 설정을 유기적으로 반영
  const buildLyricsPrompt = () => {
    // 보컬 프로필 명령어 추출
    const vocalCommands = lyricsContent.split("\n").filter((l: string) => l.startsWith("[")).join("\n");

    return [
      `아래 설정에 맞는 Suno v5.5용 가사를 작성해줘.`,
      ``,
      `=== 가사 작성 규칙 ===`,
      LYRICS_RULES,
      ``,
      `=== 사용자 설정 (이 설정이 가사의 톤/무드/어휘/리듬을 결정) ===`,
      buildSettingsSummary(),
      ``,
      `=== Style of Music (생성된 사운드 방향 — 가사의 리듬감과 밀도 참고) ===`,
      style,
      ``,
      `=== VOCAL PROFILE (보컬 설정 — 가사 상단에 그대로 포함) ===`,
      vocalCommands,
      ``,
      `=== 중요 지침 ===`,
      `1. 위 VOCAL PROFILE 명령어를 가사 맨 위에 그대로 포함해라.`,
      `2. 장르에 맞는 어휘와 리듬감으로 작성해라:`,
      `   - 힙합/랩: 라임, 펀치라인, 플로우 강화`,
      `   - 발라드: 감정적 서사, 긴 호흡의 서정적 문장`,
      `   - R&B: 리듬감 있는 반복, 그루브 있는 프레이징`,
      `   - EDM/댄스: 짧고 반복적인 훅, 에너지 상승 구조`,
      `   - 록: 선언적이고 강렬한 문장, 파워풀한 코러스`,
      `3. 시대감을 어휘에 반영해라 (90s → 아날로그 감성, 2020s → 트렌디한 표현)`,
      `4. 느낌/분위기가 가사 전체 톤을 지배해야 한다.`,
      `5. 보컬 딜리버리에 맞는 문장 길이와 호흡을 설계해라.`,
      ``,
      `가사 언어: ${language === "ko" ? "한국어" : language === "en" ? "English" : language === "ja" ? "日本語" : "한국어 + English 믹스"}`,
      ``,
      `VOCAL PROFILE 명령어를 맨 위에 두고, 그 아래에 섹션별 메타데이터 + 가사를 이어서 출력.`,
      `코드블록 없이 텍스트만 출력해.`,
    ].join("\n");
  };

  // Claude.ai에서 가사 생성
  const handleOpenClaude = async () => {
    const prompt = buildLyricsPrompt();

    // 프롬프트 클립보드 복사
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

    // 화면 나란히 배치
    try {
      const halfW = Math.floor(screen.width / 2);
      window.moveTo(0, 0);
      window.resizeTo(halfW, screen.height);
    } catch { /* 브라우저 제한 */ }

    const halfW = Math.floor(screen.width / 2);
    window.open("https://claude.ai/new", "claude-lyrics", `width=${halfW},height=${screen.height},left=${halfW},top=0`);

    // 붙여넣기 모드로 전환
    setPasteMode(true);
  };

  // 붙여넣은 가사 적용
  const handleApplyPasted = () => {
    if (pastedLyrics.trim()) {
      onLyricsUpdate?.(pastedLyrics);
      setHasCustomLyrics(true);
      setSettingsChanged(false);
      settingsSnapshotRef.current = JSON.stringify(currentSettings || {});
      setPasteMode(false);
      setPastedLyrics("");
    }
  };

  // 보컬 프로필 부분만 추출 ([] 명령어들)
  const vocalProfileLines = lyricsContent.split("\n").filter((l) => l.startsWith("[")).slice(0, 9);
  // 가사 본문 부분 추출 (보컬 프로필 이후)
  const lyricsBodyStart = lyricsContent.indexOf("\n[SECTION:");
  const lyricsBody = lyricsBodyStart > -1 ? lyricsContent.slice(lyricsBodyStart) : "";

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: "16px", overflow: "hidden" }}>
      {/* 헤더 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Lyrics</h3>
          <p style={{ fontSize: "11px", color: "#a3a3a3", marginTop: "2px" }}>Suno Lyrics 필드에 붙여넣기</p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {lyricsBody && (
            <button
              onClick={handleCopy}
              style={{
                padding: "6px 14px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600,
                backgroundColor: copied ? "#fff7ed" : "#fff",
                color: copied ? "#f97316" : "#a3a3a3",
                border: copied ? "1px solid rgba(249,115,22,0.3)" : "1px solid #e5e5e5",
                cursor: "pointer",
              }}
            >
              {copied ? "복사됨" : "복사"}
            </button>
          )}
        </div>
      </div>

      {/* 언어 선택 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>가사 언어</p>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { label: "한국어", value: "ko" },
            { label: "English", value: "en" },
            { label: "日本語", value: "ja" },
            { label: "한국어 + English", value: "mixed" },
          ].map((lang) => (
            <button
              key={lang.value}
              onClick={() => onLanguageChange?.(lang.value)}
              style={{
                flex: 1, padding: "8px", borderRadius: "9999px", fontSize: "12px",
                fontWeight: language === lang.value ? 600 : 400,
                backgroundColor: language === lang.value ? "#0a0a0a" : "#fff",
                color: language === lang.value ? "#fff" : "#a3a3a3",
                border: language === lang.value ? "1px solid #0a0a0a" : "1px solid #e5e5e5",
                cursor: "pointer",
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* 보컬 프로필 — 설정에 따라 자동 업데이트 */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5", backgroundColor: "#fafafa" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "#f97316", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Vocal Profile — 설정에 따라 자동 반영
        </p>
        <pre style={{ fontSize: "11px", color: "#525252", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
          {vocalProfileLines.join("\n")}
        </pre>
      </div>

      {/* 설정 변경 알림 */}
      {settingsChanged && hasCustomLyrics && (
        <div style={{ padding: "12px 20px", backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p style={{ fontSize: "11px", color: "#92400e" }}>설정이 변경되었습니다. 가사를 다시 생성하면 새 설정이 반영됩니다.</p>
        </div>
      )}

      {/* 메인 영역 */}
      <div style={{ padding: "20px" }}>
        {pasteMode ? (
          // Claude.ai에서 생성 후 붙여넣기
          <div>
            <div style={{ padding: "16px", backgroundColor: "#f0fdf4", borderRadius: "12px", marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#16a34a", marginBottom: "8px" }}>프롬프트가 복사되었습니다!</p>
              <ol style={{ fontSize: "12px", color: "#525252", lineHeight: "2", paddingLeft: "20px", margin: 0 }}>
                <li>오른쪽 <strong>Claude.ai</strong> 채팅창에 <strong>Ctrl+V</strong></li>
                <li>Claude가 가사를 생성하면 <strong>전체 선택 → 복사</strong></li>
                <li>아래 입력창에 <strong>붙여넣기</strong></li>
              </ol>
            </div>

            <textarea
              value={pastedLyrics}
              onChange={(e) => setPastedLyrics(e.target.value)}
              placeholder="Claude에서 생성된 가사를 여기에 붙여넣으세요..."
              style={{
                width: "100%", minHeight: "200px", border: "1px solid #e5e5e5", borderRadius: "12px",
                padding: "12px", fontSize: "12px", fontFamily: "monospace", resize: "vertical", outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                onClick={handleApplyPasted}
                disabled={!pastedLyrics.trim()}
                style={{
                  flex: 1, padding: "12px", borderRadius: "12px",
                  backgroundColor: pastedLyrics.trim() ? "#f97316" : "#e5e5e5",
                  color: pastedLyrics.trim() ? "#fff" : "#a3a3a3",
                  fontSize: "13px", fontWeight: 700, border: "none",
                  cursor: pastedLyrics.trim() ? "pointer" : "not-allowed",
                }}
              >
                가사 적용하기
              </button>
              <button
                onClick={() => setPasteMode(false)}
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", backgroundColor: "#fff", fontSize: "12px", color: "#737373", cursor: "pointer" }}
              >
                취소
              </button>
            </div>
          </div>
        ) : isEditing ? (
          // 직접 편집 모드
          <div>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{
                width: "100%", minHeight: "400px", border: "1px solid #e5e5e5", borderRadius: "12px",
                padding: "16px", fontSize: "12px", fontFamily: "monospace", resize: "vertical",
                outline: "none", lineHeight: "1.7",
              }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button onClick={handleSave}
                style={{ padding: "10px 20px", borderRadius: "10px", backgroundColor: "#0a0a0a", color: "#fff", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer" }}>
                저장
              </button>
              <button onClick={() => { setEditValue(lyricsContent); setIsEditing(false); }}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e5e5e5", backgroundColor: "#fff", fontSize: "12px", color: "#737373", cursor: "pointer" }}>
                취소
              </button>
            </div>
          </div>
        ) : (
          // 가사 보기 + 생성 버튼
          <div>
            {lyricsBody ? (
              <div>
                <pre style={{
                  fontSize: "12px", color: "#0a0a0a", whiteSpace: "pre-wrap",
                  lineHeight: "1.7", fontFamily: "monospace",
                  maxHeight: "400px", overflowY: "auto",
                }}>
                  {lyricsBody.trim()}
                </pre>
                <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                  <button onClick={handleOpenClaude}
                    style={{
                      padding: "10px 20px", borderRadius: "10px",
                      backgroundColor: "#f97316", color: "#fff",
                      fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    {hasCustomLyrics ? "가사 다시 생성" : "AI 가사 생성"}
                  </button>
                  <button onClick={() => setIsEditing(true)}
                    style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e5e5e5", backgroundColor: "#fff", fontSize: "12px", color: "#737373", cursor: "pointer" }}>
                    직접 편집
                  </button>
                </div>
              </div>
            ) : (
              // 가사가 없을 때
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontSize: "13px", color: "#525252", marginBottom: "16px" }}>
                  위 설정을 바탕으로 Claude가 가사를 생성합니다
                </p>
                <button onClick={handleOpenClaude}
                  style={{
                    padding: "14px 32px", borderRadius: "12px",
                    backgroundColor: "#f97316", color: "#fff",
                    fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: "8px",
                  }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  AI 가사 생성
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 비슷한 곡 더 만들기 */}
      {onGenerateVariation && (
        <div style={{ borderTop: "1px solid #e5e5e5", padding: "20px", background: "#fafafa" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              backgroundColor: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
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
              width: "100%", padding: "12px", borderRadius: "12px",
              backgroundColor: "#0a0a0a", color: "#fff",
              fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer",
            }}
          >
            비슷한 느낌으로 다음 곡 생성하기 →
          </button>
        </div>
      )}
    </div>
  );
}
