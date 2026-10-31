import React, { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Compass,
  Calendar,
  Layers,
  HelpCircle,
  Printer,
  Sparkles,
  Target,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  FileText,
} from 'lucide-react'
import type { Project, Route } from '../types'
import { Badge, Glass } from '../components/ui'
import { generateOverallVerdict } from '../lib/verdict'

export default function OverallVerdictPage({
  project,
  go,
}: {
  project: Project
  go: (r: Route) => void
}) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const { form: f, analysis: a } = project
  if (!a) {
    return (
      <Glass className="p-8 text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-amber-500 mb-3" size={32} />
        <h2 className="text-xl font-semibold mb-2">Evaluation Needed</h2>
        <p className="text-sm text-dusk-mute mb-4">
          This idea has not been evaluated yet. Run the evaluation to generate the final verdict.
        </p>
        <button
          className="btn-primary"
          onClick={() => go({ page: 'project', id: project.id })}
        >
          Go to Idea Evaluation
        </button>
      </Glass>
    )
  }

  // Ensure overallVerdict is present or dynamically synthesized
  const v = a.overallVerdict || generateOverallVerdict(f, a, project.interviews, project.trackedAssumptions)

  const toggleStep = (rank: number) => {
    setCompletedSteps(prev =>
      prev.includes(rank) ? prev.filter(r => r !== rank) : [...prev, rank]
    )
  }

  const getVerdictTheme = (decision: string) => {
    switch (decision) {
      case 'BUILD':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-950',
          badge: 'bg-emerald-600 text-white',
          border: 'border-emerald-500/30',
          titleColor: 'text-emerald-900',
          icon: <CheckCircle2 className="text-emerald-600 shrink-0" size={24} />,
        }
      case 'VALIDATE FIRST':
        return {
          bg: 'bg-blue-500/15 border-blue-500/40 text-blue-950',
          badge: 'bg-blue-600 text-white',
          border: 'border-blue-500/30',
          titleColor: 'text-blue-900',
          icon: <Lightbulb className="text-blue-600 shrink-0" size={24} />,
        }
      case 'RETHINK':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-950',
          badge: 'bg-amber-600 text-white',
          border: 'border-amber-500/30',
          titleColor: 'text-amber-900',
          icon: <AlertTriangle className="text-amber-600 shrink-0" size={24} />,
        }
      case "DON'T PURSUE THIS VERSION":
      default:
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-950',
          badge: 'bg-rose-600 text-white',
          border: 'border-rose-500/30',
          titleColor: 'text-rose-900',
          icon: <XCircle className="text-rose-600 shrink-0" size={24} />,
        }
    }
  }

  const theme = getVerdictTheme(v.decision)

  return (
    <div className="rise space-y-4 sm:space-y-6 max-w-5xl mx-auto px-2.5 sm:px-4 pb-28 md:pb-16">
      {/* Top Navigation & Action Header */}
      <Glass className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl sm:rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <button
            onClick={() => go({ page: 'project', id: project.id, view: 'today' })}
            className="btn-ghost text-xs flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl self-start min-h-[44px] active:scale-95"
            title="Return to Today Workspace"
          >
            <ArrowLeft size={14} /> Back to Today
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-dusk-ink flex items-center gap-2">
                <Compass className="text-dusk-deep shrink-0" size={20} />
                OVERALL VERDICT
              </h1>
              {project.evaluationType === 'basic' || a.evaluationType === 'basic' ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-950 border border-amber-500/35">
                  Basic Evaluation
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-950 border border-emerald-500/35">
                  AI Evaluation
                </span>
              )}
            </div>
            <p className="text-xs text-dusk-mute">
              Executive synthesis & decision roadmap for{' '}
              <span className="font-semibold text-dusk-ink">{f.name}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 md:pt-0">
          <button
            onClick={() => window.print()}
            className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl min-h-[44px] active:scale-95"
            title="Print or Save Verdict as PDF"
          >
            <Printer size={14} /> Export / Print
          </button>
          <button
            onClick={() => go({ page: 'project', id: project.id, view: 'report' })}
            className="btn-primary text-xs flex items-center gap-1.5 px-3.5 py-2 font-semibold rounded-xl min-h-[44px] active:scale-95 shadow-sm"
          >
            <FileText size={14} /> View 12-Section Report
          </button>
        </div>
      </Glass>

      {/* SECTION 1: FINAL VERDICT */}
      <div className={`rounded-2xl p-6 sm:p-8 border shadow-lg ${theme.bg} ${theme.border}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-xs uppercase tracking-wider font-bold text-dusk-mute">
            SECTION 1 · STRATEGIC DIRECTION
          </span>
          <span
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm ${theme.badge}`}
          >
            {v.decision}
          </span>
        </div>

        <div className="flex items-start gap-3.5 mb-5">
          {theme.icon}
          <div>
            <h2 className={`text-xl sm:text-2xl font-extrabold ${theme.titleColor}`}>
              Final Recommendation: {v.decision}
            </h2>
            <p className="mt-2 text-sm sm:text-base leading-relaxed text-dusk-ink font-medium">
              {v.conciseExplanation}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mt-4 text-xs sm:text-sm">
          <div className="rounded-xl bg-white/25 border border-white/20 p-4 space-y-1">
            <span className="text-[11px] uppercase tracking-wide font-bold text-emerald-900 block">
              Strongest Reason Supporting This Decision
            </span>
            <p className="text-dusk-ink leading-relaxed">{v.strongestReason}</p>
          </div>

          <div className="rounded-xl bg-white/25 border border-white/20 p-4 space-y-1">
            <span className="text-[11px] uppercase tracking-wide font-bold text-rose-900 block">
              The Biggest Concern
            </span>
            <p className="text-dusk-ink leading-relaxed">{v.biggestConcern}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white/35 border border-white/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-wide font-bold text-dusk-deep block">
              Single Most Important Next Action
            </span>
            <p className="text-xs sm:text-sm text-dusk-ink font-semibold mt-0.5">
              {v.singleMostImportantNextAction}
            </p>
          </div>
          <span className="text-[11px] text-dusk-mute italic shrink-0">
            {v.isProvisionalNotice}
          </span>
        </div>
      </div>

      {/* SECTION 2: WHY COULD THIS IDEA SUCCEED OR FAIL? */}
      <Glass className="p-6 sm:p-7 space-y-5">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-dusk-mute">
            SECTION 2 · SYSTEMIC ANALYSIS
          </span>
          <h3 className="text-lg font-bold text-dusk-ink mt-0.5">
            Why Could This Idea Succeed or Fail?
          </h3>
          <p className="text-xs text-dusk-mute">
            Balanced assessment of growth drivers versus realistic failure modes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Part A: Why It Could Succeed */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-emerald-500/20">
              <TrendingUp className="text-emerald-700" size={18} />
              <h4 className="font-bold text-sm text-emerald-900">
                A. Why It Could Succeed
              </h4>
            </div>
            <div className="space-y-3">
              {v.whyItCouldSucceed.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-emerald-50/25 border border-emerald-200/40 p-4 text-xs space-y-1.5"
                >
                  <p className="font-semibold text-sm text-emerald-950">{item.issue}</p>
                  <p>
                    <b className="text-emerald-900">Why It Matters:</b> {item.whyItMatters}
                  </p>
                  <p>
                    <b className="text-emerald-900">Business Impact:</b> {item.businessImpact}
                  </p>
                  <p className="text-dusk-ink/80">
                    <b>Supporting Evidence:</b> {item.supportingEvidence}
                  </p>
                  <p className="text-amber-900 font-medium">
                    <b>Uncertainty:</b> {item.uncertainties}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Part B: Why It Could Fail */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-rose-500/20">
              <ShieldAlert className="text-rose-700" size={18} />
              <h4 className="font-bold text-sm text-rose-900">
                B. Why It Could Fail
              </h4>
            </div>
            <div className="space-y-3">
              {v.whyItCouldFail.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-rose-50/25 border border-rose-200/40 p-4 text-xs space-y-1.5"
                >
                  <p className="font-semibold text-sm text-rose-950">{item.issue}</p>
                  <p>
                    <b className="text-rose-900">Why It Matters:</b> {item.whyItMatters}
                  </p>
                  <p>
                    <b className="text-rose-900">Business Impact:</b> {item.businessImpact}
                  </p>
                  <p className="text-dusk-ink/80">
                    <b>Supporting Evidence:</b> {item.supportingEvidence}
                  </p>
                  <p className="text-rose-900 font-medium">
                    <b>Uncertainty:</b> {item.uncertainties}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Glass>

      {/* SECTION 3: WHAT SHOULD THE FOUNDER BUILD? */}
      <Glass className="p-6 sm:p-7 space-y-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-dusk-mute">
            SECTION 3 · SCOPE DISCIPLINE
          </span>
          <h3 className="text-lg font-bold text-dusk-ink mt-0.5">
            What Should the Founder Build?
          </h3>
          <p className="text-xs text-dusk-mute">
            Smallest viable scope that isolates and tests the core customer value proposition.
          </p>
        </div>

        <div className="rounded-xl bg-white/10 p-4 text-xs sm:text-sm space-y-2 border border-white/10">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="text-[11px] uppercase font-bold text-dusk-mute block">
                Target Initial Customer Segment
              </span>
              <p className="font-semibold text-dusk-ink">
                {v.minimumViableScope.firstCustomerSegment}
              </p>
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-dusk-mute block">
                Core Problem To Resolve
              </span>
              <p className="font-semibold text-dusk-ink">
                {v.minimumViableScope.problemToSolve}
              </p>
            </div>
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-dusk-mute block">
              Recommended Format
            </span>
            <p className="text-dusk-deep font-medium">
              {v.minimumViableScope.recommendedFormat}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="rounded-xl bg-emerald-50/20 border border-emerald-200/40 p-4 space-y-2">
            <span className="text-xs uppercase font-bold text-emerald-900 block flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Essential Functionality (Day 1)
            </span>
            <ul className="list-disc pl-4 space-y-1 text-dusk-ink">
              {v.minimumViableScope.essentialFunctionality.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-amber-50/20 border border-amber-200/40 p-4 space-y-2">
            <span className="text-xs uppercase font-bold text-amber-900 block flex items-center gap-1.5">
              <XCircle size={14} /> Excluded Scope (Postpone Entirely)
            </span>
            <ul className="list-disc pl-4 space-y-1 text-dusk-ink">
              {v.minimumViableScope.excludedScope.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-white/10 p-4 text-xs space-y-1.5 border border-white/10">
          <p>
            <b>Why This Scope Is Appropriate:</b>{' '}
            {v.minimumViableScope.whyThisScopeIsAppropriate}
          </p>
          <p className="text-emerald-900 font-medium">
            <b>Result That Justifies Further Development:</b>{' '}
            {v.minimumViableScope.resultJustifyingFurtherDevelopment}
          </p>
        </div>
      </Glass>

      {/* SECTION 4: HOW SHOULD THE FOUNDER EXECUTE? */}
      <Glass className="p-6 sm:p-7 space-y-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-dusk-mute">
            SECTION 4 · SYSTEMATIC EXECUTION PLAN
          </span>
          <h3 className="text-lg font-bold text-dusk-ink mt-0.5">
            How Should the Founder Execute?
          </h3>
          <p className="text-xs text-dusk-mute">
            Step-by-step prioritized tasks explaining what to do, how to do it, and what data to collect.
          </p>
        </div>

        <div className="space-y-4">
          {v.executionPlan.map(step => (
            <div
              key={step.priority}
              className="rounded-2xl bg-white/10 p-5 border border-white/15 space-y-3 text-xs sm:text-sm"
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-2">
                <span className="font-bold text-sm sm:text-base text-dusk-deep flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-dusk-deep text-white text-xs flex items-center justify-center shrink-0">
                    {step.priority}
                  </span>
                  {step.what}
                </span>
                <span className="text-[11px] text-dusk-mute font-medium">
                  Priority {step.priority}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-semibold text-dusk-ink">How to Perform This:</span>
                <ul className="list-disc pl-5 space-y-0.5 text-dusk-ink/90">
                  {step.how.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                <div className="rounded-lg bg-white/10 p-2.5">
                  <b>Why It Matters:</b> {step.why}
                </div>
                <div className="rounded-lg bg-white/10 p-2.5">
                  <b>Evidence to Collect:</b> {step.evidenceToCollect}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                <div className="rounded-lg bg-emerald-50/20 border border-emerald-200/30 p-2.5 text-emerald-950">
                  <b>How to Interpret the Result:</b> {step.howToInterpret}
                </div>
                <div className="rounded-lg bg-blue-50/20 border border-blue-200/30 p-2.5 text-blue-950">
                  <b>Immediate Next Step:</b> {step.nextStep}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Glass>

      {/* SECTION 5: WHEN SHOULD EACH ACTION HAPPEN? */}
      <Glass className="p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-dusk-mute">
              SECTION 5 · MILESTONE TIMELINE
            </span>
            <h3 className="text-lg font-bold text-dusk-ink mt-0.5">
              When Should Each Action Happen?
            </h3>
          </div>
          <span className="text-xs text-dusk-mute flex items-center gap-1">
            <Clock size={13} /> Sequenced by uncertainty & dependencies
          </span>
        </div>

        <div className="space-y-3">
          {v.timeline.milestones.map((m, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-white/10 p-4 border border-white/10 text-xs sm:text-sm space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-dusk-deep">{m.action}</span>
                <span className="chip text-[11px] font-semibold bg-white/20 text-dusk-ink">
                  {m.timeEstimate}
                </span>
              </div>
              <p className="text-xs text-dusk-mute">
                <b>Dependency:</b> {m.dependency}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 text-xs pt-1">
                <div className="rounded-lg bg-white/10 p-2.5">
                  <b>Expected Deliverable:</b> {m.expectedDeliverable}
                </div>
                <div className="rounded-lg bg-amber-50/20 border border-amber-200/30 p-2.5 text-amber-950">
                  <b>Decision Gate:</b> {m.decisionPoint}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-dusk-mute italic pt-1">
          {v.timeline.scheduleEstimateDisclaimer}
        </p>
      </Glass>

      {/* SECTION 6: COMPETITIVE ADVANTAGE */}
      <Glass className="p-6 sm:p-7 space-y-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-dusk-mute">
            SECTION 6 · MARKET REALITIES
          </span>
          <h3 className="text-lg font-bold text-dusk-ink mt-0.5">
            Competitive Advantage & Alternatives
          </h3>
          <p className="text-xs text-dusk-mute">
            Honest mapping against incumbent tools, workarounds, and status quo inertia.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl bg-white/10 p-4 space-y-1.5">
            <span className="text-xs font-bold text-dusk-deep uppercase block">
              Alternatives Customers Use Today
            </span>
            <ul className="list-disc pl-4 space-y-1 text-dusk-ink">
              {v.competitiveAdvantage.currentAlternatives.map((alt, i) => (
                <li key={i}>{alt}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white/10 p-4 space-y-1.5">
            <span className="text-xs font-bold text-dusk-deep uppercase block">
              Strongest Relevant Competitors
            </span>
            <ul className="list-disc pl-4 space-y-1 text-dusk-ink">
              {v.competitiveAdvantage.strongestCompetitors.map((comp, i) => (
                <li key={i}>{comp}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-white/10 p-4 text-xs space-y-2 border border-white/10">
          <p>
            <b>Why a Customer Might Switch:</b>{' '}
            {v.competitiveAdvantage.whyCustomerMightSwitch}
          </p>
          <p>
            <b>Key Proposed Differentiator:</b>{' '}
            {v.competitiveAdvantage.keyDifferentiator}
          </p>
          <p>
            <b>Defensibility Assessment:</b>{' '}
            {v.competitiveAdvantage.isDefensibleOrEasyToCopy}
          </p>
          <div className="p-3 rounded-lg bg-emerald-50/20 border border-emerald-200/30 text-emerald-950 mt-1">
            <b>Test to Establish if the Advantage Matters:</b>{' '}
            {v.competitiveAdvantage.validationTestForAdvantage}
          </div>
        </div>

        <p className="text-xs text-dusk-mute italic">
          {v.competitiveAdvantage.researchDisclosureNotice}
        </p>
      </Glass>

      {/* SECTION 7: THE CRITICAL ASSUMPTION */}
      <Glass className="p-6 sm:p-7 space-y-4 border border-rose-300/40 bg-rose-50/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-rose-600" size={20} />
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-rose-900">
              SECTION 7 · SINGLE BIGGEST VULNERABILITY
            </span>
            <h3 className="text-lg font-bold text-dusk-ink">The Critical Assumption</h3>
          </div>
        </div>

        <div className="rounded-xl bg-white/20 p-4 text-xs sm:text-sm font-semibold text-dusk-deep border border-rose-200/40">
          "{v.criticalAssumption.assumption}"
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl bg-white/15 p-3.5 space-y-1">
            <b>Why the Business Depends on It:</b>
            <p className="text-dusk-ink">{v.criticalAssumption.whyBusinessDependsOnIt}</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3.5 space-y-1">
            <b>What Happens If It Is False:</b>
            <p className="text-rose-950 font-medium">
              {v.criticalAssumption.ifFalseConsequence}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white/20 p-3.5 text-xs space-y-1 border border-white/15">
          <span className="font-bold text-dusk-deep block">Cheapest Practical Test:</span>
          <p className="text-dusk-ink">{v.criticalAssumption.cheapestTest}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 text-xs">
          <div className="rounded-lg bg-emerald-50/20 p-2.5 border border-emerald-200/30">
            <span className="font-bold text-emerald-900 block">Positive Signal</span>
            <p className="mt-0.5">{v.criticalAssumption.positiveSignalMeaning}</p>
          </div>
          <div className="rounded-lg bg-rose-50/20 p-2.5 border border-rose-200/30">
            <span className="font-bold text-rose-900 block">Negative Signal</span>
            <p className="mt-0.5">{v.criticalAssumption.negativeSignalMeaning}</p>
          </div>
          <div className="rounded-lg bg-amber-50/20 p-2.5 border border-amber-200/30">
            <span className="font-bold text-amber-900 block">Inconclusive Result</span>
            <p className="mt-0.5">{v.criticalAssumption.inconclusiveSignalMeaning}</p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white/25 text-xs text-dusk-deep font-medium">
          <b>Verdict Adjustment Rule:</b> {v.criticalAssumption.verdictAdjustmentOnResults}
        </div>
      </Glass>

      {/* SECTION 8: WHAT WOULD CHANGE THE VERDICT? */}
      <Glass className="p-6 sm:p-7 space-y-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-dusk-mute">
            SECTION 8 · DECISION DYNAMICS
          </span>
          <h3 className="text-lg font-bold text-dusk-ink mt-0.5">
            What Would Change the Verdict?
          </h3>
          <p className="text-xs text-dusk-mute">
            Specific empirical discoveries that will alter FOCAS AI's recommendation.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl bg-emerald-50/20 border border-emerald-200/30 p-3.5 space-y-1">
            <span className="font-bold text-emerald-900 block uppercase text-[11px]">
              Makes FOCAS More Confident (Upgrade to BUILD)
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-dusk-ink">
              {v.whatWouldChangeVerdict.moreConfidentConditions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-rose-50/20 border border-rose-200/30 p-3.5 space-y-1">
            <span className="font-bold text-rose-900 block uppercase text-[11px]">
              Makes FOCAS Less Confident (Downgrade)
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-dusk-ink">
              {v.whatWouldChangeVerdict.lessConfidentConditions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-blue-50/20 border border-blue-200/30 p-3.5 space-y-1">
            <span className="font-bold text-blue-900 block uppercase text-[11px]">
              Conditions to Change Target Customer
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-dusk-ink">
              {v.whatWouldChangeVerdict.changeCustomerConditions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-amber-50/20 border border-amber-200/30 p-3.5 space-y-1">
            <span className="font-bold text-amber-900 block uppercase text-[11px]">
              Conditions to Change Solution Format
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-dusk-ink">
              {v.whatWouldChangeVerdict.changeSolutionConditions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-rose-100/30 border border-rose-300/40 p-4 text-xs space-y-1 text-rose-950">
          <span className="font-bold uppercase tracking-wide block">
            Absolute Stop Conditions (Kill the Project)
          </span>
          <ul className="list-disc pl-4 space-y-1">
            {v.whatWouldChangeVerdict.stopConditions.map((c, i) => (
              <li key={i} className="font-medium">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </Glass>

      {/* SECTION 9: YOUR NEXT THREE ACTIONS */}
      <Glass className="p-6 sm:p-8 space-y-5 border-2 border-dusk-deep/30">
        <div>
          <span className="text-xs uppercase tracking-wider font-extrabold text-dusk-deep">
            SECTION 9 · IMMEDIATE EXECUTION
          </span>
          <h3 className="text-xl font-extrabold text-dusk-ink mt-0.5">
            YOUR NEXT THREE ACTIONS
          </h3>
          <p className="text-xs sm:text-sm text-dusk-mute">
            Ordered by priority. Check off each task as you collect real evidence from the field.
          </p>
        </div>

        <div className="space-y-4">
          {v.nextThreeActions.map(action => {
            const isDone = completedSteps.includes(action.rank)

            return (
              <div
                key={action.rank}
                className={`rounded-2xl p-5 border transition ${
                  isDone
                    ? 'bg-emerald-50/30 border-emerald-300/50 opacity-90'
                    : 'bg-white/15 border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleStep(action.rank)}
                      className={`h-8 w-8 rounded-xl border flex items-center justify-center transition shrink-0 min-w-[32px] min-h-[32px] active:scale-90 ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'border-dusk-mute/60 hover:border-dusk-deep'
                      }`}
                      aria-label="Toggle completed"
                    >
                      {isDone ? <CheckCircle2 size={18} /> : <span className="text-xs font-bold">{action.rank}</span>}
                    </button>
                    <div>
                      <h4
                        className={`font-bold text-sm sm:text-base ${
                          isDone ? 'line-through text-dusk-mute' : 'text-dusk-ink'
                        }`}
                      >
                        {action.title}
                      </h4>
                      <p className="text-xs text-dusk-deep font-semibold mt-0.5">
                        {action.what}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-dusk-mute uppercase tracking-wider shrink-0">
                    Priority {action.rank}
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-dusk-ink">
                  <p>
                    <b>How to Do It:</b> {action.how}
                  </p>
                  <p className="text-dusk-mute">
                    <b>Why It Is the Priority:</b> {action.whyPriority}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 pt-1 text-xs">
                    <div className="rounded-lg bg-emerald-50/20 border border-emerald-200/30 p-2.5">
                      <b>Target Result to Look For:</b> {action.targetResult}
                    </div>
                    <div className="rounded-lg bg-blue-50/20 border border-blue-200/30 p-2.5">
                      <b>Follow-On Decision:</b> {action.followOnDecision}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/15">
          <button
            onClick={() => go({ page: 'project', id: project.id })}
            className="btn-ghost text-xs flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Back to Full 12-Section Evaluation
          </button>
          <button
            onClick={() => go({ page: 'dashboard' })}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            Dashboard
          </button>
        </div>
      </Glass>
    </div>
  )
}
