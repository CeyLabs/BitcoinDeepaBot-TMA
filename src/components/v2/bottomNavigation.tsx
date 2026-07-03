"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Tabbar } from "@telegram-apps/telegram-ui";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/v2/dashboard", icon: "/icons/wallet.svg", label: "Wallet" },
  { href: "/v2/dashboard/activity", icon: "/icons/activity.svg", label: "Activity" },
  { href: "/v2/dashboard/plans", icon: "/icons/plans.svg", label: "Plans" },
  { href: "/v2/dashboard/tasks", icon: "/icons/tasks.svg", label: "Tasks" },
  { href: "/v2/dashboard/news", icon: "/icons/news.svg", label: "News" },
];

// Tabbar renders via telegram-ui's FixedLayout (position:fixed;left:0;right:0;bottom:0),
// so the pill positioning/sizing is applied directly on Tabbar itself instead of an extra wrapper.
export default function BottomNavigationV2() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Tabbar
      className={cn(
        "inset-x-4! bottom-4! z-50",
        "flex! items-center justify-between gap-0 p-1",
        "bg-white/60! backdrop-blur-md shadow-[0px_4px_24px_0px_rgba(0,0,0,0.10)]!",
        "rounded-full! border-none! h-auto! max-w-100 mx-auto"
      )}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Tabbar.Item
            key={item.href}
            selected={isActive}
            onClick={() => router.push(item.href)}
            style={{ "--tgui--secondary_fill": "transparent" } as React.CSSProperties}
            className={cn(
              "grow-0! h-14! w-20 rounded-[20px]!",
              "transition-all duration-200",
              isActive
                ? "bg-[#e2e8f0]! text-[#1b2027]!"
                : "text-[#475569]! hover:text-[#1b2027]!"
            )}
          >
            <div className="flex flex-col items-center justify-center gap-1">
              <Image src={item.icon} alt="" width={20} height={20} className="size-5" />
              <span
                className={cn(
                  "text-[14px] leading-3 tracking-normal",
                  isActive ? "font-medium" : "font-normal"
                )}
              >
                {item.label}
              </span>
            </div>
          </Tabbar.Item>
        );
      })}
    </Tabbar>
  );
}
