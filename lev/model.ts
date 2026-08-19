/**
 * Immortality Countdown — LEV model v0
 * ------------------------------------
 * Zero dependencies. Pure functions. Runs identically on the server,
 * in the browser, or in a test runner.
 *
 * THE CLAIM
 *   Longevity escape velocity is reached in the first year where
 *   remaining healthy life expectancy grows by >= 1.0 year per calendar year.
 *
 *   G(t) = gBase + gate(t) * SUM_i C_i * impact(S_i(t))
 *
 *   gBase        business-as-usual medicine. Contains no geroscience.
 *   S_i(t)       field readiness 0-100, logistic growth toward a ceiling
 *   impact(S)    readiness -> realised fraction of potential. Non-linear:
 *                preclinical progress contributes ~nothing to human healthspan.
 *   C_i          the healthy years/year a field could deliver at full readiness
 *   gate(t)      regulatory & deployment readiness, itself gated on biomarker
 *                validation. This is what stops the clock running on technical
 *                progress alone.
 *
 * Every parameter lives in params.json, with a written rationale, under git.
 */

export interface FieldParams {
  id: string;
  label: string;
  /** Readiness today, 0-100. */
  score: number;
  /** Readiness at calibration.backcastYear, 0-100. Derives the growth rate. */
  historicalScore: number;
  ceiling: number;
  maxContribution: number;
  stallProbability: number;
  rationale: string;
  lastReviewed: string;
}

export interface Params {
  version: string;
  modelId: string;
  publishedAt: string;
  definition: { levThreshold: number; [k: string]: unknown };
  baseline: { gBase: number; gBaseSigma: number; [k: string]: unknown };
  impact: { midpoint: number; steepness: number; midpointSigma: number; [k: string]: unknown };
  calibration: { backcastYear: number; damping: number; dampingSigma: number; [k: string]: unknown };
  regulatory: {
    score: number;
    historicalScore: number;
    biomarkerCoupling: number;
    [k: string]: unknown;
  };
  fields: FieldParams[];
  uncertainty: {
    growthRateLogSigma: number;
    contributionScaleLogSigma: number;
    regulatoryRateLogSigma: number;
    stallFloorMultiplier: number;
    [k: string]: unknown;
  };
  simulation: {
    baseYear: number;
    horizonYears: number;
    draws: number;
    seed: number;
    [k: string]: unknown;
  };
}

/* ------------------------------------------------------------------ *
 * Core curves
 * ------------------------------------------------------------------ */

/** Logistic growth of a readiness score from s0 toward `ceiling`. */
export function readinessAt(s0: number, ceiling: number, rate: number, t: number): number {
  const start = Math.min(Math.max(s0, 1e-6), ceiling - 1e-6);
  const k = (ceiling - start) / start;
  return ceiling / (1 + k * Math.exp(-rate * t));
}

/**
 * Readiness score -> fraction of a field's potential that is actually realised.
 * Steep sigmoid centred on `midpoint` (default 65 = convincing human outcome data).
 */
export function impactOf(score: number, midpoint: number, steepness: number): number {
  return 1 / (1 + Math.exp(-steepness * (score - midpoint)));
}

/**
 * The logistic rate implied by two observations of the same field.
 * This is what makes the forward projection falsifiable: it is a claim about
 * the last `years` years, not a free parameter.
 *
 *   S(t) = ceiling / (1 + k e^-rt),  k = (ceiling - S0) / S0
 *   =>  r = ln( k0 / k1 ) / years
 */
export function deriveGrowthRate(past: number, present: number, ceiling: number, years: number): number {
  const clamp = (s: number) => Math.min(Math.max(s, 1e-6), ceiling - 1e-6);
  const k0 = (ceiling - clamp(past)) / clamp(past);
  const k1 = (ceiling - clamp(present)) / clamp(present);
  if (years <= 0 || k1 <= 0 || k0 <= 0) return 0;
  return Math.max(0, Math.log(k0 / k1) / years);
}

/* ------------------------------------------------------------------ *
 * Deterministic scenario
 * ------------------------------------------------------------------ */

