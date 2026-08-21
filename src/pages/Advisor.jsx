import { useEffect, useRef, useState } from 'react'
import { Sparkles, Send, User, Bot } from 'lucide-react'
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
      // keep user message, show error bubble
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: '⚠️ I’m having trouble connecting. Please try again.',
        },
      ])
    } finally {
      setSending(false)
    }
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
      />

      <div className="card flex flex-col h-[calc(100vh-220px)] min-h-[420px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !sending && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-purple shadow-glow-purple mb-4">
                <Sparkles size={28} className="text-white" />
              </div>
              <p className="text-white font-medium">Ask me anything</p>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                Ask me anything about your career path, skills to learn, or roles
                to target.
              </p>
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
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-purple shrink-0">
                  <Bot size={18} className="text-white" />
                </div>
              )}
              <div
                className={
                  'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ' +
                  (m.role === 'user'
                    ? 'bg-gradient-purple text-white rounded-br-sm'
                    : 'bg-base-750 border-l-2 border-accent text-gray-200 rounded-bl-sm')
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
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-purple shrink-0">
                <Bot size={18} className="text-white" />
              </div>
              <div className="bg-base-750 border-l-2 border-accent rounded-2xl rounded-bl-sm px-4 py-3">
                <Spinner />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 p-4">
          {error && <p className="text-xs text-danger mb-2">{error}</p>}
          <div className="flex items-end gap-3">
            <textarea
              rows={1}
              className="input resize-none"
              placeholder="Type your message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="btn-primary h-[44px] px-5"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
