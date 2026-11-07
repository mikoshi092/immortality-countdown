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
// Google News decode probe in the CI environment. The verdict is the
// test result itself — probe output channels (workflow commands, job
// summary) proved unreliable from inside a test subprocess, while CI
// pass/fail is always readable. Green = the two-step decode resolved
// a live article URL from the Actions egress (DECODE_OK in the probe
// output, which is forwarded to the log either way). Removed as soon
// as the verdict has been read.
describe("gn-smoke (temporary)", () => {
  it("decodes a Google News URL from this environment (Step-0 gate)", async () => {
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
      captured = `${e.stdout ?? ""}${e.stderr ?? ""}\ngn-smoke probe error: ${e.message ?? String(error)}\n`;
    }
    process.stdout.write(captured);
    const summaryPath = process.env.GITHUB_STEP_SUMMARY;
    if (summaryPath) {
      await appendFile(summaryPath, `## GN SMOKE (temporary Step-0 probe)\n\n\`\`\`\n${captured}\n\`\`\`\n`);
    }
    assert.ok(
      captured.includes("VERDICT DECODE_OK"),
      `Step-0 gate: Google News decode did not succeed in this environment.\n${captured}`,
    );
  });
});
