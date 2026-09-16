import type { EvidenceLevel } from "../data/news";
import { FIELD_IDS, type FieldId } from "../lib/fields";
import { RANK_THRESHOLDS, type RankedRecord, type FetchedRecord } from "./types";

/**
 * Explainable keyword rules. Hits are counted; nothing is inferred about
 * study quality from a keyword match. Automated ingest never assigns
 * Evidence A or B — those require a human reading the primary source.
 */

const AGING_CORE = [
  "aging",
  "ageing",
  "senescence",
  "senescent",
  "longevity",
  "geroscience",
  "healthspan",
  "lifespan",
  "biological age",
  "biological aging",
  "epigenetic clock",
  "aging clock",
  "senolytic",
  "cellular reprogramming",
  "rejuvenation",
];

const FIELD_KEYWORDS: Record<FieldId, string[]> = {
  "rejuvenation-regeneration": [
    "senolytic",
    "senescent",
    "senescence",
    "reprogramming",
    "rejuvenation",
    "regeneration",
    "stem cell",
    "oskm",
    "yap",
    "tissue repair",
  ],
  "biomarkers-diagnostics": [
    "biomarker",
    "epigenetic clock",
    "aging clock",
    "biological age",
    "dna methylation",
    "proteomic clock",
    "diagnostic",
    "surrogate endpoint",
  ],
  "geroscience-drugs-trials": [
    "rapamycin",
    "sirolimus",
    "metformin",
    "senolytic",
    "clinical trial",
    "randomized",
    "geroprotect",
    "caloric restriction mimetic",
    "nad+",
    "nmn",
    "sglt2",
  ],
  "gene-therapy-delivery": [
    "gene therapy",
    "gene editing",
    "crispr",
    "aav",
    "viral vector",
    "base editing",
    "prime editing",
    "lnp delivery",
  ],
  "ai-drug-discovery": [
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "ai-designed",
    "generative model",
    "in silico",
    "drug discovery",
  ],
  "organ-replacement-biofabrication": [
    "organoid",
    "bioprint",
    "biofabrication",
    "engineered tissue",
    "xenotransplant",
    "organ replacement",
    "transplantation",
  ],
  "immune-engineering-cancer-control": [
    "immune",
    "immunosenescence",
    "inflammaging",
    "inflammation",
    "cancer",
    "car-t",
    "checkpoint",
    "tnf",
  ],
  "enabling-technology-automation": [
    "high-throughput",
    "laboratory automation",
    "robotics",
    "biomanufacturing",
    "screening platform",
    "lab automation",
  ],
};

const ANIMAL_PATTERNS = [
  /\bmice\b/i,
  /\bmouse\b/i,
  /\bmurine\b/i,
  /\brats?\b/i,
  /\bminipigs?\b/i,
  /\bminiature pigs?\b/i,
  /\bzebrafish\b/i,
  /\bdrosophila\b/i,
  /\bc\.?\s*elegans\b/i,
  /\bcaenorhabditis\b/i,
];

const CELL_ORGANOID_PATTERNS = [
  /\bin vitro\b/i,
  /\bcell cultures?\b/i,
  /\bcultured cells\b/i,
  /\bcell lines?\b/i,
  /\borganoids?\b/i,
  /\bin vitro expansion\b/i,
  /\breplicative senescence\b/i,
  /\bpassage points?\b/i,
  /\boverexpression\b/i,
  /\btransfect(?:ed|ion)\b/i,
  /\bknockdown\b/i,
  /\bh2o2-induced\b/i,
  /\bh₂o₂-induced\b/i,
  /\bprimary .{0,40}fibroblasts?\b/i,
  /\bfibroblasts? isolated\b/i,
  /\bisolated from\b/i,
  /\bmesenchymal stem cells\b/i,
  /\bMSC replicative senescence\b/i,
  /\bstem cell senescence\b/i,
  /\bcellular senescence\b/i,
];

