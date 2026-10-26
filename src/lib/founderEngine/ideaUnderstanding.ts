/**
 * Module 1: Idea Understanding
 *
 * Extracts, sanitizes, and normalizes inputs from IdeaForm into a structured
 * parsed representation. Separates user-verified facts from unverified claims.
 */

import type { IdeaForm, Stage } from '../../types'

export interface UnderstoodIdea {
  name: string
  rawDescription: string
  problemStatement: string
  proposedSolution: string
  targetCustomer: string
  beachheadSegment: string
  targetMarket: string
  currentWorkarounds: string
  businessModel: string
  statedCompetitors: string
  demandEvidence: string
  statedFrequency: string
  statedCostsAndBudget: string
  priorExperiments: string
  currentStage: Stage
  stage: Stage

  // Clean field aliases used across the 12 modules
  cleanName: string
  cleanProblem: string
  cleanCustomer: string
  cleanSolution: string
  cleanSegment: string
  cleanMarket: string
  cleanWorkaround: string
  cleanModel: string
  cleanCompetitors: string
  cleanDemand: string
  cleanFrequency: string
  cleanCosts: string
  cleanPrior: string
  frequencyCategory: 'Daily' | 'Weekly' | 'Monthly' | 'Annual' | 'Rare' | 'Unstated'

  signals: {
    hasSpecificCustomer: boolean
    hasPainTrigger: boolean
    hasIdentifiedAlternatives: boolean
    hasQuantifiedDemand: boolean
    hasDefinedRevenueModel: boolean
    hasCompetitorsListed: boolean
    hasCostEstimate: boolean
    isB2B: boolean
    isConsumer: boolean
    isMarketplace: boolean
  }
  extractedSignals: {
    hasSpecificCustomer: boolean
    hasPainTrigger: boolean
    hasIdentifiedAlternatives: boolean
    hasQuantifiedDemand: boolean
    hasDefinedRevenueModel: boolean
    isB2B: boolean
    isConsumer: boolean
    isMarketplace: boolean
  }
}

export type StructuredIdea = UnderstoodIdea

