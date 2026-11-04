import NewsRow from "@/components/calm/NewsRow";
import type { NewsRowData } from "@/lib/news-rows";
import type { SiteLocale } from "@/lib/locale";

/**
 * A vertical stack of framed news cards (each row is its own card; see
 * NewsRow). An optional footnote sits under the cards (the mock's
 * badge/bar legend).
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
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <NewsRow key={row.key} row={row} locale={locale} />
      ))}
      {note ? <p className="px-1 pt-1 text-[0.8rem] text-[#4a5878]">{note}</p> : null}
    </div>
  );
}
