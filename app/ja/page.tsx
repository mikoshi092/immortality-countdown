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
  LevGauge,
  Milestones,
  Phrases,
  RangeBar,
  SectionHeading,
  type FieldCardData,
} from "@/components/calm/Sections";
import { listArticles } from "@/data/articles";
import { countdown, gainPercentAt, heroEarlyYears } from "@/lib/countdown";
import { faqItems, faqPageJsonLd } from "@/lib/faq";
import { FIELD_IDS, type FieldId } from "@/lib/fields";
import { FIELD_LABELS_JA } from "@/lib/ja";
import { getFieldModel } from "@/lib/model-snapshot";
import { serializeJsonLd } from "@/lib/json-ld";
import { newsFaceArticles, toNewsRows } from "@/lib/news-rows";
import { GlobeIcon } from "@/components/calm/FieldIcons";
import { FOCUS_RING } from "@/lib/nav";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const title =
  "不老不死へのカウントダウン | 寿命脱出速度（LEV）とは？不老長寿はいつ実現するのか";
const description =
  "不老不死はいつ実現するのか。医療の進歩が老化の速度を追い越す「寿命脱出速度（LEV）」とは何か。長寿研究の進展を追い、Immortality Countdown独自モデルによる現在の到達予測を解説します。";

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
  // Road-to-arrival event positions: the model's own gain in each
  // event year (trajectory median, whole percent) — derived from the
  // model, never placed by hand (owner decision, 2026-11-05).
  const road2028Pct = gainPercentAt(2028);
  const road2030Pct = gainPercentAt(2030);
  const road2036Pct = gainPercentAt(2036);
  const yearsToMedian = medianYear - baseYear;
  const articles = listArticles();
  const latestRows = toNewsRows(newsFaceArticles(articles, "ja").slice(0, 5), "ja", now);
  const faq = faqItems("ja");

  const fieldCards: FieldCardData[] = FIELD_IDS.map((id) => ({
    key: id,
    icon: id,
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
          <h1 className="font-hero-display text-[clamp(2.2rem,6vw,3.4rem)] font-black leading-[1.3]">
            不老不死への<br className="sm:hidden" />カウントダウン
          </h1>
          <p className="mx-auto mt-[18px] max-w-[640px] text-[clamp(0.98rem,2.8vw,1.08rem)] [word-break:auto-phrase]">
            近年のAI創薬の進歩や量子コンピューターの登場でかつては夢でしかなかった&quot;不老不死&quot;は、技術的に達成可能な目標となってきた。このサイトでは、最新ニュースやデータを追い、あと何年で到達できるかをリアルタイムで追って行きたい。
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
                yearsToGo: `あと${earlyYear - baseYear}年`,
              },
              {
                year: medianYear,
                tag: "標準ペース",
                left: "46%",
                yearsToGo: `あと${medianYear - baseYear}年`,
              },
              {
                year: lateYear,
                tag: "遅ければ",
                left: "96%",
                yearsToGo: `あと${lateYear - baseYear}年`,
              },
            ]}
            note={
              <Phrases
                parts={[
                  "「あと何年」は、",
                  "いちばん早い到達",
                  `（${earlyYear}年）までの`,
                  "年数です。",
                ]}
              />
            }
          />
        </section>

        {/* LEV in one sentence */}
        <section id="lev-toha" className="scroll-mt-6 pt-[52px]">
          <SectionHeading
            title={<Phrases parts={["「寿命脱出速度（LEV）」を、", "ひとことで"]} />}
            sub={
              <Phrases
                parts={[
                  "ロケットの",
                  "「脱出速度」と",
                  "同じ発想です。",
                  "追い越しが",
                  "始まる速さ——",
                  "それがLEVです。",
                ]}
              />
            }
          />
          <Disclosure label="くわしく見る">
            <LevGauge
              nowLabel="🌱 いま"
              nowValueText={`1年で寿命は ${currentGain.toFixed(2)} 年 延びている`}
              nowPct={Math.round(currentGain * 100)}
              goalLabel="🚀 追い越し地点（LEV）"
              goalValueText="1年で 1.00 年 延びる"
              note={`いまは、1年生きるごとに寿命が約${currentGain.toFixed(2)}年（約2.6か月分）延びています。この伸びが1.00年に届いたとき、医療は老化を追い越し始めます。`}
            />
          </Disclosure>
        </section>

        {/* Milestones */}
        <section className="pt-[52px]">
          <SectionHeading
            title="到達までの道のり"
            sub={
              <Phrases
                parts={[
                  "「伸び率」が",
                  "どこまで上がれば、",
                  "いつ到達するか。",
                  "早ければの到達に",
                  "向けた道筋です。",
                ]}
              />
            }
          />
          <Milestones
            points={[
              {
                pct: Math.round(currentGain * 100),
                pctLabel: `${Math.round(currentGain * 100)}%`,
                when: `${baseYear}年`,
                note: "いまここ",
                marker: "start",
              },
              {
                pct: road2028Pct,
                when: "2028年",
                marker: "event",
                pill: { label: "シンギュラリティ", year: "（2028年）", tone: "coral", level: 1, anchor: 24, anchorSm: 28 },
              },
              {
                pct: road2030Pct,
                when: "2030年",
                marker: "event",
                pill: { label: "量子コンピュータの普及", year: "（2030年）", tone: "navy", level: 3, anchor: 38, anchorSm: 44 },
              },
              {
                pct: road2036Pct,
                when: "2036年",
                marker: "event",
                pill: { label: "全細胞解析終了", year: "（2036年）", tone: "teal", level: 2, anchor: 55, anchorSm: 55 },
              },
              {
                pct: 100,
                pctLabel: "100%",
                when: `${earlyYear}年`,
                note: "LEV到達",
                marker: "end",
              },
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
            sub={
              <Phrases
                parts={[
                  "世界中の研究ニュースを、",
                  "日本語の見出しで。",
                  "見出しがそのまま",
                  "元の記事への",
                  "リンクになっています。",
                ]}
              />
            }
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
            title={<Phrases parts={["あなたは", "不老長寿に", "間に合うか？"]} />}
            sub={
              <Phrases parts={["あなたの", "現在の年齢を", "入れてください。"]} />
            }
          />
          <AgeCalculator
            locale="ja"
            earlyYear={earlyYear}
            medianYear={medianYear}
            yearsToEarly={heroEarlyYears}
            yearsToMedian={yearsToMedian}
          />
          <p className="mt-[14px] text-center text-[0.92rem] text-[#4a5878]">
            例：今年生まれた赤ちゃんは、{earlyYear}年に{heroEarlyYears}歳になります。いま40歳の人は
            {40 + heroEarlyYears}歳です。
          </p>
        </section>

        {/* Eight fields */}
        <section id="eight-fields" className="scroll-mt-6 pt-[52px]">
          <SectionHeading
            title="8つの分野が、同時に進んでいます"
            sub={
              <Phrases
                parts={[
                  "老化への挑戦は、",
                  "ひとつの技術では",
                  "届きません。",
                  "8分野の足並みが",
                  "そろうほど、",
                  "到達は近づきます。",
                ]}
              />
            }
          />
          <p className="mt-3 text-center text-[0.85rem] text-[#4a5878]">
            🟢 加速中 50%以上 ／ 🟡 前進中 40〜49% ／ 🟠 土台づくり中 40%未満
          </p>
          <div className="mt-6 rounded-[14px] border-[3px] border-[#7d97bd] bg-white p-6 shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="flex items-center gap-2 font-bold">
                <GlobeIcon className="h-5 w-5 shrink-0" />
                8分野全体の進み具合（平均）
              </span>
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
            スコアは各分野の現在地の目安です（{reviewedLabel}時点の評価）。
          </p>
        </section>

        {/* The honest wall: delivery */}
        <section id="why-now" className="scroll-mt-6 pt-[52px]">
          <SectionHeading
            title={<Phrases parts={["一番大きな壁は", "「届けること」"]} />}
          />
          <div className="mt-6 rounded-[14px] border-[3px] border-[#7d97bd] bg-white p-7 shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
            <p>
              研究が進んでも、治療として人に届くまでには、安全性の確認、臨床試験、承認、製造、社会の受け入れと、いくつも壁があります。
            </p>
            <p className="mt-3">
              人で試すことの安全性確認は、省くわけにはいきません。
            </p>
            <p className="mt-3">
              一方で、老化を治療の対象として扱う枠組みがまだ整っていないことや、更新の遅い手続きなど、科学とは別の理由の遅れもあります。この遅れは、人の手で取り除けるものです。
            </p>
            <p className="mt-4">
              治療として届ける準備は、研究の進み具合に比べて、まだ入口の段階です。
            </p>
          </div>
        </section>

        {/* FAQ — the "when?" questions this page exists to answer,
            stated plainly before the closing. The JSON-LD is generated
            from the same array the section renders. */}
        <section className="pt-[52px]">
          <SectionHeading title="よくある質問" />
          <FaqSection items={faq} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqPageJsonLd(faq)) }}
          />
        </section>

        <Closing
          heading={
            <Phrases parts={["「死はバグである」", "未来を、", "数字で追いかけます。"]} />
          }
          primaryLabel="最新ニュースを見る"
          primaryHref="/ja/news"
          secondaryLabel="数字の出し方（モデルについて）"
          secondaryHref="/model"
          locale="ja"
          finePrint={[
            `このページの「あと${heroEarlyYears}年」は目安です。科学の進み方によって前後します。将来の約束ではなく、現在地を測るための物差しとしてご覧ください。`,
          ]}
        />
      </div>
    </main>
  );
}
