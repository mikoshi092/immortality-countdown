import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fixtureCandidate } from "./fixtures";
import { promptInputFromCandidate } from "./from-candidate";

describe("promptInputFromCandidate", () => {
  it("passes through ClinicalTrials.gov metadata already on the candidate", () => {
    const candidate = fixtureCandidate({
      sourceId: "clinicaltrials",
      sourceUrl: "https://clinicaltrials.gov/study/NCT99999999",
      doi: undefined,
      title: "Phase 2 study of compound X",
      abstract: "This trial is recruiting. No results are posted.",
      studySubjects: ["living-people"],
      dateFields: {
        studyFirstPostDate: "2026-09-01T00:00:00Z",
        lastUpdatePostDate: "2026-09-10T00:00:00Z",
      },
      hints: {
        studyType: "INTERVENTIONAL",
        phases: ["PHASE2"],
        overallStatus: "RECRUITING",
        hasResults: false,
        journal: undefined,
      },
    });
    const input = promptInputFromCandidate(candidate);
    assert.equal(input.contentType, "trial-registration");
    assert.equal(input.studyType, "INTERVENTIONAL");
    assert.deepEqual(input.phases, ["PHASE2"]);
    assert.equal(input.overallStatus, "RECRUITING");
    assert.equal(input.hasResults, false);
    assert.equal(input.studyFirstPostDate, "2026-09-01T00:00:00Z");
    assert.equal(input.lastUpdatePostDate, "2026-09-10T00:00:00Z");
  });

  it("does not invent registry fields that the candidate lacks", () => {
    const input = promptInputFromCandidate(fixtureCandidate());
    assert.equal(input.studyType, undefined);
    assert.equal(input.phases, undefined);
    assert.equal(input.overallStatus, undefined);
    assert.equal(input.hasResults, undefined);
    assert.equal(input.studyFirstPostDate, undefined);
    assert.equal(input.lastUpdatePostDate, undefined);
  });
});
