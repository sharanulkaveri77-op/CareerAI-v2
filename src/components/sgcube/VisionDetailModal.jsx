import React from 'react'
import { X, Eye } from 'lucide-react'

export const VisionDetailModal = ({
  isOpen,
  onClose,
  env = {},
  scene = {},
  metrics = {},
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="hud-panel w-full max-w-2xl bg-[#0F081E]/95 border border-purple-400/50 p-6 rounded-lg shadow-[0_0_40px_rgba(131,62,239,0.35)] flex flex-col gap-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white tracking-wider font-mono">
              VISION & SPATIAL PERCEPTION MATRIX
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-purple-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-purple-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded bg-black/40 border border-purple-500/20 flex flex-col gap-2">
            <span className="text-purple-400 font-bold tracking-wider">ENVIRONMENT ANALYSIS</span>
            <div className="flex justify-between py-1 border-b border-purple-500/10">
              <span className="text-text-muted">Detected Location:</span>
              <span className="text-white">{env.room || 'Interview Studio'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-500/10">
              <span className="text-text-muted">People in View:</span>
              <span className="text-white">{env.people || '1 (Candidate)'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-500/10">
              <span className="text-text-muted">Ambient Lux:</span>
              <span className="text-white">{env.lighting || 'Optimal (450 lux)'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-500/10">
              <span className="text-text-muted">Acoustic Floor:</span>
              <span className="text-white">{env.noise || 'Low (<32dB)'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Safety Vector:</span>
              <span className="text-purple-400 font-bold">{env.safety || 'Clear'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded bg-black/40 border border-purple-500/20 flex flex-col gap-2">
            <span className="text-purple-400 font-bold tracking-wider">SPATIAL & CV SECTORS</span>
            <div className="flex justify-between py-1 border-b border-purple-500/10">
              <span className="text-text-muted">Left Sector:</span>
              <span className="text-white">{scene.left || 'Monitor / Workspace'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-500/10">
              <span className="text-text-muted">Center Crosshair:</span>
              <span className="text-white">{scene.center || 'Candidate Locked'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-500/10">
              <span className="text-text-muted">Eye Contact Gaze:</span>
              <span className="text-purple-300 font-bold">{metrics.eyeContact || 94}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-500/10">
              <span className="text-text-muted">Posture Stability:</span>
              <span className="text-purple-300 font-bold">{metrics.postureStability || 96}%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Floor Clearance:</span>
              <span className="text-purple-400 font-bold">{scene.path || 'Clear'}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-purple-950/60 border border-purple-400/50 text-purple-200 text-xs font-mono hover:bg-purple-900/60 transition-colors"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  )
}

export default VisionDetailModal
