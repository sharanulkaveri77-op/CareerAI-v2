import { useEffect, useMemo, useState } from 'react'
import {
  GraduationCap,
  Search,
  ExternalLink,
  FileText,
  Video as VideoIcon,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  BookMarked,
  HelpCircle,
  Play,
  Code,
  Check,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { Spinner, Skeleton, ErrorState } from '../components/Feedback'
import { getLearning, DEFAULT_MATERIALS } from '../api/learning'

const TYPE_ICON = {
  article: FileText,
  video: VideoIcon,
  course: BookOpen,
}
const TYPE_COLOR = {
  article: 'bg-blue/15 text-blue border border-blue/30',
  video: 'bg-danger/15 text-danger border border-danger/30',
  course: 'bg-teal/15 text-teal border border-teal/30',
}

const LOCAL_COMPLETED_KEY = 'careeriq_completed_learning'

export default function Learning() {
  const [items, setItems] = useState(DEFAULT_MATERIALS)
  const [loading, setLoading] = useState(true)
  const [searchingAi, setSearchingAi] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [completedIds, setCompletedIds] = useState([])
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_COMPLETED_KEY)
      if (saved) {
        setCompletedIds(JSON.parse(saved))
      }
    } catch {
      /* ignore */
    }

    let active = true
    getLearning()
      .then((res) => active && setItems(res.data?.materials || DEFAULT_MATERIALS))
      .catch((e) => active && setError(e.userMessage || 'Failed to load materials'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const toggleCompleted = (id) => {
    setCompletedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try {
        localStorage.setItem(LOCAL_COMPLETED_KEY, JSON.stringify(updated))
        const activeMat = items.find((m) => m._id === id) || items[0]
        if (activeMat) {
          const isDone = updated.includes(activeMat._id)
          localStorage.setItem('careeriq_active_learning', JSON.stringify({
            title: activeMat.title,
            progressPct: isDone ? 100 : 50,
            subtitle: `${activeMat.category || 'Course'} · ${isDone ? 'Completed' : 'In Progress'}`,
          }))
        }
      } catch {
        /* noop */
      }
      return updated
    })
  }

  const handleAiCurate = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setSearchingAi(true)
    setError('')
    try {
      const res = await getLearning({ topic: query.trim() })
      if (res.data?.materials && res.data.materials.length > 0) {
        setItems(res.data.materials)
      }
    } catch {
      /* non-fatal */
    } finally {
      setSearchingAi(false)
    }
  }

  const categories = useMemo(
    () => ['', ...new Set(items.map((i) => i.category).filter(Boolean))],
    [items]
  )

  const filtered = items.filter((i) => {
    const matchesQ =
      !query ||
      i.title?.toLowerCase().includes(query.toLowerCase()) ||
      i.description?.toLowerCase().includes(query.toLowerCase())
    const matchesC = !category || i.category === category
    return matchesQ && matchesC
  })

  const completedCount = completedIds.length
  const completionPercentage = items.length ? Math.round((completedCount / items.length) * 100) : 0

  return (
    <AppShell>
      <PageHeader
        icon={GraduationCap}
        title="Learning Hub"
        subtitle="Curated courses, technical lessons, and hands-on learning paths."
      />

      {/* Progress & Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/20 text-accent-light">
            <BookMarked size={20} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-heading">{items.length}</p>
            <p className="text-xs text-gray-400">Total Materials</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-teal/20 text-teal">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-heading">{completedCount} / {items.length}</p>
            <p className="text-xs text-gray-400">Completed Modules</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-orange/20 text-orange">
            <Award size={20} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-heading">
              {completionPercentage}%
            </p>
            <p className="text-xs text-gray-400">Skill Track Completion</p>
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="flex items-center gap-2 p-3.5 rounded-xl bg-accent/15 border border-accent/30 text-xs text-accent-light mb-6">
        <HelpCircle size={16} className="shrink-0" />
        <span>
          <strong>In-App Course Reader:</strong> Click <strong>Start Learning</strong> on any card to read modules, watch video lectures, and complete lessons directly inside CareerAI without leaving the app!
        </span>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleAiCurate} className="card p-4 flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-10 text-xs"
            placeholder="Search topic or technical skill (e.g., 'Next.js 14', 'GraphQL APIs', 'Docker')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            className="input text-xs max-w-[180px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c || 'all'} value={c}>
                {c || 'All Categories'}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={searchingAi || !query.trim()}
            className="btn-primary text-xs px-4 py-2.5 font-semibold flex items-center gap-1.5 shrink-0"
          >
            {searchingAi ? <Spinner size={14} /> : <BookOpen size={14} />} Curate Courses
          </button>
        </div>
      </form>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-4/5 mt-1" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center text-accent-light mb-3">
            <GraduationCap size={32} />
          </div>
          <p className="font-bold text-heading text-base">No learning materials found</p>
          <p className="text-xs text-gray-400 mt-1 max-w-md">
            Search for topics or browse categories above to find technical learning materials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => {
            const Icon = TYPE_ICON[m.type] || FileText
            const idToUse = m._id || `m-${i}`
            const isCompleted = completedIds.includes(idToUse)
            return (
              <div
                key={idToUse}
                className={
                  'card card-hover p-5 flex flex-col justify-between border transition ' +
                  (isCompleted ? 'border-teal/40 bg-teal/5' : 'border-white/10')
                }
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={'badge text-[10px] uppercase font-bold px-2.5 py-0.5 ' + (TYPE_COLOR[m.type] || 'bg-white/5 text-gray-300')}>
                      <Icon size={12} /> {m.type}
                    </span>
                    {m.category && (
                      <span className="text-[11px] text-gray-400 font-medium">
                        {m.category}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-heading text-sm mt-3 leading-snug">
                    {m.title}
                  </h3>

                  <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-gray-500" /> {m.duration || 'Self-Paced'}
                    </span>
                    {m.level && (
                      <span className="badge bg-white/5 text-gray-300 text-[10px]">
                        {m.level}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCompleted(idToUse)}
                      className={
                        'px-2 py-1.5 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1 ' +
                        (isCompleted
                          ? 'bg-teal/20 text-teal border-teal/40'
                          : 'bg-base-900 text-gray-400 border-white/10 hover:text-white')
                      }
                      title={isCompleted ? 'Mark Incomplete' : 'Mark as Completed'}
                    >
                      <CheckCircle2 size={13} /> {isCompleted ? 'Done' : 'Mark'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMaterial(m)}
                      className="btn-primary text-[11px] px-3 py-1.5 font-semibold flex items-center gap-1"
                    >
                      Start Learning <Play size={11} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* In-App Course Reader & Video Player Modal */}
      {selectedMaterial && (
        <Modal
          open={!!selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          title={selectedMaterial.title}
        >
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header info */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={'badge text-xs uppercase font-bold px-2.5 py-0.5 ' + (TYPE_COLOR[selectedMaterial.type] || 'bg-white/5 text-gray-300')}>
                  {selectedMaterial.type}
                </span>
                <span className="text-xs text-gray-400 font-medium">{selectedMaterial.category}</span>
                <span className="text-xs text-gray-500">· {selectedMaterial.duration || 'Self-Paced'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCompleted(selectedMaterial._id)}
                  className={
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ' +
                    (completedIds.includes(selectedMaterial._id)
                      ? 'bg-teal text-base-950 font-black'
                      : 'bg-teal/20 text-teal border border-teal/40 hover:bg-teal/30')
                  }
                >
                  <CheckCircle2 size={14} /> {completedIds.includes(selectedMaterial._id) ? 'Completed ✓' : 'Mark as Completed'}
                </button>

                <a
                  href={selectedMaterial.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gray-400 hover:text-white underline flex items-center gap-1"
                >
                  External Tab <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Embed Video if Video Type */}
            {selectedMaterial.type === 'video' && selectedMaterial.embedVideoUrl ? (
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black">
                <iframe
                  src={selectedMaterial.embedVideoUrl}
                  title={selectedMaterial.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null}

            {/* Course Overview */}
            <div className="bg-base-900 border border-white/5 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-accent-light">Overview</h4>
              <p className="text-xs text-gray-200 leading-relaxed font-sans">
                {selectedMaterial.content?.overview || selectedMaterial.description}
              </p>
            </div>

            {/* Modules / Curriculum */}
            {selectedMaterial.content?.modules && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-heading flex items-center gap-1.5">
                  <BookOpen size={14} className="text-teal" /> Curriculum & Lesson Modules
                </h4>
                <div className="space-y-1.5">
                  {selectedMaterial.content.modules.map((mod, idx) => (
                    <div key={idx} className="bg-base-900 border border-white/5 rounded-lg p-3 text-xs text-gray-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal/20 text-teal font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      {mod}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Takeaways */}
            {selectedMaterial.content?.keyTakeaways && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-heading flex items-center gap-1.5">
                  <Check size={14} className="text-teal" /> Key Takeaways
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {selectedMaterial.content.keyTakeaways.map((take, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-base-900 p-2.5 rounded-lg border border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal mt-1.5 shrink-0" />
                      {take}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Code Example Snippet */}
            {selectedMaterial.content?.codeSnippet && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-heading flex items-center gap-1.5">
                  <Code size={14} className="text-accent-light" /> Interactive Code Implementation
                </h4>
                <pre className="bg-base-950 border border-white/10 rounded-xl p-4 text-xs font-mono text-teal overflow-x-auto leading-relaxed">
                  <code>{selectedMaterial.content.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
