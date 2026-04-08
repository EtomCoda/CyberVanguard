"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Shield, AlertTriangle, Check, Globe2, Activity } from "lucide-react"
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

  return (
    <div className="h-full flex flex-col">
      {/* Fullscreen Alert */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-cyber-red/20 flex items-center justify-center backdrop-blur-sm"
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

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 md:mb-2">Sovereignty Sentinel</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Real-time data sovereignty and compliance monitoring
          </p>
        </div>
        <button
          onClick={startDemo}
          disabled={demoState !== "idle"}
          className={cn(
            "w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all text-sm md:text-base",
            demoState === "idle"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Play className="w-4 h-4" />
          {demoState === "idle" ? "Start Demo" : "Demo Running..."}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3 bg-card rounded-xl border border-border overflow-hidden relative min-h-[350px] md:min-h-[500px]">
          {isMapReady && (
            <MapContainer
              center={[20, 20]}
              zoom={2}
              className="h-full w-full"
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* Lagos Marker */}
              <Marker position={LAGOS} />

              {/* Europe Marker */}
              <Marker position={EUROPE} />

              {/* Data Path */}
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
                      pathOptions={{
                        color: "#374151",
                        weight: 2,
                        dashArray: "5, 10",
                      }}
                    />
                  )}
                  {/* Animated Packet Marker */}
                  {demoState === "transmitting" && (
                    <Marker position={getPacketPosition()} />
                  )}
                </>
              )}
            </MapContainer>
          )}

          {/* Map Overlay Labels */}
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
            <div className="flex items-center gap-2 text-sm">
              <Globe2 className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">Nigeria Region</span>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground mb-2">Data Flow Legend</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-0.5 bg-primary" />
                <span className="text-foreground">Active Transfer</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-0.5 bg-cyber-red" />
                <span className="text-foreground">Blocked Transfer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Compliance Status */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">NDPR Compliance</h3>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold text-foreground mb-2">
                {complianceStatus}%
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    complianceStatus === 100 ? "bg-cyber-green" : "bg-primary"
                  )}
                  initial={{ width: "98%" }}
                  animate={{ width: `${complianceStatus}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Nigeria Data Protection Regulation
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">System Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monitoring</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyber-green" />
                  <span className="text-sm text-cyber-green">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Threats Blocked</span>
                <span className="text-sm text-foreground font-medium">
                  {demoState === "blocked" ? "24" : "23"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Regions</span>
                <span className="text-sm text-foreground font-medium">3</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <AnimatePresence>
                {demoState === "blocked" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-2 rounded-lg bg-cyber-red/10 border border-cyber-red/20"
                  >
                    <AlertTriangle className="w-4 h-4 text-cyber-red mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground">Violation Blocked</p>
                      <p className="text-xs text-muted-foreground">Just now</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-cyber-green mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">Audit Completed</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-cyber-green mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">Policy Updated</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
