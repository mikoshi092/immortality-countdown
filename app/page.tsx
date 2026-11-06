import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import AgeCalculator from "@/components/calm/AgeCalculator";
import CountUp from "@/components/calm/CountUp";
import RtNewsList from "@/components/calm/RtNewsList";
import TopStoriesStrip from "@/components/calm/TopStoriesStrip";
import {
  Closing,
  Disclosure,
  FaqSection,
  FieldCards,
  Milestones,
  SectionHeading,
  WireSectionHeading,
  type FieldCardData,
} from "@/components/calm/Sections";
import { listArticles } from "@/data/articles";
import { countdown, gainPercentAt, heroEarlyYears } from "@/lib/countdown";
import { faqItems, faqPageJsonLd } from "@/lib/faq";
import { FIELD_IDS, FIELD_LABELS, type FieldId } from "@/lib/fields";
import { getFieldModel } from "@/lib/model-snapshot";
import { serializeJsonLd } from "@/lib/json-ld";
import { newsFaceArticles, toNewsRows } from "@/lib/news-rows";
import { GlobeIcon } from "@/components/calm/FieldIcons";
import { FOCUS_RING } from "@/lib/nav";
import { SITE_NAME, SITE_URL } from "@/lib/site";

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
/**
 * The top page carries its own description: it opens with the question
 * the page exists to answer, then keeps the layout's conservative
 * framing word for word. The title stays the layout's site title.
 * openGraph is restated with the same description so social cards do
 * not fall back to the layout's older one (the /ja page does the same).
 */
const description =
  "When will humans live forever? A conservative, evidence-based estimate of when medical technology may begin to outrun aging, with transparent methodology and longevity research updates.";

export const metadata: Metadata = {
  description,
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      ja: "/ja",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "Countdown to Immortality | Immortality Countdown",
    description,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
};

/**
 * Calm redesign (2026-11-04, owner-approved mock): the same design
 * system and section structure as /ja. The countdown endpoint is the
 * early scenario — heroEarlyYears years. The standard pace and the
 * late scenario are not displayed on this page (owner decision,
 * 2026-11-05: the early scenario is the single story). Copy is
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
  const { baseYear, earlyYear, currentGain } = countdown;
  // Road-to-arrival event positions: the model's own gain in each
  // event year (trajectory median, whole percent) — derived from the
  // model, never placed by hand (owner decision, 2026-11-05).
  const road2028Pct = gainPercentAt(2028);
  const road2030Pct = gainPercentAt(2030);
  const road2036Pct = gainPercentAt(2036);
  const articles = listArticles();
  const latestRows = toNewsRows(newsFaceArticles(articles).slice(0, 5), "en", now);
  const faq = faqItems("en");

  const fieldCards: FieldCardData[] = FIELD_IDS.map((id) => ({
    key: id,
    icon: id,
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
      {/* Hero wash (specimen B, owner-approved 2026-11-06): a pale-blue
          gradient behind the header and hero zone only. The wrapper's box
          is stretched 110px past the hero (pb) and pulled back by the same
          amount (-mb), so the wash fades out fully above the road panel
          without moving anything on the page. */}
      <div
        className="-mb-[110px] pb-[110px]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(95,151,198,0.15), rgba(95,151,198,0.05) 62%, rgba(95,151,198,0) 100%)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "50% 0",
        }}
      >
      <SiteHeader />
      <div className="mx-auto max-w-[980px] px-5">
        <TopStoriesStrip articles={articles} locale="en" now={now} />

        {/* Hero */}
        <section className="pt-14 text-center">
          <h1 className="font-hero-display text-[clamp(2.9rem,12.3vw,3.2rem)] font-black leading-[1.25] sm:text-[clamp(2.6rem,7.2vw,4.8rem)]">
            Countdown to Immortality
          </h1>
          <p className="mx-auto mt-[18px] max-w-[640px] text-[clamp(0.98rem,2.8vw,1.08rem)] [word-break:auto-phrase]">
            With recent advances in AI drug discovery and the arrival of quantum computers,
            &lsquo;immortality&rsquo; — once only a dream — has become a technically achievable
            goal. This site tracks the latest news and data to follow, in real time, how many
            years remain until we get there.
          </p>

          <div className="mx-auto mt-[38px] max-w-[560px] rounded-[32px] border-[3px] border-[#7d97bd] bg-white px-5 pb-[22px] pt-[26px] shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
            <div className="text-[clamp(2.8rem,9vw,4.4rem)] font-extrabold leading-[1.15]">
              <span className="text-[#e8502f]">
                <CountUp target={heroEarlyYears} />
              </span>{" "}
              <span className="text-[clamp(1.4rem,4.5vw,2.2rem)]">years to go</span>
              <span className="ml-2 whitespace-nowrap align-middle text-[0.95rem] font-semibold text-[#4a5878]">
                (at the earliest)
              </span>
            </div>
            <div className="text-[1.25rem] font-bold">
              Arrival in <b className="text-[1.7rem]">{earlyYear}</b>
            </div>
          </div>

        </section>
      </div>
      </div>
      <div className="mx-auto max-w-[980px] px-5">
        {/* LEV in one sentence */}
        <section className="pt-[52px]">
          <SectionHeading
            title="Longevity Escape Velocity (LEV)"
            sub="On this site, achieving immortality is defined as the moment we reach longevity escape velocity — the concept proposed by futurist Ray Kurzweil, gerontologist Aubrey de Grey, and others."
          />
          <Disclosure label="Read more">
