import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import BetaBanner from "@/components/BetaBanner";
import { PUBLISHER, SITE_URL } from "@/lib/site";
import { FOCUS_RING } from "@/lib/nav";
import { countdown } from "@/lib/countdown";

export const metadata: Metadata = {
  title: "About | Immortality Countdown",
  description:
    "Who is behind the countdown: Taketoki Fujita, a strategic investor rather than a biologist, and why an outsider's question about the ten-years-to-immortality claim turned into a published model.",
  alternates: { canonical: "/about" },
};

/**
 * ProfilePage + mainEntity:Person is the shape Google documents for an
 * author profile page. `sameAs` is what lets it tie this name to the X and
 * GitHub accounts it has already indexed — the single strongest identity
 * signal available to an independent site.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    "@id": `${SITE_URL}/#publisher`,
    name: PUBLISHER.name,
    url: PUBLISHER.url,
    image: `${SITE_URL}${PUBLISHER.photo}`,
    jobTitle: PUBLISHER.jobTitle,
    sameAs: PUBLISHER.sameAs,
    knowsAbout: [
      "Longevity escape velocity",
      "Geroscience",
      "Technology forecasting",
      "Healthspan",
    ],
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 sm:mt-14">
      <h2 className="text-lg font-semibold text-[#17202a] sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-4 text-base leading-7 text-[#17202a]/70">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <SiteHeader />
      <BetaBanner />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="px-5 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className={`inline-block text-sm font-medium text-[#17202a]/60 transition-colors hover:text-[#17202a] ${FOCUS_RING}`}
          >
            ← Back to dashboard
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#2f766d] sm:text-sm">
            About
          </p>

          <h1 className="mt-3 font-serif text-4xl leading-[1.02] tracking-[-0.03em] text-[#17202a] sm:text-5xl">
            Who is behind this number
          </h1>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <Image
              src={PUBLISHER.photo}
              alt={PUBLISHER.name}
              width={800}
              height={800}
              sizes="(min-width: 640px) 9rem, 7rem"
              priority
              className="h-28 w-28 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-black/10 sm:h-36 sm:w-36"
            />
            <div className="min-w-0">
              <p className="text-lg leading-8 text-[#17202a]/75">
                I&apos;m <strong className="font-semibold text-[#17202a]">{PUBLISHER.name}</strong>.
                I&apos;m a strategic investor, not a biologist — and this site began as my own
                suspicion.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <a
                  href={PUBLISHER.x}
                  rel="me noopener"
                  target="_blank"
                  className={`font-semibold text-[#2f766d] ${FOCUS_RING}`}
                >
                  {PUBLISHER.xHandle} on X →
                </a>
                <a
                  href={PUBLISHER.github}
                  rel="me noopener"
                  target="_blank"
                  className={`font-semibold text-[#2f766d] ${FOCUS_RING}`}
                >
                  GitHub →
                </a>
              </div>
            </div>
          </div>

          <Section title="The question that started this">
            <p>
              The claim is everywhere: AI and quantum computing are growing
              exponentially, therefore eternal life is roughly ten years away. I wanted
              to know whether that was actually true.
            </p>
            <p>
              What I could not find was anyone who had written down the arithmetic. Plenty
              of manifestos, plenty of confident dates, almost no published assumptions.
              So I built the arithmetic myself, and put the whole thing where anyone can
              check it.
            </p>
          </Section>

          <Section title="What I am not">
            <p>
              I have no lab, no clinical training, and no peer-reviewed work in aging
              biology. That belongs at the top of this page rather than buried at the
              bottom, because this site publishes a number about when medicine might
              outrun aging, and you should know exactly who is making that claim and on
              what basis.
            </p>
            <p>
              This site is not peer-reviewed and has not been audited by anyone. The
              readiness scores are informed judgements, not measurements.
            </p>
          </Section>

          <Section title="What I actually do here">
            <p>
              My work is curation and modelling, not discovery. The method is to track
              what gets published across eight research fields, score how ready each one
              is, and run those scores through a model that anyone can open and inspect.
              Modern AI tooling is what makes that tractable for one person.
            </p>
            <p>
              Allocating capital over long horizons is, at bottom, the habit of writing
              down what you assume, how confident you are, and what would prove you wrong.
              Most forecasts about aging never do that. This one is published as code —
              every parameter, every judgement call, and a fixed random seed, so you can
              reproduce{" "}
              <Link href="/model" className={`font-semibold text-[#2f766d] ${FOCUS_RING}`}>
                the {countdown.years}-year figure
              </Link>{" "}
              exactly, or fork it and get a different one.
            </p>
          </Section>

          <Section title="What I want this site to be">
            <p>
              Not a promise, and not a debunking either. A live instrument.
            </p>
            <p>
              When a real breakthrough lands, you should be able to come here and see how
              much it actually moved the date. And when something makes headlines but
              moves nothing, you should be able to see that too. That second case is the
              more common one, and almost nobody reports it.
            </p>
          </Section>

          <Section title="How to argue with me">
            <p>
              The four assumptions that genuinely drive the answer are listed on{" "}
              <Link href="/model" className={`font-semibold text-[#2f766d] ${FOCUS_RING}`}>
                the model page
              </Link>
              . If you think one of them is wrong, say so — that is the most useful thing
              you can do for this project.
            </p>
            <p>
              The best channel is{" "}
              <a
                href={PUBLISHER.issues}
                rel="noopener"
                target="_blank"
                className={`font-semibold text-[#2f766d] ${FOCUS_RING}`}
              >
                a GitHub issue
              </a>
              , because it stays public. Corrections here are logged, not quietly edited.
              For anything that does not belong in the open, write to{" "}
              <a
                href={`mailto:${PUBLISHER.email}`}
                className={`text-[#17202a]/80 underline decoration-black/25 underline-offset-2 ${FOCUS_RING}`}
              >
                {PUBLISHER.email}
              </a>
              .
            </p>
          </Section>

          <p className="mt-10 border-t border-black/10 pt-6 text-sm leading-6 text-[#17202a]/50">
            Independent research project, based in Japan. For informational purposes only.
            Not medical advice, and not a prediction about any individual.
          </p>
        </div>
      </article>
    </main>
  );
}
