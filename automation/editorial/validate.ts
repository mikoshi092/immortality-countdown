import { FIELD_IDS } from "../../lib/fields";
import type { EvidenceLevel } from "../../data/news";
import {
  type Article,
  type ArticleCopy,
  type ArticleFacts,
} from "../../data/articles";
import { canonicalUrl, normalizeDoi } from "../fetch";
import { hasLivingPeople, subjectKinds, type SubjectKind } from "../../lib/study-subjects";
import { RANK_THRESHOLDS, type Candidate } from "../types";
import type { EditorialDraft } from "./types";
import { inferContentType } from "./from-candidate";
import { isScienceNews } from "../science-news";

const CONTENT_LABEL: Record<Article["contentType"], string> = {
  paper: "paper",
  review: "review",
  "trial-registration": "trial registration",
  "science-news": "science news",
};

const SCIENCE_NEWS_LABEL = /science news report|科学ニュース報道/i;
const NEWS_POPULATION_PLACEHOLDER = /not assessed in this news report|本報道では研究対象を検証していない/i;

const EVIDENCE_RANK: Record<EvidenceLevel, number> = {
  "Evidence A": 5,
  "Evidence B": 4,
  "Evidence C": 3,
  "Evidence D": 2,
  "Evidence E": 1,
};

const HYPE = [
  "breakthrough",
  "cure",
  "miracle",
  "proven",
  "revolutionary",
  "reverses aging",
  "革命的",
  "奇跡",
  "完治",
  "不老長寿の実現",
];

const NEGATION_EN = [
  "not significant",
  "no association",
  "no significant",
  "non-significant",
  "nonsignificant",
  "failed",
  "did not",
  "no effect",
  "was not",
  "were not",
  "no evidence",
];

const NEGATION_JA = [
  "有意差なし",
  "有意ではなかった",
  "関連なし",
  "認められなかった",
  "失敗",
  "示されていない",
  "言えない",
  "効果はなかった",
  "関連しなかった",
];

const LIVING_CLAIM_EN =
  /\b(patients?|participants?|we enrolled|enrolled \d+)\b/i;
const LIVING_CLAIM_JA = /患者|参加者|ヒトの老化|人の寿命を|人で遅らせ|人で改善/;

const SUBJECT_MENTIONS: Record<
  string,
  { label: string; en: RegExp; ja: RegExp }
> = {
  "living-people": {
    label: "living people",
    en: /\b(participants?|patients?|enrolled|cohort)\b/i,
    ja: /参加者|患者|登録/,
  },
  mice: { label: "mice", en: /\b(mice|mouse|murine)\b/i, ja: /マウス/ },
  rats: { label: "rats", en: /\brats?\b/i, ja: /ラット/ },
  minipigs: { label: "minipigs", en: /\bminipigs?\b/i, ja: /ミニブタ|ブタ/ },
  zebrafish: { label: "zebrafish", en: /\bzebrafish\b/i, ja: /ゼブラフィッシュ/ },
  flies: { label: "flies", en: /\b(drosophila|flies|fly)\b/i, ja: /ハエ|ショウジョウバエ/ },
  worms: { label: "worms", en: /\b(c\.?\s*elegans|worms?|nematode)\b/i, ja: /線虫|ワーム/ },
  "cells-tissues-organoids": {
    label: "cells or organoids",
    en: /\b(cells?|organoids?|in vitro)\b/i,
    ja: /細胞|オルガノイド|in vitro/,
  },
  "deceased-donor-tissue": {
    label: "deceased-donor tissue",
    en: /\b(gtex|donor|autopsy|post-?mortem|histolog|tissue)\b/i,
    ja: /GTEx|ドナー|剖検|死後|組織|病理/,
  },
  "human-tissue": {
    label: "human tissue",
    en: /\b(human tissue|tissues?|histolog|whole-slide)\b/i,
    ja: /ヒト組織|組織|病理/,
  },
};

export type Quantity = { value: string; unit: string };

