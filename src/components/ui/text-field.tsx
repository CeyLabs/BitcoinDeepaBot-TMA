"use client";

import { forwardRef, useId } from "react";
import { cn } from "cn";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Floating label on the top border. */
  label: React.ReactNode;
  /** Error message; also turns the border red. */
  error?: string;
  className?: string;
}

/**
 * Outlined input with a floating label. Works with react-hook-form's
 * register() (forwards ref, name, onChange, onBlur). The label's background
 * follows the `--field-bg` CSS variable (defaults to the page background).
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const errorId = `${inputId}-error`;

    return (
      <div className={cn("group relative w-full pt-2", className)}>
        <label
          htmlFor={inputId}
          className={cn(
            "absolute top-0 left-4 z-10 max-w-[calc(100%-2rem)] truncate rounded-[5px] bg-(--field-bg,var(--background)) px-1.5 text-[13px] leading-4",
            error ? "text-destructive" : "group-focus-within:text-primary text-[#a2acb0]"
          )}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "text-foreground block w-full rounded-[14px] bg-transparent px-4 py-3 text-[16px] leading-6 outline-none placeholder:text-[#a2acb0]",
            "[--field-ring:#e2e8f0] dark:[--field-ring:var(--outline)]",
            "shadow-[0_0_0_2px_var(--field-ring)] focus:shadow-[0_0_0_2px_var(--primary)]",
            error &&
              "shadow-[0_0_0_2px_var(--destructive)] focus:shadow-[0_0_0_2px_var(--destructive)]",
            "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="pt-1 pl-4 text-[12px] text-[#f13131]">
            {error}
          </p>
        )}
      </div>
    );
  }
);
TextField.displayName = "TextField";
