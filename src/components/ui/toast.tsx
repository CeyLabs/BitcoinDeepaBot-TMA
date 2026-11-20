"use client";

import { useCallback } from "react";
import { Toast } from "@base-ui/react/toast";

export type ToastType = "success" | "error";

interface ShowToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  type?: ToastType;
  /** ms before it hides (default 4000) */
  timeout?: number;
}

/**
 * App-wide toasts: a dark pill at the top of the screen. Mount once near the
 * root (see app/context/providers.tsx); show one from anywhere with useToast().
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider timeout={3000} limit={1}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed inset-x-4 top-[calc(12px+env(safe-area-inset-top))] z-100 mx-auto flex max-w-[400px] justify-center outline-none">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      className="absolute top-0 transition-[transform,opacity] duration-[360ms] ease-[cubic-bezier(0.2,0.9,0.3,1.3)] select-none data-ending-style:-translate-y-4 data-ending-style:opacity-0 data-starting-style:-translate-y-4 data-starting-style:scale-95 data-starting-style:opacity-0"
    >
      <Toast.Content className="bg-inv text-on-inv flex max-w-[calc(100vw-32px)] items-center gap-2 rounded-full px-[18px] py-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        {toast.type === "error" ? (
          <svg
            className="size-4 shrink-0 text-[#f45a5a]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5v.01" />
          </svg>
        ) : (
          <svg
            className="size-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        )}
        <div className="flex min-w-0 flex-col">
          <Toast.Title className="text-[14px] leading-5 font-semibold" />
          <Toast.Description className="text-[13px] leading-5 opacity-80" />
        </div>
      </Toast.Content>
    </Toast.Root>
  ));
}

/** Show a toast: toast({ title, description, type: "success" | "error" }). */
export function useToast() {
  const manager = Toast.useToastManager();
  return useCallback((options: ShowToastOptions) => manager.add(options), [manager]);
}
