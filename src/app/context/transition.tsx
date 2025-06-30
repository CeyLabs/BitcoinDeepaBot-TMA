"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoadingPage from "@/components/LoadingPage";

export function usePageTransition() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const navigateWithLoading = (href: string, message?: string) => {
        if (href === pathname) return; // Don't navigate to same page

        setIsLoading(true);

        // Add a small delay to show loading animation
        setTimeout(() => {
            router.push(href);
        }, 300);
    };

    // Reset loading when pathname changes
    useEffect(() => {
        setIsLoading(false);
    }, [pathname]);

    return {
        isLoading,
        navigateWithLoading,
        setIsLoading,
    };
}

interface PageTransitionProviderProps {
    children: React.ReactNode;
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
    const { isLoading } = usePageTransition();

    return (
        <>
            {isLoading && <LoadingPage message="Switching pages" />}
            {children}
        </>
    );
}
