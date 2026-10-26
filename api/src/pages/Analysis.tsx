import { useState, useEffect } from 'react'
import {
  Pencil,
  Trash2,
  RefreshCw,
  Cpu,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Target,
  ListTodo,
  ExternalLink,
  Compass,
  Plus,
  Users,
  Check,
  X,
  MessageSquare,
  Sparkles,
  BarChart3,
  Layers,
  FileQuestion,
  BookOpen,
  Filter,
} from 'lucide-react'
import type {
  Analysis,
  AssumptionState,
  CustomerInterview,
  EvaluationProgress,
  ExpStatus,
  IdeaForm,
  Project,
  TrackedAssumption,
} from '../types'
import { Badge, Demo, Glass } from '../components/ui'
import { generateAnalysis } from '../lib/analysis'
import { generateBasicEvaluation } from '../lib/basicEvaluation'
import { EVALUATION_STAGES } from '../lib/reasoningEngine'
import { generateOverallVerdict } from '../lib/verdict'
import { FOUNDER_KNOWLEDGE_LIBRARY } from '../lib/founderEngine/knowledgeLibrary'

const TABS = [
  'Executive Report',
  'Problem & Solution',
  'Customers & Market',
  'Business Model & Risks',
  'Validation Plan',
  'Validation & Evidence',
  'Open Questions',
  'Knowledge Library',
] as const

const EXP: ExpStatus[] = ['Not started', 'In progress', 'Completed']


