"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { SegmentedControl } from "@telegram-apps/telegram-ui";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/v2/dashboard", icon: "/icons/wallet.svg", label: "Wallet" },
  { href: "/v2/dashboard/activity", icon: "/icons/activity.svg", label: "Activity" },
  { href: "/v2/dashboard/plans", icon: "/icons/plans.svg", label: "Plans" },
  { href: "/v2/dashboard/tasks", icon: "/icons/tasks.svg", label: "Tasks" },
  { href: "/v2/dashboard/news", icon: "/icons/news.svg", label: "News" },
];

// SegmentedControl is a plain (non-fixed) element, unlike Tabbar which ships its own
// FixedLayout — so the fixed bottom-pill positioning lives on this wrapper instead.
export default function BottomNavigationV2() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-100">
      <SegmentedControl
        className={cn(
          "flex! h-auto! w-full! rounded-full! p-1!",
          "bg-white/60! backdrop-blur-md shadow-[0px_4px_24px_0px_rgba(0,0,0,0.10)]!"
        )}
        style={
          {
            "--tgui--tertiary_bg_color": "transparent",
            "--tgui--segmented_control_active_bg": "#e2e8f0",
          } as React.CSSProperties
        }
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <SegmentedControl.Item
              key={item.href}
              selected={isActive}
              onClick={() => router.push(item.href)}
              className={cn(
                "h-14! w-auto! whitespace-normal! rounded-[20px]! p-0!",
                "transition-colors duration-200",
                isActive ? "text-[#1b2027]!" : "text-[#475569]!"
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
            </SegmentedControl.Item>
          );
        })}
      </SegmentedControl>
    </div>
  );
}
