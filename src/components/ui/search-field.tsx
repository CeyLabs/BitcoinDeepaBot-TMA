"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path fillRule="evenodd" clipRule="evenodd" d="M7.52291 0.00969389C11.3029 0.199771 14.3084 3.29683 14.3085 7.09011C14.3085 8.9433 13.59 10.6293 12.4154 11.8925L17.8988 17.4073C18.0337 17.543 18.0337 17.7631 17.8988 17.8988C17.7639 18.0343 17.545 18.0335 17.4102 17.8978L11.92 12.3762C10.6548 13.4973 8.98561 14.1801 7.15471 14.1802L6.78652 14.1715C3.00621 13.9818 0 10.8837 0 7.09011C5.78193e-05 3.17434 3.20348 0 7.15471 0L7.52291 0.00969389ZM7.15471 0.695052C3.57542 0.695052 0.691144 3.56772 0.691086 7.09011C0.691086 10.6126 3.57538 13.4852 7.15471 13.4852C10.7339 13.485 13.6183 10.6125 13.6183 7.09011C13.6183 3.56782 10.7339 0.695219 7.15471 0.695052Z" fill="#64748B"/>
  </svg>
);

export interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, placeholder = "Search", ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-1 h-9 px-3 py-2 rounded-2xl bg-white",
          className
        )}
      >
        <SearchIcon />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[14px] leading-[16px] text-[#1b2027] placeholder:text-[#cbd5e1] outline-hidden min-w-0"
          {...props}
        />
      </div>
    );
  }
);
SearchField.displayName = "SearchField";
