import params from "@/lev/params.json";
import { FIELD_IDS, type FieldId } from "@/lib/fields";

/**
 * Read-only view of the published model inputs used by the website UI.
 *
 * lev/params.json remains the only human-edited numeric source of truth.
 * This module exposes values but intentionally provides no mutation helpers.
 */
export type ModelFieldSnapshot = {
  id: FieldId;
  label: string;
  score: number;
  rationale: string;
  lastReviewed: string;
};

const modelFieldById = new Map(
  params.fields.map((field) => [field.id, field] as const)
);

// Fail loudly during build/test if the model and UI taxonomy ever separate.
for (const id of FIELD_IDS) {
  if (!modelFieldById.has(id)) {
    throw new Error(`lev/params.json is missing canonical field: ${id}`);
  }
}

export function getFieldModel(id: FieldId): ModelFieldSnapshot {
  const field = modelFieldById.get(id);
  if (!field) {
    throw new Error(`Unknown model field: ${id}`);
  }

  return {
    id,
    label: field.label,
    score: field.score,
    rationale: field.rationale,
    lastReviewed: field.lastReviewed,
  };
}

export const REGULATORY_READINESS = {
  id: params.regulatory.id,
  label: params.regulatory.label,
  score: params.regulatory.score,
  rationale: params.regulatory.rationale,
  lastReviewed: params.regulatory.lastReviewed,
} as const;

// These are assertions about model integrity, not additional model inputs.
if (REGULATORY_READINESS.score < 0 || REGULATORY_READINESS.score > 100) {
  throw new Error("Regulatory readiness score must be between 0 and 100");
}

for (const id of FIELD_IDS) {
  const score = getFieldModel(id).score;
  if (score < 0 || score > 100) {
    throw new Error(`${id}: readiness score must be between 0 and 100`);
  }
}
