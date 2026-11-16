"use client";

import { useCallback } from "react";
import { Toast } from "@base-ui/react/toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export type ToastType = "success" | "error";

interface ShowToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  type?: ToastType;
}

/**
 * App-wide toasts. Mount once near the root (see app/context/providers.tsx);
 * show one from anywhere with useToast().
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider timeout={4000} limit={1}>
      {children}
      <Toast.Portal>
        {/* Sits above the fixed bottom navigation. */}
        <Toast.Viewport className="fixed inset-x-2.5 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-100 mx-auto max-w-[460px] outline-none">
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
      className="absolute inset-x-0 bottom-0 transition-transform duration-300 ease-[cubic-bezier(0.3,0.3,0.5,1)] select-none data-ending-style:translate-y-[140%] data-starting-style:translate-y-[140%]"
    >
      <Toast.Content className="bg-surface-glass flex items-center gap-3 rounded-[10px] py-2.5 pr-4 pl-2.5 backdrop-blur-[28px]">
        {toast.type === "success" && <CheckCircle2 size={20} className="text-success shrink-0" />}
        {toast.type === "error" && <AlertCircle size={20} className="shrink-0 text-[#F45A5A]" />}
        <div className="text-foreground flex flex-1 flex-col gap-px">
          <Toast.Title className="text-[13px] leading-5 font-semibold" />
          <Toast.Description className="text-[13px] leading-5" />
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
