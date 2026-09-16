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
