import type { TrackedAssumption } from '../../types'
import type { UnderstoodIdea } from './ideaUnderstanding'
import { getFrameworkById } from './knowledgeLibrary'

export interface StructuredRisk {
  risk: string
  whyItMatters: string
  failureMechanism: string
  severity: 'High' | 'Medium' | 'Low'
  mitigationStrategy: string
  category: 'Technical' | 'Financial' | 'Customer' | 'Competition' | 'Distribution' | 'Execution'
}

/**
 * Module 8: Risk Analysis
 * Identifies technical, financial, customer, competition, distribution, and execution risks with explicit failure mechanisms.
 */
export function analyzeRisks(
  understood: UnderstoodIdea,
  trackedAssumptions: TrackedAssumption[] = []
): StructuredRisk[] {
  const risks: StructuredRisk[] = []
  const customer = understood.cleanCustomer || 'Target users'
  const workaround = understood.cleanWorkaround || 'current spreadsheets and manual habits'
  const isMarketplace = understood.signals.isMarketplace
  const isB2B = understood.signals.isB2B

  // 1. Customer Demand & Willingness to Pay Risk
  const hasDemandProof = understood.signals.hasQuantifiedDemand
  risks.push({
    category: 'Customer',
    risk: 'Willingness-to-Pay Deficiency (Polite Interest Trap)',
    whyItMatters: 'Founders frequently mistake polite compliments or verbal encouragement for genuine commercial buying intent.',
    failureMechanism: 'Prospective users say "This looks amazing!" during casual chats, but when a checkout link or payment request is presented, they decline or state they have no budget.',
    severity: hasDemandProof ? 'Medium' : 'High',
    mitigationStrategy: 'Test financial or reputational skin-in-the-game before building software. Ask for a paid pre-order deposit, an signed Letter of Intent (LOI), or a scheduled pilot kickoff.',
  })

  // 2. Habit Inertia & Switching Barrier Risk
  risks.push({
    category: 'Competition',
    risk: 'Status-Quo Bias and Switching Costs',
    whyItMatters: 'Your biggest competitor is almost never another funded startup; it is the customer\'s entrenched habit of doing nothing or using free spreadsheets.',
    failureMechanism: 'Users acknowledge the pain, but adopting a new tool requires learning an unfamiliar interface, migrating records, and remembering passwords. The effort exceeds their daily motivation.',
    severity: understood.frequencyCategory === 'Daily' ? 'Medium' : 'High',
    mitigationStrategy: `Ensure the core outcome is delivered within 3 minutes of first login. Provide a 1-click import from ${workaround.slice(0, 50)} so switching friction is nearly zero.`,
  })

  // 3. Distribution & Customer Acquisition Cost (CAC) Risk
  risks.push({
    category: 'Distribution',
    risk: 'Distribution Channel Failure (Build It and They Won\'t Come)',
    whyItMatters: 'A superior product without an efficient distribution engine invariably starves from lack of qualified leads.',
    failureMechanism: 'The product is built over 3 months, launched on product discovery directories, experiences a 48-hour spike, and then traffic flatlines to zero because no repeatable outbound channel exists.',
    severity: 'High',
    mitigationStrategy: isB2B
      ? 'Verify a working outbound outreach channel before finishing the MVP. Identify 50 exact decision makers on LinkedIn and secure 5 validation conversations.'
      : 'Build in public or create niche educational content addressing the exact pain point to prove organic audience reach before launch.',
  })

  // 4. Execution & Scope Creep Risk
  risks.push({
    category: 'Execution',
    risk: 'Over-Engineering and Endless MVP Delay',
    whyItMatters: 'Spending 6 months building advanced edge-case features before exposing the core value loop delays critical reality testing.',
    failureMechanism: 'The founder continually delays the first user test to add "one more essential feature" (SSO, notifications, dark mode), running out of enthusiasm and runway before validating demand.',
    severity: 'Medium',
    mitigationStrategy: 'Commit to a strict 14-day timebox for an initial clickable or concierge prototype. Onboard the first user manually over a screen share.',
  })

  // 5. Technical / Operational Dependency Risk
  if (isMarketplace) {
    risks.push({
      category: 'Technical',
      risk: 'Two-Sided Marketplace Liquidity Death',
      whyItMatters: 'Marketplaces fail when buyers arrive to an empty catalog, or sellers leave due to lack of sales.',
      failureMechanism: 'Neither side sees value because the opposing side has not yet achieved critical mass.',
      severity: 'High',
      mitigationStrategy: 'Constrain geographic or niche focus to a tiny, dense beachhead. Manually subsidize or supply the initial inventory.',
    })
  } else {
    risks.push({
      category: 'Technical',
      risk: 'Single Point of Operational Failure / Platform Risk',
      whyItMatters: 'Heavy reliance on unverified third-party APIs, platform scraping, or proprietary algorithms exposes the business to sudden outages.',
      failureMechanism: 'An upstream provider changes terms, raises API pricing 10x, or deprecates access, instantly breaking your core value delivery.',
      severity: 'Medium',
      mitigationStrategy: 'Keep application architecture modular with fallback deterministic adapters. Avoid coupling your core business model to a single external platform.',
    })
  }

  // 6. Financial Runway Risk
  risks.push({
    category: 'Financial',
    risk: 'Burnout / Default Dead Trajectory',
    whyItMatters: 'If operating costs and time investments compound without recurring revenue milestones, the founder abandons the venture.',
    failureMechanism: 'Spending months paying for software subscriptions, domains, and tools with zero incoming revenue destroys morale and financial runway.',
    severity: 'Medium',
    mitigationStrategy: 'Maintain a Default Alive posture. Keep ongoing fixed operating overhead near $0 (using free tier hosting and deterministic local code) until paying customers fund expansion.',
  })

  // Incorporate tracked assumptions that were disproved
  const disproved = trackedAssumptions.filter(a => a.state === 'Disproved')
  if (disproved.length > 0) {
    risks.unshift({
      category: 'Customer',
      risk: `CRITICAL: Disproved Foundational Hypothesis ("${disproved[0].assumption}")`,
      whyItMatters: 'Direct testing has already revealed that a key assumption in your thesis did not hold in practice.',
      failureMechanism: 'Continuing to build around a premise already invalidated by customer feedback wastes remaining energy and capital.',
      severity: 'High',
      mitigationStrategy: `Review evidence notes ("${disproved[0].evidenceNotes || 'Flagged during customer testing'}"). Pivot the value proposition or customer segment immediately.`,
    })
  }

  return risks
}
