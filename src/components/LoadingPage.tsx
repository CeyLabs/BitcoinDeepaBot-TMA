"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    color?: "orange" | "white" | "gray";
    className?: string;
}

export function LoadingSpinner({
    size = "md",
    color = "orange",
    className = "",
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    const colorClasses = {
        orange: "border-orange-500",
        white: "border-white",
        gray: "border-gray-400",
    };

    return (
        <div
            className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
        />
    );
}

interface LoadingPageProps {
    message?: string;
    fullscreen?: boolean;
}

export default function LoadingPage({
    message = "Loading...",
    fullscreen = true,
}: LoadingPageProps) {
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    if (fullscreen) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#202020]">
                <div className="flex flex-col items-center space-y-6">
                    {/* Bitcoin themed loading animation */}
                    <div className="relative">
                        <LoadingSpinner size="lg" color="orange" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Image src="/Yaka.png" alt="Yaka" width={20} height={20} />
                        </div>
                    </div>

                    {/* Loading text with animated dots */}
                    <div className="text-center">
                        <p className="text-lg font-medium text-white">
                            {message}
                            {dots}
                        </p>
                        <p className="mt-2 text-sm text-gray-400">Bitcoin Deepa 🇱🇰</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <div className="relative">
                <LoadingSpinner size="md" color="orange" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Image src="/Yaka.png" alt="Yaka" width={13} height={13} />
                </div>
            </div>
            <p className="text-sm text-white">
                {message}
                {dots}
            </p>
        </div>
    );
}
