# Editorial policy

News updates and LEV model updates are separate processes. Daily news never changes countdown years.

## News (automatic)

News is collected, ranked, written in English, translated into Japanese, validated, and published without human pre-approval.

The automatic path is:

1. Ingest (PubMed and ClinicalTrials.gov)
2. Editorial generation
3. Validation against the publish gate
4. Article file write (`data/articles.ts` only)
5. Article-only branch and pull request, unless an automatic news PR is already open
6. Required CI checks
7. Automatic merge when those checks pass and the pull request is still within 24 hours
8. Vercel production deploy from `main`

The workflow never pushes directly to `main`. If CI fails, the PR is not merged.

`countdownImpact` on automatic articles is always `none`. A daily news pull request may change `data/articles.ts` and nothing else. It does not change `docs/editorial-policy.md`, `lev/params.json`, `lev/forecast.json`, model code, or existing UI.

## Open PR lock and 24-hour expiry

At the start of each run the workflow lists open pull requests. If any open PR has a head branch `news/auto-*` or the label `news-auto`, this run does not create another branch or PR. The Job Summary records that PR's URL and state. Failed checks fail the workflow. Pending checks, or successful checks that are not on `main` yet, end the run successfully and wait. That keeps the same DOI or URL from being opened again before `main` contains the article.

`sitePublishedAt` remains the UTC time when the article file and pull request are created. An automatic news PR expires 24 hours after it was opened. An expired PR does not get auto-merge. The Job Summary marks it `expired`. The workflow disables auto-merge and closes the PR when that close succeeds. The next run may regenerate the articles with a new `sitePublishedAt`. Branch names include `GITHUB_RUN_ID` and `GITHUB_RUN_ATTEMPT`, so a rerun does not reuse the previous branch name.

## Dates

- `sourcePublishedAt` is the date the paper or registry record states. It is not the on-site listing date.
- `draftCreatedAt` is the UTC time when the automatic pipeline wrote the article file for the PR.
- `sitePublishedAt` is the **scheduled listing time**. It is that same file-write UTC timestamp.

The pipeline cannot write the GitHub merge timestamp back into the article file without a second commit to `main`. Direct pushes to `main` are forbidden, and automatic revert is not used. Therefore `sitePublishedAt` is the scheduled listing time, not a guessed paper date and not a predicted merge time. On automatic articles, `draftCreatedAt` and `sitePublishedAt` are the same instant and mean different things: file generation versus the public listing clock.

Required checks and merge can complete after `sitePublishedAt`. That delay is allowed. Public listings, article routes, RSS, the sitemap, and Article JSON-LD include an article only when `sitePublishedAt` is set. They use that value, never `sourcePublishedAt` and never `draftCreatedAt` as the site publish date.

## Publish gate

An article is published only when all of the following are determined and pass. If a check cannot be determined, the item is `held`, recorded with reasons in `editorial-drafts.json` / `publish-report.json` and the Job Summary, and is not published. Missing facts are not filled in by model guesswork.

- `relevance` and `significance` at or above the current ingest thresholds (50 and 30). These are discovery filters, not measures of evidence quality.
- URL, DOI, and source ID match the candidate
- URL or DOI is not a duplicate of an existing article
- Evidence is not upgraded from the ranked candidate
- `studySubjects` match the species or population written in English and Japanese
- English and Japanese numbers match each other and appear in the source materials
- Negation, non-significance, aims, hypotheses, and planned work are not written as results
- ClinicalTrials.gov registration is not written as an efficacy result
- A trial whose only in-window date is `LastUpdatePostDate` is held unless the fetch includes a verified change description. The article and source record can remain stored without `sitePublishedAt`
- A trial with no posted results is labeled “Trial registration and research plan” / 「試験登録・研究計画」 in both languages. Its purpose is not written as an outcome, and the registry status is stated rather than replaced
- The science-news label is not applied to a trial registration
- `hasResults=false` is not written as posted results
- Observational findings are not written as human causal outcomes
- Cell, tissue, or animal work is not written as a living-participant result
- `countdownImpact` is `none`
- JSON-LD, RSS, sitemap, and internal links remain valid
- `tsc`, lint, tests, and production build succeed

## Noise exclusion

The following are excluded automatically and are not published:

- Celebrity or gossip coverage
- Cosmetic or beauty-product promotion
- Supplement sales copy
- Research that only uses the word “longevity” without longevity-research content
- General social or demographic articles about age
- Preclinical work whose animal or cell species cannot be identified
- Editorials, opinion pieces, or press releases without primary research
- Retracted articles
- Literature records whose DOI or primary source cannot be confirmed

The words “anti-aging”, “longevity”, or “human” are not enough to adopt a record or to raise Evidence to C.

Cancer-treatment research is in scope when the title or abstract identifies both a cancer and a treatment approach. Trial registrations may be reported as trial activity (Evidence E); they must never be described as evidence that the treatment works. Animal and cell results must stay labeled as preclinical.

### Science news and early discoveries

Newsworthiness includes AI-assisted biological discoveries, new research laboratories and experimental platforms, gene-editing tools, regeneration, and new cancer-treatment developments. Demonstrated human lifespan extension is not a prerequisite. Describe the concrete novelty and explain why it is interesting, without implying clinical availability or changing the countdown.

The `science-news` route currently collects Nature News (`d41586` article URLs) through Nature's RSS feed in the same 48-hour window. It is labeled **Science news report / 科学ニュース報道**, remains Evidence E, and carries `countdownImpact: none`. It may report a laboratory opening or an early discovery without a clinical study population or a DOI. The exceptions to the primary-research and subject requirements apply only to this source-validated route; all other article types keep those requirements.

