import React from 'react'
import { Clock, ChevronRight, Volume2 } from 'lucide-react'

export const HistoryPanel = ({ items = [], onViewAll, onSpeak }) => {
  return (
    <div className="hud-panel p-3.5 flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-purple-500/15">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <h2 className="hud-heading text-xs tracking-wider">RECENT HISTORY</h2>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && onSpeak && (
            <button
              onClick={() => {
                const lastAi = [...items].reverse().find((i) => i.sender === 'ai')
                if (lastAi) onSpeak(lastAi.text)
              }}
              className="text-[11px] text-purple-300 hover:text-white flex items-center gap-1 font-mono transition-colors"
              title="Speak the latest interview question"
            >
              <Volume2 className="w-3 h-3 text-purple-400" />
              <span>Speak Question</span>
            </button>
          )}
          <button
            onClick={onViewAll}
            className="text-xs text-purple-400/80 hover:text-purple-300 flex items-center gap-0.5 transition-colors font-mono"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* History Turn Rows */}
      <div className="flex-1 flex flex-col justify-start py-1 gap-1.5 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-text-muted font-mono italic">
            No dialogue recorded yet. Speak or type to begin.
          </div>
        ) : (
          items.slice(-5).map((item, idx) => {
            const isUser = item.sender === 'user'
            return (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs py-1 border-b border-purple-500/10 last:border-none"
              >
                <span className="font-mono text-text-muted text-[11px] shrink-0">
                  {item.time || '12:00'}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase shrink-0 ${
                    isUser
                      ? 'bg-purple-500/15 text-purple-200 border border-purple-400/30'
                      : 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                  }`}
                >
                  {isUser ? 'Sharanu' : (item.interviewer && item.interviewer !== 'ZORO' ? item.interviewer : 'CAREERAI')}
                </span>
                <p className="flex-1 text-white text-xs truncate font-sans tracking-wide">
                  {item.text}
                </p>
                {!isUser && onSpeak && (
                  <button
                    onClick={() => onSpeak(item.text)}
                    className="p-1 rounded text-text-muted hover:text-purple-300 hover:bg-purple-950/40 transition-colors"
                    title="Speak this response aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {item.metrics && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded bg-black/60 border border-purple-500/30 text-[9px] font-mono text-purple-300">
                    {item.metrics.wpm ? `${item.metrics.wpm} WPM` : ''}
                    {item.metrics.eyeContact ? ` • ${item.metrics.eyeContact}% Eye` : ''}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default HistoryPanel
