import type {
  Analysis,
  CustomerInterview,
  Project,
  RecalculationDelta,
  TrackedAssumption,
  ValidationSprint,
  ValidationSprintTask,
} from '../types'

/**
 * Creates or derives a guided 7-day validation sprint from the project's deterministic evaluation.
 * Step 1 (Evaluation) is marked completed by default (endowed progress effect).
 */
export function generateInitialSprint(project: Project): ValidationSprint {
  const customer = project.analysis?.customerAnalysis.primarySegment || project.form.customer || 'target customer'
  const cleanCustomer = customer.split('(')[0].split('—')[0].trim() || 'target customer'
  const problemSnippet = (project.form.problem || project.form.description || 'this operational friction').slice(0, 60).trim()

  const tasks: ValidationSprintTask[] = [
    {
      id: 'step-1-eval',
      stepNumber: 1,
      title: 'Idea Evaluation Completed',
      description: 'Your startup idea has been evaluated using deterministic first-principles founder frameworks.',
      outcome: 'Full readiness baseline established with transparent assumption tracking.',
      status: 'Completed',
      estimatedEffort: 'Done',
      targetMetric: '1 evaluation completed',
      scriptTemplate: 'Deterministic evaluation report and initial risk matrix.',
      actionType: 'decision',
    },
    {
      id: 'step-2-beachhead',
      stepNumber: 2,
      title: 'Define your beachhead customer role',
      description: `Narrow your audience to a single specific role within ${cleanCustomer} who currently has budget or personal authority.`,
      outcome: 'Clear 1-sentence beachhead profile with verifiable qualification criteria.',
      status: 'Pending',
      estimatedEffort: '30 mins',
      targetMetric: '1 specific role chosen',
      scriptTemplate:
        `Beachhead Definition Guide:\n` +
        `• Who: ${cleanCustomer}\n` +
        `• Context: Experiences "${problemSnippet}" regularly.\n` +
        `• Disqualifiers: Anyone who encounters it less than monthly or lacks budget.\n` +
        `• Search filter: Exact job titles on LinkedIn/communities.`,
      actionType: 'assumption',
    },
    {
      id: 'step-3-contact',
      stepNumber: 3,
      title: `Source 15 potential interviewees`,
      description: `Find 15 prospective ${cleanCustomer} contacts across LinkedIn, relevant communities, or warm referrals.`,
      outcome: 'List of 15 named contacts with outreach messages sent.',
      status: 'Pending',
      estimatedEffort: '1–2 hours',
      targetMetric: '15 contacts reached',
      scriptTemplate:
        `Outreach Script (Strict Mom Test — no pitching!):\n` +
        `"Hi [Name], I'm researching how [their role] currently manage [specific pain point]. ` +
        `I am not selling anything—just doing 15-minute research calls to understand the hardest parts of your workflow. ` +
        `Would you have 15 minutes this Tuesday or Wednesday?"`,
      actionType: 'interview',
    },
    {
      id: 'step-4-interviews',
      stepNumber: 4,
      title: `Complete 5 discovery interviews`,
      description: `Run 5 structured 20-minute Mom Test interviews focused on past behavior and current workaround costs.`,
      outcome: '5 logged interviews in FOCAS verifying if this problem is a top-3 priority.',
      status: 'Pending',
      estimatedEffort: '2–3 hours',
      targetMetric: '5 interviews logged',
      scriptTemplate:
        `5 Essential Mom Test Questions:\n` +
        `1. When was the last time you dealt with this problem?\n` +
        `2. Can you walk me through what happened step-by-step?\n` +
        `3. What is the hardest part about how you solve it today?\n` +
        `4. What other tools or spreadsheets have you paid for to handle this?\n` +
        `5. Who holds the budget and sign-off authority for those tools?`,
      actionType: 'interview',
    },
    {
      id: 'step-5-assumptions',
      stepNumber: 5,
      title: 'Test critical assumptions against evidence',
      description: 'Review your logged interview notes and mark your problem and willingness-to-pay assumptions as Supported or Disproved.',
      outcome: 'Updated assumption statuses with direct customer quotes cited.',
      status: 'Pending',
      estimatedEffort: '30 mins',
      targetMetric: 'At least 2 assumptions tested',
      scriptTemplate:
        `Assumption Review Checklist:\n` +
        `• Supported: Customer gave specific past examples of spending real time or money.\n` +
        `• Disproved: Customer said "It's fine as-is" or praised the idea but never tried to fix it.\n` +
        `• Inconclusive: Need to probe deeper with budget holders.`,
      actionType: 'assumption',
    },
    {
      id: 'step-6-recalculate',
      stepNumber: 6,
      title: 'Recalculate your evaluation score',
      description: 'Run the deterministic recalculation engine to see how your empirical evidence updates your readiness score and verdict.',
      outcome: 'Transparent before/after delta showing exactly what progressed.',
      status: 'Pending',
      estimatedEffort: '1 min',
      targetMetric: 'Recalculation executed',
      scriptTemplate: 'Recalculates Readiness Index, updates decision gates, and generates your new next best action.',
      actionType: 'recalculate',
    },
    {
      id: 'step-7-decision',
      stepNumber: 7,
      title: 'Make your sprint decision: Build, Revise, or Stop',
      description: 'Review your updated verdict. If willingness to pay is verified, begin an MVP; if refuted, pivot cleanly without capital loss.',
      outcome: 'Clear founder commitment for the next 14 days.',
      status: 'Pending',
      estimatedEffort: '30 mins',
      targetMetric: 'Final sprint decision logged',
      scriptTemplate:
        `Sprint Decision Rules:\n` +
        `• BUILD: 3+ interviews confirmed willingness to pay, 0 disproved core assumptions.\n` +
        `• VALIDATE FIRST: Problem confirmed, but pricing pre-commitment unproven.\n` +
        `• REVISE / PIVOT: Target customer indifferent or workarounds are deemed completely sufficient.`,
      actionType: 'decision',
    },
  ]

  return {
    id: crypto.randomUUID(),
    title: '7-Day Customer Discovery Sprint',
    startedAt: new Date().toISOString(),
    targetDays: 7,
    status: 'Active',
    tasks,
  }
}

