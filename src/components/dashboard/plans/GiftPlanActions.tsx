"use client";

import Image from "next/image";
import { Cell, Navigation } from "@telegram-apps/telegram-ui";

const CELL_CLASSNAME =
  "gap-2! px-4! rounded-[12px] border border-transparent bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] transition-shadow duration-150 hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fa7119]/50 dark:border-white/6 dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)] dark:hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.4)]";

// Gifting isn't launched yet, so the plans page renders GiftPlansComingSoon below
// instead of GiftPlanActions. Swap the render back to GiftPlanActions once it's ready.
export function GiftPlansComingSoon() {
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[14px] leading-4 font-bold text-[#475569] dark:text-[#94a3b8]">
        Gift Plans
      </p>

      <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-8 text-center shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)]">
        <Image src="/emoji/gift.webp" alt="Gift" width={56} height={56} />

        <div className="flex flex-col gap-1">
          <p className="text-[16px] font-bold text-[#1b2027] dark:text-white">
            Gifting is Coming Soon
          </p>
          <p className="dark:text-muted-foreground text-sm font-normal text-[#64748b]">
            You&apos;ll be able to send gift plans and manage gift plans here in future updates
          </p>
        </div>

        <span className="rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[13px] font-medium text-[#64748b] dark:bg-white/10 dark:text-[#94a3b8]">
          Available Soon
        </span>
      </div>
    </div>
  );
}

export function GiftPlanActions() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="text-[14px] leading-4 font-bold text-[#475569] dark:text-[#94a3b8]">
          Gift Plans
        </p>
        <span className="rounded-full bg-[#fa7119]/10 px-2 py-0.5 text-[10px] leading-4 font-semibold text-[#fa7119]">
          Coming Soon
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Cell
          before={<Image src="/emoji/gift.webp" alt="Gift" width={40} height={40} />}
          after={<Navigation />}
          style={{ "--tgui--cell--middle--padding": "12px 0" } as React.CSSProperties}
          className={CELL_CLASSNAME}
        >
          <p className="flex flex-col items-start pl-1 font-semibold text-[#1b2027] dark:text-white">
            Gift a Bitcoin Plan
            <span className="dark:text-muted-foreground text-sm font-normal text-[#64748b]">
              Send a bitcoin subscription to a friend
            </span>
          </p>
        </Cell>

        <Cell
          before={
            <Image
              src="/emoji/gift_standing_order.webp"
              alt="Recurring Gift"
              width={40}
              height={40}
            />
          }
          after={<Navigation />}
          style={{ "--tgui--cell--middle--padding": "12px 0" } as React.CSSProperties}
          className={CELL_CLASSNAME}
        >
          <p className="flex flex-col items-start pl-1 font-semibold text-[#1b2027] dark:text-white">
            Send a Recurring Gift
            <span className="dark:text-muted-foreground text-sm font-normal text-[#64748b]">
              Send a standing order gift to a friend
            </span>
          </p>
        </Cell>
      </div>
    </div>
  );
}
