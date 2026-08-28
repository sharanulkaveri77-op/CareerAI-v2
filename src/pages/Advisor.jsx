import { useEffect, useRef, useState } from 'react'
import { Sparkles, Send, User, Bot, RefreshCw } from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner } from '../components/Feedback'
import { sendChat } from '../api/advisor'

export default function Advisor() {
  const [messages, setMessages] = useState([]) // {role, content}
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setError('')
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setSending(true)
    try {
      const res = await sendChat(text, messages)
      const reply = res.data?.reply || 'Sorry, I could not generate a response.'
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(e.userMessage || 'Advisor is unavailable right now.')
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: '⚠️ I’m having trouble connecting to AI Advisor. Please try again.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleResetChat = () => {
    setMessages([])
    setError('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AppShell>
      <PageHeader
        icon={Sparkles}
        title="AI Advisor"
        subtitle="Your personal career copilot"
        actions={
          messages.length > 0 && (
            <button
              onClick={handleResetChat}
              className="btn-ghost flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
            >
              <RefreshCw size={14} /> New Chat
            </button>
          )
        }
      />

      <div className="card flex flex-col h-[calc(100vh-220px)] min-h-[440px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && !sending && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-purple shadow-glow-purple mb-4">
                <Sparkles size={32} className="text-white" />
              </div>
              <p className="text-heading font-bold text-lg">AI Advisor</p>
              <p className="text-xs text-gray-400 mt-1 max-w-md leading-relaxed">
                Ask me anything! Technical code questions, algorithm explanations, system design architecture, or career guidance.
              </p>

              {/* Sample Prompt Chips */}
              <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-lg">
                {[
                  'What is the date today?',
                  'Explain React useMemo vs useCallback',
                  'How to prepare for System Design?',
                  'Give me a 90-day learning roadmap',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setInput(chip)
                    }}
                    className="px-3 py-1.5 rounded-xl bg-base-900 border border-white/10 text-xs text-gray-300 hover:border-accent/40 hover:text-white transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={
                'flex gap-3 ' +
                (m.role === 'user' ? 'justify-end' : 'justify-start')
              }
            >
              {m.role === 'assistant' && (
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-purple shrink-0 shadow-glow-purple">
                  <Bot size={18} className="text-white" />
                </div>
              )}
              <div
                className={
                  'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap font-sans ' +
                  (m.role === 'user'
                    ? 'bg-gradient-purple text-white rounded-br-sm shadow-glow-purple'
                    : 'bg-base-850 border-l-2 border-accent text-gray-200 rounded-bl-sm border border-white/5')
                }
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 shrink-0">
                  <User size={18} className="text-gray-300" />
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-purple shrink-0 animate-pulse">
                <Bot size={18} className="text-white" />
              </div>
              <div className="bg-base-850 border-l-2 border-accent rounded-2xl rounded-bl-sm px-4 py-3 border border-white/5">
                <Spinner size={14} />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/5 p-4 bg-base-900/50">
          {error && <p className="text-xs text-danger mb-2">{error}</p>}
          <div className="flex items-end gap-3">
            <textarea
              rows={2}
              className="input resize-none text-xs leading-relaxed"
              placeholder="Ask AI Advisor anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="btn-primary h-[50px] px-6 text-xs font-bold shrink-0 flex items-center justify-center"
            >
              {sending ? <Spinner size={14} /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
