/**
 * Apply passing editorial drafts to data/articles.ts.
 *
 * Does not push, open a PR, or write lev/params.json / lev/forecast.json.
 * GitHub Actions creates the article-only branch and PR after this step.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { IngestReport } from "../types";
import type { EditorialReport } from "../editorial/types";
import { redactSecrets } from "../editorial/from-candidate";
import { EDITORIAL_CONFIG } from "../editorial/config";
import { applyDraftsToArticles } from "./apply";
import { decidePublish } from "./policy";
import { protectedChangedPaths } from "./paths";
import { publishJobSummary, type PublishReport } from "./report";
import { autoPublishPrBody } from "./pr-body";

const here = dirname(fileURLToPath(import.meta.url));
const defaultIngestPath = join(here, "../output", "candidates.json");
const defaultEditorialPath = join(here, "../output", "editorial-drafts.json");
const defaultReportPath = join(here, "../output", "publish-report.json");
const defaultPrBodyPath = join(here, "../output", "pr-body.md");

export type RunPublishOptions = {
  ingestPath?: string;
  editorialPath?: string;
  articlesPath?: string;
  reportPath?: string;
  prBodyPath?: string;
  changedPaths?: string[];
  now?: Date;
  write?: boolean;
};

export function runPublish(options: RunPublishOptions = {}): PublishReport {
  const now = options.now ?? new Date();
  const ingest = JSON.parse(
    readFileSync(options.ingestPath ?? defaultIngestPath, "utf8"),
  ) as IngestReport;
  const editorial = JSON.parse(
    readFileSync(options.editorialPath ?? defaultEditorialPath, "utf8"),
  ) as EditorialReport;
  const changedPaths = options.changedPaths ?? [];
  const protectedChanged = protectedChangedPaths(changedPaths);

  const decision = decidePublish({
    ingest,
    editorial,
    changedPaths,
    protectedChanged,
  });

  const report: PublishReport = {
    generatedAt: now.toISOString(),
    scheduledListingAt: now.toISOString(),
    decision,
    ingest: {
      counts: ingest.counts,
      sourceResults: ingest.sourceResults,
    },
    editorial: {
      ...editorial.counts,
      heldReasons: editorial.rejectedDrafts
        .filter((item) => item.status === "held")
        .map((item) => ({ title: item.title, reasons: item.reasons })),
    },
    changedPaths,
    protectedChanged,
  };

  if (!decision.ok) {
    writeOutputs(report, editorial, options, now);
    if (decision.failWorkflow) {
      throw new Error(decision.reason);
    }
    return report;
  }

  const apply = applyDraftsToArticles(editorial.drafts, now, {
    articlesPath: options.articlesPath,
  });
  report.apply = { added: apply.added, skipped: apply.skipped };
  if (apply.added.length === 0) {
    report.decision = {
      ok: false,
      reason: "held drafts only; nothing passed the publish gate",
      failWorkflow: false,
    };
  }

  writeOutputs(report, editorial, options, now, apply);
  return report;
}

function writeOutputs(
  report: PublishReport,
  editorial: EditorialReport,
  options: RunPublishOptions,
  now: Date,
  apply?: ReturnType<typeof applyDraftsToArticles>,
): void {
  if (options.write === false) return;
  const reportPath = options.reportPath ?? defaultReportPath;
  const prBodyPath = options.prBodyPath ?? defaultPrBodyPath;
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  if (apply && report.decision.ok) {
    writeFileSync(
      prBodyPath,
      autoPublishPrBody({
        ingestCounts: report.ingest.counts,
        editorial,
        apply,
        scheduledListingAt: now.toISOString(),
      }),
      "utf8",
    );
  }
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    writeFileSync(summaryPath, publishJobSummary(report), { flag: "a" });
  }
}

const isCli =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  try {
    const report = runPublish();
    console.log(publishJobSummary(report));
    if (!report.decision.ok && report.decision.failWorkflow) {
      process.exitCode = 1;
    }
  } catch (error) {
    const message = redactSecrets(
      error instanceof Error ? error.message : String(error),
      process.env[EDITORIAL_CONFIG.apiKeyEnv],
    );
    console.error(message);
    process.exitCode = 1;
  }
}
