import { FOCUS_RING } from "@/lib/nav";
import { relativeTimeEn, relativeTimeJa, type NewsRowData } from "@/lib/news-rows";
import type { SiteLocale } from "@/lib/locale";

/**
 * One wire-service-style news item (owner-approved specimen C,
 * 2026-11-06): no card, no frame — a plain muted hours badge on the
 * left (NEW! under 12 hours, NEWS otherwise), the meta line (field
 * name as plain text, source name, relative time) ABOVE the headline
 * in classic wire order, the headline as the link to the original
 * article, and a square flat attention bar when a signal exists. Rows
 * are separated by the thin rules of the parent list (RtNewsList), so
 * the zone reads as a bulletin feed rather than framed main content.
 * Shared by the top pages and the news index pages.
 */
export default function NewsRow({ row, locale }: { row: NewsRowData; locale: SiteLocale }) {
  const relativeTime = locale === "ja" ? relativeTimeJa(row.hours) : relativeTimeEn(row.hours);
  return (
    <div className="flex gap-[10px] px-[2px] pb-3 pt-[11px]">
      <div className="w-[38px] shrink-0 self-start text-center text-[0.6rem] font-extrabold leading-[1.3] text-[#8b94a5] [font-variant-numeric:tabular-nums]">
        <span className="block pt-1">{row.isNew ? "NEW!" : "NEWS"}</span>
        <b className="mt-[3px] block pb-[3px] pt-[2px] text-[0.95rem]">{row.hours}</b>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-[3px] flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] text-[#5a6579] [font-variant-numeric:tabular-nums]">
          <span className="inline-block whitespace-nowrap text-[0.72rem] font-semibold text-[#5a6579]">
            {row.fieldLabel}
          </span>
          <span>
            {row.sourceLabel} ・ {relativeTime}
          </span>
        </div>
        <a
          href={row.href}
          {...(row.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={`block text-[0.94rem] font-semibold leading-[1.5] text-[#1d2739] transition-colors hover:text-[#e8502f] hover:underline ${FOCUS_RING}`}
        >
          {row.headline}
        </a>
        {row.attentionPct !== null ? (
          <div className="mt-[7px] flex items-center gap-2">
            <div
              className="h-[7px] w-[130px] overflow-hidden bg-[#c9c9c9]"
              role="img"
              aria-label={
                locale === "ja" ? `注目度 ${row.attentionPct}%` : `Attention ${row.attentionPct}%`
              }
            >
              <div className="h-full bg-[#d9704a]" style={{ width: `${row.attentionPct}%` }} />
            </div>
            <span className="text-[0.7rem] font-bold text-[#5a6579] [font-variant-numeric:tabular-nums]">
              {locale === "ja" ? `注目度 ${row.attentionPct}%` : `Attention ${row.attentionPct}%`}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
