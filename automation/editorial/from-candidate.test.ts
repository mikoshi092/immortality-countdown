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

describe("sourceLabelFromUrl — Japanese outlets (keyword design §5.2)", () => {
  it("labels the major outlets and keeps gooday ahead of bare nikkei.com", async () => {
    const { sourceLabelFromUrl } = await import("./from-candidate");
    assert.equal(sourceLabelFromUrl("https://www.yomiuri.co.jp/articles/x"), "読売新聞");
    assert.equal(sourceLabelFromUrl("https://www.asahi.com/articles/x"), "朝日新聞");
    assert.equal(sourceLabelFromUrl("https://mainichi.jp/articles/x"), "毎日新聞");
    assert.equal(sourceLabelFromUrl("https://www.nikkei.com/article/x"), "日本経済新聞");
    assert.equal(sourceLabelFromUrl("https://www.jiji.com/jc/article?k=x"), "時事通信");
    assert.equal(sourceLabelFromUrl("https://www.kyodo.co.jp/news/x"), "共同通信");
    assert.equal(sourceLabelFromUrl("https://www.tv-asahi.co.jp/news/x"), "テレビ朝日");
    assert.equal(sourceLabelFromUrl("https://www.nhk.or.jp/news/x"), "NHK");
    assert.equal(sourceLabelFromUrl("https://gooday.nikkei.co.jp/atcl/column/x"), "日経Gooday");
  });
});