const HUMAN_ORIGIN_ONLY_PATTERNS = [
  /\bhuman (?:umbilical|dental|mesenchymal|embryonic|induced pluripotent|dermal|primary|adipose)\b/i,
  /\bhuman .{0,40}(?:cells?|fibroblasts?|organoids?|mscs?|dfscs?|stem cells?)\b/i,
  /\brecombinant human\b/i,
  /\bhuman msc\b/i,
];

const LIVING_HUMAN_SUBJECT_PATTERNS = [
  /(?<!\bno\s)(?<!\bwithout\s)\bparticipants\b/i,
  /\bwe enrolled\b/i,
  /\benrolled \d+/i,
  /\bcohort study\b/i,
  /\bpopulation-based\b/i,
  /\bnhanes\b/i,
  /\buk biobank\b/i,
  /\bmedian follow-up\b/i,
  /\ball-cause mortality\b/i,
  /\bpatients were (?:randomized|randomised|enrolled|followed|recruited)\b/i,
  /\brandomized (?:patients|participants|adults)\b/i,
  /\brandomised (?:patients|participants|adults)\b/i,
  /\badults aged\b/i,
  /\bsurvey of (?:adults|patients|participants)\b/i,
  /\bpatients with\b/i,
  /\bcancer patients\b/i,
];

const TISSUE_DONOR_ONLY_PATTERNS = [
  /\bisolated from .{0,60}patients?\b/i,
  /\btissues? of .{0,60}patients?\b/i,
  /\bderived from .{0,40}patients?\b/i,
  /\bfrom pop patients\b/i,
];

const REVIEW_TITLE_PATTERN =
  /\bsystematic review\b|\bmeta-analysis\b|\bnarrative review\b|\bscoping review\b|\bliterature review\b/i;

function listedMatches(text: string, patterns: RegExp[]): string[] {
  const hits: string[] = [];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[0]) hits.push(match[0].toLowerCase());
  }
  return [...new Set(hits)];
}

function isReviewRecord(title: string, pubTypes: string[], text = ""): boolean {
  return (
    REVIEW_TITLE_PATTERN.test(title) ||
    pubTypes.some((type) => type.includes("review") || type.includes("meta-analysis")) ||
    /\bin this (?:systematic |narrative |scoping )?review\b/i.test(text)
  );
}

function isOpinionRecord(title: string, pubTypes: string[]): boolean {
  const blob = `${title} ${pubTypes.join(" ")}`.toLowerCase();
  return (
    pubTypes.some((type) =>
      ["preprint", "comment", "editorial", "letter", "news"].some((label) => type.includes(label)),
    ) || /\b(preprint|commentary|editorial|letter to the editor)\b/i.test(blob)
  );
}

/**
 * Living people as the unit of analysis, not the word "human" and not
 * human-derived cells, tissues, or organoids used as experimental material.
 */
export function detectStudySubjects(record: FetchedRecord): string[] {
  const text = haystack(record);
  const subjects: string[] = [];
  if (livingHumanSubjectHits(text).length > 0) subjects.push("living-people");
  if (CELL_ORGANOID_PATTERNS.some((pattern) => pattern.test(text))) subjects.push("cells-tissues-organoids");
  if (/\bmice\b|\bmouse\b|\bmurine\b/i.test(text)) subjects.push("mice");
  if (/\brats?\b/i.test(text)) subjects.push("rats");
  if (/\bminipigs?\b|\bminiature pigs?\b/i.test(text)) subjects.push("minipigs");
  if (/\bzebrafish\b/i.test(text)) subjects.push("zebrafish");
  if (/\bdrosophila\b/i.test(text)) subjects.push("flies");
  if (/\bc\.?\s*elegans\b|\bcaenorhabditis\b/i.test(text)) subjects.push("worms");
  return subjects;
}

