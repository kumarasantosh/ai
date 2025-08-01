// estimateCost.js

/**
 * Estimates tokens and pricing for gpt-4o-mini
 * @param {string} content - The text content to evaluate
 * @param {number} exchangeRate - USD to INR conversion rate (default: 83)
 */
export function estimateGpt4oMiniCost(content, exchangeRate = 83) {
  // Approximate: 1 token ≈ 0.75 words
  const words = content.trim().split(/\s+/).length;
  const outputTokens = Math.ceil(words / 0.75);

  const inputTokens = 100; // Assume a fixed system + user prompt
  const totalTokens = inputTokens + outputTokens;

  const inputCostUSD = (inputTokens / 1000) * 0.00025;
  const outputCostUSD = (outputTokens / 1000) * 0.0005;
  const totalCostUSD = inputCostUSD + outputCostUSD;

  const totalCostINR = totalCostUSD * exchangeRate;

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    costUSD: totalCostUSD.toFixed(6),
    costINR: totalCostINR.toFixed(4),
  };
}
