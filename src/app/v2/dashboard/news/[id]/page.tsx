import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { NewsDetailBackButton } from "@/components/v2/dashboard/news/NewsDetailBackButton";
import { NewsArticleCard } from "@/components/v2/dashboard/news/NewsListSection";
import { fmtShortDate } from "@/lib/formatters";
import { getNewsArticles } from "@/lib/news";

export default async function NewsArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articles = await getNewsArticles();
  // Next decodes the dynamic segment, so `id` is the plain article link here
  // even though NewsArticle.id is stored as an encoded string.
  const article = articles.find((a) => a.id === id || a.link === id);

  if (!article) notFound();

  const related = articles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  return (
    <div className="flex w-full flex-col gap-5">
      <NewsDetailBackButton />

      {article.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.thumbnailUrl}
          alt=""
          className="h-48 w-full rounded-[16px] object-cover"
        />
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-[22px] font-bold leading-7 text-[#1b2027] dark:text-white">
          {article.title}
        </h1>
        <div className="flex items-center gap-1.5 text-[13px] text-[#64748b] dark:text-[#94a3b8]">
          <Clock size={13} />
          <span>{article.readTimeMinutes} min read</span>
          <span>·</span>
          <span>{article.category}</span>
          <span>·</span>
          <span>{fmtShortDate(article.publishedAt)}</span>
        </div>
      </div>

      <div
        className="flex flex-col gap-3 text-[15px] leading-6 text-[#1b2027] [&_a]:text-[#fa7119] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#e2e8f0] [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mt-2 [&_h2]:text-[18px] [&_h2]:font-bold [&_h3]:mt-2 [&_h3]:text-[16px] [&_h3]:font-bold [&_img]:w-full [&_img]:rounded-[12px] [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc dark:text-white"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {related.length > 0 && (
        <div className="flex flex-col gap-3 pt-2">
          <div className="h-px w-full bg-[#e2e8f0] dark:bg-[#334155]" />
          <h2 className="text-[16px] font-bold leading-5 text-[#1b2027] dark:text-white">
            Related Articles
          </h2>
          <div className="flex w-full flex-col gap-3">
            {related.map((a) => (
              <NewsArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
