import { enabledSources, sourceById } from "./sources";
import {
  LOOKBACK_HOURS,
  type DatedValue,
  type DateFieldValue,
  type FetchedRecord,
  type FetchStatus,
  type RecordDateFields,
  type SourceDefinition,
  type SourceFetchResult,
  type SourceIssue,
  type WindowMatch,
} from "./types";

export const PUBMED_RECORD_URL_RULE =
  "Constructed in the PubMed adapter from PMID using the current PubMed record URL (pubmed.ncbi.nlm.nih.gov). NCBI E-utilities documents the PubMed web interface at pubmed.ncbi.nlm.nih.gov; NCBI Web Link Help also documents https://www.ncbi.nlm.nih.gov/pubmed/{pmid} as an equivalent record link.";

export const CTGOV_RECORD_URL_RULE =
  "Constructed in the ClinicalTrials.gov adapter from NCT ID using the current study record URL https://clinicaltrials.gov/study/{nctId}. The Studies API returns NCTId but not a public page URL.";

const REQUEST_TIMEOUT_MS = 25_000;
const NCBI_GAP_MS = 350;
const PUBMED_PAGE_SIZE = 500;
const PUBMED_SUMMARY_BATCH = 200;
const PUBMED_MAX_IDS = 10_000;
const CTGOV_PAGE_SIZE = 100;

const PUBMED_QUERY =
  '(aging OR ageing OR senescence OR longevity OR geroscience OR healthspan OR "biological age" OR senolytic OR "epigenetic clock" OR "cellular reprogramming" OR rejuvenation)';

const CTGOV_QUERY =
  '(aging OR ageing OR senescence OR longevity OR geroscience OR healthspan OR "biological age" OR senolytic OR rejuvenation)';

export function pubmedApiBase(source?: SourceDefinition): string {
  return source?.api.baseUrl ?? sourceById("pubmed")?.api.baseUrl ?? "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
}

export function clinicalTrialsApiUrl(source?: SourceDefinition): string {
  return source?.api.baseUrl ?? sourceById("clinicaltrials")?.api.baseUrl ?? "https://clinicaltrials.gov/api/v2/studies";
}

export type LookbackWindow = {
  from: Date;
  to: Date;
  fromDay: string;
  toDay: string;
};

export function lookbackWindow(now = new Date(), hours = LOOKBACK_HOURS): LookbackWindow {
  const to = new Date(now);
  const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
  return {
    from,
    to,
    fromDay: toUtcDay(from),
    toDay: toUtcDay(to),
  };
}

export function toUtcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function constructPubmedUrl(pmid: string): `https://${string}` {
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
}

export function constructClinicalTrialsUrl(nctId: string): `https://${string}` {
  return `https://clinicaltrials.gov/study/${nctId}`;
}

export function normalizeDoi(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:/i, "").trim();
  const match = trimmed.match(/10\.\d{4,9}\/\S+/i);
  return match ? match[0].replace(/[.,;)]+$/, "").toLowerCase() : undefined;
}

export function canonicalUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = "";
  for (const key of [...parsed.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_")) parsed.searchParams.delete(key);
  }
  let pathname = parsed.pathname.replace(/\/+$/, "");
  if (pathname === "") pathname = "/";
  return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${pathname}${parsed.search}`.toLowerCase();
}

const MONTHS: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

export type ParsedDate = DatedValue;

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isValidCivilDate(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): boolean {
  if (!Number.isInteger(year) || year < 1 || year > 9999) return false;
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(day) || day < 1 || day > daysInMonth(year, month)) return false;
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return false;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return false;
  if (!Number.isInteger(second) || second < 0 || second > 59) return false;
  return true;
}

function pad(value: number, width = 2): string {
  return String(value).padStart(width, "0");
}

function formatUtcIso(year: number, month: number, day: number, hour: number, minute: number, second: number): string {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}Z`;
}

function applyOffsetToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  offset: string,
): string | undefined {
  const match = offset.match(/^([+-])(\d{2}):?(\d{2})$/);
  if (!match) return undefined;
  const sign = match[1] === "+" ? 1 : -1;
  const offsetMinutes = sign * (Number(match[2]) * 60 + Number(match[3]));
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, second) - offsetMinutes * 60_000;
  return new Date(utcMs).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function normalizeOffset(raw: string): string {
  if (raw.toUpperCase() === "Z") return "Z";
  const match = raw.match(/^([+-])(\d{2}):?(\d{2})$/);
  if (!match) return raw;
  return `${match[1]}${match[2]}:${match[3]}`;
}