/**
 * Calculates sprint progress metrics.
 */
export function getSprintProgress(sprint?: ValidationSprint) {
  if (!sprint || !sprint.tasks || sprint.tasks.length === 0) {
    return {
      completedCount: 1,
      totalCount: 7,
      percent: 14,
      currentTask: undefined,
    }
  }

  const completedCount = sprint.tasks.filter(t => t.status === 'Completed').length
  const totalCount = sprint.tasks.length
  const percent = Math.round((completedCount / totalCount) * 100)
  const currentTask = sprint.tasks.find(t => t.status === 'Pending' || t.status === 'In Progress')

  return {
    completedCount,
    totalCount,
    percent,
    currentTask,
  }
}

export interface NextBestActionDetails {
  title: string
  action: string
  whyItMatters: string
  estimatedEffort: string
  completionTarget: string
  primaryButtonLabel: string
  primaryActionType: 'interview' | 'assumption' | 'report' | 'sprint' | 'recalculate'
  secondaryButtonLabel?: string
  scriptTemplate?: string
}

/**
 * Determines the single dominant Next Best Action based on the project's current validation state.
 */
export function determineNextBestAction(project: Project): NextBestActionDetails {
  const interviews = project.interviews || []
  const interviewCount = interviews.length
  const paidCount = interviews.filter(i => i.wouldPay).length
  const confirmedPainCount = interviews.filter(i => i.problemConfirmed).length
  const customer = project.analysis?.customerAnalysis.primarySegment || project.form.customer || 'target customer'
  const cleanCustomer = customer.split('(')[0].split('—')[0].trim() || 'target customer'
  const disprovedCount = (project.trackedAssumptions || []).filter(a => a.state === 'Disproved').length

  // Case 1: Core assumption disproved -> Pivot / Review
  if (disprovedCount >= 2) {
    return {
      title: 'Review Disproved Assumptions',
      action: 'Conduct debrief on refuted customer assumptions',
      whyItMatters: `${disprovedCount} core assumptions were refuted in customer testing. Pivoting now saves capital and development effort.`,
      estimatedEffort: '45 mins',
      completionTarget: 'Identify adjacent customer segment or adjusted problem focus',
      primaryButtonLabel: 'Review Assumptions',
      primaryActionType: 'assumption',
      secondaryButtonLabel: 'View Full Report',
    }
  }

  // Case 2: Zero interviews logged -> First discovery call
  if (interviewCount === 0) {
    return {
      title: 'Interview Your First Target Customer',
      action: `Conduct 1 discovery call with a prospective ${cleanCustomer}`,
      whyItMatters: 'Willingness to pay is currently 100% unproven. Talking to a real customer confirms if this pain is a priority.',
      estimatedEffort: '20 mins',
      completionTarget: 'Target: Complete interview 1 of 5',
      primaryButtonLabel: 'Log First Interview',
      primaryActionType: 'interview',
      secondaryButtonLabel: 'View Interview Script',
      scriptTemplate:
        `"When was the last time this problem occurred? Can you walk me through your workflow step-by-step, and what you paid to handle it?"`,
    }
  }

  // Case 3: Less than 5 interviews logged -> Complete the discovery quota
  if (interviewCount < 5) {
    const remaining = 5 - interviewCount
    return {
      title: `Interview ${remaining} more ${cleanCustomer}`,
      action: `Log ${remaining} more discovery interview${remaining > 1 ? 's' : ''}`,
      whyItMatters: `You have logged ${interviewCount} of 5 target discovery interviews (${confirmedPainCount} confirmed pain). ${remaining} more call${remaining > 1 ? 's' : ''} will complete this experiment.`,
      estimatedEffort: `${remaining * 25} mins total`,
      completionTarget: `${interviewCount}/5 interviews logged`,
      primaryButtonLabel: 'Log an Interview',
      primaryActionType: 'interview',
      secondaryButtonLabel: 'View Interview Questions',
      scriptTemplate:
        `"What is the most frustrating part of how you handle this today? What workarounds or spreadsheets do you currently use?"`,
    }
  }

  // Case 4: 5+ interviews logged, but willingness to pay unverified -> Test skin in the game
  if (paidCount === 0) {
    return {
      title: 'Test Financial Pre-Commitment',
      action: `Ask 2 interviewees for a refundable pilot deposit or signed Letter of Intent`,
      whyItMatters: `${confirmedPainCount} people confirmed the problem, but zero financial commitments are recorded. Verbal praise does not validate buying intent.`,
      estimatedEffort: '1–2 hours',
      completionTarget: 'Secure 1 pilot LOI or $20 deposit',
      primaryButtonLabel: 'Log Pre-Commitment Signal',
      primaryActionType: 'interview',
      secondaryButtonLabel: 'View LOI Template',
      scriptTemplate:
        `"We are onboarding 3 pilot teams to solve this workflow manually for 30 days. We ask for a refundable $50 pilot deposit to guarantee priority onboarding. Can we send an invoice?"`,
    }
  }

  // Case 5: Validated with willing buyers -> Build minimal core loop
  return {
    title: 'Scope the Minimal Core Loop MVP',
    action: 'Build the single core automation loop in 14 days',
    whyItMatters: `You have verified demand with ${paidCount} customers willing to pay. Avoid scope creep and deliver directly to your confirmed pilot users.`,
    estimatedEffort: '14-day build',
    completionTarget: 'Deliver core workflow output to confirmed pilot users',
    primaryButtonLabel: 'View MVP Scope',
    primaryActionType: 'report',
    secondaryButtonLabel: 'Recalculate Verdict',
  }
}

