/**
 * Phase 3.0 ingest dry-run.
 *
 *   npm run ingest:dry
 *
 * Collects PubMed and ClinicalTrials.gov records from the last 48 hours,
 * normalizes, deduplicates, ranks, and validates them. Writes
 * automation/output/candidates.json. Does not generate articles, publish,
 * or write lev/params.json / lev/forecast.json.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { COUNT_DEFINITIONS, LOOKBACK_HOURS, RANK_THRESHOLDS, SCORE_DISCLAIMER, type IngestReport, type Rejection, type SourceDefinition, type SourceFetchResult } from "./types";
import { fetchEnabledSources, type HttpGet, lookbackWindow } from "./fetch";
import { enabledSources } from "./sources";
import { deduplicate, toCandidate } from "./normalize";
import { passesRankThresholds, rankRecord } from "./rank";
import { contextFromFetched, validateCandidates } from "./validate";

const here = dirname(fileURLToPath(import.meta.url));
const defaultOutputPath = join(here, "output", "candidates.json");

export type RunIngestOptions = {
  now?: Date;
  httpGet?: HttpGet;
  outputPath?: string;
  write?: boolean;
  sources?: SourceDefinition[];
};

export async function runIngest(options: RunIngestOptions = {}): Promise<IngestReport> {
  const now = options.now ?? new Date();
  const window = lookbackWindow(now, LOOKBACK_HOURS);
  const sourceResults: SourceFetchResult[] = await fetchEnabledSources(
    window,
    options.httpGet,
    options.sources ?? enabledSources(),
  );

  const fetched = sourceResults.flatMap((result) => result.records);
  const { records: deduplicated, conflicts: dedupConflicts } = deduplicate(fetched);
  const ranked = deduplicated.map(rankRecord);

  const thresholdRejected: Rejection[] = [];
  const thresholdPassed = [];
  for (const record of ranked) {
    if (!passesRankThresholds(record)) {
      const reasons: string[] = [];
      if (record.relevanceScore < RANK_THRESHOLDS.minRelevance) {
        reasons.push(`relevance ${record.relevanceScore} < ${RANK_THRESHOLDS.minRelevance}`);
      }
      if (record.significanceScore < RANK_THRESHOLDS.minSignificance) {
        reasons.push(`significance ${record.significanceScore} < ${RANK_THRESHOLDS.minSignificance}`);
      }
      thresholdRejected.push({
        recordId: record.recordId,
        sourceId: record.sourceId,
        title: record.title,
        sourceUrl: record.sourceUrl,
        reasons,
        fieldId: record.fieldId,
        evidence: record.evidence,
        relevanceScore: record.relevanceScore,
        significanceScore: record.significanceScore,
      });
    } else {
      thresholdPassed.push(toCandidate(record));
    }
  }

  const ctx = contextFromFetched(fetched);
  ctx.nowMs = now.getTime();
  const validated = validateCandidates(thresholdPassed, ctx);

  const report: IngestReport = {
    generatedAt: now.toISOString(),
    lookbackHours: LOOKBACK_HOURS,
    windowFrom: window.from.toISOString(),
    windowTo: window.to.toISOString(),
    nodeVersion: process.version,
    counts: {
      fetched: fetched.length,
      deduplicated: deduplicated.length,
      relevant: validated.accepted.length,
      rejected: thresholdRejected.length + validated.rejected.length,
    },
    countDefinitions: COUNT_DEFINITIONS,
    sourceResults: sourceResults.map((result) => ({
      sourceId: result.sourceId,
      ok: result.ok,
      status: result.status,
      fetched: result.records.length,
      error: result.error,
      truncated: result.truncated,
      issues: result.issues,
    })),
    dedupConflicts: dedupConflicts.length > 0 ? dedupConflicts : undefined,
    scoreDisclaimer: SCORE_DISCLAIMER,
    candidates: validated.accepted,
    rejected: [...validated.rejected, ...thresholdRejected],
  };

  if (options.write !== false) {
    const outputPath = options.outputPath ?? defaultOutputPath;
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  return report;
}

function printReport(report: IngestReport, outputPath: string): void {
  console.log("Phase 3.0 ingest dry-run");
  console.log(`Window: ${report.windowFrom} → ${report.windowTo} (${report.lookbackHours}h)`);
  console.log(`Node: ${report.nodeVersion}`);
  console.log("");
  console.log(`Fetched:       ${report.counts.fetched}`);
  console.log(`  ${report.countDefinitions.fetched}`);
  console.log(`Deduplicated:  ${report.counts.deduplicated}`);
  console.log(`  ${report.countDefinitions.deduplicated}`);
  console.log(`Relevant:      ${report.counts.relevant}`);
  console.log(`  ${report.countDefinitions.relevant}`);
  console.log(`Rejected:      ${report.counts.rejected}`);
  console.log(`  ${report.countDefinitions.rejected}`);
  console.log("");
  for (const source of report.sourceResults) {
    const issueText = source.issues?.map((issue) => `${issue.kind}:${issue.count}:${issue.message}`).join(" | ");
    if (source.status === "ok") {
      console.log(`Source ${source.sourceId}: ok, ${source.fetched} records${source.truncated ? " (truncated at API page cap)" : ""}`);
    } else if (source.status === "partial") {
      console.log(`Source ${source.sourceId}: PARTIAL, kept ${source.fetched} records — ${issueText ?? source.error}`);
      console.log("  Kept fetched records. This is not complete success.");
    } else {
      console.log(`Source ${source.sourceId}: FAILED — ${issueText ?? source.error}`);
      console.log("  This is not treated as zero new items.");
    }
    if (source.issues?.length) {
      for (const issue of source.issues) {
        console.log(`  issue ${issue.stage} ${issue.kind} count=${issue.count}: ${issue.message}`);
      }
    }
  }
  if (report.dedupConflicts?.length) {
    console.log("");
    console.log("Dedup conflicts (not silently merged):");
    for (const conflict of report.dedupConflicts) {
      console.log(`  ${conflict.kind}: ${conflict.reason}; dois=${conflict.dois.join(", ")}; urls=${conflict.urls.join(", ")}`);
    }
  }
  console.log("");
  console.log(report.scoreDisclaimer);
  if (report.candidates[0]) {
    const sample = report.candidates[0];
    console.log("");
    console.log("Example candidate:");
    console.log(`  ${sample.title}`);
    console.log(`  ${sample.sourceUrl}`);
    console.log(`  ${sample.fieldId} / ${sample.evidence} / rel ${sample.relevanceScore} / sig ${sample.significanceScore}`);
    console.log(`  ${sample.reason}`);
  }
  const reasonCounts = new Map<string, number>();
  for (const item of report.rejected) {
    for (const reason of item.reasons) {
      reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
    }
  }
  if (reasonCounts.size > 0) {
    console.log("");
    console.log("Rejection reasons:");
    for (const [reason, count] of [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${count}× ${reason}`);
    }
  }
  console.log("");
  console.log(`Wrote ${outputPath}`);
}

const isCli = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const outputPath = defaultOutputPath;
  runIngest({ outputPath })
    .then((report) => {
      printReport(report, outputPath);
      const incomplete = report.sourceResults.some((source) => source.status !== "ok");
      if (incomplete) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
