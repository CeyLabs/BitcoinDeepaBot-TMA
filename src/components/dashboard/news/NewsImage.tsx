/* eslint-disable @next/next/no-img-element */
import Image from "next/image";

// Keep in sync with images.remotePatterns in next.config.mjs.
const OPTIMIZED_HOSTS = new Set(["bitcoinmagazine.com", "img.youtube.com"]);

interface NewsImageProps {
  src: string;
  /** Rendered size in CSS px (used to pick the resized variant). */
  width: number;
  height: number;
  className?: string;
}

/**
 * Feed images are full-size originals (~200 KB) shown small. Known hosts go
 * through the Next.js image optimizer (resized WebP at the displayed size);
 * anything else falls back to a plain lazy <img> so a new host can't break
 * the page. Always lazy, never preloaded: a preload hint here would be picked
 * up by the bottom-nav prefetch and download on every tab.
 */
export function NewsImage({ src, width, height, className }: NewsImageProps) {
  let host = "";
  try {
    host = new URL(src).hostname;
  } catch {
    // relative or malformed — use the fallback
  }

  if (OPTIMIZED_HOSTS.has(host)) {
    return (
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        sizes={`${width}px`}
        loading="lazy"
        className={className}
      />
    );
  }

  return <img src={src} alt="" loading="lazy" decoding="async" className={className} />;
}
