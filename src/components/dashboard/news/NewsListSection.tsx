"use client";

import { useMemo, useState } from "react";
import { Chip, ChipRow } from "@/components/ui/chip";
import { Section } from "@/components/ui/section";
import { NewsArticleCard } from "@/components/dashboard/news/NewsArticleCard";
import { haptic } from "@/platform";
import type { NewsArticle } from "@/lib/types";

export interface NewsListSectionProps {
  articles: NewsArticle[];
}

const MAX_CATEGORIES = 3;

/** Category chips + the article list under the featured card. */
export function NewsListSection({ articles }: NewsListSectionProps) {
  const [category, setCategory] = useState("All");

  const topCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const article of articles) {
      counts.set(article.category, (counts.get(article.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_CATEGORIES)
      .map(([name]) => name);
  }, [articles]);

  const filtered = useMemo(
    () => (category === "All" ? articles : articles.filter((a) => a.category === category)),
    [articles, category]
  );

  return (
    <>
      <ChipRow label="Filter articles">
        {["All", ...topCategories].map((tab) => (
          <Chip
            key={tab}
            active={category === tab}
            onClick={() => {
              haptic.select();
              setCategory(tab);
            }}
          >
            {tab}
          </Chip>
        ))}
      </ChipRow>

      <Section
        title={
          <>
            News <span className="text-ink3 font-normal">· Stay updated with the latest</span>
          </>
        }
      >
        {filtered.length === 0 ? (
          <p className="text-ink3 py-8 text-center text-[14px]">No articles found.</p>
        ) : (
          <div className="flex w-full flex-col gap-3">
            {filtered.map((article) => (
              <NewsArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
