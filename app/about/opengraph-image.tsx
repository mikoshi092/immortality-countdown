import { ImageResponse } from "next/og";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { PUBLISHER } from "@/lib/site";

export const alt = `About ${PUBLISHER.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    ogCard({
      eyebrow: "About",
      title: "Who is behind this number",
      note: `${PUBLISHER.name} — a strategic investor, not a biologist. Every assumption published.`,
    }),
    { ...size }
  );
}
