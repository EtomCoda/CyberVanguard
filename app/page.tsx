"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { VerificationPortal } from "@/components/verification-portal"
import { SOARTerminal } from "@/components/soar-terminal"
import { GodsEyeDashboard } from "@/components/gods-eye-dashboard"

type View = "verification" | "soar" | "dashboard"

export default function Home() {
  const [activeView, setActiveView] = useState<View>("verification")

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="ml-64 min-h-screen p-8">
        {activeView === "verification" && <VerificationPortal />}
        {activeView === "soar" && <SOARTerminal />}
        {activeView === "dashboard" && <GodsEyeDashboard />}
      </main>
    </div>
  )
}
