import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  InvalidGeneratedCopyError,
  parseGeneratedCopy,
  parseGeneratedCopyJson,
} from "./generated-copy";
import { validMouseDraft, fixtureCandidate } from "./fixtures";

describe("generated copy parser", () => {
  it("accepts a well-formed bilingual payload", () => {
    const valid = validMouseDraft(fixtureCandidate());
    const parsed = parseGeneratedCopy({
      localizedFacts: valid.localizedFacts,
      en: valid.en,
      ja: valid.ja,
      countdownImpact: "none",
    });
    assert.equal(parsed.countdownImpact, "none");
    assert.equal(parsed.en.headline, valid.en.headline);
    assert.equal(parsed.localizedFacts.ja.populationOrModel, "マウス");
  });

  it("rejects countdownImpact moved", () => {
    const valid = validMouseDraft(fixtureCandidate());
    assert.throws(
      () =>
        parseGeneratedCopy({
          localizedFacts: valid.localizedFacts,
          en: valid.en,
          ja: valid.ja,
          countdownImpact: "moved",
        }),
      InvalidGeneratedCopyError,
    );
  });

  it("rejects malformed JSON without throwing on undefined.trim", () => {
    assert.throws(
      () => parseGeneratedCopyJson("{"),
      (error: unknown) =>
        error instanceof InvalidGeneratedCopyError &&
        error.reasons.some((reason) => reason.includes("not JSON")),
    );
    assert.throws(
      () => parseGeneratedCopy({ en: null, ja: {}, countdownImpact: "none" }),
      InvalidGeneratedCopyError,
    );
  });
});