/**
 * Parse a source date while keeping the precision the source actually gave.
 * Invalid civil dates are rejected. Explicit timezones are converted to UTC.
 * Datetimes without a timezone are compared as UTC and do not claim a timezone.
 */
export function parseLooseDate(raw: string | undefined): ParsedDate | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value) return undefined;

  const isoDateTime = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/i,
  );
  if (isoDateTime) {
    const year = Number(isoDateTime[1]);
    const month = Number(isoDateTime[2]);
    const day = Number(isoDateTime[3]);
    const hour = Number(isoDateTime[4]);
    const minute = Number(isoDateTime[5]);
    const second = Number(isoDateTime[6] ?? "0");
    if (!isValidCivilDate(year, month, day, hour, minute, second)) return undefined;
    const tzRaw = isoDateTime[7];
    if (!tzRaw) {
      return { raw: value, iso: formatUtcIso(year, month, day, hour, minute, second), precision: "datetime" };
    }
    if (tzRaw.toUpperCase() === "Z") {
      return { raw: value, iso: formatUtcIso(year, month, day, hour, minute, second), precision: "datetime", timeZone: "Z" };
    }
    const iso = applyOffsetToUtc(year, month, day, hour, minute, second, tzRaw);
    if (!iso) return undefined;
    return { raw: value, iso, precision: "datetime", timeZone: normalizeOffset(tzRaw) };
  }

  const isoDay = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDay) {
    const year = Number(isoDay[1]);
    const month = Number(isoDay[2]);
    const day = Number(isoDay[3]);
    if (!isValidCivilDate(year, month, day)) return undefined;
    return { raw: value, iso: `${isoDay[1]}-${isoDay[2]}-${isoDay[3]}`, precision: "day" };
  }

  const isoMonth = value.match(/^(\d{4})-(\d{2})$/);
  if (isoMonth) {
    const month = Number(isoMonth[2]);
    if (month < 1 || month > 12) return undefined;
    return { raw: value, iso: `${isoMonth[1]}-${isoMonth[2]}`, precision: "month" };
  }

  const pubmedHistory = value.match(/^(\d{4})\/(\d{2})\/(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (pubmedHistory) {
    const year = Number(pubmedHistory[1]);
    const month = Number(pubmedHistory[2]);
    const day = Number(pubmedHistory[3]);
    if (pubmedHistory[4]) {
      const hour = Number(pubmedHistory[4]);
      const minute = Number(pubmedHistory[5]);
      const second = Number(pubmedHistory[6] ?? "0");
      if (!isValidCivilDate(year, month, day, hour, minute, second)) return undefined;
      return { raw: value, iso: formatUtcIso(year, month, day, hour, minute, second), precision: "datetime" };
    }
    if (!isValidCivilDate(year, month, day)) return undefined;
    return { raw: value, iso: `${pubmedHistory[1]}-${pubmedHistory[2]}-${pubmedHistory[3]}`, precision: "day" };
  }

  const named = value.match(/^(\d{4})\s+([A-Za-z]{3,9})(?:\s+(\d{1,2}))?$/);
  if (named) {
    const month = MONTHS[named[2].slice(0, 3).toLowerCase()];
    if (!month) return undefined;
    const year = Number(named[1]);
    if (named[3]) {
      const day = Number(named[3]);
      if (!isValidCivilDate(year, Number(month), day)) return undefined;
      return { raw: value, iso: `${named[1]}-${month}-${pad(day)}`, precision: "day" };
    }
    if (Number(month) < 1 || Number(month) > 12) return undefined;
    return { raw: value, iso: `${named[1]}-${month}`, precision: "month" };
  }

  const yearOnly = value.match(/^(\d{4})$/);
  if (yearOnly) return { raw: value, iso: yearOnly[1], precision: "year" };
  return undefined;
}

export function coerceParsedDate(value: DateFieldValue | undefined): ParsedDate | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return parseLooseDate(value);
  if (value.precision && value.iso) return value;
  return parseLooseDate(value.raw);
}

