"use client";

import { cn } from "@/lib/cn";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageTitle({ title, subtitle, className }: PageTitleProps) {
  return (
    <div className={cn("flex flex-col items-center gap-0 w-full", className)}>
      <h1 className="text-[24px] font-bold leading-[26px] text-[#1b2027] dark:text-white text-center">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[12px] leading-[16px] text-[#475569] dark:text-[#94a3b8] text-center mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}
