"use client";

import { cn } from "@/lib/cn";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageTitle({ title, subtitle, className }: PageTitleProps) {
  return (
    <div className={cn("flex w-full flex-col items-center gap-0", className)}>
      <h1 className="text-center text-[24px] leading-[26px] font-bold text-[#1b2027] dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-0.5 text-center text-[12px] leading-[16px] text-[#475569] dark:text-[#94a3b8]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
