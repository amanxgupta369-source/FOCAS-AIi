import type { CustomerInterview, TrackedAssumption } from '../../types'
import type { UnderstoodIdea } from './ideaUnderstanding'
import { getFrameworkById } from './knowledgeLibrary'

export interface ProblemValidationAnalysis {
  exactProblem: string
  whoExperiencesIt: string
  whenAndWhy: string
  currentWorkarounds: string
  evidenceStatus: string
  unverifiedAspects: string
  acuityScore: number // 0-100 heuristic
  acuityClassification: 'Hair on Fire' | 'Moderate Operational Friction' | 'Nice to Have (Vitamin)' | 'Unclear / Low Pain'
  severityDrivers: string[]
  urgencyRationale: string
}

/**
 * Module 3: Problem Validation
 * Evaluates frequency, severity, urgency, and current workarounds.
 */
export function validateProblem(
  understood: UnderstoodIdea,
  interviews: CustomerInterview[] = [],
  trackedAssumptions: TrackedAssumption[] = []
): ProblemValidationAnalysis {
  const fw = getFrameworkById('problem-validation-hair-on-fire')
  const problemText = understood.cleanProblem
  const customerText = understood.cleanCustomer
  const workaround = understood.cleanWorkaround

  // Evaluate Severity Drivers
  const severityDrivers: string[] = []
  let severityWeight = 0

  if (understood.signals.isB2B) {
    if (/lost\s+revenue|missed\s+deals|churn|sales/i.test(problemText)) {
      severityDrivers.push('Direct revenue loss or missed sales opportunities')
      severityWeight += 30
    }
    if (/compliance|audit|fine|legal|gdpr|tax|law/i.test(problemText)) {
      severityDrivers.push('Regulatory compliance or legal penalty exposure')
      severityWeight += 35
    }
    if (/hours|manual|repetitive|data\s+entry|tedious|slow/i.test(problemText)) {
      severityDrivers.push('Severe labor overhead and high payroll hours spent on repetitive manual work')
      severityWeight += 25
    }
    if (/error|mistake|bug|inaccura|fail/i.test(problemText)) {
      severityDrivers.push('High operational error rates causing customer escalation')
      severityWeight += 20
    }
  } else {
    // Consumer
    if (/anxiety|stress|scared|frustrat|overwhelm/i.test(problemText)) {
      severityDrivers.push('Acute personal stress and emotional friction')
      severityWeight += 25
    }
    if (/expensive|waste\s+money|overcharg|costly/i.test(problemText)) {
      severityDrivers.push('Direct out-of-pocket financial strain')
      severityWeight += 30
    }
    if (/wasted\s+time|waiting|hours\s+looking/i.test(problemText)) {
      severityDrivers.push('Significant personal time wasted on recurring task')
      severityWeight += 20
    }
  }

  // Frequency Factor
  let frequencyWeight = 10
  if (understood.frequencyCategory === 'Daily') {
    frequencyWeight = 30
    severityDrivers.push('High frequency (Daily pain: users encounter it during daily workflows)')
  } else if (understood.frequencyCategory === 'Weekly') {
    frequencyWeight = 20
    severityDrivers.push('Moderate frequency (Weekly pain: happens regularly enough to form software habits)')
  } else if (understood.frequencyCategory === 'Monthly') {
    frequencyWeight = 10
  } else {
    severityDrivers.push('Unspecified frequency: rare or episodic pain is hard to monetize as ongoing subscription')
  }

  // Workaround Factor
  let workaroundWeight = 10
  if (understood.signals.hasIdentifiedAlternatives) {
    workaroundWeight = 25
    severityDrivers.push(`Active workarounds observed: "${workaround.slice(0, 100)}" proves people are already trying to solve it`)
  }

  // Recorded Evidence Adjustments
  let evidenceBonus = 0
  const confirmedInterviews = interviews.filter(i => i.problemConfirmed)
  if (confirmedInterviews.length > 0) {
    evidenceBonus += Math.min(25, confirmedInterviews.length * 8)
  }

  const disprovedProblemAssumptions = trackedAssumptions.filter(
    a => a.category === 'Problem' && a.state === 'Disproved'
  )
  if (disprovedProblemAssumptions.length > 0) {
    evidenceBonus -= disprovedProblemAssumptions.length * 20
  }

  // Calculate Raw Acuity (Heuristic index)
  let rawScore = 15 + severityWeight * 0.4 + frequencyWeight + workaroundWeight + evidenceBonus
  rawScore = Math.max(10, Math.min(95, Math.round(rawScore)))

  let classification: 'Hair on Fire' | 'Moderate Operational Friction' | 'Nice to Have (Vitamin)' | 'Unclear / Low Pain'
  if (rawScore >= 75) {
    classification = 'Hair on Fire'
  } else if (rawScore >= 50) {
    classification = 'Moderate Operational Friction'
  } else if (rawScore >= 30) {
    classification = 'Nice to Have (Vitamin)'
  } else {
    classification = 'Unclear / Low Pain'
  }

  const whenAndWhy = understood.frequencyCategory !== 'Unstated'
    ? `Occurs on a ${understood.frequencyCategory.toLowerCase()} basis when ${customerText || 'target users'} execute their standard workflows.`
    : `Occurs when ${customerText || 'users'} attempt to complete tasks, but exact triggering frequency requires customer discovery.`

  const evidenceStatus = interviews.length > 0
    ? `${interviews.length} discovery interviews logged. ${confirmedInterviews.length} confirmed acute pain. Disproved problem assumptions: ${disprovedProblemAssumptions.length}.`
    : 'Hypothesis only. No customer discovery interviews or recorded evidence have been logged yet.'

  const unverifiedAspects = disprovedProblemAssumptions.length > 0
    ? `Warning: ${disprovedProblemAssumptions.length} problem assumption(s) were flagged as disproved in your validation log.`
    : 'Whether users care enough to spend money to solve this, or will continue using existing free workarounds.'

  const urgencyRationale =
    `${classification} (${rawScore}/100 Acuity Index). Based on framework "${fw?.title || 'Hair-on-Fire'}", ` +
    (classification === 'Hair on Fire'
      ? 'customers are actively looking for solutions and currently losing tangible resources to this problem.'
      : classification === 'Moderate Operational Friction'
        ? 'the pain exists, but customers may tolerate it using existing spreadsheets or manual routines unless switching is effortless.'
        : 'this appears to be a vitamin (nice-to-have) rather than a painkiller. You must interview target buyers to determine if inaction costs them real money.')

  return {
    exactProblem: problemText || 'Problem statement not specified by founder.',
    whoExperiencesIt: customerText || 'Target group not clearly specified.',
    whenAndWhy,
    currentWorkarounds: workaround || 'Unspecified (by default, manual effort, spreadsheets, or doing nothing).',
    evidenceStatus,
    unverifiedAspects,
    acuityScore: rawScore,
    acuityClassification: classification,
    severityDrivers,
    urgencyRationale,
  }
}
