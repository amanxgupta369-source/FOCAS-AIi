import { useState, useMemo } from 'react'
import {
  Compass,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  ListTodo,
  ShieldAlert,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  Video,
  Code2,
  HeartHandshake,
  ExternalLink,
  RotateCw,
  X,
  Plus,
} from 'lucide-react'
import { Glass } from '../components/ui'
import type { DiscoveryOpportunity, DiscoveryCategory, Route, IdeaForm } from '../types'
import {
  CURATED_OPPORTUNITIES,
  DISCOVERY_CATEGORIES,
  getDailyDiscovery,
  filterOpportunities,
} from '../data/discoveryData'

const CATEGORY_ICONS: Record<string, any> = {
  All: Compass,
  'Small Businesses': Building2,
  Education: GraduationCap,
  Productivity: Briefcase,
  'Creator Tools': Video,
  Technology: Code2,
  'Everyday Life': HeartHandshake,
}

export default function Discovery({
  go,
  onStartEvaluation,
  initialSelectedId,
}: {
  go: (r: Route) => void
  onStartEvaluation: (form: Partial<IdeaForm>, evaluateImmediately?: boolean) => void
  initialSelectedId?: string
}) {
  const [category, setCategory] = useState<DiscoveryCategory>('All')
  const [search, setSearch] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState<DiscoveryOpportunity | null>(() => {
    if (initialSelectedId) {
      return CURATED_OPPORTUNITIES.find(o => o.id === initialSelectedId) || null
    }
    return null
  })

  // Daily Discovery item (purely offline & deterministic)
  const [dailyIndexOffset, setDailyIndexOffset] = useState(0)
  const dailyDiscovery = useMemo(() => {
    const base = getDailyDiscovery()
    if (dailyIndexOffset === 0) return base
    const idx = (CURATED_OPPORTUNITIES.indexOf(base) + dailyIndexOffset) % CURATED_OPPORTUNITIES.length
    return CURATED_OPPORTUNITIES[idx >= 0 ? idx : CURATED_OPPORTUNITIES.length + idx]
  }, [dailyIndexOffset])

  // Filtered opportunities
  const opportunities = useMemo(() => {
    return filterOpportunities({ category, query: search })
  }, [category, search])

  // View mode within discovery: 'problems' or 'idea-lab'
  const [viewMode, setViewMode] = useState<'problems' | 'ideas'>('problems')

  const handleLaunchEvaluation = (opp: DiscoveryOpportunity, evaluateNow = true) => {
    onStartEvaluation(
      {
        name: opp.starterConcept.name,
        description: opp.starterConcept.description,
        problem: opp.problem,
        solution: opp.starterConcept.solution,
        customer: opp.whoExperiencesIt,
        model: opp.starterConcept.model,
        competitors: opp.existingAlternatives,
        demand: 'Curated industry friction point (unverified hypothesis)',
      },
      evaluateNow
    )
  }

  const handleOpenAiChat = (opp: DiscoveryOpportunity) => {
    const promptSeed = `Let's think through this opportunity: "${opp.title}".
Problem: ${opp.problem}
Target: ${opp.whoExperiencesIt}
Important unknowns: ${opp.importantUnknowns.join('; ')}
How would you advise me to test if this is a genuine problem worth solving?`
    go({ page: 'new', seed: promptSeed })
  }

  return (
    <div className="rise space-y-6 pb-16">
      {/* 1. Header Banner */}
      <Glass className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-dusk-deep text-white shadow-sm">
              <Compass size={18} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dusk-ink">
              Discovery & Idea Lab
            </h1>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-dusk-mute max-w-2xl leading-relaxed">
            Explore real-world problems worth solving, browse startup concepts without prompts, and run reality checks before writing a line of code.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => go({ page: 'new' })}
            className="btn-primary text-xs flex items-center gap-1.5 flex-1 sm:flex-initial justify-center shadow-xs"
          >
            <Plus size={14} /> Custom Idea
          </button>
        </div>
      </Glass>

      {/* 2. DAILY DISCOVERY (Cached / Offline Native) */}
      <div className="rounded-3xl bg-white/25 border border-white/35 p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-dusk-deep text-white uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> Daily Discovery
            </span>
            <span className="text-xs text-dusk-mute">Refreshed daily • No AI required</span>
          </div>
          <button
            onClick={() => setDailyIndexOffset(p => p + 1)}
            className="text-xs text-dusk-deep hover:text-dusk-ink font-medium flex items-center gap-1 transition"
            title="Browse next insight"
          >
            <RotateCw size={12} />
            <span>Shuffle Insight</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-dusk-deep uppercase tracking-wide">
                {dailyDiscovery.category}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-dusk-ink mt-0.5">
                {dailyDiscovery.title}
              </h2>
            </div>
            <span className="chip text-[10px] bg-amber-500/15 text-amber-900 border border-amber-500/30 font-semibold shrink-0">
              Unverified Hypothesis
            </span>
          </div>

          <p className="text-xs sm:text-sm text-dusk-ink/90 leading-relaxed max-w-3xl">
            {dailyDiscovery.tagline}
          </p>

          <div className="grid gap-2 sm:grid-cols-2 text-xs pt-1">
            <div className="rounded-xl bg-white/30 p-2.5 border border-white/20">
              <span className="font-semibold text-dusk-ink block mb-0.5">Who experiences it:</span>
              <p className="text-dusk-mute leading-relaxed">{dailyDiscovery.whoExperiencesIt}</p>
            </div>
            <div className="rounded-xl bg-white/30 p-2.5 border border-white/20">
              <span className="font-semibold text-dusk-ink block mb-0.5">Why it matters:</span>
              <p className="text-dusk-mute leading-relaxed">{dailyDiscovery.whyItMatters}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => setSelectedOpportunity(dailyDiscovery)}
              className="btn-primary text-xs flex items-center gap-1.5 px-3.5 py-2 shadow-xs"
            >
              <span>Explore Opportunity & Reality Check</span>
              <ArrowRight size={13} />
            </button>
            <button
              onClick={() => handleLaunchEvaluation(dailyDiscovery, true)}
              className="btn-ghost text-xs flex items-center gap-1.5 px-3.5 py-2"
            >
              <span>Evaluate Starter Concept</span>
            </button>
            <button
              onClick={() => handleOpenAiChat(dailyDiscovery)}
              className="btn-ghost text-xs text-dusk-deep flex items-center gap-1.5 px-3.5 py-2"
            >
              <Sparkles size={13} />
              <span>Brainstorm with AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Controls: Mode Selector, Category Chips & Search */}
      <Glass className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/15 pb-4">
          {/* Mode Switch: Discover Problems vs Idea Lab */}
          <div className="flex items-center gap-1 rounded-2xl bg-white/15 p-1 border border-white/20 self-start">
            <button
              onClick={() => setViewMode('problems')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                viewMode === 'problems'
                  ? 'bg-dusk-deep text-white shadow-xs'
                  : 'text-dusk-mute hover:text-dusk-ink'
              }`}
            >
              1. Discover Problems ({opportunities.length})
            </button>
            <button
              onClick={() => setViewMode('ideas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                viewMode === 'ideas'
                  ? 'bg-dusk-deep text-white shadow-xs'
                  : 'text-dusk-mute hover:text-dusk-ink'
              }`}
            >
              2. Idea Lab (Curated Concepts)
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-3 text-dusk-mute" />
            <input
              type="text"
              placeholder="Search problems, keywords, or industries..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-8.5 pr-8 text-xs h-9 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-dusk-mute hover:text-dusk-ink"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-dusk-mute font-medium mr-1 flex items-center gap-1">
            <Filter size={12} /> Focus Area:
          </span>
          {DISCOVERY_CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat] || Compass
            const isSelected = category === cat
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-dusk-deep text-white shadow-xs'
                    : 'bg-white/10 text-dusk-ink hover:bg-white/20'
                }`}
              >
                <Icon size={13} />
                <span>{cat}</span>
              </button>
            )
          })}
        </div>
      </Glass>

      {/* 4. CONTENT GRID */}
      {opportunities.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <Compass className="mx-auto text-dusk-mute/60" size={36} />
          <h3 className="font-semibold text-dusk-ink text-base">No opportunities found</h3>
          <p className="text-xs text-dusk-mute max-w-md mx-auto">
            No problems matched your current filter. Try selecting "All" or clearing your search.
          </p>
          <button
            onClick={() => {
              setCategory('All')
              setSearch('')
            }}
            className="btn-ghost text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'problems' ? (
        /* View 1: DISCOVER PROBLEMS & OPPORTUNITIES */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map(opp => (
            <div
              key={opp.id}
              className="rounded-2xl p-5 bg-white/15 border border-white/20 hover:bg-white/25 transition shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-dusk-deep uppercase tracking-wider">
                    {opp.category}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30 font-medium">
                    Hypothesis
                  </span>
                </div>

                <h3 className="font-bold text-dusk-ink text-base leading-snug line-clamp-2">
                  {opp.title}
                </h3>

                <p className="text-xs text-dusk-mute leading-relaxed line-clamp-3">
                  {opp.problem}
                </p>

                <div className="space-y-2 pt-1 border-t border-white/15 text-xs">
                  <div>
                    <span className="font-semibold text-dusk-ink block text-[11px]">Target Audience:</span>
                    <p className="text-dusk-mute truncate">{opp.whoExperiencesIt}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-dusk-ink block text-[11px]">Current Workarounds:</span>
                    <p className="text-dusk-mute truncate">{opp.existingAlternatives}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedOpportunity(opp)}
                  className="btn-primary text-xs flex-1 flex items-center justify-center gap-1.5 py-2 shadow-xs"
                >
                  <span>Explore & Reality Check</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* View 2: IDEA LAB (Curated Startup Concepts) */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map(opp => {
            const concept = opp.starterConcept
            return (
              <div
                key={opp.id}
                className="rounded-2xl p-5 bg-white/15 border border-white/20 hover:bg-white/25 transition shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-dusk-deep uppercase tracking-wider">
                      Idea Lab · {opp.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 font-semibold">
                      Starter Concept
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-dusk-ink text-base">{concept.name}</h3>
                    <p className="text-xs text-dusk-ink/90 mt-1 leading-relaxed">{concept.description}</p>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-white/15 text-xs">
                    <div>
                      <span className="font-semibold text-dusk-ink block text-[11px]">Proposed Solution:</span>
                      <p className="text-dusk-mute line-clamp-2">{concept.solution}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-dusk-ink block text-[11px]">Business Model:</span>
                      <p className="text-dusk-mute truncate">{concept.model}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 flex flex-col gap-2">
                  <button
                    onClick={() => handleLaunchEvaluation(opp, true)}
                    className="btn-primary text-xs flex items-center justify-center gap-1.5 py-2 shadow-xs"
                  >
                    <span>Run Full Idea Evaluation</span>
                    <ArrowRight size={13} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLaunchEvaluation(opp, false)}
                      className="btn-ghost text-xs flex-1 py-1.5 justify-center"
                    >
                      Customize Details
                    </button>
                    <button
                      onClick={() => handleOpenAiChat(opp)}
                      className="btn-ghost text-xs text-dusk-deep flex items-center gap-1 py-1.5 justify-center"
                      title="Brainstorm in Think with FOCAS"
                    >
                      <Sparkles size={12} />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 5. OPPORTUNITY DETAIL & REALITY CHECK DRAWER/MODAL */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          onEvaluate={handleLaunchEvaluation}
          onBrainstorm={handleOpenAiChat}
        />
      )}
    </div>
  )
}

/**
 * Opportunity Detail & Reality Check Modal
 * Completely offline, zero AI required.
 */
function OpportunityDetailModal({
  opportunity: opp,
  onClose,
  onEvaluate,
  onBrainstorm,
}: {
  opportunity: DiscoveryOpportunity
  onClose: () => void
  onEvaluate: (opp: DiscoveryOpportunity, evaluateNow: boolean) => void
  onBrainstorm: (opp: DiscoveryOpportunity) => void
}) {
  const [tab, setTab] = useState<'overview' | 'reality' | 'action'>('overview')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 fade-in">
      <div className="absolute inset-0 bg-dusk-ink/35 backdrop-blur-sm" onClick={onClose} />
      <div
        className="glass-solid relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-dusk-deep uppercase tracking-wider">
                {opp.category}
              </span>
              <span className="chip text-[10px] bg-amber-500/15 text-amber-900 border border-amber-500/30 font-semibold">
                Unverified Hypothesis
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-dusk-ink mt-1">{opp.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-dusk-mute hover:bg-white/20 hover:text-dusk-ink transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Tab Controls */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-white/15 p-1 border border-white/20">
          <button
            onClick={() => setTab('overview')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
              tab === 'overview' ? 'bg-dusk-deep text-white shadow-xs' : 'text-dusk-mute hover:text-dusk-ink'
            }`}
          >
            1. Problem & Unknowns
          </button>
          <button
            onClick={() => setTab('reality')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
              tab === 'reality' ? 'bg-dusk-deep text-white shadow-xs' : 'text-dusk-mute hover:text-dusk-ink'
            }`}
          >
            2. Reality Check
          </button>
          <button
            onClick={() => setTab('action')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
              tab === 'action' ? 'bg-dusk-deep text-white shadow-xs' : 'text-dusk-mute hover:text-dusk-ink'
            }`}
          >
            3. Action Plan (Validate)
          </button>
        </div>

        {/* Tab 1: Problem & Unknowns */}
        {tab === 'overview' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="rounded-2xl bg-white/20 p-4 border border-white/25 space-y-1.5">
              <span className="font-bold text-dusk-deep text-xs uppercase tracking-wider block">
                The Friction Point / Problem:
              </span>
              <p className="text-dusk-ink leading-relaxed">{opp.problem}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/15 p-4 border border-white/20 space-y-1">
                <span className="font-semibold text-dusk-ink block text-xs">Who Experiences It:</span>
                <p className="text-dusk-mute leading-relaxed">{opp.whoExperiencesIt}</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-4 border border-white/20 space-y-1">
                <span className="font-semibold text-dusk-ink block text-xs">Why It Matters:</span>
                <p className="text-dusk-mute leading-relaxed">{opp.whyItMatters}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/15 p-4 border border-white/20 space-y-1">
              <span className="font-semibold text-dusk-ink block text-xs">Existing Alternatives & Workarounds:</span>
              <p className="text-dusk-mute leading-relaxed">{opp.existingAlternatives}</p>
            </div>

            <div className="rounded-2xl bg-amber-50/25 border border-amber-300/40 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wide">
                <ShieldAlert size={14} className="text-amber-700" />
                <span>Critical Unknowns (What Could Kill This):</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-xs text-dusk-ink">
                {opp.importantUnknowns.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Reality Check */}
        {tab === 'reality' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="rounded-2xl bg-white/20 p-4 border border-white/25">
              <span className="font-bold text-dusk-deep text-xs uppercase tracking-wider block mb-1">
                Starter Solution Concept:
              </span>
              <h4 className="font-bold text-base text-dusk-ink">{opp.starterConcept.name}</h4>
              <p className="text-dusk-mute mt-1 leading-relaxed">{opp.starterConcept.solution}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-dusk-ink">
                <span className="font-semibold">Business Model Hypothesis:</span>
                <span className="chip text-[11px] bg-white/30 text-dusk-ink">{opp.starterConcept.model}</span>
              </div>
            </div>

            {/* Framework Principle */}
            <div className="rounded-2xl bg-blue-50/20 border border-blue-200/50 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wide">
                <Lightbulb size={14} className="text-blue-700" />
                <span>Thinking Framework: {opp.framework.name}</span>
              </div>
              <p className="text-xs text-dusk-ink font-medium leading-relaxed">
                "{opp.framework.principle}"
              </p>
              <p className="text-xs text-dusk-mute leading-relaxed pt-1">
                👉 <strong>Action Check:</strong> {opp.framework.actionPrompt}
              </p>
            </div>

            {/* Reality Check Questions */}
            <div className="space-y-2">
              <span className="font-bold text-xs text-dusk-ink uppercase tracking-wide block">
                Critical Feasibility Questions:
              </span>
              {opp.realityCheckQuestions.map((rc, i) => (
                <div key={i} className="rounded-xl bg-white/15 p-3.5 border border-white/20 space-y-1">
                  <span className="font-semibold text-dusk-ink text-xs block">❓ {rc.question}</span>
                  <p className="text-xs text-rose-900/80 leading-relaxed">
                    ⚠️ <strong>Potential Pitfall:</strong> {rc.criticalRisk}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Action Plan */}
        {tab === 'action' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="rounded-2xl bg-white/20 p-4 border border-white/25 space-y-1.5">
              <span className="font-bold text-dusk-deep text-xs uppercase tracking-wider block">
                How to Investigate This Without Writing Code:
              </span>
              <p className="text-dusk-ink leading-relaxed">{opp.investigationMethod}</p>
            </div>

            <div className="space-y-2.5">
              <span className="font-bold text-xs text-dusk-ink uppercase tracking-wide block">
                4-Step Validation Sequence:
              </span>
              {opp.actionPlan.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl bg-white/15 p-3 border border-white/20">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dusk-deep text-white text-[10px] font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-dusk-ink leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="border-t border-white/20 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-[11px] text-dusk-mute">
            Ready to evaluate? Runs instant structured report.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onBrainstorm(opp)}
              className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-2 text-dusk-deep"
            >
              <Sparkles size={13} />
              <span>Discuss with AI Partner</span>
            </button>
            <button
              onClick={() => onEvaluate(opp, true)}
              className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2 shadow-xs"
            >
              <span>Evaluate Opportunity</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
