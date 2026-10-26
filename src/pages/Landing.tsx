import { useState } from 'react'
import { ArrowRight, Plus, Search, Compass, ShieldQuestion, X, LogIn, LogOut, Cloud } from 'lucide-react'
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
      d: 'Tell FOCAS what problem you want to solve, who experiences it, and how your product works.',
    },
    {
      n: '02',
      t: 'First-principles logic evaluation',
      d: 'Our 12 deterministic modules evaluate customer urgency, habit inertia, unit economics, and operational risks.',
    },
    {
      n: '03',
      t: 'Actionable validation roadmap',
      d: 'Get tailored Mom-Test discovery questions, practical pre-build experiments, and clear go/no-go milestones.',
    },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-dusk-ink/30 backdrop-blur-sm" />
      <div className="glass-solid relative z-10 w-full max-w-md p-8 rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">How it works</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/20 transition" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-5">
          {steps.map(s => (
            <div key={s.n} className="flex gap-4">
              <span className="text-sm font-semibold text-dusk-deep/50 pt-0.5 tabular-nums">{s.n}</span>
              <div>
                <h3 className="font-semibold text-[15px]">{s.t}</h3>
                <p className="text-sm text-dusk-mute mt-0.5 leading-relaxed">{s.d}</p>
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
    <div className="min-h-screen flex flex-col">
      <nav className="glass mx-3 sm:mx-4 mt-3 sm:mt-4 flex items-center justify-between px-5 py-3" aria-label="Main">
        <Logo />
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg px-3 py-2 text-sm font-medium text-dusk-ink transition hover:bg-white/15"
            onClick={() => setShowHow(true)}
          >
            How it works
          </button>
          <button
            className="rounded-lg px-3 py-2 text-sm font-medium text-dusk-ink transition hover:bg-white/15"
            onClick={() => onStart()}
          >
            Projects
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/20">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 rounded-xl bg-white/40 border border-white/25 px-3 py-1.5 text-xs font-semibold text-dusk-ink hover:bg-white/70 transition shadow-sm"
                title="Account Settings"
              >
                <Cloud size={14} className="text-emerald-700" />
                <span className="max-w-[140px] truncate">{user.email || 'Founder Account'}</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOutUser()
                  } catch (e) {
                    console.error('Sign out error:', e)
                  }
                }}
                className="rounded-xl p-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200/50 transition"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-xl bg-dusk-ink text-white px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold hover:bg-dusk-deep transition shadow-sm ml-1"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl rise">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">Let's think clearly.</h1>
            <p className="mt-3 text-lg font-medium text-dusk-ink/80">Your honest startup thinking partner before you build.</p>
            <p className="mt-2 text-xs sm:text-sm text-dusk-mute max-w-md mx-auto leading-relaxed">
              Understand the problem. Explore the market. Find out what you should validate next.
            </p>
          </div>

          {/* Evaluate an Idea */}
          <div className="glass-solid p-5 sm:p-7 shadow-lg rounded-3xl">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="idea-input" className="text-xs font-bold uppercase tracking-wider text-dusk-deep">
                Evaluate an Idea
              </label>
              <span className="text-[11px] text-dusk-mute bg-white/40 px-2 py-0.5 rounded-full font-medium">
                Deterministic First-Principles Report
              </span>
            </div>
            <textarea
              id="idea-input"
              className="input min-h-[130px] resize-none text-[15px] leading-relaxed"
              placeholder="Describe what you want to build and who it is for…"
              value={idea}
              onChange={e => setIdea(e.target.value)}
              maxLength={500}
              rows={4}
              aria-label="Describe your startup idea"
            />
            <div className="flex items-center justify-between mt-4 gap-3">
              <button
                className="btn-ghost text-xs sm:text-sm flex items-center gap-1.5"
                onClick={() => onStart(idea || undefined, false)}
              >
                <Plus size={15} /> Customize Details
              </button>
              <button
                className="btn-primary flex items-center gap-1.5"
                onClick={() => onStart(idea, true)}
                disabled={!idea.trim()}
              >
                <span>Evaluate Idea</span>
                <ArrowRight size={15} />
              </button>
            </div>
            {idea.length > 0 && <p className="text-right text-[11px] text-dusk-mute/50 mt-2">{idea.length}/500</p>}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {ACTIONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="chip hover:bg-white/25 transition cursor-pointer gap-1.5 py-1.5 text-xs font-medium"
                onClick={() => onStart(label, false)}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-dusk-ink/30 pb-4 pt-2">
        FOCAS — Think critically. Validate with evidence.
      </footer>
      {showHow && <HowItWorks onClose={() => setShowHow(false)} />}
    </div>
  )
}
