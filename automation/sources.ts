import type { SourceDefinition } from "./types";

/**
 * Registry of ingest sources.
 *
 * Since the owner decision recorded in 2026-11, the public news feed is
 * general-media only: PubMed and ClinicalTrials.gov are disabled as
 * news sources because paper abstracts and registry records are not
 * readable for the lay audience this feed serves. Their adapters, code,
 * and tests are kept intact; only `enabled` is off. Disabled rows are
 * ignored by the runner and must not receive HTTP requests.
 *
 * Enabled sources are science-news (media) feeds. Nature News is kept
 * enabled because it is news reporting rather than papers; it carries
 * its own stricter d41586 article link pattern. GIGAZINE and Nazology
 * were added on the same 2026-11 owner direction that pop,
 * general-audience coverage (GIGAZINE-level) is welcome; both are
 * Japanese-language feeds handled by the same RSS adapter and gates.
 * Six further Japanese feeds (Science Portal, Nikkei Gooday,
 * University Journal Online, RIKEN press releases, HealthDay Japan,
 * and Mynavi News) were added when the owner decided the Japanese
 * news surfaces must link only to Japanese-language articles; the
 * general feeds among them rely on the same relevance gates as every
 * other source. Each entry's `language` records the language of the
 * articles it publishes, and the display layer uses it to keep
 * English-source items off the Japanese news surfaces.
 *
 * Bloomberg Japan is registered but disabled: Bloomberg offers no
 * public article feed and its articles are paywalled, so the runner
 * never fetches it. The entry exists so the display layer can resolve
 * the language of Bloomberg links on manually added records. Note
 * that bloomberg.com serves both the Japanese and English editions
 * from one host, so any Bloomberg record resolves as Japanese;
 * manual additions must therefore link the /jp/ edition.
 *
 * Google News keyword sources (google-news-ja / google-news-en) are
 * the catch-net for major stories broken by outlets outside this
 * registry (owner decision, 2026-11): each runs a fixed set of
 * keyword queries against Google News search RSS and resolves the
 * opaque Google links to the original publisher URLs at fetch time.
 * They carry no linkPattern on purpose — only successfully resolved
 * publisher URLs ever become records, and that resolution is their
 * admission control. The resolver relies on an undocumented Google
 * RPC and can break without notice; its failure mode is safe (items
 * are dropped and counted in the ingest report, never published with
 * a Google URL). The major Japanese outlets registered disabled
 * further below exist for the same display-layer language resolution
 * as Bloomberg Japan: Google News surfaces their articles, and their
 * hosts must resolve as Japanese regardless of which edition's query
 * found the story.
 *
 * `url` is the public site. `api.baseUrl` is the feed URL the adapter
 * actually calls, and `api.linkPattern` admits only article URLs.
 */
