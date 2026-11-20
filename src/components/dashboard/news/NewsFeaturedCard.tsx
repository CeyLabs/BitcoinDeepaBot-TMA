import Link from "next/link";
import { Emoji } from "@/components/ui/emoji";
import { NewsImage } from "@/components/dashboard/news/NewsImage";
import { NewsMeta } from "@/components/dashboard/news/NewsMeta";
import type { NewsArticle } from "@/lib/types";

/**
 * The orange "Featured" card at the top of News (the latest article). Shows the
 * article's image when it has one, else the floating bitcoin emoji.
 */
export function NewsFeaturedCard({ article }: { article: NewsArticle }) {
  const hasImage = Boolean(article.thumbnailUrl);

  return (
    <Link
      href={`/dashboard/news/${article.id}`}
      className="press bg-primary relative block w-full overflow-hidden rounded-[20px] bg-[url('/bg/hero-orange.webp')] bg-cover bg-center text-white"
    >
      {!hasImage && (
        <Emoji
          src="/emoji/bitcoin.webp"
          size={110}
          priority
          className="animate-floaty absolute top-5 right-2"
        />
      )}
      <span
        className={
          hasImage
            ? "relative flex flex-col gap-1.5 p-[18px]"
            : "relative flex min-h-[150px] flex-col gap-1.5 py-[18px] pr-[124px] pl-[18px]"
        }
      >
        {article.thumbnailUrl && (
          <span className="mb-1.5 block h-40 w-full overflow-hidden rounded-[14px] bg-white/15">
            <NewsImage
              src={article.thumbnailUrl}
              width={372}
              height={160}
              className="size-full object-cover"
            />
          </span>
        )}
        <span className="font-display line-clamp-3 text-[20px] leading-6 font-bold">
          {article.title}
        </span>
        {article.description && (
          <span className="line-clamp-2 text-[14px] text-white/85">{article.description}</span>
        )}
        <NewsMeta
          parts={[`${article.readTimeMinutes} min read`, article.category]}
          className="mt-1.5 text-white/85"
        />
      </span>
    </Link>
  );
}
