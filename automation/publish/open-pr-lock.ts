/**
 * While an automatic news pull request is still open, do not open another.
 * A PR older than 24 hours is expired: auto-merge stays off, and the PR is
 * closed so a later run can regenerate with a new sitePublishedAt.
 */
import { spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { redactSecrets } from "../editorial/from-candidate";

export const NEWS_AUTO_LABEL = "news-auto";
export const NEWS_PR_TTL_MS = 24 * 60 * 60 * 1000;

export type CheckRollup = "pending" | "failed" | "success";

export type OpenNewsPr = {
  number: number;
  url: string;
  headRef: string;
  labels: string[];
  createdAt: string;
  checks: CheckRollup;
};

export type LockAction = "proceed" | "wait" | "fail" | "expire";

export type LockDecision = {
  action: LockAction;
  prs: OpenNewsPr[];
  summary: string;
};

const FAILURE = new Set([
  "FAILURE",
  "CANCELLED",
  "TIMED_OUT",
  "ACTION_REQUIRED",
  "STARTUP_FAILURE",
  "ERROR",
  "STALE",
]);

const OK = new Set(["SUCCESS", "NEUTRAL", "SKIPPED"]);

export function isAutoNewsPr(pr: { headRef: string; labels: readonly string[] }): boolean {
  return pr.headRef.startsWith("news/auto-") || pr.labels.includes(NEWS_AUTO_LABEL);
}

export function isNewsPrExpired(createdAt: string, now: Date): boolean {
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) return false;
  return now.getTime() - created > NEWS_PR_TTL_MS;
}

export function utcBranchStamp(now: Date): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  const minute = String(now.getUTCMinutes()).padStart(2, "0");
  return `${year}${month}${day}-${hour}${minute}`;
}

export function newsBranchName(input: {
  stamp: string;
  runId: string;
  runAttempt: string;
}): string {
  if (!/^\d{8}-\d{4}$/.test(input.stamp)) {
    throw new Error("branch stamp must be YYYYMMDD-HHMM UTC");
  }
  if (!/^[1-9]\d*$/.test(input.runId) || !/^[1-9]\d*$/.test(input.runAttempt)) {
    throw new Error("GITHUB_RUN_ID and GITHUB_RUN_ATTEMPT are required");
  }
  return `news/auto-${input.stamp}-${input.runId}-${input.runAttempt}`;
}

export function normalizeCheckRollup(rollup: unknown): CheckRollup {
  if (!Array.isArray(rollup) || rollup.length === 0) return "pending";
  let pending = false;
  for (const item of rollup) {
    if (!item || typeof item !== "object") return "pending";
    const record = item as { status?: unknown; conclusion?: unknown; state?: unknown };
    const conclusion = upper(record.conclusion ?? record.state);
    const status = upper(record.status);
    if (FAILURE.has(conclusion)) return "failed";
    if (status && status !== "COMPLETED") {
      if (FAILURE.has(status)) return "failed";
      pending = true;
      continue;
    }
    if (OK.has(conclusion)) continue;
    pending = true;
  }
  return pending ? "pending" : "success";
}

function upper(value: unknown): string {
  return typeof value === "string" ? value.toUpperCase() : "";
}

function labelNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const names: string[] = [];
  for (const item of value) {
    if (typeof item === "string") names.push(item);
    else if (item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string") {
      names.push((item as { name: string }).name);
    }
  }
  return names;
}

export function parseListedPullRequests(
  payload: unknown,
): { ok: true; prs: OpenNewsPr[] } | { ok: false; reason: string } {
  if (!Array.isArray(payload)) {
    return { ok: false, reason: "open PR list could not be read" };
  }
  const prs: OpenNewsPr[] = [];
  for (const item of payload) {
    if (!item || typeof item !== "object") {
      return { ok: false, reason: "open PR record was incomplete" };
    }
    const record = item as Record<string, unknown>;
    if (
      typeof record.number !== "number" ||
      typeof record.url !== "string" ||
      typeof record.headRefName !== "string" ||
      typeof record.createdAt !== "string"
    ) {
      return { ok: false, reason: "open PR record was incomplete" };
    }
    prs.push({
      number: record.number,
      url: record.url,
      headRef: record.headRefName,
      labels: labelNames(record.labels),
      createdAt: record.createdAt,
      checks: normalizeCheckRollup(record.statusCheckRollup),
    });
  }
  return { ok: true, prs };
}

export function decideOpenPrLock(prs: readonly OpenNewsPr[], now: Date): LockDecision {
  const relevant = prs.filter(isAutoNewsPr);
  if (relevant.length === 0) {
    return {
      action: "proceed",
      prs: [],
      summary: lockSummary("proceed", [], now),
    };
  }
  const expired = relevant.filter((pr) => isNewsPrExpired(pr.createdAt, now));
  const active = relevant.filter((pr) => !isNewsPrExpired(pr.createdAt, now));
  if (active.some((pr) => pr.checks === "failed")) {
    return { action: "fail", prs: relevant, summary: lockSummary("fail", relevant, now) };
  }
  if (active.length > 0) {
    return { action: "wait", prs: relevant, summary: lockSummary("wait", relevant, now) };
  }
  return { action: "expire", prs: expired, summary: lockSummary("expire", expired, now) };
}

