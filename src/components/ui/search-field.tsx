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
          "flex items-center gap-1 h-9 px-3 py-2 rounded-2xl bg-white dark:bg-[#0B0F14]",
          className
        )}
      >
        <Search size={18} strokeWidth={1.75} className="shrink-0 text-[#64748b]" />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm leading-4 text-[#1b2027] placeholder:text-[#cbd5e1] dark:text-[#f1f5f9] dark:placeholder:text-[#475569] outline-hidden min-w-0"
          {...props}
        />
      </div>
    );
  }
);
SearchField.displayName = "SearchField";
