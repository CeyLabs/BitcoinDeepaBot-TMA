import Parser from "rss-parser";
import sanitizeHtml from "sanitize-html";
import type { NewsArticle } from "@/lib/types";

const FEED_URL = "https://bitcoinmagazine.com/feed";

type FeedItem = {
    title?: string;
    link?: string;
    guid?: string;
    contentSnippet?: string;
    isoDate?: string;
    pubDate?: string;
    categories?: string[];
    contentEncoded?: string;
    content?: string;
    mediaContent?: { $: { url?: string } } | { $: { url?: string } }[];
    enclosure?: { url?: string };
};

const parser = new Parser<object, FeedItem>({
    customFields: {
        item: [
            ["content:encoded", "contentEncoded"],
            ["media:content", "mediaContent"],
        ],
    },
});

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: [
        "p",
        "img",
        "a",
        "h1",
        "h2",
        "h3",
        "h4",
        "ul",
        "ol",
        "li",
        "blockquote",
        "strong",
        "em",
        "b",
        "i",
        "br",
        "figure",
        "figcaption",
    ],
    allowedAttributes: {
        img: ["src", "alt"],
        a: ["href"],
    },
    transformTags: {
        a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
    },
};

function extractThumbnail(item: FeedItem): string | undefined {
    const media = Array.isArray(item.mediaContent) ? item.mediaContent[0] : item.mediaContent;
    if (media?.$.url) return media.$.url;
    if (item.enclosure?.url) return item.enclosure.url;

    const rawContent = item.contentEncoded ?? item.content ?? "";
    const match = rawContent.match(/<img[^>]+src="([^"]+)"/);
    return match?.[1];
}

// Bitcoin Magazine's content:encoded opens with a "Bitcoin Magazine" site link +
// re-embedded featured image (duplicating the thumbnail) up to this marker, embeds
// social/tweet blocks we can't render, and closes with a "first appeared on..." blurb.
function cleanArticleBody(rawContent: string): string {
    const afterHeader = rawContent.split('<div id="bsf_rt_marker"></div>').pop() ?? rawContent;

    return afterHeader
        .replace(/<figure[^>]*wp-block-embed[\s\S]*?<\/figure>/gi, "")
        .replace(/<p>This post[\s\S]*?first appeared on[\s\S]*?<\/p>\s*$/i, "")
        .trim();
}

function estimateReadTime(text: string): number {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

function toArticle(item: FeedItem, index: number): NewsArticle | null {
    if (!item.link || !item.title) return null;

    const rawContent = item.contentEncoded ?? item.content ?? "";
    const content = sanitizeHtml(cleanArticleBody(rawContent), SANITIZE_OPTIONS);
    const plainText = sanitizeHtml(content, { allowedTags: [] }).trim();

    return {
        id: encodeURIComponent(item.link),
        title: item.title,
        description: plainText.slice(0, 160),
        thumbnailUrl: extractThumbnail(item),
        category: item.categories?.[0] ?? "General",
        readTimeMinutes: estimateReadTime(plainText),
        publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        link: item.link,
        content,
        featured: index === 0,
    };
}

export async function getNewsArticles(): Promise<NewsArticle[]> {
    const response = await fetch(FEED_URL, { next: { revalidate: 900 } });
    if (!response.ok) return [];

    const xml = await response.text();
    const feed = await parser.parseString(xml);

    const items = (feed.items ?? [])
        .slice()
        .sort((a, b) => {
            const aTime = new Date(a.isoDate ?? a.pubDate ?? 0).getTime();
            const bTime = new Date(b.isoDate ?? b.pubDate ?? 0).getTime();
            return bTime - aTime;
        });

    return items
        .map((item, index) => toArticle(item, index))
        .filter((article): article is NewsArticle => article !== null);
}
