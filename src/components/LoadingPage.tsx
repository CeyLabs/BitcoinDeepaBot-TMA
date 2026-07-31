"use client";

import Image from "next/image";
import { useTheme } from "@/app/context/theme";

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
  const sizeClasses = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  const colorClasses = {
    orange: "border-[#fa7119]",
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
  const { isDark } = useTheme();
  const logoSrc = isDark ? "/BDLogo_White.svg" : "/BDLogo_Black.svg";

  const content = (
    <div className="flex flex-col items-center gap-6">
      {/* Logo inside spinning arc */}
      <div className="relative flex items-center justify-center">
        {/* Outer spinner ring */}
        <div className="h-[128px] w-[128px] animate-spin rounded-full border-[3px] border-transparent border-t-[#fa7119] border-r-[#fa7119]" />
        {/* Logo centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={logoSrc}
            alt="Bitcoin Deepa"
            width={72}
            height={72}
            className="object-contain"
          />
        </div>
      </div>

      <p className="text-[15px] font-medium text-[#64748b]">{message}</p>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="bg-tma-bg-secondary fixed inset-0 z-50 flex flex-col items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-[#fa7119] border-r-[#fa7119]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Image src={logoSrc} alt="Bitcoin Deepa" width={24} height={24} className="object-contain" />
        </div>
      </div>
      <p className="text-sm text-[#64748b]">{message}</p>
    </div>
  );
}
