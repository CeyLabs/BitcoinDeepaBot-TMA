import type React from "react"
import BottomNavigation from "@/components/bottomNavigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md p-5">
      {children}
      <BottomNavigation />
    </div>
  )
}