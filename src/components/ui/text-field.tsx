"use client";

import { useId } from "react";
import { cn } from "cn";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Floating label on the top border. */
  label: React.ReactNode;
  /** Error message; also turns the border red. */
  error?: string;
  className?: string;
}

/**
 * Outlined input with a floating label. Forwards ref and all input props
 * (value, onChange, …). The label's background
 * follows the `--field-bg` CSS variable (defaults to the page background).
 */
export function TextField({
  label,
  error,
  className,
  id,
  ref,
  ...props
}: TextFieldProps & { ref?: React.Ref<HTMLInputElement> }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn("group relative w-full pt-2", className)}>
      <label
        htmlFor={inputId}
        className={cn(
          "absolute top-0 left-4 z-10 max-w-[calc(100%-2rem)] truncate rounded-[5px] bg-(--field-bg,var(--background)) px-1.5 text-[13px] leading-4",
          error ? "text-destructive" : "group-focus-within:text-primary text-ink3"
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
          "text-foreground placeholder:text-ink3 block w-full rounded-xl bg-transparent px-4 py-3 text-[16px] leading-6 outline-none",
          "[--field-ring:var(--border)]",
          "shadow-[0_0_0_2px_var(--field-ring)] focus:shadow-[0_0_0_2px_var(--primary)]",
          error &&
            "shadow-[0_0_0_2px_var(--destructive)] focus:shadow-[0_0_0_2px_var(--destructive)]",
          "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-destructive pt-1 pl-4 text-[12px]">
          {error}
        </p>
      )}
    </div>
  );
}
