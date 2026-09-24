import type { IngestReport } from "../types";
import type { EditorialReport } from "../editorial/types";
import { editorialSchemaErrors, ingestSchemaErrors } from "./schema";

export type PublishDecision =
  | { ok: true; publishCount: number }
  | { ok: false; reason: string; failWorkflow: boolean };

export function decidePublish(input: {
  ingest: IngestReport;
  editorial: EditorialReport;
  changedPaths: string[];
  protectedChanged: string[];
  mergeConflict?: boolean;
}): PublishDecision {
  const schemaErrors = [
    ...ingestSchemaErrors(input.ingest),
    ...editorialSchemaErrors(input.editorial),
  ];
  if (schemaErrors.length > 0) {
    return {
      ok: false,
      reason: `schema validation failed: ${schemaErrors.join("; ")}`,
      failWorkflow: true,
    };
  }

  if (input.editorial.drafts.some((draft) => draft.countdownImpact !== "none")) {
    return {
      ok: false,
      reason: "countdownImpact must be none",
      failWorkflow: true,
    };
  }

  if (input.mergeConflict) {
    return {
      ok: false,
      reason: "merge conflict",
      failWorkflow: true,
    };
  }

  const incomplete = input.ingest.sourceResults.some(
    (source) => source.status !== "ok",
  );
  if (incomplete) {
    return {
      ok: false,
      reason: "source fetch was partial or failed",
      failWorkflow: true,
    };
  }

  if (input.protectedChanged.length > 0) {
    return {
      ok: false,
      reason: `protected file changed: ${input.protectedChanged.join(", ")}`,
      failWorkflow: true,
    };
  }

  if (input.editorial.counts.drafts === 0) {
    return {
      ok: false,
      reason:
        input.editorial.counts.held > 0
          ? "held drafts only; nothing passed the publish gate"
          : "no drafts passed the publish gate",
      failWorkflow: false,
    };
  }

  return { ok: true, publishCount: input.editorial.counts.drafts };
}