/**
 * Computes the before/after delta and generates a plain-language explanation.
 */
export function computeRecalculationDelta(
  oldAnalysis: Analysis | undefined,
  newAnalysis: Analysis,
  interviews: CustomerInterview[],
  assumptions: TrackedAssumption[]
): RecalculationDelta {
  const scoreBefore = oldAnalysis?.score ?? 25
  const scoreAfter = newAnalysis.score
  const verdictBefore = oldAnalysis?.overallVerdict?.decision ?? 'VALIDATE FIRST'
  const verdictAfter = newAnalysis.overallVerdict?.decision ?? 'VALIDATE FIRST'

  const painCount = interviews.filter(i => i.problemConfirmed).length
  const wouldPayCount = interviews.filter(i => i.wouldPay).length
  const disprovedCount = assumptions.filter(a => a.state === 'Disproved').length

  const problemEvidenceBefore = (oldAnalysis?.interviewsSummary?.problemConfirmedCount ?? 0) > 0 ? 'Moderate' : 'Unproven'
  const problemEvidenceAfter = painCount >= 3 ? 'Strong' : painCount >= 1 ? 'Moderate' : 'Unproven'

  const willingnessToPayBefore = (oldAnalysis?.interviewsSummary?.wouldPayCount ?? 0) > 0 ? 'Validated' : 'Unproven'
  const willingnessToPayAfter = wouldPayCount >= 2 ? 'Validated' : wouldPayCount === 1 ? 'Early Signal' : 'Unproven'

  // Construct precise, honest plain-language explanation
  let explanation = ''
  if (scoreAfter > scoreBefore) {
    const diff = scoreAfter - scoreBefore
    explanation = `Your Readiness Index increased by +${diff} points (from ${scoreBefore} to ${scoreAfter}). `
    if (painCount > (oldAnalysis?.interviewsSummary?.problemConfirmedCount ?? 0)) {
      explanation += `${painCount} of ${interviews.length} target customers confirmed experiencing acute pain in logged interviews. `
    }
    if (wouldPayCount > 0 && wouldPayCount > (oldAnalysis?.interviewsSummary?.wouldPayCount ?? 0)) {
      explanation += `${wouldPayCount} customer(s) verified willingness to allocate budget. `
    } else {
      explanation += `The score did not increase further for willingness to pay because no direct financial commitment has been recorded yet.`
    }
  } else if (scoreAfter < scoreBefore) {
    const diff = scoreBefore - scoreAfter
    explanation = `Your Readiness Index decreased by -${diff} points (from ${scoreBefore} to ${scoreAfter}). `
    if (disprovedCount > 0) {
      explanation += `${disprovedCount} assumption(s) were flagged as disproved in recent customer validation, protecting you from building features users do not want.`
    }
  } else {
    explanation = `Your score remained at ${scoreAfter}/100. New evidence was logged, but core commercial willingness to pay remains untested.`
  }

  const affectedAssumptions = assumptions
    .filter(a => a.state !== 'Untested')
    .map(a => `${a.category}: ${a.assumption} (${a.state})`)

  const nextAction = newAnalysis.overallVerdict?.singleMostImportantNextAction || 'Continue customer discovery calls.'

  return {
    timestamp: new Date().toISOString(),
    scoreBefore,
    scoreAfter,
    verdictBefore,
    verdictAfter,
    problemEvidenceBefore,
    problemEvidenceAfter,
    willingnessToPayBefore,
    willingnessToPayAfter,
    plainEnglishExplanation: explanation,
    affectedAssumptions,
    newNextBestAction: nextAction,
  }
}

