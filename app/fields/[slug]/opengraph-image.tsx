import { ImageResponse } from "next/og";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { fieldProgress } from "@/data/fields";
import { getFieldModel } from "@/lib/model-snapshot";

export const alt = "Field readiness";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Without this the image route is rendered on demand instead of being
// baked at build time alongside the page.
export function generateStaticParams() {
  return fieldProgress.map((field) => ({ slug: field.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const field = fieldProgress.find((item) => item.slug === slug);
  const score = field ? getFieldModel(field.slug).score : undefined;

  return new ImageResponse(
    ogCard({
      eyebrow: "Field readiness · Provisional",
      title: field?.name ?? "Eight Fields of Progress",
      figure: score != null ? String(score) : undefined,
      note: "Provisional readiness score out of 100",
    }),
    { ...size }
  );
}