function livingHumanSubjectHits(text: string): string[] {
  if (HUMAN_ORIGIN_ONLY_PATTERNS.some((pattern) => pattern.test(text)) &&
      !LIVING_HUMAN_SUBJECT_PATTERNS.some((pattern) => pattern.test(text))) {
    return [];
  }
  const hits = listedMatches(text, LIVING_HUMAN_SUBJECT_PATTERNS);
  if (hits.length === 0) return [];
  if (
    TISSUE_DONOR_ONLY_PATTERNS.some((pattern) => pattern.test(text)) &&
    !/\bparticipants\b|\bcohort study\b|\bnhanes\b|\bwe enrolled\b|\bmedian follow-up\b/i.test(text)
  ) {
    return [];
  }
  return hits;
}

/**
 * Conservative evidence labels. Registration is never treated as proof of
 * human efficacy. Automated ingest does not assign Evidence A or B.
 * Human-derived cells, tissues, and organoids are Evidence D.
 */
export function classifyEvidence(record: FetchedRecord): { evidence: EvidenceLevel; notes: string[] } {
  const notes: string[] = [];
  const text = haystack(record);
  const title = record.title.toLowerCase();
  const pubTypes = (record.hints?.pubTypes ?? []).map((value) => value.toLowerCase());

  if (record.sourceId === "clinicaltrials") {
    if (record.hints?.hasResults) {
      notes.push("registry record reports posted results; design and endpoints were not independently verified, so this stays at Evidence C");
      return { evidence: "Evidence C", notes };
    }
    notes.push("trial registration or update only; not evidence that an intervention works in humans");
    return { evidence: "Evidence E", notes };
  }

  if (isOpinionRecord(record.title, pubTypes)) {
    notes.push("preprint, comment, editorial, or letter publication type");
    return { evidence: "Evidence E", notes };
  }

  const cellHits = listedMatches(text, CELL_ORGANOID_PATTERNS);
  const animalHits = listedMatches(text, ANIMAL_PATTERNS);
  const peopleHits = livingHumanSubjectHits(text);
  const subjects = detectStudySubjects(record);
  if (subjects.length > 0) notes.push(`study subjects recorded: ${subjects.join(", ")}`);
  const review = isReviewRecord(title, pubTypes, text);

  if (review) {
    if (peopleHits.length > 0 && cellHits.length === 0 && animalHits.length === 0) {
      notes.push(`review of human studies (${peopleHits.slice(0, 3).join(", ")}); not verified as RCT evidence, so not Evidence A or B`);
      return { evidence: "Evidence C", notes };
    }
    if ((cellHits.length > 0 || animalHits.length > 0) && peopleHits.length === 0) {
      notes.push(`review of preclinical work (${[...cellHits, ...animalHits].slice(0, 4).join(", ")})`);
      return { evidence: "Evidence D", notes };
    }
    notes.push("review or meta-analysis, but the underlying study population is not clear from title/abstract; classification basis insufficient");
    return { evidence: "Evidence E", notes };
  }

  if ((cellHits.length > 0 || animalHits.length > 0) && peopleHits.length === 0) {
    if (cellHits.length > 0 && animalHits.length > 0) {
      notes.push("preclinical experiment spanning cells/tissues and animal models; not classified as cells-only");
    } else if (cellHits.length > 0) {
      notes.push(`cell, tissue, in-vitro, or organoid experiment (${cellHits.slice(0, 4).join(", ")}); human-derived material is not a study in living people`);
    } else {
      notes.push(`animal experiment (${animalHits.slice(0, 3).join(", ")}); mentions of human relevance do not upgrade this`);
    }
    return { evidence: "Evidence D", notes };
  }

  if (peopleHits.length > 0) {
    notes.push(`living people appear to be the study population (${peopleHits.slice(0, 3).join(", ")}), but design, size, and endpoints were not verified, so this is not graded as Evidence A or B`);
    return { evidence: "Evidence C", notes };
  }

  notes.push("title/abstract do not establish whether the subjects were living people, animals, or cells; classification basis insufficient");
  return { evidence: "Evidence E", notes };
}

function haystack(record: FetchedRecord): string {
  return `${record.title}\n${record.abstract ?? ""}`.toLowerCase();
}

