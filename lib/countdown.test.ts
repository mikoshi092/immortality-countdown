/**
 *   npx tsx --test lib/countdown.test.ts
 *
 * Guards the homepage hero figure: years from the model base year to the
 * early (P10) calendar year, never a hardcoded 35 / 2061, and never a
 * silent swap of the median `countdown.years`.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { countdown, heroEarlyYears } from "./countdown";

describe("heroEarlyYears", () => {
  it("is earlyYear minus baseYear", () => {
    assert.equal(heroEarlyYears, countdown.earlyYear - countdown.baseYear);
  });

  it("is a positive finite number, not remaining years-from-now as a separate clock", () => {
    assert.equal(typeof heroEarlyYears, "number");
    assert.ok(Number.isFinite(heroEarlyYears));
    assert.ok(heroEarlyYears > 0);
  });

  it("is not the median countdown.years", () => {
    assert.notEqual(heroEarlyYears, countdown.years);
  });
});

// TEMPORARY Step-0 smoke hook (keyword-collection merge gate): runs the
// Google News decode probe in the CI environment and forwards its
// output — including the ::notice/::error workflow commands that carry
// the verdict — to the job log. Never fails the suite. Removed as soon
// as the verdict has been read.
describe("gn-smoke (temporary)", () => {
  it("runs the Google News decode probe", async () => {
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const { appendFile } = await import("node:fs/promises");
    const run = promisify(execFile);
    let captured = "";
    try {
      const { stdout, stderr } = await run("node", ["gn-smoke/decode.mjs"], {
        timeout: 120_000,
        maxBuffer: 4 * 1024 * 1024,
      });
      captured = stdout + (stderr ?? "");
    } catch (error) {
      const e = error as { stdout?: string; stderr?: string; message?: string };
      captured = `${e.stdout ?? ""}${e.stderr ?? ""}\ngn-smoke probe error (non-fatal): ${e.message ?? String(error)}\n`;
    }
    process.stdout.write(captured);
    // The verdict also goes to the job summary file: workflow commands
    // printed from a test subprocess are not reliably parsed, but the
    // summary is a plain file write and renders on the run page.
    const summaryPath = process.env.GITHUB_STEP_SUMMARY;
    if (summaryPath) {
      await appendFile(summaryPath, `## GN SMOKE (temporary Step-0 probe)\n\n\`\`\`\n${captured}\n\`\`\`\n`);
    }
  });
});
