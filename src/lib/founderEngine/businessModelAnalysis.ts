import type { UnderstoodIdea } from './ideaUnderstanding'
import { getFrameworkById } from './knowledgeLibrary'

export interface BusinessModelAnalysisResult {
  possibleRevenueModels: string[]
  whoPaysAndWhy: string
  pricingHypotheses: string
  acquisitionChallenges: string
  retentionChallenges: string
  recommendedValueMetric: string
}

/**
 * Module 7: Business Model Analysis
 * Evaluates revenue models, pricing hypotheses, distribution channels, and unit economics.
 */
export function analyzeBusinessModel(
  understood: UnderstoodIdea
): BusinessModelAnalysisResult {
  const fwPricing = getFrameworkById('pricing-business-models-value-metric')
  const fwBullseye = getFrameworkById('distribution-bullseye-framework')

  const modelText = understood.cleanModel
  const isB2B = understood.signals.isB2B
  const isMarketplace = understood.signals.isMarketplace
  const customer = understood.cleanCustomer || 'Customer'

  const possibleRevenueModels: string[] = []

  if (isMarketplace) {
    possibleRevenueModels.push('Transaction take-rate / marketplace commission (typically 10% to 20% per completed deal)')
    possibleRevenueModels.push('Featured listing / priority placement fee for high-volume providers')
  } else if (isB2B) {
    possibleRevenueModels.push('Subscription Tier (SaaS): Per-seat or tiered team package ($49 – $299/month)')
    possibleRevenueModels.push('Value-Metric Pricing: Tied to usage, volume of workflows processed, or active projects')
    possibleRevenueModels.push('Pilot Onboarding Fee: Direct setup + initial validation fee for first 5 customers')
  } else {
    // B2C / Prosumer
    possibleRevenueModels.push('Direct Monthly/Annual Consumer Subscription ($9 – $29/month)')
    possibleRevenueModels.push('Freemium with premium feature gating (Warning: Requires massive top-of-funnel traffic)')
    possibleRevenueModels.push('One-time upfront purchase or token package for episodic needs')
  }

  const whoPaysAndWhy = isB2B
    ? `Economic Buyer: Department lead, team manager, or founder who owns the budget line item. ` +
      `They pay because resolving this problem directly protects team hours, cuts error expenses, or drives revenue.`
    : `Consumer End-User: Pays out of pocket because the solution eliminates immediate personal friction or saves hours of tedious manual effort.`

  const recommendedValueMetric = isB2B
    ? 'Number of completed workflows / active projects (aligns price directly with value created)'
    : 'Active access tier or monthly subscription'

  const pricingHypotheses = modelText
    ? `Founder proposal: "${modelText}". Hypothesis: Early customers should be charged simple upfront flat pricing before implementing complex automated metering.`
    : isB2B
      ? 'Hypothesis: Charge $99/month for early team access. If customer saves 5+ hours/month at $40/hr, ROI is clearly 2x+.'
      : 'Hypothesis: Charge $15/month or $99/year. Test conversion on a pre-order landing page before building billing code.'

  const acquisitionChallenges = isB2B
    ? 'Customer Acquisition Cost (CAC) risk: Outbound cold email response rates are historically low (1-3%). ' +
      'Founders must rely on direct founder-led sales calls, niche LinkedIn outreach, and specialized communities.'
    : 'Consumer acquisition treadmill: Paid ads (Meta/Google) often exceed lifetime value (LTV) for low-priced consumer apps. ' +
      'Must discover an organic distribution channel (SEO, content, TikTok/YouTube, or viral invite loops).'

  const retentionChallenges =
    understood.frequencyCategory === 'Daily' || understood.frequencyCategory === 'Weekly'
      ? 'Favorable: Since the problem occurs frequently, weekly active usage will naturally build habit reinforcement if onboarding is smooth.'
      : 'Critical Hazard: Episodic or monthly problems suffer from high churn because users forget the tool between uses and cancel their subscription.';

  return {
    possibleRevenueModels,
    whoPaysAndWhy,
    pricingHypotheses,
    acquisitionChallenges,
    retentionChallenges,
    recommendedValueMetric,
  }
}
