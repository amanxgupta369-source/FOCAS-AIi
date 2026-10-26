import type { CustomerInterview, TrackedAssumption } from '../../types'
import type { UnderstoodIdea } from './ideaUnderstanding'
import type { ProblemValidationAnalysis } from './problemValidation'

export interface DecisionEngineResult {
  decision: 'BUILD' | 'VALIDATE FIRST' | 'RETHINK' | "DON'T PURSUE THIS VERSION"
  finalRecommendationVerdict: 'VALIDATE' | 'PROCEED WITH A SMALL MVP' | 'REVISE' | 'STOP OR RECONSIDER'
  conciseExplanation: string
  verdictReasoning: string
  strongestReason: string
  biggestConcern: string
  singleMostImportantNextAction: string
  readinessScore: number
  scoreBreakdown: {
    basePoints: number
    problemClarityBonus: number
    customerSpecificityBonus: number
    workaroundIdentifiedBonus: number
    competitorsBonus: number
    revenueModelBonus: number
    interviewEvidenceBonus: number
    disprovedDeduction: number
    explanation: string
  }
  strongestArgumentsFor: string[]
  strongestObjections: string[]
  criticalAssumption: {
    assumption: string
    whyBusinessDependsOnIt: string
    ifFalseConsequence: string
    cheapestTest: string
    positiveSignalMeaning: string
    negativeSignalMeaning: string
    inconclusiveSignalMeaning: string
    verdictAdjustmentOnResults: string
  }
  whatWouldChangeVerdict: {
    moreConfidentConditions: string[]
    lessConfidentConditions: string[]
    changeCustomerConditions: string[]
    changeSolutionConditions: string[]
    stopConditions: string[]
  }
}

/**
 * Module 11: Decision Engine
 * Transparent, deterministic decision framework that evaluates inputs and empirical evidence.
 */
