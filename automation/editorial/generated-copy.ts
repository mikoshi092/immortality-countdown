import { type ArticleCopy, type ArticleFacts, type CountdownImpact } from "../../data/articles";
import type { GeneratedCopy } from "./types";

export class InvalidGeneratedCopyError extends Error {
  readonly reasons: string[];

  constructor(reasons: string[]) {
    super(reasons.join("; ") || "Generated copy failed schema validation.");
    this.name = "InvalidGeneratedCopyError";
    this.reasons = reasons;
  }
}

const COPY_KEYS = [
  "headline",
  "dek",
  "whatHappened",
  "whyItMatters",
  "realityCheck",
] as const satisfies readonly (keyof ArticleCopy)[];

const REQUIRED_FACT_KEYS = [
  "studyDesign",
  "populationOrModel",
  "outcomes",
  "limitations",
  "resultStatus",
] as const satisfies readonly (keyof ArticleFacts)[];

const OPTIONAL_FACT_KEYS = [
  "sampleSize",
  "intervention",
  "trialPhase",
] as const satisfies readonly (keyof ArticleFacts)[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, path: string, reasons: string[]): string {
  if (typeof value !== "string") {
    reasons.push(`${path} must be a string`);
    return "";
  }
  return value;
}

function readCopy(value: unknown, path: string, reasons: string[]): ArticleCopy {
  if (!isRecord(value)) {
    reasons.push(`${path} must be an object`);
    return {
      headline: "",
      dek: "",
      whatHappened: "",
      whyItMatters: "",
      realityCheck: "",
    };
  }
  const copy = {} as ArticleCopy;
  for (const key of COPY_KEYS) {
    copy[key] = readString(value[key], `${path}.${key}`, reasons);
  }
  return copy;
}

function readFacts(value: unknown, path: string, reasons: string[]): ArticleFacts {
  if (!isRecord(value)) {
    reasons.push(`${path} must be an object`);
    return {
      studyDesign: "",
      populationOrModel: "",
      outcomes: "",
      limitations: "",
      resultStatus: "",
    };
  }
  const facts: ArticleFacts = {
    studyDesign: "",
    populationOrModel: "",
    outcomes: "",
    limitations: "",
    resultStatus: "",
  };
  for (const key of REQUIRED_FACT_KEYS) {
    facts[key] = readString(value[key], `${path}.${key}`, reasons);
  }
  for (const key of OPTIONAL_FACT_KEYS) {
    if (value[key] === undefined) continue;
    const text = readString(value[key], `${path}.${key}`, reasons);
    if (text) facts[key] = text;
  }
  return facts;
}

export function parseGeneratedCopy(value: unknown): GeneratedCopy {
  const reasons: string[] = [];
  if (!isRecord(value)) {
    throw new InvalidGeneratedCopyError(["generated copy must be a JSON object"]);
  }

  const impact = value.countdownImpact;
  if (impact === "moved") {
    reasons.push('countdownImpact "moved" is not allowed');
  } else if (impact !== "none") {
    reasons.push("countdownImpact must be none");
  }

  const localized = isRecord(value.localizedFacts) ? value.localizedFacts : null;
  if (!localized) {
    reasons.push("localizedFacts must be an object with en and ja");
  }

  const en = readCopy(value.en, "en", reasons);
  const ja = readCopy(value.ja, "ja", reasons);
  const localizedFacts = {
    en: readFacts(localized?.en, "localizedFacts.en", reasons),
    ja: readFacts(localized?.ja, "localizedFacts.ja", reasons),
  };

  if (reasons.length > 0) {
    throw new InvalidGeneratedCopyError(reasons);
  }

  return {
    localizedFacts,
    en,
    ja,
    countdownImpact: impact as CountdownImpact,
  };
}

export function parseGeneratedCopyJson(content: string): GeneratedCopy {
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new InvalidGeneratedCopyError(["OpenAI API returned no message content."]);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new InvalidGeneratedCopyError([
      "OpenAI API returned message content that was not JSON.",
    ]);
  }
  return parseGeneratedCopy(parsed);
}
