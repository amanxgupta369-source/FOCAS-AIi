/**
 * FOCAS Deterministic Founder Intelligence Engine
 * Replaces external AI inference models with a 100% logic-driven, transparent founder reasoning system.
 */
import type {
  Analysis,
  CustomerInterview,
  EvaluationProgress,
  EvaluationStage,
  IdeaForm,
  Project,
  TrackedAssumption,
} from '../types'
import {
  evaluateStartupIdea,
  getDeterministicAdvisorResponse,
} from './founderEngine'

export const DEFAULT_ENGINE = 'FOCAS Founder Intelligence Engine (Deterministic)'
export const DEFAULT_MODEL = DEFAULT_ENGINE
export const FALLBACK_MODEL = DEFAULT_ENGINE

export const EVALUATION_STAGES: EvaluationStage[] = [
  'Understanding the idea',
  'Evaluating the problem and customers',
  'Analysing competitors and risks',
  'Preparing recommendations',
  'Generating the final report',
]

export function getCleanModelName(_raw?: string): string {
  return DEFAULT_ENGINE
}

/**
 * Checks reasoning engine status. Always returns connected and ready.
 */
export async function checkEngineConnection(): Promise<{
  connected: boolean
  models: string[]
  activeModel: string
  provider: string
  isQuotaExceeded: boolean
}> {
  return {
    connected: true,
    models: [DEFAULT_ENGINE],
    activeModel: DEFAULT_ENGINE,
    provider: 'deterministic-engine',
    isQuotaExceeded: false,
  }
}

export type ProgressSubscriber = (progress: EvaluationProgress) => void

/**
 * Runs the deterministic 5-stage founder evaluation workflow.
 */
export async function runDeterministicEvaluation(
  form: IdeaForm,
  _preferredModel?: string,
  onProgress?: ProgressSubscriber,
  signal?: AbortSignal,
  interviews: CustomerInterview[] = [],
  trackedAssumptions: TrackedAssumption[] = []
): Promise<{
  analysis: Analysis
  modelUsed: string
  evaluationType: 'ai' | 'basic'
  isQuotaExceeded?: boolean
  error?: string
}> {
  const startTime = Date.now()
  let tokenCount = 0
  const completedStages: EvaluationStage[] = []

  const updateProgress = (stage: EvaluationStage) => {
    onProgress?.({
      currentStage: stage,
      completedStages: [...completedStages],
      tokens: tokenCount,
      elapsedSeconds: Math.floor((Date.now() - startTime) / 1000),
    })
  }

  // STAGE 1: Understanding the idea
  if (signal?.aborted) throw new Error('Evaluation cancelled by user.')
  updateProgress('Understanding the idea')
  await new Promise(r => setTimeout(r, 200))
  completedStages.push('Understanding the idea')

  // STAGE 2: Evaluating the problem and customers
  if (signal?.aborted) throw new Error('Evaluation cancelled by user.')
  updateProgress('Evaluating the problem and customers')
  await new Promise(r => setTimeout(r, 200))
  completedStages.push('Evaluating the problem and customers')

  // STAGE 3: Analysing competitors and risks
  if (signal?.aborted) throw new Error('Evaluation cancelled by user.')
  updateProgress('Analysing competitors and risks')
  await new Promise(r => setTimeout(r, 200))
  completedStages.push('Analysing competitors and risks')

  // STAGE 4: Preparing recommendations
  if (signal?.aborted) throw new Error('Evaluation cancelled by user.')
  updateProgress('Preparing recommendations')
  await new Promise(r => setTimeout(r, 200))
  completedStages.push('Preparing recommendations')

  // STAGE 5: Generating the final report
  if (signal?.aborted) throw new Error('Evaluation cancelled by user.')
  updateProgress('Generating the final report')

  const finalReport = evaluateStartupIdea(
    form,
    interviews,
    trackedAssumptions,
    false,
    'Generated deterministically by FOCAS Founder Intelligence Engine. ' +
      'All insights, risk analysis, and action plans are computed from first-principles founder frameworks with zero external AI inference.'
  )

  completedStages.push('Generating the final report')
  updateProgress('Generating the final report')

  return {
    analysis: finalReport,
    modelUsed: DEFAULT_ENGINE,
    evaluationType: 'basic',
    isQuotaExceeded: false,
    error: undefined,
  }
}

/**
 * Deterministic Thinking Partner advisor implementation.
 */
export async function consultFounderAdvisor(
  form: IdeaForm,
  analysis: Analysis | undefined,
  messages: Array<{ role: string; content: string }>,
  _activeModel?: string
): Promise<string> {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || ''
  const mockProject: Project = {
    id: 'active',
    form,
    analysis,
    status: 'Validating',
    updated: new Date().toISOString(),
  }
  return getDeterministicAdvisorResponse(lastUserMsg, mockProject)
}
