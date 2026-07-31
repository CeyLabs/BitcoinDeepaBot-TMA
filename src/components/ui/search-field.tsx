"use client";

import { forwardRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, placeholder = "Search", ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-9 items-center gap-1 rounded-2xl bg-white px-3 py-2 dark:bg-[#0B0F14]",
          className
        )}
      >
        <Search size={18} strokeWidth={1.75} className="shrink-0 text-[#64748b]" />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm leading-4 text-[#1b2027] outline-hidden placeholder:text-[#cbd5e1] dark:text-[#f1f5f9] dark:placeholder:text-[#475569]"
          {...props}
        />
      </div>
    );
  }
);
SearchField.displayName = "SearchField";
