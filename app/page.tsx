import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import AgeCalculator from "@/components/calm/AgeCalculator";
import CountUp from "@/components/calm/CountUp";
import RtNewsList from "@/components/calm/RtNewsList";
import TopStoriesStrip from "@/components/calm/TopStoriesStrip";
import {
  Closing,
  FieldCards,
  LevGauge,
  Milestones,
  RangeBar,
  SectionHeading,
  type FieldCardData,
} from "@/components/calm/Sections";
import { listArticles } from "@/data/articles";
import { countdown, heroEarlyYears } from "@/lib/countdown";
import { FIELD_IDS, FIELD_LABELS, type FieldId } from "@/lib/fields";
import { getFieldModel } from "@/lib/model-snapshot";
import { FIELD_EMOJI, newsFaceArticles, toNewsRows } from "@/lib/news-rows";
import { FOCUS_RING } from "@/lib/nav";

/**
 * The root layout already sets `canonical: "/"`, but a page-level
 * `alternates` object replaces the inherited one wholesale, so the
 * canonical has to be restated alongside the languages.
 *
 * This pairing exists between / and /ja. News list and article pages
 * declare their own pairs. /model, /fields and the rest still declare
 * `canonical` and no `languages`, which is what keeps them from
 * advertising Japanese versions that do not exist.
 */
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      ja: "/ja",
      "x-default": "/",
    },
  },
};

/**
 * Calm redesign (2026-11-04, owner-approved mock): the same design
 * system and section structure as /ja. The countdown endpoint is the
 * early scenario — heroEarlyYears years — with the standard pace and
 * the late scenario kept as secondary context on the range bar. Copy is
 * the page's existing English where a counterpart exists; sections that
 * only existed in the Japanese mock are translated plainly from it. No
 * scenario counts or simulation framing on this page.
 */