function factValues(facts: ArticleFacts): string[] {
  return Object.values(facts).filter((value): value is string => typeof value === "string");
}

function copyText(copy: ArticleCopy): string {
  return `${copy.headline}\n${copy.dek}\n${copy.whatHappened}\n${copy.whyItMatters}\n${copy.realityCheck}`;
}

function languageDisplayText(copy: ArticleCopy, facts: ArticleFacts): string {
  return `${copyText(copy)}\n${factValues(facts).join("\n")}`;
}

export function allDraftText(
  draft: Pick<EditorialDraft, "localizedFacts" | "en" | "ja">,
): string {
  return [
    languageDisplayText(draft.en, draft.localizedFacts.en),
    languageDisplayText(draft.ja, draft.localizedFacts.ja),
  ].join("\n");
}

function stripIds(text: string): string {
  return text
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/10\.\d{4,9}\/\S+/g, " ")
    .replace(/\bNCT\d+\b/gi, " ")
    .replace(/\b20\d{2}\b/g, " ")
    .replace(/\bpmid\s*\d+\b/gi, " ");
}

export function extractQuantities(text: string): Quantity[] {
  const stripped = stripIds(text);
  const found: Quantity[] = [];
  const re =
    /(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+|\d+)(?:\s*(%|％|years?|year|months?|weeks?|days?|hours?|mg|μg|ug|µg|kg|ml))?/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(stripped))) {
    const raw = match[1];
    if (!raw) continue;
    const numeric = Number(raw.replaceAll(",", ""));
    if (!Number.isFinite(numeric)) continue;
    if (numeric < 2 && !match[2] && !raw.includes(".")) continue;
    found.push({
      value: String(numeric),
      unit: (match[2] ?? "").replace("％", "%").replace("µg", "ug").replace("μg", "ug").toLowerCase(),
    });
  }
  return found;
}

function sameMembers(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  const rightSorted = [...right].sort();
  return [...left].sort().every((value, index) => value === rightSorted[index]);
}

function quantityKey(item: Quantity): string {
  return `${item.value}|${item.unit}`;
}

function quantitySet(text: string): Set<string> {
  return new Set(extractQuantities(text).map(quantityKey));
}

function compareQuantitySets(
  left: Set<string>,
  right: Set<string>,
  label: string,
  reasons: string[],
): void {
  for (const key of left) {
    if (!right.has(key)) reasons.push(`${label}: ${key}`);
  }
  for (const key of right) {
    if (!left.has(key)) reasons.push(`${label}: ${key}`);
  }
}

function detectedKinds(text: string): Set<SubjectKind> {
  const kinds = new Set<SubjectKind>();
  if (LIVING_CLAIM_EN.test(text) || LIVING_CLAIM_JA.test(text)) kinds.add("human");
  if (SUBJECT_MENTIONS.mice.en.test(text) || SUBJECT_MENTIONS.mice.ja.test(text)) {
    kinds.add("animal");
  }
  if (
    SUBJECT_MENTIONS["cells-tissues-organoids"].en.test(text) ||
    SUBJECT_MENTIONS["cells-tissues-organoids"].ja.test(text)
  ) {
    kinds.add("cell");
  }
  if (
    SUBJECT_MENTIONS["deceased-donor-tissue"].en.test(text) ||
    SUBJECT_MENTIONS["deceased-donor-tissue"].ja.test(text) ||
    SUBJECT_MENTIONS["human-tissue"].en.test(text) ||
    SUBJECT_MENTIONS["human-tissue"].ja.test(text)
  ) {
    kinds.add("tissue");
  }
  return kinds;
}

function hasNegation(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    NEGATION_EN.some((term) => lower.includes(term)) ||
    NEGATION_JA.some((term) => text.includes(term))
  );
}

