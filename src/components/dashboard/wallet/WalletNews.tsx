import { getNewsArticles } from "@/lib/news";
import type { NewsArticle } from "@/lib/types";
import { NewsCarousel } from "./NewsCarousel";

/** Server part of the wallet news carousel: the latest four headlines. */
export async function WalletNews() {
  // The feed is optional on the wallet; the News page shows its own error.
  const articles: NewsArticle[] = await getNewsArticles().catch(() => []);
  return (
    <NewsCarousel
      items={articles
        .slice(0, 4)
        .map(({ id, title, thumbnailUrl, category, readTimeMinutes, publishedAt }) => ({
          id,
          title,
          thumbnailUrl,
          category,
          readTimeMinutes,
          publishedAt,
        }))}
    />
  );
}
