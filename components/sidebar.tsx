"use client"

import { Shield, Terminal, Globe, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type View = "verification" | "soar" | "dashboard"

interface SidebarProps {
  activeView: View
  onViewChange: (view: View) => void
}

const navItems = [
  {
    id: "verification" as View,
    label: "Verification Portal",
    icon: Shield,
    description: "Document Authentication",
  },
  {
    id: "soar" as View,
    label: "SOAR Terminal",
    icon: Terminal,
    description: "Security Orchestration",
  },
  {
    id: "dashboard" as View,
    label: "Sovereignty Sentinel",
    icon: Globe,
    description: "Global Compliance",
  },
]

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="fixed bottom-0 left-0 w-full md:top-0 md:h-screen md:w-64 bg-sidebar border-t md:border-t-0 md:border-r border-sidebar-border flex flex-row md:flex-col z-50">
      {/* Logo */}
      <div className="hidden md:block p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-lg bg-primary/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Vanguard</h1>
            <p className="text-xs text-muted-foreground">Security Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 md:p-4 flex flex-row md:flex-col justify-around gap-1 md:gap-0 md:space-y-2 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex-1 min-w-[80px] md:w-full flex-col md:flex-row flex items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-lg transition-all duration-200 text-center md:text-left group relative overflow-hidden",
                isActive
                  ? "text-primary bg-primary/10 md:bg-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-lg hidden md:block"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-1 md:gap-3 w-full">
                <div
                  className={cn(
                    "p-1.5 md:p-2 rounded-md transition-colors mx-auto md:mx-0",
                    isActive ? "bg-primary/20" : "bg-transparent md:bg-sidebar-accent group-hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5 md:w-4 md:h-4" />
                </div>
                <div className="hidden md:block flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className="md:hidden w-full px-1">
                  <p className="text-[10px] font-medium leading-tight line-clamp-1">{item.label}</p>
                </div>
              </div>
              {isActive && (
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full md:left-0 md:top-1/2 md:-translate-y-1/2 md:-translate-x-0 md:w-1 md:h-8 bg-primary md:rounded-r-full md:rounded-b-none"
                  layoutId="activeIndicator"
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Status */}
      <div className="hidden md:block p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-cyber-green" />
            <motion.div
              className="absolute inset-0 rounded-full bg-cyber-green"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <span className="text-xs text-muted-foreground">System Online</span>
        </div>
      </div>
    </aside>
  )
}
