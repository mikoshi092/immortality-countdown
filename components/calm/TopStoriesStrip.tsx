import type { Article } from "@/data/articles";
import { FOCUS_RING } from "@/lib/nav";
import { topStoryRows } from "@/lib/news-rows";
import type { SiteLocale } from "@/lib/locale";

/**
 * 本日の注目ニュース strip (owner-approved specimen C, 2026-11-06): a
 * flat matte-gray band directly below the blue header band — never
 * inside it — holding the top 3 articles by attention, then recency.
 * The news zone deliberately reads as a wire-service bulletin board
 * (square corners, thin rules, no frames or shadows) so it is never
 * mistaken for the site's framed main content. The label keeps its red
 * but no longer blinks. Renders nothing when no general-media article
 * is published yet (see the display policy in lib/news-rows.ts).
 */
export default function TopStoriesStrip({
  articles,
  locale,
  now,
}: {
  articles: readonly Article[];
  locale: SiteLocale;
  now: Date;
}) {
  const rows = topStoryRows(articles, locale, now, 3);
  if (rows.length === 0) return null;
  return (
    <div className="mt-[18px] bg-[#ededed] px-4 pb-2 pt-[14px]">
      <span className="mb-[2px] block border-b-2 border-[#233252] pb-[7px] text-[0.92rem] font-extrabold text-[#e8502f]">
        {locale === "ja" ? "📣 本日の注目ニュース" : "📣 Today's top stories"}
      </span>
      <ul className="list-none p-0">
        {rows.map((row, index) => (
          <li
            key={row.key}
            className={`px-[2px] py-2 text-[0.92rem] ${
              index < rows.length - 1 ? "border-b border-[#cfcfcf]" : ""
            }`}
          >
            <a
              href={row.href}
              {...(row.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`font-semibold leading-[1.5] text-[#233252] transition-colors hover:text-[#e8502f] hover:underline ${FOCUS_RING}`}
            >
              {row.headline}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
