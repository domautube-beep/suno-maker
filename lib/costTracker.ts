// API 비용 추정기
// 문자 수 기반 토큰 추정 → 비용 계산
// 한국어는 영어보다 토큰 효율이 낮으므로 1.5배 보정

// 2026년 기준 대략 가격 (1M 토큰당 USD)
const PRICING: Record<string, { input: number; output: number }> = {
  claude: { input: 3, output: 15 },    // Claude Sonnet
  openai: { input: 2.5, output: 10 },  // GPT-4o
  gemini: { input: 0.075, output: 0.3 }, // Gemini Flash
};

// 문자 수 → 토큰 추정 (한국어 보정)
function estimateTokens(text: string): number {
  const koreanChars = (text.match(/[가-힣]/g) || []).length;
  const otherChars = text.length - koreanChars;
  // 한국어: ~1.5 토큰/글자, 영어: ~0.25 토큰/글자
  return Math.ceil(koreanChars * 1.5 + otherChars * 0.25);
}

export interface CostEntry {
  inputChars: number;
  outputChars: number;
  inputTokens: number;
  outputTokens: number;
  provider: string;
  costUsd: number;
}

export function calculateCost(
  inputText: string,
  outputText: string,
  provider: string
): CostEntry {
  const inputTokens = estimateTokens(inputText);
  const outputTokens = estimateTokens(outputText);
  const price = PRICING[provider] || PRICING.claude;
  const costUsd = (inputTokens * price.input + outputTokens * price.output) / 1_000_000;

  return {
    inputChars: inputText.length,
    outputChars: outputText.length,
    inputTokens,
    outputTokens,
    provider,
    costUsd,
  };
}

export function formatCost(totalUsd: number): string {
  if (totalUsd < 0.01) return `$${totalUsd.toFixed(4)}`;
  return `$${totalUsd.toFixed(3)}`;
}

export function formatKrw(totalUsd: number): string {
  const krw = Math.ceil(totalUsd * 1400);
  return `약 ${krw.toLocaleString()}원`;
}
