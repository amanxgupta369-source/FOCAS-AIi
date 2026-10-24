import { useState, useEffect, useRef } from 'react'
import {
  Send,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Compass,
  Lightbulb,
  ShieldAlert,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Bot,
  User as UserIcon,
  AlertCircle,
} from 'lucide-react'
import { Glass } from '../components/ui'
import type { ChatMessage, Route } from '../types'

const STARTER_PROMPTS = [
  {
    icon: Lightbulb,
    title: 'Find problems worth solving',
    text: "I don't have a startup idea yet. Help me discover real, painful problems worth solving based on my skills and daily observations.",
  },
  {
    icon: ShieldAlert,
    title: 'Challenge an assumption',
    text: "I have an idea: an app that connects freelancers with small local businesses. Respectfully challenge my reasoning and explain why this might fail.",
  },
  {
    icon: HelpCircle,
    title: 'How to interview customers',
    text: 'How should I talk to potential customers to validate a problem without biasing them or asking if they would buy my product?',
  },
  {
    icon: Compass,
    title: 'Test willingness to pay',
    text: 'What is the fastest, simplest experiment I can run this week to test if anyone will pay real money for an idea before writing code?',
  },
]

const STORAGE_KEY = 'focas.thinking.chat.v2'

export default function ThinkingPartner({
  go,
  onStartEvaluation,
  initialTopic,
}: {
  go: (r: Route) => void
  onStartEvaluation: (seed?: string) => void
  initialTopic?: string
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return []
  })

  const [input, setInput] = useState(initialTopic || '')
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const scrollEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialTopic) {
      setInput(initialTopic)
    }
  }, [initialTopic])

  // Persist session history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // ignore
    }
  }, [messages])

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  const send = async (textToSend: string) => {
    const trimmed = textToSend.trim()
    if (!trimmed || busy) return

    setErrorMsg(null)
    setInput('')

    const userMsg: ChatMessage = { role: 'user', text: trimmed }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setBusy(true)

    // Prepare API messages history
    const apiMessages = updatedMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }))

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(new Error('Request timed out')), 25000)

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
        }),
        signal: controller.signal,
      })
      clearTimeout(timer)

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.success) {
        const errorText = data?.message || data?.error || `AI service returned error (Status ${res.status}).`
        setErrorMsg(errorText)
        return
      }

      const replyText = data.message || data.text
      if (!replyText) {
        setErrorMsg('The AI returned an empty response. Please try sending your question again.')
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', text: replyText }])
    } catch (err: any) {
      console.warn('Chat request failed:', err.message)
      const errorText = err.name === 'AbortError' || err.message?.includes('timed out')
        ? 'AI request timed out after 25 seconds. Please try again.'
        : err.message || 'Could not connect to the AI service. Please check your internet connection and try again.'
      setErrorMsg(errorText)
    } finally {
      setBusy(false)
    }
  }

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const handleClear = () => {
    if (messages.length > 0 && window.confirm('Clear conversation history?')) {
      setMessages([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // Detect if conversation mentions a concrete startup idea that could be evaluated
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.text || ''
  const hasSubstantialConversation = messages.length >= 2

  return (
    <div className="rise mx-auto max-w-4xl space-y-4 pb-8">
      {/* Header Banner */}
      <Glass className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-dusk-deep text-white shadow-sm">
              <Sparkles size={16} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-dusk-ink">Think with FOCAS</h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-dusk-mute max-w-xl leading-relaxed">
            Your candid startup thinking partner. Discover real problems, challenge assumptions, brainstorm opportunities, and plan how to validate without guessing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasSubstantialConversation && (
            <button
              onClick={() => {
                const userThemes = messages.filter(m => m.role === 'user').map(m => m.text).join(' ')
                onStartEvaluation(userThemes.slice(0, 300))
              }}
              className="btn-primary text-xs flex items-center gap-1.5 shadow-sm"
              title="Convert this conversation into a structured startup evaluation"
            >
              <span>Evaluate an Idea</span>
              <ArrowRight size={13} />
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="btn-ghost text-xs flex items-center gap-1 text-dusk-mute hover:text-dusk-ink"
              title="Reset conversation"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </Glass>

      {/* Main Conversation Canvas */}
      <Glass className="p-4 sm:p-6 flex flex-col min-h-[550px]">
        {/* Messages List */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1 pb-4" aria-live="polite">
          {messages.length === 0 ? (
            /* Starter Prompts View */
            <div className="flex flex-col items-center justify-center py-8 text-center max-w-lg mx-auto space-y-6">
              <div className="h-12 w-12 rounded-2xl bg-white/40 border border-white/40 flex items-center justify-center text-dusk-deep shadow-sm">
                <Compass size={24} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-dusk-ink">Where would you like to start?</h3>
                <p className="text-xs text-dusk-mute mt-1 leading-relaxed">
                  You don't need a polished pitch deck or even a clear idea. Choose a topic below or type anything on your mind.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                {STARTER_PROMPTS.map((sp, i) => {
                  const Icon = sp.icon
                  return (
                    <button
                      key={i}
                      onClick={() => send(sp.text)}
                      className="p-3.5 rounded-2xl bg-white/20 hover:bg-white/40 border border-white/25 transition shadow-xs group flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-dusk-ink group-hover:text-black">
                        <Icon size={14} className="text-dusk-deep" />
                        <span>{sp.title}</span>
                      </div>
                      <p className="text-[11px] text-dusk-mute leading-snug line-clamp-2">
                        {sp.text}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-xl bg-dusk-deep/15 text-dusk-deep flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    m.role === 'user'
                      ? 'bg-dusk-deep text-white rounded-tr-none'
                      : 'glass-solid border border-white/30 text-dusk-ink rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {m.role === 'assistant' && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-dusk-mute">
                      <button
                        onClick={() => handleCopy(m.text, idx)}
                        className="flex items-center gap-1 hover:text-dusk-ink transition"
                        title="Copy message"
                      >
                        {copiedIdx === idx ? <Check size={12} className="text-emerald-700" /> : <Copy size={12} />}
                        <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => onStartEvaluation(m.text.slice(0, 200))}
                        className="flex items-center gap-1 font-medium text-dusk-deep hover:underline"
                        title="Turn this answer into an evaluation"
                      >
                        <span>Evaluate Idea</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="h-8 w-8 rounded-xl bg-dusk-deep text-white flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon size={16} />
                  </div>
                )}
              </div>
            ))
          )}

          {busy && (
            <div className="flex gap-3 items-center">
              <div className="h-8 w-8 rounded-xl bg-dusk-deep/15 text-dusk-deep flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="glass-solid p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-dusk-mute">
                <span className="h-2 w-2 rounded-full bg-dusk-deep animate-ping" />
                <span>Thinking through your question carefully...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const lastUser = [...messages].reverse().find(m => m.role === 'user')
                  if (lastUser) {
                    send(lastUser.text)
                  }
                }}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={scrollEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/15 pt-3">
          <form
            onSubmit={e => {
              e.preventDefault()
              send(input)
            }}
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question, explore a problem, or challenge an idea…"
              className="input flex-1 text-xs sm:text-sm"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="btn-primary py-2.5 px-4 flex items-center gap-1.5 shrink-0"
            >
              <Send size={15} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-dusk-mute">
            <span>Honest, first-principles startup thinking. Zero corporate fluff.</span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </Glass>
    </div>
  )
}

/**
 * Thoughtful first-principles reasoning engine for offline/fallback mode.
 * Gives honest, non-superficial answers following the prompt rules.
 */
function generateThinkingFallback(query: string, history: ChatMessage[]): string {
  const lower = query.toLowerCase()

  if (lower.includes('no idea') || lower.includes("don't have an idea") || lower.includes('discover problem')) {
    return `Finding a strong startup idea starts with noticing friction, not brainstorming cool software features.

Here is a 3-step practical framework to uncover genuine problems this week:

1. Look for ugly workarounds: What tasks in your job, hobby, or daily life currently rely on messy spreadsheets, manual copy-pasting, paper notes, or repeated phone calls? Wherever people duct-tape tools together, a real problem exists.
2. Follow the money and time: What is a problem someone already spends at least $100/month or 5 hours/week trying to deal with? People pay to eliminate pain, not for nice-to-haves.
3. Focus on a narrow group: Instead of "everyone", pick one specific group (e.g. freelance accountants, independent café managers, university club organizers).

Which industry, job, or community do you personally know best? Tell me in one sentence, and we will find 2 concrete problems there.`
  }

  if (lower.includes('interview') || lower.includes('talk to customer')) {
    return `The number one rule of customer interviews (from *The Mom Test*): Never ask people if they would like your idea. People are polite and will lie to avoid hurting your feelings.

Instead, ask about their past actions:
- "When was the last time you dealt with [problem]?"
- "What did you actually do to solve it?"
- "What was the most frustrating part about that?"
- "What other tools or methods have you paid for or tried?"

If they haven't spent time or money trying to solve it in the past 6 months, it is not an acute pain point, no matter how much they say "that sounds cool."

What group of people are you thinking of talking to?`
  }

  if (lower.includes('pay') || lower.includes('price') || lower.includes('pricing') || lower.includes('willingness')) {
    return `To test willingness to pay without writing code, do not ask: "Would you pay $20 for this?"

Instead, run one of these 3 direct validation tests:
1. The Deposit Test: Offer to solve the problem manually for 3 clients at a discounted rate ($50-$200). If they will not give you a deposit now, they will not buy a software version later.
2. The Pre-Order / Waitlist with Intent: Put up a simple 1-page landing page explaining the specific offer. Include a "Pre-order with 50% discount" button that opens a checkout or card entry.
3. The Letter of Intent (B2B): For business tools, ask the business owner: "If I build this by next month to solve [X], will you sign a simple non-binding agreement to pilot it for $100/mo?"

Which of these 3 tests feels most realistic for the people you want to reach?`
  }

  return `That is an important question. To think through this clearly, let's break it down from first principles:

1. What is the verified fact versus what is an unproven assumption here? Most startup efforts stall because founders treat their intuition as proven market demand.
2. Who hurts the most from this specific situation? If the pain is only mild or occasional, people will continue using their current free workaround rather than switching to a new solution.
3. What is the single fastest way to test this without building anything?

Could you share a bit more context on who specifically is involved and what they do today?`
}
