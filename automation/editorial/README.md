# Editorial drafts (Phase 3.1)

Verified ingest candidates become bilingual article drafts. Drafts that pass the publish gate are written to `data/articles.ts` by `npm run news:publish` and shipped by the news auto-publish workflow. Human pre-approval is not required. LEV countdown files are never written here.

```
npm run ingest:dry
npm run editorial:dry
npm run news:publish
```

`editorial:dry` only writes `automation/output/editorial-drafts.json`. It does not edit `data/articles.ts`.

Input: `automation/output/candidates.json`
Output: `automation/output/editorial-drafts.json`

## Providers

- Default: OpenAI Chat Completions (`POST https://api.openai.com/v1/chat/completions`)
- `OPENAI_API_KEY` is required for the OpenAI provider. If it is missing, generation stops with an error. It is not treated as zero drafts.
- `EDITORIAL_MODEL` overrides the model name (default `gpt-4o-mini`)
- `EDITORIAL_PROVIDER=mock` is for tests only

The model writes English and Japanese copy from the same locked identifiers and numbers. Display fact copy is language-specific. It is not allowed to invent sourceUrl, DOI, Evidence, FieldId, or study subjects. If a fact cannot be checked, the draft is `held` and is not published.

See `docs/editorial-policy.md`.
