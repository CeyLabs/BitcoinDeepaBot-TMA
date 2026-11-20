import { Section } from "@/components/ui/section";
import { NewsFeaturedCard } from "@/components/dashboard/news/NewsFeaturedCard";
import { NewsListSection } from "@/components/dashboard/news/NewsListSection";
import { getNewsArticles } from "@/lib/news";

export const revalidate = 900;

export default async function NewsPage() {
  const articles = await getNewsArticles();
  const [featured, ...rest] = articles;

  return (
    <div className="flex w-full flex-col gap-5">
      {!featured ? (
        <p className="text-ink3 py-8 text-center text-[14px]">Unable to load news right now.</p>
      ) : (
        <>
          <Section title="Featured">
            <NewsFeaturedCard article={featured} />
          </Section>
          <NewsListSection articles={rest} />
        </>
      )}
    </div>
  );
}