function AnalyzingView({
  name,
  model,
  progress,
  onCancel,
}: {
  name: string
  model?: string
  progress?: EvaluationProgress | null
  onCancel?: () => void
}) {
  const [localElapsed, setLocalElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setLocalElapsed(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const elapsed = progress?.elapsedSeconds ?? localElapsed
  const completed = progress?.completedStages || []
  const current = progress?.currentStage || 'Understanding the idea'
  const displayModel = model || 'FOCAS Founder Intelligence Engine'

  return (
    <div className="rise flex items-center justify-center min-h-[60vh] p-4">
      <div className="glass-solid p-8 sm:p-10 w-full max-w-lg text-center">
        <div className="analyzing-pulse mx-auto mb-5 h-12 w-12 rounded-full bg-dusk-deep/20 flex items-center justify-center">
          <Cpu className="h-6 w-6 text-dusk-deep animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold mb-1">Evaluating Startup Idea</h2>
        <p className="text-sm text-dusk-mute mb-2">{name}</p>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="text-xs inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-dusk-ink/80">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Evaluation in progress
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 text-dusk-mute inline-flex items-center gap-1">
            <Clock size={12} /> {elapsed}s elapsed
          </span>
        </div>

        {/* Bounded 5 Stages List */}
        <div className="space-y-3 text-left mb-6 rounded-2xl bg-white/10 p-4 border border-white/15">
          {EVALUATION_STAGES.map(stage => {
            const isCompleted = completed.includes(stage)
            const isCurrent = current === stage && !isCompleted

            return (
              <div key={stage} className="flex items-center justify-between text-sm py-0.5">
                <div className="flex items-center gap-2.5">
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                  ) : isCurrent ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-dusk-deep animate-ping shrink-0 ml-0.5 mr-0.5" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-dusk-mute/40 shrink-0 ml-1 mr-1" />
                  )}
                  <span
                    className={
                      isCompleted
                        ? 'text-dusk-ink font-medium'
                        : isCurrent
                          ? 'text-dusk-deep font-semibold'
                          : 'text-dusk-mute/70'
                    }
                  >
                    {stage}
                  </span>
                </div>
                <span className="text-[11px] tabular-nums">
                  {isCompleted ? (
                    <span className="text-emerald-700 font-medium">Completed</span>
                  ) : isCurrent ? (
                    <span className="text-dusk-deep animate-pulse">In progress</span>
                  ) : (
                    <span className="text-dusk-mute/60">Pending</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>

        {progress && progress.tokens > 0 && (
          <p className="text-xs text-dusk-mute mb-5">
            Generating analysis ({progress.tokens} tokens streamed)
          </p>
        )}

        {onCancel && (
          <button
            type="button"
            className="btn-ghost text-xs text-rose-800 hover:bg-rose-50/20 px-4 py-2"
            onClick={onCancel}
          >
            Cancel evaluation
          </button>
        )}
      </div>
    </div>
  )
}

export default function AnalysisPage({
  project,
  progress,
  onChange,
  onEdit,
  onDelete,
  onReevaluate,
  onCancelAnalysis,
  onViewVerdict,
}: {
  project: Project
  progress?: EvaluationProgress | null
  onChange: (p: Project) => void
  onEdit: () => void
  onDelete: () => void
  onReevaluate?: () => void
  onCancelAnalysis?: () => void
  onViewVerdict?: () => void
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Executive Report')
  const { form: f, analysis: a } = project

  const [interviews, setInterviews] = useState<CustomerInterview[]>(project.interviews || [])
  const [assumptions, setAssumptions] = useState<TrackedAssumption[]>(() => {
    if (project.trackedAssumptions && project.trackedAssumptions.length > 0) {
      return project.trackedAssumptions
    }
    return (a?.assumptionAnalysis || []).map((as) => ({
      id: crypto.randomUUID(),
      assumption: as.assumption,
      category: 'Problem' as const,
      state: 'Untested' as const,
      evidenceNotes: '',
      lastUpdated: new Date().toISOString(),
    }))
  })

  const [showInterviewForm, setShowInterviewForm] = useState(false)
  const [newInterview, setNewInterview] = useState<Partial<CustomerInterview>>({
    date: new Date().toISOString().split('T')[0],
    intervieweeRole: '',
    problemConfirmed: true,
    frequency: 'Daily',
    wouldPay: false,
    estimatedBudget: '',
    currentWorkaround: '',
    keyQuotes: '',
    notes: '',
  })

  const [newCustomAssumption, setNewCustomAssumption] = useState('')
  const [evidenceToast, setEvidenceToast] = useState<string | null>(null)

  useEffect(() => {
    if (project.interviews) {
      setInterviews(project.interviews)
    }
    if (project.trackedAssumptions && project.trackedAssumptions.length > 0) {
      setAssumptions(project.trackedAssumptions)
    }
  }, [project.id])

  if (project.status === 'Evaluating' || project.status === 'Analyzing' || (!a && !project.error)) {
    return (
      <AnalyzingView
        name={f.name || 'Startup Idea'}
        model={project.modelUsed}
        progress={progress}
        onCancel={onCancelAnalysis}
      />
    )
  }

  const patch = (fn: (a: Analysis) => Analysis) =>
    a && onChange({ ...project, analysis: fn(a), updated: new Date().toISOString() })

  const applyEvidenceUpdate = (
    currentInterviews: CustomerInterview[] = interviews,
    currentAssumptions: TrackedAssumption[] = assumptions
  ) => {
    const updatedAnalysis = generateBasicEvaluation(
      f,
      currentInterviews,
      currentAssumptions,
      project.isQuotaExceeded
    )
    const updatedProject: Project = {
      ...project,
      interviews: currentInterviews,
      trackedAssumptions: currentAssumptions,
      analysis: updatedAnalysis,
      updated: new Date().toISOString(),
    }
    onChange(updatedProject)
    setEvidenceToast(
      `Evaluation updated with ${currentInterviews.length} customer interview(s) and ${currentAssumptions.filter(x => x.state !== 'Untested').length} tested assumption(s). Overall Verdict recalculated!`
    )
    setTimeout(() => setEvidenceToast(null), 5000)
  }

  const handleSaveInterview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInterview.intervieweeRole?.trim()) return

    const interviewToAdd: CustomerInterview = {
      id: crypto.randomUUID(),
      date: newInterview.date || new Date().toISOString().split('T')[0],
      intervieweeRole: newInterview.intervieweeRole.trim(),
      problemConfirmed: !!newInterview.problemConfirmed,
      frequency: (newInterview.frequency as any) || 'Daily',
      wouldPay: !!newInterview.wouldPay,
      estimatedBudget: newInterview.estimatedBudget?.trim() || '',
      currentWorkaround: newInterview.currentWorkaround?.trim() || '',
      keyQuotes: newInterview.keyQuotes?.trim() || '',
      notes: newInterview.notes?.trim() || '',
    }

    const updated = [interviewToAdd, ...interviews]
    setInterviews(updated)
    setShowInterviewForm(false)
    setNewInterview({
      date: new Date().toISOString().split('T')[0],
      intervieweeRole: '',
      problemConfirmed: true,
      frequency: 'Daily',
      wouldPay: false,
      estimatedBudget: '',
      currentWorkaround: '',
      keyQuotes: '',
      notes: '',
    })

    applyEvidenceUpdate(updated, assumptions)
  }

  const handleDeleteInterview = (id: string) => {
    if (!window.confirm('Delete this customer interview entry?')) return
    const updated = interviews.filter(i => i.id !== id)
    setInterviews(updated)
    applyEvidenceUpdate(updated, assumptions)
  }

  const handleUpdateAssumptionState = (id: string, newState: AssumptionState) => {
    const updated = assumptions.map(item =>
      item.id === id ? { ...item, state: newState, lastUpdated: new Date().toISOString() } : item
    )
    setAssumptions(updated)
    applyEvidenceUpdate(interviews, updated)
  }

  const handleUpdateAssumptionNotes = (id: string, notes: string) => {
    const updated = assumptions.map(item =>
      item.id === id ? { ...item, evidenceNotes: notes, lastUpdated: new Date().toISOString() } : item
    )
    setAssumptions(updated)
    onChange({
      ...project,
      trackedAssumptions: updated,
      updated: new Date().toISOString(),
    })
  }

  const handleAddCustomAssumption = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomAssumption.trim()) return
    const newA: TrackedAssumption = {
      id: crypto.randomUUID(),
      assumption: newCustomAssumption.trim(),
      category: 'Problem',
      state: 'Untested',
      evidenceNotes: '',
      lastUpdated: new Date().toISOString(),
    }
    const updated = [...assumptions, newA]
    setAssumptions(updated)
    setNewCustomAssumption('')
    applyEvidenceUpdate(interviews, updated)
  }

  return (
    <div className="rise space-y-4">
      {/* Header Bar */}
      <Glass className="flex flex-wrap items-start justify-between gap-3 p-5">
        <div>
          <h1 className="text-2xl font-semibold">{f.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-dusk-mute">
            <select
              aria-label="Current status"
              value={project.status}
              onChange={e =>
                onChange({
                  ...project,
                  status: e.target.value as any,
                  updated: new Date().toISOString(),
                })
              }
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-dusk-ink border border-white/25 cursor-pointer hover:bg-white/30 transition"
              title="Change project status"
            >
              <option value="Evaluating">Evaluating</option>
              <option value="Validating">Validating</option>
              <option value="Building">Building</option>
              <option value="Paused">Paused</option>
              <option value="Draft">Draft</option>
              <option value="Complete">Complete</option>
            </select>

            <span
              className="chip text-[11px] bg-emerald-500/20 text-emerald-950 border border-emerald-500/35 font-semibold"
              title="Evaluated deterministically across 12 modules with 11 founder frameworks (Zero External AI APIs)"
            >
              Founder Engine (Deterministic)
            </span>

            <span>Updated {new Date(project.updated).toLocaleDateString()}</span>
            {project.history && project.history.length > 0 && (
              <span
                className="chip text-[11px] bg-white/15 text-dusk-mute border border-white/10"
                title="Previous evaluation versions preserved"
              >
                v{project.history.length + 1} ({project.history.length} earlier{' '}
                {project.history.length === 1 ? 'report' : 'reports'})
              </span>
            )}
            {project.sample && <Demo />}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onViewVerdict && a && (
            <button
              className="btn-primary flex items-center gap-1.5 shadow-sm"
              onClick={onViewVerdict}
              title="View Overall Verdict final recommendation"
            >
              <Compass size={15} /> Overall Verdict
            </button>
          )}
          {onReevaluate && (
            <button className="btn-ghost flex items-center gap-1.5" onClick={onReevaluate} title="Recalculate with Founder Intelligence Engine">
              <RefreshCw size={14} /> Recalculate
            </button>
          )}
          <button className="btn-ghost flex items-center gap-1.5" onClick={onEdit}>
            <Pencil size={14} /> Edit
          </button>
          <button className="btn-ghost text-rose-800 flex items-center gap-1.5" onClick={onDelete}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </Glass>

      {/* Founder Intelligence Engine Banner */}
      <Glass className="p-4 border border-emerald-300/40 bg-emerald-50/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-dusk-ink flex items-center gap-2">
                <span>Deterministic Founder Intelligence Report</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Zero AI Hallucinations
                </span>
              </h3>
              <p className="text-xs text-dusk-mute mt-0.5">
                Evaluated across 12 modules using verified first-principles frameworks (The Mom Test, Hair-on-Fire Acuity, Unit Economics). No external AI language models or inference APIs were called.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onReevaluate && (
              <button
                className="btn-ghost text-xs flex items-center gap-1.5"
                onClick={onReevaluate}
                title="Recalculate evaluation"
              >
                <RefreshCw size={13} /> Recalculate
              </button>
            )}
          </div>
        </div>
      </Glass>

      {/* Evidence toast banner */}
      {evidenceToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-300/60 text-xs text-emerald-950 font-medium flex items-center gap-2 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{evidenceToast}</span>
        </div>
      )}

      {/* Error alert banner */}
      {project.error && (
        <Glass className="p-5 border border-amber-300/40 bg-amber-50/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="text-amber-600 mt-0.5 shrink-0" size={18} />
              <div>
                <h3 className="font-semibold text-dusk-ink">Evaluation Status</h3>
                <p className="text-sm text-dusk-mute mt-0.5">{project.error}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {onReevaluate && (
                <button className="btn-primary text-xs" onClick={onReevaluate}>
                  Retry Evaluation
                </button>
              )}
              <button
                className="btn-ghost text-xs"
                onClick={() =>
                  onChange({
                    ...project,
                    analysis: generateAnalysis(f),
                    status: 'Complete',
                    error: undefined,
                  })
                }
              >
                Use First-Principles Baseline
              </button>
            </div>
          </div>
        </Glass>
      )}

      {!a ? (
        <Glass className="p-6">
          <p className="text-dusk-mute">This idea has not been evaluated yet.</p>
          <div className="mt-4 flex gap-3">
            {onReevaluate && (
              <button className="btn-primary" onClick={onReevaluate}>
                Evaluate idea now
              </button>
            )}
            <button className="btn-ghost" onClick={onEdit}>
              Edit details
            </button>
          </div>
        </Glass>
      ) : (
        <div className="space-y-4">
          {/* Tabs */}
          <div role="tablist" className="glass flex overflow-x-auto gap-1.5 p-1.5 no-scrollbar">
            {TABS.map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition shrink-0 ${
                  tab === t ? 'bg-dusk-deep text-white shadow' : 'hover:bg-white/15 text-dusk-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

            {/* Final Overall Verdict Banner */}
            {onViewVerdict && (
              <Glass className="p-4 bg-gradient-to-r from-dusk-deep/15 via-white/20 to-emerald-500/10 border border-dusk-deep/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-dusk-deep text-white flex items-center justify-center shrink-0">
                    <Compass size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dusk-ink">
                      Final Executive Roadmap: OVERALL VERDICT
                    </h4>
                    <p className="text-xs text-dusk-mute">
                      Synthesized recommendation, execution timeline, and critical assumption analysis.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onViewVerdict}
                  className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2 shadow-sm"
                >
                  View Overall Verdict <ArrowRight size={14} />
                </button>
              </Glass>
            )}

            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-dusk-ink/70">
                Startup Viability Score: <span className="font-semibold text-dusk-deep">{a.score}/100</span> ·
                Preliminary Direction: <span className="font-medium text-emerald-800">{a.finalRecommendation?.verdict || 'VALIDATE'}</span>
              </p>
            </div>

            {/* TAB 1: EXECUTIVE REPORT */}
            {tab === 'Executive Report' && (
              <div className="rise space-y-4" key="exec">
                {/* 1. Executive Summary */}
                <Glass className="p-6">
                  <h3 className="mb-3 font-semibold text-lg flex items-center gap-2">
                    <Target size={18} className="text-dusk-deep" /> Executive Summary
                  </h3>
                  <div className="space-y-3 text-sm text-dusk-ink leading-relaxed">
                    <p><b className="text-dusk-deep">The Idea:</b> {a.executiveSummary?.ideaSimple}</p>
                    <p><b className="text-dusk-deep">The Problem:</b> {a.executiveSummary?.problemOverview}</p>
                    <p><b className="text-dusk-deep">Target Customer:</b> {a.executiveSummary?.intendedCustomer}</p>
                    <p><b className="text-dusk-deep">Market Opportunity:</b> {a.executiveSummary?.opportunityOverview}</p>
                    <div className="mt-3 p-3.5 rounded-xl bg-amber-50/20 border border-amber-200/40">
                      <p className="text-xs text-amber-950 font-medium">
                        <b>Biggest Concern:</b> {a.executiveSummary?.biggestConcern}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50/20 border border-emerald-200/40">
                      <p className="text-xs text-emerald-950 font-medium">
                        <b>Recommended Next Action:</b> {a.executiveSummary?.recommendedAction}
                      </p>
                    </div>
                  </div>
                </Glass>

                {/* 11. Final Recommendation */}
                <Glass className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-lg">Final Strategic Recommendation</h3>
                    <span
                      className={`chip text-xs px-3 py-1 font-semibold ${a.finalRecommendation?.verdict === 'Proceed'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : a.finalRecommendation?.verdict === 'Validate Further'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                    >
                      Verdict: {a.finalRecommendation?.verdict}
                    </span>
                  </div>
                  <p className="text-sm text-dusk-ink leading-relaxed mb-4">
                    {a.finalRecommendation?.verdictReasoning}
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2 text-sm mb-4">
                    <div className="rounded-xl bg-emerald-50/20 border border-emerald-200/40 p-3.5">
                      <p className="text-xs uppercase font-semibold text-emerald-900 mb-1.5">Strongest Supporting Arguments</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-dusk-ink">
                        {a.finalRecommendation?.strongestArgumentsFor?.map((arg, i) => (
                          <li key={i}>{arg}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-rose-50/20 border border-rose-200/40 p-3.5">
                      <p className="text-xs uppercase font-semibold text-rose-900 mb-1.5">Strongest Critical Objections</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-dusk-ink">
                        {a.finalRecommendation?.strongestObjections?.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-dusk-deep mb-2 flex items-center gap-1.5">
                      <ListTodo size={15} /> Immediate Next 5 Actions (In Priority Order)
                    </h4>
                    <ol className="list-decimal space-y-1.5 pl-5 text-xs sm:text-sm text-dusk-ink">
                      {a.finalRecommendation?.nextFiveActions?.map((act, i) => (
                        <li key={i} className="leading-relaxed">{act}</li>
                      ))}
                    </ol>
                  </div>
                </Glass>
              </div>
            )}

            {/* TAB 2: PROBLEM & SOLUTION */}
            {tab === 'Problem & Solution' && (
              <div className="rise space-y-4" key="ps">
                {/* 2. Problem Analysis */}
                <Glass className="p-6">
                  <h3 className="mb-3 font-semibold text-lg">2. Problem Analysis</h3>
                  <div className="space-y-3 text-sm text-dusk-ink leading-relaxed">
                    <div className="rounded-xl bg-white/10 p-3.5">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Exact Problem Being Solved</p>
                      <p>{a.problemAnalysis?.exactProblem}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/10 p-3.5">
                        <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Who Experiences It</p>
                        <p className="text-xs">{a.problemAnalysis?.whoExperiencesIt}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-3.5">
                        <p className="text-xs uppercase text-dusk-mute font-medium mb-1">When and Why It Occurs</p>
                        <p className="text-xs">{a.problemAnalysis?.whenAndWhy}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3.5">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-1">How People Solve It Today</p>
                      <p className="text-xs">{a.problemAnalysis?.currentWorkarounds}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-emerald-50/20 border border-emerald-200/40 p-3.5">
                        <p className="text-xs uppercase text-emerald-900 font-semibold mb-1">Evidence Status</p>
                        <p className="text-xs">{a.problemAnalysis?.evidenceStatus}</p>
                      </div>
                      <div className="rounded-xl bg-amber-50/20 border border-amber-200/40 p-3.5">
                        <p className="text-xs uppercase text-amber-900 font-semibold mb-1">What Remains Unverified</p>
                        <p className="text-xs">{a.problemAnalysis?.unverifiedAspects}</p>
                      </div>
                    </div>
                  </div>
                </Glass>

                {/* 4. Solution Analysis & MVP Scope */}
                <Glass className="p-6">
                  <h3 className="mb-3 font-semibold text-lg">4. Solution Analysis & Minimum Viable Product</h3>
                  <div className="space-y-3 text-sm text-dusk-ink leading-relaxed">
                    <div className="rounded-xl bg-white/10 p-3.5">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-1">How The Product Works</p>
                      <p>{a.solutionAnalysis?.howItWorks}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-2">Feature-to-Problem Mapping</p>
                      <div className="space-y-2">
                        {a.solutionAnalysis?.featureMapping?.map((item, i) => (
                          <div key={i} className="rounded-xl bg-white/10 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="font-semibold text-dusk-deep">{item.feature}</span>
                            <span className="text-dusk-mute flex items-center gap-1">
                              <ArrowRight size={12} className="shrink-0" /> {item.problemSolved}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/10 p-3.5">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Minimum Viable Product (MVP) Scope</p>
                      <p className="text-xs">{a.solutionAnalysis?.mvpScope}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-emerald-50/20 border border-emerald-200/40 p-3.5">
                        <p className="text-xs uppercase text-emerald-900 font-semibold mb-1">What To Build First</p>
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                          {a.solutionAnalysis?.buildFirst?.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl bg-amber-50/20 border border-amber-200/40 p-3.5">
                        <p className="text-xs uppercase text-amber-900 font-semibold mb-1">What To Postpone</p>
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                          {a.solutionAnalysis?.postpone?.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/10 p-3.5">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Potential Usability & Adoption Challenges</p>
                      <p className="text-xs">{a.solutionAnalysis?.adoptionChallenges}</p>
                    </div>
                  </div>
                </Glass>
              </div>
            )}

            {/* TAB 3: CUSTOMERS & MARKET */}
            {tab === 'Customers & Market' && (
              <div className="rise space-y-4" key="cm">
                {/* 3. Customer Analysis */}
                <Glass className="p-6">
                  <h3 className="mb-3 font-semibold text-lg">3. Customer Analysis</h3>
                  <div className="space-y-3 text-sm text-dusk-ink leading-relaxed">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/10 p-3.5">
                        <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Primary Segment</p>
                        <p className="text-xs">{a.customerAnalysis?.primarySegment}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-3.5">
                        <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Secondary Segment</p>
                        <p className="text-xs">{a.customerAnalysis?.secondarySegment}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3.5">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Needs & Motivations</p>
                      <p className="text-xs">{a.customerAnalysis?.needsAndMotivations}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/10 p-3.5">
                        <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Likely Early Adopters</p>
                        <p className="text-xs">{a.customerAnalysis?.earlyAdopters}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-3.5">
                        <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Unlikely Users (And Why)</p>
                        <p className="text-xs">{a.customerAnalysis?.unlikelyUsersAndWhy}</p>
                      </div>
                    </div>

                    {/* Researched Facts vs Hypotheses */}
                    <div className="grid gap-3 sm:grid-cols-2 mt-2">
                      <div className="rounded-xl bg-emerald-50/20 border border-emerald-200/40 p-3.5">
                        <div className="flex items-center gap-1.5 text-xs uppercase font-semibold text-emerald-900 mb-1.5">
                          <ShieldCheck size={14} /> Researched / Founder Facts
                        </div>
                        {a.customerAnalysis?.verifiedFacts?.length ? (
                          <ul className="list-disc pl-4 space-y-1 text-xs text-dusk-ink">
                            {a.customerAnalysis.verifiedFacts.map((fact, i) => (
                              <li key={i}>{fact}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-dusk-mute italic">No empirical customer facts provided yet.</p>
                        )}
                      </div>
                      <div className="rounded-xl bg-amber-50/20 border border-amber-200/40 p-3.5">
                        <div className="flex items-center gap-1.5 text-xs uppercase font-semibold text-amber-900 mb-1.5">
                          <HelpCircle size={14} /> Unverified Hypotheses
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-dusk-ink">
                          {a.customerAnalysis?.hypotheses?.map((hyp, i) => (
                            <li key={i}>{hyp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Glass>

                {/* 5. Market & Competitor Analysis */}
                <Glass className="p-6">
                  <h3 className="mb-3 font-semibold text-lg">5. Market & Competitor Analysis</h3>
                  <div className="space-y-3 text-sm text-dusk-ink leading-relaxed">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/10 p-3.5">
                        <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Direct Competitors</p>
                        <p className="text-xs">{a.marketAndCompetitors?.relevantCompetitors?.join(', ')}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-3.5">
                        <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Existing Alternatives & Workarounds</p>
                        <p className="text-xs">{a.marketAndCompetitors?.existingAlternatives?.join(', ')}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-2">Competitor Comparison Matrix</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {a.marketAndCompetitors?.competitorComparison?.map((comp, i) => (
                          <div key={i} className="rounded-xl bg-white/10 p-3.5 text-xs space-y-1.5 border border-white/10">
                            <p className="font-semibold text-sm text-dusk-deep">{comp.name}</p>
                            <p><b>Target Audience:</b> {comp.targetAudience}</p>
                            <p><b>Core Features:</b> {comp.coreFeatures}</p>
                            <p><b>Positioning:</b> {comp.positioning}</p>
                            <p className="text-dusk-mute"><b>Pricing Info:</b> {comp.pricingInfo}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/10 p-3.5">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Differentiation Opportunities</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        {a.marketAndCompetitors?.differentiationOpportunities?.map((diff, i) => (
                          <li key={i}>{diff}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-dusk-mute">
                      <p><b>Research Limitations Notice:</b> {a.marketAndCompetitors?.researchLimitationsNotice}</p>
                    </div>
                  </div>
                </Glass>

                {/* 10. Competitive Advantage */}
                <Glass className="p-6">
                  <h3 className="mb-3 font-semibold text-lg">10. Competitive Advantage & Defensibility</h3>
                  <div className="space-y-3 text-sm text-dusk-ink leading-relaxed">
                    <div className="rounded-xl bg-white/10 p-3.5">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Plausible Differentiators</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        {a.competitiveAdvantage?.plausibleDifferentiators?.map((diff, i) => (
                          <li key={i}>{diff}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-emerald-50/20 border border-emerald-200/40 p-3.5">
                        <p className="text-xs uppercase text-emerald-900 font-semibold mb-1">Genuinely Defensible Advantages</p>
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                          {a.competitiveAdvantage?.defensibleAdvantages?.map((def, i) => (
                            <li key={i}>{def}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl bg-amber-50/20 border border-amber-200/40 p-3.5">
                        <p className="text-xs uppercase text-amber-900 font-semibold mb-1">Features Easily Copied by Competitors</p>
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                          {a.competitiveAdvantage?.easilyCopiedFeatures?.map((cpy, i) => (
                            <li key={i}>{cpy}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Glass>
              </div>
            )}

            {/* TAB 4: BUSINESS MODEL & RISKS */}
            {tab === 'Business Model & Risks' && (
              <div className="rise space-y-4" key="bmr">
                {/* 6. Business Model */}
                <Glass className="p-6">
                  <h3 className="mb-3 font-semibold text-lg">6. Business Model & Monetization</h3>
                  <div className="space-y-3 text-sm text-dusk-ink leading-relaxed">
                    <div className="rounded-xl bg-white/10 p-3.5">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Possible Revenue Models</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        {a.businessModel?.possibleRevenueModels?.map((rev, i) => (
                          <li key={i}>{rev}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3.5">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Who Pays and Why</p>
                      <p className="text-xs">{a.businessModel?.whoPaysAndWhy}</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3.5">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Pricing Hypotheses & Assumptions</p>
                      <p className="text-xs">{a.businessModel?.pricingHypotheses}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/10 p-3.5">
                        <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Acquisition Challenges</p>
                        <p className="text-xs">{a.businessModel?.acquisitionChallenges}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-3.5">
                        <p className="text-xs uppercase text-dusk-mute font-medium mb-1">Retention Challenges</p>
                        <p className="text-xs">{a.businessModel?.retentionChallenges}</p>
                      </div>
                    </div>
                  </div>
                </Glass>

                {/* 7. Risks and Weaknesses */}
                <Glass className="p-6">
                  <h3 className="mb-3 font-semibold text-lg">7. Risks & Failure Modes</h3>
                  <div className="space-y-3">
                    {a.risksAndWeaknesses?.map((r, i) => (
                      <div key={i} className="rounded-xl bg-white/10 p-4 border border-white/10 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-dusk-deep">{r.risk}</span>
                          <span
                            className={`chip text-[10px] font-semibold ${r.severity === 'High'
                                ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                          >
                            {r.severity} Severity
                          </span>
                        </div>
                        <p><b>Why It Matters:</b> {r.whyItMatters}</p>
                        <p className="text-rose-900/90"><b>How It Could Cause Failure:</b> {r.failureMechanism}</p>
                        <p className="text-emerald-900 font-medium"><b>Mitigation Strategy:</b> {r.mitigationStrategy}</p>
                      </div>
                    ))}
                  </div>
                </Glass>

                {/* 8. Assumption Analysis */}
                <Glass className="p-6">
                  <h3 className="mb-3 font-semibold text-lg">8. Critical Assumption Analysis</h3>
                  <div className="space-y-3">
                    {a.assumptionAnalysis?.map((as, i) => (
                      <div key={i} className="rounded-xl bg-white/10 p-4 border border-white/10 space-y-1.5 text-xs">
                        <p className="font-semibold text-sm text-dusk-deep">{as.assumption}</p>
                        <p><b>Why Business Depends on It:</b> {as.whyItMatters}</p>
                        <p className="text-rose-900/90"><b>What Happens If False:</b> {as.ifFalseConsequence}</p>
                        <p className="text-blue-900 font-medium"><b>How To Test It:</b> {as.testMethod}</p>
                      </div>
                    ))}
                  </div>
                </Glass>
              </div>
            )}

            {/* TAB 5: VALIDATION PLAN */}
            {tab === 'Validation Plan' && (
              <div className="rise space-y-4" key="vp">
                <Glass className="p-6">
                  <h3 className="mb-2 font-semibold text-lg">9. Bounded Validation Plan</h3>
                  <p className="text-xs text-dusk-mute mb-4">
                    Concrete experiments designed to test customer behavior rather than opinions.
                  </p>
                  <div className="space-y-4">
                    {a.validationPlan?.experiments?.map(exp => (
                      <div key={exp.id} className="rounded-2xl bg-white/10 p-5 border border-white/15 space-y-3 text-xs sm:text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2">
                          <span className="font-semibold text-base text-dusk-deep">{exp.objective}</span>
                          <select
                            aria-label="Experiment status"
                            className="input w-auto text-xs py-1"
                            value={exp.status}
                            onChange={e =>
                              patch(an => ({
                                ...an,
                                validationPlan: {
                                  experiments: an.validationPlan.experiments.map(y =>
                                    y.id === exp.id ? { ...y, status: e.target.value as ExpStatus } : y
                                  ),
                                },
                              }))
                            }
                          >
                            {EXP.map(s => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 text-xs">
                          <p><b>Target Participants:</b> {exp.targetParticipants}</p>
                          <p><b>Measurable Criterion:</b> {exp.successCriterion}</p>
                        </div>

                        <div className="rounded-xl bg-white/10 p-3 text-xs space-y-1">
                          <p className="font-semibold text-dusk-deep">Exact Actions to Take:</p>
                          <p>{exp.actionsToTake}</p>
                        </div>

                        <div className="rounded-xl bg-white/10 p-3 text-xs space-y-1">
                          <p className="font-semibold text-dusk-deep">Questions to Ask:</p>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {exp.questionsToAsk?.map((q, idx) => (
                              <li key={idx}>{q}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3 text-xs">
                          <div className="rounded-lg bg-emerald-50/20 p-2.5 border border-emerald-200/30">
                            <p className="font-semibold text-emerald-900">Positive Signal</p>
                            <p className="text-[11px] mt-0.5">{exp.positiveInterpretation}</p>
                          </div>
                          <div className="rounded-lg bg-rose-50/20 p-2.5 border border-rose-200/30">
                            <p className="font-semibold text-rose-900">Negative Signal</p>
                            <p className="text-[11px] mt-0.5">{exp.negativeInterpretation}</p>
                          </div>
                          <div className="rounded-lg bg-amber-50/20 p-2.5 border border-amber-200/30">
                            <p className="font-semibold text-amber-900">Inconclusive Result</p>
                            <p className="text-[11px] mt-0.5">{exp.inconclusiveInterpretation}</p>
                          </div>
                        </div>

                        <label className="block text-xs font-medium pt-1">
                          Founder Learnings & Field Notes:
                          <textarea
                            className="input mt-1 text-xs"
                            rows={2}
                            value={exp.notes}
                            onChange={e =>
                              patch(an => ({
                                ...an,
                                validationPlan: {
                                  experiments: an.validationPlan.experiments.map(y =>
                                    y.id === exp.id ? { ...y, notes: e.target.value } : y
                                  ),
                                },
                              }))
                            }
                            placeholder="Record quotes, deposit checks, or specific friction points observed..."
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </Glass>
              </div>
            )}

            {/* TAB: VALIDATION & EVIDENCE (Interactive & Offline) */}
            {tab === 'Validation & Evidence' && (
              <div className="rise space-y-4" key="ve">
                {/* Evidence Overview Header */}
                <Glass className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-dusk-ink flex items-center gap-2">
                        <Users size={18} className="text-dusk-deep" />
                        Interactive Customer Validation & Evidence
                      </h3>
                      <p className="text-xs text-dusk-mute mt-0.5">
                        Record customer interviews, track assumption outcomes, and re-generate your verdict from real customer evidence without external AI.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyEvidenceUpdate(interviews, assumptions)}
                      className="btn-primary text-xs flex items-center gap-1.5 shadow-sm"
                      title="Recalculate report and verdict based on latest evidence"
                    >
                      <RefreshCw size={13} /> Update Evaluation with Evidence
                    </button>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-xl bg-white/10 p-3 border border-white/10">
                      <span className="text-dusk-mute block text-[11px] uppercase font-medium">Interviews Logged</span>
                      <span className="text-xl font-bold text-dusk-ink">{interviews.length}</span>
                    </div>
                    <div className="rounded-xl bg-emerald-50/25 p-3 border border-emerald-200/30">
                      <span className="text-emerald-900 block text-[11px] uppercase font-medium">Problem Confirmed</span>
                      <span className="text-xl font-bold text-emerald-800">
                        {interviews.filter(i => i.problemConfirmed).length}
                      </span>
                    </div>
                    <div className="rounded-xl bg-blue-50/25 p-3 border border-blue-200/30">
                      <span className="text-blue-900 block text-[11px] uppercase font-medium">Willing to Pay</span>
                      <span className="text-xl font-bold text-blue-800">
                        {interviews.filter(i => i.wouldPay).length}
                      </span>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3 border border-white/10">
                      <span className="text-dusk-mute block text-[11px] uppercase font-medium">Assumptions Tested</span>
                      <div className="text-xs font-semibold mt-1 space-x-1">
                        <span className="text-emerald-700 font-bold">{assumptions.filter(a => a.state === 'Supported').length} Supported</span>
                        <span>•</span>
                        <span className="text-rose-700 font-bold">{assumptions.filter(a => a.state === 'Disproved').length} Disproved</span>
                      </div>
                    </div>
                  </div>
                </Glass>

                {/* Section 1: Customer Interview Log */}
                <Glass className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h4 className="font-semibold text-base text-dusk-ink">1. Customer Discovery Interview Log</h4>
                      <p className="text-xs text-dusk-mute">
                        Document direct conversations with target customers. (Focus on past behavior, not opinions).
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-primary text-xs flex items-center gap-1.5"
                      onClick={() => setShowInterviewForm(prev => !prev)}
                    >
                      <Plus size={14} /> {showInterviewForm ? 'Close Form' : 'Log Customer Interview'}
                    </button>
                  </div>

                  {/* Add Interview Form */}
                  {showInterviewForm && (
                    <form
                      onSubmit={handleSaveInterview}
                      className="mb-6 rounded-2xl bg-white/15 p-5 border border-white/20 space-y-4"
                    >
                      <h5 className="font-semibold text-sm text-dusk-ink">Record New Interview</h5>
                      <div className="grid gap-3 sm:grid-cols-2 text-xs">
                        <div>
                          <label className="block font-medium mb-1">Interview Date</label>
                          <input
                            type="date"
                            className="input text-xs"
                            value={newInterview.date}
                            onChange={e => setNewInterview(p => ({ ...p, date: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Interviewee Role / Persona</label>
                          <input
                            type="text"
                            placeholder="e.g. Owner of 2-location specialty café"
                            className="input text-xs"
                            value={newInterview.intervieweeRole}
                            onChange={e => setNewInterview(p => ({ ...p, intervieweeRole: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3 text-xs">
                        <div>
                          <label className="block font-medium mb-1">Did they confirm the problem?</label>
                          <select
                            className="input text-xs"
                            value={newInterview.problemConfirmed ? 'yes' : 'no'}
                            onChange={e => setNewInterview(p => ({ ...p, problemConfirmed: e.target.value === 'yes' }))}
                          >
                            <option value="yes">Yes — Experiences severe pain</option>
                            <option value="no">No — Not a major issue for them</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Problem Occurrence Frequency</label>
                          <select
                            className="input text-xs"
                            value={newInterview.frequency}
                            onChange={e => setNewInterview(p => ({ ...p, frequency: e.target.value as any }))}
                          >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Rarely">Rarely</option>
                            <option value="Never">Never</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Would they pay to solve it?</label>
                          <select
                            className="input text-xs"
                            value={newInterview.wouldPay ? 'yes' : 'no'}
                            onChange={e => setNewInterview(p => ({ ...p, wouldPay: e.target.value === 'yes' }))}
                          >
                            <option value="yes">Yes — Agreed / offered budget</option>
                            <option value="no">No — Expects free / no budget</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 text-xs">
                        <div>
                          <label className="block font-medium mb-1">Current Workaround Used</label>
                          <input
                            type="text"
                            placeholder="e.g. Manual Google Sheets + email attachments"
                            className="input text-xs"
                            value={newInterview.currentWorkaround}
                            onChange={e => setNewInterview(p => ({ ...p, currentWorkaround: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Budget or Price Mentioned (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Would spend $50/month to save 5 hours"
                            className="input text-xs"
                            value={newInterview.estimatedBudget}
                            onChange={e => setNewInterview(p => ({ ...p, estimatedBudget: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block font-medium mb-1">Key Customer Quotes</label>
                        <input
                          type="text"
                          placeholder='e.g. "We lose 4 hours every Monday reconciling receipts and it drives us crazy."'
                          className="input text-xs"
                          value={newInterview.keyQuotes}
                          onChange={e => setNewInterview(p => ({ ...p, keyQuotes: e.target.value }))}
                        />
                      </div>

                      <div className="text-xs">
                        <label className="block font-medium mb-1">Field Notes & Observations</label>
                        <textarea
                          rows={2}
                          placeholder="What did you observe about their setup, hesitation, or unexpected workarounds?"
                          className="input text-xs"
                          value={newInterview.notes}
                          onChange={e => setNewInterview(p => ({ ...p, notes: e.target.value }))}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button type="button" className="btn-ghost text-xs" onClick={() => setShowInterviewForm(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary text-xs">
                          Save Interview & Update Evaluation
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Interviews List */}
                  {interviews.length === 0 ? (
                    <div className="rounded-2xl bg-white/5 p-6 border border-white/10 text-center">
                      <MessageSquare className="mx-auto text-dusk-mute mb-2" size={28} />
                      <p className="text-sm font-medium text-dusk-ink">No customer interviews logged yet</p>
                      <p className="text-xs text-dusk-mute mt-1 max-w-md mx-auto">
                        Speak to 5 potential customers using non-leading questions. Click &ldquo;Log Customer Interview&rdquo; above to record your first conversation.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {interviews.map(item => (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-white/10 p-4 border border-white/15 space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-sm text-dusk-ink">{item.intervieweeRole}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-dusk-mute text-[11px]">{item.date}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteInterview(item.id)}
                                className="text-rose-700 hover:text-rose-900 text-xs p-1"
                                title="Delete interview"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                item.problemConfirmed
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}
                            >
                              {item.problemConfirmed ? 'Problem Confirmed' : 'Problem Not Felt'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                item.wouldPay
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {item.wouldPay ? 'Willing to Pay' : 'Would Not Pay'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-dusk-ink">
                              Frequency: {item.frequency}
                            </span>
                            {item.estimatedBudget && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-900">
                                Budget: {item.estimatedBudget}
                              </span>
                            )}
                          </div>

                          {item.currentWorkaround && (
                            <p className="text-dusk-ink">
                              <strong>Current workaround:</strong> {item.currentWorkaround}
                            </p>
                          )}

                          {item.keyQuotes && (
                            <blockquote className="rounded-xl bg-white/10 p-2.5 italic text-dusk-ink border-l-2 border-dusk-deep">
                              &ldquo;{item.keyQuotes}&rdquo;
                            </blockquote>
                          )}

                          {item.notes && <p className="text-dusk-mute">{item.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </Glass>

                {/* Section 2: Assumptions Tracker */}
                <Glass className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h4 className="font-semibold text-base text-dusk-ink">2. Foundational Assumptions Status Tracker</h4>
                      <p className="text-xs text-dusk-mute">
                        Mark assumptions as Supported or Disproved based on your customer discovery evidence.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {assumptions.map(as => (
                      <div
                        key={as.id}
                        className={`rounded-2xl p-4 border transition ${
                          as.state === 'Supported'
                            ? 'bg-emerald-50/15 border-emerald-300/40'
                            : as.state === 'Disproved'
                              ? 'bg-rose-50/15 border-rose-300/40'
                              : 'bg-white/10 border-white/15'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <p className="font-semibold text-xs sm:text-sm text-dusk-ink">{as.assumption}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            {(['Untested', 'Supported', 'Disproved'] as AssumptionState[]).map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleUpdateAssumptionState(as.id, st)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                                  as.state === st
                                    ? st === 'Supported'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : st === 'Disproved'
                                        ? 'bg-rose-600 text-white shadow-sm'
                                        : 'bg-dusk-deep text-white shadow-sm'
                                    : 'bg-white/15 text-dusk-mute hover:bg-white/25'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-dusk-mute mb-1">
                            Evidence notes for this assumption:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 4 café owners said they would switch; or: Users refused to pay, said spreadsheets were fine..."
                            className="input text-xs"
                            value={as.evidenceNotes}
                            onChange={e => handleUpdateAssumptionNotes(as.id, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Assumption Form */}
                  <form onSubmit={handleAddCustomAssumption} className="mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a new assumption to track (e.g. Users will install a browser extension)..."
                      className="input text-xs"
                      value={newCustomAssumption}
                      onChange={e => setNewCustomAssumption(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!newCustomAssumption.trim()}
                      className="btn-ghost text-xs shrink-0 flex items-center gap-1"
                    >
                      <Plus size={13} /> Add Assumption
                    </button>
                  </form>
                </Glass>

                {/* Section 3: Next Actions & Evidence Needed */}
                <Glass className="p-6">
                  <h4 className="font-semibold text-base text-dusk-ink mb-2">3. Recommended Validation Direction</h4>
                  <div className="rounded-xl bg-white/10 p-4 text-xs sm:text-sm space-y-2">
                    {assumptions.some(a => a.state === 'Disproved') ? (
                      <div className="text-rose-900 space-y-1">
                        <p className="font-bold">Caution: A critical assumption has been disproved.</p>
                        <p>
                          Do not build software yet. Review your customer interview notes to discover why customers declined,
                          and refine your problem statement or customer target in the Edit tab.
                        </p>
                      </div>
                    ) : interviews.filter(i => i.problemConfirmed && i.wouldPay).length >= 3 ? (
                      <div className="text-emerald-950 space-y-1">
                        <p className="font-bold">Validation Signal: High Problem Pain and Willingness to Pay Verified!</p>
                        <p>
                          You have verified real pain and willingness to pay with multiple prospects. Build a minimalist
                          prototype or concierge pilot to deliver directly to these users.
                        </p>
                      </div>
                    ) : (
                      <div className="text-dusk-ink space-y-1">
                        <p className="font-bold">Validation Priority: Conduct Discovery Interviews</p>
                        <p>
                          You have logged {interviews.length} customer interview(s). Complete at least 5 discovery calls
                          and test commitment (letters of intent or pre-order deposits) before writing code.
                        </p>
                      </div>
                    )}
                  </div>
                </Glass>
              </div>
            )}

            {/* TAB 6: OPEN QUESTIONS */}
            {tab === 'Open Questions' && (
              <div className="rise space-y-4" key="oq">
                <Glass className="p-6">
                  <h3 className="mb-3 font-semibold text-lg">12. Open Questions & Missing Data</h3>
                  <div className="space-y-4 text-sm text-dusk-ink leading-relaxed">
                    <div className="rounded-xl bg-white/10 p-4">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-2">Missing Material Information</p>
                      <ul className="list-disc pl-4 space-y-1.5 text-xs sm:text-sm">
                        {a.openQuestions?.missingMaterialInfo?.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-white/10 p-4">
                      <p className="text-xs uppercase text-dusk-mute font-medium mb-2">Focused Follow-Up Questions for the Founder</p>
                      <ul className="list-disc pl-4 space-y-1.5 text-xs sm:text-sm">
                        {a.openQuestions?.focusedFollowUpQuestions?.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-amber-50/20 border border-amber-200/40 p-4 text-xs">
                      <p className="font-semibold text-amber-950 mb-1">Analysis Limitations Notice:</p>
                      <p className="text-dusk-ink leading-relaxed">{a.openQuestions?.limitationsNotice}</p>
                    </div>
                  </div>
                </Glass>
              </div>
            )}

            {/* TAB 7: KNOWLEDGE LIBRARY */}
            {tab === 'Knowledge Library' && (
              <div className="rise space-y-4" key="kl">
                <Glass className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <BookOpen size={20} className="text-dusk-deep" /> Founder Knowledge Library
                      </h3>
                      <p className="text-xs sm:text-sm text-dusk-mute mt-1">
                        11 first-principles validation frameworks powering the deterministic FOCAS Founder Intelligence Engine.
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-950 border border-emerald-500/30 font-semibold shrink-0">
                      Deterministic • Versioned
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {FOUNDER_KNOWLEDGE_LIBRARY.map(fw => (
                      <div
                        key={fw.id}
                        className="rounded-2xl p-4 sm:p-5 bg-white/10 border border-white/15 space-y-3 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-dusk-deep/10 text-dusk-deep font-bold">
                              {fw.id}
                            </span>
                            <span className="text-[11px] text-dusk-mute font-mono">v{fw.version}</span>
                          </div>
                          <h4 className="font-semibold text-sm text-dusk-ink mb-1.5">{fw.title}</h4>
                          <p className="text-xs text-dusk-mute leading-relaxed mb-3">{fw.purpose}</p>

                          <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                            <div>
                              <span className="text-[11px] font-semibold text-dusk-ink block mb-0.5">Decision Rules:</span>
                              <ul className="list-disc pl-4 space-y-1 text-dusk-mute text-[11px]">
                                {fw.decisionRules.slice(0, 3).map((r, ri) => (
                                  <li key={ri}>{r}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <span className="text-[11px] font-semibold text-rose-800 block mb-0.5">Known Limitations:</span>
                              <ul className="list-disc pl-4 space-y-1 text-rose-900/80 text-[11px]">
                                {fw.limitations.slice(0, 2).map((l, li) => (
                                  <li key={li}>{l}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-dusk-mute">
                          <span>Provenance: <strong className="text-dusk-ink font-medium">{fw.source}</strong></span>
                          <span className="capitalize px-2 py-0.5 rounded-full bg-white/20 text-[10px]">
                            {fw.area.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Glass>
              </div>
            )}
        </div>
      )}
    </div>
  )
}
