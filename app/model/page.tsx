import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import BetaBanner from "@/components/BetaBanner";
import LevFanChart from "@/components/LevFanChart";
import { countdown, probabilityBy, formatPercent } from "@/lib/countdown";
import { FOCUS_RING } from "@/lib/nav";
import params from "@/lev/params.json";

export const metadata: Metadata = {
  title: "The Model | Immortality Countdown",
  description:
    "How the countdown is computed: eight field readiness scores, a regulatory gate, growth rates derived from a 2006 backcast, and a reproducible Monte Carlo forecast with published parameters.",
  alternates: { canonical: "/model" },
};

/** r = ln(k0/k1) / years — the logistic rate connecting two observations. */
function derivedRate(past: number, present: number, ceiling: number, years: number) {
  const k0 = (ceiling - past) / past;
  const k1 = (ceiling - present) / present;
  return (Math.log(k0 / k1) / years) * params.calibration.damping;
}

const SPAN = params.simulation.baseYear - params.calibration.backcastYear;

const MILESTONES = [2050, 2075, 2100] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 sm:mt-14">
      <h2 className="text-lg font-semibold text-[#17202a] sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-4 text-base leading-7 text-[#17202a]/70">{children}</div>
    </section>
  );
}

export default function ModelPage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <SiteHeader />
      <BetaBanner />

      <article className="px-5 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className={`inline-block text-sm font-medium text-[#17202a]/60 transition-colors hover:text-[#17202a] ${FOCUS_RING}`}
          >
            ← Back to dashboard
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#2f766d] sm:text-sm">
            The Model · v{countdown.paramsVersion}
          </p>

          <h1 className="mt-3 font-serif text-4xl leading-[1.02] tracking-[-0.03em] text-[#17202a] sm:text-5xl">
            Why {countdown.years} years?
          </h1>

          <p className="mt-6 text-lg leading-8 text-[#17202a]/70">
            Because that is what the parameters say — not because anyone picked
            it. Every input lives in a versioned file, the simulation runs from a
            fixed seed, and anyone who clones the repository reproduces this
            number exactly.
          </p>

          {/* Headline numbers */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                v: countdown.currentGain.toFixed(2),
                k: "healthy years gained per calendar year, today",
              },
              {
                v: `${countdown.earlyYear}–${countdown.lateYear}`,
                k: "80% interval for reaching escape velocity",
              },
              {
                v: formatPercent(countdown.probabilityReached),
                k: "of simulations reach it at all",
              },
            ].map((tile) => (
              <div
                key={tile.k}
                className="rounded-xl border border-black/10 bg-white px-4 py-4 shadow-sm"
              >
                <p className="text-2xl font-semibold tabular-nums text-[#17202a]">{tile.v}</p>
                <p className="mt-1 text-sm leading-5 text-[#17202a]/55">{tile.k}</p>
              </div>
            ))}
          </div>

          <Section title="What has to happen">
            <p>
              Escape velocity is not a cure. It is an arithmetic condition:
              remaining healthy life expectancy has to start growing by at least{" "}
              <strong>one year per calendar year</strong>. Below that you lose
              ground as you age. Above it, your expected remaining healthy life
              grows faster than you spend it.
            </p>
            <p>
              Today that figure is roughly{" "}
              <strong>{countdown.currentGain.toFixed(2)}</strong>, driven almost
              entirely by ordinary medicine rather than by anything from the
              longevity field. The chart below is the model&apos;s estimate of
              how that number moves, and how uncertain it is.
            </p>
          </Section>

          <div className="mt-8 rounded-xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <LevFanChart />
          </div>

          <Section title="Probability, not a date">
            <p>
              A single date implies a precision this evidence cannot support. The
              honest output is a distribution.
            </p>
            <dl className="mt-2 grid gap-2 sm:grid-cols-3">
              {MILESTONES.map((year) => {
                const p = probabilityBy(year);
                return (
                  <div
                    key={year}
                    className="rounded-lg border border-black/10 bg-white px-4 py-3 shadow-sm"
                  >
                    <dt className="text-sm text-[#17202a]/55">by {year}</dt>
                    <dd className="mt-0.5 text-xl font-semibold tabular-nums text-[#17202a]">
                      {p === null ? "—" : formatPercent(p)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Section>

          <Section title="The regulatory gate">
            <p>
              Most forecasts in this space model the science and stop. This one
              multiplies everything by a <strong>regulatory and deployment
              readiness</strong> term, currently scored{" "}
              {params.regulatory.score}/100. Aging is not an approvable
              indication, no aging biomarker is an accepted surrogate endpoint,
              and no payer reimburses prevention in healthy adults. A working
              therapy behind a closed door contributes zero healthy years.
            </p>
            <p>
              This turns out to be the finding rather than a footnote. Regulatory
              readiness has the <strong>slowest derived growth rate of anything
              in the model</strong>. Moving any single research field 20% faster
              changes the answer by under two years. Moving the regulatory term
              by the same amount changes it by roughly twenty.
            </p>
          </Section>

          <Section title="Growth rates are derived, not chosen">
            <p>
              Each field is scored twice — today and in{" "}
              {params.calibration.backcastYear} — and the logistic rate
              connecting the two is derived, then damped by ×
              {params.calibration.damping} because clinical translation is slower
              than discovery. That makes the forward projection a falsifiable
              claim rather than a guess: <em>the next {SPAN} years resemble the
              last {SPAN}, slowed</em>.
            </p>
            <p className="text-sm text-[#17202a]/55">
              The {params.calibration.backcastYear} column is the most attackable
              set of numbers here. That is why it is published.
            </p>
          </Section>

          <div className="mt-6 overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
            <table className="w-full min-w-[34rem] border-collapse text-sm tabular-nums">
              <thead>
                <tr className="text-[#17202a]/50">
                  <th className="border-b border-black/10 px-4 py-3 text-left font-medium">
                    Field
                  </th>
                  <th className="border-b border-black/10 px-4 py-3 text-right font-medium">
                    {params.calibration.backcastYear}
                  </th>
                  <th className="border-b border-black/10 px-4 py-3 text-right font-medium">
                    {params.simulation.baseYear}
                  </th>
                  <th className="border-b border-black/10 px-4 py-3 text-right font-medium">
                    derived r
                  </th>
                  <th className="border-b border-black/10 px-4 py-3 text-right font-medium">
                    max contribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {params.fields.map((f) => (
                  <tr key={f.id}>
                    <td className="border-b border-black/5 px-4 py-3 text-left">
                      <Link
                        href={`/fields/${f.id}`}
                        className={`text-[#17202a] underline-offset-4 hover:underline ${FOCUS_RING}`}
                      >
                        {f.label}
                      </Link>
                    </td>
                    <td className="border-b border-black/5 px-4 py-3 text-right text-[#17202a]/60">
                      {f.historicalScore}
                    </td>
                    <td className="border-b border-black/5 px-4 py-3 text-right">{f.score}</td>
                    <td className="border-b border-black/5 px-4 py-3 text-right text-[#17202a]/60">
                      {derivedRate(f.historicalScore, f.score, f.ceiling, SPAN).toFixed(4)}
                    </td>
                    <td className="border-b border-black/5 px-4 py-3 text-right text-[#17202a]/60">
                      {f.maxContribution.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-black/[0.02]">
                  <td className="px-4 py-3 text-left font-semibold">{params.regulatory.label}</td>
                  <td className="px-4 py-3 text-right text-[#17202a]/60">
                    {params.regulatory.historicalScore}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{params.regulatory.score}</td>
                  <td className="px-4 py-3 text-right text-[#17202a]/60">
                    {derivedRate(
                      params.regulatory.historicalScore,
                      params.regulatory.score,
                      100,
                      SPAN
                    ).toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-right text-[#17202a]/50">gate, not additive</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Section title="How this could be wrong">
            <p>
              These are the assumptions that actually move the answer. If you
              want to argue with the countdown, argue with these rather than with
              the headline.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Regulatory score of {params.regulatory.score}/100.</strong>{" "}
                Move it to 20 and the central estimate comes in by roughly a
                decade. It is the single most consequential judgement here.
              </li>
              <li>
                <strong>Damping of ×{params.calibration.damping}.</strong>{" "}
                Set it to 1.0 and you get the naive &ldquo;the past repeats&rdquo;
                scenario. ±20% swings the answer by about 24 years.
              </li>
              <li>
                <strong>Total headroom.</strong> The model assumes a mature
                version of all eight fields could deliver about{" "}
                {params.fields.reduce((s, f) => s + f.maxContribution, 0).toFixed(1)}{" "}
                healthy years per year. That is a guess, and it is the largest
                single source of uncertainty.
              </li>
              <li>
                <strong>The {params.calibration.backcastYear} scores.</strong>{" "}
                Every one is a defensible judgement and not one is a measurement.
              </li>
            </ul>
          </Section>

          <p className="mt-10 border-t border-black/10 pt-6 text-sm leading-6 text-[#17202a]/50">
            Model <code className="font-mono">{countdown.modelId}</code>, parameters v
            {countdown.paramsVersion}, {countdown.draws.toLocaleString()} draws, seed{" "}
            <code className="font-mono">{countdown.seed}</code>, base year {countdown.baseYear}.
            Parameters and code are published under CC-BY-4.0. For informational
            purposes only. Not medical advice, and not a prediction about any
            individual.
          </p>
        </div>
      </article>
    </main>
  );
}
