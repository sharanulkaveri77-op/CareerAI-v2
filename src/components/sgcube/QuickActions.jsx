import React, { useState } from 'react'
import {
  Mic,
  MicOff,
  Camera,
  VideoOff,
  Square,
  Power,
  Send,
  Lightbulb,
  ArrowRight,
  Award,
  RefreshCw,
} from 'lucide-react'

const QUICK_CHIPS = [
  { label: '💡 Request Hint', text: 'Can you give me a simple hint on this question?' },
  { label: '⚡ Next Question', text: 'Let’s advance to the next interview question.' },
  { label: '📊 Score My Answer', text: 'How was my response? Please give me brief feedback and a score.' },
  { label: '🔄 Switch Topic', text: 'Can we switch to a different technical topic for my role?' },
]

export const QuickActions = ({
  status = {},
  state = 'IDLE',
  onSendAction,
}) => {
  const [inputText, setInputText] = useState('')

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    onSendAction('SEND_TEXT', { text: inputText })
    setInputText('')
  }

  const handleChip = (text) => {
    onSendAction('SEND_TEXT', { text })
  }

  const isSleeping = state === 'SLEEPING'

  return (
    <div className="w-full flex flex-col gap-1.5 px-4 py-2 bg-[#0F081E]/95 border-t border-purple-500/20 backdrop-blur-md select-none z-20">
      {/* Top Bar: Action Buttons & Command Input */}
      <div className="flex items-center justify-between gap-3">
        {/* Hardware & Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Wake / Sleep */}
          <button
            onClick={() => onSendAction(isSleeping ? 'WAKE' : 'SLEEP')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm ${
              isSleeping
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400 hover:bg-purple-500/30'
                : 'bg-black/40 text-text-muted border border-purple-500/20 hover:text-white hover:border-purple-400'
            }`}
            title={isSleeping ? 'Wake Assistant' : 'Sleep Mode'}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isSleeping ? 'WAKE' : 'SLEEP'}</span>
          </button>

          {/* Mic Toggle */}
          <button
            onClick={() => onSendAction('TOGGLE_MIC')}
            className="px-3 py-1.5 rounded-md text-xs font-mono text-text-muted border border-purple-500/20 bg-black/40 hover:text-purple-300 hover:border-purple-400 flex items-center gap-1.5 transition-colors"
            title="Toggle Microphone"
          >
            {status.microphone === 'Active' ? (
              <>
                <Mic className="w-3.5 h-3.5 text-purple-400" />
                <span>MIC ACTIVE</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-red-400" />
                <span>MIC MUTED</span>
              </>
            )}
          </button>

          {/* Camera Toggle */}
          <button
            onClick={() => onSendAction('TOGGLE_CAMERA')}
            className="px-3 py-1.5 rounded-md text-xs font-mono text-text-muted border border-purple-500/20 bg-black/40 hover:text-purple-300 hover:border-purple-400 flex items-center gap-1.5 transition-colors"
            title="Toggle Camera"
          >
            {status.camera === 'Active' ? (
              <>
                <Camera className="w-3.5 h-3.5 text-purple-400" />
                <span>CAM ACTIVE</span>
              </>
            ) : (
              <>
                <VideoOff className="w-3.5 h-3.5 text-amber-400" />
                <span>CAM PAUSED</span>
              </>
            )}
          </button>

          {/* Emergency STOP */}
          <button
            onClick={() => onSendAction('STOP')}
            className="px-3 py-1.5 rounded-md text-xs font-mono font-bold text-red-400 border border-red-500/40 bg-red-950/20 hover:bg-red-900/40 flex items-center gap-1.5 transition-colors shadow-[0_0_8px_rgba(239,68,68,0.2)]"
            title="Emergency Stop / Cancel Action"
          >
            <Square className="w-3.5 h-3.5 fill-red-400 text-red-400" />
            <span>STOP</span>
          </button>
        </div>

        {/* Quick Text / Command Prompt Input */}
        <form onSubmit={handleSend} className="flex-1 max-w-lg flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask CAREERAI anything (e.g. 'Conduct a mock interview', 'Check lighting')..."
              className="w-full bg-black/60 border border-purple-500/30 rounded-md px-3 py-1.5 text-xs text-white placeholder-text-muted/60 focus:outline-none focus:border-purple-400 font-sans tracking-wide"
            />
          </div>
          <button
            type="submit"
            className="h-8 px-3 rounded-md bg-purple-950/80 border border-purple-400/50 text-purple-300 hover:bg-purple-900 text-xs font-mono flex items-center gap-1 transition-colors"
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>

      {/* Bottom Bar: Smart Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-mono">
        <span className="text-text-muted text-[10px] uppercase font-bold shrink-0 tracking-wider">
          Quick Actions:
        </span>
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleChip(chip.text)}
            className="px-2.5 py-0.5 rounded-full bg-black/40 border border-purple-500/25 text-purple-300 hover:bg-purple-900/40 hover:border-purple-400 transition-colors shrink-0"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
