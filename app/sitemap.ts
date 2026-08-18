import type { MetadataRoute } from "next";
import { fieldProgress } from "@/data/fields";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://immortalitycountdown.com",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://immortalitycountdown.com/fields",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...fieldProgress.map((field) => ({
      url: `https://immortalitycountdown.com/fields/${field.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
