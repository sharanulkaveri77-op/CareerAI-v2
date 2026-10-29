import React from 'react'
import { Activity, Battery, ChevronRight, Wifi, Volume2 } from 'lucide-react'

export const StatusPanel = ({ status = {}, onOpenDetails, micAudioLevel = 0, onTestSpeaker }) => {
  return (
    <div className="hud-panel p-3.5 flex flex-col justify-between h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-purple-500/15">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <h2 className="hud-heading text-xs tracking-wider">SYSTEM STATUS</h2>
        </div>
        <button
          onClick={onOpenDetails}
          className="text-text-muted hover:text-purple-300 transition-colors flex items-center gap-1 text-[11px] font-mono"
          title="System Diagnostics"
        >
          <span>Tests</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Status Item Rows */}
      <div className="flex flex-col gap-2 my-auto py-1 text-xs">
        {/* Camera */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Camera</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                status.camera === 'Active'
                  ? 'bg-purple-400 shadow-[0_0_6px_#833EEF]'
                  : 'bg-amber-400 shadow-[0_0_6px_#F59E0B]'
              }`}
            />
            <span
              className={
                status.camera === 'Active' ? 'text-purple-300 font-medium' : 'text-amber-300 font-medium'
              }
            >
              {status.camera || 'Active'}
            </span>
          </div>
        </div>

        {/* Microphone with VU meter */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Microphone</span>
          <div className="flex items-center gap-2 font-mono">
            {/* Audio VU Indicator */}
            <div className="flex items-end gap-0.5 h-2.5 w-8">
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((step, idx) => (
                <div
                  key={idx}
                  className={`w-1 rounded-sm transition-all duration-75 ${
                    micAudioLevel / 100 >= step ? 'bg-purple-400 h-full' : 'bg-white/15 h-1'
                  }`}
                />
              ))}
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                status.microphone === 'Active'
                  ? 'bg-purple-400 shadow-[0_0_6px_#833EEF]'
                  : 'bg-red-400 shadow-[0_0_6px_#EF4444]'
              }`}
            />
            <span className="text-purple-300 font-medium">{status.microphone || 'Active'}</span>
          </div>
        </div>

        {/* Speaker with Test Trigger */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Speaker</span>
          <div className="flex items-center gap-2 font-mono">
            {onTestSpeaker && (
              <button
                onClick={onTestSpeaker}
                className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 text-[10px] flex items-center gap-1 transition-colors"
                title="Test audio output"
              >
                <Volume2 className="w-2.5 h-2.5 text-purple-400" />
                <span>Test</span>
              </button>
            )}
            <span
              className={`w-2 h-2 rounded-full ${
                status.speaker === 'Active'
                  ? 'bg-purple-400 shadow-[0_0_6px_#833EEF]'
                  : 'bg-red-400 shadow-[0_0_6px_#EF4444]'
              }`}
            />
            <span className="text-purple-300 font-medium">{status.speaker || 'Active'}</span>
          </div>
        </div>

        {/* AI Engine */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">AI Core (Gemini 3.8 Flash)</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                status.ai === 'Ready'
                  ? 'bg-purple-400 shadow-[0_0_6px_#833EEF]'
                  : 'bg-amber-400 shadow-[0_0_6px_#F59E0B]'
              }`}
            />
            <span className="text-purple-300 font-medium">{status.ai || 'Ready'}</span>
          </div>
        </div>

        {/* Battery & Network */}
        <div className="flex items-center justify-between pt-1 border-t border-purple-500/10">
          <div className="flex items-center gap-1 text-text-secondary">
            <Battery className="w-3.5 h-3.5 text-purple-400" />
            <span>{status.battery || '100% AC'}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-purple-300">
            <Wifi className="w-3.5 h-3.5 text-purple-400" />
            <span>{status.network || 'Online (42ms)'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusPanel
