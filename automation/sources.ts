import type { SourceDefinition } from "./types";

/**
 * Registry of ingest sources. Phase 3.0 enables PubMed and
 * ClinicalTrials.gov only. Disabled rows are ignored by the runner
 * and must not receive HTTP requests.
 *
 * `url` is the public site. `api.baseUrl` is the official HTTP API
 * the adapter actually calls.
 */
export const SOURCES: SourceDefinition[] = [
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
