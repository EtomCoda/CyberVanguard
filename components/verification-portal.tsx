"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, Shield, ShieldCheck, ShieldAlert, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Hardcoded "authorized" hash for demo purposes
const AUTHORIZED_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

type VerificationState = "idle" | "scanning" | "verified" | "forgery"

export function VerificationPortal() {
  const [state, setState] = useState<VerificationState>("idle")
  const [hash, setHash] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)
  const [showForgeryAlert, setShowForgeryAlert] = useState(false)

  const computeHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
      return
    }

    setFileName(file.name)
    setState("scanning")
    setHash("")

    // Simulate scanning delay for dramatic effect
    await new Promise((r) => setTimeout(r, 2000))

    const computedHash = await computeHash(file)
    setHash(computedHash)

    // Check against authorized hash
    if (computedHash === AUTHORIZED_HASH) {
      setState("verified")
    } else {
      setState("forgery")
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const reset = () => {
    setState("idle")
    setHash("")
    setFileName("")
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fullscreen Forgery Alert */}
      <AnimatePresence>
        {showForgeryAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-cyber-red/20 flex items-center justify-center"
            onClick={() => setShowForgeryAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <ShieldAlert className="w-32 h-32 text-cyber-red mx-auto mb-6" />
              </motion.div>
              <h2 className="text-5xl font-bold text-cyber-red mb-4">FORGERY DETECTED</h2>
              <p className="text-xl text-foreground/80">Document authentication failed</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Verification Portal</h2>
        <p className="text-muted-foreground">
          Cryptographic document verification using SHA-256 hashing
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {state === "idle" && (
            <motion.label
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "block border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-300",
                isDragging
                  ? "border-primary bg-primary/10 scale-105"
                  : "border-border hover:border-primary/50 hover:bg-card"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleInputChange}
                className="hidden"
              />
              <motion.div
                animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Drop your PDF here
              </h3>
              <p className="text-muted-foreground mb-4">or click to browse files</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                <FileText className="w-4 h-4" />
                PDF files only
              </div>
            </motion.label>
          )}

          {state === "scanning" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="relative w-32 h-32 mx-auto mb-8">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-primary/20"
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Scanning Document
              </h3>
              <p className="text-muted-foreground mb-4">{fileName}</p>
              <motion.div
                className="h-1 w-64 mx-auto bg-muted rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          )}

          {(state === "verified" || state === "forgery") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className={cn(
                  "w-32 h-32 mx-auto mb-8 rounded-2xl flex items-center justify-center relative",
                  state === "verified" ? "bg-cyber-green/20" : "bg-cyber-red/20"
                )}
              >
                {state === "verified" ? (
                  <>
                    <ShieldCheck className="w-16 h-16 text-cyber-green" />
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-cyber-green/20"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </>
                ) : (
                  <ShieldAlert className="w-16 h-16 text-cyber-red" />
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3
                  className={cn(
                    "text-2xl font-bold mb-2",
                    state === "verified" ? "text-cyber-green" : "text-cyber-red"
                  )}
                >
                  {state === "verified" ? "VERIFIED AUTHENTIC" : "Document Hash mismatch. Tampered document."}
                </h3>
                <p className="text-muted-foreground mb-6">{fileName}</p>

                <div className="bg-card rounded-xl p-6 text-left border border-border">
                  <p className="text-xs text-muted-foreground mb-2">SHA-256 Hash</p>
                  <p className="font-mono text-xs text-foreground break-all leading-relaxed">
                    {hash}
                  </p>
                </div>

                <button
                  onClick={reset}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Verify Another Document
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
