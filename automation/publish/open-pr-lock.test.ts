import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  decideOpenPrLock,
  isNewsPrExpired,
  newsBranchName,
  parseListedPullRequests,
  type OpenNewsPr,
} from "./open-pr-lock";

const now = new Date("2026-09-24T12:00:00Z");

function pr(overrides: Partial<OpenNewsPr> = {}): OpenNewsPr {
  return {
    number: 1,
    url: "https://github.com/example/immortality-countdown/pull/1",
    headRef: "news/auto-20260924-1000-100-1",
    labels: ["news-auto"],
    createdAt: "2026-09-24T11:00:00Z",
    checks: "pending",
    ...overrides,
  };
}

describe("open automatic news PR lock", () => {
  it("proceeds when no open bot PR exists", () => {
    assert.equal(decideOpenPrLock([], now).action, "proceed");
    const unrelated = decideOpenPrLock(
      [pr({ headRef: "feature/homepage", labels: [], checks: "failed" })],
      now,
    );
    assert.equal(unrelated.action, "proceed");
  });

  it("waits and does not open another PR when a bot PR is open", () => {
    const decision = decideOpenPrLock([pr({ checks: "pending" })], now);
    assert.equal(decision.action, "wait");
    assert.match(decision.summary, /https:\/\/github.com\/example\/immortality-countdown\/pull\/1/);
    assert.match(decision.summary, /state: open/);
    assert.match(decision.summary, /No new article branch/);
  });

  it("waits on a label match even when the branch name differs", () => {
    const decision = decideOpenPrLock(
      [pr({ headRef: "bot/news-batch", labels: ["news-auto"], checks: "success" })],
      now,
    );
    assert.equal(decision.action, "wait");
  });

  it("fails the run when an open bot PR has failed checks", () => {
    const decision = decideOpenPrLock([pr({ checks: "failed" })], now);
    assert.equal(decision.action, "fail");
    assert.match(decision.summary, /failed checks/);
    assert.match(decision.summary, /pull\/1/);
  });

  it("marks a pull request older than 24 hours expired and does not proceed", () => {
    const createdAt = "2026-09-23T11:59:59Z";
    assert.equal(isNewsPrExpired(createdAt, now), true);
    const decision = decideOpenPrLock([pr({ createdAt, checks: "success" })], now);
    assert.equal(decision.action, "expire");
    assert.match(decision.summary, /expired/);
    assert.match(decision.summary, /Auto-merge stays off/);
  });

  it("keeps a pull request that is exactly 24 hours old", () => {
    const createdAt = "2026-09-23T12:00:00Z";
    assert.equal(isNewsPrExpired(createdAt, now), false);
    assert.equal(decideOpenPrLock([pr({ createdAt, checks: "pending" })], now).action, "wait");
  });
});

describe("news branch names", () => {
  it("includes the run id and attempt so reruns do not collide", () => {
    const first = newsBranchName({
      stamp: "20260924-1628",
      runId: "123456",
      runAttempt: "1",
    });
    const second = newsBranchName({
      stamp: "20260924-1628",
      runId: "123456",
      runAttempt: "2",
    });
    assert.equal(first, "news/auto-20260924-1628-123456-1");
    assert.notEqual(first, second);
  });
});

describe("open PR list parsing", () => {
  it("reads a fixture list with a failed rollup", () => {
    const parsed = parseListedPullRequests([
      {
        number: 8,
        url: "https://github.com/example/immortality-countdown/pull/8",
        headRefName: "news/auto-20260924-0100-9-1",
        createdAt: "2026-09-24T01:00:00Z",
        labels: [{ name: "news-auto" }],
        statusCheckRollup: [{ status: "COMPLETED", conclusion: "FAILURE" }],
      },
    ]);
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.prs[0]?.checks, "failed");
      assert.equal(decideOpenPrLock(parsed.prs, now).action, "fail");
    }
  });

  it("does not proceed when the list cannot be read", () => {
    const parsed = parseListedPullRequests({ message: "nope" });
    assert.equal(parsed.ok, false);
  });
});
