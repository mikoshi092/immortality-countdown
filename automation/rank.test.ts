import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { constructClinicalTrialsUrl, constructPubmedUrl, matchWindow } from "./fetch";
import { classifyEvidence, classifyField, detectStudySubjects, passesRankThresholds, rankRecord } from "./rank";
import { RANK_THRESHOLDS, type FetchedRecord } from "./types";
import {
  FIXTURE_GENERIC_CELL_D,
  FIXTURE_HUMAN_OBSERVATIONAL_C,
  FIXTURE_IMPORTANT_PRECLINICAL_D,
  FIXTURE_MULTIMODEL_PRECLINICAL_D,
  FIXTURE_TRIAL_REGISTRATION_E,
} from "./fixtures";

function record(overrides: Partial<FetchedRecord> = {}): FetchedRecord {
  const dateFields = { publicationDate: "2026-09-15T00:00:00Z", entrezDate: "2026-09-15T16:53:00Z" };
  return {
    sourceId: "pubmed",
    sourceName: "PubMed",
    recordId: "1",
    title: "Senolytic clearance of senescent cells in aged mice",
    sourceUrl: constructPubmedUrl("1"),
    urlOrigin: { kind: "constructed-from-id", rule: "test", id: "1" },
    publishedAt: "2026-09-15T00:00:00Z",
    fetchedAt: "2026-09-16T01:00:00Z",
    dateFields,
    windowMatch: matchWindow(dateFields, {
      from: new Date("2026-09-14T01:00:00Z"),
      to: new Date("2026-09-16T01:00:00Z"),
      fromDay: "2026-09-14",
      toDay: "2026-09-16",
    }),
    abstract: "Experiments in mice show senescent-cell clearance.",
    ...overrides,
  };
}

describe("field classification", () => {
  it("maps senolytic mouse work to rejuvenation", () => {
    assert.equal(classifyField(record()).fieldId, "rejuvenation-regeneration");
  });

  it("maps epigenetic clocks to biomarkers", () => {
    assert.equal(
      classifyField(record({ title: "An epigenetic clock estimates biological age in humans", abstract: "Aging clock validation." })).fieldId,
      "biomarkers-diagnostics",
    );
  });
});

