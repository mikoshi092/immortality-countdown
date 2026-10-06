import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { articles, isPublishedArticle, listArticles, type Article } from "../../data/articles";
import { fixtureCandidate, validMouseDraft } from "../editorial/fixtures";
import { validateDraft } from "../editorial/validate";
import { generateDrafts } from "../editorial/generate";
import { MockEditorialProvider } from "../editorial/mock-provider";
import { runIngest } from "../run";
import type { Candidate, IngestReport } from "../types";
import type { EditorialDraft, EditorialReport } from "../editorial/types";
import { applyDraftsToArticles } from "./apply";
import { assertAutoPublishPaths } from "./check-paths";
import { decidePublish } from "./policy";
import { gateExistingArticles } from "./existing";
import { AUTO_PUBLISH_PROTECTED_PATHS } from "./paths";
import { assessAutoMerge } from "./required-checks";
import { modelReviewPrBody, runModelReview } from "../model-review/run";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function sha(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function ingestOk(overrides: Partial<IngestReport> = {}): IngestReport {
  return {
    generatedAt: "2026-09-17T00:00:00Z",
    lookbackHours: 48,
    windowFrom: "2026-09-15T00:00:00Z",
    windowTo: "2026-09-17T00:00:00Z",
    nodeVersion: "22.0.0",
    counts: { fetched: 1, deduplicated: 1, relevant: 1, rejected: 0 },
    countDefinitions: { fetched: "", deduplicated: "", relevant: "", rejected: "" },
    sourceResults: [
      { sourceId: "pubmed", ok: true, status: "ok", fetched: 1 },
      { sourceId: "clinicaltrials", ok: true, status: "ok", fetched: 0 },
    ],
    scoreDisclaimer: "",
    candidates: [fixtureCandidate()],
    rejected: [],
    ...overrides,
  };
}

function editorialFromDrafts(count: { drafts: number; held?: number; rejected?: number }): EditorialReport {
  const draft = validMouseDraft(fixtureCandidate());
  return {
    generatedAt: "2026-09-17T00:00:00Z",
    provider: "mock",
    inputPath: "",
    counts: {
      candidates: count.drafts + (count.held ?? 0) + (count.rejected ?? 0),
      drafts: count.drafts,
      held: count.held ?? 0,
      rejected: count.rejected ?? 0,
    },
    drafts: count.drafts > 0 ? [draft] : [],
    rejectedDrafts:
      (count.held ?? 0) > 0
        ? [
            {
              recordId: "held-1",
              title: "Held item",
              reasons: ["study subjects could not be determined"],
              status: "held",
            },
          ]
        : [],
  };
}

describe("publish policy", () => {
  it("does not publish when source fetch is partial", () => {
    const decision = decidePublish({
      ingest: ingestOk({
        sourceResults: [
          { sourceId: "pubmed", ok: false, status: "partial", fetched: 2, error: "page 2 failed" },
        ],
      }),
      editorial: editorialFromDrafts({ drafts: 1 }),
      changedPaths: ["data/articles.ts"],
      protectedChanged: [],
    });
    assert.equal(decision.ok, false);
    if (!decision.ok) {
      assert.equal(decision.failWorkflow, true);
      assert.match(decision.reason, /partial or failed/);
    }
  });

  it("does not auto-merge when only held drafts exist", () => {
    const decision = decidePublish({
      ingest: ingestOk(),
      editorial: editorialFromDrafts({ drafts: 0, held: 1 }),
      changedPaths: [],
      protectedChanged: [],
    });
    assert.equal(decision.ok, false);
    if (!decision.ok) {
      assert.equal(decision.failWorkflow, false);
      assert.match(decision.reason, /held/);
    }
  });

  it("fails the workflow when editorial schema is invalid", () => {
    const editorial = editorialFromDrafts({ drafts: 1 });
    const decision = decidePublish({
      ingest: ingestOk(),
      editorial: { ...editorial, drafts: [] },
      changedPaths: ["data/articles.ts"],
      protectedChanged: [],
    });
    assert.equal(decision.ok, false);
    if (!decision.ok) {
      assert.equal(decision.failWorkflow, true);
      assert.match(decision.reason, /schema validation failed/);
    }
  });

  it("fails the workflow when a protected file changed", () => {
    const decision = decidePublish({
      ingest: ingestOk(),
      editorial: editorialFromDrafts({ drafts: 1 }),
      changedPaths: ["lev/params.json"],
      protectedChanged: ["lev/params.json"],
    });
    assert.equal(decision.ok, false);
    if (!decision.ok) {
      assert.equal(decision.failWorkflow, true);
      assert.match(decision.reason, /protected/);
    }
  });
});

describe("path allowlist", () => {
  it("fails when lev model files change", () => {
    const result = assertAutoPublishPaths([...AUTO_PUBLISH_PROTECTED_PATHS]);
    assert.equal(result.ok, false);
  });

  it("fails when existing UI or model code changes", () => {
    assert.equal(assertAutoPublishPaths(["app/page.tsx"]).ok, false);
    assert.equal(assertAutoPublishPaths(["components/NewsCard.tsx"]).ok, false);
    assert.equal(assertAutoPublishPaths(["lev/run.ts"]).ok, false);
    assert.equal(assertAutoPublishPaths(["package.json"]).ok, false);
  });

  it("allows only data/articles.ts on an automatic news PR", () => {
    assert.equal(assertAutoPublishPaths(["data/articles.ts"]).ok, true);
    assert.equal(assertAutoPublishPaths(["docs/editorial-policy.md"]).ok, false);
    assert.equal(
      assertAutoPublishPaths(["data/articles.ts", "docs/editorial-policy.md"]).ok,
      false,
    );
  });
});

describe("editorial publish gate", () => {
  const slugs = new Set<string>();

  it("rejects countdownImpact other than none", () => {
    const candidate = fixtureCandidate();
    const draft = validMouseDraft(candidate, { countdownImpact: "watch" });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => reason.includes("countdownImpact")));
    }
  });

  it("does not republish a duplicate DOI or URL", () => {
    const candidate = fixtureCandidate();
    const draft = validMouseDraft(candidate);
    const result = validateDraft(draft, candidate, slugs, [
      {
        ...articles[0],
        doi: candidate.doi,
        sourceUrl: candidate.sourceUrl,
        slug: "already-published",
      },
    ]);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.reasons.some((reason) => /duplicate (DOI|URL)/.test(reason)));
    }
  });

  it("rejects English/Japanese number or species mismatches", () => {
    const candidate = fixtureCandidate();
    const draft = validMouseDraft(candidate, {
      ja: {
        ...validMouseDraft(candidate).ja,
        dek: "マウス実験で処置の効果は有意ではなかった。",
        whatHappened: "マウスでは処置は寿命に対して有意ではなかった。",
      },
    });
    const result = validateDraft(draft, candidate, slugs);
    assert.equal(result.ok, false);
  });
});

