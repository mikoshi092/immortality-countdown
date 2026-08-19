import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import BetaBanner from "@/components/BetaBanner";
import { fieldProgress } from "@/data/fields";
import { countdown } from "@/lib/countdown";

export const metadata: Metadata = {
  title: "Methodology | Immortality Countdown",
  description:
    "What the Immortality Countdown measures, how the central estimate is computed from published parameters, and where the model is weakest.",
  alternates: {
    canonical: "/methodology",
  },
};

const SCENARIOS = [
  {
    name: "Conservative",
    description:
      "Assumes slower trial throughput, tighter regulatory pace, and fewer breakthroughs landing on schedule — pushing the estimate later than the base case.",
  },
  {
    name: "Base",
    description:
      "The central estimate shown on the dashboard, and the median of the published simulation rather than a hand-set figure. It moves whenever a parameter changes, and every change is a commit.",
  },
  {
    name: "Accelerated",
    description:
      "Assumes faster-than-expected breakthroughs compound across multiple fields at once — pulling the estimate earlier than the base case.",
  },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 sm:mt-12">
      <h2 className="text-lg font-semibold text-[#17202a] sm:text-xl">
        {title}
      </h2>
      <div className="mt-3 space-y-4 text-base leading-7 text-[#17202a]/70">
        {children}
      </div>
    </section>
  );
}

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <SiteHeader />
      <BetaBanner />

      <article className="px-5 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-block text-sm font-medium text-[#17202a]/60 transition-colors hover:text-[#17202a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]"
          >
            ← Back to dashboard
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#2f766d] sm:text-sm">
            Methodology · Provisional
          </p>

          <h1 className="mt-3 font-serif text-4xl leading-[1.02] tracking-[-0.03em] text-[#17202a] sm:text-5xl">
            What this measures
          </h1>

          <p className="mt-6 text-lg leading-8 text-[#17202a]/70">
            The countdown is now computed rather than hand-set: it is the
            median of {countdown.draws.toLocaleString()} simulations run from
            parameters published in the repository, with an 80% interval of{" "}
            {countdown.earlyYear}&ndash;{countdown.lateYear}. It is still a
            model built on judgement calls, and it is not a promise or a
            prediction of immortality.{" "}
            <Link
              href="/model"
              className="font-semibold text-[#2f766d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]"
            >
              See how it is calculated &rarr;
            </Link>
          </p>

          <Section title="What the Countdown Measures">
            <p>
              The countdown tracks progress toward a single milestone:
              longevity escape velocity. It is not a countdown to a cure for
              aging, and it is not a prediction that anyone alive today will
              become immortal. It is one conservative, provisional estimate
              of how far current science is from that milestone, built from
              publicly tracked signals across a set of longevity-relevant
              research fields.
            </p>
          </Section>

          <Section title="Definition of Longevity Escape Velocity">
            <p>
              Longevity escape velocity (LEV) is commonly used in the
              longevity research community to describe a hypothetical point
              at which medical progress extends healthy human lifespan
              faster than time passes — effectively causing remaining life
              expectancy to stop shrinking with age. Reaching LEV would not
              mean aging is cured or that death becomes impossible; it would
              mean the rate of progress has, for a time, outrun the rate of
              biological decline.
            </p>
          </Section>

          <Section title="Three Scenarios: Conservative / Base / Accelerated">
            <p>
              The figure shown on the dashboard is the base case. Two other
              scenarios bound the range of outcomes:
            </p>
            <div className="mt-2 grid gap-4 sm:grid-cols-3">
              {SCENARIOS.map((scenario) => (
                <div
                  key={scenario.name}
                  className="rounded-xl border border-black/10 bg-white p-4 shadow-sm"
                >
                  <p className="text-sm font-semibold text-[#17202a]">
                    {scenario.name}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#17202a]/65">
                    {scenario.description}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Eight Fields of Progress">
            <p>
              The estimate draws on a provisional field taxonomy of eight
              longevity-relevant research fields. Four are currently
              tracked with provisional scores; the other four are
              published as a provisional field taxonomy only — named and
              scoped, but not yet scored. No score has been invented for
              them.
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              {fieldProgress.map((field) => (
                <li key={field.slug}>
                  <Link
                    href={`/fields/${field.slug}`}
                    className="font-semibold text-[#17202a] underline decoration-black/20 underline-offset-2 hover:decoration-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]"
                  >
                    {field.name}
                  </Link>
                  {field.status === "pending" ? " — Score pending" : ""}
                </li>
              ))}
            </ul>
            <p>
              <Link
                href="/fields"
                className="font-semibold text-[#2f766d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]"
              >
                See current field scores →
              </Link>
            </p>
          </Section>

          <Section title="Why the Estimate Can Change">
            <p>
              The estimate is provisional and will move as the underlying
              field scores are revised. It shifts later if trials, funding, or
              research output slow down, and earlier if progress compounds
              faster than expected across the tracked fields &mdash; or if a
              regulatory pathway for aging opens sooner than the last twenty
              years suggest. It is not a fixed target, and every revision is
              recorded in the version history of the parameter file.
            </p>
          </Section>

          <Section title="Limits and Uncertainty">
            <p>
              There is now a published calculation model, and its code,
              parameters and fixed random seed are all in the repository, so
              the figure is reproducible by anyone. That is a much weaker claim
              than it sounds: <strong>no peer review and no third-party audit
              back it</strong>, the field readiness scores are informed
              judgements rather than measurements, and the eight-field taxonomy
              is this site&rsquo;s own rather than a recognised scientific
              classification. Forecasting the pace of biomedical progress is
              inherently uncertain. Read this as a transparent, arguable
              estimate &mdash; not a validated scientific result.
            </p>
          </Section>

          <p className="mt-12 border-t border-black/10 pt-6 text-sm text-[#17202a]/50">
            For informational purposes only. Not medical advice.
          </p>
        </div>
      </article>
    </main>
  );
}
