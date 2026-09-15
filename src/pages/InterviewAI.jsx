import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Bot,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Gauge,
  AlertTriangle,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner } from '../components/Feedback'
import {
  startInterview,
  submitAnswer,
  getInterviewSummary,
} from '../api/interview'

const TYPES = ['Technical', 'Behavioral', 'System Design', 'HR']

const FILLER_WORDS =
  /\b(um+|uh+|er+|ah+|like|basically|actually|literally|you know|i mean|sort of|kind of)\b/gi

const SpeechRecognitionClass =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition)

function countFillers(text) {
  const matches = text.match(FILLER_WORDS)
  return matches ? matches.length : 0
}

/* ------------------------------ Voice engine ------------------------------ */

function useSpeechEngine({ onFinalText }) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const recRef = useRef(null)
  const wantListeningRef = useRef(false)

  const ensureRec = () => {
    if (!SpeechRecognitionClass) return null
    if (recRef.current) return recRef.current
    const rec = new SpeechRecognitionClass()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onresult = (event) => {
      let finalChunk = ''
      let interimChunk = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        if (res.isFinal) finalChunk += res[0].transcript
        else interimChunk += res[0].transcript
      }
      if (finalChunk.trim()) {
        setInterim('')
        onFinalText(finalChunk.trim())
      } else {
        setInterim(interimChunk)
      }
    }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setVoiceError('Microphone blocked — allow mic access in your browser.')
        wantListeningRef.current = false
        setListening(false)
      } else if (e.error === 'no-speech') {
        /* keep listening */
      }
    }
    rec.onend = () => {
      // Chrome stops after silence — restart while the user wants live input
      if (wantListeningRef.current) {
        try {
          rec.start()
        } catch {
          setListening(false)
        }
      } else {
        setListening(false)
      }
    }

    recRef.current = rec
    return rec
  }

  const start = () => {
    const rec = ensureRec()
    if (!rec) {
      setVoiceError('Voice input is not supported in this browser.')
      return
    }
    setVoiceError('')
    wantListeningRef.current = true
    try {
      rec.start()
      setListening(true)
    } catch {
      /* already started */
      setListening(true)
    }
  }

  const stop = () => {
    wantListeningRef.current = false
    setListening(false)
    setInterim('')
    try {
      recRef.current?.stop()
    } catch {
      /* noop */
    }
  }

  useEffect(
    () => () => {
      wantListeningRef.current = false
      try {
        recRef.current?.abort()
      } catch {
        /* noop */
      }
    },
    []
  )

  return { listening, interim, voiceError, start, stop, supported: !!SpeechRecognitionClass }
}

/* --------------------------------- Meter ---------------------------------- */

const BAR_COUNT = 16

function MicMeter({ analyserRef }) {
  const barsRef = useRef(null)

  useEffect(() => {
    let raf
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const analyser = analyserRef.current
      const bars = barsRef.current?.children
      if (!analyser || !bars) return
      const data = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(data)
      const step = Math.floor(data.length / BAR_COUNT / 2)
      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0
        for (let j = 0; j < step; j++) sum += data[i * step + j] || 0
        const level = Math.min(1, (sum / step / 255) * 2.2)
        const bar = bars[i]
        if (bar) bar.style.height = `${Math.max(12, level * 100)}%`
        if (bar) bar.style.opacity = level > 0.08 ? '1' : '0.4'
      }
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [analyserRef])

  return (
    <div ref={barsRef} className="mic-bar-track">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span key={i} className="mic-bar" />
      ))}
    </div>
  )
}

/* --------------------------------- Page ----------------------------------- */