export interface ScenarioInput {
  gBase: number;
  midpoint: number;
  steepness: number;
  contributionScale: number;
  regulatory: { score: number; growthRate: number; biomarkerCoupling: number };
  fields: Array<{
    id: string;
    score: number;
    ceiling: number;
    maxContribution: number;
    growthRate: number;
  }>;
}

export interface YearState {
  t: number;
  gain: number;
  gate: number;
  fieldScores: Record<string, number>;
}

/** Regulatory gate at time t, damped by how well biomarkers are validated. */
export function gateAt(input: ScenarioInput, t: number): number {
  const r = input.regulatory;
  const base = readinessAt(r.score, 100, r.growthRate, t) / 100;
  const bio = input.fields.find((f) => f.id === "biomarkers-diagnostics");
  if (!bio) return base;
  const bioScore = readinessAt(bio.score, bio.ceiling, bio.growthRate, t);
  const bioImpact = impactOf(bioScore, input.midpoint, input.steepness);
  const c = r.biomarkerCoupling;
  return base * (1 - c + c * bioImpact);
}

/** Healthy years gained per calendar year, t years after the base year. */
export function gainAt(input: ScenarioInput, t: number): number {
  let tech = 0;
  for (const f of input.fields) {
    const s = readinessAt(f.score, f.ceiling, f.growthRate, t);
    tech += f.maxContribution * input.contributionScale * impactOf(s, input.midpoint, input.steepness);
  }
  return input.gBase + gateAt(input, t) * tech;
}

export function stateAt(input: ScenarioInput, t: number): YearState {
  const fieldScores: Record<string, number> = {};
  for (const f of input.fields) {
    fieldScores[f.id] = readinessAt(f.score, f.ceiling, f.growthRate, t);
  }
  return { t, gain: gainAt(input, t), gate: gateAt(input, t), fieldScores };
}

/**
 * First year offset where gain >= threshold, refined by bisection to
 * sub-year precision. Returns null if not reached within the horizon.
 */
export function yearsToLev(input: ScenarioInput, threshold: number, horizon: number): number | null {
  if (gainAt(input, 0) >= threshold) return 0;
  let lo = 0;
  let hi = -1;
  for (let t = 1; t <= horizon; t++) {
    if (gainAt(input, t) >= threshold) {
      hi = t;
      lo = t - 1;
      break;
    }
  }
  if (hi < 0) return null;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (gainAt(input, mid) >= threshold) hi = mid;
    else lo = mid;
  }
  return hi;
}

/* ------------------------------------------------------------------ *
 * Seeded randomness — reproducibility is the whole point
 * ------------------------------------------------------------------ */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const logNormal = (rng: () => number, median: number, logSigma: number): number =>
  median * Math.exp(normal(rng) * logSigma);

export function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return NaN;
  const idx = (sortedAsc.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedAsc[lo];
  return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (idx - lo);
}

/* ------------------------------------------------------------------ *
 * Params -> scenario
 * ------------------------------------------------------------------ */

/** Backcast window in years, e.g. 2026 - 2006 = 20. */
export const backcastSpan = (p: Params): number =>
  Math.max(1, p.simulation.baseYear - p.calibration.backcastYear);

/** Growth rate each field is projected forward with, before uncertainty. */
export function derivedRates(p: Params): Record<string, number> {
  const span = backcastSpan(p);
  const d = p.calibration.damping;
  const out: Record<string, number> = {
    [p.regulatory.id as string]: deriveGrowthRate(p.regulatory.historicalScore, p.regulatory.score, 100, span) * d,
  };
  for (const f of p.fields) {
    out[f.id] = deriveGrowthRate(f.historicalScore, f.score, f.ceiling, span) * d;
  }
  return out;
}

export function baseScenario(p: Params): ScenarioInput {
  const span = backcastSpan(p);
  const d = p.calibration.damping;
  return {
    gBase: p.baseline.gBase,
    midpoint: p.impact.midpoint,
    steepness: p.impact.steepness,
    contributionScale: 1,
    regulatory: {
      score: p.regulatory.score,
      growthRate: deriveGrowthRate(p.regulatory.historicalScore, p.regulatory.score, 100, span) * d,
      biomarkerCoupling: p.regulatory.biomarkerCoupling,
    },
    fields: p.fields.map((f) => ({
      id: f.id,
      score: f.score,
      ceiling: f.ceiling,
      maxContribution: f.maxContribution,
      growthRate: deriveGrowthRate(f.historicalScore, f.score, f.ceiling, span) * d,
    })),
  };
}

