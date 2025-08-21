"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdWallet, MdHistory } from "react-icons/md";
// import { FaUserPlus } from "react-icons/fa";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
    {
        href: "/dashboard",
        icon: MdWallet,
        label: "Wallet",
    },
    // {
    //     href: "/dashboard/invite",
    //     icon: FaUserPlus,
    //     label: "Invite",
    // },
    {
        href: "/dashboard/subscription",
        icon: Sprout,
        label: "Membership",
    },
    {
        href: "/dashboard/history",
        icon: MdHistory,
        label: "History",
    },
];

export default function BottomNavigation() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-700 bg-[#1a1a1a]">
            <div className="mx-auto max-w-md">
                <div className="flex justify-around py-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-lg px-3 py-2 transition-colors",
                                    isActive ? "text-orange-500" : "text-gray-400 hover:text-white"
                                )}
                            >
                                <Icon className="mb-1 text-xl" />
                                <span className="text-xs">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
