import type {
  Analysis,
  CustomerInterview,
  IdeaForm,
  TrackedAssumption,
} from '../types'
import { evaluateStartupIdea } from './founderEngine'

/**
 * FOCAS Logic-Driven Founder Intelligence Engine.
 *
 * Runs 100% locally in browser or server without any external AI dependency.
 * Uses structured, transparent business rules derived from first principles
 * (The Mom Test, Lean Startup, Customer Development, Unit Economics) to evaluate startup ideas.
 *
 * Guarantees:
 * 1. Zero hallucinations: Never invents fake competitors, market sizes, or customer feedback.
 * 2. Transparent distinction between user facts, unverified assumptions, and unknown info.
 * 3. Evidence-reactive: Recalculates risk and verdicts dynamically when interviews or assumption states are recorded.
 * 4. Transparent readiness score: Explicitly labeled as an evidence-completeness index, not an arbitrary success predictor.
 */
export function generateBasicEvaluation(
  form: IdeaForm,
  interviews: CustomerInterview[] = [],
  trackedAssumptions: TrackedAssumption[] = [],
  isQuotaExceeded = false,
  customNotice?: string
): Analysis {
  return evaluateStartupIdea(form, interviews, trackedAssumptions, isQuotaExceeded, customNotice)
}