function isNonEmptyCopy(copy: ArticleCopy | undefined): copy is ArticleCopy {
  if (!copy) return false;
  return (
    typeof copy.headline === "string" &&
    copy.headline.trim().length > 0 &&
    typeof copy.dek === "string" &&
    copy.dek.trim().length > 0 &&
    typeof copy.whatHappened === "string" &&
    copy.whatHappened.trim().length > 0 &&
    typeof copy.whyItMatters === "string" &&
    copy.whyItMatters.trim().length > 0 &&
    typeof copy.realityCheck === "string" &&
    copy.realityCheck.trim().length >= 20
  );
}

export function sourceMaterials(candidate: Candidate): string {
  return [
    candidate.title,
    candidate.abstract ?? "",
    candidate.publishedAt,
    ...(candidate.studySubjects ?? []),
    JSON.stringify(candidate.dateFields ?? {}),
    candidate.hints?.studyType ?? "",
    ...(candidate.hints?.phases ?? []),
    candidate.hints?.overallStatus ?? "",
    candidate.hints?.hasResults === undefined ? "" : String(candidate.hints.hasResults),
  ].join("\n");
}

function populationText(draft: EditorialDraft): string {
  return [
    draft.en.headline,
    draft.en.dek,
    draft.en.whatHappened,
    ...factValues(draft.localizedFacts.en),
    draft.ja.headline,
    draft.ja.dek,
    draft.ja.whatHappened,
    ...factValues(draft.localizedFacts.ja),
  ].join("\n");
}

const REGISTRY_STATUS: Record<
  string,
  { en: RegExp; ja: RegExp; forbidEn?: RegExp; forbidJa?: RegExp }
> = {
  RECRUITING: {
    en: /\brecruiting\b/i,
    ja: /募集中/,
    forbidEn: /\b(not yet recruiting|terminated|suspended|completed the trial)\b/i,
    forbidJa: /未募集|中止|中断|試験は完了/,
  },
  NOT_YET_RECRUITING: {
    en: /not yet recruiting/i,
    ja: /未募集/,
    forbidEn: /\b(is recruiting|are recruiting)\b/i,
    forbidJa: /募集中/,
  },
  ENROLLING_BY_INVITATION: {
    en: /enrolling by invitation/i,
    ja: /招待による登録/,
    forbidEn: /\brecruiting\b/i,
    forbidJa: /募集中/,
  },
  ACTIVE_NOT_RECRUITING: {
    en: /active, not recruiting/i,
    ja: /実施中で募集は終了/,
    forbidJa: /募集中/,
  },
  COMPLETED: {
    en: /\bcompleted\b/i,
    ja: /完了/,
    forbidEn: /\brecruiting\b/i,
    forbidJa: /募集中/,
  },
  TERMINATED: {
    en: /\bterminated\b/i,
    ja: /中止/,
    forbidEn: /\brecruiting\b/i,
    forbidJa: /募集中/,
  },
  SUSPENDED: {
    en: /\bsuspended\b/i,
    ja: /中断/,
    forbidEn: /\brecruiting\b/i,
    forbidJa: /募集中/,
  },
};

/** A last-update hit is not publishable until the change itself is known. */
export function trialUpdateMissingChange(candidate: Candidate): boolean {
  if (inferContentType(candidate) !== "trial-registration") return false;
  const matched = candidate.windowMatch?.matchedFields ?? [];
  if (!matched.includes("lastUpdatePostDate") || matched.includes("studyFirstPostDate")) {
    return false;
  }
  return !(candidate.hints?.registryChange ?? "").trim();
}

function assertRegistryStatus(
  status: string | undefined,
  enDisplay: string,
  jaDisplay: string,
  reasons: string[],
): void {
  const rule = REGISTRY_STATUS[(status ?? "").toUpperCase()];
  if (!rule) return;
  if (!rule.en.test(enDisplay) || !rule.ja.test(jaDisplay)) {
    reasons.push("trial status was not stated in both languages");
  }
  if (rule.forbidEn?.test(enDisplay) || rule.forbidJa?.test(jaDisplay)) {
    reasons.push("trial status was written beyond the registry value");
  }
}