export function dateFieldIso(value: DateFieldValue | undefined): string | undefined {
  const parsed = coerceParsedDate(value);
  if (!parsed) return typeof value === "string" ? value : value?.iso;
  if (parsed.precision === "datetime") return parsed.iso;
  if (parsed.precision === "day") return `${parsed.iso}T00:00:00Z`;
  if (parsed.precision === "month") return `${parsed.iso}-01T00:00:00Z`;
  return `${parsed.iso}-01-01T00:00:00Z`;
}

/**
 * A date qualifies for the 48-hour window only if its precision is enough
 * to know that. Year/month-only dates never qualify on their own.
 * Day-only dates qualify if that UTC calendar day overlaps the lookback
 * window. Datetimes are compared as exact instants.
 */
export function dateQualifiesForWindow(parsed: ParsedDate | undefined, window: LookbackWindow): boolean {
  if (!parsed) return false;
  if (parsed.precision === "year" || parsed.precision === "month") return false;
  if (parsed.precision === "datetime") {
    const time = Date.parse(parsed.iso);
    if (Number.isNaN(time)) return false;
    return time >= window.from.getTime() && time <= window.to.getTime();
  }
  const day = parsed.iso.slice(0, 10);
  const dayStart = Date.parse(`${day}T00:00:00Z`);
  if (Number.isNaN(dayStart)) return false;
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  return dayStart <= window.to.getTime() && dayEnd > window.from.getTime();
}

