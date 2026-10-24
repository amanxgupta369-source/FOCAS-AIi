import type {
  Analysis,
  CustomerInterview,
  Experiment,
  IdeaForm,
  TrackedAssumption,
} from '../types'
import { generateOverallVerdict } from './verdict'

/**
 * FOCAS Basic Evaluation Engine (Deterministic & AI-Independent).
 *
 * Runs 100% locally in browser or server without any external AI dependency.
 * Uses structured, transparent business rules derived from first principles
 * (The Mom Test, Lean Startup, Customer Development) to evaluate startup ideas.
 *
 * Guarantees:
 * 1. Zero hallucinations: Never invents fake competitors, market sizes, or customer feedback.
 * 2. Transparent distinction between user facts, unverified assumptions, and unknown info.
 * 3. Evidence-reactive: Recalculates risk and verdicts dynamically when interviews or assumption states are recorded.
 * 4. Transparent readiness score: Explicitly labeled as an evidence-completeness index, not an arbitrary success predictor.
 */
export function generateBasicEvaluation(
  form: IdeaForm,
  interviews: CustomerInterview[] = [],
  trackedAssumptions: TrackedAssumption[] = [],
  isQuotaExceeded = false,
  customNotice?: string
): Analysis {
  const name = form.name?.trim() || 'This startup idea'
  const problem = form.problem?.trim() || ''
  const customer = form.customer?.trim() || ''
  const segment = form.segment?.trim() || ''
  const market = form.market?.trim() || ''
  const solution = form.solution?.trim() || form.description?.trim() || ''
  const currentWorkaround = form.current?.trim() || ''
  const model = form.model?.trim() || ''
  const competitors = form.competitors?.trim() || ''
  const demand = form.demand?.trim() || ''
  const frequency = form.frequency?.trim() || ''
  const costs = form.costs?.trim() || ''
  const priorExperiments = form.priorExperiments?.trim() || ''

  // 1. Evaluate Problem Clarity
  const hasProblem = problem.length >= 25
  const problemMentionsPain =
    problem.toLowerCase().includes('slow') ||
    problem.toLowerCase().includes('cost') ||
    problem.toLowerCase().includes('waste') ||
    problem.toLowerCase().includes('error') ||
    problem.toLowerCase().includes('hard') ||
    problem.toLowerCase().includes('frustrat') ||
    problem.toLowerCase().includes('fail')
  const problemClarityRating =
    hasProblem && (frequency || problemMentionsPain)
      ? 'High Clarity - Acute Pain Point'
      : hasProblem
        ? 'Moderate Clarity - Identifies a task, but severity & urgency need validation'
        : 'Low Clarity - Too vague or brief for deep analysis'

  // 2. Evaluate Target Customer Clarity
  const hasCustomer = customer.length >= 10
  const hasSegment = segment.length >= 5
  const customerClarityRating =
    hasCustomer && hasSegment
      ? `Specific & Accessible: "${customer}" in segment "${segment}"`
      : hasCustomer
        ? `Moderate: "${customer}" (needs narrower beachhead segment)`
        : 'Broad / Undefined: Target buyer not specifically defined'

  // 3. Evaluate Frequency of Problem
  const problemFrequencySummary = frequency
    ? `Stated frequency: "${frequency}"`
    : problem.toLowerCase().includes('daily')
      ? 'Inferred as daily pain from problem description'
      : problem.toLowerCase().includes('month')
        ? 'Inferred as monthly recurrence'
        : 'Frequency not specified by founder. (Critical: Infrequent problems rarely justify dedicated software subscriptions).'

  // 4. Competitors and Alternatives
  const hasCompetitors = competitors.length > 3 && !competitors.toLowerCase().includes('none')
  const hasWorkaround = currentWorkaround.length > 5 && !currentWorkaround.toLowerCase().includes('not sure')

  const existingAlternatives = hasWorkaround
    ? [
        `Primary current habit: "${currentWorkaround}"`,
        'Everyday productivity tools (Spreadsheets, email, paper notes, manual messaging)',
        'Doing nothing: enduring the problem because learning new software is seen as a hassle',
      ]
    : [
        'Unspecified by founder. (By default, existing manual workarounds and spreadsheets are your biggest competitor).',
        'Everyday productivity tools (Google Sheets, Microsoft Excel, paper notes)',
        'Doing nothing: accepting the pain rather than searching for new software',
      ]

  const relevantCompetitors = hasCompetitors
    ? [competitors]
    : ['None specifically identified by founder. You must investigate direct and indirect competitors before building.']

  // 5. Solution & Why Customers Might Choose It
  const hasSolution = solution.length >= 20
  const whyChooseIt = hasWorkaround
    ? `Eliminates the repetitive manual steps of ${currentWorkaround} and reduces human error.`
    : 'Automates manual tasks and saves founder time, provided users can adopt it without difficult onboarding.'

  // 6. Business Model & Costs
  const hasModel = model.length > 3
  const hasCosts = costs.length > 3
  const businessModelSummary = hasModel
    ? `Proposed model: "${model}"`
    : 'Not defined yet. (Recommendation: Charge early customers direct upfront pricing before setting up recurring billing).'

  // 7. Analyze Recorded Evidence (Interviews & Assumptions)
  const interviewCount = interviews.length
  const confirmedPainInterviews = interviews.filter(i => i.problemConfirmed)
  const wouldPayInterviews = interviews.filter(i => i.wouldPay)

  const disprovedAssumptions = trackedAssumptions.filter(a => a.state === 'Disproved')
  const supportedAssumptions = trackedAssumptions.filter(a => a.state === 'Supported')
  const untestedAssumptions = trackedAssumptions.filter(a => a.state === 'Untested')

  // Verified Facts vs Hypotheses
  const verifiedFacts: string[] = []
  const hypotheses: string[] = []
  const missingMaterialInfo: string[] = []

  if (interviewCount > 0) {
    verifiedFacts.push(
      `${interviewCount} customer interview(s) logged: ${confirmedPainInterviews.length} confirmed the problem, ${wouldPayInterviews.length} agreed they would pay.`
    )
  }
  if (demand.length > 5) {
    verifiedFacts.push(`Founder-reported demand signal: "${demand.slice(0, 160)}"`)
  } else if (interviewCount === 0) {
    hypotheses.push('Customer willingness to pay is 100% unproven. No interviews, deposits, or sales logged yet.')
  }

  if (hasWorkaround) {
    verifiedFacts.push(`Current customer workaround identified: "${currentWorkaround.slice(0, 160)}"`)
  } else {
    missingMaterialInfo.push('How customers solve this problem today is unknown. (You cannot beat an alternative you have not mapped).')
  }

  if (!hasCompetitors) {
    missingMaterialInfo.push('No direct commercial competitors or substitute tools were identified.')
  }
  if (!frequency) {
    missingMaterialInfo.push('Exact problem frequency (daily, weekly, yearly) is unstated.')
  }
  if (!hasCosts) {
    missingMaterialInfo.push('Estimated development costs, server budget, and regulatory constraints have not been provided.')
  }

  // Strong Points
  const strongPoints: string[] = []
  if (hasProblem) strongPoints.push('Clearly identified problem statement from the founder.')
  if (hasCustomer && hasSegment) strongPoints.push(`Defined target audience: ${customer} (${segment}).`)
  if (hasWorkaround) strongPoints.push(`Identified existing workflow: customers already use ${currentWorkaround}.`)
  if (wouldPayInterviews.length > 0) {
    strongPoints.push(`Strong signal: ${wouldPayInterviews.length} interviewed customer(s) stated they would pay for a solution.`)
  }
  if (priorExperiments.length > 5) {
    strongPoints.push(`Previous testing attempted: "${priorExperiments.slice(0, 140)}"`)
  }
  if (strongPoints.length === 0) {
    strongPoints.push('Clean slate idea with high flexibility to pivot early before incurring build costs.')
  }

  // Weak Assumptions
  const weakAssumptions: string[] = []
  weakAssumptions.push(`Assumes ${customer || 'target users'} feel this problem frequently enough to justify finding and learning a new tool.`)
  if (hasWorkaround) {
    weakAssumptions.push(`Assumes users will abandon "${currentWorkaround}" (which they already know and pay $0 for).`)
  }
  weakAssumptions.push(`Assumes the economic value created exceeds the cost of acquisition and ongoing support.`)
  if (disprovedAssumptions.length > 0) {
    disprovedAssumptions.forEach(da => {
      weakAssumptions.push(`DISPROVED ASSUMPTION: "${da.assumption}" — Evidence: ${da.evidenceNotes || 'Flagged during customer testing'}`)
    })
  }

  // Transparent Recommendation Formulation
  let recommendationVerdict: 'VALIDATE FIRST' | 'BUILD' | 'RETHINK' | 'DON\'T PURSUE THIS VERSION' = 'VALIDATE FIRST'
  let recommendationReasoning = ''
  let finalRecommendationVerdict: 'VALIDATE' | 'PROCEED WITH A SMALL MVP' | 'REVISE' | 'STOP OR RECONSIDER' = 'VALIDATE'

  if (disprovedAssumptions.length >= 2 || (interviewCount >= 3 && confirmedPainInterviews.length === 0)) {
    recommendationVerdict = 'DON\'T PURSUE THIS VERSION'
    finalRecommendationVerdict = 'STOP OR RECONSIDER'
    recommendationReasoning =
      `Based on your recorded evidence, key foundational assumptions have been disproved or early interviews failed to confirm problem urgency. ` +
      `Pursuing this version risks burning time and capital on an issue customers can easily tolerate. Pivot the concept or target segment.`
  } else if (!hasProblem || (!hasCustomer && interviewCount === 0)) {
    recommendationVerdict = 'RETHINK'
    finalRecommendationVerdict = 'REVISE'
    recommendationReasoning =
      `The core problem or target customer is still too broad. Without knowing who suffers most and what specific metric is broken, building software is premature. Narrow your niche first.`
  } else if (interviewCount >= 4 && wouldPayInterviews.length >= 3 && disprovedAssumptions.length === 0) {
    recommendationVerdict = 'BUILD'
    finalRecommendationVerdict = 'PROCEED WITH A SMALL MVP'
    recommendationReasoning =
      `You have verified real customer pain and willingness to pay with ${wouldPayInterviews.length} potential buyers, with zero disproved critical assumptions. Build the smallest possible manual or automated MVP to serve these initial customers.`
  } else {
    recommendationVerdict = 'VALIDATE FIRST'
    finalRecommendationVerdict = 'VALIDATE'
    recommendationReasoning =
      `The concept has logical merit, but customer willingness to pay is still an assumption. ` +
      `With ${interviewCount} customer interview(s) recorded, your priority is to complete 5 to 8 discovery calls and test commitment before writing code.`
  }

  // Calculate Evidence-Completeness Score (0-100, purely objective index)
  let score = 30
  if (hasProblem) score += 10
  if (hasCustomer && hasSegment) score += 10
  if (hasWorkaround) score += 10
  if (hasCompetitors) score += 5
  if (hasModel) score += 5
  if (interviewCount >= 1) score += 10
  if (interviewCount >= 3) score += 10
  if (wouldPayInterviews.length >= 1) score += 10
  if (supportedAssumptions.length >= 1) score += 5
  if (disprovedAssumptions.length >= 1) score -= 15
  score = Math.max(15, Math.min(95, score))

  // Seed default assumptions if none tracked yet
  const defaultTrackedAssumptions: TrackedAssumption[] =
    trackedAssumptions.length > 0
      ? trackedAssumptions
      : [
          {
            id: 'assump-1',
            assumption: `${customer || 'Target customers'} experience this problem frequently enough to pay to eliminate it.`,
            category: 'Problem',
            state: 'Untested',
            evidenceNotes: interviewCount > 0 ? `${confirmedPainInterviews.length}/${interviewCount} confirmed pain` : 'No evidence yet',
            lastUpdated: new Date().toISOString(),
          },
          {
            id: 'assump-2',
            assumption: `Customers are willing to switch away from ${currentWorkaround || 'current habits and spreadsheets'}.`,
            category: 'Solution',
            state: 'Untested',
            evidenceNotes: 'Habit inertia remains untested',
            lastUpdated: new Date().toISOString(),
          },
          {
            id: 'assump-3',
            assumption: `The buyer has direct purchasing authority and sufficient budget to pay ${model || 'a monthly fee'}.`,
            category: 'Pricing',
            state: 'Untested',
            evidenceNotes: interviewCount > 0 ? `${wouldPayInterviews.length}/${interviewCount} stated willingness to pay` : 'Budget not yet tested',
            lastUpdated: new Date().toISOString(),
          },
        ]

  // Validation Experiments (3 Practical, Low-Cost Experiments)
  const experiments: Experiment[] = [
    {
      id: 'exp-1',
      hypothesis: `At least 4 out of 5 target ${customer || 'customers'} confirm they waste time or money on this weekly.`,
      how: 'Conduct 5 Mom-Test style customer discovery interviews. Ask open questions about past behavior without pitching the idea.',
      participants: `5 to 8 ${customer || 'potential users'}`,
      effort: '3 to 5 days',
      success: '4+ participants give concrete examples of money or hours lost in the last 30 days.',
      positive: 'Strong evidence of an active, painful problem. Proceed to willingness-to-pay test.',
      negative: 'Participants say it sounds nice but cannot name a recent time it cost them time or money. Revise target segment.',
      status: interviewCount >= 5 ? 'Completed' : interviewCount > 0 ? 'In progress' : 'Not started',
      notes: interviewCount > 0 ? `${interviewCount} interview(s) recorded in validation log.` : '',
    },
    {
      id: 'exp-2',
      hypothesis: 'Customers will commit money or formal interest before software is built.',
      how: 'Offer to solve the problem manually (concierge pilot) or ask for a refundable $20 deposit / signed Letter of Intent (LOI).',
      participants: '3 to 5 prospects who confirmed high pain in interviews',
      effort: '1 week',
      success: 'At least 2 prospects commit budget or sign an LOI to test the early version.',
      positive: 'Willingness to pay validated. Software build is justified.',
      negative: 'Customers refuse even nominal payment or small commitment. Re-examine pricing or problem importance.',
      status: wouldPayInterviews.length >= 2 ? 'Completed' : 'Not started',
      notes: '',
    },
    {
      id: 'exp-3',
      hypothesis: 'Customers can achieve the core result faster than their current workaround.',
      how: 'Create a clickable wireframe or manual Google Sheet / Zapier prototype and observe a user trying to complete the task.',
      participants: '3 prospective users',
      effort: '2 to 3 days',
      success: 'User reaches the intended result in under 5 minutes without founder assistance.',
      positive: 'Usability and core value proposition confirmed. Begin building the MVP.',
      negative: 'User gets confused or remarks that their old spreadsheet was faster. Simplify the workflow.',
      status: 'Not started',
      notes: '',
    },
  ]

  // Questions to ask potential customers (Non-leading discovery questions)
  const questionsToAsk = [
    `When was the last time you had to deal with ${problem.slice(0, 60) || 'this issue'}? Walk me through what happened.`,
    `What specific tools or steps (${currentWorkaround || 'workarounds'}) did you use to handle it?`,
    'What was the most frustrating, time-consuming, or expensive part of that process?',
    'What other software or services have you tried or evaluated to solve this, and why did they not work out?',
    `Who in your organization would have the authority to pay for a tool to fix this, and what budget would they expect?`,
  ]

  // 12-Section Analysis Foundation
  const basicAnalysis: Analysis = {
    evaluationType: 'basic',
    evaluationNotice:
      customNotice ||
      'AI is temporarily unavailable. FOCAS Basic Evaluation is ready to help you continue. This structured evaluation was generated using first-principles business rules without external AI.',
    isQuotaExceeded,
    interviewsSummary: {
      total: interviewCount,
      problemConfirmedCount: confirmedPainInterviews.length,
      wouldPayCount: wouldPayInterviews.length,
    },

    // 1. Executive Summary
    executiveSummary: {
      ideaSimple: `${name} aims to help ${customer || 'target users'} solve: "${problem.slice(0, 140) || 'a stated operational bottleneck'}".`,
      problemOverview: hasWorkaround
        ? `Customers currently rely on "${currentWorkaround}". This causes manual errors and takes up valuable time.`
        : 'People currently handle this with manual workarounds or by enduring the frustration.',
      intendedCustomer: customerClarityRating,
      opportunityOverview:
        interviewCount > 0
          ? `You have logged ${interviewCount} interview(s) with ${wouldPayInterviews.length} prospect(s) indicating willingness to pay. Continue gathering evidence before building.`
          : 'Concept has logical structure, but customer demand and willingness to pay are currently untested assumptions.',
      biggestConcern: hasWorkaround
        ? `Customer inertia: Users already know "${currentWorkaround}" and may resist switching unless your solution is dramatically faster.`
        : 'Building a "nice-to-have" tool that customers praise politely, but refuse to buy.',
      recommendedAction:
        interviewCount >= 3
          ? 'Review your recorded interview feedback and test formal commitments (LOIs or pre-orders) before writing code.'
          : 'Conduct 5 structured customer discovery calls to verify problem urgency.',
    },

    // 2. Problem Analysis
    problemAnalysis: {
      exactProblem: problem || 'Not specified in detail by founder.',
      whoExperiencesIt: customer
        ? `${customer}${segment ? ` (Segment: ${segment})` : ''}. Focus on the individuals doing the direct daily work.`
        : 'Unspecified target user.',
      whenAndWhy: problemFrequencySummary,
      currentWorkarounds: currentWorkaround || 'Manual notes, spreadsheets, or doing nothing.',
      evidenceStatus:
        interviewCount > 0
          ? `${confirmedPainInterviews.length} of ${interviewCount} interviewed prospect(s) confirmed experiencing this problem.`
          : demand
            ? `Founder reported early signal: "${demand.slice(0, 120)}". Needs independent interview validation.`
            : 'Unproven hypothesis. No customer interviews or proof logged yet.',
      unverifiedAspects:
        'Does the user experience this pain frequently enough to change daily habits? Does the buyer have dedicated budget?',
    },

    // 3. Customer Analysis
    customerAnalysis: {
      primarySegment: customer || 'Target customer not clearly defined yet.',
      secondarySegment: segment || 'Broader market segment.',
      needsAndMotivations: 'Wants to stop wasting time on repetitive tasks, eliminate mistakes, and finish work faster.',
      earlyAdopters: `People within "${customer || 'target audience'}" who recently suffered a costly mistake and have actively searched for a fix.`,
      unlikelyUsersAndWhy: 'Enterprise organizations with lengthy procurement cycles or individuals who only encounter this issue rarely.',
      verifiedFacts,
      hypotheses,
    },

    // 4. Solution Analysis
    solutionAnalysis: {
      howItWorks: solution || 'Automates the core workflow to eliminate manual intervention.',
      featureMapping: [
        {
          feature: 'Fast, frictionless input',
          problemSolved: 'Stops users from having to manually transcribe data across multiple files.',
        },
        {
          feature: 'Automated processing & verification',
          problemSolved: 'Eliminates repetitive manual computation and prevents costly human errors.',
        },
        {
          feature: 'Single-click summary / export',
          problemSolved: 'Allows the user to share finished deliverables instantly with stakeholders.',
        },
      ],
      mvpScope: 'A minimalist prototype that solves exclusively the single most painful bottleneck in under 5 minutes of setup.',
      buildFirst: [
        'The single calculation or transformation that delivers the primary value.',
        'A clean interface requiring zero configuration to test.',
        'A direct export or output mechanism.',
      ],
      postpone: [
        'Multi-user team permissions and role management.',
        'Custom themes, branding, and white-labeling.',
        'Complex automated subscription billing (invoice early pilot users manually).',
      ],
      adoptionChallenges: hasWorkaround
        ? `Overcoming inertia: Users are familiar with ${currentWorkaround} and may resist adopting a new interface.`
        : 'Ensuring users experience the primary "aha" value in their first 3 minutes of use.',
    },

    // 5. Market and Competitor Analysis
    marketAndCompetitors: {
      relevantCompetitors,
      existingAlternatives,
      competitorComparison: [
        {
          name: hasCompetitors ? competitors : 'Commercial Software Tools',
          targetAudience: 'Broader market or large organizations',
          coreFeatures: 'Feature-heavy suites with high configuration complexity',
          positioning: 'All-in-one platforms trying to serve many different use cases',
          pricingInfo: 'Typically subscription-based ($30 - $200/month); research required to confirm.',
        },
        {
          name: hasWorkaround ? currentWorkaround : 'Spreadsheets and Manual Processes',
          targetAudience: customer || 'General users',
          coreFeatures: 'Familiar, highly flexible, zero incremental software cost',
          positioning: 'Default ingrained habit',
          pricingInfo: '$0 direct software invoice, but costs wasted hours and employee frustration.',
        },
      ],
      differentiationOpportunities: [
        'Focus on doing ONE specific workflow 10x faster with zero onboarding complexity.',
        'Transparent, straightforward pricing without annual lock-in.',
        'Tailored language and workflows specifically designed for your niche.',
      ],
      researchLimitationsNotice:
        'Competitor and market details are derived from founder inputs and common software benchmarks. Independent market research is recommended.',
    },

    // 6. Business Model
    businessModel: {
      possibleRevenueModels: [
        model || 'Direct recurring subscription (Monthly or Annual)',
        'Per-transaction or usage-based tier',
        'Concierge / high-touch onboarding fee + subscription',
      ],
      whoPaysAndWhy: customer ? `${customer}, paying to reclaim hours or eliminate errors.` : 'Target buyer paying for tangible efficiency.',
      pricingHypotheses: model || 'Charge an initial flat pilot price (e.g. $29 to $99/mo) to test payment elasticity before launching complex tiers.',
      acquisitionChallenges: 'Finding and reaching qualified buyers without spending more on marketing than customer lifetime value.',
      retentionChallenges: 'Ensuring customers use the tool regularly rather than canceling after the initial rush.',
    },

    // 7. Risks and Weaknesses
    risksAndWeaknesses: [
      {
        risk: 'Customer Inertia & Habit Retention',
        whyItMatters: 'People naturally stick with what they know. The easiest option is to endure the existing pain.',
        failureMechanism: 'Prospective buyers compliment the product during demos but never actually sign up or use it.',
        severity: 'High',
        mitigationStrategy: 'Make initial setup take under 3 minutes and directly demonstrate measurable time saved.',
      },
      {
        risk: 'Polite Interest Without Willingness to Pay',
        whyItMatters: 'People are polite in conversations. Compliments do not pay server or operational bills.',
        failureMechanism: 'Users happily adopt a free beta, but churn immediately when asked for payment.',
        severity: 'High',
        mitigationStrategy: 'Ask for letters of intent, deposits, or manual invoices before writing code.',
      },
      {
        risk: 'Customer Acquisition Cost Exceeds Value',
        whyItMatters: 'If reaching each customer costs $200 but they only pay $20/month, the business will fail.',
        failureMechanism: 'High ad spending or cold outreach exhaustion with low conversion rates.',
        severity: 'Medium',
        mitigationStrategy: 'Leverage direct founder sales, warm community referrals, and niche community outreach.',
      },
    ],

    // 8. Assumption Analysis
    assumptionAnalysis: defaultTrackedAssumptions.map(ta => ({
      assumption: ta.assumption,
      whyItMatters: `Determines whether ${customer || 'customers'} will actually purchase and adopt the solution.`,
      ifFalseConsequence: 'Product will struggle to acquire paying users; the business model will not work.',
      testMethod: 'Structured customer discovery interviews and willingness-to-pay commitment tests.',
    })),

    // 9. Validation Plan
    validationPlan: {
      experiments: experiments.map(exp => ({
        ...exp,
        objective: exp.hypothesis,
        targetParticipants: exp.participants,
        actionsToTake: exp.how,
        questionsToAsk: questionsToAsk,
        evidenceToCollect: 'Interview notes, recorded quotes, and payment/LOI receipts.',
        successCriterion: exp.success,
        positiveInterpretation: exp.positive,
        negativeInterpretation: exp.negative,
        inconclusiveInterpretation: 'Mixed feedback. Narrow customer segment and test again.',
      })),
    },

    // 10. Competitive Advantage
    competitiveAdvantage: {
      plausibleDifferentiators: [
        'Radical simplicity for one specific niche, rather than being a bloated all-in-one suite.',
        'Faster time-to-value (setup under 3 minutes).',
        'Direct founder support and rapid iteration.',
      ],
      hardToSustainAdvantages: ['UI look-and-feel (easily copied by competitors).', 'Standard software features.'],
      defensibleAdvantages: [
        'Proprietary workflow integrations or specialized domain data.',
        'Strong direct customer relationships and community goodwill.',
      ],
      easilyCopiedFeatures: ['Basic dashboard screens', 'Standard export buttons'],
    },

    // 11. Final Recommendation
    finalRecommendation: {
      verdict: finalRecommendationVerdict,
      verdictReasoning: recommendationReasoning,
      strongestArgumentsFor: strongPoints,
      strongestObjections: weakAssumptions,
      nextFiveActions: [
        'Conduct 5 to 8 structured customer discovery calls using non-leading questions.',
        'Map the exact steps and friction points of the current workaround.',
        'Ask prospects for a signed Letter of Intent or small refundable deposit to prove willingness to pay.',
        'Log all interview feedback in the FOCAS Interactive Validation tab.',
        'Update your FOCAS evaluation to recalculate the verdict based on verified customer evidence.',
      ],
    },

    // 12. Open Questions
    openQuestions: {
      missingMaterialInfo,
      focusedFollowUpQuestions: questionsToAsk,
      limitationsNotice:
        'This evaluation uses deterministic business rules based on founder input and validation evidence. It does not replace live market testing.',
    },

    // Summaries and Quick Access
    score,
    opportunities: strongPoints,
    risks: [
      'Customer habit inertia',
      'Willingness to pay unproven without formal commitment',
      'Cost of customer acquisition',
    ],
    assumptions: defaultTrackedAssumptions.map(a => a.assumption),
    questions: questionsToAsk,
    experiments,
    nextSteps: [
      'Log 5 customer discovery interviews in the Validation tab.',
      'Track key assumptions as Supported or Disproved.',
      'Test willingness to pay before investing in code.',
    ],
    problemSolution: {
      problemSummary: problem || 'Stated daily pain point.',
      solutionSummary: solution || 'Automated solution.',
      problemUrgency: problemClarityRating,
    },
    targetCustomers: {
      profile: customer || 'Target audience',
      verifiedSignals: verifiedFacts,
      unverifiedAssumptions: hypotheses,
    },
    competitorAnalysis: {
      directCompetitors: relevantCompetitors,
      indirectWorkarounds: existingAlternatives,
      switchingBarriers: [
        'Familiarity with existing manual routines',
        'Perceived effort of onboarding new software',
      ],
    },
  }

  // Synthesize Section 1-9 Overall Verdict
  basicAnalysis.overallVerdict = generateOverallVerdict(form, basicAnalysis, interviews, defaultTrackedAssumptions)

  return basicAnalysis
}
