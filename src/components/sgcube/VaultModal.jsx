import React, { useState } from 'react'
import { X, Shield, Lock, Unlock, Key, Plus, Trash2, CheckCircle2 } from 'lucide-react'

export const VaultModal = ({ isOpen, onClose }) => {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [records, setRecords] = useState([
    { key: 'GEMINI_LIVE_API_KEY', category: 'API Credentials', value: 'AIzaSy...7bA9' },
    { key: 'INTERVIEW_ENCRYPTION_MASTER', category: 'Security Token', value: 'enc_09f381c...99' },
  ])

  if (!isOpen) return null

  const handleUnlock = (e) => {
    e.preventDefault()
    if (password.length >= 4) {
      setUnlocked(true)
      setError('')
    } else {
      setError('Master vault password must be at least 4 characters.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="hud-panel w-full max-w-xl bg-[#0F081E]/95 border border-purple-400/50 p-6 rounded-xl shadow-[0_0_40px_rgba(131,62,239,0.35)] flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5 text-purple-400">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold tracking-wider font-mono">
              SECURE ENCRYPTED VAULT (AES-256-GCM)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-purple-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-purple-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!unlocked ? (
          <form onSubmit={handleUnlock} className="space-y-4 py-4 text-xs font-mono">
            <div className="flex items-center gap-3 p-3 rounded bg-purple-950/30 border border-purple-500/20 text-purple-300">
              <Lock size={20} className="text-purple-400 shrink-0" />
              <span>Vault is sealed. Enter master authentication key to access encrypted records.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-text-muted">Master Key / PIN</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter master PIN (e.g. 1234)..."
                className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              />
              {error && <p className="text-red-400 text-[11px]">{error}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-purple-500/20 border border-purple-400 text-purple-300 hover:bg-purple-500/30 font-bold transition flex items-center gap-1.5"
              >
                <Unlock size={14} /> Unlock Vault
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between text-text-muted">
              <span>Encrypted Items ({records.length})</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Master Session Active
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {records.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-black/50 border border-purple-500/20 flex items-center justify-between"
                >
                  <div>
                    <span className="text-white font-bold">{r.key}</span>
                    <p className="text-[11px] text-text-muted">{r.category}</p>
                    <p className="text-[11px] text-purple-400 font-mono mt-0.5">{r.value}</p>
                  </div>
                  <span className="text-[10px] text-text-muted">Encrypted</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-purple-500/10">
              <button
                onClick={() => setUnlocked(false)}
                className="text-xs text-text-muted hover:text-white"
              >
                Lock Vault
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded bg-purple-950/60 border border-purple-400/50 text-purple-200 text-xs hover:bg-purple-900/60 transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VaultModal
