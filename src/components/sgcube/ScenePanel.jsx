import React from 'react'
import { Box, ArrowLeft, Target, ArrowRight, Navigation } from 'lucide-react'

export const ScenePanel = ({ data = {} }) => {
  return (
    <div className="hud-panel p-3.5 flex flex-col justify-between h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-purple-500/15">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#833EEF]" />
          <h2 className="hud-heading text-xs tracking-wider">SCENE</h2>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2.5 my-auto py-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <Box className="w-3.5 h-3.5 text-purple-400/80" />
            <span className="text-text-secondary">People</span>
          </div>
          <span className="font-mono text-white font-medium">{data.people || '1 | Objects: 3'}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <ArrowLeft className="w-3.5 h-3.5 text-purple-400/80" />
            <span className="text-text-secondary">Left</span>
          </div>
          <span className="font-mono text-white font-medium">{data.left || 'Monitor / Screen'}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <Target className="w-3.5 h-3.5 text-purple-400/80" />
            <span className="text-text-secondary">Center</span>
          </div>
          <span className="font-mono text-white font-medium">{data.center || 'Candidate (Locked)'}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <ArrowRight className="w-3.5 h-3.5 text-purple-400/80" />
            <span className="text-text-secondary">Right</span>
          </div>
          <span className="font-mono text-white font-medium">{data.right || 'Microphone Audio'}</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-500/10">
          <div className="flex items-center gap-2 text-text-muted">
            <Navigation className="w-3.5 h-3.5 text-purple-400/80" />
            <span className="text-text-secondary">Path</span>
          </div>
          <span
            className={`font-mono font-semibold ${
              data.path === 'Alert' ? 'text-amber-400' : 'text-purple-400'
            }`}
          >
            {data.path || 'Clear'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ScenePanel
