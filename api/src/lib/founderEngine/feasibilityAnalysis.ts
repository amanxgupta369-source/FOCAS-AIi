import type { UnderstoodIdea } from './ideaUnderstanding'
import { getFrameworkById } from './knowledgeLibrary'

export interface FeasibilityAnalysisResult {
  howItWorks: string
  featureMapping: { feature: string; problemSolved: string }[]
  mvpScope: string
  buildFirst: string[]
  postpone: string[]
  adoptionChallenges: string
  complexityScore: number // 1-10
  complexityLevel: 'Low' | 'Medium' | 'High' | 'Extreme'
  estimatedTimeToMvpWeeks: number
}

/**
 * Module 6: Product Feasibility Analysis
 * Evaluates operational complexity, MVP scoping, and what to postpone.
 */
export function analyzeFeasibility(
  understood: UnderstoodIdea
): FeasibilityAnalysisResult {
  const fw = getFrameworkById('product-feasibility-mvp-scope')
  const solutionText = understood.cleanSolution || 'Proposed solution'
  const problemText = understood.cleanProblem
  const isMarketplace = understood.signals.isMarketplace

  let complexityScore = 3
  const complexityFactors: string[] = []

  if (isMarketplace) {
    complexityScore += 4
    complexityFactors.push('Marketplace / Multi-sided network: requires bootstrapping both buyers and sellers simultaneously.')
  }

  if (/hardware|device|sensor|physical|manufacturing/i.test(solutionText)) {
    complexityScore += 4
    complexityFactors.push('Physical/Hardware dependencies introduce supply chain and high capital requirements.')
  }

  if (/ai|llm|deep learning|vision|neural/i.test(solutionText)) {
    complexityScore += 2
    complexityFactors.push('Machine learning/AI pipeline dependencies increase inference cost and non-deterministic error rates.')
  }

  if (/blockchain|crypto|web3/i.test(solutionText)) {
    complexityScore += 2
  }

  if (/hipaa|healthcare|banking|financial|fintech|compliance/i.test(solutionText + problemText)) {
    complexityScore += 3
    complexityFactors.push('Regulated industry (FinTech/HealthTech) requiring formal compliance or licensing.')
  }

  complexityScore = Math.max(2, Math.min(10, complexityScore))

  let complexityLevel: 'Low' | 'Medium' | 'High' | 'Extreme' = 'Low'
  if (complexityScore >= 8) complexityLevel = 'Extreme'
  else if (complexityScore >= 6) complexityLevel = 'High'
  else if (complexityScore >= 4) complexityLevel = 'Medium'

  const estimatedTimeToMvpWeeks = complexityScore <= 3 ? 2 : complexityScore <= 5 ? 4 : complexityScore <= 7 ? 8 : 16

  // Feature Mapping
  const featureMapping = [
    {
      feature: 'Core Workflow Automation / Interface',
      problemSolved: `Solves the primary bottleneck: ${problemText.slice(0, 80) || 'the acute operational pain'}`,
    },
    {
      feature: 'Direct Export / Notification / Action Trigger',
      problemSolved: 'Ensures the user receives immediate value output without manual copy-pasting',
    },
  ]

  // Scoping: What to build first vs what to postpone (Lean MVP principle)
  const buildFirst: string[] = [
    'The single core loop that delivers the promised outcome (even if backend logic is manually assisted by the founder).',
    'Simple web-based input form or interface where the user submits their data.',
    'Clear output deliverable or report that solves the customer\'s specific pain.',
    'Direct communication or feedback channel with the founder for real-time onboarding.',
  ]

  const postpone: string[] = [
    'Native iOS / Android mobile apps (start with a responsive web app or mobile browser view).',
    'Self-service automated team billing and enterprise SSO / SAML.',
    'Multi-tenant role permissions and granular audit logging (until enterprise pilots demand it).',
    'Complex analytics dashboards and decorative visual customizers.',
    'Custom AI model training or proprietary infrastructure (use deterministic business logic first).',
  ]

  const mvpScope =
    `Estimated Complexity: ${complexityLevel} (${complexityScore}/10). Target launch window: ~${estimatedTimeToMvpWeeks} weeks. ` +
    `Focus exclusively on building the minimum automated bridge between the customer's raw input and their desired outcome. ` +
    (isMarketplace
      ? 'For a marketplace, manually recruit 10 high-quality supply providers before launching any automated platform.'
      : 'Avoid building self-serve infrastructure until at least 5 paying customers have been onboarded manually.')

  const adoptionChallenges =
    'Customers resist creating new accounts or switching daily habits unless the time-to-first-value is under 3 minutes. ' +
    'The greatest adoption hurdle is not missing features, but cognitive onboarding friction and habit inertia.'

  return {
    howItWorks: solutionText,
    featureMapping,
    mvpScope,
    buildFirst,
    postpone,
    adoptionChallenges,
    complexityScore,
    complexityLevel,
    estimatedTimeToMvpWeeks,
  }
}
