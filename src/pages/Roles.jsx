import { useEffect, useState } from 'react'
import {
  Search,
  Bookmark,
  BookmarkPlus,
  TrendingUp,
  DollarSign,
  X,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner, ErrorState, Skeleton } from '../components/Feedback'
import {
  searchRoles,
  getSavedRoles,
  saveRole,
  removeSavedRole,
} from '../api/roles'

function RoleCard({ role, saved, onSave, onRemove }) {
  return (
    <div className="card card-hover p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-heading">{role.title}</h3>
        <button
          onClick={() => (saved ? onRemove(role) : onSave(role))}
          title={saved ? 'Remove' : 'Save'}
          className={
            'shrink-0 ' + (saved ? 'text-accent-light' : 'text-gray-500 hover:text-heading')
          }
        >
          {saved ? <Bookmark size={18} /> : <BookmarkPlus size={18} />}
        </button>
      </div>
      <p className="text-sm text-gray-400 mt-2 flex-1">{role.summary}</p>
      <div className="flex flex-wrap gap-2 mt-4">
        {role.demand != null && (
          <span className="badge bg-teal/15 text-teal">
            <TrendingUp size={12} /> Demand {role.demand}
          </span>
        )}
        {role.salary != null && (
          <span className="badge bg-blue/15 text-blue">
            <DollarSign size={12} /> {role.salary}
          </span>
        )}
      </div>
    </div>
  )
}

export default function Roles() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [saved, setSaved] = useState([])
  const [savedLoading, setSavedLoading] = useState(true)

  useEffect(() => {
    let active = true
    getSavedRoles()
      .then((res) => active && setSaved(res.data?.roles || res.data || []))
      .catch(() => {})
      .finally(() => active && setSavedLoading(false))
    return () => {
      active = false
    }
  }, [])

  const onSearch = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setSearchError('')
    try {
      const res = await searchRoles(query.trim())
      setResults(res.data?.roles || res.data || [])
    } catch (err) {
      setSearchError(err.userMessage || 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  const isSaved = (role) =>
    saved.some((s) => s._id === role._id || s.title === role.title)

  const onSave = async (role) => {
    try {
      const res = await saveRole(role)
      const created = res.data?.role || role
      setSaved((prev) => [...prev, created])
    } catch (err) {
      setSearchError(err.userMessage || 'Could not save role')
    }
  }

  const onRemove = async (role) => {
    // Search-result cards don't carry the DB id — resolve via the saved row.
    const row = saved.find(
      (s) => s._id === role._id || s.title === role.title
    )
    if (!row?._id) return
    try {
      await removeSavedRole(row._id)
      setSaved((prev) =>
        prev.filter((s) => s._id !== role._id && s.title !== role.title)
      )
    } catch (err) {
      setSearchError(err.userMessage || 'Could not remove role')
    }
  }

  return (
    <AppShell>
      <PageHeader
        icon={Search}
        title="Explore Roles"
        subtitle="Discover and track career opportunities"
      />

      {searchError && (
        <p className="text-xs text-danger mb-3">{searchError}</p>
      )}

      {/* Search */}
      <form onSubmit={onSearch} className="card p-4 flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-10"
            placeholder="Search roles... (e.g., 'AI engineer', 'data science', 'product management')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" disabled={searching} className="btn-primary">
          {searching ? <Spinner /> : 'Explore'}
        </button>
      </form>

      {/* Results */}
      {searching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r, i) => (
            <RoleCard
              key={r._id || i}
              role={r}
              saved={isSaved(r)}
              onSave={onSave}
              onRemove={onRemove}
            />
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4">
              <Search size={32} className="text-accent-light" />
            </div>
            <p className="text-heading font-semibold">Search roles to begin</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Use the search bar above to find AI-curated roles matched to your
              interests.
            </p>
          </div>
        </div>
      )}

      {/* Saved roles */}
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mt-10 mb-4">
        Saved Roles ({saved.length})
      </h3>
      {savedLoading ? (
        <Skeleton className="h-40" />
      ) : saved.length === 0 ? (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-3">
              <BookmarkPlus size={26} className="text-accent-light" />
            </div>
            <p className="text-heading font-semibold">No saved roles</p>
            <p className="text-sm text-gray-500 mt-1">
              Search and save roles you're interested in to track them here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((r, i) => (
            <div key={r._id || i} className="relative">
              <RoleCard
                role={r}
                saved={true}
                onSave={onSave}
                onRemove={onRemove}
              />
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
