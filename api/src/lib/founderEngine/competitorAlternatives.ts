import type { UnderstoodIdea } from './ideaUnderstanding'
import { getFrameworkById } from './knowledgeLibrary'

export interface CompetitorComparisonItem {
  name: string
  targetAudience: string
  coreFeatures: string
  positioning: string
  pricingInfo: string
}

export interface CompetitorAlternativesAnalysis {
  relevantCompetitors: string[]
  existingAlternatives: string[]
  competitorComparison: CompetitorComparisonItem[]
  differentiationOpportunities: string[]
  researchLimitationsNotice: string
  switchingBarriers: string[]
}

/**
 * Module 5: Competitor & Alternatives Analysis
 * Maps user-supplied competitors and real status-quo substitutes.
 * Strictly adheres to rule: NEVER invent fake companies, prices, or statistics.
 */
export function analyzeCompetitorsAndAlternatives(
  understood: UnderstoodIdea
): CompetitorAlternativesAnalysis {
  const fw = getFrameworkById('competitor-analysis-status-quo')
  const userComp = understood.cleanCompetitors
  const userWorkaround = understood.cleanWorkaround
  const isB2B = understood.signals.isB2B

  const relevantCompetitors: string[] = []
  const competitorComparison: CompetitorComparisonItem[] = []

  if (understood.signals.hasCompetitorsListed) {
    // Founder provided competitors - break them down or list them
    const items = userComp
      .split(/[,;\n]+/)
      .map((c: string) => c.trim())
      .filter((c: string) => c.length > 1)

    items.forEach((c: string) => {
      relevantCompetitors.push(c)
      competitorComparison.push({
        name: c,
        targetAudience: 'Founder-reported competitor. Audience profile unverified without direct benchmarking.',
        coreFeatures: 'Established incumbent feature set in this product domain.',
        positioning: 'Incumbent commercial alternative.',
        pricingInfo: 'Pricing details unverified in current dataset. Verify live pricing on vendor website.',
      })
    })
  } else {
    relevantCompetitors.push(
      'None specifically identified by founder. (Critical warning: Every problem has substitutes; you must investigate before writing code).'
    )
  }

  // Map Real Substitutes and Status Quo (The Mom Test / Lean principles)
  const existingAlternatives: string[] = []
  if (userWorkaround) {
    existingAlternatives.push(`Identified Current Habit: "${userWorkaround}"`)
  } else {
    existingAlternatives.push('Current manual routines (unspecified by founder)')
  }

  if (isB2B) {
    existingAlternatives.push('Spreadsheets (Google Sheets / Microsoft Excel) combined with manual email chains')
    existingAlternatives.push('Internal bespoke scripts or shared Google Drive / Notion folders')
    existingAlternatives.push('Status Quo / Inaction: enduring the pain because switching costs feel too high')
  } else {
    existingAlternatives.push('Free mobile apps, personal reminder lists, Apple Notes / WhatsApp chats with oneself')
    existingAlternatives.push('Accepting the inconvenience / doing without a specialized solution')
  }

  const switchingBarriers: string[] = [
    'Habit inertia: Users already know their existing workaround and pay $0 incremental cost for it.',
    'Data migration: Moving existing files, history, or team workflows to a new platform requires cognitive effort.',
    'Risk of disruption: If the new tool has bugs or fails, the user bears the blame.',
  ]

  const differentiationOpportunities: string[] = [
    'Extreme simplicity: Focus solely on solving the core pain 10x faster than a generic spreadsheet without bloated enterprise configuration.',
    'Opinionated workflow: Provide a pre-built automated flow instead of a blank canvas that requires hours of setup.',
    'Speed to value: Deliver tangible results within 2 minutes of onboarding, without requiring a salesperson call.',
  ]

  const researchLimitationsNotice =
    'Disclosure: FOCAS does not hallucinate fictional competitor companies, fabricated pricing tiers, or unverified market share data. ' +
    'The competitors listed above reflect your submission and foundational status-quo substitutes. Always conduct primary benchmarking with target customers.'

  return {
    relevantCompetitors,
    existingAlternatives,
    competitorComparison,
    differentiationOpportunities,
    researchLimitationsNotice,
    switchingBarriers,
  }
}
