import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import HeroVisual from "@/components/ja/HeroVisual";
import LevCrossingDiagram from "@/components/ja/LevCrossingDiagram";
import PipelineFlow from "@/components/ja/PipelineFlow";
import TechnologyMap from "@/components/ja/TechnologyMap";
import { countdown, formatPercent } from "@/lib/countdown";
import { FIELD_IDS } from "@/lib/fields";
import { FIELD_LABELS_JA, FIELD_SUMMARIES_JA } from "@/lib/ja";
import { getFieldModel, REGULATORY_READINESS } from "@/lib/model-snapshot";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Japanese faces, loaded by this route and no other.
 *
 * They are declared here rather than in the root layout because a full
 * Japanese family is ~130 unicode-range @font-face blocks: putting them
 * in the shared layout stylesheet added 65 KB gzipped of render-blocking
 * CSS to every English page, which is exactly what "do not touch the
 * English pages" rules out. Imported from a page, the CSS lands in this
 * route's own chunk.
 *
 * `preload: false` with no `subsets` is the required combination. Google
 * publishes no named subset that covers Japanese, so asking for
 * `["latin"]` would preload Latin while still shipping the whole family;
 * omitting subsets keeps the full unicode-range coverage and next/font
 * then emits no <link rel="preload"> at all. The browser downloads a
 * Japanese chunk only when it has a glyph in that range to draw.
 *
 * `weight: "variable"` covers 400 through 600 from one file set instead
 * of one ~130-file set per static weight.
 */
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: "variable",
  display: "swap",
  preload: false,
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  weight: "variable",
  display: "swap",
  preload: false,
});

/**
 * The variable classes above only reach what is inside <main>. <Footer />
 * is rendered by the root layout as a sibling of `children`, so on /ja it
 * would be the one Japanese block left in an OS fallback face. Publishing
 * the same two custom properties at :root closes that gap.
 *
 * React hoists a <style> carrying `href` + `precedence` into <head> and
 * dedupes it, and because this element is only rendered by this route,
 * English pages never receive it. The values are build-time constants
 * from next/font, not input.
 */
const JA_FONT_VARS = `:root{--font-noto-sans-jp:${notoSansJP.style.fontFamily};--font-noto-serif-jp:${notoSerifJP.style.fontFamily}}`;

const title =
  "寿命脱出速度（LEV）とは？不老長寿はいつ実現するのか | Immortality Countdown";
const description =
  "医学が老化を追い越す「寿命脱出速度（LEV）」とは何か。最新研究と8つの技術分野を追跡し、Immortality Countdown独自モデルによる現在の到達予測をわかりやすく解説します。";

/**
 * Only the English home and this page carry hreflang, because they are
 * the only pair that exists in both languages. /model, /fields and the
 * rest have no Japanese counterpart, so claiming one there would be a
 * false alternate.
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

const FOCUS_RING =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]";

/**
 * No negative tracking anywhere in this file. Tight letter-spacing is a
 * Latin display-type trick; applied to kana and kanji — which are drawn
 * on a full-width em square — it just collides the glyphs.
 */
const SECTION_HEADING =
  "font-ja-serif text-[clamp(1.5rem,4.6vw,2.2rem)] font-medium leading-[1.45] text-[#17202a]";

const BODY = "text-[15px] leading-8 text-[#17202a]/75 sm:text-base sm:leading-9";

/**
 * An editorial pull quote: a sentence already made in the surrounding
 * prose, set larger so a scanning reader picks up the argument without
 * reading the section.
 *
 * No quotation marks, no card, no tinted panel. A short accent rule and
 * the whitespace around it carry the emphasis, which is why the two
 * instances stay legible next to the section's other serif blocks —
 * every one of those is either ruled differently or set at a different
 * size. It stays inside the max-w-2xl text column rather than breaking
 * out of it, so the page keeps one measure throughout.
 */
function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-10 max-w-2xl sm:my-12">
      <span aria-hidden="true" className="block h-0.5 w-10 bg-[#2f766d]" />
      <p className="font-ja-serif mt-5 text-[clamp(1.25rem,3.1vw,1.75rem)] font-medium leading-[1.75] text-[#17202a]">
        {children}
      </p>
    </blockquote>
  );
}

