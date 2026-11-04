"use client";

import { useState } from "react";
import { FOCUS_RING } from "@/lib/nav";
import type { SiteLocale } from "@/lib/locale";

/**
 * Related-videos rail for the news pages (approved news mock): a fixed
 * set of the most-watched longevity classics. The ID/title pairings were
 * verified against YouTube oEmbed by the owner on 2026-11-04 — do not
 * re-pair them. The Bryan Johnson additions were verified against their
 * youtube.com watch pages and YouTube search results (title, channel,
 * view counts) on 2026-11-04. Each video is a click-to-play thumbnail
 * facade: only the thumbnail image loads up front, and the YouTube
 * iframe is created on click, keeping the page light.
 */
const VIDEOS = [
  {
    id: "GoJsr4IwCm4",
    title: "Why Age? Should We End Aging Forever?",
    channel: "Kurzgesagt – In a Nutshell",
    viewsJa: "約840万回再生",
    viewsEn: "~8.4M views",
  },
  {
    id: "MjdpR-TY6QU",
    title: "How to Cure Aging – During Your Lifetime?",
    channel: "Kurzgesagt – In a Nutshell",
    viewsJa: "約750万回再生",
    viewsEn: "~7.5M views",
  },
  {
    id: "C25qzDhGLx8",
    title: "Don't Be the Last Person to Die",
    channel: "CGP Grey",
    viewsJa: "約700万回再生",
    viewsEn: "~7M views",
  },
  {
    id: "in9ubCilsT8",
    title: "How I Fixed My Terrible Posture - 5 Habits",
    channel: "Bryan Johnson",
    viewsJa: "約540万回再生",
    viewsEn: "~5.4M views",
  },
  {
    id: "pSkfk_Snygo",
    title: "Before and After My $2m Anti-Aging Routine",
    channel: "Bryan Johnson",
    viewsJa: "約160万回再生",
    viewsEn: "~1.6M views",
  },
] as const;

export default function VideoRail({ locale }: { locale: SiteLocale }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const ja = locale === "ja";

  return (
    <aside className="rounded-[18px] border-[3px] border-[#7d97bd] bg-white p-[18px] shadow-[0_1px_6px_rgba(35,50,82,0.06)]">
      <h2 className="mb-[14px] text-[1.05rem] font-extrabold text-[#233252]">
        {ja ? "🎬 関連動画（再生数の多い定番）" : "🎬 Related videos (most-watched classics)"}
      </h2>
      {VIDEOS.map((video) => (
        <div key={video.id} className="mb-[18px] last:mb-0">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
            {playingId === video.id ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                title={`${video.channel}: ${video.title}`}
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlayingId(video.id)}
                aria-label={
                  ja
                    ? `動画を再生: ${video.channel} ${video.title}`
                    : `Play video: ${video.channel} ${video.title}`
                }
                className={`group block h-full w-full ${FOCUS_RING}`}
              >
                {/* Plain <img>: remote YouTube thumbnail for a click-to-play
                    facade; next/image would need remotePatterns config for
                    zero benefit at this size. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                  alt={`${video.channel}: ${video.title}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
                  <span className="flex h-12 w-[68px] items-center justify-center rounded-xl bg-[#e8502f]/95 text-[1.1rem] text-white shadow">
                    ▶
                  </span>
                </span>
              </button>
            )}
          </div>
          <p className="mt-2 text-[0.88rem] font-bold leading-[1.5] text-[#233252]">{video.title}</p>
          <p className="text-[0.78rem] text-[#4a5878]">
            {video.channel} ・ {ja ? video.viewsJa : video.viewsEn}
          </p>
        </div>
      ))}
      <p className="mt-2 text-[0.78rem] leading-[1.6] text-[#4a5878]">
        {ja
          ? "再生数の多い定番動画に固定し、たまにだけ入れ替えます。サムネイルだけを先に読み込む作りで、ページは軽いままです（クリックで再生）。"
          : "A fixed set of the most-watched classics, swapped only occasionally. Only thumbnails load up front, so the page stays light — click to play."}
      </p>
    </aside>
  );
}