The source feed summary is the supplied material, not an assumed full-text paper. A summary shorter than 160 characters is held. Missing experimental details must be identified as unavailable. Company claims must be attributed, and reported unknown functions must remain unknown in both languages. A CRISPR-like repeat pattern must not become a demonstrated gene-editing tool or an available therapy. No full-article reproduction or invented longevity connection is allowed. RSS transport or parsing failure stops publication with an explicit source failure.

This expands prospective discovery only: older examples outside the 48-hour window are not automatically backfilled. Additional company or university feeds require their own source adapter; arbitrary social posts are not accepted as verified sources.

## Held items

Held items stay out of listings, routes, RSS, the sitemap, and JSON-LD. Typical hold reasons include a missing abstract, unidentified study subjects, or a score that cannot be determined. Held-only runs do not open a mergeable publish PR.

Automatic merge is also forbidden when source fetch is `partial` or `failed`, the editorial provider fails, schema validation fails, English/Japanese numbers disagree, CI or build fails, a protected file changed, or the PR has a merge conflict.

`production-deploy-notice.yml` listens only for GitHub `deployment_status`. It is not triggered by `workflow_run` or by polling a Vercel Check. Whether this repository's Vercel integration actually delivers Production failures on that event is **検証未完了**. The news job does not observe the later deploy. The pipeline does not automatically revert.

## Existing catalog

The three articles already in `data/articles.ts` go through the same publish gate (`gateExistingArticles`). A passing article may be listed. An article that fails stays without `sitePublishedAt`, so it is absent from listings, routes, RSS, the sitemap, and Article JSON-LD together. The gate uses the ranked source record. It does not copy the article's field, evidence, or study subjects onto the candidate, and it does not invent scores to force a pass.

## Credentials

GitHub Actions secrets and variables:

- `NCBI_API_KEY`, `NCBI_EMAIL` — PubMed. `NCBI_TOOL` defaults to `immortality-countdown`.
- `OPENAI_API_KEY` — editorial provider. Missing key is a provider failure and blocks publication.
- `EDITORIAL_MODEL` — repository variable. Optional model override.
- `NEWS_PUBLISH_TOKEN` — fine-grained PAT for the article PR. The default `GITHUB_TOKEN` is not used for that PR, because PRs it opens do not trigger required workflows.

`NEWS_PUBLISH_TOKEN` must be a fine-grained personal access token with all of the following:

- Repository access: `immortality-countdown` only
- Contents: Read and write
- Pull requests: Read and write
- Metadata: Read (mandatory on fine-grained tokens)
- No Administration permission
- No Actions write permission
- Not listed as a ruleset or branch-protection bypass
- An expiration date

Checkout uses `persist-credentials: false`, so the token is not left in the local git config after the fetch. The push step sets a git extraheader only for that push and removes it before the step exits. The workflow does not print the token. `echo "::add-mask::"` registers it for log redaction.

`EDITORIAL_PROVIDER` stays unset in the workflow so the provider is OpenAI. Tests set `mock` locally.

## GitHub settings for auto-merge

Auto-merge is enabled only when `automation/publish/required-checks.ts` can read branch rules and all of the following are true:

- `main` requires the status check `verify` (the CI job id).
- Required approving reviews are 0. A required review would wait for a person, which this news path does not do.
- Repository settings allow auto-merge and squash merge.
- `NEWS_PUBLISH_TOKEN` is not on the bypass list for those rules.

If the rules cannot be read, or `verify` is not required, the workflow leaves the PR open and does not enable auto-merge.

## When publication stops

| Condition | Auto-merge | Workflow |
| --- | --- | --- |
| Source fetch `partial` or `failed` | No | Fails |
| Provider error, including a missing API key | No | Fails |
| Editorial or ingest schema invalid | No | Fails |
| Only held items, or nothing passed | No | Succeeds without a PR |
| English/Japanese mismatch, Evidence upgrade, or other gate failure on one record | That record is not in the PR | Other passing records may continue |
| CI or build failure on the PR | No | The publish job may already have enabled auto-merge; GitHub will not merge |
| Protected or disallowed path, including `docs/editorial-policy.md` | No | Fails |
| Open `news/auto-*` or `news-auto` PR with failed checks | No | Fails. No second PR |
| Open automatic news PR with pending or passing checks | No | Succeeds and waits. No second PR |
| Automatic news PR older than 24 hours | No | Closes it when safe, marks `expired`, and does not merge it |
| Merge conflict | No | Fails |
| `deployment_status` Production failure | Already merged, if the event arrives | Job Summary only. Receipt from Vercel is 検証未完了. No revert |

## LEV model (semi-annual, separate)

About twice a year, a separate workflow lists accumulated published articles as evidence candidates. A human may open a distinct PR with a proposed model change and must review any Monte Carlo rerun. That workflow must not auto-merge and must not be driven by the daily news workflow.

- Automation must not write `lev/params.json` or `lev/forecast.json`.
- “What Moved the Number” is written only after a human actually changes the model.
- `moved` remains reserved for a later human record of an actual model change. Automatic news may not set it.

## Cadence at a glance

| Track | Cadence | May change LEV years? | Auto-merge? |
| --- | --- | --- | --- |
| News ingest, ranking, bilingual articles, publish PR | Scheduled plus manual dispatch | No | Yes, only after required checks |
| LEV parameter / forecast review | About twice a year, plus extraordinary review | Yes, only when a human edits the model | No |
