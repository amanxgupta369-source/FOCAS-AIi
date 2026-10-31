import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lightbulb,
  XCircle,
  FileText,
  Calendar,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Target,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Pencil,
  Trash2,
  X,
  Bell,
  Eye,
  Check,
  Compass,
} from 'lucide-react'
import type {
  CustomerInterview,
  Project,
  ProjectTimelineEntry,
  Stage,
  Status,
  TrackedAssumption,
  ValidationSprintTask,
} from '../types'
import { Badge, Glass } from '../components/ui'
import {
  determineNextBestAction,
  generateInitialSprint,
  getSprintProgress,
  computeRecalculationDelta,
  generateWeeklyReviewSummary,
} from '../lib/validationSprint'
import { generateBasicEvaluation } from '../lib/basicEvaluation'
import { trackEvent } from '../lib/analytics'

export default function ProjectToday({
  project,
  onChange,
  onViewReport,
  onReevaluate,
  onEdit,
  onDelete,
  onViewVerdict,
}: {
  project: Project
  onChange: (p: Project) => void
  onViewReport: () => void
  onReevaluate: () => void
  onEdit: () => void
  onDelete: () => void
  onViewVerdict: () => void
}) {
  const { form, analysis } = project
  const sprint = project.sprint || (analysis ? generateInitialSprint(project) : undefined)
  const sprintProgress = getSprintProgress(sprint)
  const nextAction = determineNextBestAction(project)
  const interviews = project.interviews || []
  const assumptions = project.trackedAssumptions || []
  const timeline = project.timeline || [
    {
      id: 'init-eval',
      timestamp: project.updated || new Date().toISOString(),
      type: 'evaluation' as const,
      title: 'Deterministic Evaluation Completed',
      description: `Baseline readiness index calculated at ${analysis?.score ?? 25}/100.`,
      scoreDelta: { before: 0, after: analysis?.score ?? 25 },
    },
  ]

  // Modals & Drawers state
  const [showLogInterview, setShowLogInterview] = useState(false)
  const [showTestAssumption, setShowTestAssumption] = useState(false)
  const [showScriptModal, setShowScriptModal] = useState<string | null>(null)
  const [showWeeklyReview, setShowWeeklyReview] = useState(false)
  const [showReminderSettings, setShowReminderSettings] = useState(false)
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<ValidationSprintTask | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Fast Interview form state
  const [newInterview, setNewInterview] = useState<Partial<CustomerInterview>>({
    date: new Date().toISOString().split('T')[0],
    intervieweeRole: '',
    problemConfirmed: true,
    frequency: 'Weekly',
    wouldPay: false,
    estimatedBudget: '',
    currentWorkaround: '',
    keyQuotes: '',
    notes: '',
  })

  // Fast Assumption testing state
  const [selectedAssumptionId, setSelectedAssumptionId] = useState<string>(
    assumptions[0]?.id || ''
  )
  const [assumptionNewState, setAssumptionNewState] = useState<'Supported' | 'Disproved' | 'Untested'>('Supported')
  const [assumptionNotes, setAssumptionNotes] = useState('')

  // Reminder settings state
  const [reminderFreq, setReminderFreq] = useState<'weekly' | 'biweekly' | 'off'>(
    project.reminderPreferences?.frequency || 'weekly'
  )
  const [quietHours, setQuietHours] = useState(
    project.reminderPreferences?.quietHours ?? true
  )
  const [weeklyGoal, setWeeklyGoal] = useState(
    project.reminderPreferences?.weeklyGoalInterviews || 3
  )

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 5000)
  }

  // Handle Starting Sprint
  const handleStartSprint = () => {
    const newSprint = generateInitialSprint(project)
    const newTimelineEntry: ProjectTimelineEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'sprint_started',
      title: '7-Day Validation Sprint Started',
      description: 'Step 1 (Idea Evaluation) complete. Moving to customer discovery outreach.',
      badge: 'Sprint Active',
    }

    trackEvent('validation_sprint_started', project.id)
    onChange({
      ...project,
      status: 'Validating',
      sprint: newSprint,
      timeline: [newTimelineEntry, ...timeline],
      updated: new Date().toISOString(),
    })
    showToast('7-Day Validation Sprint started! Step 1 marked complete.')
  }

  // Handle Toggle Task Status
  const handleToggleTask = (taskId: string) => {
    if (!sprint) return
    const updatedTasks = sprint.tasks.map(t => {
      if (t.id !== taskId) return t
      const nextStatus = t.status === 'Completed' ? 'Pending' : 'Completed'
      return { ...t, status: nextStatus as any }
    })

    const target = sprint.tasks.find(t => t.id === taskId)
    const isNowCompleted = target?.status !== 'Completed'

    const updatedSprint = { ...sprint, tasks: updatedTasks }
    const timelineEntry: ProjectTimelineEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'task_completed',
      title: isNowCompleted ? `Task Completed: ${target?.title}` : `Task Reopened: ${target?.title}`,
      description: target?.outcome || '',
    }

    if (isNowCompleted) {
      trackEvent('validation_task_completed', project.id, { stepNumber: target?.stepNumber })
    }

    onChange({
      ...project,
      sprint: updatedSprint,
      timeline: [timelineEntry, ...timeline],
      updated: new Date().toISOString(),
    })
  }

  // Core Recalculation Engine with Before/After Diff
  const runRecalculation = (
    updatedInterviews: CustomerInterview[],
    updatedAssumptions: TrackedAssumption[],
    actionSummary: string
  ) => {
    const oldAnalysis = project.analysis
    const newAnalysis = generateBasicEvaluation(
      project.form,
      updatedInterviews,
      updatedAssumptions,
      project.isQuotaExceeded
    )

    const delta = computeRecalculationDelta(
      oldAnalysis,
      newAnalysis,
      updatedInterviews,
      updatedAssumptions
    )

    const timelineEntry: ProjectTimelineEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'recalculation',
      title: actionSummary,
      description: delta.plainEnglishExplanation,
      scoreDelta: { before: delta.scoreBefore, after: delta.scoreAfter },
      verdictDelta: { before: delta.verdictBefore, after: delta.verdictAfter },
    }

    trackEvent('evaluation_recalculated', project.id, {
      readinessScore: delta.scoreAfter,
      deltaPoints: delta.scoreAfter - delta.scoreBefore,
    })

    onChange({
      ...project,
      interviews: updatedInterviews,
      trackedAssumptions: updatedAssumptions,
      analysis: newAnalysis,
      lastRecalculationDelta: delta,
      timeline: [timelineEntry, ...timeline],
      updated: new Date().toISOString(),
    })

    showToast(
      `Recalculation complete! Score: ${delta.scoreBefore} → ${delta.scoreAfter}/100. ${delta.plainEnglishExplanation}`
    )
  }

  // Save Interview Handler
  const handleSaveInterview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInterview.intervieweeRole?.trim()) return

    const interviewRecord: CustomerInterview = {
      id: crypto.randomUUID(),
      date: newInterview.date || new Date().toISOString().split('T')[0],
      intervieweeRole: newInterview.intervieweeRole.trim(),
      problemConfirmed: Boolean(newInterview.problemConfirmed),
      frequency: (newInterview.frequency as any) || 'Weekly',
      wouldPay: Boolean(newInterview.wouldPay),
      estimatedBudget: newInterview.estimatedBudget?.trim() || '',
      currentWorkaround: newInterview.currentWorkaround?.trim() || '',
      keyQuotes: newInterview.keyQuotes?.trim() || '',
      notes: newInterview.notes?.trim() || '',
    }

    const updatedInterviews = [interviewRecord, ...interviews]

    // Update Step 4 in Sprint if 5 interviews completed
    let updatedSprint = sprint
    if (sprint) {
      updatedSprint = {
        ...sprint,
        tasks: sprint.tasks.map(t => {
          if (t.id === 'step-4-interviews' && updatedInterviews.length >= 5) {
            return { ...t, status: 'Completed' }
          }
          return t
        }),
      }
    }

    trackEvent('customer_interview_logged', project.id, {
      interviewCount: updatedInterviews.length,
    })

    setShowLogInterview(false)
    setNewInterview({
      date: new Date().toISOString().split('T')[0],
      intervieweeRole: '',
      problemConfirmed: true,
      frequency: 'Weekly',
      wouldPay: false,
      estimatedBudget: '',
      currentWorkaround: '',
      keyQuotes: '',
      notes: '',
    })

    runRecalculation(
      updatedInterviews,
      assumptions,
      `Interview Logged: ${interviewRecord.intervieweeRole}`
    )
  }

  // Save Assumption Test Handler
  const handleSaveAssumptionTest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssumptionId) return

    const updatedAssumptions = assumptions.map(a => {
      if (a.id !== selectedAssumptionId) return a
      return {
        ...a,
        state: assumptionNewState,
        evidenceNotes: assumptionNotes.trim() || a.evidenceNotes,
        lastUpdated: new Date().toISOString(),
      }
    })

    trackEvent('evidence_added', project.id, { taskType: 'assumption' })
    setShowTestAssumption(false)
    setAssumptionNotes('')

    runRecalculation(
      interviews,
      updatedAssumptions,
      `Assumption Tested: ${assumptions.find(a => a.id === selectedAssumptionId)?.assumption.slice(0, 40)}...`
    )
  }

  // Save Reminder Preferences
  const handleSaveReminders = () => {
    onChange({
      ...project,
      reminderPreferences: {
        enabled: reminderFreq !== 'off',
        frequency: reminderFreq,
        quietHours,
        weeklyGoalInterviews: weeklyGoal,
        lastReviewDate: new Date().toISOString(),
      },
      updated: new Date().toISOString(),
    })
    setShowReminderSettings(false)
    showToast('Validation reminder preferences saved.')
  }

  const verdict = analysis?.overallVerdict?.decision || 'VALIDATE FIRST'
  const score = analysis?.score ?? 25
  const biggestConcern = analysis?.overallVerdict?.biggestConcern || analysis?.risksAndWeaknesses?.[0]?.risk
  const weeklySummary = generateWeeklyReviewSummary(project)

  return (
    <div className="rise space-y-4 sm:space-y-5 pb-28 md:pb-16 max-w-4xl mx-auto px-2.5 sm:px-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-3.5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center justify-between gap-3 text-xs fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="leading-snug">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* A. Project Header & Returning Summary */}
      <Glass className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Workspace
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/80">
                <Target size={11} /> {project.status}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500">
                Updated {new Date(project.updated).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 break-words leading-tight">
              {form.name || 'Untitled Startup Project'}
            </h1>
            <p className="mt-1 text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {form.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
            <button
              onClick={() => setShowWeeklyReview(true)}
              className="btn-ghost py-2 px-3 text-xs font-semibold rounded-xl flex items-center gap-1.5 min-h-[44px] active:scale-95"
              title="Weekly Founder Review"
            >
              <Calendar size={14} className="text-sky-600" />
              <span className="hidden sm:inline">Weekly Review</span>
            </button>
            <button
              onClick={() => setShowReminderSettings(true)}
              className="btn-ghost p-2 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
              title="Reminder Preferences"
              aria-label="Reminder Preferences"
            >
              <Bell size={15} />
            </button>
            <button
              onClick={onEdit}
              className="btn-ghost p-2 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
              title="Edit Idea Form"
              aria-label="Edit Idea Form"
            >
              <Pencil size={15} />
            </button>
          </div>
        </div>

        {/* Welcome Back Progress Banner */}
        <div className="mt-4 pt-4 border-t border-white/40 flex items-start gap-3 bg-sky-500/10 p-3.5 rounded-2xl border border-sky-400/25">
          <div className="p-2 rounded-xl bg-sky-100/80 text-sky-800 shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed min-w-0">
            <span className="font-semibold text-slate-900">Validation Status: </span>
            {interviews.length === 0 ? (
              <span>
                Your idea evaluation is complete. You have zero customer discovery interviews logged. Complete your first interview to test willingness to pay.
              </span>
            ) : (
              <span>
                You have completed <strong className="text-slate-900 font-bold">{interviews.length} discovery calls</strong> ({interviews.filter(i => i.problemConfirmed).length} confirmed acute pain). {interviews.filter(i => i.wouldPay).length > 0 ? `${interviews.filter(i => i.wouldPay).length} confirmed intent to pay.` : 'Willingness to pay remains unproven.'}
              </span>
            )}
          </div>
        </div>
      </Glass>

      {/* B. One Dominant Next Best Action Card */}
      <div className="glass-deep p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-60 h-60 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-200 bg-sky-950/70 px-3 py-1 rounded-full border border-sky-400/30 backdrop-blur-md">
              <Play size={11} className="fill-sky-300 text-sky-300" /> Next Best Action
            </span>
            <span className="text-xs font-medium text-sky-200/80 inline-flex items-center gap-1">
              <Clock size={12} /> Est. {nextAction.estimatedEffort}
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              {nextAction.action}
            </h2>
            <p className="mt-2 text-sm text-sky-100/85 leading-relaxed font-normal">
              {nextAction.whyItMatters}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                trackEvent('next_action_clicked', project.id, { taskType: nextAction.primaryActionType })
                if (nextAction.primaryActionType === 'interview') {
                  setShowLogInterview(true)
                } else if (nextAction.primaryActionType === 'assumption') {
                  setShowTestAssumption(true)
                } else {
                  onViewReport()
                }
              }}
              className="btn bg-white/90 hover:bg-white text-[#1E293B] font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md border border-white transition active:scale-[0.99] min-h-[48px]"
            >
              <span>{nextAction.primaryButtonLabel}</span>
              <ArrowRight size={16} />
            </button>

            {nextAction.scriptTemplate && (
              <button
                onClick={() => setShowScriptModal(nextAction.scriptTemplate || null)}
                className="btn py-3 px-4 rounded-xl text-xs font-semibold text-sky-100 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition text-center min-h-[48px]"
              >
                {nextAction.secondaryButtonLabel || 'View Interview Script'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* C. Guided 7-Day Validation Sprint Card */}
      <Glass className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">7-Day Validation Sprint</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/40 text-slate-800 border border-white/60">
                Step {sprintProgress.completedCount} of {sprintProgress.totalCount} complete
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Derived deterministically from your customer and problem evaluation.
            </p>
          </div>

          {!project.sprint && (
            <button
              onClick={handleStartSprint}
              className="btn-primary py-2 px-3.5 text-xs font-bold rounded-xl transition"
            >
              Start 7-Day Sprint
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-sky-200/50 rounded-full h-2 mb-5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#5B7E98] to-[#ADC7DD] h-2 rounded-full transition-all duration-500"
            style={{ width: `${sprintProgress.percent}%` }}
          />
        </div>

        {/* Task List */}
        <div className="space-y-2.5">
          {sprint?.tasks.map(task => {
            const isCompleted = task.status === 'Completed'
            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                  isCompleted
                    ? 'bg-white/20 border-white/30 opacity-75'
                    : 'bg-white/30 border border-white/50 shadow-xs hover:bg-white/50 hover:border-sky-300/60 backdrop-blur-md'
                }`}
              >
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition min-w-[32px] min-h-[32px] active:scale-90 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border-2 border-slate-300 hover:border-slate-500 text-transparent'
                  }`}
                  aria-label={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                >
                  <Check size={16} strokeWidth={3} />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold ${
                        isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      Step {task.stepNumber}: {task.title}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-slate-400">
                      {task.estimatedEffort}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="mt-2 flex items-center gap-2 flex-wrap pt-1">
                    {task.scriptTemplate && (
                      <button
                        onClick={() => setSelectedTaskDetails(task)}
                        className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
                      >
                        <FileText size={11} /> View Template & Details
                      </button>
                    )}
                    {task.actionType === 'interview' && (
                      <button
                        onClick={() => setShowLogInterview(true)}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition"
                      >
                        + Log Interview
                      </button>
                    )}
                    {task.actionType === 'assumption' && (
                      <button
                        onClick={() => setShowTestAssumption(true)}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                      >
                        Test Assumption
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Glass>

      {/* D & E. Two-Column Verdict Confidence & Biggest Unresolved Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* D. Verdict & Readiness Confidence */}
        <Glass className="p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Verdict
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  verdict === 'BUILD'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : verdict === 'VALIDATE FIRST'
                      ? 'bg-sky-50 text-sky-800 border-sky-300'
                      : verdict === 'RETHINK'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {verdict}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
                {score}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100 Readiness Index</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {analysis?.overallVerdict?.conciseExplanation ||
                'Empirical evidence-completeness index derived from structured customer discovery.'}
            </p>

            <div className="space-y-1.5 text-xs border-t border-sky-100/60 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Problem Evidence:</span>
                <span className="font-semibold text-slate-900">
                  {interviews.filter(i => i.problemConfirmed).length >= 3 ? 'Strong' : interviews.length > 0 ? 'Moderate' : 'Unproven'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Willingness to Pay:</span>
                <span className="font-semibold text-slate-900">
                  {interviews.filter(i => i.wouldPay).length >= 2 ? 'Validated' : 'Unproven'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Refuted Assumptions:</span>
                <span className="font-semibold text-slate-900">
                  {assumptions.filter(a => a.state === 'Disproved').length}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onViewVerdict}
            className="mt-4 pt-3 border-t border-sky-100/60 text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center justify-between w-full"
          >
            <span>View 9-Section Verdict Breakdown</span>
            <ChevronRight size={14} />
          </button>
        </Glass>

        {/* E. Biggest Unresolved Risk */}
        <Glass className="p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-amber-700">
              <ShieldAlert size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Biggest Unresolved Risk
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {biggestConcern || 'Habit inertia and budget authorization.'}
            </h3>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              {analysis?.overallVerdict?.criticalAssumption?.whyBusinessDependsOnIt ||
                'Customers may acknowledge the pain but continue tolerating it with free workarounds or manual routines unless switching is effortless.'}
            </p>

            <div className="mt-3 bg-amber-50/70 p-3 rounded-2xl border border-amber-200/60 text-xs text-amber-900">
              <span className="font-bold">Cheapest Test: </span>
              {analysis?.overallVerdict?.criticalAssumption?.cheapestTest ||
                'Ask 3 customers for a refundable $20 deposit or non-binding Letter of Intent before building.'}
            </div>
          </div>

          <button
            onClick={() => setShowTestAssumption(true)}
            className="mt-4 pt-3 border-t border-sky-100/60 text-xs font-bold text-slate-800 hover:text-slate-950 flex items-center justify-between w-full"
          >
            <span>Test this assumption with evidence</span>
            <ChevronRight size={14} />
          </button>
        </Glass>
      </div>

      {/* F. Recent Timeline Activity & Recalculation Diffs */}
      <Glass className="p-5 sm:p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Startup Validation Timeline</h2>
            <p className="text-xs text-slate-500">
              The living memory of tests, customer feedback, and verdict shifts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLogInterview(true)}
              className="btn-primary text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition"
            >
              + Log Evidence
            </button>
          </div>
        </div>

        {/* Recalculation Before/After Diff banner if available */}
        {project.lastRecalculationDelta && (
          <div className="mb-4 p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-slate-900 backdrop-blur-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <span className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                Latest Recalculation Delta
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {new Date(project.lastRecalculationDelta.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2">
              <div className="p-2 rounded-xl bg-white/40 border border-white/60">
                <span className="text-slate-500 text-[10px] block">Readiness Score</span>
                <span className="font-bold font-mono text-slate-900">
                  {project.lastRecalculationDelta.scoreBefore} → {project.lastRecalculationDelta.scoreAfter}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/40 border border-white/60">
                <span className="text-slate-500 text-[10px] block">Problem Evidence</span>
                <span className="font-bold text-slate-900">
                  {project.lastRecalculationDelta.problemEvidenceBefore} → {project.lastRecalculationDelta.problemEvidenceAfter}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/40 border border-white/60">
                <span className="text-slate-500 text-[10px] block">Willingness to Pay</span>
                <span className="font-bold text-slate-900">
                  {project.lastRecalculationDelta.willingnessToPayBefore} → {project.lastRecalculationDelta.willingnessToPayAfter}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/40 border border-white/60">
                <span className="text-slate-500 text-[10px] block">Verdict</span>
                <span className="font-bold text-slate-900">
                  {project.lastRecalculationDelta.verdictAfter}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {project.lastRecalculationDelta.plainEnglishExplanation}
            </p>
          </div>
        )}

        {/* Timeline list */}
        <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-sky-300/60">
          {timeline.slice(0, 5).map(entry => (
            <div key={entry.id} className="relative pl-7 text-xs">
              <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-[#5B7E98] ring-4 ring-white/80" />
              <div className="p-3 rounded-xl bg-white/40 border border-white/60">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-bold text-slate-900">{entry.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">{entry.description}</p>
                {entry.scoreDelta && (
                  <span className="mt-1.5 inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
                    Score: {entry.scoreDelta.before} → {entry.scoreDelta.after}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Glass>

      {/* G. Secondary Entry into Full Report */}
      <div className="p-5 rounded-3xl glass flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Need the deep technical dive?</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Access the complete 12-section analysis including Mom Test scripts, competitor breakdown, and unit economics.
          </p>
        </div>
        <button
          onClick={onViewReport}
          className="btn-primary py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <span>View Full 12-Section Report</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* MODAL 1: Fast Customer Interview Logging Drawer */}
      {showLogInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 fade-in">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowLogInterview(false)} />
          <div className="relative z-10 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg glass-solid rounded-2xl sm:rounded-3xl shadow-2xl border border-white/70 p-4 sm:p-6 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Log Customer Interview</h3>
                <p className="text-xs text-slate-500">Record evidence to trigger deterministic score recalculation.</p>
              </div>
              <button onClick={() => setShowLogInterview(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveInterview} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="input text-base sm:text-xs"
                    value={newInterview.date}
                    onChange={e => setNewInterview({ ...newInterview, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interviewee Role / Company</label>
                  <input
                    type="text"
                    className="input text-base sm:text-xs"
                    placeholder="e.g. Lead Dental Receptionist"
                    value={newInterview.intervieweeRole}
                    onChange={e => setNewInterview({ ...newInterview, intervieweeRole: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/40 border border-white/60 space-y-2">
                <div className="flex items-center justify-between min-h-[40px]">
                  <span className="font-bold text-slate-800">Did they confirm acute pain?</span>
                  <label className="inline-flex items-center gap-2 cursor-pointer min-h-[40px] px-2 rounded-lg hover:bg-white/40">
                    <input
                      type="checkbox"
                      checked={newInterview.problemConfirmed}
                      onChange={e => setNewInterview({ ...newInterview, problemConfirmed: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="font-semibold text-slate-700">Yes, acute pain</span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/50 min-h-[40px]">
                  <span className="font-bold text-slate-800">Willingness to pay or allocate budget?</span>
                  <label className="inline-flex items-center gap-2 cursor-pointer min-h-[40px] px-2 rounded-lg hover:bg-white/40">
                    <input
                      type="checkbox"
                      checked={newInterview.wouldPay}
                      onChange={e => setNewInterview({ ...newInterview, wouldPay: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="font-semibold text-slate-700">Yes, intent/budget</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Workaround Observed</label>
                <input
                  type="text"
                  className="input text-base sm:text-xs"
                  placeholder="e.g. Color-coded Excel sheet + physical sticky notes"
                  value={newInterview.currentWorkaround}
                  onChange={e => setNewInterview({ ...newInterview, currentWorkaround: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Customer Quotes (Direct verbatim)</label>
                <textarea
                  className="input text-base sm:text-xs min-h-[70px] resize-none"
                  placeholder='"We lost $800 last Friday because two bookings collided and doctor sat idle..."'
                  value={newInterview.keyQuotes}
                  onChange={e => setNewInterview({ ...newInterview, keyQuotes: e.target.value })}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2 border-t border-white/40">
                <button
                  type="button"
                  onClick={() => setShowLogInterview(false)}
                  className="w-full sm:w-auto btn-ghost py-2.5 px-4 text-xs font-semibold rounded-xl min-h-[44px] flex items-center justify-center active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto btn-primary py-2.5 px-5 text-xs font-bold rounded-xl min-h-[44px] flex items-center justify-center active:scale-98 shadow-sm"
                >
                  Save & Recalculate Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Test Assumption Drawer */}
      {showTestAssumption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 fade-in">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowTestAssumption(false)} />
          <div className="relative z-10 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg glass-solid rounded-2xl sm:rounded-3xl shadow-2xl border border-white/70 p-4 sm:p-6 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Test Tracked Assumption</h3>
                <p className="text-xs text-slate-500">Update assumption state to adjust the risk index.</p>
              </div>
              <button onClick={() => setShowTestAssumption(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAssumptionTest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Assumption to Update</label>
                <select
                  className="input text-base sm:text-xs min-h-[44px]"
                  value={selectedAssumptionId}
                  onChange={e => setSelectedAssumptionId(e.target.value)}
                >
                  {assumptions.map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.category}] {a.assumption.slice(0, 60)}... ({a.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">New Empirical Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Supported', 'Disproved', 'Untested'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAssumptionNewState(st)}
                      className={`py-2 px-1.5 xs:px-3 rounded-xl font-bold border transition text-center min-h-[40px] flex items-center justify-center text-xs active:scale-95 ${
                        assumptionNewState === st
                          ? st === 'Supported'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                            : st === 'Disproved'
                              ? 'bg-rose-100 text-rose-900 border-rose-400'
                              : 'bg-white/60 text-slate-900 border-white/70'
                          : 'bg-white/30 text-slate-700 border-white/50 hover:bg-white/50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Evidence & Verification Notes</label>
                <textarea
                  className="input text-base sm:text-xs min-h-[70px] resize-none"
                  placeholder="e.g. 3 of 4 practice managers verified they manually reconcile spreadsheets every Monday morning..."
                  value={assumptionNotes}
                  onChange={e => setAssumptionNotes(e.target.value)}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2 border-t border-white/40">
                <button
                  type="button"
                  onClick={() => setShowTestAssumption(false)}
                  className="w-full sm:w-auto btn-ghost py-2.5 px-4 text-xs font-semibold rounded-xl min-h-[44px] flex items-center justify-center active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto btn-primary py-2.5 px-5 text-xs font-bold rounded-xl min-h-[44px] flex items-center justify-center active:scale-98 shadow-sm"
                >
                  Update & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Script & Template Details Drawer */}
      {(showScriptModal || selectedTaskDetails) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 fade-in">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => {
              setShowScriptModal(null)
              setSelectedTaskDetails(null)
            }}
          />
          <div className="relative z-10 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg glass-solid rounded-2xl sm:rounded-3xl shadow-2xl border border-white/70 p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedTaskDetails?.title || 'Execution Script & Guide'}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTaskDetails?.outcome || 'Non-leading discovery guide for founders.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowScriptModal(null)
                  setSelectedTaskDetails(null)
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/30 border border-white/50 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
              {showScriptModal || selectedTaskDetails?.scriptTemplate}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-500">
                Tip: Copy and personalize the script without changing the core Mom Test question rules.
              </span>
              <button
                onClick={() => {
                  setShowScriptModal(null)
                  setSelectedTaskDetails(null)
                }}
                className="w-full sm:w-auto btn-primary py-2.5 px-6 text-xs font-bold rounded-xl min-h-[44px] flex items-center justify-center active:scale-98 shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Weekly Founder Review Snapshot */}
      {showWeeklyReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 fade-in">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowWeeklyReview(false)} />
          <div className="relative z-10 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg glass-solid rounded-2xl sm:rounded-3xl shadow-2xl border border-white/70 p-4 sm:p-6 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                  <Calendar size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Weekly Founder Review</h3>
                  <p className="text-xs text-slate-500">Snapshot of your genuine validation momentum.</p>
                </div>
              </div>
              <button onClick={() => setShowWeeklyReview(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/35 border border-white/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Interviews Summary
                </span>
                <p className="font-semibold text-slate-900">{weeklySummary.interviewsSummary}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white/35 border border-white/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Problem Evidence
                  </span>
                  <p className="font-semibold text-slate-900">{weeklySummary.problemStatus}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/35 border border-white/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Pricing Evidence
                  </span>
                  <p className="font-semibold text-slate-900">{weeklySummary.pricingStatus}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">
                  Key Risk Unresolved
                </span>
                <p className="font-medium">{weeklySummary.biggestRisk}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-0.5">
                  Recommended Goal For Next Week
                </span>
                <p className="font-bold">{weeklySummary.nextWeekGoal}</p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-white/60">
              <button
                onClick={() => setShowWeeklyReview(false)}
                className="w-full sm:w-auto btn-primary py-2.5 px-5 text-xs font-bold rounded-xl min-h-[44px] flex items-center justify-center active:scale-98 shadow-sm"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Reminder & Commitment Preferences */}
      {showReminderSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 fade-in">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowReminderSettings(false)} />
          <div className="relative z-10 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md glass-solid rounded-2xl sm:rounded-3xl shadow-2xl border border-white/70 p-4 sm:p-6 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-white/50 text-[#1E293B]">
                  <Bell size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">Validation Reminders</h3>
                  <p className="text-xs text-[#5E758A]">Specific, non-spammy progress triggers.</p>
                </div>
              </div>
              <button onClick={() => setShowReminderSettings(false)} className="p-2 rounded-xl text-slate-500 hover:text-[#1E293B] min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1E293B] mb-1.5">Reminder Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['weekly', 'biweekly', 'off'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setReminderFreq(f)}
                      className={`py-2 px-1.5 xs:px-2.5 rounded-xl font-bold border transition text-center capitalize min-h-[40px] flex items-center justify-center active:scale-95 ${
                        reminderFreq === f
                          ? 'btn-dark text-white border-transparent'
                          : 'bg-white/40 text-[#1E293B] border-white/60 hover:bg-white/60'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Weekly Interview Target</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="input text-base sm:text-xs bg-white/50 border-white/60 text-[#1E293B] min-h-[44px]"
                  value={weeklyGoal}
                  onChange={e => setWeeklyGoal(parseInt(e.target.value) || 1)}
                />
                <span className="text-[11px] text-[#5E758A] mt-1 block">
                  Choose a realistic goal you can maintain without burnout.
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/40 border border-white/60 min-h-[44px]">
                <div>
                  <span className="font-bold text-[#1E293B] block">Respect Quiet Hours</span>
                  <span className="text-[11px] text-[#5E758A]">Never trigger notifications after 8 PM or on weekends</span>
                </div>
                <input
                  type="checkbox"
                  checked={quietHours}
                  onChange={e => setQuietHours(e.target.checked)}
                  className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2 border-t border-white/60">
              <button
                type="button"
                onClick={() => setShowReminderSettings(false)}
                className="w-full sm:w-auto btn-ghost py-2.5 px-4 text-xs font-semibold rounded-xl min-h-[44px] flex items-center justify-center active:scale-98"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReminders}
                className="w-full sm:w-auto btn-primary py-2.5 px-5 text-xs font-bold rounded-xl min-h-[44px] flex items-center justify-center active:scale-98 shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
