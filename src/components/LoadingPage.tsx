"use client"

import { useEffect, useState } from "react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: "orange" | "white" | "gray"
  className?: string
}

export function LoadingSpinner({ size = "md", color = "orange", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  const colorClasses = {
    orange: "border-orange-500",
    white: "border-white",
    gray: "border-gray-400"
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`} />
  )
}

interface LoadingPageProps {
  message?: string
  fullscreen?: boolean
}

export default function LoadingPage({ message = "Loading...", fullscreen = true }: LoadingPageProps) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".")
    }, 500)

    return () => clearInterval(interval)
  }, [])

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-[#202020] flex flex-col items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-6">
          {/* Bitcoin themed loading animation */}
          <div className="relative">
            <LoadingSpinner size="lg" color="orange" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-orange-500 text-xl font-bold">₿</span>
            </div>
          </div>
          
          {/* Loading text with animated dots */}
          <div className="text-center">
            <p className="text-white text-lg font-medium">
              {message}{dots}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Bitcoin Deepa 🇱🇰
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <LoadingSpinner size="md" color="orange" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-orange-500 text-sm font-bold">₿</span>
        </div>
      </div>
      <p className="text-white text-sm">{message}{dots}</p>
    </div>
  )
}
