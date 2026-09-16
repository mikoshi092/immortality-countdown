/**
 * FIXTURES — synthetic records for rank tests only.
 * These are not live ingest output and must not be mixed into
 * automation/output/candidates.json.
 */
import { constructClinicalTrialsUrl, constructPubmedUrl, matchWindow } from "./fetch";
import type { FetchedRecord } from "./types";

const window = {
  from: new Date("2026-09-14T01:00:00Z"),
  to: new Date("2026-09-16T01:00:00Z"),
  fromDay: "2026-09-14",
  toDay: "2026-09-16",
};

function fixtureRecord(overrides: Partial<FetchedRecord> & Pick<FetchedRecord, "recordId" | "title" | "abstract">): FetchedRecord {
  const dateFields = { publicationDate: "2026-09-15T00:00:00Z", entrezDate: "2026-09-15T16:53:00Z" };
  return {
    sourceId: "pubmed",
    sourceName: "PubMed",
    sourceUrl: constructPubmedUrl("00000000"),
    urlOrigin: { kind: "constructed-from-id", rule: "fixture", id: "00000000" },
    publishedAt: "2026-09-15T00:00:00Z",
    fetchedAt: "2026-09-16T01:00:00Z",
    dateFields,
    windowMatch: matchWindow(dateFields, window),
    ...overrides,
  };
}

/** FIXTURE: important preclinical animal study with a reported lifespan change. */
export const FIXTURE_IMPORTANT_PRECLINICAL_D = fixtureRecord({
  recordId: "fixture-important-preclinical-d",
  title: "Senolytic treatment extends lifespan in aged mice",
  abstract:
    "Aged mice were treated with dasatinib plus quercetin. Median lifespan was extended from 94 to 118 weeks compared with vehicle control. This is a fixture abstract for tests, not a real paper.",
});

/** FIXTURE: ordinary in-vitro cell profiling, no organism outcome. */
export const FIXTURE_GENERIC_CELL_D = fixtureRecord({
  recordId: "fixture-generic-cell-d",
  title: "Transcriptomic profiling of replicative senescence in cultured mesenchymal stem cells",
  abstract:
    "We performed splicing-aware transcriptomic profiling of human umbilical cord derived MSCs across four passage points in vitro. This is a fixture abstract for tests, not a real paper.",
});

/** FIXTURE: human observational association, not an interventional result. */
export const FIXTURE_HUMAN_OBSERVATIONAL_C = fixtureRecord({
  recordId: "fixture-human-observational-c",
  title: "Biological age clocks and periodontitis in a population-based cohort",
  abstract:
    "We analyzed 399 participants in NHANES. Higher clock scores were associated with periodontitis. This is a fixture abstract for tests, not a real paper.",
});

/** FIXTURE: trial registration without posted efficacy results. */
export const FIXTURE_TRIAL_REGISTRATION_E = fixtureRecord({
  recordId: "fixture-trial-registration-e",
  sourceId: "clinicaltrials",
  sourceUrl: constructClinicalTrialsUrl("NCT00000000"),
  title: "Phase 2 randomized trial of a senolytic in aging adults",
  abstract: "This registered interventional trial will enroll patients aged 50 and older. Fixture, not a real registry row.",
  windowMatch: { inWindow: true, matchedFields: ["studyFirstPostDate"] },
  hints: {
    studyType: "INTERVENTIONAL",
    phases: ["PHASE2"],
    hasResults: false,
    overallStatus: "RECRUITING",
  },
});

/** FIXTURE: condensed 42733811-like preclinical paper with cells, mice, and minipigs. */
export const FIXTURE_MULTIMODEL_PRECLINICAL_D = fixtureRecord({
  recordId: "fixture-multimodel-preclinical-d",
  title:
    "SFL-3D-cultured adipose mesenchymal cell-derived extracellular vesicles promote diabetic wound healing by alleviating microvascular endothelial senescence",
  abstract:
    "In vitro, high-glucose-induced HDMECs were treated with tdASC-EVs, after which senescence was assessed. In vivo, a diabetic mouse wound model was used to evaluate efficacy. In the Bama miniature pig diabetic large animal model, tdASC-EVs exhibited faster wound closure. This is a fixture abstract for tests, not a live ingest row.",
});
