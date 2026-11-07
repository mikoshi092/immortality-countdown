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
    const run = promisify(execFile);
    try {
      const { stdout, stderr } = await run("node", ["gn-smoke/decode.mjs"], {
        timeout: 120_000,
        maxBuffer: 4 * 1024 * 1024,
      });
      process.stdout.write(stdout);
      if (stderr) process.stdout.write(stderr);
    } catch (error) {
      const e = error as { stdout?: string; stderr?: string; message?: string };
      if (e.stdout) process.stdout.write(e.stdout);
      if (e.stderr) process.stdout.write(e.stderr);
      process.stdout.write(`gn-smoke probe error (non-fatal): ${e.message ?? String(error)}\n`);
    }
  });
});
