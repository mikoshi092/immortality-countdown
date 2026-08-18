import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MobileHeader from "@/components/MobileHeader";
import BetaBanner from "@/components/BetaBanner";
import { fieldProgress } from "@/data/fields";

const FOCUS_RING =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f766d]";

export function generateStaticParams() {
  return fieldProgress.map((field) => ({ slug: field.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const field = fieldProgress.find((item) => item.slug === slug);
  if (!field) return {};

  return {
    title: `${field.name} | Eight Fields | Immortality Countdown`,
    description: field.description,
    alternates: {
      canonical: `/fields/${field.slug}`,
    },
  };
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 sm:mt-12">
      <h2 className="text-lg font-semibold text-[#17202a] sm:text-xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-base leading-7 text-[#17202a]/70">
        {children}
      </div>
    </section>
  );
}

function InlineText({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function Paragraphs({ text }: { text: string }) {
  return text.split(/\n\n+/).map((paragraph) => (
    <p key={paragraph}>
      <InlineText text={paragraph} />
    </p>
  ));
}

export default async function FieldDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = fieldProgress.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();

  const field = fieldProgress[index];
  const prev =
    fieldProgress[(index - 1 + fieldProgress.length) % fieldProgress.length];
  const next = fieldProgress[(index + 1) % fieldProgress.length];

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#17202a]">
      <MobileHeader />
      <BetaBanner />

      <article className="px-5 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20">
        <div className="mx-auto max-w-3xl">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#17202a]/60"
          >
            <Link href="/" className={`font-medium hover:text-[#17202a] ${FOCUS_RING}`}>
              Dashboard
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/fields" className={`font-medium hover:text-[#17202a] ${FOCUS_RING}`}>
              Eight Fields
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#17202a]/40">{field.name}</span>
          </nav>

          <Link
            href="/fields"
            className={`mt-6 inline-block text-sm font-medium text-[#17202a]/60 transition-colors hover:text-[#17202a] ${FOCUS_RING}`}
          >
            ← All eight fields
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#2f766d] sm:text-sm">
            Field {index + 1} of {fieldProgress.length} · Provisional
          </p>

          <h1 className="mt-3 font-serif text-3xl leading-[1.05] tracking-[-0.03em] text-[#17202a] sm:text-4xl">
            {field.name}
          </h1>

          <p className="mt-4 text-lg leading-8 text-[#17202a]/70">
            {field.description}
          </p>

          {field.status === "provisional" ? (
            <p className="mt-4 text-sm font-semibold text-[#2f766d]">
              Provisional score: {field.score} / 100
            </p>
          ) : (
            <span className="mt-4 inline-block rounded-full border border-black/15 bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#17202a]/55">
              Score pending
            </span>
          )}

          <Section title="The Gist">
            <Paragraphs text={field.plainEnglish} />
          </Section>

          <Section title="Why It Matters for LEV">
            <Paragraphs text={field.whyItMatters} />
          </Section>

          <Section title="Signals We Track">
            <ul className="list-disc space-y-1.5 pl-5">
              {field.whatWeTrack.map((item) => (
                <li key={item}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="What Does Not Move the Assessment">
            <ul className="list-disc space-y-1.5 pl-5">
              {field.whatDoesNotCount.map((item) => (
                <li key={item}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Key Hurdles">
            <ul className="list-disc space-y-1.5 pl-5">
              {field.bottlenecks.map((item) => (
                <li key={item}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Current Provisional Assessment">
            <Paragraphs text={field.scoringNote} />
          </Section>

          <Section title="Reality Check">
            <Paragraphs text={field.limitations} />
          </Section>

          <div className="mt-12 grid gap-3 border-t border-black/10 pt-6 sm:grid-cols-2">
            <Link
              href={`/fields/${prev.slug}`}
              className={`rounded-lg border border-black/10 bg-white p-3 text-sm shadow-sm ${FOCUS_RING}`}
            >
              <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/40">
                ← Previous field
              </span>
              <span className="mt-1 block font-semibold text-[#17202a]">
                {prev.name}
              </span>
            </Link>
            <Link
              href={`/fields/${next.slug}`}
              className={`rounded-lg border border-black/10 bg-white p-3 text-right text-sm shadow-sm ${FOCUS_RING}`}
            >
              <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#17202a]/40">
                Next field →
              </span>
              <span className="mt-1 block font-semibold text-[#17202a]">
                {next.name}
              </span>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/fields" className={`font-semibold text-[#2f766d] ${FOCUS_RING}`}>
              All eight fields →
            </Link>
            <Link href="/methodology" className={`font-semibold text-[#2f766d] ${FOCUS_RING}`}>
              Methodology →
            </Link>
            <Link href="/" className={`font-semibold text-[#2f766d] ${FOCUS_RING}`}>
              Dashboard →
            </Link>
          </div>

          <p className="mt-10 border-t border-black/10 pt-6 text-sm text-[#17202a]/50">
            For informational purposes only. Not medical advice.
          </p>
        </div>
      </article>
    </main>
  );
}
