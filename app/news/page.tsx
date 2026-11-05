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

export const metadata: Metadata = {
  title: "Immortality News | Immortality Countdown",
  description:
    "Longevity research news from around the world. Each headline links straight to the original article.",
  alternates: {
    canonical: "/news",
    languages: newsIndexHreflang(),
    types: {
      "application/rss+xml": newsRssPath("en"),
    },
  },
};

/**
 * Calm news index (2026-11-04, owner-approved mock): realtime-chart-style
 * rows — headline links to the original article, badge counts hours since
 * it appeared, bar is an attention guide — with a fixed related-videos
 * rail, mirroring /ja/news. Up to the 100 most recent published
 * general-media articles (news-face display policy: lib/news-rows.ts).
 */
export default function NewsIndexPage() {
  const now = new Date();
  const articles = newsFaceArticles(listArticles()).slice(0, 100);
  const rows = toNewsRows(articles, "en", now);
  const ui = ARTICLE_UI.en;

  return (
    <main className="min-h-screen bg-[#fdfdfb] leading-[1.75] text-[#233252]">
      <SiteHeader />
      <div className="mx-auto max-w-[1080px] px-5 pb-[60px]">
        <h1 className="mt-3.5 text-[1.6rem] font-extrabold">📰 Immortality News</h1>
        <p className="mt-1 text-[0.95rem] text-[#4a5878]">
          Longevity news from around the world. Each headline links straight to the
          original article.
        </p>
        <p className="mt-1 text-[0.9rem]">
          <Link href={newsRssPath("en")} className={`font-bold text-[#00a8a8] hover:underline ${FOCUS_RING}`}>
            {ui.rssLabel} →
          </Link>
        </p>
        <div className="mt-[18px] grid items-start gap-5 min-[820px]:grid-cols-[1fr_300px]">
          <div>
            {rows.length > 0 ? (
              <RtNewsList
                rows={rows}
                locale="en"
                note="The badge number is how many hours ago the article appeared. The bar is an attention guide."
              />
            ) : (
              <>
                <p className="text-[0.95rem] text-[#4a5878]">
                  We are preparing the news feed. As new stories arrive, they will appear here, newest first. Until then, see the countdown and the eight fields&#39; progress on the top page.
                </p>
                <p className="mt-2 text-[0.9rem]">
                  <Link
                    href="/"
                    className={`font-bold text-[#00a8a8] hover:underline ${FOCUS_RING}`}
                  >
                    Back to the top page
                  </Link>
                </p>
              </>
            )}
          </div>
          <VideoRail locale="en" />
        </div>
      </div>
    </main>
  );
}
