import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { OpenAIEditorialProvider } from "./openai-provider";
import { promptInputFromCandidate } from "./from-candidate";
import { fixtureCandidate, validMouseDraft } from "./fixtures";
import type { GeneratedCopy } from "./types";

// The retry exists because scheduled run #32 (2026-11-07) failed on a
// single transient "fetch failed" from the editorial fetch: no retry,
// no timeout handling, whole run lost. These tests pin the policy:
// transport throws and HTTP 429/5xx retry with backoff; other 4xx
// responses fail immediately with the existing formatted error.

function successBody(candidate = fixtureCandidate()): string {
  const valid = validMouseDraft(candidate);
  const copy: GeneratedCopy = {
    localizedFacts: valid.localizedFacts,
    en: valid.en,
    ja: valid.ja,
    countdownImpact: "none",
  };
  return JSON.stringify({ choices: [{ message: { content: JSON.stringify(copy) } }] });
}

function input() {
  return promptInputFromCandidate(fixtureCandidate());
}

function provider(fetchImpl: typeof fetch, sleeps: number[]): OpenAIEditorialProvider {
  return new OpenAIEditorialProvider({
    apiKey: "sk-test-key",
    fetchImpl,
    sleepImpl: async (ms: number) => {
      sleeps.push(ms);
    },
  });
}

describe("OpenAI editorial provider retry", () => {
  it("succeeds after one transient fetch failure (the run #32 shape)", async () => {
    let calls = 0;
    const sleeps: number[] = [];
    const fetchImpl = (async () => {
      calls += 1;
      if (calls === 1) throw new TypeError("fetch failed");
      return new Response(successBody(), { status: 200 });
    }) as typeof fetch;
    const copy = await provider(fetchImpl, sleeps).generate(input());
    assert.equal(calls, 2);
    assert.deepEqual(sleeps, [500]);
    assert.equal(copy.countdownImpact, "none");
    assert.ok(copy.en.headline.length > 0);
  });

  it("retries a 500 and then succeeds", async () => {
    let calls = 0;
    const sleeps: number[] = [];
    const fetchImpl = (async () => {
      calls += 1;
      if (calls === 1) return new Response("server error", { status: 500 });
      return new Response(successBody(), { status: 200 });
    }) as typeof fetch;
    const copy = await provider(fetchImpl, sleeps).generate(input());
    assert.equal(calls, 2);
    assert.ok(copy.ja.headline.length > 0);
  });

  it("exhausts attempts on persistent 500s and surfaces the formatted error", async () => {
    let calls = 0;
    const sleeps: number[] = [];
    const fetchImpl = (async () => {
      calls += 1;
      return new Response("still down", { status: 503 });
    }) as typeof fetch;
    await assert.rejects(
      () => provider(fetchImpl, sleeps).generate(input()),
      /OpenAI API request failed \(503\): still down/,
    );
    assert.equal(calls, 3);
    assert.deepEqual(sleeps, [500, 2000]);
  });

  it("exhausts attempts on persistent fetch failures and rethrows the last one", async () => {
    let calls = 0;
    const fetchImpl = (async () => {
      calls += 1;
      throw new TypeError("fetch failed");
    }) as typeof fetch;
    await assert.rejects(() => provider(fetchImpl, []).generate(input()), /fetch failed/);
    assert.equal(calls, 3);
  });

  it("does not retry a deterministic 400", async () => {
    let calls = 0;
    const fetchImpl = (async () => {
      calls += 1;
      return new Response("bad request", { status: 400 });
    }) as typeof fetch;
    await assert.rejects(
      () => provider(fetchImpl, []).generate(input()),
      /OpenAI API request failed \(400\): bad request/,
    );
    assert.equal(calls, 1);
  });
});
