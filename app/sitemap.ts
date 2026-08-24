import type { MetadataRoute } from "next";
import { fieldProgress } from "@/data/fields";
import params from "@/lev/params.json";
import { SITE_URL, CONTENT_UPDATED } from "@/lib/site";

/**
 * Two bugs fixed here:
 *
 * 1. /methodology was missing entirely — the single most important page
 *    for a site whose whole pitch is transparency was not in the sitemap.
 * 2. No `lastModified`. Google largely ignores `priority` and
 *    `changeFrequency`, but it does use `lastmod` to schedule recrawls,
 *    so omitting it was the one field that actually mattered.
 *
 * `lastModified` is deliberately NOT `new Date()`: that would claim every
 * page changed on every deploy, which is a lie Google learns to discount.
 * Model-derived pages carry the params.json review date; the rest carry a
 * hand-maintained constant.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const modelReviewed = new Date(params.publishedAt);

  const fieldReviewDate = (slug: string) => {
    const entry = params.fields.find((f) => f.id === slug);
    return entry ? new Date(entry.lastReviewed) : modelReviewed;
  };

  // Only these two URLs are translations of each other, so only these two
  // carry alternates. Listing a Japanese alternate for /model or /fields
  // would point Google at pages that do not exist in Japanese.
  const localePair = {
    languages: {
      en: SITE_URL,
      ja: `${SITE_URL}/ja`,
      "x-default": SITE_URL,
    },
  };

  return [
    { url: SITE_URL, lastModified: modelReviewed, alternates: localePair },
    {
      url: `${SITE_URL}/ja`,
      lastModified: CONTENT_UPDATED,
      alternates: localePair,
    },
    { url: `${SITE_URL}/methodology`, lastModified: modelReviewed },
    { url: `${SITE_URL}/model`, lastModified: modelReviewed },
    { url: `${SITE_URL}/fields`, lastModified: CONTENT_UPDATED },
    { url: `${SITE_URL}/about`, lastModified: CONTENT_UPDATED },
    ...fieldProgress.map((field) => ({
      url: `${SITE_URL}/fields/${field.slug}`,
      lastModified: fieldReviewDate(field.slug),
    })),
  ];
}
