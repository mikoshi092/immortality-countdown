/**
 * Decide whether a news PR may enable GitHub auto-merge.
 * Auto-merge stays off unless branch rules require the CI job `verify`
 * and do not require a human review.
 */
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const REQUIRED_CHECK_CONTEXT = "verify";

export function contextsFromBranchRules(rules: unknown): string[] {
  if (!Array.isArray(rules)) return [];
  const contexts: string[] = [];
  for (const rule of rules) {
    if (!rule || typeof rule !== "object") continue;
    if ((rule as { type?: string }).type !== "required_status_checks") continue;
    const checks =
      (
        rule as {
          parameters?: { required_status_checks?: { context?: string }[] };
        }
      ).parameters?.required_status_checks ?? [];
    for (const check of checks) {
      if (typeof check?.context === "string" && check.context.length > 0) {
        contexts.push(check.context);
      }
    }
  }
  return contexts;
}

export function reviewCountFromRules(rules: unknown): number {
  if (!Array.isArray(rules)) return 0;
  let count = 0;
  for (const rule of rules) {
    if (!rule || typeof rule !== "object") continue;
    if ((rule as { type?: string }).type !== "pull_request") continue;
    const required = (
      rule as {
        parameters?: { required_approving_review_count?: number };
      }
    ).parameters?.required_approving_review_count;
    if (typeof required === "number" && required > count) count = required;
  }
  return count;
}

export function contextsFromClassicProtection(body: unknown): string[] {
  if (!body || typeof body !== "object") return [];
  const checks = body as {
    required_status_checks?: {
      contexts?: unknown;
      checks?: { context?: string }[];
    };
  };
  const status = checks.required_status_checks;
  if (!status) return [];
  const fromContexts = Array.isArray(status.contexts)
    ? status.contexts.filter((item): item is string => typeof item === "string")
    : [];
  const fromChecks = Array.isArray(status.checks)
    ? status.checks
        .map((item) => item?.context)
        .filter((item): item is string => typeof item === "string")
    : [];
  return [...fromContexts, ...fromChecks];
}

export function reviewCountFromClassic(body: unknown): number {
  if (!body || typeof body !== "object") return 0;
  const count = (
    body as {
      required_pull_request_reviews?: { required_approving_review_count?: number };
    }
  ).required_pull_request_reviews?.required_approving_review_count;
  return typeof count === "number" ? count : 0;
}

export function assessAutoMerge(input: {
  rules: unknown | null;
  classic: unknown | null;
}): { ok: true } | { ok: false; reason: string } {
  const rulesReadable = Array.isArray(input.rules);
  const classicReadable = Boolean(input.classic) && typeof input.classic === "object";
  if (!rulesReadable && !classicReadable) {
    return {
      ok: false,
      reason: "branch protection could not be read; auto-merge is not enabled",
    };
  }

  const contexts = [
    ...(rulesReadable ? contextsFromBranchRules(input.rules) : []),
    ...(classicReadable ? contextsFromClassicProtection(input.classic) : []),
  ];
  const reviews =
    (rulesReadable ? reviewCountFromRules(input.rules) : 0) +
    (classicReadable ? reviewCountFromClassic(input.classic) : 0);

  if (reviews > 0) {
    return {
      ok: false,
      reason: "required reviews would wait for human approval; auto-merge is not enabled",
    };
  }
  if (!contexts.includes(REQUIRED_CHECK_CONTEXT)) {
    return {
      ok: false,
      reason: `required status checks do not include ${REQUIRED_CHECK_CONTEXT}; auto-merge is not enabled`,
    };
  }
  return { ok: true };
}

type GitHubResponse = { status: number; body: unknown };

async function githubGet(path: string, token: string): Promise<GitHubResponse> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "immortality-countdown-news-publish",
    },
  });
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = null;
    }
  }
  return { status: response.status, body };
}

export async function confirmAutoMergeAllowed(input: {
  repository: string;
  token: string;
  branch?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const branch = input.branch ?? "main";
  const rulesResponse = await githubGet(
    `/repos/${input.repository}/rules/branches/${branch}`,
    input.token,
  );
  const classicResponse = await githubGet(
    `/repos/${input.repository}/branches/${branch}/protection`,
    input.token,
  );
  return assessAutoMerge({
    rules: rulesResponse.status === 200 ? rulesResponse.body : null,
    classic: classicResponse.status === 200 ? classicResponse.body : null,
  });
}

const isCli =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const repository = process.env.GITHUB_REPOSITORY ?? "";
  const token = process.env.GH_TOKEN ?? "";
  const branch = process.argv[2] ?? "main";
  if (!repository || !token) {
    console.error("GITHUB_REPOSITORY and GH_TOKEN are required to confirm auto-merge.");
    process.exitCode = 1;
  } else {
    confirmAutoMergeAllowed({ repository, token, branch })
      .then((result) => {
        const line = result.ok
          ? `Auto-merge is allowed: required check ${REQUIRED_CHECK_CONTEXT} is present and reviews are not required.`
          : result.reason;
        console.log(line);
        const summaryPath = process.env.GITHUB_STEP_SUMMARY;
        if (summaryPath) appendFileSync(summaryPath, `${line}\n`);
        if (!result.ok) process.exitCode = 1;
      })
      .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
      });
  }
}
