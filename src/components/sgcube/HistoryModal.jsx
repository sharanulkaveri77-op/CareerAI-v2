import React from 'react'
import { X, Clock, RefreshCw, Bot, User } from 'lucide-react'

export const HistoryModal = ({
  isOpen,
  onClose,
  history = [],
  onClearHistory,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="hud-panel w-full max-w-2xl bg-[#0F081E]/95 border border-purple-400/50 p-6 rounded-xl shadow-[0_0_40px_rgba(131,62,239,0.35)] flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5 text-purple-400">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold tracking-wider font-mono">
              CONVERSATION ARCHIVE & SESSION LOGS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {onClearHistory && (
              <button
                onClick={onClearHistory}
                className="px-2.5 py-1 rounded bg-black/40 border border-red-500/30 text-red-300 hover:bg-red-950/40 text-xs font-mono"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded border border-purple-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-purple-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sessions & Messages List */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-text-muted italic">
              No session dialogue recorded yet.
            </div>
          ) : (
            history.map((m, idx) => {
              const isUser = m.sender === 'user'
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs font-sans ${
                    isUser
                      ? 'bg-black/50 border-purple-500/20 ml-6'
                      : 'bg-purple-950/40 border-purple-400/30 mr-6 text-purple-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-text-muted mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {isUser ? (
                        <>
                          <User className="w-3 h-3 text-text-secondary" />
                          <span className="font-bold text-white">Sharanu</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 text-purple-400" />
                          <span className="text-purple-300 font-bold">CAREERAI 3.8</span>
                        </>
                      )}
                    </div>
                    <span>{m.time}</span>
                  </div>
                  <p className="leading-relaxed text-gray-200">{m.text}</p>
                  {m.metrics && (
                    <div className="mt-2 pt-1.5 border-t border-purple-500/15 flex items-center gap-3 text-[10px] font-mono text-purple-300">
                      {m.metrics.wpm && <span>Pacing: <strong>{m.metrics.wpm} WPM</strong></span>}
                      {m.metrics.eyeContact && <span>Eye Contact: <strong>{m.metrics.eyeContact}%</strong></span>}
                      {m.metrics.fillerWords !== undefined && <span>Filler Words: <strong>{m.metrics.fillerWords}</strong></span>}
                      {m.metrics.deliveryScore && <span>Delivery Grade: <strong>{m.metrics.deliveryScore}%</strong></span>}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-purple-500/10">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-purple-950/60 border border-purple-400/50 text-purple-200 text-xs font-mono hover:bg-purple-900/60 transition-colors"
          >
            Close Logs
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistoryModal
