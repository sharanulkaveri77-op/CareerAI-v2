import { useState, useEffect } from 'react'
import {
  HelpCircle,
  Timer,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Brain,
  Calculator,
  MessageSquare,
  Code2,
  Shuffle,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { APTITUDE_CATEGORIES, SAMPLE_QUESTIONS } from '../api/aptitude'

const iconMap = {
  Calculator,
  Brain,
  MessageSquare,
  Code2,
}

function shuffleQuestions(array = []) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function Aptitude() {
  const [activeCategory, setActiveCategory] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!activeCategory || finished) return undefined
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [activeCategory, finished])

  const startTest = (cat) => {
    const rawList = SAMPLE_QUESTIONS[cat.id] || []
    // Shuffle questions so every time user refreshes or starts test, questions are different
    const randomized = shuffleQuestions(rawList)
    setActiveCategory(cat)
    setQuestions(randomized)
    setCurrentIdx(0)
    setUserAnswers({})
    setTimeLeft(300)
    setFinished(false)
  }

  const selectOption = (optIdx) => {
    if (finished) return
    setUserAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }))
  }

  const fmtTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correct) correct++
    })
    const pct = Math.round((correct / (questions.length || 1)) * 100)
    try {
      localStorage.setItem('careeriq_aptitude_score', JSON.stringify(pct))
    } catch {
      /* noop */
    }
    return {
      correct,
      total: questions.length,
      pct,
    }
  }

  return (
    <AppShell>
      <PageHeader
        icon={HelpCircle}
        title="Aptitude & Technical Assessments"
        subtitle="Timed practice tests for placements and technical screenings (shuffled every test)"
      />

      {/* Category selection view */}
      {!activeCategory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {APTITUDE_CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.icon] || HelpCircle
            return (
              <div key={cat.id} className="card card-hover p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-purple shadow-glow-purple">
                      <Icon size={20} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-heading text-lg">{cat.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{cat.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-gray-500 font-medium">⏱️ 5 Mins · Shuffled Questions</span>
                  <button
                    onClick={() => startTest(cat)}
                    className="btn-primary px-4 py-2 text-xs font-semibold"
                  >
                    Start Test <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Timed Test view */}
      {activeCategory && !finished && (
        <div className="card p-6 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-xs text-accent-light uppercase tracking-wider font-semibold">
                {activeCategory.title}
              </span>
              <h3 className="text-base font-bold text-heading mt-0.5">
                Question {currentIdx + 1} of {questions.length}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => startTest(activeCategory)}
                className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1 text-gray-400 hover:text-white"
                title="Shuffle & Get New Questions"
              >
                <Shuffle size={13} /> Shuffle
              </button>
              <div className="flex items-center gap-2 badge bg-orange/15 text-orange border border-orange/30 px-3 py-1.5 font-mono text-xs">
                <Timer size={14} /> {fmtTime(timeLeft)}
              </div>
            </div>
          </div>

          {questions[currentIdx] ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-heading leading-relaxed">
                {questions[currentIdx].question}
              </p>

              <div className="space-y-2.5 pt-2">
                {questions[currentIdx].options.map((opt, optIdx) => {
                  const selected = userAnswers[currentIdx] === optIdx
                  return (
                    <button
                      key={optIdx}
                      onClick={() => selectOption(optIdx)}
                      className={
                        'w-full text-left p-3.5 rounded-xl border text-xs transition flex items-center justify-between ' +
                        (selected
                          ? 'border-accent bg-accent/15 text-heading font-semibold shadow-glow-purple'
                          : 'border-white/10 bg-base-900/50 text-gray-300 hover:border-white/20')
                      }
                    >
                      <span>{opt}</span>
                      {selected && <CheckCircle2 size={16} className="text-accent-light" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No questions available for this topic.</p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="btn-ghost text-xs disabled:opacity-30"
            >
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((i) => i + 1)}
                className="btn-primary text-xs px-5"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={() => setFinished(true)}
                className="btn-teal text-xs px-5"
              >
                Submit Test ✓
              </button>
            )}
          </div>
        </div>
      )}

      {/* Finished Test Report view */}
      {activeCategory && finished && (
        <div className="card p-6 max-w-3xl mx-auto space-y-6">
          <div className="text-center py-4 border-b border-white/10">
            <h3 className="text-xl font-extrabold text-heading">Test Results Report</h3>
            <p className="text-xs text-gray-400 mt-1">{activeCategory.title}</p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div>
                <p className="text-3xl font-bold text-teal">{calculateScore().pct}%</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">Score</p>
              </div>
              <div className="border-l border-white/10 pl-6">
                <p className="text-3xl font-bold text-heading">
                  {calculateScore().correct} / {calculateScore().total}
                </p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">Correct Answers</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Detailed Answer Explanations
            </h4>
            {questions.map((q, i) => {
              const uAns = userAnswers[i]
              const isCorrect = uAns === q.correct
              return (
                <div key={q.id} className="bg-base-900 border border-white/5 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-200">
                      Q{i + 1}: {q.question}
                    </p>
                    {isCorrect ? (
                      <span className="badge bg-teal/15 text-teal shrink-0">Correct ✓</span>
                    ) : (
                      <span className="badge bg-danger/15 text-danger shrink-0">Incorrect ✗</span>
                    )}
                  </div>
                  <p className="text-gray-400">Your answer: {uAns != null ? q.options[uAns] : 'Not answered'}</p>
                  <p className="text-teal font-medium">Correct answer: {q.options[q.correct]}</p>
                  <p className="text-gray-500 pt-1 border-t border-white/5">💡 {q.explanation}</p>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => setActiveCategory(null)}
              className="btn-ghost text-xs"
            >
              Back to Categories
            </button>
            <button
              onClick={() => startTest(activeCategory)}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <RotateCcw size={14} /> Retake Test (Shuffled)
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
