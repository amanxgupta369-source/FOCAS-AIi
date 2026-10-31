import type {
  Analysis,
  CustomerInterview,
  Experiment,
  IdeaForm,
  OverallVerdictReport,
  Project,
  TrackedAssumption,
} from '../../types'
import { understandIdea } from './ideaUnderstanding'
import { detectMissingInformation } from './missingInfoDetection'
import { validateProblem } from './problemValidation'
import { analyzeCustomer } from './customerAnalysis'
import { analyzeCompetitorsAndAlternatives } from './competitorAlternatives'
import { analyzeFeasibility } from './feasibilityAnalysis'
import { analyzeBusinessModel } from './businessModelAnalysis'
import { analyzeRisks } from './riskAnalysis'
import { generateValidationExperiments } from './experimentGenerator'
import { generateActionPlan } from './actionPlanGenerator'
import { evaluateDecision } from './decisionEngine'
import { FOUNDER_KNOWLEDGE_LIBRARY, getFrameworkById } from './knowledgeLibrary'

export { FOUNDER_KNOWLEDGE_LIBRARY, getFrameworkById } from './knowledgeLibrary'
export { understandIdea } from './ideaUnderstanding'
export { detectMissingInformation } from './missingInfoDetection'
export { validateProblem } from './problemValidation'
export { analyzeCustomer } from './customerAnalysis'
export { analyzeCompetitorsAndAlternatives } from './competitorAlternatives'
export { analyzeFeasibility } from './feasibilityAnalysis'
export { analyzeBusinessModel } from './businessModelAnalysis'
export { analyzeRisks } from './riskAnalysis'
export { generateValidationExperiments } from './experimentGenerator'
export { generateActionPlan } from './actionPlanGenerator'
export { evaluateDecision } from './decisionEngine'

/**
 * FOCAS Deterministic Founder Intelligence Engine
 * 100% Logic-Driven, Local, and Transparent. Zero External AI Model Dependencies.
 */