export function validateDraft(
  draft: EditorialDraft,
  candidate: Candidate,
  existingSlugs: Set<string>,
  existingArticles: readonly Article[] = [],
): { ok: true } | { ok: false; reasons: string[]; hold: boolean } {
  const reasons: string[] = [];
  let hold = false;
  const scienceNews = isScienceNews(candidate);
  if (draft.contentType !== inferContentType(candidate)) reasons.push("contentType does not match the candidate");
  if (scienceNews) {
    if (draft.evidence !== "Evidence E") reasons.push("science news must remain Evidence E");
    if (!/science news report/i.test(draft.localizedFacts.en.studyDesign) || !/科学ニュース報道/.test(draft.localizedFacts.ja.studyDesign)) {
      reasons.push("science-news label must be explicit in both languages");
    }
    if ((candidate.abstract?.trim().length ?? 0) < 160) {
      hold = true;
      reasons.push("science-news source summary is too short to support a bilingual brief");
    }
  } else {
    const label = CONTENT_LABEL[draft.contentType];
    if (SCIENCE_NEWS_LABEL.test(allDraftText(draft))) {
      reasons.push(`${label} was labeled as a science news report`);
    }
    if (
      NEWS_POPULATION_PLACEHOLDER.test(
        `${draft.localizedFacts.en.populationOrModel}\n${draft.localizedFacts.ja.populationOrModel}`,
      )
    ) {
      reasons.push(`${label} used the news-report placeholder instead of its study population`);
    }
  }

  if (draft.sourceUrl !== candidate.sourceUrl) {
    reasons.push("sourceUrl does not exactly match the candidate");
  }
  if ((draft.doi ?? "") !== (candidate.doi ?? "")) {
    reasons.push("DOI does not match the candidate");
  }
  if (!(FIELD_IDS as readonly string[]).includes(draft.fieldId)) {
    reasons.push(`fieldId ${draft.fieldId} is not one of the eight fields`);
  } else if (draft.fieldId !== candidate.fieldId) {
    reasons.push("fieldId does not match the candidate");
  }

  if (EVIDENCE_RANK[draft.evidence] > EVIDENCE_RANK[candidate.evidence]) {
    reasons.push(
      `Evidence was upgraded from ${candidate.evidence} to ${draft.evidence}`,
    );
  }

  if (draft.countdownImpact !== "none") {
    reasons.push("countdownImpact must be none");
  }

  if (!isNonEmptyCopy(draft.en) || !isNonEmptyCopy(draft.ja)) {
    reasons.push("both English and Japanese copy are required");
  }

  if (existingSlugs.has(draft.slug)) {
    reasons.push(`duplicate slug ${draft.slug}`);
  }

  const draftDoi = normalizeDoi(draft.doi);
  const draftUrl = canonicalUrl(draft.sourceUrl);
  for (const article of existingArticles) {
    if (article.slug === draft.slug) continue;
    if (draftDoi && normalizeDoi(article.doi) === draftDoi) {
      reasons.push("duplicate DOI of an existing article");
    }
    if (canonicalUrl(article.sourceUrl) === draftUrl) {
      reasons.push("duplicate URL of an existing article");
    }
  }

  const lockedSubjects = candidate.studySubjects ?? [];
  const draftSubjects = draft.studySubjects ?? [];
  if (!sameMembers(draftSubjects, lockedSubjects)) {
    reasons.push("studySubjects do not match the candidate");
  }
  const enDisplay = languageDisplayText(draft.en, draft.localizedFacts.en);
  const jaDisplay = languageDisplayText(draft.ja, draft.localizedFacts.ja);

  for (const subject of lockedSubjects) {
    const mention = SUBJECT_MENTIONS[subject];
    if (!mention) continue;
    if (!mention.en.test(enDisplay)) {
      reasons.push(`locked subject ${mention.label} is missing from English copy or facts`);
    }
    if (!mention.ja.test(jaDisplay)) {
      reasons.push(`locked subject ${mention.label} is missing from Japanese copy or facts`);
    }
  }

  const lockedKinds = new Set(subjectKinds(lockedSubjects));
  const enKinds = detectedKinds(enDisplay);
  const jaKinds = detectedKinds(jaDisplay);
  for (const kind of enKinds) {
    if (!jaKinds.has(kind)) {
      reasons.push(`subject kind ${kind} appears in English but not Japanese`);
    }
  }
  for (const kind of jaKinds) {
    if (!enKinds.has(kind)) {
      reasons.push(`subject kind ${kind} appears in Japanese but not English`);
    }
  }

  const happened = populationText(draft);
  if (
    !hasLivingPeople(lockedSubjects) &&
    (LIVING_CLAIM_EN.test(happened) || LIVING_CLAIM_JA.test(happened))
  ) {
    reasons.push("animal, cell, or tissue work was written as a living-participant study");
  }

  if (lockedKinds.has("tissue") && hasLivingPeople(lockedSubjects) === false) {
    if (/\bwe enrolled\b|\bparticipants were randomized\b/i.test(happened)) {
      reasons.push("postmortem or tissue research was written as living-participant research");
    }
  }

  const source = sourceMaterials(candidate);
  if (scienceNews && /\b(unknown|unexplained|not yet (?:known|determined|understood))\b/i.test(source)) {
    if (!/\b(unknown|unexplained|not yet (?:known|determined|understood))\b/i.test(enDisplay) || !/未解明|不明|分かっていない|わかっていない/.test(jaDisplay)) {
      reasons.push("source uncertainty must be preserved in both languages");
    }
  }
  const sourceQuantities = quantitySet(source);
  for (const item of extractQuantities(allDraftText(draft))) {
    if (!sourceQuantities.has(quantityKey(item))) {
      reasons.push(`number ${item.value}${item.unit ? " " + item.unit : ""} is not in the source materials`);
    }
  }

  compareQuantitySets(
    quantitySet(copyText(draft.en)),
    quantitySet(copyText(draft.ja)),
    "English/Japanese editorial number mismatch",
    reasons,
  );
  compareQuantitySets(
    quantitySet(factValues(draft.localizedFacts.en).join("\n")),
    quantitySet(factValues(draft.localizedFacts.ja).join("\n")),
    "English/Japanese localized fact number mismatch",
    reasons,
  );

  const resultText = [
    draft.localizedFacts.en.outcomes,
    draft.localizedFacts.en.resultStatus,
    draft.localizedFacts.ja.outcomes,
    draft.localizedFacts.ja.resultStatus,
    draft.en.headline,
    draft.en.dek,
    draft.en.whatHappened,
    draft.ja.headline,
    draft.ja.dek,
    draft.ja.whatHappened,
  ].join("\n");
  if (hasNegation(source) && !hasNegation(resultText)) {
    reasons.push("source negation was dropped");
  }

  if (draft.contentType === "trial-registration") {
    if (trialUpdateMissingChange(candidate)) {
      hold = true;
      reasons.push("registry update has no verified change description");
    }
    const text = allDraftText(draft).toLowerCase();
    if (!/trial registration and research plan/i.test(draft.localizedFacts.en.studyDesign)) {
      reasons.push("trial registration must be labeled as a research plan in English");
    }
    if (!draft.localizedFacts.ja.studyDesign.includes("試験登録・研究計画")) {
      reasons.push("trial registration must be labeled as a research plan in Japanese");
    }
    if (
      /efficac|was effective|were effective|improved survival|significantly improved|有効性が示|治療に成功/.test(
        text,
      )
    ) {
      reasons.push("trial registration was written as an efficacy result");
    }
    assertRegistryStatus(candidate.hints?.overallStatus, enDisplay, jaDisplay, reasons);
    if (candidate.hints?.hasResults === false) {
      if (
        /posted results|results showed|results demonstrated|結果が示された|結果を報告した/.test(
          text,
        )
      ) {
        reasons.push("hasResults=false was written as if results were posted");
      }
      const planLabel = `${draft.localizedFacts.en.resultStatus}\n${draft.localizedFacts.en.studyDesign}`;
      const planLabelJa = `${draft.localizedFacts.ja.resultStatus}\n${draft.localizedFacts.ja.studyDesign}`;
      if (!/no results posted/i.test(planLabel) || !planLabelJa.includes("結果は未掲載")) {
        reasons.push("hasResults=false must be stated as no results posted in both languages");
      }
      if (
        /\b(showed|demonstrated|improved|was effective|reduced|increased)\b|結果が示|有意に改善|効果があった/.test(
          `${draft.localizedFacts.en.outcomes}\n${draft.localizedFacts.ja.outcomes}`,
        )
      ) {
        reasons.push("a trial without posted results wrote its purpose as an outcome");
      }
    }
    const status = (candidate.hints?.overallStatus ?? "").toUpperCase();
    if (status === "RECRUITING" && /completed the trial|試験は完了/.test(text)) {
      reasons.push("trial status was written beyond the registry value");
    }
    const phases = (candidate.hints?.phases ?? []).map((phase) => phase.toUpperCase());
    if (phases.includes("PHASE2") && /phase 3|phase iii|第3相|第Ⅲ相/.test(text)) {
      reasons.push("trial phase was written beyond the registry value");
    }
  }

  const design = `${draft.localizedFacts.en.studyDesign} ${source}`.toLowerCase();
  const causalHuman =
    /\b(delayed menopause|prevents|caused|causes|cures|resulted in later menopause|reversed aging in (people|humans|patients)|閉経を遅らせた)\b/i;
  if (
    /cross-sectional|observational|associated with/.test(design) &&
    causalHuman.test(
      `${draft.en.headline} ${draft.en.whatHappened} ${draft.ja.headline} ${draft.ja.whatHappened}`,
    )
  ) {
    reasons.push("observational finding was written as a causal human outcome");
  }

  const sourceAim =
    /\b(this study (aims|will)|we (aim|hypothesize|will evaluate|will assess)|protocol will|目的は|仮説として|評価する予定)\b/i.test(
      source,
    );
  const sourceHasResult =
    /\b(we (found|showed|observed|demonstrated)|significantly|results showed|not significant|nonsignificant)\b/i.test(
      source,
    );
  const draftClaimsResult =
    /\b(showed|demonstrated|improved|was effective|reduced|increased|結果が示|有意に改善)\b/i.test(
      resultText,
    );
  if (sourceAim && !sourceHasResult && draftClaimsResult) {
    reasons.push("aim, hypothesis, or planned work was written as a result");
  }

  if (candidate.relevanceScore < RANK_THRESHOLDS.minRelevance) {
    reasons.push(
      `relevance ${candidate.relevanceScore} < ${RANK_THRESHOLDS.minRelevance}`,
    );
  }
  if (candidate.significanceScore < RANK_THRESHOLDS.minSignificance) {
    reasons.push(
      `significance ${candidate.significanceScore} < ${RANK_THRESHOLDS.minSignificance}`,
    );
  }

  if (
    draft.candidateRecordId &&
    draft.candidateRecordId !== candidate.recordId
  ) {
    reasons.push("source ID does not match the candidate");
  }

  const hypeHay = allDraftText(draft).toLowerCase();
  for (const word of HYPE) {
    if (hypeHay.includes(word.toLowerCase())) {
      reasons.push(`hype word "${word}" is not allowed`);
    }
  }

  if (draft.en.realityCheck.trim().length < 20 || draft.ja.realityCheck.trim().length < 20) {
    reasons.push("realityCheck must be non-empty in both languages");
  }

  if (!candidate.abstract?.trim()) {
    hold = true;
    reasons.push("no abstract; hold because the source cannot be checked");
  }

  if (!scienceNews && (candidate.studySubjects ?? []).length === 0) {
    hold = true;
    reasons.push("study subjects could not be determined");
  }

  if (
    candidate.relevanceScore < 0 ||
    candidate.significanceScore < 0
  ) {
    hold = true;
    reasons.push("relevance or significance could not be determined");
  }

  return reasons.length > 0 ? { ok: false, reasons, hold } : { ok: true };
}
