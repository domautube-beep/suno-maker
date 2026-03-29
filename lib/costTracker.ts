// API 비용 추정기
// 문자 수 기반 토큰 추정 → 비용 계산

// 2026년 기준 가격 (1M 토큰당 USD)
const PRICING: Record<string, { input: number; output: number }> = {
  // Claude
  "claude-opus": { input: 15, output: 75 },
  "claude-sonnet": { input: 3, output: 15 },
  claude: { input: 3, output: 15 }, // 기본값 = Sonnet
  // OpenAI
  openai: { input: 2.5, output: 10 },
  // Gemini
  gemini: { input: 0.075, output: 0.3 },
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
  model: string;
  costUsd: number;
}

export function calculateCost(
  inputText: string,
  outputText: string,
  provider: string,
  model: "opus" | "sonnet" | "default" = "default"
): CostEntry {
  // 모델별 가격 키 결정
  let priceKey = provider;
  if (provider === "claude" && model === "opus") priceKey = "claude-opus";
  else if (provider === "claude" && model === "sonnet") priceKey = "claude-sonnet";

  const inputTokens = estimateTokens(inputText);
  const outputTokens = estimateTokens(outputText);
  const price = PRICING[priceKey] || PRICING.claude;
  const costUsd = (inputTokens * price.input + outputTokens * price.output) / 1_000_000;

  return {
    inputChars: inputText.length,
    outputChars: outputText.length,
    inputTokens,
    outputTokens,
    model: priceKey,
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