function lockSummary(action: LockAction, prs: readonly OpenNewsPr[], now: Date): string {
  const lines = ["## Open automatic news PRs", ""];
  if (action === "proceed") {
    lines.push("No open automatic news pull request. This run may open one.");
    return lines.join("\n") + "\n";
  }
  lines.push(`Decision: ${action}.`);
  lines.push("No new article branch or pull request will be created on this run.");
  for (const pr of prs) {
    const age = isNewsPrExpired(pr.createdAt, now) ? "expired" : "within 24 hours";
    lines.push(`- ${pr.url}`);
    lines.push(`  state: open`);
    lines.push(`  head: ${pr.headRef}`);
    lines.push(`  checks: ${pr.checks}`);
    lines.push(`  age: ${age}`);
  }
  if (action === "fail") {
    lines.push("An open automatic news pull request has failed checks.");
  }
  if (action === "wait") {
    lines.push("Waiting. Checks are still pending, or they passed and the pull request is not on main yet.");
  }
  if (action === "expire") {
    lines.push("expired. Auto-merge stays off. The pull request is closed when that is safe.");
    lines.push("The next run may regenerate articles with a new sitePublishedAt.");
  }
  return lines.join("\n") + "\n";
}

function writeStepBits(proceed: boolean, summary: string): void {
  const output = process.env.GITHUB_OUTPUT;
  if (output) appendFileSync(output, `proceed=${proceed ? "true" : "false"}\n`);
  const jobSummary = process.env.GITHUB_STEP_SUMMARY;
  if (jobSummary) appendFileSync(jobSummary, summary);
  console.log(redactSecrets(summary, process.env.GH_TOKEN));
}

function gh(args: string[]): { status: number; stdout: string; stderr: string } {
  const result = spawnSync("gh", args, {
    encoding: "utf8",
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: redactSecrets(result.stderr ?? "", process.env.GH_TOKEN),
  };
}

function closeExpired(pr: OpenNewsPr): boolean {
  gh(["pr", "merge", String(pr.number), "--disable-auto"]);
  const closed = gh([
    "pr",
    "close",
    String(pr.number),
    "--comment",
    "Expired after 24 hours. Auto-merge was not enabled. A later news run may regenerate the articles with a new sitePublishedAt.",
  ]);
  if (closed.stderr.trim()) console.error(closed.stderr.trim());
  return closed.status === 0;
}

const isCli =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  try {
    if (process.argv.includes("--branch-name")) {
      const name = newsBranchName({
        stamp: utcBranchStamp(new Date()),
        runId: process.env.GITHUB_RUN_ID ?? "",
        runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? "",
      });
      process.stdout.write(`${name}\n`);
    } else if (process.argv.includes("--apply")) {
      if (!process.env.GH_TOKEN) {
        console.error("GH_TOKEN is not set. Refusing to list or close pull requests.");
        writeStepBits(false, "## Open automatic news PRs\n\nGH_TOKEN is not set.\n");
        process.exitCode = 1;
      } else {
        const listed = gh([
          "pr",
          "list",
          "--state",
          "open",
          "--base",
          "main",
          "--limit",
          "50",
          "--json",
          "number,url,headRefName,createdAt,labels,statusCheckRollup",
        ]);
        if (listed.stderr.trim()) console.error(listed.stderr.trim());
        if (listed.status !== 0) {
          console.error("gh pr list failed");
          writeStepBits(false, "## Open automatic news PRs\n\nThe open PR list could not be read.\n");
          process.exitCode = 1;
        } else {
          const parsed = parseListedPullRequests(JSON.parse(listed.stdout) as unknown);
          if (!parsed.ok) {
            writeStepBits(false, `## Open automatic news PRs\n\n${parsed.reason}\n`);
            process.exitCode = 1;
          } else {
            const now = new Date();
            const decision = decideOpenPrLock(parsed.prs, now);
            const expired = decision.prs.filter((pr) => isNewsPrExpired(pr.createdAt, now));
            let closeFailed = false;
            for (const pr of expired) {
              if (!closeExpired(pr)) closeFailed = true;
            }
            writeStepBits(decision.action === "proceed" && !closeFailed, decision.summary);
            if (closeFailed || decision.action === "fail") process.exitCode = 1;
          }
        }
      }
    }
  } catch (error) {
    console.error(redactSecrets(error instanceof Error ? error.message : String(error), process.env.GH_TOKEN));
    process.exitCode = 1;
  }
}
