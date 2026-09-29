import type { EditorialReport } from "../editorial/types";
import type { IngestReport } from "../types";

const FETCH_STATUSES = new Set(["ok", "partial", "failed"]);
const PROVIDERS = new Set(["openai", "mock"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function ingestSchemaErrors(ingest: IngestReport): string[] {
  const errors: string[] = [];
  if (!isRecord(ingest)) return ["ingest report is not an object"];
  if (typeof ingest.generatedAt !== "string" || ingest.generatedAt.length === 0) {
    errors.push("ingest generatedAt is missing");
  }
  if (!Array.isArray(ingest.sourceResults)) {
    errors.push("ingest sourceResults is missing");
    return errors;
  }
  ingest.sourceResults.forEach((source, index) => {
    if (!isRecord(source) || typeof source.sourceId !== "string") {
      errors.push(`ingest sourceResults[${index}] is incomplete`);
      return;
    }
    if (typeof source.status !== "string" || !FETCH_STATUSES.has(source.status)) {
      errors.push(`ingest source ${source.sourceId} status is undetermined`);
    }
  });
  if (!isRecord(ingest.counts)) {
    errors.push("ingest counts are missing");
  }
  if (!Array.isArray(ingest.candidates) || !Array.isArray(ingest.rejected)) {
    errors.push("ingest candidates or rejected list is missing");
  }
  return errors;
}

export function editorialSchemaErrors(editorial: EditorialReport): string[] {
  const errors: string[] = [];
  if (!isRecord(editorial)) return ["editorial report is not an object"];
  if (typeof editorial.provider !== "string" || !PROVIDERS.has(editorial.provider)) {
    errors.push("editorial provider is missing or unknown");
  }
  if (typeof editorial.generatedAt !== "string" || editorial.generatedAt.length === 0) {
    errors.push("editorial generatedAt is missing");
  }
  const counts = editorial.counts;
  if (
    !isRecord(counts) ||
    typeof counts.drafts !== "number" ||
    typeof counts.held !== "number" ||
    typeof counts.rejected !== "number" ||
    typeof counts.candidates !== "number"
  ) {
    errors.push("editorial counts are missing");
  }
  if (!Array.isArray(editorial.drafts) || !Array.isArray(editorial.rejectedDrafts)) {
    errors.push("editorial draft arrays are missing");
    return errors;
  }
  if (isRecord(counts)) {
    if (counts.drafts !== editorial.drafts.length) {
      errors.push("editorial draft count does not match drafts");
    }
    const held = editorial.rejectedDrafts.filter((item) => item?.status === "held").length;
    const rejected = editorial.rejectedDrafts.filter((item) => item?.status === "rejected").length;
    if (counts.held !== held) errors.push("editorial held count does not match");
    if (counts.rejected !== rejected) errors.push("editorial rejected count does not match");
  }
  editorial.drafts.forEach((draft, index) => {
    if (!isRecord(draft) || typeof draft.sourceUrl !== "string" || !draft.en || !draft.ja) {
      errors.push(`editorial drafts[${index}] is incomplete`);
      return;
    }
    if (draft.countdownImpact !== "none") {
      errors.push(`editorial drafts[${index}] countdownImpact must be none`);
    }
  });
  editorial.rejectedDrafts.forEach((item, index) => {
    if (!isRecord(item) || !Array.isArray(item.reasons) || (item.status !== "held" && item.status !== "rejected")) {
      errors.push(`editorial rejectedDrafts[${index}] is incomplete`);
    }
  });
  return errors;
}
