import { ImageResponse } from "next/og";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { fieldProgress } from "@/data/fields";

export const alt = "The Eight Fields of Progress";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    ogCard({
      eyebrow: "Eight fields · Provisional",
      title: "The Eight Fields of Progress",
      note: `Escape velocity is not one breakthrough. It is ${fieldProgress.length} fields advancing together.`,
    }),
    { ...size }
  );
}