export function evaluateDecision(
  understood: UnderstoodIdea,
  problemAnalysis: ProblemValidationAnalysis,
  interviews: CustomerInterview[] = [],
  trackedAssumptions: TrackedAssumption[] = []
): DecisionEngineResult {
  const customer = understood.cleanCustomer || 'target customer'
  const problem = understood.cleanProblem
  const workaround = understood.cleanWorkaround
  const model = understood.cleanModel

  const interviewCount = interviews.length
  const confirmedPainInterviews = interviews.filter(i => i.problemConfirmed)
  const wouldPayInterviews = interviews.filter(i => i.wouldPay)

  const disprovedAssumptions = trackedAssumptions.filter(a => a.state === 'Disproved')
  const supportedAssumptions = trackedAssumptions.filter(a => a.state === 'Supported')

  // Transparent Scoring Breakdown
  const basePoints = 25
  let problemClarityBonus = 0
  if (understood.signals.hasPainTrigger) problemClarityBonus += 10
  if (understood.frequencyCategory === 'Daily' || understood.frequencyCategory === 'Weekly') problemClarityBonus += 5

  let customerSpecificityBonus = 0
  if (understood.signals.hasSpecificCustomer) customerSpecificityBonus += 10

  let workaroundIdentifiedBonus = 0
  if (understood.signals.hasIdentifiedAlternatives) workaroundIdentifiedBonus += 10

  let competitorsBonus = 0
  if (understood.signals.hasCompetitorsListed) competitorsBonus += 5

  let revenueModelBonus = 0
  if (understood.signals.hasDefinedRevenueModel) revenueModelBonus += 5

  let interviewEvidenceBonus = 0
  if (interviewCount >= 1) interviewEvidenceBonus += 5
  if (interviewCount >= 3) interviewEvidenceBonus += 5
  if (wouldPayInterviews.length >= 1) interviewEvidenceBonus += 10
  if (wouldPayInterviews.length >= 3) interviewEvidenceBonus += 10
  if (supportedAssumptions.length >= 1) interviewEvidenceBonus += 5

  let disprovedDeduction = 0
  if (disprovedAssumptions.length > 0) {
    disprovedDeduction = Math.min(30, disprovedAssumptions.length * 15)
  }

  let totalScore =
    basePoints +
    problemClarityBonus +
    customerSpecificityBonus +
    workaroundIdentifiedBonus +
    competitorsBonus +
    revenueModelBonus +
    interviewEvidenceBonus -
    disprovedDeduction

  totalScore = Math.max(15, Math.min(95, Math.round(totalScore)))

  const scoreExplanation =
    `Readiness Index: ${totalScore}/100. (Note: This is an evidence-completeness heuristic, not a guarantee of commercial success). ` +
    `Base: ${basePoints}pts | Problem Clarity: +${problemClarityBonus} | Target Customer: +${customerSpecificityBonus} | ` +
    `Current Workaround Mapped: +${workaroundIdentifiedBonus} | Commercial Model: +${revenueModelBonus} | ` +
    `Logged Evidence: +${interviewEvidenceBonus} | Disproved Assumptions: -${disprovedDeduction}.`

  // Decision Tree Logic
  let decision: 'BUILD' | 'VALIDATE FIRST' | 'RETHINK' | "DON'T PURSUE THIS VERSION" = 'VALIDATE FIRST'
  let finalRecommendationVerdict: 'VALIDATE' | 'PROCEED WITH A SMALL MVP' | 'REVISE' | 'STOP OR RECONSIDER' = 'VALIDATE'
  let conciseExplanation = ''
  let verdictReasoning = ''
  let strongestReason = ''
  let biggestConcern = ''

  if (disprovedAssumptions.length >= 2 || (interviewCount >= 3 && confirmedPainInterviews.length === 0)) {
    decision = "DON'T PURSUE THIS VERSION"
    finalRecommendationVerdict = 'STOP OR RECONSIDER'
    conciseExplanation = 'Recorded evidence contradicts core assumptions. Pivoting now will save capital and time.'
    strongestReason = 'Direct user feedback has invalidated problem severity or willingness to pay.'
    biggestConcern = 'Continuing to build code on a refuted foundation risks building software nobody adopts.'
    verdictReasoning =
      `Based on ${interviewCount} logged interview(s) and ${disprovedAssumptions.length} disproved assumption(s), ` +
      `customer testing indicates that the current value proposition does not trigger sufficient buying intent. ` +
      `Do not invest engineering time into building this specific iteration. Identify an adjacent segment or reframe the core problem.`
  } else if (!understood.signals.hasSpecificCustomer || problem.length < 25) {
    decision = 'RETHINK'
    finalRecommendationVerdict = 'REVISE'
    conciseExplanation = 'Problem or target customer remains too broad. Clarify the beachhead before building.'
    strongestReason = 'A sharp value proposition requires a specific customer experiencing acute pain.'
    biggestConcern = 'Broad concepts fail to resonate with early adopters and make customer acquisition impossible.'
    verdictReasoning =
      'The current idea description lacks sufficient specificity regarding the target buyer or the measurable pain. ' +
      'Narrow your target segment to a specific role with budget authority and redefine the problem with measurable metrics.'
  } else if (interviewCount >= 3 && wouldPayInterviews.length >= 2 && disprovedAssumptions.length === 0) {
    decision = 'BUILD'
    finalRecommendationVerdict = 'PROCEED WITH A SMALL MVP'
    conciseExplanation = 'Verified customer willingness to pay with zero disproved critical assumptions. Build the core loop MVP.'
    strongestReason = `${wouldPayInterviews.length} target customers confirmed willingness to pay in structured discovery interviews.`
    biggestConcern = 'Scope creep during build phase delaying delivery to eager pilot customers.'
    verdictReasoning =
      `You have verified genuine willingness to pay with ${wouldPayInterviews.length} prospective buyers. ` +
      `Build the smallest possible functional MVP within 14 to 21 days and onboard your pilot users manually.`
  } else {
    decision = 'VALIDATE FIRST'
    finalRecommendationVerdict = 'VALIDATE'
    conciseExplanation = 'Concept has logical merit, but customer willingness to pay is unproven. Validate before coding.'
    strongestReason = 'The problem appears logically plausible, but requires real-world confirmation.'
    biggestConcern = 'Building automated software for a problem customers might tolerate with free spreadsheets.'
    verdictReasoning =
      `The startup idea presents a coherent narrative, but customer demand remains hypothetical. ` +
      `With ${interviewCount} interview(s) logged, your immediate objective is to complete 5 customer discovery calls ` +
      `and test skin-in-the-game pre-commitments before writing software.`
  }

  const singleMostImportantNextAction =
    decision === 'BUILD'
      ? 'Build the minimal core loop in 14 days and onboard your 2 confirmed test users.'
      : decision === 'DON\'T PURSUE THIS VERSION'
        ? 'Conduct a debrief on disproved assumptions and brainstorm adjacent customer segments.'
        : `Conduct 5 Mom Test discovery calls with ${customer} to test willingness to pay.`

  // Strongest Arguments For & Objections
  const strongestArgumentsFor: string[] = []
  if (understood.signals.hasPainTrigger) {
    strongestArgumentsFor.push('Addresses a concrete, recognizable operational friction point.')
  }
  if (understood.signals.hasSpecificCustomer) {
    strongestArgumentsFor.push(`Specifically targets ${understood.cleanCustomer} (${understood.cleanSegment}).`)
  }
  if (understood.signals.hasIdentifiedAlternatives) {
    strongestArgumentsFor.push(`Identified existing workflow: "${workaround.slice(0, 80)}" proves users are currently spending effort on this.`)
  }
  if (wouldPayInterviews.length > 0) {
    strongestArgumentsFor.push(`${wouldPayInterviews.length} customer(s) verified willingness to pay in recorded interviews.`)
  }
  if (strongestArgumentsFor.length === 0) {
    strongestArgumentsFor.push('Clean slate idea with high flexibility to pivot before incurring capital expense.')
  }

  const strongestObjections: string[] = []
  if (interviews.length === 0) {
    strongestObjections.push('Zero customer discovery interviews logged. Willingness to pay is completely unproven.')
  }
  if (understood.frequencyCategory === 'Unstated' || understood.frequencyCategory === 'Rare') {
    strongestObjections.push('Problem frequency is unstated or episodic; rare pain struggles to sustain recurring subscription models.')
  }
  strongestObjections.push(`Habit inertia: Users may prefer continuing to use ${workaround || 'spreadsheets and email'} for $0 rather than learning a new tool.`)
  if (disprovedAssumptions.length > 0) {
    strongestObjections.push(`Critical warning: ${disprovedAssumptions.length} tracked assumption(s) were flagged as disproved in validation testing.`)
  }

  // The Critical Assumption
  const criticalAssumption = {
    assumption: `${customer} experiences this problem acutely enough that they will pay money to replace ${workaround || 'their current routine'}.`,
    whyBusinessDependsOnIt: 'If customers are content using free manual workarounds, your customer acquisition cost will far exceed lifetime value.',
    ifFalseConsequence: 'High customer churn, polite rejections during sales outreach, and failure to reach default alive.',
    cheapestTest: 'Ask 3 customers for a refundable $20 deposit or a non-binding Letter of Intent before building.',
    positiveSignalMeaning: 'Customers agree and provide financial/reputational commitment -> Proceed to BUILD immediately.',
    negativeSignalMeaning: 'Customers praise the idea but refuse to commit -> Problem is a vitamin, not a painkiller.',
    inconclusiveSignalMeaning: 'Customers say "Check back with me when you launch" -> Standard polite brush-off. Probe for real workflow costs.',
    verdictAdjustmentOnResults: 'Securing 2 deposits shifts verdict to BUILD; 5 consecutive rejections shifts verdict to STOP / PIVOT.',
  }

  // What Would Change the Verdict?
  const whatWouldChangeVerdict = {
    moreConfidentConditions: [
      '3 prospective customers sign an LOI or pay a refundable pilot deposit.',
      'Customer interviews reveal that inaction currently costs them >$500/month or >5 hours/week.',
      'A targeted outbound campaign achieves >10% response rate for discovery calls.',
    ],
    lessConfidentConditions: [
      '5 discovery interviews reveal customers are satisfied with their current spreadsheet workarounds.',
      'Target users state they have zero discretionary software budget and cannot authorize purchases.',
      'A dominant competitor offers a free native integration that solves the core pain.',
    ],
    changeCustomerConditions: [
      'If individual contributors love the tool but managers refuse to pay, pivot directly to prosumer self-serve or a different department.',
      'If small businesses lack budget, test whether mid-market enterprise teams have the same pain with 10x higher budgets.',
    ],
    changeSolutionConditions: [
      'If building the automated software takes >6 weeks, pivot to an automated workflow template, manual concierge service, or spreadsheet plugin.',
    ],
    stopConditions: [
      'Zero prospective customers in 10 interviews identify this problem as one of their top-3 priorities.',
      'Prospects refuse to use the solution even when offered a free manual concierge service.',
    ],
  }

  return {
    decision,
    finalRecommendationVerdict,
    conciseExplanation,
    verdictReasoning,
    strongestReason,
    biggestConcern,
    singleMostImportantNextAction,
    readinessScore: totalScore,
    scoreBreakdown: {
      basePoints,
      problemClarityBonus,
      customerSpecificityBonus,
      workaroundIdentifiedBonus,
      competitorsBonus,
      revenueModelBonus,
      interviewEvidenceBonus,
      disprovedDeduction,
      explanation: scoreExplanation,
    },
    strongestArgumentsFor,
    strongestObjections,
    criticalAssumption,
    whatWouldChangeVerdict,
  }
}