export default function InterviewAI() {
  const [started, setStarted] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState([])
  const [answering, setAnswering] = useState(false)
  const [ended, setEnded] = useState(false)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  // camera / mic
  const [camState, setCamState] = useState('off') // off | on | denied
  const [camEnabled, setCamEnabled] = useState(true)
  const [ttsOn, setTtsOn] = useState(true)
  const [elapsed, setElapsed] = useState(0)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const questionStartRef = useRef(Date.now())
  const feedEndRef = useRef(null)

  const speech = useSpeechEngine({
    onFinalText: (text) =>
      setAnswer((prev) => (prev ? `${prev} ${text}` : text)),
  })
  const { listening, interim, voiceError, start: startVoice, stop: stopVoice } = speech

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { type: 'Technical' } })

  /* ----------------------------- media handling ---------------------------- */

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      streamRef.current = stream
      setCamState('on')
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      // mic level analyser
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const src = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        src.connect(analyser)
        audioCtxRef.current = ctx
        analyserRef.current = analyser
      } catch {
        /* level meter optional */
      }
    } catch {
      setCamState('denied')
    }
  }

  const teardownMedia = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    analyserRef.current = null
    setCamState('off')
  }

  useEffect(() => {
    return () => {
      teardownMedia()
      window.speechSynthesis?.cancel()
    }
  }, [])

  // session timer
  useEffect(() => {
    if (!started || ended) return undefined
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - questionStartRef.current) / 1000))
    }, 500)
    return () => clearInterval(id)
  }, [started, ended])

  const speakText = (text) => {
    if (!ttsOn || !text) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    } catch {
      /* TTS unsupported */
    }
  }

  // read initial question aloud
  useEffect(() => {
    if (!started || !ttsOn || !question) return
    speakText(question)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, started])

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [feedback])

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setCamEnabled(track.enabled)
  }

  /* ------------------------------ interview flow --------------------------- */

  const onSubmitSetup = async (data) => {
    setError('')
    try {
      const res = await startInterview(data)
      const { sessionId: sid, question: q } = res.data
      setSessionId(sid)
      applyQuestion(q || 'Tell me about yourself.')
      setStarted(true)
      setupMedia()
    } catch (e) {
      setError(e.userMessage || 'Could not start interview')
    }
  }

  const applyQuestion = (q) => {
    setQuestion(q)
    setAnswer('')
    setElapsed(0)
    questionStartRef.current = Date.now()
    speech.stop()
  }

  const buildStats = (ansText) => {
    const words = ansText.trim() ? ansText.trim().split(/\s+/).length : 0
    const seconds = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000))
    const wpm = Math.round((words / seconds) * 60)
    return { words, seconds, wpm: Number.isFinite(wpm) ? wpm : 0, fillers: countFillers(ansText) }
  }

  const onNext = async () => {
    if (!answer.trim()) return
    setAnswering(true)
    stopVoice()
    const stats = buildStats(answer)
    const currentQ = question
    const currentAns = answer
    try {
      const res = await submitAnswer({ sessionId, question: currentQ, answer: currentAns })
      const aiResp = res.data?.aiResponse || 'Thank you for your explanation.'
      const fb = res.data?.feedback || res.data?.coachTip || ''
      const rating = res.data?.rating || 'Good'
      const nextQ = res.data?.nextQuestion || ''

      const item = {
        id: crypto.randomUUID(),
        question: currentQ,
        answer: currentAns,
        aiResponse: aiResp,
        tip: fb,
        rating,
        stats,
      }

      setFeedback((prev) => [...prev, item])
      applyQuestion(nextQ)

      // Spoken 2-way interaction: Speak AI's response & next question
      speakText(`${aiResp}. Next question: ${nextQ}`)
    } catch (e) {
      setError(e.userMessage || 'Failed to submit answer')
    } finally {
      setAnswering(false)
    }
  }

  const onEnd = async () => {
    stopVoice()
    try {
      const res = await getInterviewSummary({
        sessionId,
        history: feedback.map(({ question: q, answer: a, tip }) => ({ question: q, answer: a, tip })),
      })
      setSummary(res.data)
    } catch (e) {
      setError(e.userMessage || 'Could not load summary')
    } finally {
      teardownMedia()
      window.speechSynthesis?.cancel()
      setEnded(true)
    }
  }

  const resetAll = () => {
    setEnded(false)
    setStarted(false)
    setSummary(null)
    setFeedback([])
    setError('')
  }

  /* ------------------------------- derived -------------------------------- */

  const liveWords = answer.trim() ? answer.trim().split(/\s+/).length : 0
  const liveWpm = Math.round((liveWords / Math.max(1, elapsed)) * 60) || 0
  const pace =
    liveWpm === 0 ? '—' : liveWpm < 90 ? 'Slow' : liveWpm > 170 ? 'Fast' : 'Good'

  const fmtClock = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const sessionAgg = (() => {
    const totals = feedback.reduce(
      (acc, f) => {
        acc.words += f.stats.words
        acc.seconds += f.stats.seconds
        acc.fillers += f.stats.fillers
        return acc
      },
      { words: 0, seconds: 0, fillers: 0 }
    )
    return {
      ...totals,
      wpm: totals.seconds > 0 ? Math.round((totals.words / totals.seconds) * 60) : 0,
    }
  })()

  /* -------------------------------- render -------------------------------- */

  return (
    <AppShell>
      <PageHeader
        icon={Bot}
        title="AI Interviewer"
        subtitle="Real-time 2-way voice & interactive mock interview"
      />
      {error && <p className="text-xs text-danger mb-3">{error}</p>}

      {!started && !ended && (
        <form onSubmit={handleSubmit(onSubmitSetup)} className="card p-6 max-w-xl space-y-4">
          <div>
            <label className="label">Role</label>
            <input
              className="input"
              placeholder="e.g. Senior Software Engineer"
              {...register('role', { required: 'Role is required' })}
            />
            {errors.role && (
              <p className="text-xs text-danger mt-1">{errors.role.message}</p>
            )}
          </div>
          <div>
            <label className="label">Interview type</label>
            <select className="input" {...register('type')}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Mic size={13} /> Interactive voice
            </span>
            <span className="flex items-center gap-1.5">
              <Volume2 size={13} /> Spoken responses & questions
            </span>
            <span className="flex items-center gap-1.5">
              <Gauge size={13} /> Real-time feedback
            </span>
          </div>
          <button type="submit" className="btn-primary">
            <Video size={16} /> Start Interactive Interview
          </button>
        </form>
      )}

      {started && !ended && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video + controls */}
          <div className="card p-4 flex flex-col">
            <div className="relative w-full aspect-video rounded-xl bg-base-900 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={'w-full h-full object-cover ' + (!camEnabled ? 'opacity-20' : '')}
              />
              {camState !== 'on' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-purple">
                    <Bot size={28} className="text-white" />
                  </div>
                  <span className="text-xs text-gray-400">
                    {camState === 'denied'
                      ? 'Camera blocked — check browser permissions'
                      : 'Starting camera…'}
                  </span>
                </div>
              )}
              {!camEnabled && camState === 'on' && (
                <span className="absolute top-2 right-2 badge bg-danger/20 text-danger">
                  <VideoOff size={11} /> Off
                </span>
              )}
              {listening && (
                <span className="absolute top-2 left-2 badge bg-teal/20 text-teal animate-pulse">
                  <Mic size={11} /> Listening
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={toggleCamera}
                disabled={camState !== 'on'}
                title={camEnabled ? 'Turn camera off' : 'Turn camera on'}
                className={
                  'btn-ghost px-3 ' + (!camEnabled ? 'text-danger border-danger/40' : '')
                }
              >
                {camEnabled ? <Video size={16} /> : <VideoOff size={16} />}
              </button>
              <button
                onClick={() => setTtsOn((v) => !v)}
                title={ttsOn ? 'Mute AI voice' : 'Unmute AI voice'}
                className={'btn-ghost px-3 ' + (!ttsOn ? 'text-danger border-danger/40' : '')}
              >
                {ttsOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={listening ? stopVoice : startVoice}
                disabled={!speech.supported}
                title={
                  speech.supported
                    ? listening
                      ? 'Stop voice input'
                      : 'Speak answer aloud'
                    : 'Voice input not supported in this browser'
                }
                className={
                  'px-3 ' +
                  (listening ? 'btn-teal animate-pulse' : 'btn-primary')
                }
              >
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            {/* Mic level */}
            <div className="mt-3 rounded-xl border border-white/5 bg-base-900/50 px-3 py-2">
              <MicMeter analyserRef={analyserRef} />
              <p className="text-[10px] text-gray-500 mt-1 text-center">
                {camState === 'on' ? 'Microphone active' : 'Waiting for mic…'}
              </p>
            </div>

            {/* Session clock */}
            <p className="text-center text-xs text-gray-500 mt-3">
              Session · {fmtClock(elapsed)} on this question
            </p>

            <button onClick={onEnd} className="btn-ghost mt-3 text-danger border-danger/30">
              End interview
            </button>
          </div>

          {/* Question + Answer & Conversation Stream */}
          <div className="card p-5 lg:col-span-2 flex flex-col justify-between">
            <div>
              {/* Question Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-purple">
                  <Bot size={18} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-heading">AI Interviewer</span>
                <button
                  onClick={() => speakText(question)}
                  className="ml-auto text-xs text-accent-light hover:underline flex items-center gap-1"
                  title="Re-play question voice"
                >
                  <Volume2 size={13} /> Read Aloud
                </button>
              </div>

              {/* Current Question Box */}
              <div className="bg-base-750 border-l-4 border-accent rounded-xl p-4 text-sm text-gray-100 shadow-md">
                <p className="text-xs uppercase font-bold tracking-wider text-accent-light mb-1">Current Question</p>
                <p className="font-medium leading-relaxed">{question || 'Waiting for question…'}</p>
              </div>

              {/* Answer Input Area */}
              <div className="mt-4">
                <textarea
                  className="input resize-none font-sans"
                  rows={3}
                  placeholder="Tap the mic button to speak your answer, or type here…"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />

                {/* Live transcript + detection strip */}
                {(interim || voiceError) && (
                  <p
                    className={
                      'text-xs mt-2 ' +
                      (voiceError ? 'text-danger flex items-center gap-1' : 'text-accent-light italic')
                    }
                  >
                    {voiceError ? (
                      <>
                        <AlertTriangle size={12} /> {voiceError}
                      </>
                    ) : (
                      `“${interim}”`
                    )}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="badge bg-white/5 text-gray-300 border border-white/10">
                    {liveWords} words
                  </span>
                  <span className="badge bg-white/5 text-gray-300 border border-white/10">
                    {fmtClock(elapsed)}
                  </span>
                  <span
                    className={
                      'badge border border-white/10 ' +
                      (pace === 'Good'
                        ? 'bg-teal/15 text-teal'
                        : pace === 'Fast'
                          ? 'bg-orange/15 text-orange'
                          : 'bg-blue/15 text-blue')
                    }
                  >
                    <Gauge size={11} /> {pace} {liveWpm ? `· ${liveWpm} wpm` : ''}
                  </span>
                  <span className="badge bg-white/5 text-gray-300 border border-white/10">
                    Fillers: {countFillers(answer)}
                  </span>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={onNext}
                    disabled={answering || !answer.trim()}
                    className="btn-primary"
                  >
                    {answering ? (
                      <Spinner />
                    ) : (
                      <>
                        Submit & Interact <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Conversation Timeline */}
            {feedback.length > 0 && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-teal" /> Live Conversation Stream ({feedback.length})
                </h4>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {feedback.map((f, i) => (
                    <div key={f.id || i} className="space-y-2 bg-base-900/60 rounded-xl p-3.5 border border-white/5">
                      {/* Candidate Spoken Answer */}
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs bg-white/10 text-gray-200 px-2 py-0.5 rounded font-semibold shrink-0">Candidate</span>
                        <p className="text-xs text-gray-300 leading-relaxed italic">“{f.answer}”</p>
                      </div>

                      {/* AI Interviewer Spoken Response & Rating */}
                      <div className="flex items-start gap-2.5 bg-accent/10 rounded-lg p-2.5 border border-accent/20">
                        <Bot size={16} className="text-accent-light shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-accent-light">AI Response</span>
                            <span
                              className={
                                'badge text-[10px] ' +
                                (f.rating === 'Strong'
                                  ? 'bg-teal/20 text-teal border border-teal/30'
                                  : f.rating === 'Good'
                                    ? 'bg-blue/20 text-blue border border-blue/30'
                                    : 'bg-orange/20 text-orange border border-orange/30')
                              }
                            >
                              {f.rating || 'Evaluated'}
                            </span>
                          </div>
                          {f.aiResponse && <p className="text-gray-200 font-medium">{f.aiResponse}</p>}
                          <p className="text-gray-400">{f.tip}</p>
                        </div>
                        <button
                          onClick={() => speakText(`${f.aiResponse || ''} ${f.tip}`)}
                          className="text-gray-400 hover:text-white p-1"
                          title="Replay AI Voice"
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div ref={feedEndRef} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {ended && summary && (
        <div className="card p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-heading">Interview Report</h3>
          {summary.source === 'local' && (
            <p className="text-[11px] text-gray-500 mt-1">
              Offline coach — connect the AI backend for deeper evaluation.
            </p>
          )}
          <div className="flex items-end gap-6 mt-2">
            <p className="text-3xl font-bold text-accent-light">{summary.score}/100</p>
            <div className="flex flex-wrap gap-2 pb-1">
              <span className="badge bg-white/5 text-gray-300 border border-white/10">
                {sessionAgg.words} words spoken
              </span>
              <span className="badge bg-white/5 text-gray-300 border border-white/10">
                avg {sessionAgg.wpm} wpm
              </span>
              <span className="badge bg-white/5 text-gray-300 border border-white/10">
                {sessionAgg.fillers} fillers
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-1">{summary.overall}</p>
          {summary.strengths?.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-teal mb-2">Strengths</h4>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {summary.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {summary.improvements?.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-orange mb-2">Improvements</h4>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {summary.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          <button onClick={resetAll} className="btn-ghost mt-6">
            <RotateCcw size={16} /> New interview
          </button>
        </div>
      )}

      {ended && !summary && (
        <div className="card p-6 max-w-2xl text-center">
          <p className="text-sm text-gray-400">Interview ended.</p>
          <button onClick={resetAll} className="btn-ghost mt-4">
            <RotateCcw size={16} /> New interview
          </button>
        </div>
      )}
    </AppShell>
  )
}