describe("evidence is conservative", () => {
  it("labels animal-only papers as Evidence D", () => {
    assert.equal(classifyEvidence(record()).evidence, "Evidence D");
  });

  it("never treats trial registration as demonstrated human efficacy", () => {
    const trial = record({
      sourceId: "clinicaltrials",
      sourceUrl: constructClinicalTrialsUrl("NCT07144293"),
      title: "Phase 3 randomized trial of a senolytic in aging adults",
      abstract: "This registered interventional trial will enroll patients.",
      hints: { studyType: "INTERVENTIONAL", phases: ["PHASE3"], hasResults: false },
    });
    assert.equal(classifyEvidence(trial).evidence, "Evidence E");
  });

  it("does not promote posted results to Evidence A or B", () => {
    const trial = record({
      sourceId: "clinicaltrials",
      sourceUrl: constructClinicalTrialsUrl("NCT1"),
      title: "Randomized human trial of metformin and aging",
      abstract: "Results are posted for this clinical trial in patients.",
      hints: { studyType: "INTERVENTIONAL", phases: ["PHASE3"], hasResults: true },
    });
    assert.equal(classifyEvidence(trial).evidence, "Evidence C");
  });

  it("does not invent Evidence A from RCT wording in a paper", () => {
    const ranked = rankRecord(
      record({
        title: "Randomized trial of rapamycin and aging in human participants",
        abstract: "We enrolled 120 participants and randomized patients to rapamycin.",
      }),
    );
    assert.notEqual(ranked.evidence, "Evidence A");
    assert.notEqual(ranked.evidence, "Evidence B");
    assert.equal(ranked.evidence, "Evidence C");
  });

  it("keeps a rat study at Evidence D even if the abstract mentions humans", () => {
    const ranked = rankRecord(
      record({
        title: "Inflammaging in rat offspring after maternal vaping",
        abstract: "These findings may have implications for human aging.",
      }),
    );
    assert.equal(ranked.evidence, "Evidence D");
  });

  it("labels human-derived cultured cell work as Evidence D, not C", () => {
    const msc = classifyEvidence(
      record({
        recordId: "42742668",
        title:
          "Alternative Splicing Constitutes a Transcription-independent Regulatory Layer in Replicative Senescence of Human Umbilical Cord Mesenchymal Stem Cells",
        abstract:
          "Mesenchymal stem cells (MSCs) inevitably undergo replicative senescence during in vitro expansion. Here, we performed splicing-aware transcriptomic profiling of human umbilical cord derived MSCs across four passage points (P2, P8, P10, P12; n = 11).",
      }),
    );
    assert.equal(msc.evidence, "Evidence D");
    assert.ok(msc.notes.some((note) => /cell|in-vitro|organoid/i.test(note)));

    const dfsc = classifyEvidence(
      record({
        recordId: "42736271",
        title:
          "IGFBP5 alleviates periodontitis by reversing human dental follicle stem cell senescence via the non-canonical Wnt pathway",
        abstract:
          "In this study, we observed a significant decrease in IGFBP5 expression in DFSCs undergoing replicative or H2O2-induced senescence. Functional experiments demonstrated that IGFBP5 overexpression alleviated cellular senescence.",
      }),
    );
    assert.equal(dfsc.evidence, "Evidence D");
  });

  it("does not upgrade to Evidence C because the word human appears", () => {
    assert.equal(
      classifyEvidence(
        record({
          title: "Human cell-line screen of senolytic candidates",
          abstract: "A human cell line was treated in vitro. No participants were enrolled.",
        }),
      ).evidence,
      "Evidence D",
    );
  });

  it("labels a human observational cohort as Evidence C", () => {
    assert.equal(
      classifyEvidence(
        record({
          title: "Prognostic Value of Different Biological Age Estimation Methods in Breast Cancer Patients: A Population-Based Cohort Study Using NHANES 1999-2020",
          abstract:
            "We analyzed data from 399 breast cancer participants in the National Health and Nutrition Examination Survey (1999-2020). During a median follow-up of 6.67 years, 144 deaths occurred.",
        }),
      ).evidence,
      "Evidence C",
    );
  });

  it("classifies a systematic review by the studies it covers, not by the word review alone", () => {
    assert.equal(
      classifyEvidence(
        record({
          title: "Biological age measured by DNA methylation clocks and reproductive history: Systematic review and meta-analysis",
          abstract: "We reviewed human cohort studies of DNA methylation clocks. Participants were drawn from published observational datasets.",
        }),
      ).evidence,
      "Evidence C",
    );
    assert.equal(
      classifyEvidence(
        record({
          title: "Senolytics in ageing: a systematic review of mouse studies",
          abstract: "This systematic review of mouse experiments found mixed lifespan effects.",
        }),
      ).evidence,
      "Evidence D",
    );
  });

  it("records insufficient basis when subjects cannot be determined", () => {
    const result = classifyEvidence(
      record({
        title: "Notes on senescence",
        abstract: "Aging is discussed in general terms.",
      }),
    );
    assert.equal(result.evidence, "Evidence E");
    assert.ok(result.notes.some((note) => /insufficient/i.test(note)));
  });
});

describe("trial evidence is separate from trial significance", () => {
  it("uses the broader discovery cutoffs", () => {
    assert.equal(RANK_THRESHOLDS.minRelevance, 50);
    assert.equal(RANK_THRESHOLDS.minSignificance, 30);
  });

  it("does not force an interventional Phase 2 registration below the significance cut", () => {
    const ranked = rankRecord(
      record({
        sourceId: "clinicaltrials",
        sourceUrl: constructClinicalTrialsUrl("NCT07144293"),
        title: "Phase 2 randomized trial of a senolytic in aging adults",
        abstract: "This interventional trial will enroll patients aged 50 and older.",
        windowMatch: { inWindow: true, matchedFields: ["studyFirstPostDate"] },
        hints: {
          studyType: "INTERVENTIONAL",
          phases: ["PHASE2"],
          hasResults: false,
          overallStatus: "RECRUITING",
        },
      }),
    );
    assert.equal(ranked.evidence, "Evidence E");
    assert.ok(ranked.significanceScore >= RANK_THRESHOLDS.minSignificance);
  });

  it("does not treat a last-update-only record as a proven phase transition", () => {
    const ranked = rankRecord(
      record({
        sourceId: "clinicaltrials",
        sourceUrl: constructClinicalTrialsUrl("NCT1"),
        title: "Aging interventional trial",
        abstract: "An interventional study of aging.",
        windowMatch: { inWindow: true, matchedFields: ["lastUpdatePostDate"] },
        dateFields: {
          studyFirstPostDate: "2025-01-01T00:00:00Z",
          lastUpdatePostDate: "2026-09-15T00:00:00Z",
        },
        hints: {
          studyType: "INTERVENTIONAL",
          phases: ["PHASE3"],
          hasResults: false,
          overallStatus: "RECRUITING",
        },
      }),
    );
    assert.equal(ranked.evidence, "Evidence E");
    assert.ok(ranked.reason.includes("not treated as a phase transition"));
  });
});