const GATES = [
  {
    title: "臨床試験という迷宮",
    body: "マウスや細胞で成功しても、人間で安全性と有効性を確認するには長い時間がかかります。老化研究では、そもそも何をエンドポイント（試験の合否を決める指標）として測るべきかという試験設計そのものが、まだ発展途上です。",
  },
  {
    title: "規制という障壁",
    body: "老化そのものを対象とする治療には、まだ確立された承認ルートがありません。生物学的年齢や老化バイオマーカーが、臨床的に意味のある評価指標としてどこまで認められるか。それは各国の規制当局と研究者が現在進行形で議論している論点です。",
  },
  {
    title: "スケールとコスト",
    body: "数人だけが受けられる高度な治療では、人口レベルの健康寿命は大きく変わりません。製造、デリバリー、品質管理、価格。研究成果を「普通の医療」に変える工程も、まぎれもなくLEVの一部です。",
  },
  {
    title: "社会実装の壁",
    body: "予防的な介入を、誰が、いつ、どの基準で受けるのか。保険、医療制度、診断基準、アクセスの設計次第で、優れた技術でも社会全体への普及速度は変わります。",
  },
];

export default function JapaneseLandingPage() {
  const years = countdown.years;
  const gain = countdown.currentGain;
  const draws = countdown.draws.toLocaleString("en-US");
  const reachRate = formatPercent(countdown.probabilityReached);

  return (
    <main
      id="top"
      lang="ja"
      className={`${notoSansJP.variable} ${notoSerifJP.variable} font-ja min-h-screen bg-[#f7f5ef] text-[#17202a]`}
    >
      <style href="ja-font-vars" precedence="high">
        {JA_FONT_VARS}
      </style>

      <SiteHeader />

      <div className="border-b border-white/10 bg-[#141413]">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-2.5 sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:py-2">
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[#2f766d]"
            />
            <span className="text-[11px] font-bold tracking-[0.14em] text-white/90">
              PUBLIC BETA
            </span>
          </span>
          <p className="text-[11px] font-medium leading-4 text-white/55 sm:text-xs">
            カウントダウンのモデルは開発中です。各スコアはモデルへの入力値であり、
            根拠の見直しにあわせて変わります。
          </p>
        </div>
      </div>

      <section className="px-5 pt-10 pb-8 sm:px-6 sm:pt-12 md:pt-16">
        <div className="mx-auto max-w-7xl">
          {/* The illustration column widens at xl rather than taking its
              full size the moment the row splits, which keeps the drop in
              headline size across the lg boundary from being abrupt. */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_30rem]">
            {/* @container so the headline can be measured against this
                column instead of the viewport. Once the hero splits in
                two, a vw-based size knows nothing about the illustration
                taking a third of the row, and overruns the column. */}
            <div className="@container">
              {/* Latin display text, so the wide tracking here is the
                  right call — unlike on the Japanese headings below. */}
              <p className="text-xs font-semibold tracking-[0.22em] text-[#2f766d] sm:text-sm">
                DEATH IS A BUG
              </p>

              {/* Japanese has no spaces, so the browser may break a
                  heading between any two characters — including inside
                  「なる」 and between the number and 年. Marking the two
                  closing phrases nowrap makes 「…に / なるまで、 /
                  あと66年。」 the only break points, which greedy line
                  filling resolves to the intended two lines.

                  The clamp middle term matters as much as the spans.
                  Kanji, kana and 「」、。 are all drawn full-width, so the
                  opening phrase is exactly 12em wide and cannot break any
                  later than 「に」. Holding the size at or below one
                  twelfth of the column keeps that phrase on one line at
                  every width; anything larger hands the break back to the
                  browser, mid-word. */}
              <h1 className="font-ja-serif mt-4 max-w-3xl text-[clamp(1.35rem,8cqw,3.6rem)] font-medium leading-[1.32] sm:mt-5">
                死が「治療可能なバグ」に
                <span className="whitespace-nowrap">なるまで、</span>
                <span className="whitespace-nowrap">
                  あと<span className="lining-nums tabular-nums">{years}</span>
                  年。
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#17202a]/70 sm:text-lg sm:leading-9">
                医学が老化をオーバーライドする日はいつ訪れるのか。
                世界の最前線を追跡し、その到達距離を測る。
              </p>
            </div>

            <HeroVisual medianYear={countdown.medianYear} />
          </div>

          {/* Three white cards read as a dashboard widget. Rules and
              whitespace read as a magazine's data strip, which is what
              these three numbers are. */}
          <dl className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-0">
            {[
              {
                label: "予測中央値",
                value: `${countdown.medianYear}`,
                unit: "年",
              },
              {
                label: "80%予測区間",
                value: `${countdown.earlyYear}–${countdown.lateYear}`,
                unit: "年",
              },
              {
                label: "シミュレーション到達率",
                value: reachRate,
                unit: null,
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={
                  index > 0
                    ? "sm:border-l sm:border-black/12 sm:pl-7"
                    : undefined
                }
              >
                <dt className="text-[11px] font-medium text-[#17202a]/50">
                  {stat.label}
                </dt>
                <dd className="font-ja-serif mt-2 text-[clamp(1.7rem,3.2vw,2.25rem)] font-medium leading-none tabular-nums text-[#17202a]">
                  {stat.value}
                  {stat.unit ? (
                    <span className="ml-1.5 text-base font-normal text-[#17202a]/45">
                      {stat.unit}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 max-w-2xl text-[13px] leading-6 text-[#17202a]/55">
            {draws}回のモンテカルロ・シミュレーションから導いた暫定値。
            これは予言ではなく、現在の前提から見た「現在地」を示すメトリクスです。
          </p>
        </div>
      </section>

      <section
        id="lev-toha"
        className="scroll-mt-20 border-t border-black/8 px-5 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className={SECTION_HEADING}>寿命脱出速度（LEV）という臨界点</h2>

          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-14">
            <div className={`max-w-2xl space-y-5 ${BODY}`}>
              <p>
                寿命脱出速度（Longevity Escape Velocity: LEV）とは、
                <strong className="font-semibold text-[#17202a]">
                  「人類が不死を手に入れるXデー」のことではありません。
                </strong>
              </p>
              <p>
                1年という時間が過ぎる間に、医学の進歩によって「残りの健康寿命」が1年以上延びる状態。
                それが、このサイトで追跡しているLEVです。
              </p>
              <p>
                現在のモデルでは、1年経つ間に医学が取り戻す健康寿命を約
                <span className="font-semibold tabular-nums text-[#17202a]">
                  {gain.toFixed(2)}
                </span>
                年と推定しています。まだ時間の流れの方が速い。
              </p>
              <p>
                しかし、この値が
                <span className="font-semibold tabular-nums text-[#17202a]">
                  {countdown.levThreshold.toFixed(2)}
                </span>
                年/年に達すれば、少なくともモデル上は「1年老いる間に、1年以上の健康寿命を取り戻す」状態になります。
              </p>
              <p>
                事故も感染症も、あらゆる死因が消えるわけではありません。LEVが意味するのは不死ではなく、
                医療の進歩によって、寿命が延び、次の技術発展の恩恵を継続的に獲得できるということです。
              </p>
            </div>

            <figure className="rounded-xl border border-black/10 bg-white px-5 py-5 shadow-sm lg:self-start">
              <figcaption className="text-xs font-semibold text-[#17202a]/60">
                1年あたりに得られる健康寿命
              </figcaption>

              <div className="mt-3">
                <LevCrossingDiagram
                  currentGain={gain}
                  threshold={countdown.levThreshold}
                />
              </div>

              <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-black/8 pt-3">
                <p className="text-sm font-medium text-[#17202a]/70">
                  現在
                  <span className="ml-1.5 font-semibold tabular-nums text-[#17202a]">
                    {gain.toFixed(2)}
                  </span>
                  <span className="font-normal text-[#17202a]/45"> 年/年</span>
                </p>
                <p className="text-sm font-medium text-[#17202a]/70">
                  LEV到達時
                  <span className="ml-1.5 font-semibold tabular-nums text-[#17202a]">
                    {countdown.levThreshold.toFixed(2)}
                  </span>
                  <span className="font-normal text-[#17202a]/45"> 年/年</span>
                </p>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-[#17202a]/45">
                現在値は{countdown.baseYear}
                年時点のImmortality Countdownモデルによる推定値です。
                図の曲線はLEVという考え方を説明するための概念図で、
                予測した軌道ではありません。
              </p>
            </figure>
          </div>
        </div>
      </section>

      <section
        id="why-now"
        className="scroll-mt-20 border-t border-black/8 px-5 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className={SECTION_HEADING}>
            なぜ「<span className="tabular-nums">{years}</span>
            年」もかかるのか？
            <br className="hidden sm:block" />
            壁は研究室の外にもある
          </h2>

          <p className={`mt-6 max-w-2xl ${BODY}`}>
            科学の進歩だけではLEVには届きません。研究室で有望な結果が出てから、
            それが何百万人にも使える医療になるまでには、いくつもの巨大な障壁があります。
          </p>

          <PipelineFlow lastReviewed={REGULATORY_READINESS.lastReviewed} />

          <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GATES.map((gate, index) => (
              <div
                key={gate.title}
                className="rounded-xl border border-black/10 bg-white px-5 py-4 shadow-sm"
              >
                <p className="font-mono text-[11px] tabular-nums text-[#2f766d]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <dt className="mt-1.5 text-sm font-semibold leading-6 text-[#17202a]">
                  {gate.title}
                </dt>
                <dd className="mt-2 text-[13px] leading-6 text-[#17202a]/65">
                  {gate.body}
                </dd>
              </div>
            ))}
          </dl>

          <PullQuote>医療技術の発展だけでは、時計は縮まらない。</PullQuote>

          <div className={`max-w-2xl space-y-5 ${BODY}`}>
            <p>
              ですからImmortality Countdownでは、8つの研究分野とは別に
              <strong className="font-semibold text-[#17202a]">
                「規制・社会実装の準備度」
              </strong>
              を障壁として追跡しています。
            </p>
            <p>
              どれほど強力な若返り技術でも、人間で検証され、製造され、承認され、広く届かなければ、
              LEVを進展させる力は限定されてしまうのです。
            </p>
          </div>

          <div className="mt-8 max-w-2xl rounded-xl border border-black/10 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <p className="text-sm font-semibold text-[#17202a]/80">
              規制・社会実装の準備度
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-[#17202a]/55">
              モデル入力値 · 最終確認 {REGULATORY_READINESS.lastReviewed}
            </p>

            <div className="mt-4 flex items-center gap-4">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/8">
                <div
                  className="readiness-bar-fill h-full rounded-full bg-[#2f766d]"
                  style={{ width: `${REGULATORY_READINESS.score}%` }}
                />
              </div>
              <p className="shrink-0 text-lg font-semibold tabular-nums text-[#17202a] sm:text-xl">
                {REGULATORY_READINESS.score}
                <span className="text-sm font-normal text-[#17202a]/45">
                  {" "}
                  / 100
                </span>
              </p>
            </div>
          </div>

          <p className="mt-6">
            <Link
              href="/model"
              className={`text-sm font-semibold text-[#2f766d] ${FOCUS_RING}`}
            >
              モデルの計算方法と前提を見る（英語）→
            </Link>
          </p>
        </div>
      </section>

      <section
        id="eight-fields"
        className="scroll-mt-20 border-t border-black/8 px-5 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className={SECTION_HEADING}>LEVを駆動する8つのエンジン</h2>

          <p className={`mt-6 max-w-2xl ${BODY}`}>
            LEVは、ひとつの発明だけで到達する未来ではありません。
            複数の技術領域が並行して進み、互いのボトルネックを外していく必要があります。
            スコアは0〜100の暫定的なものであり、あくまで目安になります。完成度を保証するものではありません。
          </p>

          <TechnologyMap
            fields={FIELD_IDS.map((id) => ({
              id,
              label: FIELD_LABELS_JA[id],
              score: getFieldModel(id).score,
            }))}
            medianYear={countdown.medianYear}
          />

          <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FIELD_IDS.map((id, index) => {
              const field = getFieldModel(id);
              return (
                <li
                  key={id}
                  className="flex flex-col rounded-xl border border-black/10 bg-white px-5 py-4 shadow-sm"
                >
                  <p className="font-mono text-[11px] tabular-nums text-[#2f766d]">
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <p className="mt-1.5 text-sm font-semibold leading-6 text-[#17202a]">
                    {FIELD_LABELS_JA[id]}
                  </p>

                  <p className="mt-2 flex-1 text-[13px] leading-6 text-[#17202a]/65">
                    {FIELD_SUMMARIES_JA[id]}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/8">
                      <div
                        className="field-bar-fill h-full origin-left rounded-full bg-[#2f766d]"
                        style={{
                          width: `${field.score}%`,
                          animationDelay: `${index * 100}ms`,
                        }}
                      />
                    </div>
                    <p className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-[#17202a]">
                      {field.score}
                      <span className="text-[11px] font-normal text-[#17202a]/40">
                        /100
                      </span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-6">
            <Link
              href="/fields"
              className={`text-sm font-semibold text-[#2f766d] ${FOCUS_RING}`}
            >
              8分野それぞれの評価を読む（英語）→
            </Link>
          </p>
        </div>
      </section>

      <section
        id="when-lev"
        className="scroll-mt-20 border-t border-black/8 px-5 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className={SECTION_HEADING}>いつ寿命脱出速度に到達するのか？</h2>

          <div className={`mt-6 max-w-2xl space-y-5 ${BODY}`}>
            <p>
              まだ確定していません。日々の技術革新や規制等により、刻一刻と変化しています。
              このサイトでは、最新ニュースを追い、その期間を算出することを主眼においています。
            </p>
            <p>
              今回のAIによる{draws}回のシミュレーションでは、
              <span className="font-semibold tabular-nums text-[#17202a]">
                {reachRate}
              </span>
              がLEVに到達することを示しました。そのシミュレーションで割り出された予測の中央値が
              {countdown.medianYear}年です。
            </p>
            <p>
              80%予測区間で見ると、一番早いのは{countdown.earlyYear}年、遅いと
              {countdown.lateYear}年と
              <strong className="font-semibold text-[#17202a]">
                かなり広くなっています。
              </strong>
            </p>
            <p>
              なぜなら、この数字は未来を予言しているのではなく、現在わかっている研究速度、技術成熟度、
              規制や社会実装の条件をひとつのモデルに入れた結果だからです。
            </p>
            <p>前提が変われば、数字も変わります。</p>
            <ul className="space-y-2 border-l-2 border-[#2f766d]/30 pl-5 text-[15px] leading-8 text-[#17202a]/70 sm:text-base">
              <li>新しい治療法が人間で再現される。</li>
              <li>バイオマーカーが臨床試験を短縮する。</li>
              <li>AIが創薬を高速化する。</li>
              <li>規制のルールが変わる。</li>
            </ul>
            <p>
              そんな変化が積み重なれば、
              <span className="tabular-nums">{years}</span>
              年は短くなるかもしれません。逆に、大きな分野が停滞すれば遠ざかります。
            </p>
          </div>

          <div className="mt-10 max-w-2xl border-t border-black/8 pt-8 sm:mt-12">
            <p className="font-ja-serif text-[clamp(1.3rem,3.6vw,1.95rem)] font-medium leading-[1.7] text-[#17202a]">
              この<span className="tabular-nums">{years}</span>年が縮んでいくのか。
              <br />
              それとも、遠ざかるのか？
            </p>
            <p className={`mt-5 ${BODY}`}>
              Immortality Countdownは、人類が老化を追い越すまでの距離と、
              その数字を動かした理由を追い続けます。
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/#latest-news"
              className={`text-sm font-semibold text-[#2f766d] ${FOCUS_RING}`}
            >
              最新の研究アップデートを見る（英語）→
            </Link>
            <Link
              href="/methodology"
              className={`text-sm font-medium text-[#17202a]/55 underline-offset-4 hover:underline ${FOCUS_RING}`}
            >
              評価の方法（英語）
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
