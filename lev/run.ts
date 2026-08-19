/**
 * Regenerates the published forecast snapshot.
 *
 *   npx tsx lev/run.ts            print a human-readable report
 *   npx tsx lev/run.ts --write    also write lev/forecast.json
 *
 * Wire this into CI so forecast.json can never drift from params.json:
 * run it, then `git diff --exit-code lev/forecast.json`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  forecast,
  sensitivity,
  baseScenario,
  derivedRates,
  backcastSpan,
  gainAt,
  gateAt,
  readinessAt,
  impactOf,
  type Params,
} from "./model";

const here = dirname(fileURLToPath(import.meta.url));
const params = JSON.parse(readFileSync(join(here, "params.json"), "utf8")) as Params;

const f = forecast(params);
const base = baseScenario(params);

const yr = (v: number | null) => (v === null ? "not within horizon" : `${v.toFixed(1)} yr`);
const cal = (v: number | null) => (v === null ? "—" : String(v));
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

console.log(`\n=== Immortality Countdown — ${f.modelId} (params v${f.paramsVersion}) ===`);
console.log(`base year ${f.baseYear} · ${f.draws.toLocaleString()} draws · seed ${f.seed}\n`);

console.log(`Today's rate of gain : ${f.currentGain.toFixed(3)} healthy yr / calendar yr`);
console.log(`LEV threshold        : ${params.definition.levThreshold.toFixed(2)}`);
console.log(`P(reached by ${f.baseYear + params.simulation.horizonYears}) : ${pct(f.probabilityReached)}\n`);

console.log("Years to LEV");
for (const k of ["p10", "p25", "p50", "p75", "p90"] as const) {
  console.log(
    `  ${k.padEnd(4)} ${yr(f.years[k]).padStart(18)}   →  ${cal(f.calendarYears[k])}`,
  );
}

console.log("\nP(LEV reached by year)");
for (const year of [2035, 2040, 2050, 2060, 2075, 2100, 2150]) {
  const c = f.cumulative.find((x) => x.year === year);
  if (c) console.log(`  ${c.year}  ${pct(c.probability).padStart(7)}`);
}

console.log("\nRate of gain over time (fan chart input)");
console.log("  year     p10    p25    p50    p75    p90");
for (const t of f.trajectory.filter((x) => (x.year - f.baseYear) % 10 === 0)) {
  console.log(
    `  ${t.year}  ${t.p10.toFixed(3)}  ${t.p25.toFixed(3)}  ${t.p50.toFixed(3)}  ${t.p75.toFixed(3)}  ${t.p90.toFixed(3)}`,
  );
}

const rates = derivedRates(params);
console.log(
  `\nField readiness (rates derived from the ${params.calibration.backcastYear}→${params.simulation.baseYear} backcast, damped ×${params.calibration.damping})`,
);
console.log("  field                                  2006  now   +20y  +40y     r     C_i   contrib now");
for (const fd of params.fields) {
  const r = rates[fd.id];
  const now = readinessAt(fd.score, fd.ceiling, r, 0);
  const t20 = readinessAt(fd.score, fd.ceiling, r, 20);
  const t40 = readinessAt(fd.score, fd.ceiling, r, 40);
  const contrib = fd.maxContribution * impactOf(now, params.impact.midpoint, params.impact.steepness);
  console.log(
    `  ${fd.id.padEnd(38)} ${String(fd.historicalScore).padStart(4)} ${now.toFixed(0).padStart(4)}  ${t20
      .toFixed(0)
      .padStart(4)}  ${t40.toFixed(0).padStart(4)}  ${r.toFixed(4)}  ${fd.maxContribution.toFixed(2)}   ${contrib.toFixed(4)}`,
  );
}
console.log(
  `  ${"regulatory-readiness".padEnd(38)} ${String(params.regulatory.historicalScore).padStart(4)} ${String(
    params.regulatory.score,
  ).padStart(4)}                ${rates["regulatory-readiness"].toFixed(4)}   (gate, not additive)`,
);
console.log(`  backcast span: ${backcastSpan(params)} years`);
console.log(`  regulatory gate now: ${gateAt(base, 0).toFixed(4)}   +20y: ${gateAt(base, 20).toFixed(3)}   +40y: ${gateAt(base, 40).toFixed(3)}`);
console.log(`  base scenario gain now: ${gainAt(base, 0).toFixed(4)}`);

console.log("\nSensitivity — which assumption is load-bearing? (±20%)");
console.log("  parameter                                 up      down    swing");
for (const s of sensitivity(params)) {
  const fmt = (v: number | null) => (v === null ? "  never" : v.toFixed(1).padStart(6));
  console.log(
    `  ${s.parameter.padEnd(40)} ${fmt(s.whenIncreased)}  ${fmt(s.whenDecreased)}  ${
      s.swing === null ? "   n/a" : s.swing.toFixed(1).padStart(6)
    }`,
  );
}

if (process.argv.includes("--write")) {
  const out = { generatedFrom: `params.json v${params.version}`, ...f };
  writeFileSync(join(here, "forecast.json"), JSON.stringify(out, null, 2) + "\n");
  console.log("\nwrote lev/forecast.json");
}
console.log();
