// A centralized place for API error message keys to ensure consistency.
// These keys correspond to entries in the translation files (e.g., en.json, vi.json).
export const ApiErrorKeys = {
  // --- Client-Side Errors ---
  NetworkError: "errors.networkError",
  InvalidResponse: "errors.invalidResponse", // For when the server response is malformed

  // --- Server-Side / Gemini API Errors (propagated from backend) ---
  ApiKeyMissing: "errors.apiKeyMissing",
  ApiKeyInvalid: "errors.apiKeyInvalid",
  ImageGenFailed: "errors.imageGen",
  VideoGenFailed: "errors.videoGen",
  QuotaExceeded: "errors.quotaExceeded",
  PromptRejected: "errors.promptRejected",
  ServerUnavailable: "errors.serverUnavailable",
  
  // --- Feature-Specific Errors ---
  ChannelGenFailed: "errors.channelGen",
  MarketAnalysisFailed: "errors.marketAnalysis",
  ReconFailed: "errors.reconFailed",
  SeoAnalysisFailed: "errors.seoAnalysisFailed",
  
  // --- Fallback ---
  Generic: "errors.generic",
} as const;