describe("sitePublishedAt is required for public surfaces", () => {
  it("omits articles without sitePublishedAt", () => {
    for (const article of articles) {
      if (!article.sitePublishedAt) {
        assert.equal(isPublishedArticle(article), false);
        assert.equal(listArticles().some((entry) => entry.id === article.id), false);
      }
    }
  });

  it("includes only articles that passed every gate after apply", () => {
    const candidate = fixtureCandidate({
      recordId: "pmid-pass-gate",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/12312312/",
      doi: "10.0000/fixture.pass-gate",
    });
    const draft = validMouseDraft(candidate, {
      id: "2026-09-15-pass-gate",
      slug: "2026-09-15-pass-gate",
      sourceUrl: candidate.sourceUrl,
      doi: candidate.doi,
      candidateRecordId: candidate.recordId,
    });
    const validated = validateDraft(draft, candidate, new Set(), articles);
    assert.equal(validated.ok, true, validated.ok ? "" : validated.reasons.join("; "));
    const dir = mkdtempSync(join(tmpdir(), "publish-"));
    const path = join(dir, "articles.json");
    writeFileSync(path, "[]\n");
    const applied = applyDraftsToArticles([draft], new Date("2026-09-17T08:00:00Z"), {
      articlesPath: path,
      existing: [],
    });
    assert.equal(applied.added.length, 1);
    assert.equal(applied.added[0].sitePublishedAt, new Date("2026-09-17T08:00:00Z").toISOString());
    assert.equal(applied.added[0].draftCreatedAt, applied.added[0].sitePublishedAt);
    assert.notEqual(applied.added[0].sitePublishedAt, applied.added[0].sourcePublishedAt);
    assert.equal(applied.added[0].countdownImpact, "none");
    assert.equal(applied.added[0].featured, undefined);
  });
});

describe("existing articles", () => {
  it("runs the same publish gate and keeps articles unpublished when they fail", () => {
    const results = gateExistingArticles();
    assert.equal(results.length, articles.length);
    for (const result of results) {
      if (!result.ok) {
        assert.ok(result.reasons.length > 0, `${result.articleId} failed without reasons`);
      }
    }
    const byId = Object.fromEntries(results.map((result) => [result.articleId, result]));
    for (const article of articles) {
      const result = byId[article.id];
      assert.ok(result, article.id);
      if (result.ok) {
        assert.ok(article.sitePublishedAt, `${article.id} passed the gate but has no sitePublishedAt`);
      } else {
        assert.equal(
          article.sitePublishedAt,
          undefined,
          `${article.id} failed the gate and must not be listed: ${result.reasons.join("; ")}`,
        );
      }
    }
  });
});

