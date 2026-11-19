"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import { Emoji } from "@/components/ui/emoji";
import { NewsImage } from "@/components/dashboard/news/NewsImage";
import { fmtRelativeDays } from "@/lib/formatters";
import { Section } from "@/components/ui/section";
import { haptic } from "@/platform";

export interface NewsHighlight {
  id: string;
  title: string;
  thumbnailUrl?: string;
  category: string;
  readTimeMinutes: number;
  publishedAt: string;
}

const CHEVRON = (
  <svg
    className="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/** Swipeable latest-news cards on the wallet, with "See all" to the News page. */
export function NewsCarousel({ items }: { items: NewsHighlight[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (items.length === 0) return null;

  return (
    <Section
      title="News"
      action={
        <Link
          href="/dashboard/news"
          onClick={() => haptic.select()}
          className="press text-link inline-flex min-h-8 items-center gap-1 rounded-xl px-1 text-[14px] font-bold"
        >
          See all
          {CHEVRON}
        </Link>
      }
    >
      <div className="relative">
        <div
          ref={trackRef}
          role="region"
          aria-label="News highlights"
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / (el.clientWidth + 8)));
          }}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-xl"
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/news/${item.id}`}
              aria-label={item.title}
              className="press relative block h-[180px] shrink-0 grow-0 basis-full snap-start overflow-hidden rounded-xl bg-[#f8931a] bg-[url('/bg/hero-orange.webp')] bg-cover bg-center text-white"
            >
              {/* Layers, bottom to top: photo, gradient, content. No negative z-index. */}
              {item.thumbnailUrl ? (
                <>
                  <NewsImage
                    src={item.thumbnailUrl}
                    width={408}
                    height={180}
                    className="absolute inset-0 size-full object-cover"
                  />
                  {/* Even tint (a touch darker at the top, behind the title) so white text reads on any photo. */}
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-black/45 bg-linear-to-b from-black/35 to-transparent"
                  />
                </>
              ) : (
                <Emoji src="/emoji/bitcoin.webp" size={84} className="absolute top-4 right-4" />
              )}
              <span className="absolute inset-0 flex flex-col justify-between gap-2 px-4 pt-4 pb-3">
                <span className="flex flex-col gap-1.5">
                  <span className="font-display line-clamp-2 text-[18px] leading-[22px] font-bold">
                    {item.title}
                  </span>
                  <span className="flex items-center justify-between gap-2 text-[13px] leading-4 font-semibold">
                    <span className="inline-flex items-center gap-0.5">
                      Read in News
                      {CHEVRON}
                    </span>
                    {/* Relative to now; the cached server HTML may be a few minutes older. */}
                    <span suppressHydrationWarning className="font-normal text-white/80">
                      {fmtRelativeDays(item.publishedAt)}
                    </span>
                  </span>
                </span>
                {/* Bottom-left; the carousel dots sit bottom-right on the same line. */}
                <span className="self-start rounded-lg border border-white/80 bg-black/25 px-2 py-1 text-[11px] leading-4 font-semibold">
                  {item.category} · {item.readTimeMinutes} min read
                </span>
              </span>
            </Link>
          ))}
        </div>
        {items.length > 1 && (
          <div
            aria-hidden
            className="pointer-events-none absolute right-4 bottom-[21px] flex justify-end gap-1.5"
          >
            {items.map((item, i) => (
              <i
                key={item.id}
                className={cn(
                  "h-1.5 rounded-[3px] transition-[width,background-color] duration-250",
                  i === index ? "w-[18px] bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

export function NewsCarouselSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <span className="skeleton h-4 w-12 rounded" />
      <span className="skeleton h-[180px] w-full rounded-xl" />
    </div>
  );
}
