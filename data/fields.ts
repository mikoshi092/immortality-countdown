// PLACEHOLDER DATA — Preview build only.
// Scores are provisional illustrative values for this prototype. No
// official Technology Readiness methodology has been implemented or
// audited yet — do not treat these numbers as validated scores.

export type FieldStatus = "provisional";

export type FieldProgress = {
  slug: string;
  name: string;
  score: number; // 0–100, PROVISIONAL — not an official/audited score
  status: FieldStatus;
};

// Only 4 of the eventual "Eight Fields of Progress" are populated for
// this Preview. The remaining four are intentionally omitted rather
// than filled with invented placeholder scores.
export const fieldProgress: FieldProgress[] = [
  {
    slug: "rejuvenation-regeneration",
    name: "Rejuvenation & Regeneration",
    score: 40,
    status: "provisional",
  },
  {
    slug: "biomarkers-diagnostics",
    name: "Biomarkers & Diagnostics",
    score: 44,
    status: "provisional",
  },
  {
    slug: "geroscience-drugs-trials",
    name: "Geroscience Drugs & Trials",
    score: 33,
    status: "provisional",
  },
  {
    slug: "gene-therapy-delivery",
    name: "Gene Therapy & Delivery",
    score: 36,
    status: "provisional",
  },
];