export function evaluateStartupIdea(
  form: IdeaForm,
  interviews: CustomerInterview[] = [],
  trackedAssumptions: TrackedAssumption[] = [],
  isQuotaExceeded = false,
  customNotice?: string
): Analysis {
  // 1. Understand Idea
  const understood = understandIdea(form)

  // 2. Missing Information
  const missingInfo = detectMissingInformation(form, understood)

  // 3. Problem Validation
  const problemVal = validateProblem(understood, interviews, trackedAssumptions)

  // 4. Customer Analysis
  const customerVal = analyzeCustomer(understood, interviews, trackedAssumptions)

  // 5. Competitor & Alternatives
  const compVal = analyzeCompetitorsAndAlternatives(understood)

  // 6. Feasibility
  const feasVal = analyzeFeasibility(understood)

  // 7. Business Model
  const bizVal = analyzeBusinessModel(understood)

  // 8. Risks
  const risksVal = analyzeRisks(understood, trackedAssumptions)

  // 9. Experiments
  const expVal = generateValidationExperiments(understood)

  // 10. Action Plan
  const planVal = generateActionPlan(understood)

  // 11. Decision Engine
  const decisionVal = evaluateDecision(understood, problemVal, interviews, trackedAssumptions)

  // Map to legacy Experiment[] type
  const legacyExperiments: Experiment[] = expVal.map(e => ({
    id: e.id,
    hypothesis: e.hypothesis,
    how: e.how,
    participants: e.participants,
    effort: e.effort,
    success: e.success,
    positive: e.positive,
    negative: e.negative,
    status: e.status,
    notes: e.notes,
  }))

  // Seed default assumptions if none tracked yet
  const defaultTrackedAssumptions: TrackedAssumption[] =
    trackedAssumptions.length > 0
      ? trackedAssumptions
      : [
          ...(understood.isCustomerAssumed
            ? [
                {
                  id: 'assump-cust',
                  assumption: `Target customer is confirmed as ${understood.cleanCustomer} (Preliminary system assumption from idea description).`,
                  category: 'Customer' as const,
                  state: 'Untested' as const,
                  evidenceNotes: 'Target customer role unverified; requires 5 discovery calls.',
                  lastUpdated: new Date().toISOString(),
                },
              ]
            : []),
          {
            id: 'assump-1',
            assumption: `${understood.cleanCustomer || 'Target customers'} experience this problem frequently enough to pay to eliminate it.`,
            category: 'Problem',
            state: 'Untested',
            evidenceNotes: interviews.length > 0 ? `${interviews.filter(i => i.problemConfirmed).length}/${interviews.length} confirmed pain` : 'No evidence yet',
            lastUpdated: new Date().toISOString(),
          },
          {
            id: 'assump-2',
            assumption: `Customers are willing to switch away from ${understood.cleanWorkaround || 'current spreadsheets and manual routines'}.`,
            category: 'Solution',
            state: 'Untested',
            evidenceNotes: 'Habit inertia remains untested',
            lastUpdated: new Date().toISOString(),
          },
          {
            id: 'assump-3',
            assumption: `The economic buyer has direct signing authority and budget to pay ${understood.cleanModel || 'a recurring fee'}.`,
            category: 'Pricing',
            state: 'Untested',
            evidenceNotes: 'Budget authority untested',
            lastUpdated: new Date().toISOString(),
          },
        ]

  // Construct 9-Section Synthesized Overall Verdict Report
  const overallVerdict: OverallVerdictReport = {
    decision: decisionVal.decision,
    conciseExplanation: decisionVal.conciseExplanation,
    strongestReason: decisionVal.strongestReason,
    biggestConcern: decisionVal.biggestConcern,
    singleMostImportantNextAction: decisionVal.singleMostImportantNextAction,
    isProvisionalNotice:
      'Provisional Heuristic Notice: This evaluation is generated deterministically by FOCAS using first-principles founder frameworks ' +
      '(The Mom Test, Lean Customer Development, Unit Economics). It is an evidence-completeness assessment, not a financial prediction.',

    whyItCouldSucceed: [
      {
        issue: 'Acute Operational Pain',
        whyItMatters: 'Foundational requirement: customer must feel urgency, not mild curiosity.',
        businessImpact: 'High conversion and low organic churn if pain is severe.',
        supportingEvidence: problemVal.severityDrivers[0] || 'Identified concrete workflow bottleneck in submission.',
        uncertainties: 'Requires 5 customer discovery calls to confirm frequency.',
      },
      {
        issue: 'Direct Value Creation',
        whyItMatters: 'Displaces costly manual labor or human error.',
        businessImpact: 'Supports clear value-based pricing.',
        supportingEvidence: understood.cleanWorkaround
          ? `Identified existing manual habits: "${understood.cleanWorkaround.slice(0, 70)}"`
          : 'Eliminates repetitive manual effort.',
        uncertainties: 'Switching friction from existing free workarounds.',
      },
    ],

    whyItCouldFail: [
      {
        issue: 'Polite Interest / Willingness-to-Pay Deficiency',
        whyItMatters: 'Users often say an idea is interesting but decline to pay.',
        businessImpact: 'Inability to reach default alive or cover acquisition costs.',
        supportingEvidence: interviews.length === 0 ? 'Zero discovery interviews or pre-orders logged.' : `${interviews.length} interviews recorded.`,
        uncertainties: 'Need skin-in-the-game pre-orders or pilot deposits.',
      },
      {
        issue: 'Distribution Channel Starvation',
        whyItMatters: 'Even great software fails if customer acquisition cost (CAC) exceeds lifetime value (LTV).',
        businessImpact: 'Traffic flatlines after launch without a scalable outbound channel.',
        supportingEvidence: 'No proven outbound sales loop or content engine established yet.',
        uncertainties: 'Channel testing required before full MVP build.',
      },
    ],

    minimumViableScope: {
      firstCustomerSegment: customerVal.primarySegment,
      problemToSolve: problemVal.exactProblem.slice(0, 150),
      essentialFunctionality: feasVal.buildFirst,
      excludedScope: feasVal.postpone,
      whyThisScopeIsAppropriate: feasVal.mvpScope,
      resultJustifyingFurtherDevelopment: 'At least 2 active users relying on the core loop weekly without reminders.',
      recommendedFormat: 'Concierge manual service or 1-page focused web interface.',
    },

    executionPlan: planVal.executionPlan,

    timeline: {
      milestones: planVal.timelineMilestones,
      scheduleEstimateDisclaimer: 'Estimated timeline based on a focused solo founder dedicating 15-20 hours/week.',
    },

    competitiveAdvantage: {
      currentAlternatives: compVal.existingAlternatives,
      strongestCompetitors: compVal.relevantCompetitors,
      whyCustomerMightSwitch: `Eliminates manual friction of ${understood.cleanWorkaround || 'current routines'} with a tailored workflow.`,
      keyDifferentiator: compVal.differentiationOpportunities[0] || 'Extreme simplicity and fast time-to-value.',
      isDefensibleOrEasyToCopy: 'Early features are easily copied; long-term defensibility comes from customer relationships and workflow data lock-in.',
      validationTestForAdvantage: 'Ask customers to compare your deliverable with their current spreadsheet on turnaround speed.',
      researchDisclosureNotice: compVal.researchLimitationsNotice,
    },

    criticalAssumption: decisionVal.criticalAssumption,
    whatWouldChangeVerdict: decisionVal.whatWouldChangeVerdict,
    nextThreeActions: planVal.nextThreeActions,
  }

  // Construct Full Analysis
  const analysis: Analysis = {
    // 1. Executive Summary
    executiveSummary: {
      ideaSimple: understood.cleanName,
      problemOverview: understood.cleanProblem,
      intendedCustomer: understood.cleanCustomer,
      opportunityOverview: `Solves ${understood.cleanProblem.slice(0, 100)} for ${understood.cleanCustomer} by automating current manual workarounds.`,
      biggestConcern: decisionVal.biggestConcern,
      recommendedAction: decisionVal.singleMostImportantNextAction,
    },

    // 2. Problem Analysis
    problemAnalysis: {
      exactProblem: problemVal.exactProblem,
      whoExperiencesIt: problemVal.whoExperiencesIt,
      whenAndWhy: problemVal.whenAndWhy,
      currentWorkarounds: problemVal.currentWorkarounds,
      evidenceStatus: problemVal.evidenceStatus,
      unverifiedAspects: problemVal.unverifiedAspects,
    },

    // 3. Customer Analysis
    customerAnalysis: {
      primarySegment: customerVal.primarySegment,
      secondarySegment: customerVal.secondarySegment,
      needsAndMotivations: customerVal.needsAndMotivations,
      earlyAdopters: customerVal.earlyAdopters,
      unlikelyUsersAndWhy: customerVal.unlikelyUsersAndWhy,
      verifiedFacts: customerVal.verifiedFacts,
      hypotheses: customerVal.hypotheses,
    },

    // 4. Solution Analysis
    solutionAnalysis: {
      howItWorks: feasVal.howItWorks,
      featureMapping: feasVal.featureMapping,
      mvpScope: feasVal.mvpScope,
      buildFirst: feasVal.buildFirst,
      postpone: feasVal.postpone,
      adoptionChallenges: feasVal.adoptionChallenges,
    },

    // 5. Market and Competitor Analysis
    marketAndCompetitors: {
      relevantCompetitors: compVal.relevantCompetitors,
      existingAlternatives: compVal.existingAlternatives,
      competitorComparison: compVal.competitorComparison,
      differentiationOpportunities: compVal.differentiationOpportunities,
      researchLimitationsNotice: compVal.researchLimitationsNotice,
    },

    // 6. Business Model
    businessModel: {
      possibleRevenueModels: bizVal.possibleRevenueModels,
      whoPaysAndWhy: bizVal.whoPaysAndWhy,
      pricingHypotheses: bizVal.pricingHypotheses,
      acquisitionChallenges: bizVal.acquisitionChallenges,
      retentionChallenges: bizVal.retentionChallenges,
    },

    // 7. Risks and Weaknesses
    risksAndWeaknesses: risksVal.map(r => ({
      risk: r.risk,
      whyItMatters: r.whyItMatters,
      failureMechanism: r.failureMechanism,
      severity: r.severity,
      mitigationStrategy: r.mitigationStrategy,
    })),

    // 8. Assumption Analysis
    assumptionAnalysis: defaultTrackedAssumptions.map(a => ({
      assumption: a.assumption,
      whyItMatters: 'If invalid, the core economic or adoption thesis breaks.',
      ifFalseConsequence: 'High churn, polite rejections during outreach, and wasted build energy.',
      testMethod: 'Conduct 5 Mom Test calls or ask for a pre-order pilot deposit.',
    })),

    // 9. Validation Plan
    validationPlan: {
      experiments: expVal,
    },

    // 10. Competitive Advantage
    competitiveAdvantage: {
      plausibleDifferentiators: compVal.differentiationOpportunities,
      hardToSustainAdvantages: ['UI aesthetics alone', 'Broad feature sets that can be copied by incumbents'],
      defensibleAdvantages: ['Deep niche customer relationships', 'Proprietary workflow data integrations', 'Speed of execution'],
      easilyCopiedFeatures: ['Simple form interfaces', 'Basic dashboard visuals', 'Generic landing pages'],
    },

    // 11. Final Recommendation
    finalRecommendation: {
      verdict: decisionVal.finalRecommendationVerdict,
      verdictReasoning: decisionVal.verdictReasoning,
      strongestArgumentsFor: decisionVal.strongestArgumentsFor,
      strongestObjections: decisionVal.strongestObjections,
      nextFiveActions: planVal.nextFiveActions,
    },

    // 12. Open Questions
    openQuestions: {
      missingMaterialInfo: missingInfo.missingMaterialInfo,
      focusedFollowUpQuestions: missingInfo.focusedFollowUpQuestions,
      limitationsNotice: missingInfo.limitationsNotice,
    },

    // Synthesized Overall Verdict Report
    overallVerdict,

    // Backward-Compatible Quick Access Properties
    score: decisionVal.readinessScore,
    opportunities: compVal.differentiationOpportunities,
    risks: risksVal.map(r => `${r.risk}: ${r.mitigationStrategy}`),
    assumptions: defaultTrackedAssumptions.map(a => a.assumption),
    questions: customerVal.momTestQuestions,
    experiments: legacyExperiments,
    nextSteps: planVal.nextFiveActions,
    problemSolution: {
      problemSummary: problemVal.exactProblem,
      solutionSummary: understood.cleanSolution,
      problemUrgency: problemVal.urgencyRationale,
    },
    targetCustomers: {
      profile: customerVal.primarySegment,
      verifiedSignals: customerVal.verifiedFacts,
      unverifiedAssumptions: customerVal.hypotheses,
    },
    competitorAnalysis: {
      directCompetitors: compVal.relevantCompetitors,
      indirectWorkarounds: compVal.existingAlternatives,
      switchingBarriers: compVal.switchingBarriers,
    },
    evaluationType: 'basic',
    evaluationNotice:
      customNotice ||
      'Evaluated deterministically by FOCAS Founder Intelligence Engine (Zero External AI API Dependencies). ' +
      'All calculations, risk assessments, and action plans are generated from first-principles startup frameworks.',
    isQuotaExceeded: false,
    interviewsSummary: {
      total: interviews.length,
      problemConfirmedCount: interviews.filter(i => i.problemConfirmed).length,
      wouldPayCount: interviews.filter(i => i.wouldPay).length,
    },
  }

  return analysis
}