export const SOURCES: SourceDefinition[] = [
  {
    id: "nature-news",
    name: "Nature News",
    type: "science-news",
    url: "https://www.nature.com/",
    enabled: true,
    trustTier: 2,
    language: "en",
    api: {
      kind: "rss",
      baseUrl: "https://www.nature.com/nature.rss",
      linkPattern: "^https://www\\.nature\\.com/articles/d41586-\\d{3}-\\d{5}-[\\dx]$",
    },
  },
  {
    id: "sciencedaily-aging",
    name: "ScienceDaily (Healthy Aging)",
    type: "science-news",
    url: "https://www.sciencedaily.com/",
    enabled: true,
    trustTier: 3,
    language: "en",
    api: {
      kind: "rss",
      baseUrl: "https://www.sciencedaily.com/rss/health_medicine/healthy_aging.xml",
      linkPattern: "^https://www\\.sciencedaily\\.com/releases/\\d{4}/\\d{2}/[\\w-]+\\.htm$",
    },
  },
  {
    id: "new-atlas-medical",
    name: "New Atlas (Medical)",
    type: "science-news",
    url: "https://newatlas.com/medical/",
    enabled: true,
    trustTier: 3,
    language: "en",
    api: {
      kind: "rss",
      baseUrl: "https://newatlas.com/medical/index.rss",
      linkPattern: "^https://newatlas\\.com/[\\w-]+/[\\w-]+/$",
    },
  },
  {
    id: "gen-news",
    name: "Genetic Engineering & Biotechnology News",
    type: "science-news",
    url: "https://www.genengnews.com/",
    enabled: true,
    trustTier: 3,
    language: "en",
    api: {
      kind: "rss",
      baseUrl: "https://www.genengnews.com/feed/",
      linkPattern: "^https://www\\.genengnews\\.com/topics/[\\w-]+/[\\w-]+/?$",
    },
  },
  {
    id: "fierce-biotech",
    name: "Fierce Biotech",
    type: "science-news",
    url: "https://www.fiercebiotech.com/",
    enabled: true,
    trustTier: 3,
    language: "en",
    api: {
      kind: "rss",
      baseUrl: "https://www.fiercebiotech.com/rss/xml",
      linkPattern: "^https://www\\.fiercebiotech\\.com/[\\w-]+/[\\w-]+$",
    },
  },
  {
    id: "fight-aging",
    name: "Fight Aging!",
    type: "science-news",
    url: "https://www.fightaging.org/",
    enabled: true,
    trustTier: 3,
    language: "en",
    api: {
      kind: "rss",
      baseUrl: "https://www.fightaging.org/index.xml",
      linkPattern: "^https://www\\.fightaging\\.org/archives/\\d{4}/\\d{2}/[\\w-]+/$",
    },
  },
  {
    id: "gigazine",
    name: "GIGAZINE",
    type: "science-news",
    url: "https://gigazine.net/",
    enabled: true,
    trustTier: 3,
    language: "ja",
    api: {
      kind: "rss",
      baseUrl: "https://gigazine.net/news/rss_2.0/",
      linkPattern: "^https://gigazine\\.net/news/\\d{8}-[\\w-]+/$",
    },
  },
  {
    id: "nazology-health",
    name: "ナゾロジー",
    type: "science-news",
    url: "https://nazology.kusuguru.co.jp/",
    enabled: true,
    trustTier: 3,
    language: "ja",
    api: {
      kind: "rss",
      baseUrl: "https://nazology.kusuguru.co.jp/archives/category/life/health/feed",
      linkPattern: "^https://nazology\\.kusuguru\\.co\\.jp/archives/\\d+$",
    },
  },
  {
    id: "science-portal",
    name: "Science Portal (JST)",
    type: "science-news",
    url: "https://scienceportal.jst.go.jp/",
    enabled: true,
    trustTier: 2,
    language: "ja",
    api: {
      kind: "rss",
      baseUrl: "https://scienceportal.jst.go.jp/feed/rss.xml",
      linkPattern: "^https://scienceportal\\.jst\\.go\\.jp/(?:newsflash|stories)/\\d{8}_[a-z]\\d{2}/$",
    },
  },
  {
    id: "nikkei-gooday",
    name: "Nikkei Gooday",
    type: "science-news",
    url: "https://gooday.nikkei.co.jp/",
    enabled: true,
    trustTier: 3,
    language: "ja",
    api: {
      kind: "rss",
      baseUrl: "https://gooday.nikkei.co.jp/rss/all.rdf",
      linkPattern: "^https://gooday\\.nikkei\\.co\\.jp/atcl/(?:column|report)/\\d{2}/\\d{9}/\\d{9}/(?:\\?[\\w=&%-]+)?$",
    },
  },
  {
    id: "univ-journal",
    name: "University Journal Online",
    type: "science-news",
    url: "https://univ-journal.jp/",
    enabled: true,
    trustTier: 3,
    language: "ja",
    api: {
      kind: "rss",
      baseUrl: "https://univ-journal.jp/feed/",
      linkPattern: "^https://univ-journal\\.jp/(?:column/)?\\d+/$",
    },
  },
  {
    id: "riken-press",
    name: "RIKEN Press Releases",
    type: "science-news",
    url: "https://www.riken.jp/",
    enabled: true,
    trustTier: 2,
    language: "ja",
    api: {
      kind: "rss",
      baseUrl: "https://www.riken.jp/feed/press_feed/",
      linkPattern: "^https://www\\.riken\\.jp/press/\\d{4}/\\d{8}_\\d+/index\\.html$",
    },
  },
  {
    id: "healthday-japan",
    name: "HealthDay Japan",
    type: "science-news",
    url: "https://healthdayjapan.com/",
    enabled: true,
    trustTier: 3,
    language: "ja",
    api: {
      kind: "rss",
      baseUrl: "https://healthdayjapan.com/feed",
      linkPattern: "^https://healthdayjapan\\.com/[\\w-]+/\\d{4}/\\d{2}/\\d{2}/[\\w-]+$",
    },
  },
  {
    id: "mynavi-news",
    name: "Mynavi News",
    type: "science-news",
    url: "https://news.mynavi.jp/",
    enabled: true,
    trustTier: 3,
    language: "ja",
    api: {
      kind: "rss",
      baseUrl: "https://news.mynavi.jp/rss/index",
      linkPattern: "^https://news\\.mynavi\\.jp/(?:[\\w-]+/)?article/\\d{8}-\\d+/$",
    },
  },
  {
    id: "google-news-ja",
    name: "Google News keyword search (JP)",
    type: "science-news",
    url: "https://news.google.com/",
    enabled: true,
    trustTier: 3,
    language: "ja",
    api: {
      kind: "google-news-rss",
      baseUrl: "https://news.google.com/rss/search",
    },
  },
  {
    id: "google-news-en",
    name: "Google News keyword search (US)",
    type: "science-news",
    url: "https://news.google.com/",
    enabled: true,
    trustTier: 3,
    language: "en",
    api: {
      kind: "google-news-rss",
      baseUrl: "https://news.google.com/rss/search",
    },
  },
  {
    id: "bloomberg-japan",
    name: "Bloomberg Japan",
    type: "science-news",
    url: "https://www.bloomberg.com/jp/",
    enabled: false,
    trustTier: 2,
    language: "ja",
    api: {
      kind: "rss",
      baseUrl: "https://www.bloomberg.com/jp/",
      linkPattern: "^https://www\\.bloomberg\\.com/jp/news/articles/\\d{4}-\\d{2}-\\d{2}/[\\w-]+$",
    },
  },
  // Disabled language-registry entries for the major Japanese outlets
  // (keyword-collection design §5 Layer 1): no feed is fetched from any
  // of them. A story resolved from a keyword search to one of these
  // hosts must read as Japanese on the Japanese face and must stay off
  // the English face, which needs the host claimed in the registry.
  {
    id: "yomiuri",
    name: "読売新聞",
    type: "science-news",
    url: "https://www.yomiuri.co.jp/",
    enabled: false,
    trustTier: 1,
    language: "ja",
    api: { kind: "rss", baseUrl: "https://www.yomiuri.co.jp/" },
  },
  {
    id: "asahi",
    name: "朝日新聞",
    type: "science-news",
    url: "https://www.asahi.com/",
    enabled: false,
    trustTier: 1,
    language: "ja",
    api: { kind: "rss", baseUrl: "https://www.asahi.com/" },
  },
  {
    id: "mainichi",
    name: "毎日新聞",
    type: "science-news",
    url: "https://mainichi.jp/",
    enabled: false,
    trustTier: 1,
    language: "ja",
    api: { kind: "rss", baseUrl: "https://mainichi.jp/" },
  },
  {
    id: "nikkei",
    name: "日本経済新聞",
    type: "science-news",
    url: "https://www.nikkei.com/",
    enabled: false,
    trustTier: 1,
    language: "ja",
    api: { kind: "rss", baseUrl: "https://www.nikkei.com/" },
  },
  {
    id: "jiji",
    name: "時事通信",
    type: "science-news",
    url: "https://www.jiji.com/",
    enabled: false,
    trustTier: 1,
    language: "ja",
    api: { kind: "rss", baseUrl: "https://www.jiji.com/" },
  },
  {
    id: "kyodo",
    name: "共同通信",
    type: "science-news",
    url: "https://www.kyodo.co.jp/",
    enabled: false,
    trustTier: 1,
    language: "ja",
    api: { kind: "rss", baseUrl: "https://www.kyodo.co.jp/" },
  },
  {
    id: "tv-asahi",
    name: "テレビ朝日",
    type: "science-news",
    url: "https://www.tv-asahi.co.jp/",
    enabled: false,
    trustTier: 1,
    language: "ja",
    api: { kind: "rss", baseUrl: "https://www.tv-asahi.co.jp/" },
  },
  {
    id: "nhk",
    name: "NHK",
    type: "science-news",
    url: "https://www.nhk.or.jp/",
    enabled: false,
    trustTier: 1,
    language: "ja",
    api: { kind: "rss", baseUrl: "https://www.nhk.or.jp/" },
  },
  {
    id: "pubmed",
    name: "PubMed",
    type: "literature",
    url: "https://pubmed.ncbi.nlm.nih.gov/",
    enabled: false,
    trustTier: 1,
    language: "en",
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
    enabled: false,
    trustTier: 1,
    language: "en",
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
