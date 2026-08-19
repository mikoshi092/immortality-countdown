/**
 *   npx tsx --test lev/model.test.ts
 *
 * These are not just unit tests. The "params hygiene" block is an editorial
 * guardrail: it fails the build if anyone changes a score without leaving a
 * rationale or a review date. On a site whose entire pitch is transparency,
 * that check is a product feature, not a lint rule.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  forecast,
  baseScenario,
  derivedRates,
  backcastSpan,
  deriveGrowthRate,
  readinessAt,
  impactOf,
  gainAt,
  gateAt,
  yearsToLev,
  percentile,
  mulberry32,
  type Params,
} from "./model";

const here = dirname(fileURLToPath(import.meta.url));
const params = JSON.parse(readFileSync(join(here, "params.json"), "utf8")) as Params;

describe("curves", () => {
  it("readinessAt starts at the current score and rises toward the ceiling", () => {
    assert.ok(Math.abs(readinessAt(40, 100, 0.06, 0) - 40) < 1e-9);
    assert.ok(readinessAt(40, 100, 0.06, 50) > readinessAt(40, 100, 0.06, 20));
    assert.ok(readinessAt(40, 100, 0.06, 500) < 100);
    assert.ok(readinessAt(40, 100, 0.06, 500) > 99.9);
  });

  it("readinessAt is flat when the growth rate is zero", () => {
    assert.ok(Math.abs(readinessAt(33, 100, 0, 100) - 33) < 1e-9);
  });

  it("impactOf is bounded, monotonic, and half at the midpoint", () => {
    assert.ok(Math.abs(impactOf(65, 65, 0.08) - 0.5) < 1e-12);
    assert.ok(impactOf(0, 65, 0.08) > 0 && impactOf(100, 65, 0.08) < 1);
    for (let s = 0; s < 100; s += 5) {
      assert.ok(impactOf(s + 5, 65, 0.08) > impactOf(s, 65, 0.08));
    }
  });

  it("impactOf punishes preclinical scores hard (the non-linearity is the point)", () => {
    // A field at 40/100 must deliver well under a quarter of its potential,
    // otherwise mouse data would be counted as human healthspan.
    assert.ok(impactOf(40, 65, 0.08) < 0.25);
    assert.ok(impactOf(85, 65, 0.08) > 0.75);
  });
});

describe("backcast calibration", () => {
  const span = backcastSpan(params);

  it("derived rate reproduces today's score from the 2006 score", () => {
    for (const f of params.fields) {
      const r = deriveGrowthRate(f.historicalScore, f.score, f.ceiling, span);
      const reconstructed = readinessAt(f.historicalScore, f.ceiling, r, span);
      assert.ok(
        Math.abs(reconstructed - f.score) < 1e-6,
        `${f.id}: backcast rate ${r} regenerates ${reconstructed}, expected ${f.score}`,
      );
    }
  });

  it("damping strictly slows every field", () => {
    const rates = derivedRates(params);
    for (const f of params.fields) {
      const undamped = deriveGrowthRate(f.historicalScore, f.score, f.ceiling, span);
      assert.ok(rates[f.id] < undamped, `${f.id} should be damped`);
      assert.ok(Math.abs(rates[f.id] - undamped * params.calibration.damping) < 1e-12);
    }
  });

  it("a field that has not moved in 20 years gets a rate of zero", () => {
    assert.equal(deriveGrowthRate(40, 40, 100, 20), 0);
  });

  it("a field that went backwards is floored at zero, never negative", () => {
    assert.equal(deriveGrowthRate(50, 40, 100, 20), 0);
  });
});

describe("headline calibration", () => {
  const base = baseScenario(params);

  it("today's rate of gain matches the observed demographic record (0.15-0.30)", () => {
    const g = gainAt(base, 0);
    assert.ok(g > 0.15 && g < 0.3, `current gain ${g} is outside the observed band`);
  });

  it("geroscience contributes almost nothing today, as it should", () => {
    // If the model said geroscience was already delivering healthy years,
    // it would be contradicting the fact that no such drug is approved.
    const techToday = gainAt(base, 0) - base.gBase;
    assert.ok(techToday < 0.05, `tech contribution today is ${techToday}, implausibly high`);
  });

  it("the regulatory gate is nearly shut today", () => {
    assert.ok(gateAt(base, 0) < 0.15);
  });

  it("the gate stays inside [0,1] across the whole horizon", () => {
    for (let t = 0; t <= params.simulation.horizonYears; t += 5) {
      const g = gateAt(base, t);
      assert.ok(g >= 0 && g <= 1, `gate ${g} out of range at t=${t}`);
    }
  });

  it("gain increases monotonically", () => {
    let prev = -Infinity;
    for (let t = 0; t <= 150; t += 1) {
      const g = gainAt(base, t);
      assert.ok(g >= prev, `gain fell between t=${t - 1} and t=${t}`);
      prev = g;
    }
  });
});

describe("yearsToLev", () => {
  const base = baseScenario(params);

  it("finds a crossing and the crossing is tight", () => {
    const t = yearsToLev(base, 1.0, 300);
    assert.ok(t !== null);
    assert.ok(gainAt(base, t!) >= 1.0 - 1e-6);
    assert.ok(gainAt(base, t! - 0.01) < 1.0);
  });

  it("returns null when the threshold is unreachable", () => {
    assert.equal(yearsToLev(base, 99, 300), null);
  });

  it("returns 0 when already past the threshold", () => {
    assert.equal(yearsToLev(base, 0.05, 300), 0);
  });
});

describe("simulation", () => {
  it("is deterministic for a fixed seed", () => {
    const a = forecast(params);
    const b = forecast(params);
    assert.deepEqual(a.years, b.years);
    assert.deepEqual(a.trajectory, b.trajectory);
  });

  it("different seeds move the median by less than 3 years (enough draws)", () => {
    const alt = { ...params, simulation: { ...params.simulation, seed: 12345, draws: 20000 } };
    const a = forecast(params);
    const b = forecast(alt);
    assert.ok(a.years.p50 !== null && b.years.p50 !== null);
    assert.ok(
      Math.abs(a.years.p50! - b.years.p50!) < 3,
      `median moved ${Math.abs(a.years.p50! - b.years.p50!)} yr between seeds — raise draws`,
    );
  });

  it("percentiles are ordered", () => {
    const f = forecast(params);
    const seq = [f.years.p10, f.years.p25, f.years.p50, f.years.p75, f.years.p90].filter(
      (v): v is number => v !== null,
    );
    for (let i = 1; i < seq.length; i++) assert.ok(seq[i] >= seq[i - 1]);
  });

  it("the fan is ordered at every year on the trajectory", () => {
    for (const t of forecast(params).trajectory) {
      assert.ok(t.p10 <= t.p25 && t.p25 <= t.p50 && t.p50 <= t.p75 && t.p75 <= t.p90, `year ${t.year}`);
    }
  });

  it("cumulative probability is non-decreasing and never exceeds P(reached)", () => {
    const f = forecast(params);
    let prev = -1;
    for (const c of f.cumulative) {
      assert.ok(c.probability >= prev, `cumulative fell at ${c.year}`);
      assert.ok(c.probability <= f.probabilityReached + 1e-9);
      prev = c.probability;
    }
  });

  it("reports an honest non-zero chance that LEV is never reached", () => {
    const f = forecast(params);
    assert.ok(f.probabilityReached < 0.99, "a model with no failure mode is not a model");
    assert.ok(f.probabilityReached > 0.5);
  });

  it("percentile helper interpolates", () => {
    assert.equal(percentile([0, 10], 0.5), 5);
    assert.equal(percentile([0, 1, 2, 3, 4], 0), 0);
    assert.equal(percentile([0, 1, 2, 3, 4], 1), 4);
  });

  it("mulberry32 is uniform-ish and reproducible", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    let sum = 0;
    for (let i = 0; i < 10000; i++) {
      const x = a();
      assert.equal(x, b());
      assert.ok(x >= 0 && x < 1);
      sum += x;
    }
    assert.ok(Math.abs(sum / 10000 - 0.5) < 0.02);
  });
});

describe("params hygiene — editorial guardrail", () => {
  it("has exactly the eight published fields", () => {
    assert.equal(params.fields.length, 8);
    assert.equal(new Set(params.fields.map((f) => f.id)).size, 8);
  });

  it("every field is scored, justified and dated", () => {
    for (const f of params.fields) {
      assert.ok(f.score >= 0 && f.score <= 100, `${f.id} score out of range`);
      assert.ok(f.historicalScore >= 0 && f.historicalScore <= 100, `${f.id} historical out of range`);
      assert.ok(f.maxContribution > 0, `${f.id} needs a contribution`);
      assert.ok(f.stallProbability >= 0 && f.stallProbability < 1, `${f.id} stall probability`);
      assert.ok(
        f.rationale && f.rationale.length >= 120,
        `${f.id}: a score change needs a real rationale, not a sentence fragment`,
      );
      assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(f.lastReviewed), `${f.id}: lastReviewed must be ISO date`);
    }
  });

  it("no field claims a score it has not earned relative to 2006", () => {
    // Guards against quietly ratcheting today's score up without also
    // revisiting the backcast, which would silently inflate growth rates.
    for (const f of params.fields) {
      assert.ok(f.score >= f.historicalScore, `${f.id}: today's score is below 2006 — intended?`);
    }
  });

  it("total headroom clears the LEV threshold, but not comfortably", () => {
    const total = params.fields.reduce((s, f) => s + f.maxContribution, 0);
    const needed = params.definition.levThreshold - params.baseline.gBase;
    assert.ok(total > needed, "LEV would be unreachable even with every field perfect");
    assert.ok(total < needed * 4, "headroom so large the gate stops mattering");
  });

  it("accelerator fields are not modelled as direct sources of healthy years", () => {
    const byId = Object.fromEntries(params.fields.map((f) => [f.id, f]));
    const maxBio = Math.max(
      byId["rejuvenation-regeneration"].maxContribution,
      byId["gene-therapy-delivery"].maxContribution,
    );
    for (const id of ["ai-drug-discovery", "enabling-technology-automation", "biomarkers-diagnostics"]) {
      assert.ok(
        byId[id].maxContribution < maxBio / 2,
        `${id} is an accelerator; giving it a large direct contribution is the classic forecasting error`,
      );
    }
  });
});