function drawScenario(p: Params, rng: () => number): ScenarioInput {
  const u = p.uncertainty;
  const span = backcastSpan(p);
  // One damping draw per scenario: "will translation be as fast as discovery?"
  // is a single question, not eight independent ones.
  const damping = Math.max(0.1, p.calibration.damping + normal(rng) * p.calibration.dampingSigma);
  return {
    gBase: Math.max(0, p.baseline.gBase + normal(rng) * p.baseline.gBaseSigma),
    midpoint: p.impact.midpoint + normal(rng) * p.impact.midpointSigma,
    steepness: p.impact.steepness,
    contributionScale: logNormal(rng, 1, u.contributionScaleLogSigma),
    regulatory: {
      score: p.regulatory.score,
      growthRate: logNormal(
        rng,
        deriveGrowthRate(p.regulatory.historicalScore, p.regulatory.score, 100, span) * damping,
        u.regulatoryRateLogSigma,
      ),
      biomarkerCoupling: p.regulatory.biomarkerCoupling,
    },
    fields: p.fields.map((f) => {
      const stalled = rng() < f.stallProbability;
      const derived = deriveGrowthRate(f.historicalScore, f.score, f.ceiling, span) * damping;
      const rate = logNormal(rng, derived, u.growthRateLogSigma);
      return {
        id: f.id,
        score: f.score,
        ceiling: f.ceiling,
        maxContribution: f.maxContribution,
        growthRate: stalled ? rate * u.stallFloorMultiplier : rate,
      };
    }),
  };
}

/* ------------------------------------------------------------------ *
 * Monte Carlo
 * ------------------------------------------------------------------ */

export interface LevForecast {
  modelId: string;
  paramsVersion: string;
  baseYear: number;
  draws: number;
  seed: number;
  /** Today's headline number: healthy years gained per calendar year. */
  currentGain: number;
  /** Share of draws reaching LEV inside the horizon. */
  probabilityReached: number;
  /** Years from baseYear. null where that percentile never reaches LEV. */
  years: { p10: number | null; p25: number | null; p50: number | null; p75: number | null; p90: number | null };
  /** Calendar years. null where that percentile never reaches LEV. */
  calendarYears: { p10: number | null; p25: number | null; p50: number | null; p75: number | null; p90: number | null };
  /** Fan chart data: gain per calendar year, one row per year. */
  trajectory: Array<{
    year: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  }>;
  /** P(LEV reached before year Y) for a few salient horizons. */
  cumulative: Array<{ year: number; probability: number }>;
}

export function forecast(p: Params): LevForecast {
  const { baseYear, horizonYears, draws, seed } = p.simulation;
  const threshold = p.definition.levThreshold;
  const rng = mulberry32(seed);

  // Annual resolution for the fan chart, out to 100 years or the horizon.
  const trajectorySpan = Math.min(horizonYears, 100);
  const sampleYears = Array.from({ length: trajectorySpan + 1 }, (_, t) => t);
  const gainSamples: number[][] = sampleYears.map(() => []);
  const reached: number[] = [];
  let reachedCount = 0;

  for (let d = 0; d < draws; d++) {
    const scenario = drawScenario(p, rng);
    sampleYears.forEach((t, i) => gainSamples[i].push(gainAt(scenario, t)));
    const y = yearsToLev(scenario, threshold, horizonYears);
    if (y !== null) {
      reached.push(y);
      reachedCount++;
    }
  }

  reached.sort((a, b) => a - b);
  const reachedFraction = reachedCount / draws;

  // A percentile of the FULL distribution (including never-reaching draws).
  // If fewer than p of all draws ever reach LEV, that percentile is null —
  // "the optimistic 10% get there by X, the pessimistic 10% never do".
  const yearAt = (q: number): number | null => {
    if (q > reachedFraction) return null;
    return percentile(reached, q / reachedFraction);
  };

  const years = { p10: yearAt(0.1), p25: yearAt(0.25), p50: yearAt(0.5), p75: yearAt(0.75), p90: yearAt(0.9) };
  const toCalendar = (v: number | null) => (v === null ? null : Math.round(baseYear + v));

  const trajectory = sampleYears.map((t, i) => {
    const s = [...gainSamples[i]].sort((a, b) => a - b);
    return {
      year: baseYear + t,
      p10: percentile(s, 0.1),
      p25: percentile(s, 0.25),
      p50: percentile(s, 0.5),
      p75: percentile(s, 0.75),
      p90: percentile(s, 0.9),
    };
  });

  // Annual P(LEV reached by year). `reached` is sorted, so walk it once.
  const cumulative: Array<{ year: number; probability: number }> = [];
  let cursor = 0;
  for (let t = 0; t <= horizonYears; t++) {
    while (cursor < reached.length && reached[cursor] <= t) cursor++;
    cumulative.push({ year: baseYear + t, probability: cursor / draws });
  }

  return {
    modelId: p.modelId,
    paramsVersion: p.version,
    baseYear,
    draws,
    seed,
    currentGain: gainAt(baseScenario(p), 0),
    probabilityReached: reachedFraction,
    years,
    calendarYears: {
      p10: toCalendar(years.p10),
      p25: toCalendar(years.p25),
      p50: toCalendar(years.p50),
      p75: toCalendar(years.p75),
      p90: toCalendar(years.p90),
    },
    trajectory,
    cumulative,
  };
}

