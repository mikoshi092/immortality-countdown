import NewsRow from "@/components/calm/NewsRow";
import type { NewsRowData } from "@/lib/news-rows";
import type { SiteLocale } from "@/lib/locale";

/**
 * The white card that wraps realtime-chart-style rows on the calm pages.
 * An optional footnote sits under the rows (the mock's badge/bar legend).
 */
export default function RtNewsList({
  rows,
  locale,
  note,
}: {
  rows: NewsRowData[];
  locale: SiteLocale;
  note?: string;
}) {
  return (
    <div className="rounded-[18px] bg-white px-5 py-[10px] shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
      {rows.map((row) => (
        <NewsRow key={row.key} row={row} locale={locale} />
      ))}
      {note ? <p className="py-3 text-[0.8rem] text-[#4a5878]">{note}</p> : null}
    </div>
  );
}
