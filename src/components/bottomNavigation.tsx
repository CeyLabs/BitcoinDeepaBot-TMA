"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdWallet, MdHistory } from "react-icons/md";
import { Sprout } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/app/context/theme";

const navItems = [
    { href: "/dashboard", icon: MdWallet, label: "Wallet" },
    { href: "/dashboard/subscription", icon: Sprout, label: "Membership" },
    { href: "/dashboard/history", icon: MdHistory, label: "History" },
] as const;

export default function BottomNavigation() {
    const pathname = usePathname();
    const { isDark } = useTheme();

    const inactiveColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
    const pillBg = isDark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.55)";
    const pillBorder = isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(0,0,0,0.09)";
    const pillShadow = isDark
        ? "0 4px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)"
        : "0 4px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)";

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
                background:
                    "linear-gradient(180deg, transparent 0%, var(--tg-theme-bg-color, #212121) 87.66%)",
            }}
        >
            <div
                className="mx-auto mb-5 flex w-fit items-center rounded-[120px] p-1"
                style={{
                    background: pillBg,
                    backdropFilter: "blur(25px)",
                    WebkitBackdropFilter: "blur(25px)",
                    boxShadow: pillShadow,
                    border: pillBorder,
                }}
            >
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex w-24 flex-col items-center justify-center gap-0.5 py-2"
                        >
                            {isActive && (
                                <motion.span
                                    layoutId="active-bubble"
                                    className="absolute inset-0"
                                    style={{
                                        borderRadius: 9999,
                                        background:
                                            "linear-gradient(160deg, rgba(255,153,0,0.22) 0%, rgba(255,153,0,0.09) 100%)",
                                        border: "1px solid rgba(255,153,0,0.25)",
                                        boxShadow:
                                            "inset 0 1px 0 rgba(255,255,255,0.08)",
                                    }}
                                    transition={{
                                        type: "spring",
                                        bounce: 0.2,
                                        duration: 0.45,
                                    }}
                                />
                            )}

                            <Icon
                                className="relative z-10"
                                style={{
                                    fontSize: "22px",
                                    color: isActive ? "var(--brand-accent, #ff9900)" : inactiveColor,
                                    filter: isActive
                                        ? "drop-shadow(0 0 5px rgba(255,153,0,0.5))"
                                        : "none",
                                    transition: "color 0.2s ease, filter 0.2s ease",
                                }}
                            />
                            <span
                                className="relative z-10 text-[10px] font-medium"
                                style={{
                                    color: isActive ? "var(--brand-accent, #ff9900)" : inactiveColor,
                                    transition: "color 0.2s ease",
                                }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
