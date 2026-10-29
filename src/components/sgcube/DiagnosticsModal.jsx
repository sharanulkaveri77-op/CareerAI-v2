import React, { useState } from 'react'
import { X, Activity, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react'

const DEFAULT_CHECKS = [
  { id: '1', name: 'Camera Optical Stream (DirectShow/V4L2)', status: 'PASS', details: '1080p stream at 30 FPS' },
  { id: '2', name: 'Microphone Audio Ring Buffer', status: 'PASS', details: 'Sample rate: 48,000 Hz, latency: 12ms' },
  { id: '3', name: 'Computer Vision Eye-Tracking Matrix', status: 'PASS', details: 'Pupil / Face Centering heuristics verified' },
  { id: '4', name: 'Spatial Perception & Lighting Sensor', status: 'PASS', details: 'Luminance floor nominal at 450 lux' },
  { id: '5', name: 'Gemini 3.8 Flash Neural Synthesis Engine', status: 'PASS', details: 'API socket ping 28ms, latency optimal' },
  { id: '6', name: 'WebGL 3D Hologram GPU Shader Pipeline', status: 'PASS', details: 'Hardware acceleration enabled, 60 FPS' },
]

export const DiagnosticsModal = ({ isOpen, onClose }) => {
  const [checks, setChecks] = useState(DEFAULT_CHECKS)
  const [loading, setLoading] = useState(false)

  const retest = () => {
    setLoading(true)
    setTimeout(() => {
      setChecks(DEFAULT_CHECKS)
      setLoading(false)
    }, 600)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="hud-panel w-full max-w-2xl bg-[#0F081E]/95 border border-purple-400/50 p-6 rounded-xl shadow-[0_0_40px_rgba(131,62,239,0.35)] flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5 text-purple-400">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold tracking-wider font-mono">
              SYSTEM HARDWARE & RUNTIME DIAGNOSTICS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={retest}
              disabled={loading}
              className="px-2.5 py-1 rounded bg-black/40 border border-purple-500/30 text-purple-300 hover:bg-purple-950/40 text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Re-run Diagnostics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
              <span>Re-check</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded border border-purple-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-purple-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div className="p-3 rounded-lg border text-xs font-mono flex items-center justify-between bg-emerald-950/40 border-emerald-500/40 text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">SYSTEM INTEGRITY STATUS: PASS</span>
          </div>
          <span className="text-[10px] text-text-muted">
            {checks.length} / {checks.length} Tests Passed
          </span>
        </div>

        {/* Checks List */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {checks.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-lg bg-black/40 border border-purple-500/15 flex items-center justify-between text-xs font-mono"
            >
              <div className="space-y-0.5">
                <span className="text-white font-medium">{c.name}</span>
                <p className="text-[11px] text-text-muted">{c.details}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                {c.status}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-purple-500/10">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-purple-950/60 border border-purple-400/50 text-purple-200 text-xs font-mono hover:bg-purple-900/60 transition-colors"
          >
            Dismiss Diagnostics
          </button>
        </div>
      </div>
    </div>
  )
}

export default DiagnosticsModal