export function matchWindow(dateFields: RecordDateFields, window: LookbackWindow): WindowMatch {
  const matchedFields: string[] = [];
  for (const [name, value] of Object.entries(dateFields)) {
    if (dateQualifiesForWindow(coerceParsedDate(value), window)) matchedFields.push(name);
  }
  return { inWindow: matchedFields.length > 0, matchedFields };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type HttpGet = (url: string, init?: RequestInit) => Promise<Response>;

const defaultGet: HttpGet = (url, init) => fetch(url, init);

function withTimeout(): AbortSignal {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

async function getText(url: URL, httpGet: HttpGet, headers?: HeadersInit): Promise<string> {
  const response = await httpGet(url.toString(), {
    headers,
    signal: withTimeout(),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} for ${redactUrl(url)}`);
  }
  return response.text();
}

async function getJson<T>(url: URL, httpGet: HttpGet, headers?: HeadersInit): Promise<T> {
  const text = await getText(url, httpGet, headers);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON from ${redactUrl(url)}`);
  }
}

function redactUrl(url: URL): string {
  const copy = new URL(url.toString());
  if (copy.searchParams.has("api_key")) copy.searchParams.set("api_key", "REDACTED");
  return copy.toString();
}

function ncbiParams(): URLSearchParams {
  const params = new URLSearchParams();
  const tool = process.env.NCBI_TOOL?.trim() || "immortality-countdown";
  const email = process.env.NCBI_EMAIL?.trim();
  const apiKey = process.env.NCBI_API_KEY?.trim();
  params.set("tool", tool.replace(/\s+/g, ""));
  if (email) params.set("email", email);
  if (apiKey) params.set("api_key", apiKey);
  return params;
}

function issue(stage: string, kind: SourceIssue["kind"], message: string, count = 1): SourceIssue {
  return { stage, kind, count, message };
}

function finishSourceResult(result: Omit<SourceFetchResult, "ok" | "status"> & { status?: FetchStatus; issues?: SourceIssue[] }): SourceFetchResult {
  const issues = result.issues ?? [];
  const hasBlocking = issues.some((item) => item.kind !== "abstract-missing-in-source");
  let status: FetchStatus = result.status ?? "ok";
  if (result.error && result.records.length === 0 && (status === "failed" || hasBlocking || issues.length > 0)) {
    status = "failed";
  } else if (hasBlocking && result.records.length > 0) {
    status = "partial";
  } else if (hasBlocking && result.records.length === 0) {
    status = "failed";
  }
  return {
    ...result,
    issues: issues.length > 0 ? issues : undefined,
    status,
    ok: status === "ok",
  };
}

type ESearchJson = {
  esearchresult?: {
    count?: string;
    retmax?: string;
    retstart?: string;
    idlist?: string[];
    ERROR?: string;
  };
  error?: string;
};

type ESummaryJson = {
  result?: {
    uids?: string[];
    [uid: string]: unknown;
  };
};

type ESummaryDoc = {
  uid?: string;
  title?: string;
  pubdate?: string;
  epubdate?: string;
  sortpubdate?: string;
  source?: string;
  fulljournalname?: string;
  pubtype?: string[];
  authors?: Array<{ name?: string }>;
  articleids?: Array<{ idtype?: string; value?: string }>;
  history?: Array<{ pubstatus?: string; date?: string }>;
  attributes?: string[];
};

type CtGovStudiesResponse = {
  studies?: CtGovStudy[];
  nextPageToken?: string;
  totalCount?: number;
};

type CtGovStudy = {
  hasResults?: boolean;
  protocolSection?: {
    identificationModule?: {
      nctId?: string;
      briefTitle?: string;
      officialTitle?: string;
    };
    statusModule?: {
      overallStatus?: string;
      studyFirstPostDateStruct?: { date?: string };
      lastUpdatePostDateStruct?: { date?: string };
    };
    descriptionModule?: {
      briefSummary?: string;
    };
    designModule?: {
      studyType?: string;
      phases?: string[];
    };
  };
};

export async function fetchPubmed(
  window: LookbackWindow,
  httpGet: HttpGet = defaultGet,
  source: SourceDefinition | undefined = sourceById("pubmed"),
): Promise<SourceFetchResult> {
  let requestCount = 0;
  const issues: SourceIssue[] = [];
  const ids = new Set<string>();
  let truncated = false;
  const apiBase = pubmedApiBase(source);

  for (const datetype of ["edat", "pdat"] as const) {
    try {
      const found = await pubmedSearch(datetype, window, httpGet, apiBase, () => {
        requestCount += 1;
      });
      for (const id of found.ids) ids.add(id);
      truncated = truncated || found.truncated;
      if (found.truncated) {
        issues.push(issue(`esearch-${datetype}`, "truncated", `ESearch ${datetype} exceeded ${PUBMED_MAX_IDS} ids`, 1));
      }
    } catch (error) {
      issues.push(
        issue(`esearch-${datetype}`, "http", error instanceof Error ? error.message : String(error)),
      );
    }
  }

  if (ids.size === 0) {
    const searchFailed = issues.some((item) => item.stage.startsWith("esearch-"));
    return finishSourceResult({
      sourceId: "pubmed",
      records: [],
      error: searchFailed ? issues.map((item) => item.message).join("; ") : undefined,
      issues,
      truncated,
      requestCount,
      status: searchFailed ? "failed" : "ok",
    });
  }

  let records: FetchedRecord[] = [];
  try {
    records = await pubmedSummaries([...ids], window, httpGet, apiBase, () => {
      requestCount += 1;
    });
  } catch (error) {
    issues.push(issue("esummary", "http", error instanceof Error ? error.message : String(error)));
    return finishSourceResult({
      sourceId: "pubmed",
      records: [],
      error: error instanceof Error ? error.message : String(error),
      issues,
      truncated,
      requestCount,
      status: "failed",
    });
  }

  const withAbstracts = await pubmedAbstracts(records, httpGet, apiBase, () => {
    requestCount += 1;
  });
  issues.push(...withAbstracts.issues);

  return finishSourceResult({
    sourceId: "pubmed",
    records: withAbstracts.records.filter((record) => record.windowMatch.inWindow),
    issues,
    truncated,
    requestCount,
  });
}

async function pubmedSearch(
  datetype: "edat" | "pdat",
  window: LookbackWindow,
  httpGet: HttpGet,
  apiBase: string,
  onRequest: () => void,
): Promise<{ ids: string[]; truncated: boolean }> {
  const ids: string[] = [];
  let retstart = 0;
  let total = Infinity;
  let truncated = false;

  while (retstart < total && retstart < PUBMED_MAX_IDS) {
    const url = new URL(`${apiBase}/esearch.fcgi`);
    const params = ncbiParams();
    params.set("db", "pubmed");
    params.set("term", PUBMED_QUERY);
    params.set("retmode", "json");
    params.set("datetype", datetype);
    params.set("mindate", window.fromDay.replaceAll("-", "/"));
    params.set("maxdate", window.toDay.replaceAll("-", "/"));
    params.set("retstart", String(retstart));
    params.set("retmax", String(PUBMED_PAGE_SIZE));
    url.search = params.toString();

    onRequest();
    const json = await getJson<ESearchJson>(url, httpGet);
    await sleep(NCBI_GAP_MS);
    if (json.error || json.esearchresult?.ERROR) {
      throw new Error(json.error || json.esearchresult?.ERROR || "ESearch error");
    }
    const result = json.esearchresult;
    if (!result) throw new Error("ESearch JSON missing esearchresult");
    total = Number(result.count ?? 0);
    ids.push(...(result.idlist ?? []));
    if (total > PUBMED_MAX_IDS) truncated = true;
    if (!result.idlist?.length) break;
    retstart += PUBMED_PAGE_SIZE;
  }

  return { ids: [...new Set(ids)], truncated };
}

async function pubmedSummaries(
  ids: string[],
  window: LookbackWindow,
  httpGet: HttpGet,
  apiBase: string,
  onRequest: () => void,
): Promise<FetchedRecord[]> {
  const fetchedAt = window.to.toISOString();
  const records: FetchedRecord[] = [];

  for (let i = 0; i < ids.length; i += PUBMED_SUMMARY_BATCH) {
    const batch = ids.slice(i, i + PUBMED_SUMMARY_BATCH);
    const url = new URL(`${apiBase}/esummary.fcgi`);
    const params = ncbiParams();
    params.set("db", "pubmed");
    params.set("retmode", "json");
    params.set("id", batch.join(","));
    url.search = params.toString();
    onRequest();
    const json = await getJson<ESummaryJson>(url, httpGet);
    await sleep(NCBI_GAP_MS);
    const result = json.result;
    if (!result) throw new Error("ESummary JSON missing result");
    for (const uid of result.uids ?? batch) {
      const doc = result[uid];
      if (!doc || typeof doc !== "object") continue;
      const parsed = parsePubmedSummary(doc as ESummaryDoc, fetchedAt, window);
      if (parsed) records.push(parsed);
    }
  }
  return records;
}

export function parsePubmedSummary(doc: ESummaryDoc, fetchedAt: string, window: LookbackWindow): FetchedRecord | null {
  const pmid = doc.uid?.trim();
  const title = doc.title?.replace(/\.$/, "").trim();
  if (!pmid || !title) return null;

  const history = doc.history ?? [];
  const entrez = history.find((item) => item.pubstatus === "entrez")?.date;
  const pubmedDate = history.find((item) => item.pubstatus === "pubmed")?.date;
  const publicationRaw = doc.epubdate || doc.pubdate || doc.sortpubdate;
  const publication = parseLooseDate(publicationRaw);
  const entrezParsed = parseLooseDate(entrez) ?? parseLooseDate(pubmedDate);
  const dateFields: RecordDateFields = {};
  if (publication) dateFields.publicationDate = publication;
  if (entrezParsed) dateFields.entrezDate = entrezParsed;
  const publishedParsed = publication ?? entrezParsed;
  if (!publishedParsed) return null;

  const doi = normalizeDoi(doc.articleids?.find((id) => id.idtype === "doi")?.value);
  const authors = doc.authors?.map((author) => author.name?.trim()).filter((name): name is string => Boolean(name));

  return {
    sourceId: "pubmed",
    sourceName: "PubMed",
    recordId: pmid,
    title,
    sourceUrl: constructPubmedUrl(pmid),
    urlOrigin: {
      kind: "constructed-from-id",
      rule: PUBMED_RECORD_URL_RULE,
      id: pmid,
    },
    publishedAt: dateFieldIso(publishedParsed) ?? publishedParsed.iso,
    fetchedAt,
    dateFields,
    windowMatch: matchWindow(dateFields, window),
    doi,
    authors,
    hints: {
      pubTypes: doc.pubtype,
      journal: doc.fulljournalname || doc.source,
    },
  };
}

async function pubmedAbstracts(
  records: FetchedRecord[],
  httpGet: HttpGet,
  apiBase: string,
  onRequest: () => void,
): Promise<{ records: FetchedRecord[]; issues: SourceIssue[] }> {
  const byId = new Map(records.map((record) => [record.recordId, record]));
  const ids = records.map((record) => record.recordId);
  const issues: SourceIssue[] = [];
  let missingInSource = 0;
  let fetchFailed = 0;
  let notInResponse = 0;
  const fetchFailMessages: string[] = [];

  for (let i = 0; i < ids.length; i += PUBMED_SUMMARY_BATCH) {
    const batch = ids.slice(i, i + PUBMED_SUMMARY_BATCH);
    const url = new URL(`${apiBase}/efetch.fcgi`);
    const params = ncbiParams();
    params.set("db", "pubmed");
    params.set("retmode", "xml");
    params.set("id", batch.join(","));
    url.search = params.toString();
    onRequest();
    try {
      const xml = await getText(url, httpGet);
      const parsed = parsePubmedAbstractDocument(xml);
      for (const [pmid, abstract] of parsed.abstracts) {
        const record = byId.get(pmid);
        if (record) record.abstract = abstract;
      }
      missingInSource += parsed.missingAbstractPmids.filter((pmid) => byId.has(pmid)).length;
      for (const pmid of batch) {
        if (!parsed.pmidsInDocument.includes(pmid) && !parsed.abstracts.has(pmid)) {
          notInResponse += 1;
        }
      }
    } catch (error) {
      fetchFailed += batch.length;
      fetchFailMessages.push(error instanceof Error ? error.message : String(error));
    }
    await sleep(NCBI_GAP_MS);
  }

  if (fetchFailed > 0) {
    issues.push(
      issue(
        "efetch-abstracts",
        "abstract-fetch-failed",
        `abstract HTTP/parse failure for ${fetchFailed} record(s): ${fetchFailMessages.join("; ")}`,
        fetchFailed,
      ),
    );
  }
  if (notInResponse > 0) {
    issues.push(
      issue(
        "efetch-abstracts",
        "abstract-not-in-response",
        `efetch XML omitted ${notInResponse} requested PMID(s)`,
        notInResponse,
      ),
    );
  }
  if (missingInSource > 0) {
    issues.push(
      issue(
        "efetch-abstracts",
        "abstract-missing-in-source",
        `${missingInSource} PMID(s) were present in efetch XML without an abstract`,
        missingInSource,
      ),
    );
  }

  return { records, issues };
}

export function parsePubmedAbstractDocument(xml: string): {
  abstracts: Map<string, string>;
  pmidsInDocument: string[];
  missingAbstractPmids: string[];
} {
  const abstracts = new Map<string, string>();
  const pmidsInDocument: string[] = [];
  const missingAbstractPmids: string[] = [];
  const articles = xml.split(/<PubmedArticle>/i).slice(1);
  for (const article of articles) {
    const pmid = article.match(/<PMID[^>]*>(\d+)<\/PMID>/i)?.[1];
    if (!pmid) continue;
    pmidsInDocument.push(pmid);
    const parts = [...article.matchAll(/<AbstractText\b[^>]*>([\s\S]*?)<\/AbstractText>/gi)];
    if (parts.length === 0) {
      missingAbstractPmids.push(pmid);
      continue;
    }
    const text = parts
      .map((match) => decodeXml(match[1]).trim())
      .filter(Boolean)
      .join("\n");
    if (text) abstracts.set(pmid, text);
    else missingAbstractPmids.push(pmid);
  }
  return { abstracts, pmidsInDocument, missingAbstractPmids };
}

export function parsePubmedAbstracts(xml: string): Map<string, string> {
  return parsePubmedAbstractDocument(xml).abstracts;
}

function decodeXml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num: string) => String.fromCharCode(Number.parseInt(num, 10)))
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchClinicalTrials(
  window: LookbackWindow,
  httpGet: HttpGet = defaultGet,
  source: SourceDefinition | undefined = sourceById("clinicaltrials"),
): Promise<SourceFetchResult> {
  let requestCount = 0;
  const issues: SourceIssue[] = [];
  const byId = new Map<string, FetchedRecord>();
  const apiUrl = clinicalTrialsApiUrl(source);

  for (const dateArea of ["StudyFirstPostDate", "LastUpdatePostDate"] as const) {
    try {
      const page = await ctgovSearch(dateArea, window, httpGet, apiUrl, () => {
        requestCount += 1;
      });
      for (const record of page) {
        const existing = byId.get(record.recordId);
        if (!existing) {
          byId.set(record.recordId, record);
          continue;
        }
        existing.dateFields = { ...existing.dateFields, ...record.dateFields };
        existing.windowMatch = matchWindow(existing.dateFields, window);
        if (!existing.abstract && record.abstract) existing.abstract = record.abstract;
      }
    } catch (error) {
      issues.push(
        issue(`studies-${dateArea}`, "http", error instanceof Error ? error.message : String(error)),
      );
    }
  }

  const records = [...byId.values()].filter((record) => record.windowMatch.inWindow);
  const searchFailed = issues.length > 0;
  return finishSourceResult({
    sourceId: "clinicaltrials",
    records,
    error: records.length === 0 && searchFailed ? issues.map((item) => item.message).join("; ") : undefined,
    issues,
    requestCount,
    status: searchFailed && records.length === 0 ? "failed" : searchFailed ? "partial" : "ok",
  });
}