export function understandIdea(form: IdeaForm): UnderstoodIdea {
  const name = (form.name || '').trim() || 'Untitled Startup Concept'
  const rawDescription = (form.description || '').trim()
  const cleanName = name
  const cleanProblem = (form.problem || '').trim() || rawDescription
  const cleanSolution = (form.solution || '').trim() || rawDescription
  const cleanCustomer = (form.customer || '').trim()
  const cleanSegment = (form.segment || '').trim()
  const cleanMarket = (form.market || '').trim()
  const cleanWorkaround = (form.current || '').trim()
  const cleanModel = (form.model || '').trim()
  const cleanCompetitors = (form.competitors || '').trim()
  const cleanDemand = (form.demand || '').trim()
  const cleanFrequency = (form.frequency || '').trim()
  const cleanCosts = (form.costs || '').trim()
  const cleanPrior = (form.priorExperiments || '').trim()
  const stage: Stage = form.stage || 'Idea'

  const fullText = `${name} ${rawDescription} ${cleanProblem} ${cleanCustomer} ${cleanModel}`.toLowerCase()

  const isB2B =
    fullText.includes('business') ||
    fullText.includes('b2b') ||
    fullText.includes('company') ||
    fullText.includes('firm') ||
    fullText.includes('agency') ||
    fullText.includes('team') ||
    fullText.includes('manager') ||
    fullText.includes('owner') ||
    fullText.includes('enterprise') ||
    fullText.includes('saas') ||
    fullText.includes('freelancer')

  const isConsumer =
    !isB2B ||
    fullText.includes('consumer') ||
    fullText.includes('b2c') ||
    fullText.includes('student') ||
    fullText.includes('parent') ||
    fullText.includes('daily life') ||
    fullText.includes('hobby')

  const isMarketplace =
    fullText.includes('marketplace') ||
    fullText.includes('platform') ||
    fullText.includes('connects') ||
    fullText.includes('two-sided') ||
    (fullText.includes('buyers') && fullText.includes('sellers'))

  // Categorize frequency
  let frequencyCategory: 'Daily' | 'Weekly' | 'Monthly' | 'Annual' | 'Rare' | 'Unstated' = 'Unstated'
  const freqLower = cleanFrequency.toLowerCase()
  if (freqLower.includes('day') || freqLower.includes('daily') || freqLower.includes('hour')) {
    frequencyCategory = 'Daily'
  } else if (freqLower.includes('week')) {
    frequencyCategory = 'Weekly'
  } else if (freqLower.includes('month')) {
    frequencyCategory = 'Monthly'
  } else if (freqLower.includes('year') || freqLower.includes('annual')) {
    frequencyCategory = 'Annual'
  } else if (freqLower.includes('rare') || freqLower.includes('infrequent') || freqLower.includes('occasional')) {
    frequencyCategory = 'Rare'
  }

  const hasSpecificCustomer = cleanCustomer.length >= 8 && !cleanCustomer.toLowerCase().includes('everyone')
  const hasPainTrigger =
    cleanProblem.toLowerCase().includes('cost') ||
    cleanProblem.toLowerCase().includes('slow') ||
    cleanProblem.toLowerCase().includes('waste') ||
    cleanProblem.toLowerCase().includes('error') ||
    cleanProblem.toLowerCase().includes('hard') ||
    cleanProblem.toLowerCase().includes('frustrat') ||
    cleanProblem.toLowerCase().includes('lost')
  const hasIdentifiedAlternatives =
    cleanWorkaround.length >= 5 && !currentWorkaroundIsNone(cleanWorkaround)
  const hasQuantifiedDemand =
    cleanDemand.length >= 10 &&
    (cleanDemand.match(/\d+/) !== null ||
      cleanDemand.toLowerCase().includes('interview') ||
      cleanDemand.toLowerCase().includes('pilot') ||
      cleanDemand.toLowerCase().includes('waitlist') ||
      cleanDemand.toLowerCase().includes('pre-order') ||
      cleanDemand.toLowerCase().includes('deposit'))
  const hasDefinedRevenueModel =
    cleanModel.length >= 5 && !cleanModel.toLowerCase().includes('not sure')
  const hasCompetitorsListed =
    cleanCompetitors.length >= 3 && !cleanCompetitors.toLowerCase().includes('none')
  const hasCostEstimate =
    cleanCosts.length >= 3 && !cleanCosts.toLowerCase().includes('none')

  const signals = {
    hasSpecificCustomer,
    hasPainTrigger,
    hasIdentifiedAlternatives,
    hasQuantifiedDemand,
    hasDefinedRevenueModel,
    hasCompetitorsListed,
    hasCostEstimate,
    isB2B,
    isConsumer,
    isMarketplace,
  }

  const extractedSignals = {
    hasSpecificCustomer,
    hasPainTrigger,
    hasIdentifiedAlternatives,
    hasQuantifiedDemand,
    hasDefinedRevenueModel,
    isB2B,
    isConsumer,
    isMarketplace,
  }

  return {
    name,
    rawDescription,
    problemStatement: cleanProblem,
    proposedSolution: cleanSolution,
    targetCustomer: cleanCustomer,
    beachheadSegment: cleanSegment,
    targetMarket: cleanMarket,
    currentWorkarounds: cleanWorkaround,
    businessModel: cleanModel,
    statedCompetitors: cleanCompetitors,
    demandEvidence: cleanDemand,
    statedFrequency: cleanFrequency,
    statedCostsAndBudget: cleanCosts,
    priorExperiments: cleanPrior,
    currentStage: stage,
    stage,
    cleanName,
    cleanProblem,
    cleanCustomer,
    cleanSolution,
    cleanSegment,
    cleanMarket,
    cleanWorkaround,
    cleanModel,
    cleanCompetitors,
    cleanDemand,
    cleanFrequency,
    cleanCosts,
    cleanPrior,
    frequencyCategory,
    signals,
    extractedSignals,
  }
}

export const parseIdea = understandIdea

function currentWorkaroundIsNone(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    lower.includes('none') ||
    lower.includes('not sure') ||
    lower.includes('nothing') ||
    lower.includes('n/a')
  )
}
