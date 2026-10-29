import React, { useState, useEffect } from 'react'
import { X, Database, Plus, Trash2, Search, Sparkles, Brain, Award, AlertCircle, CheckCircle2 } from 'lucide-react'
import { emitStorageChange } from '../../utils/storageSync'

const DEFAULT_MEMORIES = [
  {
    id: 'mem-1',
    category: 'Projects & Experience',
    key: 'Distributed Event Pipeline',
    value: 'Architected an event-driven telemetry ingest pipeline with Apache Kafka and Go handling 60,000 req/sec at sub-50ms p99 latency.',
    timestamp: 'Saved from Profile',
  },
  {
    id: 'mem-2',
    category: 'Core Skills',
    key: 'System Architecture & Microservices',
    value: 'Deep expertise in horizontal scaling, database sharding, CQRS, idempotency keys, and gRPC communication protocols.',
    timestamp: 'Saved from Profile',
  },
  {
    id: 'mem-3',
    category: 'STAR Stories',
    key: 'Production Outage Resolution',
    value: 'Situation: Redis cluster cache stampede brought down checkout API. Action: Implemented probabilistic early expiration (XFetch) and circuit breakers. Result: Zero repeat outages under 4x traffic peak.',
    timestamp: 'STAR Framework',
  },
  {
    id: 'mem-4',
    category: 'Improvement Goals',
    key: 'Pacing & Gaze Stability',
    value: 'Target speech rate between 125-145 WPM. Keep eye contact locked above 90% when explaining trade-offs. Avoid conversational filler words like "basically" or "um".',
    timestamp: 'Feedback AI',
  },
]

const CATEGORIES = ['All', 'Projects & Experience', 'Core Skills', 'STAR Stories', 'Improvement Goals']

export const MemoryDetailModal = ({ isOpen, onClose, onMemoryUpdated }) => {
  const [memories, setMemories] = useState(() => {
    try {
      const saved = localStorage.getItem('careeriq_interview_memories')
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_MEMORIES
  })

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState('Projects & Experience')
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  // Sync to local storage
  const persistMemories = (updated) => {
    setMemories(updated)
    try {
      localStorage.setItem('careeriq_interview_memories', JSON.stringify(updated))
      emitStorageChange('interview_memories', updated)
      if (onMemoryUpdated) onMemoryUpdated(updated)
    } catch {}
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newKey.trim() || !newValue.trim()) return
    const newItem = {
      id: `mem-${Date.now()}`,
      category: newCategory,
      key: newKey.trim(),
      value: newValue.trim(),
      timestamp: 'Added by Candidate',
    }
    const updated = [newItem, ...memories]
    persistMemories(updated)
    setNewKey('')
    setNewValue('')
    setIsAdding(false)
  }

  const handleDelete = (id) => {
    const updated = memories.filter((m) => m.id !== id)
    persistMemories(updated)
  }

  const filtered = memories.filter((m) => {
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory
    const matchesSearch =
      m.key.toLowerCase().includes(search.toLowerCase()) ||
      m.value.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="hud-panel w-full max-w-3xl bg-[#0F081E]/95 border border-purple-400/50 p-6 rounded-xl shadow-[0_0_50px_rgba(131,62,239,0.35)] flex flex-col gap-4 text-white max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5 text-purple-400">
            <Database className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold tracking-wider font-mono">
                CANDIDATE MEMORY & CONTEXT EXPLORER
              </h3>
              <p className="text-[11px] text-text-muted font-sans">
                Active knowledge base referenced by the AI interviewer during mock questions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-400/50 text-purple-200 hover:bg-purple-600/50 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? 'Cancel' : 'Add Memory'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded border border-purple-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-purple-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Memory Form */}
        {isAdding && (
          <form
            onSubmit={handleAdd}
            className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex flex-col gap-2.5 animate-fadeIn"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-black/60 border border-purple-500/30 rounded-lg px-2.5 py-1.5 text-xs text-purple-300 font-mono outline-none focus:border-purple-400"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c} className="bg-[#0F081E]">
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Topic / Skill Title (e.g. Distributed Lock Manager)"
                className="flex-1 bg-black/60 border border-purple-500/30 rounded-lg px-3 py-1.5 text-xs text-white font-sans outline-none focus:border-purple-400"
                required
              />
            </div>
            <textarea
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Detailed fact, project outcome, or metrics you want the interviewer to probe..."
              rows={2}
              className="w-full bg-black/60 border border-purple-500/30 rounded-lg p-2.5 text-xs text-white font-sans outline-none focus:border-purple-400 resize-none"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 rounded bg-black/40 text-text-muted hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-xs py-1 px-4 flex items-center gap-1 font-mono"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save to AI Memory</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-sm'
                    : 'bg-black/40 border-purple-500/15 text-text-muted hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memories..."
              className="w-full bg-black/40 border border-purple-500/20 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white font-mono outline-none focus:border-purple-400"
            />
          </div>
        </div>

        {/* Memory Items List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[50vh]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-text-muted font-mono text-xs flex flex-col items-center gap-2">
              <Brain className="w-8 h-8 text-purple-400/40" />
              <span>No memories matching query. Add projects or skills above!</span>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-black/40 border border-purple-500/20 flex flex-col gap-1.5 font-mono text-xs hover:border-purple-400/40 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950/60 text-purple-300 border border-purple-500/30">
                      {item.category}
                    </span>
                    <span className="text-white font-bold text-xs font-sans tracking-wide">
                      {item.key}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted">{item.timestamp}</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-text-muted hover:text-red-400 p-1 transition-colors"
                      title="Forget this memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 text-xs font-sans leading-relaxed tracking-wide">
                  {item.value}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 flex items-center justify-between text-[11px] font-mono text-purple-300/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>
              {memories.length} technical memories loaded • Gemini 3.8 Flash automatically weaves these into interview prompts
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-purple-950/60 border border-purple-400/40 text-purple-200 text-xs hover:bg-purple-900/60 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default MemoryDetailModal