function listedFromDraft(draft: EditorialDraft, sourceCheck?: Candidate): Article {
  const { candidateRecordId: _candidateRecordId, relevanceScore: _relevanceScore, significanceScore: _significanceScore, ...rest } = draft;
  void _candidateRecordId;
  void _relevanceScore;
  void _significanceScore;
  return {
    ...rest,
    sourceCheck,
    draftCreatedAt: "2026-10-05T08:09:57.494Z",
    sitePublishedAt: "2026-10-05T08:09:57.494Z",
  };
}

describe("automatic articles are checked against their saved source", () => {
  const candidate = fixtureCandidate({
    recordId: "pmid-42828712",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/42828712/",
    doi: "10.1007/s10522-026-10515-z",
    title: "Exploring the mtDNA-cGAS-STING Signaling Imitations in Cellular Senescence",
  });
  const draft = validMouseDraft(candidate, {
    id: "2026-10-05-mtdna-cgas-sting",
    slug: "2026-10-05-mtdna-cgas-sting",
    sourceUrl: candidate.sourceUrl,
    doi: candidate.doi,
    candidateRecordId: candidate.recordId,
  });

  it("reproduces the verify failure when a new listing has no saved source", () => {
    const article = listedFromDraft(draft);
    const result = gateExistingArticles([...articles, article]).find((item) => item.articleId === article.id);
    assert.ok(result);
    assert.equal(result.ok, false);
    assert.match(result.reasons.join("; "), /no verified source excerpt/);
    assert.notEqual(article.sitePublishedAt, undefined);
  });

  it("accepts a later automatic article only when the saved source still passes the gate", () => {
    const article = listedFromDraft(draft, candidate);
    const result = gateExistingArticles([...articles, article]).find((item) => item.articleId === article.id);
    assert.ok(result);
    assert.equal(result.ok, true, result.reasons.join("; "));
    assert.ok(article.sitePublishedAt);

    const upgraded = listedFromDraft({ ...draft, evidence: "Evidence C" }, candidate);
    const rejected = gateExistingArticles([...articles, upgraded]).find((item) => item.articleId === upgraded.id);
    assert.ok(rejected);
    assert.equal(rejected.ok, false);
    assert.match(rejected.reasons.join("; "), /Evidence was upgraded/);

    const gossip = {
      ...candidate,
      title: "Celebrity gossip about a longevity cream",
      abstract: "Hollywood celebrity gossip and a tabloid interview.",
    };
    const excluded = listedFromDraft(draft, gossip);
    const noise = gateExistingArticles([...articles, excluded]).find((item) => item.articleId === excluded.id);
    assert.ok(noise);
    assert.equal(noise.ok, false);
    assert.match(noise.reasons.join("; "), /celebrity or gossip/);
  });

  it("writes the saved source onto the article file for the next catalog check", () => {
    const dir = mkdtempSync(join(tmpdir(), "publish-source-"));
    const path = join(dir, "articles.json");
    writeFileSync(path, "[]\n");
    const applied = applyDraftsToArticles(
      [{ ...draft, sourceCheck: candidate }],
      new Date("2026-10-05T08:09:57.494Z"),
      { articlesPath: path, existing: [] },
    );
    assert.equal(applied.added.length, 1);
    assert.equal(applied.added[0].sourceCheck?.recordId, candidate.recordId);
    assert.equal(applied.added[0].sourceCheck?.abstract, candidate.abstract);
    const again = gateExistingArticles([...articles, applied.added[0]]).find(
      (item) => item.articleId === applied.added[0].id,
    );
    assert.equal(again?.ok, true, again?.reasons.join("; "));
  });
});

