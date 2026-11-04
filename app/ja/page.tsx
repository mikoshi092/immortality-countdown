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
import { FIELD_IDS, type FieldId } from "@/lib/fields";
import { FIELD_LABELS_JA } from "@/lib/ja";
import { getFieldModel } from "@/lib/model-snapshot";
import { FIELD_EMOJI, newsFaceArticles, toNewsRows } from "@/lib/news-rows";
import { FOCUS_RING } from "@/lib/nav";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const title =
  "寿命脱出速度（LEV）とは？不老長寿はいつ実現するのか | Immortality Countdown";
const description =
  "医療の進歩が老化の速度を追い越す「寿命脱出速度（LEV）」とは何か。長寿研究の進展を追い、Immortality Countdown独自モデルによる現在の到達予測を解説します。";

/**
 * Landing-page hreflang remains / and /ja. News list and article pages
 * declare their own pairs. /model, /fields and the rest still have no
 * Japanese counterpart, so they must not claim one.
 *
 * Every URL here is written without a trailing slash: the site runs on
 * Next.js's default `trailingSlash: false`, where /ja/ redirects to /ja,
 * and a canonical pointing at a redirect is a canonical Google ignores.
 */
export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/ja",
    languages: {
      en: "/",
      ja: "/ja",
      "x-default": "/",
    },
  },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/ja`,
    siteName: SITE_NAME,
    type: "website",
    locale: "ja_JP",
  },
};

/**
 * Calm redesign (2026-11-04, owner-approved mock): plain background,
 * standard sans, thin borders and light shadows. The countdown endpoint
 * is the early scenario — heroEarlyYears years — with the standard pace
 * and the late scenario kept as secondary context on the range bar. No
 * scenario counts or simulation framing on this page: the model page
 * carries the methodology, this page carries the headline.
 *
 * Short card blurbs per field, from the approved mock. The longer
 * canonical summaries remain in lib/ja.ts for other surfaces.
 */
const FIELD_BLURBS_JA: Record<FieldId, string> = {
  "rejuvenation-regeneration": "傷んだ細胞や組織を、若い状態へ近づける技術。",
  "biomarkers-diagnostics": "老化の進み具合を、数字で測れるようにする技術。",
  "geroscience-drugs-trials": "老化そのものを狙う薬と、人での臨床試験。",
  "gene-therapy-delivery": "遺伝子を編集・追加し、必要な場所へ安全に届ける技術。",
  "ai-drug-discovery": "AIで薬の候補探しと試験設計を速くする領域。",
  "organ-replacement-biofabrication": "壊れた臓器の修復・交換。移植、人工臓器、組織の作製。",
  "immune-engineering-cancer-control": "免疫を保ち、がんや慢性炎症を抑える技術。",
  "enabling-technology-automation": "ロボット実験や計算基盤で、研究の速度そのものを上げる技術。",
};

export default function JapaneseLandingPage() {
  const now = new Date();
  const { baseYear, earlyYear, medianYear, lateYear, currentGain } = countdown;
  const yearsToMedian = medianYear - baseYear;
  const articles = listArticles();
  const latestRows = toNewsRows(newsFaceArticles(articles, "ja").slice(0, 5), "ja", now);

  const fieldCards: FieldCardData[] = FIELD_IDS.map((id) => ({
    key: id,
    emoji: FIELD_EMOJI[id],
    name: FIELD_LABELS_JA[id],
    blurb: FIELD_BLURBS_JA[id],
    score: getFieldModel(id).score,
  }));
  // League-table order (design review, 2026-11-04): leaders first,
  // foundations last, so the grid reads as progress ranking. Sorted from
  // the data, not a hardcoded order.
  const fieldCardsByScore = [...fieldCards].sort((a, b) => b.score - a.score);
  const averageScore = Math.round(
    fieldCards.reduce((sum, field) => sum + field.score, 0) / fieldCards.length,
  );
  // All field reviews share one date in lev/params.json; the footnote
  // shows it as a year-month rather than inventing a fresher one.
  const reviewed = getFieldModel(FIELD_IDS[0]).lastReviewed;
  const reviewedLabel = `${reviewed.slice(0, 4)}年${Number(reviewed.slice(5, 7))}月`;

  return (
    <main id="top" lang="ja" className="min-h-screen bg-[#fdfdfb] leading-[1.75] text-[#233252]">
      <SiteHeader />
      <div className="mx-auto max-w-[980px] px-5">
        <TopStoriesStrip articles={articles} locale="ja" now={now} />

        {/* Hero */}
        <section className="pt-14 text-center">
          <h1 className="text-[clamp(1.7rem,5vw,2.5rem)] font-extrabold leading-[1.4]">
            不老長寿まで
          </h1>
          <p className="mx-auto mt-[18px] max-w-[640px] text-[clamp(0.98rem,2.8vw,1.08rem)]">
            1年生きるあいだに、寿命が1年以上延びるようになる——そんな地点の到来を、世界の長寿研究の進み方から見積もっています。
          </p>

          <div className="mx-auto mt-[38px] max-w-[560px] rounded-[32px] border-[3px] border-[#7d97bd] bg-white px-5 pb-[22px] pt-[26px] shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
            <div className="text-[clamp(2.8rem,9vw,4.4rem)] font-extrabold leading-[1.15]">
              あと{" "}
              <span className="text-[#e8502f]">
                <CountUp target={heroEarlyYears} />
              </span>{" "}
              年
              <span className="ml-2 align-middle text-[0.95rem] font-semibold text-[#4a5878]">
                （早ければ）
              </span>
            </div>
            <div className="text-[1.25rem] font-bold">
              <b className="text-[1.7rem]">{earlyYear}年</b> に到達
            </div>
          </div>

          <RangeBar
            points={[
              {
                year: earlyYear,
                tag: "早ければ・終着点",
                left: "4%",
                highlight: true,
                hideYear: true,
              },
              { year: medianYear, tag: "標準ペース", left: "46%" },
              { year: lateYear, tag: "遅ければ", left: "96%" },
            ]}
            note={`このページの「あと何年」は、3つの見通しのうち、いちばん早い到達（${earlyYear}年）を終着点にしています。`}
          />
        </section>

        {/* LEV in one sentence */}
        <section id="lev-toha" className="scroll-mt-6 pt-[52px]">
          <SectionHeading
            title="「寿命脱出速度（LEV）」を、ひとことで"
            sub="ロケットの「脱出速度」と同じ発想です。追い越しが始まる速さ——それがLEVです。"
          />
          <LevGauge
            nowLabel="🌱 いま"
            nowValueText={`1年で寿命は ${currentGain.toFixed(2)} 年 延びている`}
            nowPct={Math.round(currentGain * 100)}
            goalLabel="🚀 追い越し地点（LEV）"
            goalValueText="1年で 1.00 年 延びる"
            note={`いまは、1年生きるごとに寿命が約${currentGain.toFixed(2)}年延びています。この伸びが1.00年を超えたとき、医療は老化を追い越し始めます。`}
          />
        </section>

        {/* Milestones */}
        <section className="pt-[52px]">
          <SectionHeading
            title="到達までのマイルストーン"
            sub="「伸び率」がどこまで上がれば、いつ到達するか。早ければの到達に向けた道筋です。"
          />
          <Milestones
            steps={[
              { gain: currentGain.toFixed(2), when: `${baseYear}年・いまここ`, state: "done" },
              { gain: "0.30", when: "2028年ごろ", state: "next" },
              { gain: "0.50", when: "2042年ごろ・折り返し", state: "next" },
              { gain: "0.75", when: "2052年ごろ", state: "next" },
              { gain: "1.00", when: `${earlyYear}年・LEV到達`, state: "final" },
            ]}
            eventsCaption="世の中の転換点"
            events={[
              { label: "シンギュラリティ", left: "30%", size: "large" },
              { label: "量子コンピューターの普及", year: "2030", left: "40%", size: "small" },
            ]}
          />
        </section>

        {/* News — the strip above hides itself when empty; the section
            below swaps its empty shelf for one quiet signpost line so a
            first-time visitor still learns the site has news. */}
        {latestRows.length > 0 ? (
        <section className="pt-[52px]">
          <SectionHeading
            title="📰 不老長寿ニュース"
            sub="世界中の研究ニュースを、日本語の見出しで。見出しがそのまま元の記事へのリンクになっています。"
          />
          <div className="mt-6">
            <RtNewsList
              rows={latestRows}
              locale="ja"
              note="※ 左の数字は元の記事の新しさ（何時間前）の目安、バーは注目度の目安です。"
            />
          </div>
          <div className="mt-[18px] text-center">
            <Link
              href="/ja/news"
              className={`inline-block font-extrabold text-[#00a8a8] hover:underline ${FOCUS_RING}`}
            >
              ニュース一覧をすべて見る →
            </Link>
          </div>
        </section>
        ) : (
          <section className="pt-[52px] text-center">
            <Link
              href="/ja/news"
              className={`text-[0.95rem] font-bold text-[#4a5878] hover:text-[#00a8a8] hover:underline ${FOCUS_RING}`}
            >
              不老長寿ニュースは準備中です →
            </Link>
          </section>
        )}

        {/* Age calculator */}
        <section className="pt-[52px]">
          <SectionHeading
            title="あなたは何歳になっていますか"
            sub="到達の年を、自分の人生に引き寄せてみてください。"
          />
          <AgeCalculator
            locale="ja"
            earlyYear={earlyYear}
            medianYear={medianYear}
            yearsToEarly={heroEarlyYears}
            yearsToMedian={yearsToMedian}
          />
          <p className="mt-[14px] text-center text-[0.92rem] text-[#4a5878]">
            例：今年生まれた赤ちゃんは、{earlyYear}年に{heroEarlyYears}歳。いま40歳の人は
            {40 + heroEarlyYears}歳です。
          </p>
        </section>

        {/* Eight fields */}
        <section id="eight-fields" className="scroll-mt-6 pt-[52px]">
          <SectionHeading
            title="8つの分野が、同時に進んでいます"
            sub="老化への挑戦は、ひとつの技術では届きません。8分野の足並みがそろうほど、到達は近づきます。"
          />
          <div className="mt-6 rounded-[14px] border-[3px] border-[#7d97bd] bg-white p-6 shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-bold">🌍 8分野全体の進み具合（平均）</span>
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
            <p className="mt-2 text-[0.8rem] text-[#4a5878]">100% = 治療として実際に使える状態</p>
            <p className="mt-[10px] text-[0.9rem]">
              全体はまだ半分に届いていません。伸びている分野と、これからの分野があります。
            </p>
          </div>
          <FieldCards fields={fieldCardsByScore} locale="ja" />
          <p className="mt-[14px] text-[0.8rem] text-[#4a5878]">
            スコアは各分野の「現在地」を示す目安です（{reviewedLabel}
            時点の評価）。分野名の横の色は、スコア帯による進み具合の目安表示です。
          </p>
        </section>

        {/* The honest wall: delivery */}
        <section id="why-now" className="scroll-mt-6 pt-[52px]">
          <SectionHeading title="一番大きな壁は「届けること」" />
          <div className="mt-6 rounded-[14px] border-[3px] border-[#7d97bd] bg-white p-7 shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
            <p>
              研究が進んでも、治療として人に届くまでには、安全性の確認、臨床試験、承認、製造、社会の受け入れと、いくつも壁があります。
            </p>
            <p className="mt-3">
              人で試すことの安全性確認は、省くわけにはいきません。一方で、老化を治療の対象として扱う枠組みがまだ整っていないことや、更新の遅い手続きなど、科学とは別の理由の遅れもあります。この遅れは、人の手で取り除けるものです。
            </p>
            <p className="mt-4">
              治療として届ける準備は、研究の進み具合に比べて、まだ入口の段階です。
            </p>
          </div>
        </section>

        <Closing
          heading="「死はバグである」未来を、数字で追いかけます。"
          primaryLabel="最新ニュースを見る"
          primaryHref="/ja/news"
          secondaryLabel="数字の出し方（モデルについて）"
          secondaryHref="/model"
          locale="ja"
          finePrint={[
            `このページの「あと${heroEarlyYears}年」は、公開中のモデルが置く「早ければ」の到達年（${earlyYear}年）を基準にした目安です。「標準ペース」では${medianYear}年、「遅ければ」${lateYear}年です。`,
            "いずれも、科学の進み方によって前後します。将来の約束ではなく、現在地を測るための物差しとしてご覧ください。",
          ]}
        />
      </div>
    </main>
  );
}
