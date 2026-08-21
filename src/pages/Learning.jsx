import { useEffect, useMemo, useState } from 'react'
import {
  GraduationCap,
  Search,
  ExternalLink,
  FileText,
  Video as VideoIcon,
  BookOpen,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner, Skeleton, ErrorState } from '../components/Feedback'
import { getLearning } from '../api/learning'

const TYPE_ICON = {
  article: FileText,
  video: VideoIcon,
  course: BookOpen,
}
const TYPE_COLOR = {
  article: 'bg-blue/15 text-blue',
  video: 'bg-danger/15 text-danger',
  course: 'bg-teal/15 text-teal',
}

export default function Learning() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    let active = true
    getLearning()
      .then((res) => active && setItems(res.data?.materials || res.data || []))
      .catch((e) => active && setError(e.userMessage || 'Failed to load materials'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

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

  return (
    <AppShell>
      <PageHeader
        icon={GraduationCap}
        title="Learning"
        subtitle="Curated materials to level up your skills"
      />

      {/* Filter bar */}
      <div className="card p-4 flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-10"
            placeholder="Search by skill or topic…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="input max-w-[200px]"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c || 'all'} value={c}>
              {c || 'All categories'}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4">
              <GraduationCap size={32} className="text-accent-light" />
            </div>
            <p className="text-white font-semibold">No materials found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try a different search or category.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => {
            const Icon = TYPE_ICON[m.type] || FileText
            return (
              <div key={m._id || i} className="card card-hover p-5 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className={'badge ' + (TYPE_COLOR[m.type] || 'bg-white/5 text-gray-300')}>
                    <Icon size={12} /> {m.type}
                  </span>
                  {m.category && (
                    <span className="text-xs text-gray-500">{m.category}</span>
                  )}
                </div>
                <h3 className="font-semibold text-white mt-3">{m.title}</h3>
                <p className="text-sm text-gray-400 mt-2 flex-1">{m.description}</p>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost mt-4 self-start"
                >
                  Open <ExternalLink size={14} />
                </a>
              </div>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