describe("mock end-to-end does not touch the model", () => {
  it("ingest, editorial, and apply leave lev files unchanged", async () => {
    const paramsPath = join(root, "lev", "params.json");
    const forecastPath = join(root, "lev", "forecast.json");
    const beforeParams = sha(paramsPath);
    const beforeForecast = sha(forecastPath);
    const dir = mkdtempSync(join(tmpdir(), "e2e-"));
    const ingestPath = join(dir, "candidates.json");
    const articlesPath = join(dir, "articles.json");
    writeFileSync(articlesPath, "[]\n");

    const httpGet = async (url: string) => {
      if (url === "https://www.nature.com/nature.rss") return new Response("<rss><channel></channel></rss>");
      if (url.includes("esearch.fcgi")) {
        return new Response(JSON.stringify({ esearchresult: { count: "1", idlist: ["99900001"] } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (url.includes("esummary.fcgi")) {
        return new Response(
          JSON.stringify({
            result: {
              uids: ["99900001"],
              "99900001": {
                uid: "99900001",
                title: "Senolytic treatment extends lifespan in aged mice",
                pubdate: "2026 Sep 15",
                articleids: [{ idtype: "doi", value: "10.1000/fixture.e2e" }],
                history: [{ pubstatus: "entrez", date: "2026/09/15 16:53" }],
                authors: [{ name: "Fixture A" }],
              },
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      if (url.includes("efetch.fcgi")) {
        return new Response(
          `<PubmedArticleSet><PubmedArticle><PMID Version="1">99900001</PMID><Abstract><AbstractText>Aged mice were treated with dasatinib plus quercetin. Median lifespan was extended from 94 to 118 weeks compared with vehicle control.</AbstractText></Abstract></PubmedArticle></PubmedArticleSet>`,
          { status: 200 },
        );
      }
      if (url.includes("clinicaltrials.gov/api/v2/studies")) {
        return new Response(JSON.stringify({ studies: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response("unexpected", { status: 500 });
    };

    const ingest = await runIngest({
      now: new Date("2026-09-16T02:00:00Z"),
      httpGet,
      outputPath: ingestPath,
      write: true,
    });
    assert.equal(ingest.sourceResults.every((source) => source.status === "ok"), true);
    writeFileSync(ingestPath, JSON.stringify(ingest));

    const editorial = await generateDrafts(ingest.candidates, new MockEditorialProvider());
    if (editorial.drafts.length > 0) {
      applyDraftsToArticles(editorial.drafts, new Date("2026-09-17T08:00:00Z"), {
        articlesPath,
        existing: [],
      });
    }

    assert.equal(sha(paramsPath), beforeParams);
    assert.equal(sha(forecastPath), beforeForecast);
  });
});

describe("workflow files", () => {
  it("news workflow uses a branch and PR, not a direct push to main", () => {
    const src = readFileSync(join(root, ".github/workflows/news-auto-publish.yml"), "utf8");
    assert.match(src, /concurrency:/);
    assert.match(src, /group: news-auto-publish/);
    assert.match(src, /gh pr create/);
    assert.match(src, /gh pr merge --auto --squash/);
    assert.match(src, /NEWS_PUBLISH_TOKEN/);
    assert.match(src, /required-checks\.ts/);
    assert.match(src, /open-pr-lock\.ts/);
    assert.match(src, /persist-credentials:\s*false/);
    assert.match(src, /GITHUB_RUN_ID/);
    assert.equal(/push:\s*\n\s*branches:\s*\n\s*-\s*main/.test(src), false);
    assert.equal(src.includes("git push origin main"), false);
    assert.equal(src.includes("git revert"), false);
  });

  it("model review is separate and never auto-merges", () => {
    const src = readFileSync(join(root, ".github/workflows/model-review.yml"), "utf8");
    assert.match(src, /ref: main/);
    assert.equal(src.includes("gh pr merge --auto"), false);
    assert.equal(src.includes("model:write"), false);
    assert.equal(src.includes("lev/run.ts"), false);
    assert.match(src, /--draft/);
    const body = modelReviewPrBody(runModelReview(new Date("2026-09-24T00:00:00Z")));
    assert.match(body, /Auto-merge is forbidden/);
    assert.match(body, /Monte Carlo/);
    assert.equal(body.toLowerCase().includes("abstract"), false);
  });

  it("records production deploy failures without reverting", () => {
    const src = readFileSync(join(root, ".github/workflows/production-deploy-notice.yml"), "utf8");
    assert.match(src, /deployment_status/);
    assert.match(src, /検証未完了/);
    assert.equal(/^\s*workflow_run:/m.test(src), false);
    assert.match(src, /Production deploy failed/);
    assert.equal(src.includes("git revert"), false);
    assert.equal(src.includes("git push"), false);
  });
});

describe("auto-merge guard", () => {
  it("allows auto-merge only when verify is required and reviews are not", () => {
    const allowed = assessAutoMerge({
      rules: [
        {
          type: "required_status_checks",
          parameters: { required_status_checks: [{ context: "verify" }] },
        },
      ],
      classic: null,
    });
    assert.equal(allowed.ok, true);

    const missing = assessAutoMerge({ rules: [], classic: null });
    assert.equal(missing.ok, false);

    const reviewed = assessAutoMerge({
      rules: [
        {
          type: "required_status_checks",
          parameters: { required_status_checks: [{ context: "verify" }] },
        },
        { type: "pull_request", parameters: { required_approving_review_count: 1 } },
      ],
      classic: null,
    });
    assert.equal(reviewed.ok, false);
  });
});
