import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import HeroVisual from "@/components/ja/HeroVisual";
import LevCrossingDiagram from "@/components/ja/LevCrossingDiagram";
import PipelineFlow from "@/components/ja/PipelineFlow";
import TechnologyMap from "@/components/ja/TechnologyMap";
import { countdown } from "@/lib/countdown";
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
    body: "マウスで成功しても、人間では数年かかる。老化研究は、何をもって「効いた」とするかという評価指標さえ未整備だ。試験設計の遅さが開発速度を削っている。",
  },
  {
    title: "規制という人工の壁",
    body: "規制は自然法則ではない。人が作ったルールだ。安全性の審査は残す。それ以外の、老化研究を遅らせる時代遅れの規制は撤去すべきだ。老化を正面から治療対象として扱える承認経路を作る。",
  },
  {
    title: "スケールとコスト",
    body: "量産できない治療は社会を変えない。製造、デリバリー、品質管理、価格を突破し、高度な実験治療を誰でも使える医療へ落とし込む。",
  },
  {
    title: "社会実装の壁",
    body: "届かない技術は存在しないのと同じだ。保険、診断基準、アクセスを未来の医療に合わせる。社会実装の速度が、そのまま寿命に跳ね返る。",
  },
];

export default function JapaneseLandingPage() {
  const earlyYears = Math.round(countdown.earlyYear - countdown.baseYear);
  const gain = countdown.currentGain;
  const draws = countdown.draws.toLocaleString("en-US");

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
                  早ければあと
                  <span className="lining-nums tabular-nums">{earlyYears}</span>
                  年。
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#17202a]/70 sm:text-lg sm:leading-9">
                モデルの早期10%ラインは{countdown.earlyYear}年。
                医学が老化をオーバーライドするまでの距離を、世界の研究とともに追う。
              </p>
            </div>

            <HeroVisual earlyYear={countdown.earlyYear} />
          </div>

          <p className="mt-8 max-w-2xl text-[13px] leading-6 text-[#17202a]/55">
            早期10%ライン：<span className="font-semibold tabular-nums text-[#17202a]">{countdown.earlyYear}年</span>。
            固定シードで{draws}回のモンテカルロ・シミュレーションを実行して算出した。
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
                <strong className="font-semibold text-[#17202a]">
                  LEVとは、医療の進歩によって寿命が延び、次の医療技術発展の恩恵を継続的に獲得できる状況が生まれる臨界点のことである。
                </strong>
              </p>
              <p>
                現在のモデルは
                <span className="font-semibold tabular-nums text-[#17202a]">
                  {gain.toFixed(2)}
                </span>
                年/年。LEVは
                <span className="font-semibold tabular-nums text-[#17202a]">
                  {countdown.levThreshold.toFixed(2)}
                </span>
                年/年。今は時間が勝っている。1.00を超えた瞬間、医学が老化の時計を追い越す。
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
            なぜ「<span className="tabular-nums">{earlyYears}</span>年」もかかるのか？
            <br className="hidden sm:block" />
            科学を止める人工の壁がある
          </h2>

          <p className={`mt-6 max-w-2xl ${BODY}`}>
            研究室で成功しても、患者に届かなければゼロだ。
            LEVを遅らせるのは、臨床試験、規制、製造、社会実装という人間が作った摩擦である。
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

          <PullQuote>規制は自然法則ではない。人が作った壁なら、人が壊せる。</PullQuote>

          <div className={`max-w-2xl ${BODY}`}>
            <p>
              Immortality Countdownは、8つの研究分野とは別に
              <strong className="font-semibold text-[#17202a]">
                「規制・社会実装の準備度」
              </strong>
              を独立した障壁として追跡する。承認され、量産され、届かなければ、カウントダウンは縮まらない。
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
            LEVは8つのエンジンが同時に回って初めて到来する。どれか一つが止まれば全体が遅れる。
            スコアは各分野の現在地だ。
          </p>

          <TechnologyMap
            fields={FIELD_IDS.map((id) => ({
              id,
              label: FIELD_LABELS_JA[id],
              score: getFieldModel(id).score,
            }))}
            earlyYear={countdown.earlyYear}
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
          <h2 className={SECTION_HEADING}>最初の標的は、{countdown.earlyYear}年だ</h2>

          <div className={`mt-6 max-w-2xl space-y-5 ${BODY}`}>
            <p>
              この数字はAIの作文ではない。公開されたTypeScriptモデルが、固定シードで
              {draws}個のシナリオを実行した結果だ。
            </p>
            <p>
              その早期10%ラインが{countdown.earlyYear}年、今から{earlyYears}年後である。
              人間で効く治療、短い臨床試験、AI創薬、不要な規制の撤去。
              これらが進めば{earlyYears}年は縮む。停滞すれば伸びる。
            </p>
          </div>

          <div className="mt-10 max-w-2xl border-t border-black/8 pt-8 sm:mt-12">
            <p className="font-ja-serif text-[clamp(1.3rem,3.6vw,1.95rem)] font-medium leading-[1.7] text-[#17202a]">
              この<span className="tabular-nums">{earlyYears}</span>年を、30年、20年、10年へ。
              <br />
              死を「治療可能なバグ」に変える時計を進める。
            </p>
            <p className={`mt-5 ${BODY}`}>
              Immortality Countdownは、数字を動かした研究と制度変化だけを追う。
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
