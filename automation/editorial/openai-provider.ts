import { editorialModelName, EDITORIAL_CONFIG, type EnvVars } from "./config";
import type { EditorialProvider, EditorialPromptInput, GeneratedCopy } from "./types";
import { redactSecrets } from "./from-candidate";
import { parseGeneratedCopyJson } from "./generated-copy";

/**
 * OpenAI Chat Completions provider.
 *
 * Official endpoint: POST https://api.openai.com/v1/chat/completions
 * Auth: Authorization: Bearer $OPENAI_API_KEY
 * Required body fields: model, messages
 *
 * The model is not asked to invent sourceUrl, DOI, Evidence, FieldId, or
 * study subjects. Those are copied from the locked candidate after
 * generation. Message JSON is schema-checked before use.
 */
export class OpenAIEditorialProvider implements EditorialProvider {
  readonly name = "openai" as const;
  readonly model: string;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options?: {
    apiKey?: string;
    model?: string;
    fetchImpl?: typeof fetch;
    env?: EnvVars;
  }) {
    const env = options?.env ?? process.env;
    const apiKey = options?.apiKey ?? env[EDITORIAL_CONFIG.apiKeyEnv]?.trim();
    if (!apiKey) {
      throw new Error(
        `${EDITORIAL_CONFIG.apiKeyEnv} is not set. Editorial draft generation did not run.`,
      );
    }
    this.apiKey = apiKey;
    this.model = options?.model ?? editorialModelName(env);
    this.fetchImpl = options?.fetchImpl ?? fetch;
  }

  async generate(input: EditorialPromptInput): Promise<GeneratedCopy> {
    const response = await this.fetchImpl(EDITORIAL_CONFIG.openaiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt(input) },
        ],
      }),
    });

    const rawText = await response.text();
    if (!response.ok) {
      throw new Error(
        `OpenAI API request failed (${response.status}): ${redactSecrets(rawText.slice(0, 500), this.apiKey)}`,
      );
    }

    let parsed: { choices?: Array<{ message?: { content?: string } }> };
    try {
      parsed = JSON.parse(rawText) as typeof parsed;
    } catch {
      throw new Error("OpenAI API returned a non-JSON body.");
    }

    const content = parsed.choices?.[0]?.message?.content;
    return parseGeneratedCopyJson(content ?? "");
  }
}

const SYSTEM_PROMPT = `You are an editorial assistant for Immortality Countdown.
Write bilingual research briefs from locked source-backed metadata.
Return a JSON object only, with keys: localizedFacts, en, ja, countdownImpact.

localizedFacts.en and localizedFacts.ja: studyDesign, populationOrModel, sampleSize (omit if the source does not state it), intervention (omit if none), outcomes, limitations, trialPhase (omit unless a trial registration states a phase), resultStatus.
Write separate English and Japanese fact copy. Do not paste English fact values into Japanese.
en and ja: headline, dek, whatHappened, whyItMatters, realityCheck.
countdownImpact: "none" only. Never "watch" or "moved". News must not change the LEV countdown.

Rules:
- Do not invent a source URL, DOI, Evidence level, field, or study species.
- Do not upgrade the provided Evidence.
- Write Japanese from the same locked numbers and identifiers, not as a literal translation of the English sentences.
- Keep numbers and units identical in English and Japanese, and only if they appear in the provided materials.
- Preserve negations (not significant, no association, failed, 有意差なし).
- Do not treat a trial registration as an efficacy result.
- Do not treat hasResults=false as posted results.
- Do not write a trial status or phase beyond the provided registry values.
- Do not treat observational findings as causal human outcomes.
- Do not generalize mouse, cell, or postmortem tissue findings into living-participant outcomes.
- realityCheck must be non-empty in both languages.
- No hype: breakthrough, cure, miracle, proven, revolutionary, reverses aging.`;

function userPrompt(input: EditorialPromptInput): string {
  return [
    `Title: ${input.title}`,
    input.abstract ? `Abstract: ${input.abstract}` : "Abstract: (not provided)",
    `Verified URL (do not change, do not output): ${input.sourceUrl}`,
    `DOI (do not change, do not output): ${input.doi ?? "(none)"}`,
    `FieldId (do not change, do not output): ${input.fieldId}`,
    `Evidence (do not upgrade, do not output): ${input.evidence}`,
    `Study subjects (do not change, do not output): ${input.studySubjects.join(", ") || "(unspecified)"}`,
    `Content type: ${input.contentType}`,
    `Published at: ${input.publishedAt}`,
    input.journal ? `Journal: ${input.journal}` : null,
    input.studyType ? `Study type: ${input.studyType}` : null,
    input.phases?.length ? `Trial phases: ${input.phases.join(", ")}` : null,
    input.overallStatus ? `Overall status: ${input.overallStatus}` : null,
    input.hasResults !== undefined ? `Has results: ${input.hasResults}` : null,
    input.studyFirstPostDate ? `Study first posted: ${input.studyFirstPostDate}` : null,
    input.lastUpdatePostDate ? `Last update posted: ${input.lastUpdatePostDate}` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}
