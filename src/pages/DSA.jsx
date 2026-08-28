import { useState } from 'react'
import {
  Code2,
  CheckCircle2,
  Circle,
  Lightbulb,
  BookOpen,
  Filter,
  Flame,
  Award,
  Zap,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import {
  DSA_CATEGORIES,
  SAMPLE_DSA_PROBLEMS,
  getSolvedProblems,
  toggleSolveProblem,
} from '../api/dsa'

export default function DSA() {
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [solvedIds, setSolvedIds] = useState(getSolvedProblems())
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  const handleToggleSolve = (id) => {
    const updated = toggleSolveProblem(id)
    setSolvedIds(updated)
  }

  const filteredProblems = SAMPLE_DSA_PROBLEMS.filter((p) => {
    const matchesCat = category === 'All' || p.category === category
    const matchesDiff = difficulty === 'All' || p.difficulty === difficulty
    return matchesCat && matchesDiff
  })

  const totalCount = SAMPLE_DSA_PROBLEMS.length
  const solvedCount = solvedIds.length
  const easyCount = SAMPLE_DSA_PROBLEMS.filter(
    (p) => p.difficulty === 'Easy' && solvedIds.includes(p.id)
  ).length
  const mediumCount = SAMPLE_DSA_PROBLEMS.filter(
    (p) => p.difficulty === 'Medium' && solvedIds.includes(p.id)
  ).length

  return (
    <AppShell>
      <PageHeader
        icon={Code2}
        title="DSA Practice Platform"
        subtitle="Master Data Structures & Algorithms with categorized challenges"
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-5 flex items-center justify-between border-purple-500/20">
          <div>
            <p className="text-xs text-gray-400">Total Solved</p>
            <p className="text-2xl font-bold text-heading mt-1">
              {solvedCount} / {totalCount}
            </p>
            <p className="text-[11px] text-teal mt-0.5 font-medium">
              {Math.round((solvedCount / totalCount) * 100)}% Completed
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gradient-purple flex items-center justify-center text-white shadow-glow-purple">
            <Award size={22} />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between border-teal/20">
          <div>
            <p className="text-xs text-gray-400">Easy Problems</p>
            <p className="text-2xl font-bold text-heading mt-1">{easyCount}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Foundational topics</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal/20 flex items-center justify-center text-teal">
            <Zap size={22} />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between border-orange/20">
          <div>
            <p className="text-xs text-gray-400">Medium Problems</p>
            <p className="text-2xl font-bold text-heading mt-1">{mediumCount}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Interview standard</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange/20 flex items-center justify-center text-orange">
            <Flame size={22} />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between border-blue/20">
          <div>
            <p className="text-xs text-gray-400">Daily Streak</p>
            <p className="text-2xl font-bold text-heading mt-1">5 Days 🔥</p>
            <p className="text-[11px] text-accent-light mt-0.5 font-medium">Consistency bonus active</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue/20 flex items-center justify-center text-blue">
            <Flame size={22} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {DSA_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ' +
                (category === cat
                  ? 'bg-gradient-purple text-white shadow-glow-purple'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5')
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2 border-l border-white/10 pl-4 shrink-0">
          <Filter size={14} className="text-gray-500" />
          <span className="text-xs text-gray-400 font-medium">Difficulty:</span>
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={
                'px-2.5 py-1 rounded-md text-xs font-semibold transition ' +
                (difficulty === diff
                  ? 'bg-accent/20 text-accent-light border border-accent/40'
                  : 'text-gray-500 hover:text-gray-300')
              }
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problem list table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-base-900/60 border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Status</th>
                <th className="py-3.5 px-4">Problem Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Acceptance</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProblems.map((prob) => {
                const isSolved = solvedIds.includes(prob.id)
                return (
                  <tr key={prob.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleSolve(prob.id)}
                        title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                      >
                        {isSolved ? (
                          <CheckCircle2 size={18} className="text-teal" />
                        ) : (
                          <Circle size={18} className="text-gray-600 hover:text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 font-semibold text-heading">
                      <button
                        onClick={() => {
                          setSelectedProblem(prob)
                          setShowHint(false)
                          setShowSolution(false)
                        }}
                        className="hover:text-accent-light text-left transition"
                      >
                        {prob.title}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400">{prob.category}</td>
                    <td className="py-4 px-4">
                      <span
                        className={
                          'badge text-[11px] ' +
                          (prob.difficulty === 'Easy'
                            ? 'bg-teal/15 text-teal border border-teal/20'
                            : prob.difficulty === 'Medium'
                              ? 'bg-orange/15 text-orange border border-orange/20'
                              : 'bg-danger/15 text-danger border border-danger/20')
                        }
                      >
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400">{prob.acceptance}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProblem(prob)
                          setShowHint(false)
                          setShowSolution(false)
                        }}
                        className="btn-ghost px-3 py-1 text-xs"
                      >
                        Solve
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Problem Modal */}
      {selectedProblem && (
        <Modal
          open={!!selectedProblem}
          onClose={() => setSelectedProblem(null)}
          title={selectedProblem.title}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-3">
              <span
                className={
                  'badge text-xs ' +
                  (selectedProblem.difficulty === 'Easy'
                    ? 'bg-teal/15 text-teal'
                    : selectedProblem.difficulty === 'Medium'
                      ? 'bg-orange/15 text-orange'
                      : 'bg-danger/15 text-danger')
                }
              >
                {selectedProblem.difficulty}
              </span>
              <span className="badge bg-white/5 text-gray-400">
                {selectedProblem.category}
              </span>
            </div>

            <div className="bg-base-900 border border-white/5 rounded-xl p-4 text-sm text-gray-200 leading-relaxed whitespace-pre-line">
              {selectedProblem.description}
            </div>

            {selectedProblem.example && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">
                  Example
                </p>
                <pre className="bg-base-900 border border-white/5 rounded-xl p-3 text-xs font-mono text-gray-300">
                  {selectedProblem.example}
                </pre>
              </div>
            )}

            {/* Hint toggle */}
            <div>
              <button
                onClick={() => setShowHint((h) => !h)}
                className="flex items-center gap-2 text-xs font-semibold text-accent-light hover:underline"
              >
                <Lightbulb size={14} /> {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              {showHint && (
                <p className="mt-2 text-xs text-gray-300 bg-accent/10 border border-accent/20 rounded-xl p-3 leading-relaxed">
                  💡 {selectedProblem.hint}
                </p>
              )}
            </div>

            {/* Solution toggle */}
            <div>
              <button
                onClick={() => setShowSolution((s) => !s)}
                className="flex items-center gap-2 text-xs font-semibold text-teal hover:underline"
              >
                <BookOpen size={14} /> {showSolution ? 'Hide Solution' : 'Show Solution'}
              </button>
              {showSolution && (
                <pre className="mt-2 bg-base-900 border border-white/10 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                  {selectedProblem.solution}
                </pre>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  handleToggleSolve(selectedProblem.id)
                  setSelectedProblem(null)
                }}
                className={
                  'btn-teal px-5 text-xs ' +
                  (solvedIds.includes(selectedProblem.id) ? '!bg-gray-700' : '')
                }
              >
                {solvedIds.includes(selectedProblem.id) ? 'Mark Unsolved' : 'Mark as Solved ✓'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
