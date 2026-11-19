import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Emoji } from "@/components/ui/emoji";
import type { NewsArticle } from "@/lib/types";

/** The orange "Featured" card at the top of News (the latest article). */
export function NewsFeaturedCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/dashboard/news/${article.id}`}
      className="press bg-primary relative block w-full overflow-hidden rounded-[20px] bg-[url('/bg/hero-orange.webp')] bg-cover bg-center text-white"
    >
      <Emoji
        src="/emoji/bitcoin.webp"
        size={110}
        priority
        className="animate-floaty absolute top-5 right-2"
      />
      <span className="relative flex min-h-[150px] flex-col gap-1.5 py-[18px] pr-[124px] pl-[18px]">
        <Badge variant="onBrand" className="self-start">
          {article.category} · {article.readTimeMinutes} min read
        </Badge>
        <span className="font-display line-clamp-3 text-[20px] leading-6 font-bold">
          {article.title}
        </span>
        {article.description && (
          <span className="line-clamp-2 text-[14px] font-semibold">{article.description}</span>
        )}
      </span>
    </Link>
  );
}
