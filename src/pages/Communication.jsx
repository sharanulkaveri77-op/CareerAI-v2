import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  BookOpen,
  Target,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner } from '../components/Feedback'
import { COMMUNICATION_TOPICS, evaluateCommunication } from '../api/communication'

export default function Communication() {
  const [selectedTopic, setSelectedTopic] = useState(COMMUNICATION_TOPICS[0])
  const [userText, setUserText] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [recognition, setRecognition] = useState(null)

  // Initialize Speech Recognition (Dictation) if supported
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setUserText((prev) => (prev ? `${prev} ${transcript}` : transcript))
      }

      rec.onerror = () => setListening(false)
      rec.onend = () => setListening(false)
      setRecognition(rec)
    }
  }, [])

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please type your response.')
      return
    }
    if (listening) {
      recognition.stop()
      setListening(false)
    } else {
      try {
        recognition.start()
        setListening(true)
      } catch {
        setListening(false)
      }
    }
  }

  const toggleSpeakModelAnswer = (textToSpeak) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.')
      return
    }
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    } else {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.rate = 0.95
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      setSpeaking(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleEvaluate = async () => {
    if (!userText.trim() || evaluating) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
    setEvaluating(true)
    setFeedback(null)
    try {
      const res = await evaluateCommunication({
        topicId: selectedTopic.title,
        text: userText.trim(),
      })
      setFeedback(res)
    } catch {
      setFeedback({
        clarityScore: 15,
        professionalismRating: 'Needs Polish',
        topicRelevance: 'Off-Topic / Incorrect',
        grammarFeedback: 'Your response is incomplete or off-topic. Please address the prompt with a full STAR answer (~75-150 words).',
        modelAnswer: 'A full response for this prompt should include your background, relevant projects, and career goals...',
      })
    } finally {
      setEvaluating(false)
    }
  }

  const wordCount = userText.trim().split(/\s+/).filter(Boolean).length
  const isShort = wordCount > 0 && wordCount < 8

  return (
    <AppShell>
      <PageHeader
        icon={MessageSquare}
        title="Communication Coach"
        subtitle="Practice self-introductions, HR responses, and oral speech clarity with AI evaluation"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic selector */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Practice Modules ({COMMUNICATION_TOPICS.length})
          </h3>
          {COMMUNICATION_TOPICS.map((topic) => {
            const isSelected = selectedTopic.id === topic.id
            return (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic)
                  setFeedback(null)
                  setUserText('')
                  if (speaking) window.speechSynthesis.cancel()
                  setSpeaking(false)
                }}
                className={
                  'w-full text-left p-4 rounded-xl card transition border ' +
                  (isSelected
                    ? 'border-accent bg-accent/15 shadow-glow-purple'
                    : 'border-white/10 hover:border-white/20')
                }
              >
                <p className="font-semibold text-heading text-sm">{topic.title}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{topic.prompt}</p>
              </button>
            )
          })}
        </div>

        {/* Evaluation Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="badge bg-accent/20 text-accent-light border border-accent/30 text-xs font-bold">
                {selectedTopic.title}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {wordCount} Words {isShort ? '(Too short)' : wordCount <= 150 ? ' (Ideal length)' : '(Detailed)'}
              </span>
            </div>

            <p className="text-sm font-bold text-heading leading-relaxed">
              {selectedTopic.prompt}
            </p>

            <div className="relative">
              <textarea
                className="input resize-none text-xs leading-relaxed pr-12"
                rows={6}
                placeholder="Type or click the Microphone button to dictate your answer..."
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
              />
              {/* Mic Dictation Toggle */}
              <button
                type="button"
                onClick={toggleListening}
                className={
                  'absolute right-3 bottom-3 p-2 rounded-xl transition border ' +
                  (listening
                    ? 'bg-danger text-white border-danger animate-pulse'
                    : 'bg-base-800 text-gray-400 border-white/10 hover:text-white')
                }
                title={listening ? 'Stop Microphone' : 'Dictate with Microphone'}
              >
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            {isShort && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-orange/15 border border-orange/30 text-xs text-orange">
                <AlertTriangle size={14} className="shrink-0" />
                <span>Single greetings or short words will be marked Off-Topic / Low Score. Provide a full STAR response (~75–150 words).</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setUserText(selectedTopic.sample)}
                className="text-xs text-gray-400 hover:text-white underline flex items-center gap-1"
              >
                <BookOpen size={13} /> Load Sample Answer
              </button>

              <button
                type="button"
                onClick={handleEvaluate}
                disabled={evaluating || !userText.trim()}
                className="btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2"
              >
                {evaluating ? (
                  <Spinner size={14} />
                ) : (
                  <>
                    <Sparkles size={14} /> Evaluate with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Feedback Report */}
          {feedback && (
            <div className="card p-6 border-teal/30 bg-gradient-to-br from-teal/10 via-base-850 to-transparent space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-heading text-base flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-teal" /> Communication Evaluation Report
                </h3>
                <span
                  className={
                    'badge text-sm font-black px-3 py-1 ' +
                    (feedback.clarityScore >= 75
                      ? 'bg-teal/20 text-teal'
                      : feedback.clarityScore >= 50
                        ? 'bg-orange/20 text-orange'
                        : 'bg-danger/20 text-danger')
                  }
                >
                  Clarity Score: {feedback.clarityScore}/100
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-base-900 border border-white/5 rounded-xl p-3.5">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Target size={13} className="text-accent-light" /> Topic Relevance
                  </p>
                  <div className="mt-1">
                    {feedback.topicRelevance === 'Relevant & Correct' || feedback.topicRelevance === 'Relevant' ? (
                      <span className="badge bg-teal/20 text-teal text-xs font-bold">Relevant & Correct ✓</span>
                    ) : feedback.topicRelevance === 'Partially Relevant' ? (
                      <span className="badge bg-orange/20 text-orange text-xs font-bold">Partially Relevant ⚠️</span>
                    ) : (
                      <span className="badge bg-danger/20 text-danger text-xs font-bold">Off-Topic / Incorrect ✗</span>
                    )}
                  </div>
                </div>

                <div className="bg-base-900 border border-white/5 rounded-xl p-3.5">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                    Professionalism Rating
                  </p>
                  <p className="text-sm font-extrabold text-heading mt-1">
                    {feedback.professionalismRating || 'Needs Polish'}
                  </p>
                </div>

                <div className="bg-base-900 border border-white/5 rounded-xl p-3.5">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                    AI Evaluation Engine
                  </p>
                  <p className="text-xs text-teal font-semibold mt-1">
                    Gemini 2.5 Flash
                  </p>
                </div>
              </div>

              <div className="bg-base-900 border border-white/5 rounded-xl p-4 space-y-1">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                  Vocabulary & Correctness Analysis
                </p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {feedback.grammarFeedback}
                </p>
              </div>

              {feedback.modelAnswer && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-accent-light uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} /> AI Polished Model Answer
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleSpeakModelAnswer(feedback.modelAnswer)}
                      className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1.5 text-accent-light hover:text-white"
                    >
                      {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      {speaking ? 'Stop Listening' : 'Listen to Answer'}
                    </button>
                  </div>
                  <div className="bg-base-900 border border-accent/30 rounded-xl p-4 text-xs text-gray-200 leading-relaxed font-sans shadow-glow-purple">
                    {feedback.modelAnswer}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
