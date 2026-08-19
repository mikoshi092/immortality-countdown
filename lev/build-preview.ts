/**
 * Builds a self-contained preview page from forecast.json + params.json.
 *   npx tsx lev/build-preview.ts
 *
 * Nothing here is Next-specific: the SVG maths is plain and can be lifted
 * straight into a React component when you wire it into the site.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { LevForecast } from "./model";
import { sensitivity, derivedRates, type Params } from "./model";

const here = dirname(fileURLToPath(import.meta.url));
const params = JSON.parse(readFileSync(join(here, "params.json"), "utf8")) as Params;
const f = JSON.parse(readFileSync(join(here, "forecast.json"), "utf8")) as LevForecast;

/* ---------------- geometry ---------------- */

const W = 760;
const H = 340;
const PAD = { t: 18, r: 20, b: 42, l: 52 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

const traj = f.trajectory;
const yearMin = traj[0].year;
const yearMax = traj[traj.length - 1].year;
const gMax = 2.5;

const fx = (year: number) => PAD.l + ((year - yearMin) / (yearMax - yearMin)) * plotW;
const fy = (g: number) => PAD.t + plotH - (Math.min(g, gMax) / gMax) * plotH;

const line = (key: "p10" | "p25" | "p50" | "p75" | "p90") =>
  traj.map((d, i) => `${i === 0 ? "M" : "L"}${fx(d.year).toFixed(1)},${fy(d[key]).toFixed(1)}`).join("");

const band = (lo: "p10" | "p25", hi: "p90" | "p75") => {
  const up = traj.map((d, i) => `${i === 0 ? "M" : "L"}${fx(d.year).toFixed(1)},${fy(d[hi]).toFixed(1)}`).join("");
  const down = [...traj]
    .reverse()
    .map((d) => `L${fx(d.year).toFixed(1)},${fy(d[lo]).toFixed(1)}`)
    .join("");
  return `${up}${down}Z`;
};

/* cumulative-probability chart */
const cum = f.cumulative.filter((c) => c.year <= 2160);
const cW = 760;
const cH = 260;
const cPad = { t: 16, r: 20, b: 42, l: 52 };
const cPlotW = cW - cPad.l - cPad.r;
const cPlotH = cH - cPad.t - cPad.b;
const cx = (year: number) => cPad.l + ((year - cum[0].year) / (cum[cum.length - 1].year - cum[0].year)) * cPlotW;
const cy = (p: number) => cPad.t + cPlotH - p * cPlotH;
const cumLine = cum.map((d, i) => `${i === 0 ? "M" : "L"}${cx(d.year).toFixed(1)},${cy(d.probability).toFixed(1)}`).join("");
const cumArea = `${cumLine}L${cx(cum[cum.length - 1].year).toFixed(1)},${cy(0)}L${cx(cum[0].year).toFixed(1)},${cy(0)}Z`;

/* ---------------- copy ---------------- */

const rates = derivedRates(params);
const sens = sensitivity(params).slice(0, 5);
const pct = (v: number) => `${Math.round(v * 100)}%`;
const yearTicks = [2026, 2046, 2066, 2086, 2106, 2126];
const cumTicks = [2026, 2056, 2086, 2116, 2146];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Immortality Countdown — model preview (${f.modelId}, params v${f.paramsVersion})</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  .viz-root {
    color-scheme: light;
    --surface-1: #fcfcfb;
    --plane: #f9f9f7;
    --text-primary: #0b0b0b;
    --text-secondary: #52514e;
    --text-muted: #898781;
    --grid: #e1e0d9;
    --axis: #c3c2b7;
    --border: rgba(11,11,11,0.10);
    --band-outer: #86b6ef;
    --band-inner: #5598e7;
    --median: #256abf;
    --track: #e1e0d9;
    --critical: #d03b3b;
  }
  @media (prefers-color-scheme: dark) {
    :root:where(:not([data-theme="light"])) .viz-root {
      color-scheme: dark;
      --surface-1: #1a1a19;
      --plane: #0d0d0d;
      --text-primary: #ffffff;
      --text-secondary: #c3c2b7;
      --text-muted: #898781;
      --grid: #2c2c2a;
      --axis: #383835;
      --border: rgba(255,255,255,0.10);
      --band-outer: #184f95;
      --band-inner: #256abf;
      --median: #6da7ec;
      --track: #383835;
      --critical: #d03b3b;
    }
  }
  :root[data-theme="dark"] .viz-root {
    color-scheme: dark;
    --surface-1: #1a1a19; --plane: #0d0d0d; --text-primary: #fff; --text-secondary: #c3c2b7;
    --text-muted: #898781; --grid: #2c2c2a; --axis: #383835; --border: rgba(255,255,255,0.10);
    --band-outer: #184f95; --band-inner: #256abf; --median: #6da7ec; --track: #383835;
  }
  body { margin: 0; background: var(--plane); }
  .viz-root {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    background: var(--plane); color: var(--text-primary);
    padding: 32px 20px 64px; max-width: 880px; margin: 0 auto;
  }
  h1 { font-size: 19px; font-weight: 650; margin: 0 0 4px; letter-spacing: -0.01em; }
  .sub { color: var(--text-secondary); font-size: 13.5px; margin: 0 0 24px; line-height: 1.55; }
  .card {
    background: var(--surface-1); border: 1px solid var(--border);
    border-radius: 12px; padding: 20px; margin-bottom: 16px;
  }
  .card h2 { font-size: 13px; font-weight: 620; margin: 0 0 2px; letter-spacing: 0.01em; }
  .card p.note { font-size: 12.5px; color: var(--text-secondary); margin: 0 0 16px; line-height: 1.5; }
  .hero { display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-end; }
  .hero-fig { font-size: 60px; font-weight: 660; line-height: 1; letter-spacing: -0.03em; }
  .hero-label { font-size: 12.5px; color: var(--text-secondary); margin-top: 8px; line-height: 1.5; }
  .tiles { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
  .tile { flex: 1 1 150px; border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; }
  .tile .v { font-size: 22px; font-weight: 640; letter-spacing: -0.015em; }
  .tile .k { font-size: 11.5px; color: var(--text-muted); margin-top: 3px; line-height: 1.4; }
  .meter-track { height: 10px; border-radius: 5px; background: var(--track); position: relative; overflow: hidden; margin-top: 14px; }
  .meter-fill { position: absolute; inset: 0 auto 0 0; border-radius: 5px; background: var(--median); }
  .meter-row { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--text-muted); margin-top: 6px; font-variant-numeric: tabular-nums; }
  svg { display: block; width: 100%; height: auto; touch-action: none; }
  .grid-line { stroke: var(--grid); stroke-width: 1; }
  .axis-line { stroke: var(--axis); stroke-width: 1; }
  .tick { fill: var(--text-muted); font-size: 10.5px; font-variant-numeric: tabular-nums; }
  .axis-title { fill: var(--text-muted); font-size: 10.5px; }
  .median-line { fill: none; stroke: var(--median); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
  .thr { stroke: var(--text-secondary); stroke-width: 1.5; stroke-dasharray: 5 4; }
  .thr-label { fill: var(--text-secondary); font-size: 11px; font-weight: 560; }
  .legend { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 14px; font-size: 12px; color: var(--text-secondary); }
  .legend span.sw { display: inline-block; width: 14px; height: 9px; border-radius: 2px; margin-right: 6px; vertical-align: -1px; }
  .legend span.ln { display: inline-block; width: 14px; height: 2px; margin-right: 6px; vertical-align: 4px; background: var(--median); }
  .crosshair { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 3 3; }
  .tip {
    position: absolute; pointer-events: none; background: var(--surface-1);
    border: 1px solid var(--border); border-radius: 8px; padding: 9px 11px;
    font-size: 12px; line-height: 1.6; box-shadow: 0 4px 14px rgba(0,0,0,.13);
    white-space: nowrap; opacity: 0; transition: opacity .09s; font-variant-numeric: tabular-nums;
  }
  .tip b { font-weight: 620; }
  .tip .row { color: var(--text-secondary); }
  .wrap { position: relative; }
  table { border-collapse: collapse; width: 100%; font-size: 12.5px; font-variant-numeric: tabular-nums; }
  th, td { text-align: right; padding: 6px 8px; border-bottom: 1px solid var(--grid); }
  th:first-child, td:first-child { text-align: left; }
  th { color: var(--text-muted); font-weight: 560; font-size: 11.5px; }
  details > summary { cursor: pointer; font-size: 12.5px; color: var(--text-secondary); margin-top: 14px; }
  .foot { font-size: 11.5px; color: var(--text-muted); line-height: 1.65; margin-top: 8px; }
  code { font-size: 11.5px; background: var(--plane); padding: 1px 5px; border-radius: 4px; border: 1px solid var(--border); }
</style>
</head>
<body>
<div class="viz-root">

  <h1>Immortality Countdown — model output preview</h1>
  <p class="sub">
    Generated from <code>params.json</code> v${f.paramsVersion} by <code>lev/model.ts</code>.
    ${f.draws.toLocaleString()} Monte Carlo draws, fixed seed <code>${f.seed}</code> — this page is reproducible from the repo.
  </p>

  <div class="card">
    <div class="hero">
      <div>
        <div class="hero-fig">${f.calendarYears.p50 ?? "—"}</div>
        <div class="hero-label">
          Median year that longevity escape velocity is reached<br>
          80% interval <b>${f.calendarYears.p10} – ${f.calendarYears.p90}</b>
        </div>
      </div>
      <div style="flex:1 1 260px; min-width: 240px;">
        <div style="font-size:12.5px; color:var(--text-secondary);">
          Healthy years gained per calendar year, today
        </div>
        <div class="meter-track"><div class="meter-fill" style="width:${(f.currentGain * 100).toFixed(1)}%"></div></div>
        <div class="meter-row"><span><b style="color:var(--text-primary)">${f.currentGain.toFixed(2)}</b> today</span><span>1.00 = escape velocity</span></div>
      </div>
    </div>
    <div class="tiles">
      <div class="tile"><div class="v">${pct(f.probabilityReached)}</div><div class="k">chance LEV is reached at all, within 175 years</div></div>
      <div class="tile"><div class="v">${pct(f.cumulative.find((c) => c.year === 2050)!.probability)}</div><div class="k">chance by 2050</div></div>
      <div class="tile"><div class="v">${pct(f.cumulative.find((c) => c.year === 2075)!.probability)}</div><div class="k">chance by 2075</div></div>
      <div class="tile"><div class="v">${pct(f.cumulative.find((c) => c.year === 2100)!.probability)}</div><div class="k">chance by 2100</div></div>
    </div>
  </div>

  <div class="card">
    <h2>Rate of gain in remaining healthy life expectancy</h2>
    <p class="note">
      Escape velocity is the moment this curve crosses 1.0 — one year of healthy life gained per year lived.
      Shaded bands show model uncertainty across ${f.draws.toLocaleString()} draws.
    </p>
    <div class="wrap" id="wrap-fan">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Fan chart of healthy years gained per calendar year, ${yearMin} to ${yearMax}, with the escape velocity threshold at 1.0">
        ${[0, 0.5, 1.0, 1.5, 2.0, 2.5]
          .map(
            (g) =>
              `<line class="grid-line" x1="${PAD.l}" y1="${fy(g).toFixed(1)}" x2="${W - PAD.r}" y2="${fy(g).toFixed(1)}"/>
         <text class="tick" x="${PAD.l - 9}" y="${(fy(g) + 3.5).toFixed(1)}" text-anchor="end">${g.toFixed(1)}</text>`,
          )
          .join("")}
        <path d="${band("p10", "p90")}" fill="var(--band-outer)" opacity="0.42"/>
        <path d="${band("p25", "p75")}" fill="var(--band-inner)" opacity="0.5"/>
        <path class="median-line" d="${line("p50")}"/>
        <line class="thr" x1="${PAD.l}" y1="${fy(1).toFixed(1)}" x2="${W - PAD.r}" y2="${fy(1).toFixed(1)}"/>
        <text class="thr-label" x="${PAD.l + 8}" y="${(fy(1) - 9).toFixed(1)}" text-anchor="start">escape velocity · 1.0</text>
        <line class="axis-line" x1="${PAD.l}" y1="${PAD.t + plotH}" x2="${W - PAD.r}" y2="${PAD.t + plotH}"/>
        ${yearTicks
          .map((y) => `<text class="tick" x="${fx(y).toFixed(1)}" y="${PAD.t + plotH + 18}" text-anchor="middle">${y}</text>`)
          .join("")}
        <text class="axis-title" x="${PAD.l}" y="${H - 6}">healthy years gained per calendar year</text>
        <line class="crosshair" id="ch-fan" x1="0" y1="${PAD.t}" x2="0" y2="${PAD.t + plotH}" opacity="0"/>
        <circle id="dot-fan" r="4.5" fill="var(--median)" stroke="var(--surface-1)" stroke-width="2" opacity="0"/>
        <rect id="hit-fan" x="${PAD.l}" y="${PAD.t}" width="${plotW}" height="${plotH}" fill="transparent"/>
      </svg>
      <div class="tip" id="tip-fan"></div>
    </div>
    <div class="legend">
      <span><span class="ln"></span>median</span>
      <span><span class="sw" style="background:var(--band-inner);opacity:.5"></span>50% interval</span>
      <span><span class="sw" style="background:var(--band-outer);opacity:.42"></span>80% interval</span>
    </div>
  </div>

  <div class="card">
    <h2>Probability that escape velocity has been reached, by year</h2>
    <p class="note">
      The honest version of a countdown. A single date implies a precision the evidence does not support; this does not.
    </p>
    <div class="wrap" id="wrap-cum">
      <svg viewBox="0 0 ${cW} ${cH}" role="img" aria-label="Cumulative probability that longevity escape velocity has been reached, by calendar year">
        ${[0, 0.25, 0.5, 0.75, 1]
          .map(
            (p) =>
              `<line class="grid-line" x1="${cPad.l}" y1="${cy(p).toFixed(1)}" x2="${cW - cPad.r}" y2="${cy(p).toFixed(1)}"/>
         <text class="tick" x="${cPad.l - 9}" y="${(cy(p) + 3.5).toFixed(1)}" text-anchor="end">${Math.round(p * 100)}%</text>`,
          )
          .join("")}
        <path d="${cumArea}" fill="var(--band-outer)" opacity="0.34"/>
        <path class="median-line" d="${cumLine}"/>
        <line class="axis-line" x1="${cPad.l}" y1="${cPad.t + cPlotH}" x2="${cW - cPad.r}" y2="${cPad.t + cPlotH}"/>
        ${cumTicks
          .map((y) => `<text class="tick" x="${cx(y).toFixed(1)}" y="${cPad.t + cPlotH + 18}" text-anchor="middle">${y}</text>`)
          .join("")}
        <text class="axis-title" x="${cPad.l}" y="${cH - 6}">cumulative probability</text>
        <line class="crosshair" id="ch-cum" x1="0" y1="${cPad.t}" x2="0" y2="${cPad.t + cPlotH}" opacity="0"/>
        <circle id="dot-cum" r="4.5" fill="var(--median)" stroke="var(--surface-1)" stroke-width="2" opacity="0"/>
        <rect id="hit-cum" x="${cPad.l}" y="${cPad.t}" width="${cPlotW}" height="${cPlotH}" fill="transparent"/>
      </svg>
      <div class="tip" id="tip-cum"></div>
    </div>
    <details>
      <summary>Table view</summary>
      <table>
        <thead><tr><th>Year</th><th>P(reached)</th><th>median gain</th><th>80% interval</th></tr></thead>
        <tbody>
        ${[2035, 2045, 2055, 2065, 2075, 2085, 2095, 2105, 2125]
          .map((y) => {
            const c = f.cumulative.find((x) => x.year === y);
            const t = traj.find((x) => x.year === y);
            return `<tr><td>${y}</td><td>${c ? pct(c.probability) : "—"}</td><td>${
              t ? t.p50.toFixed(2) : "—"
            }</td><td>${t ? `${t.p10.toFixed(2)} – ${t.p90.toFixed(2)}` : "—"}</td></tr>`;
          })
          .join("")}
        </tbody>
      </table>
    </details>
  </div>

  <div class="card">
    <h2>What is actually driving the answer</h2>
    <p class="note">
      Each assumption moved ±20%, measuring how many years the answer shifts. Publish this page.
      It pre-empts the first thing a sceptical reader will ask.
    </p>
    <table>
      <thead><tr><th>Assumption</th><th>+20%</th><th>−20%</th><th>swing</th></tr></thead>
      <tbody>
      ${sens
        .map(
          (s) =>
            `<tr><td>${s.parameter}</td><td>${s.whenIncreased === null ? "never" : s.whenIncreased.toFixed(0) + " yr"}</td><td>${
              s.whenDecreased === null ? "never" : s.whenDecreased.toFixed(0) + " yr"
            }</td><td><b>${s.swing === null ? "—" : s.swing.toFixed(0) + " yr"}</b></td></tr>`,
        )
        .join("")}
      </tbody>
    </table>
    <p class="foot">
      Which individual field advances fastest barely moves the answer. Whether a regulatory pathway opens
      moves it by decades — which is why <b>Regulatory &amp; Deployment Readiness</b> belongs on the dashboard
      as a ninth tracked axis, not buried in the methodology.
    </p>
  </div>

  <div class="card">
    <h2>Growth rates are derived, not chosen</h2>
    <p class="note">
      Each field is scored twice — today and in ${params.calibration.backcastYear} — and the logistic rate connecting them is
      derived, then damped ×${params.calibration.damping} because translation is slower than discovery.
      The ${params.calibration.backcastYear} column is the most attackable number in the model, which is exactly why it is published.
    </p>
    <table>
      <thead><tr><th>Field</th><th>${params.calibration.backcastYear}</th><th>2026</th><th>derived r</th><th>max contribution</th></tr></thead>
      <tbody>
      ${params.fields
        .map(
          (fd) =>
            `<tr><td>${fd.label}</td><td>${fd.historicalScore}</td><td>${fd.score}</td><td>${rates[fd.id].toFixed(
              4,
            )}</td><td>${fd.maxContribution.toFixed(2)}</td></tr>`,
        )
        .join("")}
      <tr><td><b>${params.regulatory.label}</b></td><td>${params.regulatory.historicalScore}</td><td>${
        params.regulatory.score
      }</td><td>${rates[params.regulatory.id as string].toFixed(4)}</td><td>gate, not additive</td></tr>
      </tbody>
    </table>
    <p class="foot">
      Regulatory readiness has the slowest derived growth rate of anything in the model. That is the finding.
    </p>
  </div>

  <p class="foot">
    Model <code>${f.modelId}</code> · params v${f.paramsVersion} · seed ${f.seed} · ${f.draws.toLocaleString()} draws ·
    base year ${f.baseYear}. Not medical advice, not a prediction about any individual.
  </p>
</div>

<script>
const FAN = ${JSON.stringify(traj.map((d) => [d.year, +d.p10.toFixed(3), +d.p50.toFixed(3), +d.p90.toFixed(3)]))};
const CUM = ${JSON.stringify(cum.map((d) => [d.year, +d.probability.toFixed(4)]))};
const GEO = ${JSON.stringify({ PAD, plotW, plotH, W, H, gMax, yearMin, yearMax, cPad, cPlotW, cPlotH, cW, cH })};

function attach(wrapId, hitId, chId, dotId, tipId, data, xOf, yOf, render) {
  const wrap = document.getElementById(wrapId);
  const svg = wrap.querySelector("svg");
  const hit = document.getElementById(hitId);
  const ch = document.getElementById(chId);
  const dot = document.getElementById(dotId);
  const tip = document.getElementById(tipId);
  const vb = svg.viewBox.baseVal;

  function move(ev) {
    const r = svg.getBoundingClientRect();
    const sx = ((ev.clientX - r.left) / r.width) * vb.width;
    let best = 0, bd = Infinity;
    for (let i = 0; i < data.length; i++) {
      const d = Math.abs(xOf(data[i]) - sx);
      if (d < bd) { bd = d; best = i; }
    }
    const row = data[best];
    const px = xOf(row), py = yOf(row);
    ch.setAttribute("x1", px); ch.setAttribute("x2", px); ch.setAttribute("opacity", "1");
    dot.setAttribute("cx", px); dot.setAttribute("cy", py); dot.setAttribute("opacity", "1");
    tip.innerHTML = render(row);
    tip.style.opacity = "1";
    const scale = r.width / vb.width;
    const left = Math.min(Math.max(px * scale - tip.offsetWidth / 2, 4), r.width - tip.offsetWidth - 4);
    tip.style.left = left + "px";
    tip.style.top = Math.max(py * scale - tip.offsetHeight - 14, 4) + "px";
  }
  function leave() {
    ch.setAttribute("opacity", "0"); dot.setAttribute("opacity", "0"); tip.style.opacity = "0";
  }
  hit.addEventListener("pointermove", move);
  hit.addEventListener("pointerdown", move);
  wrap.addEventListener("pointerleave", leave);
}

attach("wrap-fan", "hit-fan", "ch-fan", "dot-fan", "tip-fan", FAN,
  (d) => GEO.PAD.l + ((d[0] - GEO.yearMin) / (GEO.yearMax - GEO.yearMin)) * GEO.plotW,
  (d) => GEO.PAD.t + GEO.plotH - (Math.min(d[2], GEO.gMax) / GEO.gMax) * GEO.plotH,
  (d) => '<b>' + d[0] + '</b><div class="row">median ' + d[2].toFixed(2) + ' yr/yr</div>' +
         '<div class="row">80% interval ' + d[1].toFixed(2) + ' – ' + d[3].toFixed(2) + '</div>');

attach("wrap-cum", "hit-cum", "ch-cum", "dot-cum", "tip-cum", CUM,
  (d) => GEO.cPad.l + ((d[0] - CUM[0][0]) / (CUM[CUM.length - 1][0] - CUM[0][0])) * GEO.cPlotW,
  (d) => GEO.cPad.t + GEO.cPlotH - d[1] * GEO.cPlotH,
  (d) => '<b>' + d[0] + '</b><div class="row">' + Math.round(d[1] * 100) + '% chance reached by now</div>');
</script>
</body>
</html>
`;

writeFileSync(join(here, "preview.html"), html);
console.log(`wrote lev/preview.html (${(html.length / 1024).toFixed(0)} KB)`);
