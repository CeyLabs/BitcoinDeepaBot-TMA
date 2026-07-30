"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: "default" | "active" | "disabled";
  label?: string;
  error?: string;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, state = "default", label, error, disabled, ...props }, ref) => {
    const isDisabled = disabled || state === "disabled";

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-[12px] font-normal text-[#475569] leading-[16px]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          disabled={isDisabled}
          className={cn(
            "h-[45px] w-full rounded-[8px] px-[10px]",
            "bg-[#eeeff3] border border-[#e2e8f0]",
            "text-[14px] font-normal leading-[16px] text-[#1b2027]",
            "placeholder:text-[#cbd5e1]",
            "outline-hidden transition-all duration-150",
            "focus:border-[#fa7119] focus:bg-white focus:shadow-[0px_0px_0px_3px_rgba(250,113,25,0.15)]",
            isDisabled && "opacity-50 cursor-not-allowed",
            error && "border-[#f13131] focus:border-[#f13131] focus:shadow-[0px_0px_0px_3px_rgba(241,49,49,0.15)]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-[#f13131] leading-[16px]">{error}</p>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: "default" | "active" | "disabled";
  label?: string;
  error?: string;
}

const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ className, state = "default", label, error, disabled, ...props }, ref) => {
    const isDisabled = disabled || state === "disabled";

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-[12px] font-normal text-[#475569] leading-[16px]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          disabled={isDisabled}
          className={cn(
            "min-h-[80px] w-full rounded-[8px] px-[10px] py-[10px]",
            "bg-[#eeeff3] border border-[#e2e8f0]",
            "text-[14px] font-normal leading-[16px] text-[#1b2027]",
            "placeholder:text-[#cbd5e1]",
            "outline-hidden transition-all duration-150 resize-none",
            "focus:border-[#fa7119] focus:bg-white focus:shadow-[0px_0px_0px_3px_rgba(250,113,25,0.15)]",
            isDisabled && "opacity-50 cursor-not-allowed",
            error && "border-[#f13131] focus:border-[#f13131] focus:shadow-[0px_0px_0px_3px_rgba(241,49,49,0.15)]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-[#f13131] leading-[16px]">{error}</p>
        )}
      </div>
    );
  }
);

TextAreaField.displayName = "TextAreaField";

export { TextField, TextAreaField };
