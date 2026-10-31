import { useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  X,
} from 'lucide-react'
import type { IdeaForm, Project, Stage } from '../types'
import { Glass } from '../components/ui'
import { trackEvent } from '../lib/analytics'

export const EMPTY: IdeaForm = {
  name: '',
  description: '',
  problem: '',
  solution: '',
  customer: '',
  segment: '',
  market: '',
  current: '',
  model: '',
  stage: 'Idea',
  competitors: '',
  demand: '',
  frequency: '',
  costs: '',
  priorExperiments: '',
}

const EXAMPLE_PROMPTS = [
  {
    label: 'B2B Workflow Automation',
    text: 'A scheduling and compliance assistant for independent dental clinics that stops receptionist double-booking errors and patient no-shows.',
  },
  {
    label: 'Local Specialty Market',
    text: 'A wholesale ordering platform connecting local independent bakeries directly with organic grain millers to cut 20% distributor markups.',
  },
  {
    label: 'Freelancer Financials',
    text: 'Automated quarterly tax reserve and invoice reconciliation tool for solo software contractors who dread manual Excel spreadsheets.',
  },
  {
    label: 'Everyday Consumer Pain',
    text: 'A shared calendar and sports carpooling coordinator for busy suburban parents with 2+ school-age kids.',
  },
]