describe("thresholds", () => {
  it("keeps the broader cutoffs in one definition", () => {
    assert.equal(RANK_THRESHOLDS.minRelevance, 50);
    assert.equal(RANK_THRESHOLDS.minSignificance, 30);
  });

  it("rejects a weakly related paper", () => {
    const ranked = rankRecord(record({ title: "Hospital staffing patterns", abstract: "A survey of clinics." }));
    assert.equal(passesRankThresholds(ranked), false);
    assert.ok(ranked.relevanceScore < RANK_THRESHOLDS.minRelevance);
  });

  it("admits a cancer-treatment study while keeping it separate from aging outcomes", () => {
    const ranked = rankRecord(record({
      title: "CAR-T therapy for lymphoma",
      abstract: "The treatment reduced tumor burden in mice compared with controls.",
    }));
    assert.equal(ranked.fieldId, "immune-engineering-cancer-control");
    assert.equal(ranked.evidence, "Evidence D");
    assert.equal(passesRankThresholds(ranked), true);
    assert.ok(ranked.reason.includes("cancer outcome"));
    assert.ok(!ranked.reason.includes("lifespan or survival change"));
  });
});

describe("significance is independent of Evidence letter (fixtures)", () => {
  it("lets an important preclinical fixture stay Evidence D and still pass significance", () => {
    const ranked = rankRecord(FIXTURE_IMPORTANT_PRECLINICAL_D);
    assert.equal(ranked.recordId.startsWith("fixture-"), true);
    assert.equal(ranked.evidence, "Evidence D");
    assert.ok(ranked.significanceScore >= RANK_THRESHOLDS.minSignificance);
    assert.ok(ranked.relevanceScore >= RANK_THRESHOLDS.minRelevance);
    assert.equal(passesRankThresholds(ranked), true);
    assert.ok(ranked.reason.includes("lifespan or survival change"));
  });

  it("does not adopt a generic cell fixture just because it is Evidence D", () => {
    const ranked = rankRecord(FIXTURE_GENERIC_CELL_D);
    assert.equal(ranked.recordId.startsWith("fixture-"), true);
    assert.equal(ranked.evidence, "Evidence D");
    assert.ok(ranked.significanceScore < RANK_THRESHOLDS.minSignificance);
    assert.equal(passesRankThresholds(ranked), false);
  });

  it("does not give a human observational fixture a high score just because it is Evidence C", () => {
    const ranked = rankRecord(FIXTURE_HUMAN_OBSERVATIONAL_C);
    assert.equal(ranked.recordId.startsWith("fixture-"), true);
    assert.equal(ranked.evidence, "Evidence C");
    assert.ok(ranked.significanceScore < 50);
    assert.ok(ranked.significanceScore < RANK_THRESHOLDS.minSignificance);
  });

  it("does not treat a trial-registration fixture as proof of efficacy", () => {
    const ranked = rankRecord(FIXTURE_TRIAL_REGISTRATION_E);
    assert.equal(ranked.recordId.startsWith("fixture-"), true);
    assert.equal(ranked.evidence, "Evidence E");
    assert.ok(!ranked.reason.toLowerCase().includes("efficacy evidence"));
    assert.ok(ranked.reason.includes("not evidence that an intervention works in humans"));
  });
});

