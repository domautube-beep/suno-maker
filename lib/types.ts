export interface ChatMessage {
  id: string;
  role: "bot" | "user";
  content: string;
  tooltip?: string;
  timestamp: number;
}

export interface SunoInput {
  oneLiner: string;
  vibe: string;
  genre: string;
  instruments: string;
  tempo: string;
  timeSignature: string;
  era: string;
  texture: string;
  vocal: string;
  reverb: string;
  language: string;
}

export interface SunoOutput {
  style: string;
  lyrics: string;
}

export interface PreviewSection {
  id: string;
  label: string;
  english: string;
  korean: string;
}

export type AppPhase = "chat" | "result";
