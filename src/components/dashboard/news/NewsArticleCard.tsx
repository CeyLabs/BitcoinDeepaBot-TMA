import Link from "next/link";
import { cn } from "cn";
import { Emoji } from "@/components/ui/emoji";
import { NewsImage } from "@/components/dashboard/news/NewsImage";
import { NewsMeta } from "@/components/dashboard/news/NewsMeta";
import type { NewsArticle } from "@/lib/types";

/**
 * Article row: thumbnail tile | title, blurb, meta. `compact` is the smaller
 * related-articles variant (64px tile, no blurb).
 */
export function NewsArticleCard({
  article,
  compact = false,
}: {
  article: NewsArticle;
  compact?: boolean;
}) {
  const tile = compact ? 64 : 80;

  return (
    <Link
      href={`/dashboard/news/${article.id}`}
      className="press bg-card shadow-card flex w-full items-start gap-3 rounded-xl p-3"
    >
      <span
        className={cn(
          "bg-chip flex shrink-0 items-center justify-center overflow-hidden rounded-xl",
          compact ? "size-16" : "size-20"
        )}
      >
        {article.thumbnailUrl ? (
          <NewsImage
            src={article.thumbnailUrl}
            width={tile}
            height={tile}
            className="size-full object-cover"
          />
        ) : (
          <Emoji src="/emoji/bitcoin.webp" size={compact ? 40 : 48} />
        )}
      </span>

      <span className={cn("flex min-w-0 grow flex-col", compact ? "gap-1" : "gap-1.5")}>
        <span className="line-clamp-3 text-[16px] leading-5 font-bold">{article.title}</span>
        {!compact && article.description && (
          <span className="text-ink3 line-clamp-2 text-[13px] leading-[18px]">
            {article.description}
          </span>
        )}
        <NewsMeta parts={[`${article.readTimeMinutes} min read`, article.category]} />
      </span>
    </Link>
  );
}
