import type { FieldId } from "@/lib/fields";

/**
 * Verified research updates.
 *
 * Every item here is a real, checked source. The seven illustrative fixtures
 * that used to live in this file (all with `sourceUrl: "#"`) have been
 * removed — see CHANGES.md. Nothing may be added without a source that was
 * actually opened and read.
 */

// Evidence A: large human RCTs with clinical outcomes.
// Evidence B: small-to-medium human RCTs or strong prospective cohorts.
// Evidence C: human evidence that is uncontrolled, retrospective, or limited
//             to surrogate endpoints.
// Evidence D: animal, cell, or organoid studies.
// Evidence E: hypotheses, company plans, expert forecasts, or preprints.
//
// Only A and B may move a field's readiness score by default. C is
// context-dependent. D and E may be published here but never move a score.
export type EvidenceLevel =
  | "Evidence A"
  | "Evidence B"
  | "Evidence C"
  | "Evidence D"
  | "Evidence E";

export type NewsItem = {
  /** Stable, human-readable. Convention: `YYYY-MM-DD-short-slug`. */
  id: string;

  /**
   * One of the eight canonical fields. Deliberately NOT a free string, and
   * deliberately not a second parallel taxonomy: a `category` union used to
   * sit alongside a free-text `field`, and the two had already drifted apart
   * from the site's own field slugs.
   *
   * If a different axis is needed later (Clinical Trial / Paper / Regulatory /
   * Company), add a purpose-named `contentType` field. Do NOT reintroduce a
   * general-purpose `category`.
   */
  fieldId: FieldId;

  evidence: EvidenceLevel;

  /** ISO 8601. Used for sort order and for the displayed date. */
  publishedAt: string;

  headline: string;
  whatHappened: string;
  whatItMeans: string;

  /** Required. What a reader needs in order not to over-read the result. */
  caveat: string;

  /** Publication or institution, e.g. "Nature Aging". */
  sourceLabel: string;

  /**
   * ⚠️ THIS TYPE GUARANTEES FORMAT, NOT TRUTH.
   *
   * The template literal type only proves the string starts with "https://".
   * It says nothing about whether the URL resolves, whether the page still
   * exists, or whether its contents match the claim made above.
   *
   * Manual additions: open the URL and read it before committing.
   * Automated ingest (layer 1/2): the URL MUST additionally be cross-checked
   * against the fetch results of that run. A URL produced by a language model
   * and not present in the fetched set is to be discarded, not trusted because
   * it happens to type-check.
   */
  sourceUrl: `https://${string}`;

  /** DOI when one exists. Primary dedup key for automated ingest. */
  doi?: string;

  /** At most one item may be featured. Enforced in data/news.test.ts. */
  featured?: boolean;
};

export const newsItems: NewsItem[] = [
  {
    id: "2026-08-14-histological-aging-signatures",
    fieldId: "biomarkers-diagnostics",
    evidence: "Evidence C",
    publishedAt: "2026-08-14T00:00:00Z",
    headline: "Deep-learning tissue clocks map aging across 40 human tissue types",
    whatHappened:
      "Researchers analyzed 25,712 histopathology whole-slide images from 40 tissue types across 983 GTEx donors and trained models that estimated tissue-specific biological age. The resulting signatures were associated with established aging markers and disease-relevant organ aging in independent cohorts.",
    whatItMeans:
      "Tissue architecture may provide another scalable way to measure organ-specific aging, potentially strengthening biomarker validation and future trial endpoints.",
    caveat:
      "This is observational biomarker research, not an intervention trial. The models identify age-related signatures and disease associations; they do not show that changing a tissue-clock score improves health or lifespan.",
    sourceLabel: "Nature Medicine",
    sourceUrl: "https://www.nature.com/articles/s41591-026-04566-5",
    doi: "10.1038/s41591-026-04566-5",
    featured: true,
  },
  {
    id: "2026-08-14-physical-activity-ovarian-aging",
    fieldId: "rejuvenation-regeneration",
    evidence: "Evidence C",
    publishedAt: "2026-08-14T00:00:00Z",
    headline: "Physical activity is associated with later menopause and delays ovarian aging in mice",
    whatHappened:
      "Cross-sectional analyses of 152,435 UK Biobank participants and 12,418 NHANES participants linked higher physical activity with a less advanced reproductive-aging profile. In mice, physical activity delayed ovarian aging, with adiponectin signaling implicated in the effect.",
    whatItMeans:
      "The study adds human observational and animal mechanistic evidence that physical activity may influence reproductive aging, while identifying adiponectin signaling as a pathway worth following.",
    caveat:
      "The human analyses are cross-sectional and cannot establish that physical activity delayed menopause. The causal and mechanistic evidence comes from mice, so this should not be generalized to whole-body human rejuvenation.",
    sourceLabel: "Nature Aging",
    sourceUrl: "https://www.nature.com/articles/s43587-026-01177-0",
    doi: "10.1038/s43587-026-01177-0",
  },
  {
    id: "2026-08-11-tnfr1-intestinal-stem-cell-aging",
    fieldId: "immune-engineering-cancer-control",
    evidence: "Evidence D",
    publishedAt: "2026-08-11T00:00:00Z",
    headline: "Systemic TNF signaling drives intestinal stem-cell aging in mice",
    whatHappened:
      "Using heterochronic parabiosis, mouse experiments and organoids, researchers linked the aged systemic environment to impaired intestinal stem-cell function through TNF-TNFR1 signaling, mitochondrial dysfunction and reduced fatty-acid oxidation.",
    whatItMeans:
      "The work supports inflammaging as a causal contributor to tissue stem-cell decline and identifies TNF-TNFR1 signaling and cellular metabolism as mechanisms worth tracking.",
    caveat:
      "The causal experiments are in mice and organoids. They do not establish that TNF blockade or anti-inflammatory drugs slow human aging, and such treatments can carry clinically important risks.",
    sourceLabel: "Nature Aging",
    sourceUrl: "https://www.nature.com/articles/s43587-026-01170-7",
    doi: "10.1038/s43587-026-01170-7",
  },
];

/*
 * ─── HOW TO ADD AN ITEM ──────────────────────────────────────────────
 *
 * 1. Open `sourceUrl` and read it. No shorteners, no aggregators — link the
 *    journal, the registry entry, or the institution. If you cannot reach a
 *    primary source, do not publish the item.
 * 2. Set `evidence` strictly by the definitions above. A mouse study is D
 *    however impressive it is. A company announcement is E. Do not promote a
 *    surrogate endpoint or observational result into an RCT evidence level.
 * 3. `caveat` is mandatory and is the most important field on the card. An
 *    empty caveat reads as "no reservations", which is almost never true.
 * 4. Headlines state what happened. No breakthrough / cure / revolutionary /
 *    miracle / proven — the test rejects them.
 * 5. Run:  npx tsc --noEmit  &&  npx tsx --test data/news.test.ts
 *
 * Template — copy, uncomment, fill in:
 *
 * {
 *   id: "2026-08-20-example-trial",
 *   fieldId: "geroscience-drugs-trials",
 *   evidence: "Evidence B",
 *   publishedAt: "2026-08-20T00:00:00Z",
 *   headline: "",
 *   whatHappened: "",
 *   whatItMeans: "",
 *   caveat: "",
 *   sourceLabel: "",
 *   sourceUrl: "https://",
 *   doi: "10.",
 *   featured: false,
 * },
 */
