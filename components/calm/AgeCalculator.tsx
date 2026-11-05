"use client";

import { useState } from "react";
import type { SiteLocale } from "@/lib/locale";

type Result = { kind: "age"; ageAtEarly: number } | { kind: "prompt" };

/**
 * Age calculator island: a fill-in-the-sentence form (owner design,
 * 2026-11-05). The single result line uses the EARLY scenario only:
 * the age the visitor will be at the earliest arrival, counted with
 * the years-to-early offset passed in from the server — the same
 * convention as lib/countdown (`heroEarlyYears`, earlyYear − baseYear).
 * No year counts are hard-coded here.
 */
export default function AgeCalculator({
  locale,
  yearsToEarly,
}: {
  locale: SiteLocale;
  yearsToEarly: number;
}) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const ja = locale === "ja";

  const calculate = () => {
    const age = Number.parseInt(input, 10);
    if (!Number.isFinite(age) || age < 0 || age > 120) {
      setResult({ kind: "prompt" });
      return;
    }
    setResult({ kind: "age", ageAtEarly: age + yearsToEarly });
  };

  return (
    <div className="mx-auto mt-[22px] max-w-[560px] rounded-[14px] border-[3px] border-[#7d97bd] bg-white p-6 shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
      <div className="flex flex-wrap items-center justify-center gap-[10px] text-[1.05rem] font-bold">
        {ja ? "私の現在の年齢は" : "My current age is"}
        <input
          type="number"
          min={0}
          max={120}
          inputMode="numeric"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") calculate();
          }}
          aria-label={ja ? "現在の年齢" : "Your current age"}
          className="w-[90px] rounded-[10px] border-2 border-[#7d97bd] px-2 py-[9px] text-center text-[1.1rem] font-extrabold text-[#233252] focus:border-[#57b8ff] focus:outline-none"
        />
        {ja ? "歳" : "years old"}
        <button
          type="button"
          onClick={calculate}
          className="rounded-full bg-[#00a8a8] px-[22px] py-[10px] text-[1rem] font-extrabold text-white transition-colors hover:bg-[#57b8ff]"
        >
          {ja ? "計算する" : "Calculate"}
        </button>
      </div>
      {result !== null ? (
        <p className="mt-4 text-center text-[1.12rem] font-bold leading-[1.7]" aria-live="polite">
          {result.kind === "prompt" ? (
            ja ? (
              "年齢を入れてみてください。"
            ) : (
              "Enter your age to see."
            )
          ) : ja ? (
            <>
              早ければ、貴方が
              <b className="text-[1.45rem] text-[#e8502f]">{result.ageAtEarly}</b>
              歳になった時に不老不死となる可能性があります。
            </>
          ) : (
            <>
              At the earliest, you could reach immortality when you turn{" "}
              <b className="text-[1.45rem] text-[#e8502f]">{result.ageAtEarly}</b>.
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}
