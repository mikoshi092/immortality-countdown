import { listArticles } from "@/data/articles";
import { buildNewsRss } from "@/lib/rss";

export function GET() {
  const xml = buildNewsRss("en", listArticles());
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
