import type { IdeaForm } from '../../types'
import type { UnderstoodIdea } from './ideaUnderstanding'
import { getFrameworkById } from './knowledgeLibrary'

export interface MissingInfoAnalysis {
  missingMaterialInfo: string[]
  focusedFollowUpQuestions: string[]
  limitationsNotice: string
  completenessRating: 'Complete' | 'Sufficient for Validation' | 'Critically Incomplete'
}

/**
 * Module 2: Missing Information Detection
 * Detects gaps in the founder's submission instead of assuming or hallucinating details.
 */
export function detectMissingInformation(
  form: IdeaForm,
  understood: UnderstoodIdea
): MissingInfoAnalysis {
  const missing: string[] = []
  const questions: string[] = []

  // Check Problem Depth
  if (!understood.signals.hasPainTrigger && understood.cleanProblem.length < 50) {
    missing.push('The problem statement lacks quantifiable pain (cost, time wasted, compliance penalties, or error rate).')
    questions.push('What specific measurable metric breaks or costs money for your customer when this problem happens?')
  }

  // Check Frequency
  if (!understood.frequencyCategory || understood.frequencyCategory === 'Unstated') {
    missing.push('Exact problem frequency (daily, weekly, monthly, annual) is unstated.')
    questions.push('How frequently does the target customer run into this pain: multiple times a day, once a week, or once a year?')
  }

  // Check Customer Specificity
  if (!understood.signals.hasSpecificCustomer) {
    missing.push('The target customer is defined too broadly (e.g. "everyone", "businesses", or "students").')
    questions.push('If you could only sell to 10 specific people next week, who exactly has their job on the line if this problem is not solved?')
  }

  // Check Alternatives / Workaround
  if (!understood.signals.hasIdentifiedAlternatives) {
    missing.push('How customers currently cope with this problem today (spreadsheets, manual staff, doing nothing) is not documented.')
    questions.push('What is the customer currently doing right now to solve or tolerate this problem before buying your product?')
  }

  // Check Costs / Resources
  if (!understood.signals.hasCostEstimate) {
    missing.push('Operating costs, hosting budget, regulatory compliance, or third-party API costs are unspecified.')
    questions.push('What is your available budget and maximum monthly server/operational cost allowance for the first 6 months?')
  }

  // Check Prior Experiments / Real Demand
  if (!understood.signals.hasQuantifiedDemand && !form.priorExperiments) {
    missing.push('No historical customer validation, interviews, waitlist signups, or pre-orders were provided.')
    questions.push('Have you spoken to at least 5 potential customers who experienced this problem in the past 30 days without pitching your idea?')
  }

  // Framework reference
  const momTestFramework = getFrameworkById('customer-discovery-mom-test')
  if (momTestFramework) {
    questions.push(`Rule from ${momTestFramework.title}: Avoid asking "Would you buy this?" Ask instead: "How much did you spend the last time this happened?"`)
  }

  const completenessRating: 'Complete' | 'Sufficient for Validation' | 'Critically Incomplete' =
    missing.length === 0
      ? 'Complete'
      : missing.length <= 3
        ? 'Sufficient for Validation'
        : 'Critically Incomplete'

  const limitationsNotice =
    'Notice: FOCAS evaluates startup ideas using deterministic first-principles frameworks (The Mom Test, Lean Customer Development, Unit Economics). ' +
    'Missing inputs are flagged above rather than filled with AI guesswork. An idea evaluation can only be as accurate as the customer evidence you provide.'

  return {
    missingMaterialInfo: missing,
    focusedFollowUpQuestions: questions,
    limitationsNotice,
    completenessRating,
  }
}
