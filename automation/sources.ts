import type { SourceDefinition } from "./types";

/**
 * Registry of ingest sources: PubMed, ClinicalTrials.gov, and Nature News.
 * Disabled rows are ignored by the runner
 * and must not receive HTTP requests.
 *
 * `url` is the public site. `api.baseUrl` is the official HTTP API
 * the adapter actually calls.
 */
export const SOURCES: SourceDefinition[] = [
  {
    id: "nature-news",
    name: "Nature News",
    type: "science-news",
    url: "https://www.nature.com/",
    enabled: true,
    trustTier: 2,
    api: { kind: "nature-rss", baseUrl: "https://www.nature.com/nature.rss" },
  },
  {
    id: "pubmed",
    name: "PubMed",
    type: "literature",
    url: "https://pubmed.ncbi.nlm.nih.gov/",
    enabled: true,
    trustTier: 1,
    api: {
      kind: "pubmed-eutils",
      baseUrl: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils",
    },
  },
  {
    id: "clinicaltrials",
    name: "ClinicalTrials.gov",
    type: "trial-registry",
    url: "https://clinicaltrials.gov/",
    enabled: true,
    trustTier: 1,
    api: {
      kind: "ctgov-studies",
      baseUrl: "https://clinicaltrials.gov/api/v2/studies",
    },
  },
];

export function enabledSources(): SourceDefinition[] {
  return SOURCES.filter((source) => source.enabled);
}

export function sourceById(id: string): SourceDefinition | undefined {
  return SOURCES.find((source) => source.id === id);
}
