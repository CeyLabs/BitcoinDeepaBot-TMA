"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path fillRule="evenodd" clipRule="evenodd" d="M14.1566 4.23421C16.2791 4.23421 17.9999 5.87625 18 7.90154V14.3327C17.9997 16.3578 16.2791 18 14.1566 18H8.14155C6.01906 18 4.29841 16.3578 4.29812 14.3327V7.90154C4.29827 5.87625 6.01898 4.23421 8.14155 4.23421H14.1566ZM8.14155 5.28202C6.62545 5.28202 5.39639 6.45494 5.39625 7.90154V14.3327C5.39654 15.7792 6.62554 16.9522 8.14155 16.9522H14.1566C15.6726 16.9522 16.9016 15.7792 16.9019 14.3327V7.90154C16.9017 6.45494 15.6727 5.28202 14.1566 5.28202H8.14155Z" fill="#1B2027"/>
    <path d="M9.85844 0C11.9809 0.000138229 13.7017 1.64212 13.7019 3.66733V3.73896H12.6038V3.66733C12.6036 2.22081 11.3744 1.04795 9.85844 1.04781H3.84343C2.32733 1.04781 1.09827 2.22073 1.09812 3.66733V10.3717C1.09816 11.6672 2.19933 12.718 3.5571 12.718V13.7658C1.59285 13.7658 3.6222e-05 12.2459 0 10.3717V3.66733C0.000145034 1.64204 1.72085 1.35006e-07 3.84343 0H9.85844Z" fill="#1B2027"/>
  </svg>
);

interface CopyButtonProps {
  onCopy?: () => void;
  className?: string;
}

export function CopyButton({ onCopy, className }: CopyButtonProps) {
  return (
    <button
      onClick={onCopy}
      className={cn(
        "flex items-center justify-center size-9 rounded-[12px]",
        "bg-white border border-[#e2e8f0] transition-colors",
        "hover:bg-[#f8fafc] active:bg-[#f1f5f9]",
        className
      )}
    >
      <CopyIcon />
    </button>
  );
}

interface CopyFieldProps {
  value: string;
  className?: string;
  onCopy?: (value: string) => void;
}

export function CopyField({ value, className, onCopy }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(value);
    });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 flex items-center h-9 px-3 py-2 rounded-[8px] bg-white border border-[#e2e8f0] overflow-hidden">
        <p className="text-[14px] leading-[16px] text-[#1b2027] truncate">
          {copied ? "Copied!" : value}
        </p>
      </div>
      <CopyButton onCopy={handleCopy} />
    </div>
  );
}
