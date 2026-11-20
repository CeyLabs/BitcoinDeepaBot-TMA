"use client";

import { cn } from "cn";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/** Centered page heading with an optional small grey line under it. */
export function PageTitle({ title, subtitle, className }: PageTitleProps) {
  return (
    <div className={cn("flex w-full flex-col items-center gap-0.5 text-center", className)}>
      <h1 className="text-[24px] leading-7">{title}</h1>
      {subtitle && <p className="text-ink2 max-w-[300px] text-[12px] leading-4">{subtitle}</p>}
    </div>
  );
}
