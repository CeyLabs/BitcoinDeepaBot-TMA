import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { NewsListSection } from "@/components/v2/dashboard/news/NewsListSection";
import { getNewsArticles } from "@/lib/news";
import type { NewsArticle } from "@/lib/types";

function NewsFeaturedCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/v2/dashboard/news/${article.id}`}
      className="relative flex w-full flex-col gap-4 overflow-hidden rounded-[20px] bg-[#fa7119] p-4"
    >
      <Image
        src="/icons/sparkle.svg"
        alt=""
        width={26}
        height={36}
        className="pointer-events-none absolute top-6 right-4 size-6 opacity-40"
      />
      <Image
        src="/icons/sparkle.svg"
        alt=""
        width={26}
        height={36}
        className="pointer-events-none absolute top-14 right-15 size-9 opacity-40"
      />

      <span className="w-fit rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-[#1b2027]">
        Featured
      </span>

      {article.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.thumbnailUrl} alt="" className="h-40 w-full rounded-[14px] object-cover" />
      )}

      <div className="flex flex-col gap-1.5">
        <h2 className="text-[18px] font-bold leading-6 text-white">{article.title}</h2>
        <p className="line-clamp-2 text-[13px] leading-4 text-white/85">{article.description}</p>
        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-white/85">
          <Clock size={13} />
          <span>{article.readTimeMinutes} min read</span>
          <span>·</span>
          <span>{article.category}</span>
        </div>
      </div>
    </Link>
  );
}

export default async function NewsV2Page() {
  const articles = await getNewsArticles();

  if (articles.length === 0) {
    return (
      <div className="flex w-full flex-col gap-5">
        <p className="py-8 text-center text-[14px] text-[#64748b]">
          Unable to load news right now.
        </p>
      </div>
    );
  }

  const [featured, ...rest] = articles;

  return (
    <div className="flex w-full flex-col gap-5">
      <NewsFeaturedCard article={featured} />
      <NewsListSection articles={rest} />
    </div>
  );
}
