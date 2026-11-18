"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "cn";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown centered in the header; also the dialog's accessible name. */
  title: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Bottom sheet (modal dialog anchored to the bottom of the screen). */
export function Sheet({ open, onOpenChange, title, className, children }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-90 bg-black/40 transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className={cn(
            "bg-background text-foreground fixed inset-x-0 bottom-0 z-90 mx-auto flex max-h-[96%] max-w-md flex-col rounded-t-2xl outline-none",
            "pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-out",
            "data-ending-style:translate-y-full data-starting-style:translate-y-full",
            className
          )}
        >
          {/* Title + close. No grab handle: there's no swipe-to-dismiss. */}
          <div className="flex items-center justify-between gap-3 p-4">
            <span className="flex-1" />
            <Dialog.Title className="truncate text-center text-[17px] leading-7 font-semibold">
              {title}
            </Dialog.Title>
            <span className="flex flex-1 justify-end">
              <Dialog.Close
                aria-label="Close"
                className="text-hint flex size-8 cursor-pointer items-center justify-center rounded-full"
              >
                <X size={20} />
              </Dialog.Close>
            </span>
          </div>
          <div className="overflow-y-auto">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