<p className="mt-6 leading-[1.9]">
              Longevity escape velocity (LEV) is the point at which medical progress begins to extend life faster than we age. In OECD countries today, average life expectancy for men and women is growing by 2.6 months every year. In other words, for every year the average person lives, their lifespan extends by about 2.6 months. When that growth reaches one full year per year, every year lived adds a year of life — in theory, a state in which we can keep escaping death by aging. Reaching LEV is nothing less than the immortality humanity has always dreamed of.
            </p>
          </Disclosure>
        </section>

        {/* Milestones */}
        <section className="pt-[52px]">
          <SectionHeading
            title="The road to arrival"
            sub="How far the gain rate has to climb, and when arrival follows — on the path to the earliest arrival."
          />
          <Milestones
            points={[
              {
                pct: Math.round(currentGain * 100),
                pctLabel: `${Math.round(currentGain * 100)}%`,
                when: `${baseYear}`,
                note: "You are here",
                marker: "start",
              },
              {
                pct: road2028Pct,
                when: "2028",
                marker: "event",
                pill: { label: "The Singularity", year: " (2028)", tone: "coral", level: 1, anchor: 24, anchorSm: 24 },
              },
              {
                pct: road2030Pct,
                when: "2030",
                marker: "event",
                pill: { label: "Quantum computing becomes mainstream", year: " (2030)", tone: "navy", level: 3, anchor: 38, anchorSm: 50 },
              },
              {
                pct: road2036Pct,
                when: "2036",
                marker: "event",
                pill: { label: "Whole-cell analysis complete", year: " (2036)", tone: "teal", level: 2, anchor: 55, anchorSm: 55 },
              },
              {
                pct: 100,
                pctLabel: "100%",
                when: `${earlyYear}`,
                note: "LEV reached",
                marker: "end",
              },
            ]}
          />
        </section>

        {/* News — the strip above hides itself when empty; the section
            below swaps its empty shelf for one quiet signpost line so a
            first-time visitor still learns the site has news. */}
        {latestRows.length > 0 ? (
        <section className="-mx-5 bg-[#ededed] px-5 pb-[26px] pt-[34px]">
          <WireSectionHeading title="📰 Latest News" />
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
              See the news list →
            </Link>
          </div>
        </section>
        ) : (
          <section className="pt-[52px] text-center">
            <Link
              href="/news"
              className={`text-[0.95rem] font-bold text-[#4a5878] hover:text-[#00a8a8] hover:underline ${FOCUS_RING}`}
            >
              Ageless longevity news is on its way →
            </Link>
          </section>
        )}

        {/* Age calculator */}
        <section className="pt-[52px]">
          <SectionHeading title="Will you live long enough to live forever?" sub="Enter your current age to find out." />
          <AgeCalculator locale="en" yearsToEarly={heroEarlyYears} />
        </section>

        {/* Eight fields */}
        <section className="pt-[52px]">
          <SectionHeading
            title="Eight fields, advancing at the same time"
            sub="Aging will not be beaten by a single technology. The closer the eight fields march together, the nearer arrival comes."
          />
          <p className="mt-3 text-center text-[0.85rem] text-[#4a5878]">
            🟢 Accelerating 50%+ / 🟡 Advancing 40–49% / 🟠 Building foundations under 40%
          </p>
          <div className="mt-6 rounded-[14px] border-[3px] border-[#7d97bd] bg-white p-6 shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="flex items-center gap-2 font-bold">
                <GlobeIcon className="h-5 w-5 shrink-0" />
                All eight fields (average)
              </span>
              <b className="text-[1.3rem]">
                {averageScore}
                <span className="text-[0.85rem] font-bold">%</span>
              </b>
            </div>
            {/* Bar geometry copies the field cards below (owner,
                2026-11-06: the average bar must share the cards'
                px-per-% scale). The -mx-[27px] pull (panel border 3px
                + padding 24px) makes this grid exactly as wide as the
                cards' grid, the auto-fill column sizes like a card
                column, the cell replays the card's horizontal inset
                (20px padding + 3px border = px-[23px]), and the row
                replays the card bar row (gap + fixed-width % label),
                so 1% covers
                the same pixels here as in any card. The row's % label
                is a layout replica only — the figure itself sits in
                the header above — so it is invisible and aria-hidden. */}
            <div className="-mx-[27px] mt-2 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
              <div className="px-[23px]">
                <div className="flex items-center gap-2">
                  <div className="h-[22px] flex-1 overflow-hidden rounded-full border-2 border-[#7d97bd] bg-[#eef2f9]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#ffb703,#ff6b4a)]"
                      style={{ width: `${averageScore}%` }}
                    />
                  </div>
                  <b aria-hidden="true" className="invisible w-[34px] whitespace-nowrap text-[1.05rem] tabular-nums">
                    {averageScore}
                    <span className="text-[0.8rem]">%</span>
                  </b>
                </div>
              </div>
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
            Scores are a guide to where each field stands (reviewed {reviewedLabel}).
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
              The safety checks for testing in people cannot be skipped.
            </p>
            <p className="mt-3">
              On the other hand, some delays have nothing to do with science: there is still no
              established framework for treating aging itself as a target of medicine, and some
              procedures are slow to update. Those are delays people can remove.
            </p>
            <p className="mt-4">
              Compared with how far the research has progressed, the readiness to deliver this as
              a treatment is still at the starting stage.
            </p>
          </div>
        </section>

        {/* FAQ — the "when?" questions this page exists to answer,
            stated plainly before the closing. The JSON-LD is generated
            from the same array the section renders. */}
        <section className="pt-[52px]">
          <SectionHeading title="Frequently asked questions" />
          <FaqSection items={faq} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqPageJsonLd(faq)) }}
          />
        </section>

        <Closing
          heading="We track the future where death is a bug — in numbers."
          primaryLabel="Read the latest news"
          primaryHref="/news"
          secondaryLabel="How the numbers are made"
          secondaryHref="/model"
          locale="en"
          finePrint={[
            `The "${heroEarlyYears} years to go" on this page is an estimate. It moves with the pace of science — a yardstick for where we stand, not a promise about the future.`,
          ]}
        />
      </div>
    </main>
  );
}
