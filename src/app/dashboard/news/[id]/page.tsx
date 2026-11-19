import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Emoji } from "@/components/ui/emoji";
import { Section } from "@/components/ui/section";
import { NewsHeader } from "@/components/dashboard/news/NewsHeader";
import { NewsImage } from "@/components/dashboard/news/NewsImage";
import { NewsArticleCard } from "@/components/dashboard/news/NewsArticleCard";
import { fmtShortDate } from "@/lib/formatters";
import { getNewsArticles } from "@/lib/news";

export const revalidate = 900;

const RELATED_COUNT = 2;

// Typography for the feed's sanitized HTML (p, h1–h4, lists, quotes, images, links).
const BODY_CLASS = [
  "flex flex-col gap-4 text-[16px] leading-[1.7] break-words",
  "[&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h4]:font-display",
  "[&_h1]:mt-2 [&_h2]:mt-2 [&_h3]:mt-2 [&_h4]:mt-1",
  "[&_h1]:text-[20px] [&_h2]:text-[18px] [&_h3]:text-[18px] [&_h4]:text-[16px]",
  "[&_h1]:leading-6 [&_h2]:leading-6 [&_h3]:leading-6 [&_h4]:leading-5 [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_h4]:font-bold",
  "[&_a]:text-link [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2",
  "[&_strong]:font-bold [&_b]:font-bold",
  "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mt-1",
  "[&_blockquote]:border-line [&_blockquote]:text-ink2 [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:italic",
  "[&_img]:h-auto [&_img]:w-full [&_img]:rounded-xl",
  "[&_figure]:flex [&_figure]:flex-col [&_figure]:gap-1.5",
  "[&_figcaption]:text-ink3 [&_figcaption]:text-[13px] [&_figcaption]:leading-[18px]",
].join(" ");

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

  // Same category first, topped up with the latest others.
  const others = articles.filter((a) => a.id !== article.id);
  const related = [
    ...others.filter((a) => a.category === article.category),
    ...others.filter((a) => a.category !== article.category),
  ].slice(0, RELATED_COUNT);

  return (
    <article aria-label={article.title} className="flex w-full flex-col gap-5">
      <NewsHeader backTo="/dashboard/news" />

      <div className="bg-primary flex h-[170px] items-center justify-center overflow-hidden rounded-xl">
        {article.thumbnailUrl ? (
          <NewsImage
            src={article.thumbnailUrl}
            width={408}
            height={170}
            className="size-full object-cover"
          />
        ) : (
          <Emoji src="/emoji/bitcoin.webp" size={110} priority className="animate-pop" />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{article.category}</Badge>
          <span className="text-ink3 text-[13px] font-semibold">
            {article.readTimeMinutes} min read · {fmtShortDate(article.publishedAt)}
          </span>
        </div>
        <h1 className="text-[26px] leading-8">{article.title}</h1>
        <div className={BODY_CLASS} dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      {related.length > 0 && (
        <Section title="Related articles">
          <div className="flex w-full flex-col gap-3">
            {related.map((a) => (
              <NewsArticleCard key={a.id} article={a} compact />
            ))}
          </div>
        </Section>
      )}
    </article>
  );
}
