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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
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
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left group relative overflow-hidden",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3 w-full">
                <div
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    isActive ? "bg-primary/20" : "bg-sidebar-accent group-hover:bg-muted"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {isActive && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                  layoutId="activeIndicator"
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-sidebar-border">
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