function countHits(text: string, terms: string[]): string[] {
  return terms.filter((term) => text.includes(term));
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function classifyField(record: FetchedRecord): { fieldId: FieldId; hits: string[] } {
  const text = haystack(record);
  let best: FieldId = "geroscience-drugs-trials";
  let bestScore = -1;
  let bestHits: string[] = [];

  for (const fieldId of FIELD_IDS) {
    const hits = countHits(text, FIELD_KEYWORDS[fieldId]);
    if (hits.length > bestScore) {
      best = fieldId;
      bestScore = hits.length;
      bestHits = hits;
    }
  }

  if (bestScore <= 0) {
    return {
      fieldId: "geroscience-drugs-trials",
      hits: [],
    };
  }
  return { fieldId: best, hits: bestHits };
}

export function scoreRelevance(record: FetchedRecord, fieldHits: string[]): { score: number; notes: string[] } {
  const title = record.title.toLowerCase();
  const abstract = (record.abstract ?? "").toLowerCase();
  const notes: string[] = [];
  let score = 0;

  const titleAging = countHits(title, AGING_CORE);
  const abstractAging = countHits(abstract, AGING_CORE);
  if (titleAging.length > 0) {
    score += 50;
    notes.push(`aging/longevity terms in title: ${titleAging.slice(0, 4).join(", ")}`);
  } else if (abstractAging.length > 0) {
    score += 25;
    notes.push(`aging/longevity terms in abstract: ${abstractAging.slice(0, 4).join(", ")}`);
  }

  if (fieldHits.length > 0) {
    const titleField = fieldHits.filter((hit) => title.includes(hit));
    if (titleField.length > 0) {
      score += 25;
      notes.push(`field terms in title: ${titleField.slice(0, 4).join(", ")}`);
    } else {
      score += 10;
      notes.push(`field terms in abstract: ${fieldHits.slice(0, 4).join(", ")}`);
    }
  } else {
    notes.push("no field-specific terms; assigned the generic geroscience bucket");
  }

  if (record.sourceId === "clinicaltrials" && (record.hints?.phases ?? []).some((phase) => /PHASE[34]/.test(phase))) {
    score += 5;
    notes.push("late-phase registered trial");
  }

  return { score: clampScore(score), notes };
}

/**
 * Significance is independent of Evidence. The letter is the study class;
 * this number is triage of what the fetched title/abstract actually reports.
 *
 * BASE 20
 * Directness (one): lifespan/healthspan/longevity/geroscience in title +12;
 *   aging/senescence/clock as title focus +6
 * Intervention applied in this study +8
 * Reported change (one, same sentence, verb + endpoint):
 *   organism lifespan +18; organism function +12; aging-marker +3
 *   Cell survival, disease survival, citations, aims, and negative/null
 *   results are not scored as demonstrated improvement. Ambiguous cases
 *   withhold the outcome points.
 * Design (one): randomized/placebo-controlled +8; compared with a control +5;
 *   observational association +3
 * Reviews get +6 for synthesis and do not inherit included studies' results
 */
export const SIGNIFICANCE_BASE = 20;

export function scoreSignificance(record: FetchedRecord): { score: number; notes: string[] } {
  if (record.sourceId === "clinicaltrials") {
    return scoreTrialSignificance(record);
  }
  return scorePaperSignificance(record);
}

const LIFESPAN_ENDPOINT = /\b(?:median\s+|mean\s+|maximum\s+)?(?:lifespan|healthspan)\b/i;
const FUNCTION_ENDPOINT =
  /\b(?:grip strength|rotarod|frailty index|physical function|walking speed|endurance|motor function)\b/i;
const MARKER_ENDPOINT =
  /\b(?:biological age|epigenetic age|aging clock|ageing clock|clock score|p16|sa-β-gal|cellular senescence)\b/i;
const CHANGE_VERB =
  /\b(?:increas(?:e|es|ed)|decreas(?:e|es|ed)|extends|extended|reduc(?:e|es|ed)|improv(?:e|es|ed)|delay(?:s|ed)?|shorten(?:s|ed)?|alleviat(?:e|es|ed)|was higher|was lower)\b/i;
const INTERVENTION_APPLIED =
  /\b(?:treated with|administered|dosed with|received (?:vehicle|drug|compound)|overexpression|knockout|knock-in|senolytic treatment)\b/i;

type OutcomeKind = "lifespan" | "function" | "marker";

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function isBackgroundSentence(sentence: string): boolean {
  return /\b(?:previous(?:ly)?(?:\s+\w+){0,6}\s+show(?:ed|n)?|prior studies|it is known|has been (?:shown|reported)|have shown|recently reported|is known to)\b/i.test(
    sentence,
  );
}

function isAimOrPlanSentence(sentence: string): boolean {
  return /\b(?:aim(?:s|ed)? (?:to|at)|the objective|we hypothesized|hypothesis|will (?:be )?(?:assess(?:ed)?|evaluate[d]?|determine[d]?|measure[d]?)|to determine whether|this study (?:will|seeks)|is designed to|potential interventions?|to (?:preserve|restore|extend|improve))\b/i.test(
    sentence,
  );
}

function isNegativeOrNullSentence(sentence: string): boolean {
  return /\b(?:did not|does not|was not|were not|no significant|not significant|non-significant|failed to|unchanged|not (?:increased|decreased|extended|improved|reduced)|neither .{0,40} nor)\b/i.test(
    sentence,
  );
}

function isCellSurvivalContext(sentence: string): boolean {
  return /\b(?:cell survival|cell viability|survival of .{0,40}cells?|hdmec survival|endothelial survival|in vitro survival)\b/i.test(
    sentence,
  );
}

function isDiseaseSurvivalContext(sentence: string): boolean {
  return /\b(?:overall survival|progression-free survival|disease-free survival|cancer survival|patient survival|survival rate of patients|breast cancer.{0,40}survival)\b/i.test(
    sentence,
  );
}

function isOrganismLifespanContext(sentence: string): boolean {
  if (/\b(?:median|mean|maximum)?\s*(?:life|health)span\b/i.test(sentence) || /\blongevity\b/i.test(sentence)) {
    return !isCellSurvivalContext(sentence);
  }
  return (
    /\bsurvival\b/i.test(sentence) &&
    /\b(?:mice|mouse|rats?|animals?|organisms?|worms?|flies|zebrafish|minipigs?|miniature pigs?)\b/i.test(sentence) &&
    !isCellSurvivalContext(sentence) &&
    !isDiseaseSurvivalContext(sentence)
  );
}

function sentenceHasChangeVerb(sentence: string): boolean {
  return CHANGE_VERB.test(sentence);
}

function classifySentenceOutcome(sentence: string): { kind?: OutcomeKind; skip?: string } | undefined {
  if (isCellSurvivalContext(sentence)) return { skip: "cell-survival" };
  if (isDiseaseSurvivalContext(sentence) && !/\b(?:lifespan|healthspan)\b/i.test(sentence)) {
    return { skip: "disease-survival" };
  }
  if (isOrganismLifespanContext(sentence) || LIFESPAN_ENDPOINT.test(sentence)) return { kind: "lifespan" };
  if (/\bsurvival\b/i.test(sentence)) return { skip: "ambiguous-survival" };
  if (FUNCTION_ENDPOINT.test(sentence)) return { kind: "function" };
  if (MARKER_ENDPOINT.test(sentence)) return { kind: "marker" };
  return undefined;
}

function scoreReportedOutcomes(text: string): { kind?: OutcomeKind; notes: string[] } {
  const notes: string[] = [];
  let awarded: OutcomeKind | undefined;
  let withheld = false;

  for (const sentence of splitSentences(text)) {
    const classified = classifySentenceOutcome(sentence);
    if (!classified) continue;

    if (classified.skip === "cell-survival") {
      notes.push("cell survival or viability is not scored as organism lifespan");
      continue;
    }
    if (classified.skip === "disease-survival") {
      notes.push("disease-specific survival is not scored as an aging or lifespan outcome");
      continue;
    }
    if (classified.skip === "ambiguous-survival") {
      notes.push("bare survival wording is ambiguous between cells, disease, and organism lifespan; outcome points withheld");
      withheld = true;
      continue;
    }
    if (!classified.kind) continue;
    if (isBackgroundSentence(sentence)) {
      notes.push("background or previously reported findings are not scored as this study's result");
      withheld = true;
      continue;
    }
    if (isAimOrPlanSentence(sentence)) {
      notes.push("aim, hypothesis, or planned endpoint is not scored as a reported result");
      withheld = true;
      continue;
    }
    if (isNegativeOrNullSentence(sentence)) {
      notes.push("negative or non-significant finding is not scored as demonstrated improvement");
      withheld = true;
      continue;
    }
    if (!sentenceHasChangeVerb(sentence)) continue;
    const rank = { lifespan: 3, function: 2, marker: 1 }[classified.kind];
    const current = awarded ? { lifespan: 3, function: 2, marker: 1 }[awarded] : 0;
    if (rank > current) awarded = classified.kind;
  }

  if (awarded === "lifespan") {
    notes.push("reported a lifespan or survival change, not merely the word lifespan (+18)");
  } else if (awarded === "function") {
    notes.push("reported an organism-level function change (+12)");
  } else if (awarded === "marker") {
    notes.push("reported an aging-marker or cellular-senescence change, not lifespan or function (+3)");
  } else if (withheld) {
    notes.push("outcome points withheld pending manual review");
  }

  return { kind: awarded, notes: [...new Set(notes)] };
}

function scorePaperSignificance(record: FetchedRecord): { score: number; notes: string[] } {
  const notes: string[] = [];
  const title = record.title;
  const text = haystack(record);
  const pubTypes = (record.hints?.pubTypes ?? []).map((value) => value.toLowerCase());
  const review = isReviewRecord(title.toLowerCase(), pubTypes, text);
  let score = SIGNIFICANCE_BASE;
  notes.push(`base ${SIGNIFICANCE_BASE}; not set from Evidence letter`);

  if (/\b(?:lifespan|healthspan|longevity|geroscience)\b/i.test(title)) {
    score += 12;
    notes.push("title focuses on lifespan, healthspan, longevity, or geroscience (+12)");
  } else if (/\b(?:aging|ageing|senescence|senolytic|biological age|aging clock|ageing clock)\b/i.test(title)) {
    score += 6;
    notes.push("title focuses on aging biology, senescence, or an aging clock (+6)");
  }

  if (review) {
    score += 6;
    notes.push("review/meta-analysis synthesis (+6); included studies' results are not scored as this paper's experiment");
    notes.push("significance is triage of reported content, not a calibrated scientific index");
    return { score: clampScore(score), notes };
  }

  if (INTERVENTION_APPLIED.test(text)) {
    score += 8;
    notes.push("abstract reports an intervention applied in this study (+8)");
  }

  const outcomes = scoreReportedOutcomes(text);
  notes.push(...outcomes.notes);
  if (outcomes.kind === "lifespan") score += 18;
  else if (outcomes.kind === "function") score += 12;
  else if (outcomes.kind === "marker") score += 3;

  if (/\b(?:randomized|randomised|placebo-controlled)\b/i.test(text)) {
    score += 8;
    notes.push("text reports randomization or placebo control (+8)");
  } else if (/\b(?:compared with|versus|vehicle control|control group)\b/i.test(text)) {
    score += 5;
    notes.push("text reports a control comparison (+5)");
  } else if (
    livingHumanSubjectHits(text).length > 0 &&
    /\b(?:associated with|hazard ratio|correlation)\b/i.test(text)
  ) {
    score += 3;
    notes.push("text reports an observational association in living people, not an experimental effect (+3)");
  }

  notes.push("no effect size, novelty, or causality is inferred beyond the wording above");
  notes.push("significance is triage of reported content, not a calibrated scientific index");
  return { score: clampScore(score), notes };
}

/**
 * Trial significance is independent of Evidence. Registration is never
 * efficacy, but a newly posted interventional trial can still matter as
 * an event. Phase changes are not inferred from lastUpdatePostDate alone.
 */
function scoreTrialSignificance(record: FetchedRecord): { score: number; notes: string[] } {
  const notes: string[] = [];
  const studyType = (record.hints?.studyType ?? "").toUpperCase();
  const phases = (record.hints?.phases ?? []).map((phase) => phase.toUpperCase());
  const status = (record.hints?.overallStatus ?? "").toUpperCase();
  const firstPostedInWindow = record.windowMatch.matchedFields.includes("studyFirstPostDate");
  const updateInWindow = record.windowMatch.matchedFields.includes("lastUpdatePostDate");
  let score = 32;

  if (studyType === "INTERVENTIONAL") {
    if (phases.some((phase) => phase === "PHASE3" || phase === "PHASE4")) {
      score = 55;
      notes.push("interventional Phase 3/4 from the registry snapshot");
    } else if (phases.some((phase) => phase === "PHASE2")) {
      score = 48;
      notes.push("interventional Phase 2 from the registry snapshot");
    } else if (phases.some((phase) => phase === "PHASE1")) {
      score = 42;
      notes.push("interventional Phase 1 from the registry snapshot");
    } else {
      score = 40;
      notes.push("interventional trial; phase not specified in the fetched record");
    }
  } else if (studyType === "OBSERVATIONAL") {
    score = 36;
    notes.push("observational registry record");
  } else if (studyType) {
    score = 34;
    notes.push(`study type ${studyType}`);
  } else {
    notes.push("study type was not present in the fetched record");
  }

  if (firstPostedInWindow) {
    score += 5;
    notes.push("StudyFirstPostDate is inside the lookback window (new public registration)");
  } else if (updateInWindow) {
    notes.push("LastUpdatePostDate is in-window but first posted date is older; this snapshot does not identify what changed and is not treated as a phase transition");
  }

  if (status === "RECRUITING" && firstPostedInWindow) {
    score += 4;
    notes.push("OverallStatus is RECRUITING on a record first posted in-window");
  } else if (status === "RECRUITING") {
    notes.push("OverallStatus is currently RECRUITING; without a first-posted-in-window date this is not recorded as a recruitment start");
  } else if (status) {
    notes.push(`OverallStatus=${status}`);
  }

  if (record.hints?.hasResults) {
    score += 6;
    notes.push("results are posted on the registry record");
  }

  notes.push("significance here is trial-activity triage, not evidence of human efficacy");
  return { score: clampScore(score), notes };
}

export function rankRecord(record: FetchedRecord): RankedRecord {
  const field = classifyField(record);
  const evidence = classifyEvidence(record);
  const relevance = scoreRelevance(record, field.hits);
  const significance = scoreSignificance(record);
  const studySubjects = detectStudySubjects(record);
  const reason = [
    `field=${field.fieldId}`,
    `evidence=${evidence.evidence}`,
    ...evidence.notes,
    ...relevance.notes,
    ...significance.notes,
    `thresholds: relevance>=${RANK_THRESHOLDS.minRelevance}, significance>=${RANK_THRESHOLDS.minSignificance}`,
    "Scores are rule-based triage, not a calibrated scientific index.",
  ].join("; ");

  return {
    ...record,
    studySubjects,
    fieldId: field.fieldId,
    evidence: evidence.evidence,
    relevanceScore: relevance.score,
    significanceScore: significance.score,
    reason,
  };
}

export function passesRankThresholds(record: RankedRecord): boolean {
  return (
    record.relevanceScore >= RANK_THRESHOLDS.minRelevance &&
    record.significanceScore >= RANK_THRESHOLDS.minSignificance
  );
}