async function ctgovSearch(
  dateArea: "StudyFirstPostDate" | "LastUpdatePostDate",
  window: LookbackWindow,
  httpGet: HttpGet,
  apiUrl: string,
  onRequest: () => void,
): Promise<FetchedRecord[]> {
  const records: FetchedRecord[] = [];
  let pageToken: string | undefined;
  const fetchedAt = window.to.toISOString();

  while (true) {
    const url = new URL(apiUrl);
    url.searchParams.set("format", "json");
    url.searchParams.set("countTotal", pageToken ? "false" : "true");
    url.searchParams.set("pageSize", String(CTGOV_PAGE_SIZE));
    url.searchParams.set(
      "query.term",
      `${CTGOV_QUERY} AND AREA[${dateArea}]RANGE[${window.fromDay},${window.toDay}]`,
    );
    url.searchParams.set(
      "fields",
      "NCTId,BriefTitle,OfficialTitle,StudyFirstPostDate,LastUpdatePostDate,OverallStatus,BriefSummary,StudyType,Phase,HasResults",
    );
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    onRequest();
    const json = await getJson<CtGovStudiesResponse>(url, httpGet, {
      Accept: "application/json",
    });
    for (const study of json.studies ?? []) {
      const parsed = parseCtGovStudy(study, fetchedAt, window);
      if (parsed) records.push(parsed);
    }
    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
  }

  return records;
}

