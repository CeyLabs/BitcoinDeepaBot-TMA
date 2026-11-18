"use client";

import { useState } from "react";
import { cn } from "cn";

interface AvatarProps {
  src?: string;
  /** Initials shown when there's no image (or it fails to load). */
  acronym?: string;
  size?: 28 | 40 | 72;
  className?: string;
  alt?: string;
}

/** Round user image with an initials fallback. */
export function Avatar({ src, acronym, size = 40, className, alt = "" }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "bg-tertiary relative flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-[0_0_0_1px_var(--outline)]",
        className
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        acronym && (
          <span
            className={cn(
              "uppercase",
              size === 72
                ? "text-[30px] leading-9 font-semibold"
                : size === 40
                  ? "text-[19px] leading-7 font-semibold"
                  : "text-[13px] leading-5 font-bold"
            )}
          >
            {acronym}
          </span>
        )
      )}
    </div>
  );
}

/** Overlapping row of avatars. */
export function AvatarStack({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("flex [&>*:not(:first-child)]:-ml-3", className)}>{children}</div>;
}
