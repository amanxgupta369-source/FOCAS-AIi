/**
 * Backward compatibility layer redirecting to reasoningEngine.ts.
 */
export {
  DEFAULT_ENGINE,
  DEFAULT_MODEL,
  FALLBACK_MODEL,
  EVALUATION_STAGES,
  getCleanModelName,
  checkEngineConnection,
  checkEngineConnection as checkOllamaConnection,
  runDeterministicEvaluation,
  runDeterministicEvaluation as runBoundedEvaluation,
  consultFounderAdvisor,
  consultFounderAdvisor as chatWithOllama,
} from './reasoningEngine'
export type { ProgressSubscriber } from './reasoningEngine'