export function parseCtGovStudy(study: CtGovStudy, fetchedAt: string, window: LookbackWindow): FetchedRecord | null {
  const nctId = study.protocolSection?.identificationModule?.nctId?.trim();
  const title =
    study.protocolSection?.identificationModule?.briefTitle?.trim() ||
    study.protocolSection?.identificationModule?.officialTitle?.trim();
  if (!nctId || !title) return null;

  const firstPostedRaw = study.protocolSection?.statusModule?.studyFirstPostDateStruct?.date;
  const lastUpdateRaw = study.protocolSection?.statusModule?.lastUpdatePostDateStruct?.date;
  const firstPosted = parseLooseDate(firstPostedRaw);
  const lastUpdate = parseLooseDate(lastUpdateRaw);
  const dateFields: RecordDateFields = {};
  if (firstPosted) dateFields.studyFirstPostDate = firstPosted;
  if (lastUpdate) dateFields.lastUpdatePostDate = lastUpdate;
  const publishedParsed = firstPosted ?? lastUpdate;
  if (!publishedParsed) return null;

  return {
    sourceId: "clinicaltrials",
    sourceName: "ClinicalTrials.gov",
    recordId: nctId.toUpperCase(),
    title,
    sourceUrl: constructClinicalTrialsUrl(nctId.toUpperCase()),
    urlOrigin: {
      kind: "constructed-from-id",
      rule: CTGOV_RECORD_URL_RULE,
      id: nctId.toUpperCase(),
    },
    publishedAt: dateFieldIso(publishedParsed) ?? publishedParsed.iso,
    fetchedAt,
    dateFields,
    windowMatch: matchWindow(dateFields, window),
    abstract: study.protocolSection?.descriptionModule?.briefSummary?.trim(),
    hints: {
      studyType: study.protocolSection?.designModule?.studyType,
      phases: study.protocolSection?.designModule?.phases,
      hasResults: study.hasResults,
      overallStatus: study.protocolSection?.statusModule?.overallStatus,
    },
  };
}

export async function fetchEnabledSources(
  window: LookbackWindow,
  httpGet: HttpGet = defaultGet,
  sources: SourceDefinition[] = enabledSources(),
): Promise<SourceFetchResult[]> {
  const results: SourceFetchResult[] = [];
  for (const source of sources.filter((item) => item.enabled)) {
    if (source.api.kind === "pubmed-eutils") {
      results.push(await fetchPubmed(window, httpGet, source));
    } else if (source.api.kind === "ctgov-studies") {
      results.push(await fetchClinicalTrials(window, httpGet, source));
    }
  }
  return results;
}