const FIELD_BLURBS_EN: Record<FieldId, string> = {
  "rejuvenation-regeneration":
    "Technologies that bring damaged cells and tissues closer to a younger state.",
  "biomarkers-diagnostics": "Technologies that measure how far aging has progressed, in numbers.",
  "geroscience-drugs-trials": "Drugs that target aging itself, and the trials testing them in people.",
  "gene-therapy-delivery":
    "Editing and adding genes — and delivering them safely where they are needed.",
  "ai-drug-discovery": "Using AI to find drug candidates faster and design better trials.",
  "organ-replacement-biofabrication":
    "Repairing or replacing failed organs — transplants, artificial organs, lab-grown tissue.",
  "immune-engineering-cancer-control":
    "Keeping immunity strong and holding back cancer and chronic inflammation.",
  "enabling-technology-automation":
    "Robot labs and computing that raise the speed of research itself.",
};

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Home() {
  const now = new Date();
  const { baseYear, earlyYear, medianYear, lateYear, currentGain } = countdown;
  const yearsToMedian = medianYear - baseYear;
  const articles = listArticles();
  const latestRows = toNewsRows(newsFaceArticles(articles).slice(0, 5), "en", now);

  const fieldCards: FieldCardData[] = FIELD_IDS.map((id) => ({
    key: id,
    emoji: FIELD_EMOJI[id],
    name: FIELD_LABELS[id],
    blurb: FIELD_BLURBS_EN[id],
    score: getFieldModel(id).score,
  }));
  // League-table order (design review, 2026-11-04): leaders first,
  // foundations last, so the grid reads as progress ranking. Sorted from
  // the data, not a hardcoded order.
  const fieldCardsByScore = [...fieldCards].sort((a, b) => b.score - a.score);
  const averageScore = Math.round(
    fieldCards.reduce((sum, field) => sum + field.score, 0) / fieldCards.length,
  );
  const reviewed = getFieldModel(FIELD_IDS[0]).lastReviewed;
  const reviewedLabel = `${MONTHS_EN[Number(reviewed.slice(5, 7)) - 1]} ${reviewed.slice(0, 4)}`;

  return (
    <main id="top" className="min-h-screen bg-[#fdfdfb] leading-[1.75] text-[#233252]">
      <SiteHeader />
      <div className="mx-auto max-w-[980px] px-5">
        <TopStoriesStrip articles={articles} locale="en" now={now} />

        {/* Hero */}
        <section className="pt-14 text-center">
          <h1 className="text-[clamp(1.7rem,5vw,2.5rem)] font-extrabold leading-[1.4]">
            Until <span className="text-[#e8502f]">ageless longevity</span>
          </h1>
          <p className="mx-auto mt-[18px] max-w-[640px] text-[clamp(0.98rem,2.8vw,1.08rem)]">
            Living one more year starts to buy you more than one extra year of life. This site
            estimates when that point may arrive, from how longevity research is progressing around
            the world.
          </p>

          <div className="mx-auto mt-[38px] max-w-[560px] rounded-[32px] border-[3px] border-[#7d97bd] bg-white px-5 pb-[22px] pt-[26px] shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
            <div className="text-[clamp(2.8rem,9vw,4.4rem)] font-extrabold leading-[1.15]">
              <span className="text-[#e8502f]">
                <CountUp target={heroEarlyYears} />
              </span>{" "}
              <span className="text-[clamp(1.4rem,4.5vw,2.2rem)]">years to go</span>
              <span className="ml-2 align-middle text-[0.95rem] font-semibold text-[#4a5878]">
                (at the earliest)
              </span>
            </div>
            <div className="text-[1.25rem] font-bold">
              Arrival in <b className="text-[1.7rem]">{earlyYear}</b>
            </div>
          </div>

          <RangeBar
            points={[
              { year: earlyYear, tag: "Earliest · the endpoint", left: "4%", highlight: true },
              { year: medianYear, tag: "Standard pace", left: "46%" },
              { year: lateYear, tag: "Latest", left: "96%" },
            ]}
            note={`The years-to-go figure on this page counts down to the earliest of the three outlooks (${earlyYear}).`}
          />
        </section>

        {/* LEV in one sentence */}
        <section className="pt-[52px]">
          <SectionHeading
            title="Longevity Escape Velocity (LEV), in one sentence"
            sub="The same idea as a rocket's escape velocity: the speed at which the overtaking begins — that is LEV."
          />
          <LevGauge
            nowLabel="🌱 Now"
            nowValueText={`Each year lived adds ${currentGain.toFixed(2)} years of life`}
            nowPct={Math.round(currentGain * 100)}
            goalLabel="🚀 The overtaking point (LEV)"
            goalValueText="Each year adds 1.00 years"
            note={`Right now, each year you live adds about ${currentGain.toFixed(2)} years to life expectancy. When that gain passes 1.00 years, medicine starts to outrun aging.`}
          />
        </section>

        {/* Milestones */}
        <section className="pt-[52px]">
          <SectionHeading
            title="Milestones on the way"
            sub="How far the gain rate has to climb, and when arrival follows — on the path to the earliest arrival."
          />
          <Milestones
            steps={[
              { gain: currentGain.toFixed(2), when: `${baseYear} · you are here`, state: "done" },
              { gain: "0.30", when: "around 2028", state: "next" },
              { gain: "0.50", when: "around 2042 · halfway", state: "next" },
              { gain: "0.75", when: "around 2052", state: "next" },
              { gain: "1.00", when: `${earlyYear} · LEV reached`, state: "final" },
            ]}
            eventsCaption="Turning points in the wider world"
            events={[
              { label: "Singularity", left: "30%", size: "large" },
              { label: "Quantum computers spread", year: "2030", left: "40%", size: "small" },
            ]}
          />
        </section>

        {/* News — the strip above hides itself when empty; the section
            below swaps its empty shelf for one quiet signpost line so a
            first-time visitor still learns the site has news. */}
        {latestRows.length > 0 ? (
        <section className="pt-[52px]">
          <SectionHeading
            title="📰 Longevity research news"
            sub="Research news from around the world. Each headline links straight to the original article."
          />
          <div className="mt-6">
            <RtNewsList
              rows={latestRows}
              locale="en"
              note="The badge number is how many hours ago the original article appeared. The bar is an attention guide."
            />
          </div>
          <div className="mt-[18px] text-center">
            <Link
              href="/news"
              className={`inline-block font-extrabold text-[#00a8a8] hover:underline ${FOCUS_RING}`}
            >
              See all news →
            </Link>
          </div>
        </section>
        ) : (
          <section className="pt-[52px] text-center">
            <Link
              href="/news"
              className={`text-[0.95rem] font-bold text-[#4a5878] hover:text-[#00a8a8] hover:underline ${FOCUS_RING}`}
            >
              Longevity research news is on its way →
            </Link>
          </section>
        )}

        {/* Age calculator */}
        <section className="pt-[52px]">
          <SectionHeading title="How old will you be?" sub="Bring the arrival year into your own life." />
          <AgeCalculator
            locale="en"
            earlyYear={earlyYear}
            medianYear={medianYear}
            yearsToEarly={heroEarlyYears}
            yearsToMedian={yearsToMedian}
          />
          <p className="mt-[14px] text-center text-[0.92rem] text-[#4a5878]">
            Example: a baby born this year turns {heroEarlyYears} in {earlyYear}. Someone who is 40
            now will be {40 + heroEarlyYears}.
          </p>
        </section>

        {/* Eight fields */}
        <section className="pt-[52px]">
          <SectionHeading
            title="Eight fields, advancing at the same time"
            sub="Aging will not be beaten by a single technology. The closer the eight fields march together, the nearer arrival comes."
          />
          <div className="mt-6 rounded-[14px] border-[3px] border-[#7d97bd] bg-white p-6 shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-bold">🌍 All eight fields (average)</span>
              <b className="text-[1.3rem]">
                {averageScore}
                <span className="text-[0.85rem] font-bold">%</span>
              </b>
            </div>
            <div className="mt-2 h-[22px] overflow-hidden rounded-full bg-[#eef2f9]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#ffb703,#ff6b4a)]"
                style={{ width: `${averageScore}%` }}
              />
            </div>
            <p className="mt-2 text-[0.8rem] text-[#4a5878]">
              100% = ready to use as an actual treatment
            </p>
            <p className="mt-[10px] text-[0.9rem]">
              Overall, we are not yet halfway. Some fields are surging; others are still to come.
            </p>
          </div>
          <FieldCards fields={fieldCardsByScore} locale="en" />
          <p className="mt-[14px] text-[0.8rem] text-[#4a5878]">
            Scores are a guide to where each field stands (reviewed {reviewedLabel}). The chip
            beside each field name bands progress by score.
          </p>
        </section>

        {/* The honest wall: delivery */}
        <section className="pt-[52px]">
          <SectionHeading title="The biggest wall is delivery" />
          <div className="mt-6 rounded-[14px] border-[3px] border-[#7d97bd] bg-white p-7 shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
            <p>
              Even as research advances, a treatment still has several walls to clear before it
              reaches people: safety checks, clinical trials, approval, manufacturing, and
              acceptance by society.
            </p>
            <p className="mt-3">
              The safety checks for testing in people cannot be skipped. On the other hand, some
              delays have nothing to do with science: there is still no established framework for
              treating aging itself as a target of medicine, and some procedures are slow to
              update. Those are delays people can remove.
            </p>
            <p className="mt-4">
              Compared with how far the research has progressed, the readiness to deliver this as
              a treatment is still at the starting stage.
            </p>
          </div>
        </section>

        <Closing
          heading="We track the future where death is a bug — in numbers."
          primaryLabel="Read the latest research"
          primaryHref="/news"
          secondaryLabel="How the numbers are made"
          secondaryHref="/model"
          locale="en"
          finePrint={[
            `The "${heroEarlyYears} years to go" on this page is measured against the published model's earliest arrival year (${earlyYear}). At the standard pace it is ${medianYear}; at the latest, ${lateYear}.`,
            "All three move with the pace of science — a yardstick for where we stand, not a promise about the future.",
          ]}
        />
      </div>
    </main>
  );
}
