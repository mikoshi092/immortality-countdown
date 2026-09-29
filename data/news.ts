import type { FieldId } from "@/lib/fields";
import { listArticles, type Article } from "@/data/articles";
import type { EvidenceLevel } from "@/lib/evidence";

export type { EvidenceLevel };

/**
 * Research updates adapted for homepage cards.
 *
 * Canonical bilingual records live in `data/articles.ts`. This module keeps
 * the older `NewsItem` shape so existing homepage cards and tests keep
 * working while readers are sent to on-site article pages first.
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

export type NewsItem = {
  /** Stable, human-readable. Convention: `YYYY-MM-DD-short-slug`. */
  id: string;

  /** On-site article path segment. Same as `Article.slug`. */
  slug: string;

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

  /** ISO 8601 research date from the primary source. Used for sort and display. */
  publishedAt: string;

  headline: string;
  dek: string;
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

export function articleToNewsItem(article: Article): NewsItem {
  return {
    id: article.id,
    slug: article.slug,
    fieldId: article.fieldId,
    evidence: article.evidence,
    publishedAt: article.sourcePublishedAt,
    headline: article.en.headline,
    dek: article.en.dek,
    whatHappened: article.en.whatHappened,
    whatItMeans: article.en.whyItMatters,
    caveat: article.en.realityCheck,
    sourceLabel: article.sourceLabel,
    sourceUrl: article.sourceUrl,
    doi: article.doi,
    featured: article.featured,
  };
}

export const newsItems: NewsItem[] = listArticles().map(articleToNewsItem);

/*
 * ─── HOW TO ADD AN ITEM ──────────────────────────────────────────────
 *
 * Add the bilingual record in `data/articles.ts`, not here. This file
 * only adapts those records into the older homepage card shape.
 *
 * 1. Open `sourceUrl` and read it. No shorteners, no aggregators — link the
 *    journal, the registry entry, or the institution. If you cannot reach a
 *    primary source, do not publish the item.
 * 2. Set `evidence` strictly by the definitions above. A mouse study is D
 *    however impressive it is. A company announcement is E. Do not promote a
 *    surrogate endpoint or observational result into an RCT evidence level.
 * 3. `realityCheck` is mandatory in both languages. An empty caveat reads
 *    as "no reservations", which is almost never true.
 * 4. Headlines state what happened. No breakthrough / cure / revolutionary /
 *    miracle / proven — the test rejects them.
 * 5. Run:  npx tsc --noEmit  &&  npx tsx --test data/news.test.ts data/articles.test.ts
 */
