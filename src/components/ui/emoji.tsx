import Image from "next/image";
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
