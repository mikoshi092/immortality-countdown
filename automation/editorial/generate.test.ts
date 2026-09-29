import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateDrafts } from "./generate";
import { MockEditorialProvider } from "./mock-provider";
import { OpenAIEditorialProvider } from "./openai-provider";
import { fixtureCandidate, validMouseDraft } from "./fixtures";
import { InvalidGeneratedCopyError } from "./generated-copy";
import type { EditorialProvider, GeneratedCopy } from "./types";

class ScriptedProvider implements EditorialProvider {
  readonly name = "mock" as const;
  readonly model = "scripted";
  constructor(private readonly copy: GeneratedCopy) {}
  async generate(): Promise<GeneratedCopy> {
    return this.copy;
  }
}

class SequenceProvider implements EditorialProvider {
  readonly name = "mock" as const;
  readonly model = "sequence";
  private index = 0;
  constructor(private readonly steps: Array<GeneratedCopy | Error>) {}
  async generate(): Promise<GeneratedCopy> {
    const step = this.steps[this.index] ?? this.steps.at(-1);
    this.index += 1;
    if (step instanceof Error) throw step;
    if (!step) throw new Error("no scripted copy");
    return step;
  }
}

function generatedFrom(candidate = fixtureCandidate()): GeneratedCopy {
  const valid = validMouseDraft(candidate);
  return {
    localizedFacts: valid.localizedFacts,
    en: valid.en,
    ja: valid.ja,
    countdownImpact: "none",
  };
}

describe("editorial generation", () => {
  it("copies locked identifiers from the candidate, not the model", async () => {
    const candidate = fixtureCandidate();
    const report = await generateDrafts(
      [candidate],
      new ScriptedProvider(generatedFrom(candidate)),
    );
    assert.equal(report.drafts.length, 1);
    assert.equal(report.drafts[0].sourceUrl, candidate.sourceUrl);
    assert.equal(report.drafts[0].doi, candidate.doi);
    assert.equal(report.drafts[0].evidence, candidate.evidence);
    assert.equal(report.drafts[0].fieldId, candidate.fieldId);
    assert.deepEqual(report.drafts[0].studySubjects, candidate.studySubjects);
    assert.equal(report.drafts[0].sourcePublishedAt, candidate.publishedAt);
    assert.equal(report.drafts[0].sitePublishedAt, undefined);
    assert.ok(report.drafts[0].draftCreatedAt);
    assert.notEqual(report.drafts[0].draftCreatedAt, candidate.publishedAt);
    assert.notEqual(report.drafts[0].sitePublishedAt, candidate.publishedAt);
    const src = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "generate.ts"),
      "utf8",
    );
    assert.equal(src.includes("sitePublishedAt: candidate.publishedAt"), false);
  });

  it("keeps failed drafts in rejectedDrafts with reasons", async () => {
    const candidate = fixtureCandidate();
    const valid = generatedFrom(candidate);
    const report = await generateDrafts(
      [candidate],
      new ScriptedProvider({
        ...valid,
        ja: { ...valid.ja, headline: "", dek: "", whatHappened: "", whyItMatters: "", realityCheck: "" },
      }),
    );
    assert.equal(report.drafts.length, 0);
    assert.equal(report.rejectedDrafts.length, 1);
    assert.ok(report.rejectedDrafts[0].reasons.length > 0);
  });

  it("holds a malformed JSON candidate and continues with the next one", async () => {
    const first = fixtureCandidate({ recordId: "pmid-1" });
    const second = fixtureCandidate({
      recordId: "pmid-2",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/88888888/",
      doi: "10.0000/fixture.second",
    });
    const report = await generateDrafts(
      [first, second],
      new SequenceProvider([
        new InvalidGeneratedCopyError(["OpenAI API returned message content that was not JSON."]),
        generatedFrom(second),
      ]),
    );
    assert.equal(report.drafts.length, 1);
    assert.equal(report.drafts[0].candidateRecordId, second.recordId);
    assert.equal(report.rejectedDrafts.length, 1);
    assert.equal(report.rejectedDrafts[0].status, "held");
    assert.equal(report.rejectedDrafts[0].recordId, first.recordId);
    assert.ok(
      report.rejectedDrafts[0].reasons.some((reason) => reason.includes("not JSON")),
    );
  });

  it("fails the run when the provider errors", async () => {
    await assert.rejects(
      () =>
        generateDrafts(
          [fixtureCandidate()],
          new SequenceProvider([new Error("provider down")]),
        ),
      /provider down/,
    );
  });

  it("rejects countdownImpact watch", async () => {
    const candidate = fixtureCandidate();
    const report = await generateDrafts(
      [candidate],
      new ScriptedProvider({ ...generatedFrom(candidate), countdownImpact: "watch" }),
    );
    assert.equal(report.drafts.length, 0);
    assert.ok(
      report.rejectedDrafts.some((item) =>
        item.reasons.some((reason) => reason.includes("countdownImpact")),
      ),
    );
  });

  it("does not call the network when using the mock provider", async () => {
    const previous = globalThis.fetch;
    globalThis.fetch = async () => {
      throw new Error("network should not be used");
    };
    try {
      const report = await generateDrafts(
        [fixtureCandidate()],
        new MockEditorialProvider(),
      );
      assert.ok(report.drafts.length + report.rejectedDrafts.length === 1);
    } finally {
      globalThis.fetch = previous;
    }
  });

  it("does not hide an OpenAI API failure as zero drafts", async () => {
    const provider = new OpenAIEditorialProvider({
      apiKey: "sk-test-not-a-real-key",
      fetchImpl: async () =>
        new Response("upstream error", { status: 500 }),
    });
    await assert.rejects(
      () => generateDrafts([fixtureCandidate()], provider),
      /OpenAI API request failed/,
    );
  });

  it("does not hide an OpenAI rate limit as zero drafts", async () => {
    const provider = new OpenAIEditorialProvider({
      apiKey: "sk-test-not-a-real-key",
      fetchImpl: async () =>
        new Response("rate limited", { status: 429 }),
    });
    await assert.rejects(
      () => generateDrafts([fixtureCandidate()], provider),
      /OpenAI API request failed \(429\)/,
    );
  });
});
