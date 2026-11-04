"use client";

import { useState } from "react";
import type { SiteLocale } from "@/lib/locale";

type Result = { kind: "ages"; early: number; median: number } | { kind: "prompt" };

/**
 * Age calculator island (approved calm mock). Year offsets are passed in
 * from the server and counted from the model's base year — the same
 * convention as lib/countdown (`heroEarlyYears`): early scenario first,
 * standard pace second.
 */
export default function AgeCalculator({
  locale,
  earlyYear,
  medianYear,
  yearsToEarly,
  yearsToMedian,
}: {
  locale: SiteLocale;
  earlyYear: number;
  medianYear: number;
  yearsToEarly: number;
  yearsToMedian: number;
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
    setResult({ kind: "ages", early: age + yearsToEarly, median: age + yearsToMedian });
  };

  return (
    <div className="mx-auto mt-[22px] max-w-[560px] rounded-[14px] bg-white p-6 shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
      <label className="flex flex-wrap items-center justify-center gap-[10px] text-[1.05rem] font-bold">
        {ja ? "今の年齢" : "Your age now"}
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
          aria-label={ja ? "今の年齢" : "Your age now"}
          className="w-[90px] rounded-[10px] border-2 border-[#c9d4e8] px-2 py-[9px] text-center text-[1.1rem] font-extrabold text-[#233252] focus:border-[#57b8ff] focus:outline-none"
        />
        {ja ? "歳" : ""}
        <button
          type="button"
          onClick={calculate}
          className="rounded-full bg-[#00a8a8] px-[22px] py-[10px] text-[1rem] font-extrabold text-white transition-colors hover:bg-[#57b8ff]"
        >
          {ja ? "計算する" : "Calculate"}
        </button>
      </label>
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
              早ければ（{earlyYear}年）<b className="text-[1.45rem] text-[#e8502f]">{result.early}</b>
              歳。標準のペース（{medianYear}年）では{" "}
              <b className="text-[1.45rem] text-[#e8502f]">{result.median}</b>歳 です。
            </>
          ) : (
            <>
              At the earliest ({earlyYear}) you would be{" "}
              <b className="text-[1.45rem] text-[#e8502f]">{result.early}</b>. At the standard pace
              ({medianYear}), <b className="text-[1.45rem] text-[#e8502f]">{result.median}</b>.
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}
