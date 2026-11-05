import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import RtNewsList from "@/components/calm/RtNewsList";
import VideoRail from "@/components/calm/VideoRail";
import { listArticles } from "@/data/articles";
import { ARTICLE_UI } from "@/lib/article-copy";
import { FOCUS_RING } from "@/lib/nav";
import { newsIndexHreflang, newsRssPath } from "@/lib/article-seo";
import { newsFaceArticles, toNewsRows } from "@/lib/news-rows";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const title = "不老不死ニュース | Immortality Countdown";
const description =
  "世界中の長寿研究ニュースを、日本語の見出しで紹介します。見出しがそのまま元の記事へのリンクになっています。";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/ja/news",
    languages: newsIndexHreflang(),
    types: {
      "application/rss+xml": newsRssPath("ja"),
    },
  },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/ja/news`,
    siteName: SITE_NAME,
    type: "website",
    locale: "ja_JP",
  },
};

/**
 * Calm news index (2026-11-04, owner-approved mock): realtime-chart-style
 * rows — headline links to the original article, badge counts hours since
 * it appeared, bar is an attention guide — with a fixed related-videos
 * rail. Up to the 100 most recent published general-media articles
 * (news-face display policy: lib/news-rows.ts). The model is a
 * list-first aggregator: this page deliberately does not editorialize the
 * rows beyond the headline the pipeline wrote.
 */
export default function JapaneseNewsIndexPage() {
  const now = new Date();
  const articles = newsFaceArticles(listArticles(), "ja").slice(0, 100);
  const rows = toNewsRows(articles, "ja", now);
  const ui = ARTICLE_UI.ja;

  return (
    <main lang="ja" className="min-h-screen bg-[#fdfdfb] leading-[1.75] text-[#233252]">
      <SiteHeader />
      <div className="mx-auto max-w-[1080px] px-5 pb-[60px]">
        <h1 className="mt-3.5 text-[1.6rem] font-extrabold">📰 不老不死ニュース</h1>
        <p className="mt-1 text-[0.95rem] text-[#4a5878]">
          世界中の不老不死ニュースを、日本語の見出しで。見出しがそのまま元の記事へのリンクです。
        </p>
        <p className="mt-1 text-[0.9rem]">
          <Link href={newsRssPath("ja")} className={`font-bold text-[#00a8a8] hover:underline ${FOCUS_RING}`}>
            {ui.rssLabel} →
          </Link>
        </p>
        <div className="mt-[18px] grid items-start gap-5 min-[820px]:grid-cols-[1fr_300px]">
          <div>
            {rows.length > 0 ? (
              <RtNewsList
                rows={rows}
                locale="ja"
                note="※ 左のバッジの数字は「何時間前」の記事かを示します。バーは注目度の目安です。"
              />
            ) : (
              <>
                <p className="text-[0.95rem] text-[#4a5878]">
                  現在、掲載するニュースを準備しています。新しい記事が届き次第、ここに新しい順で並びます。それまでは、トップページのカウントダウンと8分野の進み具合をご覧ください。
                </p>
                <p className="mt-2 text-[0.9rem]">
                  <Link
                    href="/ja"
                    className={`font-bold text-[#00a8a8] hover:underline ${FOCUS_RING}`}
                  >
                    トップページへ戻る
                  </Link>
                </p>
              </>
            )}
          </div>
          <VideoRail locale="ja" />
        </div>
      </div>
    </main>
  );
}
