import type { CustomerInterview, TrackedAssumption } from '../../types'
import type { UnderstoodIdea } from './ideaUnderstanding'
import { getFrameworkById } from './knowledgeLibrary'

export interface CustomerAnalysisResult {
  primarySegment: string
  secondarySegment: string
  needsAndMotivations: string
  earlyAdopters: string
  unlikelyUsersAndWhy: string
  verifiedFacts: string[]
  hypotheses: string[]
  momTestQuestions: string[]
}

/**
 * Module 4: Customer Analysis
 * Defines the initial beachhead segment and prepares customer-discovery interviews.
 */
export function analyzeCustomer(
  understood: UnderstoodIdea,
  interviews: CustomerInterview[] = [],
  trackedAssumptions: TrackedAssumption[] = []
): CustomerAnalysisResult {
  const customer = understood.cleanCustomer || 'Target buyer'
  const segment = understood.cleanSegment || 'Early adopters'
  const isB2B = understood.signals.isB2B

  const primarySegment = understood.signals.hasSpecificCustomer
    ? `${customer} — specifically ${segment}`
    : `${customer} (Warning: Too broad. Must be narrowed to a specific role with purchasing budget).`

  const secondarySegment = isB2B
    ? `Mid-market managers who experience similar coordination friction but have longer procurement cycles.`
    : `Adjacent casual users who experience the issue infrequently.`

  const needsAndMotivations = isB2B
    ? `Needs to eliminate recurring manual errors, protect project deadlines, and avoid reporting delays to senior stakeholders.`
    : `Needs a simple, frictionless way to resolve this issue without enduring complicated setups or hidden recurring costs.`

  const earlyAdopters = isB2B
    ? `Operators, team leads, or solo founders in ${segment} who currently spend >3 hours/week doing this manually and have corporate credit card signing authority.`
    : `Power users who actively complain about this problem on forums, Reddit, or social media and have already tried 2+ makeshift solutions.`

  const unlikelyUsersAndWhy = isB2B
    ? `Enterprise companies with strict SOC2/procurement requirements, or teams where the task occurs less than once per quarter.`
    : `Casual users who only encounter this issue once a year and find existing free tools or doing nothing completely acceptable.`

  // Separate Verified Facts from Hypotheses
  const verifiedFacts: string[] = []
  const hypotheses: string[] = []

  if (interviews.length > 0) {
    const paidCount = interviews.filter(i => i.wouldPay).length
    const painCount = interviews.filter(i => i.problemConfirmed).length
    verifiedFacts.push(
      `Logged ${interviews.length} customer interview(s): ${painCount} confirmed pain, ${paidCount} expressed budget/intent to pay.`
    )
    const workaroundsRecorded = interviews
      .map(i => i.currentWorkaround)
      .filter(w => w && w.length > 3)
    if (workaroundsRecorded.length > 0) {
      verifiedFacts.push(`Observed real workarounds in interviews: "${workaroundsRecorded.slice(0, 2).join('", "')}"`)
    }
  }

  if (understood.signals.hasQuantifiedDemand) {
    verifiedFacts.push(`Founder-reported demand indicator: "${understood.cleanDemand.slice(0, 140)}"`)
  }

  if (interviews.length === 0) {
    hypotheses.push('Customer willingness to pay is 100% unproven. No interviews or pre-orders recorded yet.')
  }
  hypotheses.push(`Assumption: ${customer} considers this problem a top-3 priority this quarter.`)
  hypotheses.push(`Assumption: The user experiencing the pain has direct authority or influence to adopt a new tool.`)

  const disprovedCustAssumptions = trackedAssumptions.filter(
    a => a.category === 'Customer' && a.state === 'Disproved'
  )
  disprovedCustAssumptions.forEach(da => {
    hypotheses.push(`FLAGGED DISPROVED ASSUMPTION: "${da.assumption}"`)
  })

  // 5 Mom Test Questions (Deterministic, non-leading)
  const momTestQuestions = [
    `1. "When was the last time you encountered [${understood.cleanProblem.slice(0, 50)}...]? Can you walk me through what happened step-by-step?"`,
    `2. "What are you currently doing today to handle or work around that problem? Which tools or spreadsheets do you use?"`,
    `3. "What is the hardest or most frustrating part about the way you solve it right now?"`,
    `4. "What other solutions or software have you actively evaluated or paid for to fix this in the past 12 months?"`,
    `5. "Where did the budget come from for those tools, and who had to sign off on the decision?"`,
  ]

  return {
    primarySegment,
    secondarySegment,
    needsAndMotivations,
    earlyAdopters,
    unlikelyUsersAndWhy,
    verifiedFacts,
    hypotheses,
    momTestQuestions,
  }
}
