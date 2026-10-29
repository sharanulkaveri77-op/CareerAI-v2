import React, { useState } from 'react'
import { X, Glasses, Bluetooth, Video, ShieldCheck, RefreshCw } from 'lucide-react'

export const GlassesModal = ({ isOpen, onClose }) => {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const toggleConnection = () => {
    setConnecting(true)
    setTimeout(() => {
      setConnected((prev) => !prev)
      setConnecting(false)
    }, 800)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="hud-panel w-full max-w-xl bg-[#0F081E]/95 border border-purple-400/50 p-6 rounded-xl shadow-[0_0_40px_rgba(131,62,239,0.35)] flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5 text-purple-400">
            <Glasses className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold tracking-wider font-mono">
              RAY-BAN META SMART GLASSES BRIDGE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-purple-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-purple-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Card */}
        <div className="p-4 rounded-lg bg-black/40 border border-purple-500/20 flex flex-col gap-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Bluetooth BLE Interface:</span>
            <span className={connected ? 'text-purple-300 font-bold' : 'text-amber-400 font-bold'}>
              {connected ? 'CONNECTED (Ray-Ban Meta)' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted">Active Optical Source:</span>
            <span className="text-white">{connected ? 'Smart Glass Dual Wide POV' : 'DirectShow HD Camera'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted">Audio In/Out Tunnel:</span>
            <span className="text-white">{connected ? 'Meta 5-Mic Array & Open-Ear' : 'Default System Audio'}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-500/10">
          <button
            onClick={toggleConnection}
            disabled={connecting}
            className={`px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-2 transition ${
              connected
                ? 'bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/40'
                : 'bg-purple-500/20 border border-purple-400 text-purple-300 hover:bg-purple-500/30'
            }`}
          >
            <Bluetooth size={14} className={connecting ? 'animate-spin' : ''} />
            <span>{connecting ? 'Pairing BLE...' : connected ? 'Disconnect Glass' : 'Connect Ray-Ban Meta'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-text-muted hover:text-white font-mono"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

export default GlassesModal