/**
 * Generates weekly founder review summary.
 */
export function generateWeeklyReviewSummary(project: Project): {
  headline: string
  interviewsSummary: string
  problemStatus: string
  pricingStatus: string
  biggestRisk: string
  nextWeekGoal: string
} {
  const interviews = project.interviews || []
  const painCount = interviews.filter(i => i.problemConfirmed).length
  const wouldPayCount = interviews.filter(i => i.wouldPay).length
  const biggestConcern = project.analysis?.overallVerdict?.biggestConcern || 'Habit inertia and unknown willingness to pay.'

  return {
    headline: `Weekly Founder Review: ${project.form.name || 'Startup Project'}`,
    interviewsSummary: `${interviews.length} total interview(s) logged (${painCount} confirmed pain, ${wouldPayCount} willing to pay).`,
    problemStatus: painCount >= 3 ? 'Problem Acute & Verified' : painCount >= 1 ? 'Early Problem Signals' : 'Problem Still Unproven',
    pricingStatus: wouldPayCount >= 2 ? 'Validated Willingness to Pay' : 'Willingness to Pay Unproven',
    biggestRisk: biggestConcern,
    nextWeekGoal: wouldPayCount === 0 ? 'Secure 1 pilot pre-order or deposit' : 'Deliver manual concierge solution to 2 test users',
  }
}