/**
 * Deterministic Thinking Partner Advisor
 * Replaces external LLM inference endpoints. Answers founder questions instantly
 * and transparently using project analysis data and the versioned knowledge library.
 */
export function getDeterministicAdvisorResponse(query: string, project: Project): string {
  const q = query.toLowerCase().trim()
  const form = project.form
  const analysis = project.analysis
  const verdict = analysis?.overallVerdict

  if (!analysis) {
    return 'This project does not have an active evaluation report yet. Click "Re-evaluate with Founder Engine" to generate a complete analysis.'
  }

  // Question 1: Score explanation / Why this score?
  if (q.includes('score') || q.includes('why') && (q.includes('verdict') || q.includes('rating') || q.includes('points'))) {
    return (
      `### FOCAS Readiness Index: ${analysis.score}/100\n\n` +
      `**Important Principle**: This score is an **evidence-completeness index**, not a speculative prediction of startup success.\n\n` +
      `**How your score was calculated**:\n` +
      `- **Problem Clarity**: ${form.problem ? 'Defined (+10)' : 'Missing (0)'}\n` +
      `- **Target Customer**: ${form.customer ? 'Specified (+10)' : 'Too broad (0)'}\n` +
      `- **Workaround Mapped**: ${form.current ? 'Identified (+10)' : 'Unstated (0)'}\n` +
      `- **Commercial Model**: ${form.model ? 'Defined (+5)' : 'Unspecified (0)'}\n` +
      `- **Interviews Logged**: ${project.interviews?.length || 0} customer interview(s)\n\n` +
      `**How to increase your readiness score**:\n` +
      `Log 3 to 5 customer discovery interviews in the "Customer Interviews" tab and track assumptions as "Supported". ` +
      `Verifying willingness to pay with real buyers increases the score up to 95/100.`
    )
  }

  // Question 2: Risks & Failure Modes
  if (q.includes('risk') || q.includes('fail') || q.includes('danger') || q.includes('concern')) {
    const topRisks = analysis.risksAndWeaknesses.slice(0, 3)
    return (
      `### Top Risks for "${form.name || 'Your Startup Idea'}"\n\n` +
      topRisks
        .map(
          (r, idx) =>
            `**${idx + 1}. ${r.risk}** (Severity: ${r.severity})\n` +
            `- **Why it matters**: ${r.whyItMatters}\n` +
            `- **Failure mechanism**: ${r.failureMechanism}\n` +
            `- **How to mitigate**: ${r.mitigationStrategy}`
        )
        .join('\n\n')
    )
  }

  // Question 3: What should I build / MVP Scope
  if (q.includes('build') || q.includes('mvp') || q.includes('feature') || q.includes('scope')) {
    const feas = analysis.solutionAnalysis
    return (
      `### Recommended MVP Scope\n\n` +
      `**Core Focus**: ${feas.mvpScope}\n\n` +
      `**Build First (Weeks 1–2)**:\n` +
      feas.buildFirst.map(f => `- ${f}`).join('\n') +
      `\n\n**Postpone for Later**:\n` +
      feas.postpone.map(f => `- ${f}`).join('\n')
    )
  }

  // Question 4: Customer discovery / Interview questions / Mom Test
  if (q.includes('interview') || q.includes('question') || q.includes('customer') || q.includes('talk')) {
    const questions = analysis.questions || []
    return (
      `### 5 Non-Leading Discovery Questions (The Mom Test)\n\n` +
      `When speaking with target customers (${form.customer || 'potential buyers'}), never ask "Would you buy this?" Ask about their past behavior instead:\n\n` +
      questions.map(q => `${q}`).join('\n\n') +
      `\n\n*Log your findings in the "Customer Interviews" tab to update your evaluation automatically.*`
    )
  }

  // Question 5: Experiments / How to validate
  if (q.includes('experiment') || q.includes('validate') || q.includes('test') || q.includes('proof')) {
    const exps = analysis.validationPlan.experiments
    return (
      `### Recommended Pre-Build Experiments\n\n` +
      exps
        .map(
          (e, idx) =>
            `**Experiment ${idx + 1}: ${e.objective}**\n` +
            `- **Participants**: ${e.targetParticipants}\n` +
            `- **Actions**: ${e.actionsToTake}\n` +
            `- **Success Metric**: ${e.successCriterion}\n` +
            `- **Evidence to collect**: ${e.evidenceToCollect}`
        )
        .join('\n\n')
    )
  }

  // Question 6: What framework / Knowledge library
  if (q.includes('framework') || q.includes('library') || q.includes('logic') || q.includes('rules')) {
    return (
      `### FOCAS Founder Knowledge Library\n\n` +
      `FOCAS does not use a black-box neural network. Every recommendation is derived from 11 verified startup frameworks:\n\n` +
      FOUNDER_KNOWLEDGE_LIBRARY.map(
        f => `- **${f.title}** (${f.area}): ${f.purpose}`
      ).join('\n') +
      `\n\nAll rules are open, deterministic, and inspectable in the codebase.`
    )
  }

  // Question 7: Next steps / Action plan
  if (q.includes('next') || q.includes('step') || q.includes('action') || q.includes('todo') || q.includes('plan')) {
    const actions = verdict?.nextThreeActions || []
    return (
      `### Your Next Three Actions\n\n` +
      actions
        .map(
          a =>
            `**Step ${a.rank}: ${a.title}**\n` +
            `- **What to do**: ${a.what}\n` +
            `- **How**: ${a.how}\n` +
            `- **Why it's priority**: ${a.whyPriority}\n` +
            `- **Target result**: ${a.targetResult}`
        )
        .join('\n\n')
    )
  }

  // Default Fallback
  return (
    `### FOCAS Thinking Partner Advisor\n\n` +
    `I can answer questions regarding your evaluation report using deterministic first principles:\n\n` +
    `- **"Why this score?"** — Explains the readiness index breakdown.\n` +
    `- **"What are my biggest risks?"** — Breaks down failure mechanisms and mitigations.\n` +
    `- **"What should I build first?"** — Details MVP scoping and what to postpone.\n` +
    `- **"How do I interview customers?"** — Provides 5 Mom-Test discovery questions.\n` +
    `- **"What experiments should I run?"** — Details validation tests before writing software.\n` +
    `- **"What frameworks are used?"** — Lists all 11 library frameworks.\n\n` +
    `What aspect of your idea would you like to explore next?`
  )
}
