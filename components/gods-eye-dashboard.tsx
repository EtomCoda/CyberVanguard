"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, AlertTriangle, Check, Globe2, Activity } from "lucide-react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
)

import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

// Coordinates
const LAGOS: [number, number] = [6.5244, 3.3792]
const EUROPE: [number, number] = [48.8566, 2.3522] // Paris
const INTERCEPT_POINT: [number, number] = [25.2048, 55.2708] // Midpoint (Dubai area)

type DemoState = "idle" | "transmitting" | "intercepted" | "blocked"

export function GodsEyeDashboard() {
  const [demoState, setDemoState] = useState<DemoState>("idle")
  const [complianceStatus, setComplianceStatus] = useState(98)
  const [showAlert, setShowAlert] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [isMapReady, setIsMapReady] = useState(false)
  const animationRef = useRef<number>(0)
  const hasInterceptedRef = useRef<boolean>(false)

  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined") {
        // @ts-ignore
        await import("leaflet-defaulticon-compatibility")
      }
      setIsMapReady(true)
    })()
  }, [])

  const startDemo = () => {
    if (demoState !== "idle") return

    setDemoState("transmitting")
    setAnimationProgress(0)

    const startTime = Date.now()
    const duration = 3000

    hasInterceptedRef.current = false

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setAnimationProgress(progress)

      if (progress < 0.5) {
        animationRef.current = requestAnimationFrame(animate)
      } else if (progress >= 0.5 && !hasInterceptedRef.current) {
        hasInterceptedRef.current = true
        setDemoState("intercepted")
        setShowAlert(true)
        setTimeout(() => {
          setShowAlert(false)
          setDemoState("blocked")
          setComplianceStatus(100)
          setTimeout(() => {
            setDemoState("idle")
            setAnimationProgress(0)
          }, 3000)
        }, 3000)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Calculate current packet position
  const getPacketPosition = (): [number, number] => {
    if (animationProgress <= 0.5) {
      const t = animationProgress * 2
      return [
        LAGOS[0] + (INTERCEPT_POINT[0] - LAGOS[0]) * t,
        LAGOS[1] + (INTERCEPT_POINT[1] - LAGOS[1]) * t,
      ]
    }
    return INTERCEPT_POINT
  }

  // Server config state
  const [servers, setServers] = useState([
    {
      id: "srv-01",
      name: "Primary DB Node",
      provider: "AWS",
      region: "Lagos, NG",
      status: "healthy",
      dataClass: "PII — Tier 1",
      encryptionKey: "AES-256-GCM",
      accessPolicy: "NDPR-Compliant",
      flagged: false,
    },
    {
      id: "srv-02",
      name: "Auth Service",
      provider: "GCP",
      region: "Lagos, NG",
      status: "healthy",
      dataClass: "Auth Tokens",
      encryptionKey: "RSA-4096",
      accessPolicy: "NDPR-Compliant",
      flagged: false,
    },
    {
      id: "srv-03",
      name: "Analytics Pipeline",
      provider: "Azure",
      region: "Lagos, NG",
      status: "healthy",
      dataClass: "Behavioural Data",
      encryptionKey: "AES-256-CBC",
      accessPolicy: "NDPR-Compliant",
      flagged: false,
    },
  ])

  return (
    <div className="flex flex-col gap-6">
      {/* Fullscreen Alert */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-background/80 flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-center p-12 rounded-2xl bg-background/90 border-2 border-cyber-red"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Shield className="w-24 h-24 text-cyber-red mx-auto mb-6" />
              </motion.div>
              <h2 className="text-4xl font-bold text-cyber-red mb-4">
                DATA SOVEREIGNTY VIOLATION BLOCKED
              </h2>
              <p className="text-xl text-foreground/80 mb-2">
                Unauthorized data transfer intercepted
              </p>
              <p className="text-muted-foreground">
                Lagos → Europe data packet blocked at network boundary
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header — no button, demo starts from Recent Activity card */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Sovereignty Sentinel</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Real-time data sovereignty and compliance monitoring
        </p>
      </div>

      {/* Horizontal Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* NDPR Compliance */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">NDPR Compliance</h3>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">{complianceStatus}%</div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", complianceStatus === 100 ? "bg-cyber-green" : "bg-primary")}
              initial={{ width: "98%" }}
              animate={{ width: `${complianceStatus}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Nigeria Data Protection Regulation</p>
        </div>

        {/* System Status */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">System Status</h3>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Monitoring</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cyber-green" />
                <span className="text-xs text-cyber-green">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Threats Blocked</span>
              <span className="text-xs text-foreground font-medium">{demoState === "blocked" ? "24" : "23"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Data Regions</span>
              <span className="text-xs text-foreground font-medium">3</span>
            </div>
          </div>
        </div>

        {/* Recent Activity — clicking this triggers the demo */}
        <div
          onClick={() => {
            if (demoState !== "idle") return
            // Step 1: Mutate server card immediately
            setServers((prev) =>
              prev.map((s) =>
                s.id === "srv-03"
                  ? { ...s, region: "Dubai, UAE", accessPolicy: "NON-COMPLIANT", flagged: true, status: "critical" }
                  : s
              )
            )
            // Step 2: Start map animation after card has mutated visibly
            setTimeout(() => startDemo(), 1200)
            // Step 3: Restore server well after demo fully idle (~9.5s total)
            setTimeout(() => {
              setServers((prev) =>
                prev.map((s) =>
                  s.id === "srv-03"
                    ? { ...s, region: "Lagos, NG", accessPolicy: "NDPR-Compliant", flagged: false, status: "healthy" }
                    : s
                )
              )
            }, 9500)
          }}
          className={cn(
            "bg-card rounded-xl border border-border p-5 transition-colors duration-200",
            demoState === "idle" ? "cursor-pointer hover:border-border/80" : "cursor-default"
          )}
        >
          <h3 className="font-semibold text-sm text-foreground mb-3">Recent Activity</h3>
          <div className="space-y-2.5">
            <AnimatePresence>
              {demoState === "blocked" && (
                <motion.div
                  key="violation"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-1.5 rounded-lg bg-cyber-red/10 border border-cyber-red/20"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-cyber-red mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-foreground">Violation Blocked</p>
                    <p className="text-[10px] text-muted-foreground">Just now</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-cyber-green mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-foreground">Audit Completed</p>
                <p className="text-[10px] text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-cyber-green mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-foreground">Policy Updated</p>
                <p className="text-[10px] text-muted-foreground">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map — smaller, full width */}
      <div className="bg-card rounded-xl border border-border overflow-hidden relative h-[280px] md:h-[320px]">
        {isMapReady && (
          <MapContainer
            center={[20, 20]}
            zoom={2}
            className="h-full w-full"
            zoomControl={false}
            attributionControl={false}
            scrollWheelZoom={false}
            dragging={false}
            doubleClickZoom={false}
            touchZoom={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <Marker position={LAGOS} />
            {demoState !== "idle" && (
              <>
                <Polyline
                  positions={[LAGOS, INTERCEPT_POINT]}
                  pathOptions={{
                    color: demoState === "blocked" ? "#EF4444" : "#38BDF8",
                    weight: 3,
                    dashArray: "10, 10",
                  }}
                />
                {demoState === "blocked" && (
                  <Polyline
                    positions={[INTERCEPT_POINT, EUROPE]}
                    pathOptions={{ color: "#374151", weight: 2, dashArray: "5, 10" }}
                  />
                )}
                {demoState === "transmitting" && (
                  <Marker position={getPacketPosition()} />
                )}
              </>
            )}
          </MapContainer>
        )}

        {/* Map Labels */}
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border">
          <div className="flex items-center gap-2 text-xs">
            <Globe2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground font-medium">Nigeria Region</span>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm rounded-lg p-2.5 border border-border">
          <p className="text-[10px] text-muted-foreground mb-1">Data Flow Legend</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-3 h-0.5 bg-primary" />
              <span className="text-foreground">Active Transfer</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-3 h-0.5 bg-cyber-red" />
              <span className="text-foreground">Blocked Transfer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Server Cards */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Cloud Infrastructure — Hosted Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {servers.map((server) => (
            <div
              key={server.id}
              className={cn(
                "rounded-xl border p-4 bg-card relative overflow-hidden transition-colors duration-700",
                server.flagged ? "border-cyber-red" : "border-border"
              )}
            >
              {/* Pulsing red glow ring — only rendered while flagged, removed cleanly on restore */}
              <AnimatePresence>
                {server.flagged && (
                  <motion.div
                    key="flagged-ring"
                    initial={{ opacity: 0 }}
                    animate="pulse"
                    exit={{ opacity: 0, transition: { duration: 0.4, repeat: 0 } }}
                    variants={{
                      pulse: {
                        opacity: [0.1, 0.3, 0.1],
                        transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
                      },
                    }}
                    className="absolute inset-0 rounded-xl bg-cyber-red pointer-events-none"
                  />
                )}
              </AnimatePresence>

              {/* Card Header */}
              <div className="relative flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{server.name}</p>
                  <p className="text-xs text-muted-foreground">{server.provider}</p>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors duration-500",
                    server.status === "healthy"
                      ? "bg-cyber-green/10 text-cyber-green"
                      : "bg-cyber-red/10 text-cyber-red"
                  )}
                >
                  {server.status === "healthy" ? "● Healthy" : "⚠ Critical"}
                </span>
              </div>

              {/* Config Fields */}
              <div className="relative space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">region</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={server.region}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className={cn(
                        "font-medium",
                        server.flagged ? "text-cyber-red" : "text-foreground"
                      )}
                    >
                      {server.region}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">data_class</span>
                  <span className="text-foreground">{server.dataClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">encryption</span>
                  <span className="text-cyber-green">{server.encryptionKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">access_policy</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={server.accessPolicy}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "font-semibold transition-colors duration-500",
                        server.flagged ? "text-cyber-red" : "text-cyber-green"
                      )}
                    >
                      {server.accessPolicy}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