describe("outcome scoring is conservative", () => {
  it("does not treat cell survival as organism lifespan", () => {
    const ranked = rankRecord(
      record({
        title: "Senescence and cell survival in cultured fibroblasts",
        abstract: "Cell survival increased after hydrogen peroxide challenge in vitro. No mice were studied.",
      }),
    );
    assert.equal(ranked.evidence, "Evidence D");
    assert.ok(!ranked.reason.includes("(+18)"));
    assert.ok(ranked.reason.includes("cell survival or viability is not scored as organism lifespan"));
  });

  it("scores cancer survival as cancer outcome, not organism lifespan", () => {
    const ranked = rankRecord(
      record({
        title: "Aging clocks and overall survival in cancer patients",
        abstract: "Overall survival in cancer patients increased in this cohort of participants. Median follow-up was 6 years.",
      }),
    );
    assert.ok(!ranked.reason.includes("(+18)"));
    assert.ok(ranked.reason.includes("cancer outcome, not an organism lifespan change (+12)"));
  });

  it("does not score background citations, aims, or negative findings as demonstrated improvement", () => {
    const background = rankRecord(
      record({
        title: "Notes on senescence and lifespan",
        abstract: "Previous studies have shown that rapamycin extended lifespan in mice. We review those reports.",
      }),
    );
    assert.ok(!background.reason.includes("(+18)"));
    assert.ok(background.reason.includes("background or previously reported"));

    const aim = rankRecord(
      record({
        title: "A planned senolytic lifespan study",
        abstract: "This study aims to determine whether the senolytic extends lifespan in aged mice.",
      }),
    );
    assert.ok(!aim.reason.includes("(+18)"));
    assert.ok(aim.reason.includes("aim, hypothesis, or planned endpoint"));

    const negative = rankRecord(
      record({
        title: "Senolytic treatment and lifespan in aged mice",
        abstract: "Aged mice were treated with the senolytic. Median lifespan was not extended compared with vehicle control.",
      }),
    );
    assert.ok(!negative.reason.includes("(+18)"));
    assert.ok(negative.reason.includes("negative or non-significant finding"));
    assert.ok(negative.reason.includes("not scored as demonstrated improvement"));
  });

  it("withholds review/plan wording such as to extend healthspan", () => {
    const ranked = rankRecord(
      record({
        title: "Loss of Ca(2+) Signaling Fidelity During Aging: Mitochondrial Dysfunction, Senescence, and Cognitive-Motor Decline",
        abstract:
          "In this review, we discuss how aging remodels cellular Ca2+ signaling. Finally, we examine therapeutic strategies aimed at restoring Ca2+ signaling fidelity as potential interventions to preserve tissue function and extend healthspan.",
      }),
    );
    assert.ok(!ranked.reason.includes("(+18)"));
    assert.ok(
      ranked.reason.includes("review/meta-analysis") || ranked.reason.includes("aim, hypothesis, or planned endpoint"),
    );
  });

  it("withholds ambiguous survival wording for manual review", () => {
    const ranked = rankRecord(
      record({
        title: "Senescence and survival measurements",
        abstract: "Survival increased after the intervention. The experimental system is not stated.",
      }),
    );
    assert.ok(!ranked.reason.includes("(+18)"));
    assert.ok(ranked.reason.includes("outcome points withheld pending manual review"));
  });

  it("records cells, mice, and minipigs on a 42733811-like paper without calling it cells-only", () => {
    const classified = classifyEvidence(FIXTURE_MULTIMODEL_PRECLINICAL_D);
    const subjects = detectStudySubjects(FIXTURE_MULTIMODEL_PRECLINICAL_D);
    assert.equal(classified.evidence, "Evidence D");
    assert.ok(subjects.includes("cells-tissues-organoids"));
    assert.ok(subjects.includes("mice"));
    assert.ok(subjects.includes("minipigs"));
    assert.ok(classified.notes.some((note) => /not classified as cells-only/i.test(note)));
    assert.ok(!classified.notes.some((note) => /cells-only experiment/i.test(note)));
  });

  it("records GTEx autopsy tissue as deceased-donor-tissue, not living-people", () => {
    const gtex = record({
      title: "Histological aging signatures for monitoring tissue-specific aging and disease",
      abstract:
        "We analyzed 25,712 whole-slide histopathological images from 40 tissue types across 983 GTEx donors collected under a rapid autopsy protocol.",
    });
    const subjects = detectStudySubjects(gtex);
    const classified = classifyEvidence(gtex);
    assert.ok(subjects.includes("deceased-donor-tissue"));
    assert.equal(subjects.includes("living-people"), false);
    assert.equal(classified.evidence, "Evidence C");
    assert.ok(classified.notes.some((note) => /not living-participant/i.test(note)));
  });
});
