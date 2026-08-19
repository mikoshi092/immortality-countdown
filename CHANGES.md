# Phase 1.8 — model wiring + technical fix pack

Verified locally: `tsc --noEmit` clean, `eslint` clean, 29/29 model tests pass,
`next build` generates all 29 routes, link checker reports 0 broken links,
`forecast.json` regenerates byte-identical from a fixed seed.

**One thing I could not verify here:** the sandbox blocks
`fonts.googleapis.com`, so `next build` was run with the three `next/font/google`
calls stubbed. The `Source_Serif_4` import follows exactly the shape of the
existing `Geist` import and the family is present in
`next/dist/compiled/@next/font/dist/google/font-data.json`, but the first real
build is the actual proof. Everything else was verified against a real build.

---

## Correction to my earlier review

I reported `/news` as a broken nav link. **That was wrong.** "Latest News" points
at `/#latest-news`, an anchor on the homepage, and it resolves correctly. I had
inferred a route from the live site without reading the code. The link checker
added below is partly so neither of us has to guess again.

---

## Bugs fixed

### 1. `body { font-family: Arial }` was overriding the webfont you pay to download

`globals.css` set `font-family: Arial, Helvetica, sans-serif` on `body`. Only
`Hero` carried an explicit `font-sans`, so **the hero rendered in Geist and every
other page rendered in Arial** — while still downloading Geist on every page
load. Body now inherits `var(--font-sans)`.

### 2. `font-serif` pointed at nothing

The wordmark and the giant countdown numeral — the site's entire visual identity
— use `font-serif`, but `@theme` only defined `--font-sans` and `--font-mono`.
Tailwind's fallback stack meant the number rendered as **Georgia on macOS, Times
New Roman on Windows, Liberation Serif on Android**. Now loads `Source_Serif_4`
and defines `--font-serif`.

### 3. Desktop had no navigation

`MobileHeader` was the header at every breakpoint: `<nav hidden={!open}>` hid the
links until you clicked a hamburger, on a 27-inch monitor included. Renamed to
`SiteHeader`; links are inline from `sm` up, hamburger is `sm:hidden`.

### 4. `/methodology` was missing from the sitemap

The most important page on a transparency-first site was not in `sitemap.ts`.
Also added `lastModified` — Google largely ignores `priority` and
`changeFrequency` but does use `lastmod` to schedule recrawls, so it was the one
field that mattered and the only one missing.

`lastModified` deliberately is **not** `new Date()`. That would claim every page
changed on every deploy, which Google learns to discount. Field pages carry their
`lastReviewed` date from `params.json`; editorial pages carry a constant in
`lib/site.ts` that you bump when copy actually changes.

### 5. Dark-mode block that produced no dark mode

`globals.css` flipped `--background` to `#0a0a0a` under
`prefers-color-scheme: dark`, but every page hardcodes `bg-[#f7f5ef]`. The only
visible effect was black iOS overscroll and dark-rendered scrollbars and form
controls behind a cream page. Replaced with an explicit `color-scheme: light`.

### 6. 1.4 MB hero image for a 384 px slot

`dna-helix-sketch.png` was 937×1678 and 1.4 MB, with no `sizes`, for an element
never wider than ~384 CSS px at 13% opacity. Now 768 px wide, grayscale,
palette-quantised (**1.4 MB → 344 KB**), with a `sizes` attribute so `next/image`
builds a sane srcset. Also deleted the five unused create-next-app SVGs.

---

## The countdown now comes from the model

`lib/countdown.ts` is the single source of truth. `28` used to be hardcoded in
three places (`HeroCountdown.tsx`, the `sr-only` span in `Hero.tsx`, and the
methodology copy), so changing it meant changing three files and hoping.

**This changes the headline number from 28 to 66 (median year 2092).** To revert,
change one line:

```ts
// lib/countdown.ts
export const COUNTDOWN_SOURCE: "model" | "legacy" = "legacy";
```

The hero now also shows the 80% interval (2061–2172) beneath the number, because
a bare point estimate implies a precision the evidence does not support.

