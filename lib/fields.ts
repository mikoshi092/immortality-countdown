/**
 * The canonical field taxonomy — identity only, no long-form content.
 *
 * This module exists separately from `data/fields.ts` on purpose.
 * `NewsSection` is a client component, so anything `NewsCard` imports gets
 * bundled into client JS. `data/fields.ts` carries ~300 lines of long-form
 * prose per field; importing it from a card would ship all of that to every
 * visitor. This file is eight short strings.
 *
 * These IDs are the single source of truth for the site's taxonomy and must
 * stay identical to:
 *   - `fieldProgress[].slug` in data/fields.ts   (route segments /fields/[slug])
 *   - `fields[].id` in lev/params.json           (the model)
 * `data/news.test.ts` fails the build if the three ever drift apart.
 */
export const FIELD_IDS = [
  "rejuvenation-regeneration",
  "biomarkers-diagnostics",
  "geroscience-drugs-trials",
  "gene-therapy-delivery",
  "ai-drug-discovery",
  "organ-replacement-biofabrication",
  "immune-engineering-cancer-control",
  "enabling-technology-automation",
] as const;

export type FieldId = (typeof FIELD_IDS)[number];

export const FIELD_LABELS: Record<FieldId, string> = {
  "rejuvenation-regeneration": "Rejuvenation & Regeneration",
  "biomarkers-diagnostics": "Biomarkers & Diagnostics",
  "geroscience-drugs-trials": "Geroscience Drugs & Trials",
  "gene-therapy-delivery": "Gene Therapy & Delivery",
  "ai-drug-discovery": "AI Drug Discovery",
  "organ-replacement-biofabrication": "Organ Replacement & Biofabrication",
  "immune-engineering-cancer-control": "Immune Engineering & Cancer Control",
  "enabling-technology-automation": "Enabling Technology & Automation",
};

/** Shorter labels for filter chips, where eight full names would not fit. */
export const FIELD_SHORT_LABELS: Record<FieldId, string> = {
  "rejuvenation-regeneration": "Rejuvenation",
  "biomarkers-diagnostics": "Biomarkers",
  "geroscience-drugs-trials": "Geroscience",
  "gene-therapy-delivery": "Gene Therapy",
  "ai-drug-discovery": "AI Discovery",
  "organ-replacement-biofabrication": "Organ Replacement",
  "immune-engineering-cancer-control": "Immune Engineering",
  "enabling-technology-automation": "Enabling Tech",
};
