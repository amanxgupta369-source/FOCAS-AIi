import { useState } from 'react'
import { ArrowRight, Plus, Search, Compass, ShieldQuestion, X, LogIn, LogOut, Cloud, Sparkles } from 'lucide-react'
import { Logo } from '../components/ui'
import { signOutUser } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

const ACTIONS = [
  { icon: Search, label: 'Research my market' },
  { icon: Compass, label: 'Find competitors' },
  { icon: ShieldQuestion, label: 'Challenge my idea' },
]

function HowItWorks({ onClose }: { onClose: () => void }) {
  const steps = [
    {
      n: '01',
      t: 'Describe your startup idea',
      d: 'Tell FOCAS what problem you want to solve and who it is for in a single simple description.',
    },
    {
      n: '02',
      t: 'First-principles logic evaluation',
      d: 'Our 12 deterministic modules evaluate customer urgency, habit inertia, unit economics, and operational risks.',
    },
    {
      n: '03',
      t: 'Continuous validation workspace',
      d: 'Start your 7-day discovery sprint, get tailored Mom Test questions, log customer evidence, and receive your next best action.',
    },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
      <div className="glass-solid relative z-10 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md p-4 sm:p-7 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/70 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">How FOCAS works</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:text-slate-800 hover:bg-white/60 transition min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-5">
          {steps.map(s => (
            <div key={s.n} className="flex gap-4">
              <span className="text-sm font-bold text-blue-600 pt-0.5 font-mono">{s.n}</span>
              <div>
                <h3 className="font-bold text-[15px] text-slate-900">{s.t}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Landing({
  onStart,
  user,
  onOpenAuth,
}: {
  onStart: (seed?: string, evaluateImmediately?: boolean) => void
  user?: User | null
  onOpenAuth?: () => void
}) {
  const [idea, setIdea] = useState('')
  const [showHow, setShowHow] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#1E293B]">
      <nav className="glass mx-2.5 sm:mx-4 mt-2.5 sm:mt-4 rounded-2xl flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3" aria-label="Main">
        <Logo />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            className="rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-white/60 hidden xs:inline-flex min-h-[40px] items-center justify-center active:scale-95"
            onClick={() => setShowHow(true)}
          >
            How it works
          </button>
          <button
            className="rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-white/60 min-h-[40px] flex items-center justify-center active:scale-95"
            onClick={() => onStart()}
          >
            Projects
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-sky-200/60">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 rounded-xl bg-white/70 border border-white/80 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-white transition shadow-xs max-w-[100px] xs:max-w-[140px] min-h-[40px] active:scale-95"
                title="Account Settings"
              >
                <Cloud size={14} className="text-emerald-700 shrink-0" />
                <span className="truncate">{user.email || 'Founder Account'}</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOutUser()
                  } catch (e) {
                    console.error('Sign out error:', e)
                  }
                }}
                className="rounded-xl p-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 transition min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-xl btn-primary px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold shadow-sm ml-1 min-h-[40px] active:scale-95"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
        <div className="w-full max-w-2xl rise">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/70 border border-sky-200/80 text-sky-900 text-xs font-semibold mb-3 backdrop-blur-md">
              <Sparkles size={12} className="text-sky-600" />
              <span>Founder Intelligence & Validation Workspace</span>
            </div>
            <h1 className="text-2xl xs:text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
              Let's think clearly.
            </h1>
            <p className="mt-2 text-sm sm:text-lg font-medium text-slate-700">
              Your honest startup validation partner before you write code.
            </p>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Understand the problem. Start your discovery sprint. Log customer evidence. See what changed.
            </p>
          </div>

          {/* Evaluate an Idea */}
          <div className="glass-solid p-4 sm:p-7 rounded-2xl sm:rounded-3xl">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 mb-2.5">
              <label htmlFor="idea-input" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Evaluate an Idea
              </label>
              <span className="text-[10px] sm:text-[11px] text-sky-900 bg-sky-100/70 px-2.5 py-0.5 rounded-full font-semibold border border-sky-200/80 w-fit">
                Deterministic First-Principles Engine
              </span>
            </div>
            <textarea
              id="idea-input"
              className="input min-h-[120px] sm:min-h-[130px] resize-none text-base leading-relaxed rounded-xl sm:rounded-2xl"
              placeholder="Describe what you want to build and who it is for…"
              value={idea}
              onChange={e => setIdea(e.target.value)}
              maxLength={500}
              rows={4}
              aria-label="Describe your startup idea"
            />
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between mt-4 gap-2.5">
              <button
                className="btn-ghost text-xs sm:text-sm flex items-center justify-center gap-1.5 py-3 sm:py-2.5 px-3 rounded-xl min-h-[44px]"
                onClick={() => onStart(idea || undefined, false)}
              >
                <Plus size={15} /> Customize Details
              </button>
              <button
                className="btn-primary flex items-center justify-center gap-1.5 py-3.5 sm:py-3 px-5 rounded-xl font-bold shadow-md min-h-[44px]"
                onClick={() => onStart(idea, true)}
                disabled={!idea.trim()}
              >
                <span>Evaluate Idea</span>
                <ArrowRight size={15} />
              </button>
            </div>
            {idea.length > 0 && (
              <p className="text-right text-[11px] text-slate-400 font-mono mt-2">{idea.length}/500</p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {ACTIONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="chip hover:bg-white/60 transition cursor-pointer gap-1.5 py-2 px-3.5 text-xs sm:text-sm font-medium text-slate-700 bg-white/40 border border-white/60 min-h-[40px] rounded-xl active:scale-95 flex items-center"
                onClick={() => onStart(label, false)}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 pb-4 pt-2">
        FOCAS — Think critically. Validate with empirical evidence.
      </footer>
      {showHow && <HowItWorks onClose={() => setShowHow(false)} />}
    </div>
  )
}
