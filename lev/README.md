# The countdown, as an actual model

This replaces the 28-year figure with a number that is computed, reproducible and
attackable. Drop the `lev/` folder into the repo root (or `src/lib/lev/`).

```
lev/
  params.json        every assumption, each with a written rationale  ← the only file you edit
  model.ts           the model. zero dependencies, pure functions
  model.test.ts      29 tests, including editorial guardrails
  run.ts             CLI report + regenerates forecast.json
  build-preview.ts   builds the standalone preview page
  forecast.json      the published output. committed, diffable
  preview.html       generated preview
```

```bash
npx tsx lev/run.ts             # print the report
npx tsx lev/run.ts --write     # regenerate forecast.json
npx tsx --test lev/model.test.ts
npx tsx lev/build-preview.ts   # rebuild preview.html
```

## What it says

| | |
|---|---|
| Rate of gain today | **0.22** healthy years per calendar year (LEV needs 1.00) |
| Median LEV year | **2092** |
| 80% interval | **2061 – 2172** |
| P(reached at all, within 175 yr) | **94%** |

Today's 0.22 is the calibration anchor, not an output: it has to land in the
0.15–0.30 band the demographic record actually shows, and a test fails the build
if it doesn't. A separate test asserts that geroscience contributes almost
nothing today — because no such drug is approved, and a model that claimed
otherwise would be contradicting the world.

## The three ideas worth defending

**1. A regulatory gate multiplies everything.** Aging is not an approvable
indication, there is no accepted surrogate endpoint, and no reimbursement route
for prevention in healthy adults. A working therapy behind a closed door
contributes zero healthy years. So the model is
`gain = base + gate(t) × Σ contribution`, and `gate` is currently **0.087**.

This produces the finding: regulatory readiness has the **slowest derived growth
rate in the model** (0.030 vs 0.107 for AI). Which individual field advances
fastest moves the answer by under 2 years. Whether a regulatory pathway opens
moves it by 21. That is a headline, and nobody else in this space is publishing it.

It also implies a product change: **Regulatory & Deployment Readiness should be a
ninth tracked axis on the dashboard**, not a paragraph in the methodology.

**2. Growth rates are derived from a backcast, not chosen.** Every field is scored
twice — today and in 2006 — and the logistic rate connecting the two is derived,
then damped ×0.85 because translation is slower than discovery. The forward
projection becomes an explicit, falsifiable claim: *the next twenty years resemble
the last twenty, slowed*. The 2006 column is the most attackable set of numbers in
the model, which is exactly the reason to publish it.

**3. Readiness → impact is steeply non-linear.** A field at 40/100 delivers under
25% of its potential, because preclinical progress does not extend human
healthspan no matter how good the mouse data is. `midpoint = 65` encodes "half the
potential arrives once there is convincing randomised human outcome data."

Accelerator fields (AI, automation, biomarkers) carry deliberately small direct
contributions. They compress discovery while trials, biology and regulation stay
rate-limiting. Giving AI a large direct contribution is the single most common way
these forecasts break, and it is the reason optimistic timelines cluster in the
2030s. A test enforces this.

## Wiring it into Next.js

`forecast.json` is a static build artifact, so no runtime computation:

```tsx
// app/page.tsx  — server component
import forecast from "@/lev/forecast.json";

export default function Home() {
  return <Countdown data={forecast} />;
}
```

Only regenerate when `params.json` changes. Add this to CI so the published number
can never drift from the assumptions behind it:

```yaml
- run: npx tsx --test lev/model.test.ts
- run: npx tsx lev/run.ts --write
- run: git diff --exit-code lev/forecast.json   # fails if someone edited params without regenerating
```

The chart maths in `build-preview.ts` is plain SVG arithmetic with no library —
lift `fx`, `fy`, `line()` and `band()` straight into a React component.

## The editorial guardrail

`model.test.ts` fails the build if any field is missing a rationale of at least
120 characters or an ISO `lastReviewed` date. On a site whose entire pitch is
transparency, that is a product feature, not a lint rule: **a score cannot change
without someone writing down why.** The git history of `params.json` is your
public changelog, for free.

## Things you should argue about (and let readers argue about)

These are the numbers that actually move the answer. Put them on a page and invite
attack — pre-empting the critique is the strongest credibility move available.

- **`regulatory.score = 15`.** Move it to 20 and the median comes in by roughly a
  decade. This is the single most consequential judgement in the model.
- **`calibration.damping = 0.85`.** Set it to 1.0 for the naive "the past repeats"
  scenario. ±20% swings the answer 24 years.
- **`contributionScale`.** Is total biological headroom really ~1.8 yr/yr at full
  maturity? Largest single source of uncertainty, 25-year swing.
- **The 2006 scores.** Every one is a defensible guess and none is a measurement.

## Note on the number

A model calibrated this way does not reproduce 28 years, and it should not be bent
until it does. The gap is the interesting part: the original figure implicitly
assumed the regulatory pathway opens roughly as fast as the science moves, and
twenty years of history says it does not.

The move is to publish the change, not hide it — *"we built the model we promised,
and it pushed our own headline number out by decades"* is a far better story than
a number nobody can check, and it is the kind of thing that gets linked.