/* ------------------------------------------------------------------ *
 * Sensitivity — "which assumption is actually driving the number?"
 * Publish this. It is the most credibility-generating page on the site.
 * ------------------------------------------------------------------ */

export interface SensitivityRow {
  parameter: string;
  /** Years-to-LEV when the parameter is nudged up (or midpoint lowered). */
  whenIncreased: number | null;
  /** Years-to-LEV when the parameter is nudged down (or midpoint raised). */
  whenDecreased: number | null;
  /** How many years the answer moves. Bigger = this assumption is load-bearing. */
  swing: number | null;
}

export function sensitivity(p: Params, deltaPct = 0.2): SensitivityRow[] {
  const median = (mutate: (s: ScenarioInput) => void): number | null => {
    const s = baseScenario(p);
    mutate(s);
    return yearsToLev(s, p.definition.levThreshold, p.simulation.horizonYears);
  };

  const rows: SensitivityRow[] = [];
  const push = (parameter: string, up: () => number | null, down: () => number | null) => {
    const whenIncreased = up();
    const whenDecreased = down();
    rows.push({
      parameter,
      whenIncreased,
      whenDecreased,
      swing:
        whenIncreased === null || whenDecreased === null
          ? null
          : Math.abs(whenIncreased - whenDecreased),
    });
  };

  push(
    "calibration.damping (all rates)",
    () =>
      median((s) => {
        s.regulatory.growthRate *= 1 + deltaPct;
        s.fields.forEach((x) => (x.growthRate *= 1 + deltaPct));
      }),
    () =>
      median((s) => {
        s.regulatory.growthRate *= 1 - deltaPct;
        s.fields.forEach((x) => (x.growthRate *= 1 - deltaPct));
      }),
  );
  push(
    "regulatory.growthRate",
    () => median((s) => (s.regulatory.growthRate *= 1 + deltaPct)),
    () => median((s) => (s.regulatory.growthRate *= 1 - deltaPct)),
  );
  push(
    "baseline.gBase",
    () => median((s) => (s.gBase *= 1 + deltaPct)),
    () => median((s) => (s.gBase *= 1 - deltaPct)),
  );
  push(
    "impact.midpoint",
    () => median((s) => (s.midpoint -= 5)),
    () => median((s) => (s.midpoint += 5)),
  );
  push(
    "contributionScale (all fields)",
    () => median((s) => (s.contributionScale *= 1 + deltaPct)),
    () => median((s) => (s.contributionScale *= 1 - deltaPct)),
  );
  for (const f of p.fields) {
    push(
      `${f.id}.growthRate`,
      () => median((s) => s.fields.forEach((x) => x.id === f.id && (x.growthRate *= 1 + deltaPct))),
      () => median((s) => s.fields.forEach((x) => x.id === f.id && (x.growthRate *= 1 - deltaPct))),
    );
  }

  return rows.sort((a, b) => (b.swing ?? Infinity) - (a.swing ?? Infinity));
}
