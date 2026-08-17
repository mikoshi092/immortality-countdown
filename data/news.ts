// PLACEHOLDER DATA — Preview build only.
// All items below are illustrative fixtures written for this prototype,
// not verified news reports. sourceUrl values are placeholders ("#")
// and must be replaced with real, checked sources before any public launch.

export type NewsCategory =
  | "Rejuvenation"
  | "Biomarkers"
  | "Trials"
  | "AI Drug Discovery"
  | "Gene Therapy"
  | "Enabling Tech";

// Evidence A/B/C: human trial results, from strongest to weakest.
// Evidence D: animal/cell studies.
// Evidence E: hypotheses, company plans, and expert forecasts.
export type EvidenceLevel =
  | "Evidence A"
  | "Evidence B"
  | "Evidence C"
  | "Evidence D"
  | "Evidence E";

export type NewsItem = {
  id: string;
  field: string;
  category: NewsCategory;
  evidence: EvidenceLevel;
  publishedAt: string; // ISO timestamp, used for sort order
  timeLabel: string; // human-readable relative time shown in the UI
  headline: string;
  whatHappened: string;
  whatItMeans: string;
  caveat: string;
  sourceLabel: string;
  sourceUrl: string; // PLACEHOLDER — not a real citation
  featured: boolean;
};

export const newsItems: NewsItem[] = [
  {
    id: "signal-senolytic-trial",
    field: "Geroscience",
    category: "Trials",
    evidence: "Evidence B",
    publishedAt: "2026-08-05T05:08:00Z",
    timeLabel: "3h ago",
    headline: "Senolytic trial reports improved functional endpoint",
    whatHappened:
      "A mid-stage human trial reported improvement in a functional measure of aging-related decline.",
    whatItMeans:
      "This strengthens the case for aging-targeted drugs, but does not justify moving the countdown yet.",
    caveat: "The sample is limited and replication is still needed.",
    sourceLabel: "Source",
    sourceUrl: "#",
    featured: true,
  },
  {
    id: "ai-1",
    field: "AI Drug Discovery",
    category: "AI Drug Discovery",
    evidence: "Evidence D",
    publishedAt: "2026-08-05T02:08:00Z",
    timeLabel: "6h ago",
    headline: "AI-designed molecule enters preclinical toxicity screening",
    whatHappened:
      "A biotech lab reported that a generative-model-designed small molecule cleared an initial round of in vitro toxicity screening.",
    whatItMeans:
      "Early-stage AI-designed compounds are advancing through standard pipelines, but most fail later-stage testing.",
    caveat:
      "Preclinical results rarely predict clinical success; this is an early screening milestone only.",
    sourceLabel: "Source",
    sourceUrl: "#",
    featured: false,
  },
  {
    id: "ai-2",
    field: "AI Drug Discovery",
    category: "AI Drug Discovery",
    evidence: "Evidence E",
    publishedAt: "2026-08-04T23:08:00Z",
    timeLabel: "9h ago",
    headline: "New model predicts protein-ligand binding with modest accuracy gains",
    whatHappened:
      "Researchers published a benchmark showing incremental accuracy improvements in binding-affinity prediction.",
    whatItMeans:
      "Small, steady gains in prediction models can compound over time across drug discovery pipelines.",
    caveat: "Benchmark gains do not guarantee real-world laboratory performance.",
    sourceLabel: "Source",
    sourceUrl: "#",
    featured: false,
  },
  {
    id: "bio-1",
    field: "Diagnostics",
    category: "Biomarkers",
    evidence: "Evidence B",
    publishedAt: "2026-08-04T20:08:00Z",
    timeLabel: "12h ago",
    headline: "Large cohort study refines a blood-based aging clock",
    whatHappened:
      "A cohort study of several thousand participants reported a refined version of an epigenetic aging biomarker.",
    whatItMeans:
      "Better biomarkers help trials measure aging-related change faster, indirectly supporting the field.",
    caveat: "Clock refinements do not yet have consensus on clinical interpretation.",
    sourceLabel: "Source",
    sourceUrl: "#",
    featured: false,
  },
  {
    id: "gene-1",
    field: "Gene Therapy",
    category: "Gene Therapy",
    evidence: "Evidence D",
    publishedAt: "2026-08-04T08:00:00Z",
    timeLabel: "1d ago",
    headline: "Delivery vector shows improved tissue targeting in animal model",
    whatHappened:
      "A study reported a modified viral vector achieving more selective tissue targeting in mice.",
    whatItMeans:
      "Improved delivery specificity addresses a persistent bottleneck for gene therapies broadly.",
    caveat: "Animal-model results often do not translate directly to humans.",
    sourceLabel: "Source",
    sourceUrl: "#",
    featured: false,
  },
  {
    id: "enable-1",
    field: "Enabling Tech",
    category: "Enabling Tech",
    evidence: "Evidence E",
    publishedAt: "2026-08-04T02:00:00Z",
    timeLabel: "1d ago",
    headline: "Lab automation platform cuts screening time in reported pilot",
    whatHappened:
      "A contract research group reported reduced screening turnaround using a new automation platform.",
    whatItMeans:
      "Faster screening infrastructure can accelerate throughput across many research areas.",
    caveat: "Efficiency claims come from a single pilot report, not independent verification.",
    sourceLabel: "Source",
    sourceUrl: "#",
    featured: false,
  },
  {
    id: "rejuv-1",
    field: "Rejuvenation",
    category: "Rejuvenation",
    evidence: "Evidence D",
    publishedAt: "2026-08-03T08:00:00Z",
    timeLabel: "2d ago",
    headline: "Partial reprogramming study reports extended tissue function in mice",
    whatHappened:
      "Researchers reported extended markers of tissue function in mice using partial cellular reprogramming.",
    whatItMeans:
      "Adds to a growing body of reprogramming evidence, still concentrated in animal models.",
    caveat:
      "Reprogramming approaches carry known risks, including tumorigenicity, that remain under study.",
    sourceLabel: "Source",
    sourceUrl: "#",
    featured: false,
  },
];
