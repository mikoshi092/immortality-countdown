import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, PUBLISHER } from "@/lib/site";
import { countdown } from "@/lib/countdown";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * The hero wordmark and the giant countdown numeral both use `font-serif`,
 * but no serif was ever loaded — Tailwind's default stack meant the site's
 * single most recognisable element rendered as Georgia on macOS, Times New
 * Roman on Windows and Liberation Serif on Android. Now it is one typeface
 * everywhere.
 */
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = SITE_URL;
const title = "Immortality Countdown | Tracking Longevity Escape Velocity";
const description =
  "A conservative, evidence-based estimate of when medical technology may begin to outrun aging, with transparent methodology and longevity research updates.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Immortality Countdown",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Dataset markup is the underused win here: this site publishes a
 * versioned, reproducible dataset (lev/params.json + forecast.json), which
 * makes it eligible for Google Dataset Search — a surface with almost no
 * competition in this topic. Person/publisher markup covers E-E-A-T.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: SITE_NAME,
      url: siteUrl,
      description,
      publisher: { "@id": `${siteUrl}/#publisher` },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#publisher`,
      name: PUBLISHER.name,
      url: PUBLISHER.url,
      image: `${siteUrl}${PUBLISHER.photo}`,
      jobTitle: PUBLISHER.jobTitle,
      // Ties this name to profiles Google has already indexed. Without it,
      // "Taketoki Fujita" is just a string on a page.
      sameAs: PUBLISHER.sameAs,
    },
    {
      "@type": "Dataset",
      "@id": `${siteUrl}/#dataset`,
      name: "Longevity Escape Velocity readiness index",
      description:
        "Readiness scores across eight longevity research fields plus a regulatory-readiness gate, with a reproducible Monte Carlo forecast of when remaining healthy life expectancy grows by one year per calendar year.",
      url: `${siteUrl}/model`,
      license: "https://creativecommons.org/licenses/by/4.0/",
      creator: { "@id": `${siteUrl}/#publisher` },
      version: countdown.paramsVersion,
      isAccessibleForFree: true,
      keywords: [
        "longevity escape velocity",
        "aging",
        "healthspan",
        "geroscience",
        "technology readiness",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
