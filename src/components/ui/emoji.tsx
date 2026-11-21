import Image, { getImageProps } from "next/image";
import { cn } from "cn";

/** 3D emoji illustration from /public/emoji (36px by default). */
export function Emoji({
  src,
  size = 36,
  className,
  priority,
}: {
  src: string;
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Fetch an emoji into the browser cache ahead of time, at the exact optimizer URLs
 * (`/_next/image?url=…&w=…`) that `<Emoji size={size}>` will request, so it shows instantly
 * when it mounts. The browser picks the same 1x/2x candidate it would for the real image.
 */
export function preloadEmoji(src: string, size = 36) {
  const { props } = getImageProps({ src, alt: "", width: size, height: size });
  const img = new window.Image();
  img.decoding = "async";
  if (props.srcSet) img.srcset = props.srcSet;
  img.src = props.src;
}