export default function Wizard({
  existing,
  seed,
  onSave,
  onCancel,
}: {
  existing?: Project
  seed?: string
  onSave: (f: IdeaForm, evaluate: boolean) => void
  onCancel: () => void
}) {
  const [description, setDescription] = useState(existing?.form.description || seed || '')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showSingleFollowUp, setShowSingleFollowUp] = useState(false)
  const [followUpAnswer, setFollowUpAnswer] = useState('')

  // Optional customized fields (progressive disclosure)
  const [customer, setCustomer] = useState(existing?.form.customer || '')
  const [frequency, setFrequency] = useState(existing?.form.frequency || '')
  const [currentWorkaround, setCurrentWorkaround] = useState(existing?.form.current || '')
  const [businessModel, setBusinessModel] = useState(existing?.form.model || '')
  const [market, setMarket] = useState(existing?.form.market || '')
  const [competitors, setCompetitors] = useState(existing?.form.competitors || '')
  const [evidence, setEvidence] = useState(existing?.form.demand || '')
  const [stage, setStage] = useState<Stage>(existing?.form.stage || 'Idea')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApplyExample = (text: string) => {
    setDescription(text)
    setError(null)
  }

  const buildFinalForm = (overrideCustomer?: string): IdeaForm => {
    const trimmedDesc = description.trim()
    const firstSentence = trimmedDesc.split(/[.!?\n]/)[0].trim()
    const derivedName = existing?.form.name?.trim() || firstSentence.slice(0, 40) || 'New Concept'

    return {
      ...EMPTY,
      name: derivedName,
      description: trimmedDesc,
      problem: existing?.form.problem || trimmedDesc,
      solution: existing?.form.solution || trimmedDesc,
      customer: (overrideCustomer ?? customer).trim(),
      frequency: frequency.trim(),
      current: currentWorkaround.trim(),
      model: businessModel.trim(),
      market: market.trim(),
      competitors: competitors.trim(),
      demand: evidence.trim(),
      stage,
    }
  }

  const handleStartEvaluation = () => {
    if (isSubmitting) return
    const trimmed = description.trim()
    if (!trimmed) {
      setError('Please describe your startup idea.')
      return
    }
    if (trimmed.length < 15) {
      setError('Please provide at least a short sentence describing the problem and solution (15+ chars).')
      return
    }

    // Material check: If idea is brief (<50 chars) and no customer is provided, trigger the single follow-up
    const hasCustomerKeyword =
      /for\s+[a-z]+|owners|managers|teams|freelancers|students|parents|clinics|shops|doctors/i.test(trimmed)
    if (!customer.trim() && !hasCustomerKeyword && trimmed.length < 65 && !showSingleFollowUp) {
      setShowSingleFollowUp(true)
      return
    }

    setIsSubmitting(true)
    trackEvent('idea_evaluation_started')
    const finalForm = buildFinalForm()
    onSave(finalForm, true)
  }

  const handleFollowUpSubmit = (proceedWithAssumptions: boolean) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    trackEvent('idea_evaluation_started')
    const finalForm = buildFinalForm(proceedWithAssumptions ? undefined : followUpAnswer)
    onSave(finalForm, true)
  }

  // Single Material Follow-up Dialog
  if (showSingleFollowUp) {
    return (
      <div className="rise mx-auto max-w-xl px-4 py-8">
        <Glass className="p-6 sm:p-8 space-y-5 rounded-3xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-50 text-sky-800 border border-sky-200">
                <HelpCircle size={20} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">One Quick Clarification</p>
                <h2 className="text-xl font-bold text-slate-900">Who is the primary buyer?</h2>
              </div>
            </div>
            <button
              onClick={() => setShowSingleFollowUp(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Back"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Your idea description has strong potential. Specifying the target role helps calibrate acute pain and willingness to pay.
          </p>

          <div>
            <label htmlFor="followup-customer" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Target Customer Role
            </label>
            <input
              id="followup-customer"
              type="text"
              className="input placeholder:text-slate-400 text-base sm:text-sm"
              placeholder="e.g. Independent dental clinic managers, Solo Shopify merchants…"
              value={followUpAnswer}
              onChange={e => setFollowUpAnswer(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              className="w-full sm:w-auto text-xs font-medium text-slate-500 hover:text-slate-800 py-2.5 px-3 transition text-center"
              onClick={() => handleFollowUpSubmit(true)}
            >
              Skip and continue with assumptions
            </button>
            <button
              type="button"
              className="w-full sm:w-auto btn-primary font-semibold flex items-center justify-center gap-2 shadow-md"
              onClick={() => handleFollowUpSubmit(false)}
            >
              <span>Continue Evaluation</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Glass>
      </div>
    )
  }

  return (
    <div className="rise mx-auto max-w-2xl px-2.5 sm:px-4 py-3 sm:py-6">
      <Glass className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/70 border border-sky-200/80 text-sky-900 text-[11px] font-semibold mb-3 backdrop-blur-md">
            <Sparkles size={12} className="text-sky-600" />
            <span>Deterministic First-Principles Intake</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Describe your startup idea.
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 leading-relaxed">
            We evaluate acute operational pain, habit inertia, and willingness to pay.
            Answer only one question to start.
          </p>
        </div>

        {/* Primary Idea Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="idea-description" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              What do you want to build and who is it for? <span className="text-blue-600">*</span>
            </label>
            <span
              className={`text-xs font-mono font-medium ${
                description.length > 480 ? 'text-amber-600 font-bold' : 'text-slate-400'
              }`}
            >
              {description.length}/500
            </span>
          </div>

          <textarea
            id="idea-description"
            className="input min-h-[140px] text-base leading-relaxed rounded-2xl resize-none shadow-inner"
            placeholder="e.g. An automated patient reminder and deposit tool for independent physiotherapy clinics that stops 25% revenue loss from last-minute cancellations…"
            value={description}
            onChange={e => {
              setDescription(e.target.value)
              if (error) setError(null)
            }}
            maxLength={500}
            rows={5}
            aria-label="Describe your startup idea"
          />

          {error && (
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 pt-1">
              {error}
            </p>
          )}
        </div>

        {/* Example prompts for quick guidance */}
        <div className="mt-4 pt-2 border-t border-sky-100/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
            <Lightbulb size={13} className="text-amber-500" />
            <span>Need inspiration? Try an example:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_PROMPTS.map(p => (
              <button
                key={p.label}
                type="button"
                className="chip text-xs py-2 px-3.5 rounded-xl bg-sky-50/70 hover:bg-sky-100 text-sky-950 border border-sky-200/70 transition font-medium text-left shadow-xs backdrop-blur-sm min-h-[38px] flex items-center active:scale-95"
                onClick={() => handleApplyExample(p.text)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Collapsible Progressive Disclosure: Customize Details */}
        <div className="mt-6 pt-4 border-t border-slate-200/80">
          <button
            type="button"
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 py-2.5 transition min-h-[44px]"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
          >
            <span className="flex flex-wrap items-center gap-1.5 text-left">
              <span>Customize details (Optional)</span>
              <span className="text-[10px] font-normal normal-case text-slate-400 hidden xs:inline">
                Target customer, model, alternatives
              </span>
            </span>
            {showAdvanced ? <ChevronUp size={16} className="shrink-0" /> : <ChevronDown size={16} className="shrink-0" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 pt-2 border-t border-slate-100 fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="custom-customer" className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Customer Role
                  </label>
                  <input
                    id="custom-customer"
                    type="text"
                    className="input text-base sm:text-xs"
                    placeholder="e.g. Independent café owners"
                    value={customer}
                    onChange={e => setCustomer(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="custom-frequency" className="block text-xs font-semibold text-slate-700 mb-1">
                    Problem Frequency
                  </label>
                  <input
                    id="custom-frequency"
                    type="text"
                    className="input text-base sm:text-xs"
                    placeholder="e.g. Daily, weekly, monthly"
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="custom-workaround" className="block text-xs font-semibold text-slate-700 mb-1">
                    Existing Workarounds / Alternatives
                  </label>
                  <input
                    id="custom-workaround"
                    type="text"
                    className="input text-base sm:text-xs"
                    placeholder="e.g. Free Google Sheets, WhatsApp groups"
                    value={currentWorkaround}
                    onChange={e => setCurrentWorkaround(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="custom-model" className="block text-xs font-semibold text-slate-700 mb-1">
                    Proposed Business Model
                  </label>
                  <input
                    id="custom-model"
                    type="text"
                    className="input text-base sm:text-xs"
                    placeholder="e.g. $49/month SaaS, 5% transaction fee"
                    value={businessModel}
                    onChange={e => setBusinessModel(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="custom-market" className="block text-xs font-semibold text-slate-700 mb-1">
                    Geographic or Niche Market
                  </label>
                  <input
                    id="custom-market"
                    type="text"
                    className="input text-base sm:text-xs"
                    placeholder="e.g. Urban US, UK SMEs"
                    value={market}
                    onChange={e => setMarket(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="custom-competitors" className="block text-xs font-semibold text-slate-700 mb-1">
                    Known Competitors
                  </label>
                  <input
                    id="custom-competitors"
                    type="text"
                    className="input text-base sm:text-xs"
                    placeholder="e.g. Jane App, Square Appointments"
                    value={competitors}
                    onChange={e => setCompetitors(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="custom-evidence" className="block text-xs font-semibold text-slate-700 mb-1">
                  Evidence Already Collected (if any)
                </label>
                <input
                  id="custom-evidence"
                  type="text"
                  className="input text-base sm:text-xs"
                  placeholder="e.g. Spoke to 3 owners who confirmed $300/mo waste"
                  value={evidence}
                  onChange={e => setEvidence(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Validation Stage
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Idea', 'Research', 'Prototype', 'Launched'] as Stage[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStage(s)}
                      className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-medium border transition min-h-[40px] flex items-center justify-center active:scale-95 ${
                        stage === s
                          ? 'btn-dark text-white shadow-sm'
                          : 'bg-white/40 text-slate-700 border-white/60 hover:bg-white/60'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-4 border-t border-white/40 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            className="w-full sm:w-auto btn-ghost py-3 px-4 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/60 text-xs sm:text-sm font-semibold transition min-h-[44px] flex items-center justify-center active:scale-98"
            onClick={onCancel}
          >
            Cancel
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              className="w-full sm:w-auto btn-ghost py-3 px-4 rounded-xl text-slate-700 hover:bg-white/60 text-xs sm:text-sm font-semibold transition min-h-[44px] flex items-center justify-center active:scale-98"
              onClick={() => {
                if (!description.trim()) {
                  setError('Please describe your idea before saving a draft.')
                  return
                }
                onSave(buildFinalForm(), false)
              }}
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              className="w-full sm:w-auto btn-primary font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] text-sm min-h-[48px] disabled:opacity-60"
              onClick={handleStartEvaluation}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Idea...</span>
                </>
              ) : (
                <>
                  <span>Evaluate Idea</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </Glass>
    </div>
  )
}
