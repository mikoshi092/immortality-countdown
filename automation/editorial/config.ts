/**
 * Single place for editorial generation settings.
 *
 * Secrets are never stored here. OPENAI_API_KEY is read from the
 * environment by the OpenAI provider.
 *
 * Chat Completions endpoint (confirmed against OpenAI's API reference):
 * POST https://api.openai.com/v1/chat/completions
 */
export type EnvVars = Record<string, string | undefined>;

export const EDITORIAL_CONFIG = {
  openaiUrl: "https://api.openai.com/v1/chat/completions",
  defaultModel: "gpt-4o-mini",
  modelEnv: "EDITORIAL_MODEL",
  apiKeyEnv: "OPENAI_API_KEY",
  providerEnv: "EDITORIAL_PROVIDER",
} as const;

export function editorialModelName(env: EnvVars = process.env): string {
  const fromEnv = env[EDITORIAL_CONFIG.modelEnv]?.trim();
  return fromEnv && fromEnv.length > 0
    ? fromEnv
    : EDITORIAL_CONFIG.defaultModel;
}