### New `/model` page

Fan chart, cumulative probabilities, the derived-rate table, and a **"How this
could be wrong"** section listing the four assumptions that actually move the
answer. Pure server-rendered SVG, no chart library, no client JS.

That last section is not modesty, it's strategy: this audience will attack an
unbacked number, and publishing the attack surface yourself is the single most
credibility-generating page you can ship. It is also the most linkable.

### Methodology copy updated

The page said *"No peer-reviewed formula, calculation model, or third-party audit
backs the 28-year figure today."* The first clause is now false, so the copy says
there **is** a reproducible model while keeping the honest part: no peer review,
no third-party audit, scores are judgements, the taxonomy is yours.

---

## New safety nets

| Check | Catches |
|---|---|
| `npm run test:model` | 29 tests, including an **editorial guardrail** that fails the build if a field score changes without a ≥120-char rationale and an ISO `lastReviewed` date |
| `npm run model:write` + `git diff --exit-code` | someone editing `params.json` without regenerating, so the published number can never disagree with its own methodology page |
| `npm run check:links` | nav items pointing at routes nobody created, and `#anchors` whose target id no longer exists — the exact class of bug I got wrong above |

All three run in `.github/workflows/ci.yml`.

---

## Also added

- **Per-page OG images.** Every page shared one static card, so a field page
  looked identical on X to the homepage. Each page now generates its own, with
  its own number — a field card shows that field's score. Cheapest CTR win
  available on Vercel.
- **`Dataset` JSON-LD.** You publish a versioned, reproducible, CC-BY dataset,
  which makes you eligible for Google Dataset Search — near-zero competition in
  this topic. Plus `Person` publisher markup for E-E-A-T.
- **`lib/site.ts` / `lib/nav.ts`.** The canonical URL was a string literal in
  three files; the nav array was duplicated in header and footer.

---

## What I would do next, in order

1. **Put your name and face on an About page.** `PUBLISHER` in `lib/site.ts` is
   wired up but there is no page behind it. An anonymous site making a scientific
   claim ranks poorly and converts poorly.
2. **Replace or hide the demo news feed.** It is clearly labelled, which is
   right, but it is still ~70% of the homepage by height and Google's
   helpful-content signals do not read your labels.
3. **Add Regulatory & Deployment Readiness as a ninth tracked axis** on the
   dashboard. The model says it is the binding constraint; right now it is
   invisible on the page that people actually look at.
4. **The personalised diagnostic** — age, sex, country → your probability of
   reaching LEV, with a generated OG card per result. The site still has no
   reason for anyone to share it.

---

## Demo build

```bash
bash scripts/build-demo.sh    # → demo.html, the whole site in one file
```

Works on a throwaway copy in `.demo-build/`, so your working tree is never
touched. Demo-only, not part of the Vercel build: it drops Next's JS bundle
(which expects `/_next/*` paths) and ships a small stand-in for page routing,
the mobile menu, the news filter, the hero countdown, and the LEV diagram's
reveal.

`output: "export"` cannot build metadata route handlers, so the copy also drops
`opengraph-image` / `robots.ts` / `sitemap.ts`. That is a constraint of static
export only — the normal build generates all 29 routes including every OG image.
Worth knowing if you ever consider moving off Vercel to a purely static host.

### Two bugs in the first demo build, both mine, both fixed

- **The LEV concept graph and its pulsing point vanished.** `LevConceptVisual`
  adds an `is-drawn` class from an IntersectionObserver; the demo strips React,
  so the class never landed and the CSS left `.lev-plot-reveal` clipped to zero
  width with the dot at `opacity: 0`. The bundle now runs the same observer.
- **The footer landed mid-page with content overflowing behind it.** The demo
  wrapper set `height: 100%` on `<body>`, making it a definite-height flex
  container, so `<main>` shrank to one viewport. `<html>` gets `height`,
  `<body>` gets `min-height` only — which is what the real `layout.tsx` does.

Neither affected the Next build. Verified on all five page types: footer bottom
now equals document height, and no page errors.
