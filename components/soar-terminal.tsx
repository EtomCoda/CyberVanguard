"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogEntry {
  id: string
  type: "command" | "output" | "system"
  content: string
  risk?: "low" | "medium" | "high"
  timestamp: Date
}

const COMMANDS: Record<string, { outputs: Array<{ text: string; risk?: "low" | "medium" | "high" }> }> = {
  analyze_logs: {
    outputs: [
      { text: "[SYSTEM] Connecting to log aggregator at siem.vanguard.local..." },
      { text: "[SYSTEM] Session authenticated. Pulling last 24h window." },
      { text: "[INFO] Parsing auth logs from /var/log/auth.log...", risk: "low" },
      { text: "[OK] User admin@company.com logged in from 192.168.1.100", risk: "low" },
      { text: "[OK] Session established for user: john.doe", risk: "low" },
      { text: "[WARN] Failed login attempt detected from 45.33.32.156 (Russia)", risk: "medium" },
      { text: "[WARN] Sandboxing user: suspicious_user_ru for 24h", risk: "medium" },
      { text: "[INFO] Analysis complete. 2 anomalies detected.", risk: "low" },
      { text: "[SYSTEM] Report written to /var/reports/auth_audit_2024.log" },
    ],
  },
  scan_network: {
    outputs: [
      { text: "[SYSTEM] Initializing network probe on interface eth0..." },
      { text: "[SYSTEM] Target range: 10.0.0.0/24 — 254 hosts." },
      { text: "[INFO] Initiating network scan on 10.0.0.0/24...", risk: "low" },
      { text: "[OK] Host 10.0.0.1 (Gateway) - ONLINE", risk: "low" },
      { text: "[OK] Host 10.0.0.50 (WebServer) - ONLINE", risk: "low" },
      { text: "[WARN] Host 10.0.0.77 - Unusual port 4444 OPEN", risk: "medium" },
      { text: "[CRITICAL] Potential C2 beacon detected on 10.0.0.77:4444", risk: "high" },
      { text: "[ACTION] Isolating host 10.0.0.77 from network...", risk: "high" },
      { text: "[INFO] Network scan complete. 1 critical threat neutralized.", risk: "low" },
      { text: "[SYSTEM] Scan report saved. Duration: 4.2s." },
    ],
  },
  threat_hunt: {
    outputs: [
      { text: "[SYSTEM] Initializing Vanguard Threat Intelligence Engine v3.4..." },
      { text: "[SYSTEM] Syncing IOC database — 1,204,331 signatures loaded." },
      { text: "[INFO] Loading threat intelligence feeds...", risk: "low" },
      { text: "[INFO] Cross-referencing with MITRE ATT&CK database...", risk: "low" },
      { text: "[WARN] IOC Match: Hash a1b2c3d4... found in memory", risk: "medium" },
      { text: "[CRITICAL] WannaCry ransomware signature detected!", risk: "high" },
      { text: "[CRITICAL] Affected endpoint: WORKSTATION-042", risk: "high" },
      { text: "[ACTION] Executing Kill Switch Protocol...", risk: "high" },
      { text: "[ACTION] Quarantining affected files...", risk: "high" },
      { text: "[OK] Threat neutralized. System restored to safe state.", risk: "low" },
      { text: "[SYSTEM] Incident ID #VG-20241-0042 logged for forensic review." },
    ],
  },
  help: {
    outputs: [
      { text: "Available commands:", risk: "low" },
      { text: "  analyze_logs  - Analyze authentication and system logs", risk: "low" },
      { text: "  scan_network  - Scan network for vulnerabilities", risk: "low" },
      { text: "  threat_hunt   - Hunt for advanced persistent threats", risk: "low" },
      { text: "  clear         - Clear terminal output", risk: "low" },
      { text: "  help          - Show this help message", risk: "low" },
    ],
  },
}

export function SOARTerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init",
      type: "system",
      content: "CyberShield SOAR Terminal v2.1.0 - Security Orchestration, Automation and Response",
      timestamp: new Date(),
    },
    {
      id: "init2",
      type: "system",
      content: 'Type "help" for available commands',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs])

  const addLog = (entry: Omit<LogEntry, "id" | "timestamp">) => {
    setLogs((prev) => [
      ...prev,
      { ...entry, id: Math.random().toString(36), timestamp: new Date() },
    ])
  }

  const executeCommand = async (command: string) => {
    const trimmed = command.trim().toLowerCase()

    addLog({ type: "command", content: command })

    if (trimmed === "clear") {
      setLogs([])
      return
    }

    if (!COMMANDS[trimmed]) {
      addLog({
        type: "output",
        content: `Command not found: ${command}. Type "help" for available commands.`,
        risk: "low",
      })
      return
    }

    setIsProcessing(true)

    for (const output of COMMANDS[trimmed].outputs) {
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 400))
      addLog({ type: "output", content: output.text, risk: output.risk })
    }

    setIsProcessing(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return
    executeCommand(input)
    setInput("")
  }

  const getRiskColor = (risk?: "low" | "medium" | "high") => {
    switch (risk) {
      case "high":
        return "text-cyber-red"
      case "medium":
        return "text-cyber-orange"
      case "low":
        return "text-yellow-400"
      default:
        return "text-white"
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 md:mb-2">SOAR Terminal</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Security Orchestration, Automation and Response command interface
        </p>
      </div>

      {/* Terminal */}
      <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col min-h-[350px] md:min-h-0">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 bg-muted/50 border-b border-border">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-xs md:text-sm font-medium text-foreground">SOAR Terminal</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-cyber-green" />
            <span className="text-[10px] md:text-xs text-muted-foreground">Connected</span>
          </div>
        </div>

        {/* Terminal Output */}
        <div
          ref={terminalRef}
          className="flex-1 p-3 md:p-4 overflow-y-auto font-mono text-xs md:text-sm scroll-smooth"
          onClick={() => inputRef.current?.focus()}
        >
          <AnimatePresence>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("mb-1", log.type === "command" && "mt-4")}
              >
                {log.type === "command" ? (
                  <div className="flex items-center gap-2 text-primary">
                    <ChevronRight className="w-4 h-4" />
                    <span>{log.content}</span>
                  </div>
                ) : log.type === "system" ? (
                  <div className="text-muted-foreground">{log.content}</div>
                ) : (
                  <div className={cn("ml-6", getRiskColor(log.risk))}>{log.content}</div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Processing Indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 ml-6 text-primary"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-border">
          <div className="flex items-center px-3 md:px-4 py-2 md:py-3 relative">
            <ChevronRight className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isProcessing}
              placeholder={isProcessing ? "Processing..." : "Enter command..."}
              className="flex-1 bg-transparent text-foreground font-mono text-xs md:text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
              autoComplete="off"
            />
          </div>
        </form>
      </div>

      {/* Quick Commands */}
      <div className="mt-3 md:mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        {Object.keys(COMMANDS)
          .filter((cmd) => cmd !== "help")
          .map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                if (!isProcessing) {
                  setInput(cmd)
                  inputRef.current?.focus()
                }
              }}
              disabled={isProcessing}
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-card border border-border text-xs md:text-sm font-mono text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors disabled:opacity-50 text-center w-full sm:w-auto"
            >
              {cmd}
            </button>
          ))}
      </div>
    </div>
  )
}
