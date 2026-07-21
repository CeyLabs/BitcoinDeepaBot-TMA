"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@telegram-apps/telegram-ui";
import { cn } from "@/lib/cn";
import type { NewsArticle } from "@/lib/types";

export function NewsArticleCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/v2/dashboard/news/${article.id}`}
      className="flex w-full items-start gap-3 rounded-[16px] bg-white p-3 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] dark:bg-[#0B0F14]"
    >
      {article.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.thumbnailUrl} alt="" className="size-20 shrink-0 rounded-[12px] object-cover" />
      ) : (
        <div className="size-20 shrink-0 rounded-[12px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="text-[16px] font-bold leading-5 text-[#1b2027] dark:text-white">
          {article.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[12px] text-[#64748b] dark:text-[#94a3b8]">
          <Clock size={12} />
          <span>{article.readTimeMinutes} min read</span>
          <span>·</span>
          <span>{article.category}</span>
        </div>
      </div>
    </Link>
  );
}

export interface NewsListSectionProps {
  articles: NewsArticle[];
}

const MAX_CATEGORIES = 3;

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
    <div className="flex w-full flex-col gap-4">
      <div className="w-full overflow-x-auto scrollbar-none">
        <div className="flex w-max items-center gap-2">
          {["All", ...topCategories].map((tab) => {
            const isActive = category === tab;

            return (
              <Button
                key={tab}
                mode="gray"
                size="s"
                onClick={() => setCategory(tab)}
                style={{ "--tgui--button--hovered-opacity": 0 } as React.CSSProperties}
                className={cn(
                  "rounded-[12px]! whitespace-nowrap!",
                  isActive
                    ? "bg-surface-gift! text-white!"
                    : "bg-white! text-[#1b2027]! dark:bg-[#0B0F14]! dark:text-[#f1f5f9]!"
                )}
              >
                <span className="text-[14px] font-medium">{tab}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-[14px] text-[#64748b]">No articles found.</p>
      ) : (
        <div className="flex w-full flex-col gap-3">
          {filtered.map((article) => (
            <NewsArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
