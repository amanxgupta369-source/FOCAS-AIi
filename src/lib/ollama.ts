import type {
  Analysis,
  CustomerInterview,
  EvaluationProgress,
  EvaluationStage,
  IdeaForm,
  TrackedAssumption,
} from '../types'
import { generateBasicEvaluation } from './basicEvaluation'
import { generateOverallVerdict } from './verdict'

export const OPENROUTER_FREE_MODEL = 'qwen/qwen-2.5-7b-instruct:free'
export const DEFAULT_MODEL = OPENROUTER_FREE_MODEL
export const FALLBACK_MODEL = 'qwen2.5:1.5b'

const BASE_URLS = ['/api/ollama', 'http://127.0.0.1:11434/api', 'http://localhost:11434/api']

export const EVALUATION_STAGES: EvaluationStage[] = [
  'Understanding the idea',
  'Evaluating the problem and customers',
  'Analysing competitors and risks',
  'Preparing recommendations',
  'Generating the final report',
]

export function getCleanModelName(raw?: string): string {
  if (!raw || typeof raw !== 'string') return DEFAULT_MODEL
  const cleaned = raw.split('(')[0].trim()
  return cleaned || DEFAULT_MODEL
}

/**
 * Checks connection status to server API (OpenRouter or local Ollama).
 * Returns connection availability, whether OpenRouter key is set, and active provider.
 */
export async function checkOllamaConnection(): Promise<{
  connected: boolean
  models: string[]
  activeModel: string
  provider?: string
  isQuotaExceeded?: boolean
}> {
  // 1. Check server-side status endpoint
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3500)
    const res = await fetch('/api/status', { method: 'GET', signal: controller.signal })
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      return {
        connected: data.online !== false,
        models: [data.model || DEFAULT_MODEL],
        activeModel: data.model || DEFAULT_MODEL,
        provider: data.provider || (data.hasOpenRouterKey ? 'openrouter' : 'ollama'),
        isQuotaExceeded: !!data.isQuotaExceeded,
      }
    }
  } catch {
    // try fallback check
  }

  // 2. Fallback check directly against local Ollama for offline dev
  for (const base of BASE_URLS) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 2000)
      const res = await fetch(`${base}/tags`, { method: 'GET', signal: controller.signal })
      clearTimeout(timer)

      if (res.ok) {
        const data = await res.json()
        const models: string[] = (data.models || []).map((m: any) => m.name || m.model)
        const active = models[0] || 'qwen2.5:1.5b'
        return { connected: true, models, activeModel: active, provider: 'ollama' }
      }
    } catch {
      // try next
    }
  }

  // Default: if server is unreachable, connection manager flags external AI as offline
  return {
    connected: false,
    models: [DEFAULT_MODEL],
    activeModel: 'basic-engine',
    provider: 'basic',
  }
}

export type ProgressSubscriber = (progress: EvaluationProgress) => void

/**
 * Runs the bounded 5-stage evaluation workflow with a reliable connection manager.
 *
 * 1. Attempts OpenRouter (qwen/qwen3-4b:free) via secure server-side endpoint (/api/evaluate).
 * 2. Uses reasonable timeouts (25s) to prevent endless loading states.
 * 3. Gracefully detects quota exhaustion (429), timeouts, offline networks, or invalid outputs.
 * 4. Automatically switches to the deterministic FOCAS Basic Evaluation engine.
 * 5. Accurately labels the report type ('ai' vs 'basic') so founders always know how it was generated.
 */
export async function runBoundedEvaluation(
  form: IdeaForm,
  preferredModel?: string,
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
  updateProgress('Understanding the idea')
  await new Promise(r => setTimeout(r, 400))
  completedStages.push('Understanding the idea')

  // STAGE 2: Evaluating the problem and customers
  updateProgress('Evaluating the problem and customers')
  await new Promise(r => setTimeout(r, 400))

  // STAGE 3: Analysing competitors and risks
  updateProgress('Analysing competitors and risks')

  // Build the deterministic basic foundation
  const basicReport = generateBasicEvaluation(form, interviews, trackedAssumptions)

  let serverResult: any = null
  let modelUsed = preferredModel || DEFAULT_MODEL
  let isFallback = false
  let isQuotaExceeded = false
  let fallbackReason = ''

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(new Error('Evaluation request timed out')), 25000)

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer)
        controller.abort()
      })
    }

    // Call secure server endpoint
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form }),
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (res.ok) {
      serverResult = await res.json()
      if (serverResult?.fallback || !serverResult?.success) {
        isFallback = true
        isQuotaExceeded = !!serverResult?.isQuotaExceeded
        fallbackReason = serverResult?.error || serverResult?.notice || 'AI provider was unavailable.'
      } else if (serverResult?.model) {
        modelUsed = serverResult.model
      }
    } else {
      isFallback = true
      isQuotaExceeded = res.status === 429
      fallbackReason = `Server responded with status ${res.status}.`
    }
  } catch (err: any) {
    if (signal?.aborted) {
      throw new Error('Evaluation cancelled by user.')
    }
    console.warn('AI evaluation request failed, switching to Basic Evaluation engine:', err.message)
    isFallback = true
    isQuotaExceeded = err.message?.includes('429') || err.message?.includes('quota')
    fallbackReason = err.message?.includes('timed out')
      ? 'Request timed out after 25s.'
      : 'Network connection or server endpoint unavailable.'
  }

  completedStages.push('Evaluating the problem and customers')
  completedStages.push('Analysing competitors and risks')

  // STAGE 4: Preparing recommendations
  updateProgress('Preparing recommendations')
  await new Promise(r => setTimeout(r, 300))
  completedStages.push('Preparing recommendations')

  // STAGE 5: Generating the final report
  updateProgress('Generating the final report')

  let finalReport: Analysis

  if (!isFallback && serverResult?.success && serverResult?.data) {
    // Successful AI evaluation from OpenRouter / Qwen
    const parsed = serverResult.data
    finalReport = {
      ...basicReport,
      evaluationType: 'ai',
      evaluationNotice: undefined,
      isQuotaExceeded: false,
    }

    if (parsed.executiveSummary && typeof parsed.executiveSummary === 'object') {
      finalReport.executiveSummary = {
        ideaSimple: parsed.executiveSummary.ideaSimple || basicReport.executiveSummary.ideaSimple,
        problemOverview: parsed.executiveSummary.problemOverview || basicReport.executiveSummary.problemOverview,
        intendedCustomer: parsed.executiveSummary.intendedCustomer || basicReport.executiveSummary.intendedCustomer,
        opportunityOverview: parsed.executiveSummary.opportunityOverview || basicReport.executiveSummary.opportunityOverview,
        biggestConcern: parsed.executiveSummary.biggestConcern || basicReport.executiveSummary.biggestConcern,
        recommendedAction: parsed.executiveSummary.recommendedAction || basicReport.executiveSummary.recommendedAction,
      }
    }

    if (parsed.problemAnalysis && typeof parsed.problemAnalysis === 'object') {
      finalReport.problemAnalysis = {
        exactProblem: parsed.problemAnalysis.exactProblem || basicReport.problemAnalysis.exactProblem,
        whoExperiencesIt: parsed.problemAnalysis.whoExperiencesIt || basicReport.problemAnalysis.whoExperiencesIt,
        whenAndWhy: basicReport.problemAnalysis.whenAndWhy,
        currentWorkarounds: parsed.problemAnalysis.currentWorkarounds || basicReport.problemAnalysis.currentWorkarounds,
        evidenceStatus: parsed.problemAnalysis.evidenceStatus || basicReport.problemAnalysis.evidenceStatus,
        unverifiedAspects: parsed.problemAnalysis.unverifiedAspects || basicReport.problemAnalysis.unverifiedAspects,
      }
    }

    if (parsed.businessModel && typeof parsed.businessModel === 'object') {
      finalReport.businessModel = {
        possibleRevenueModels: basicReport.businessModel.possibleRevenueModels,
        whoPaysAndWhy: parsed.businessModel.whoPaysAndWhy || basicReport.businessModel.whoPaysAndWhy,
        pricingHypotheses: parsed.businessModel.pricingHypotheses || basicReport.businessModel.pricingHypotheses,
        acquisitionChallenges: parsed.businessModel.acquisitionChallenges || basicReport.businessModel.acquisitionChallenges,
        retentionChallenges: basicReport.businessModel.retentionChallenges,
      }
    }

    if (parsed.customerAnalysis && typeof parsed.customerAnalysis === 'object') {
      finalReport.customerAnalysis = {
        primarySegment: parsed.customerAnalysis.primarySegment || basicReport.customerAnalysis.primarySegment,
        secondarySegment: basicReport.customerAnalysis.secondarySegment,
        needsAndMotivations: basicReport.customerAnalysis.needsAndMotivations,
        earlyAdopters: parsed.customerAnalysis.earlyAdopters || basicReport.customerAnalysis.earlyAdopters,
        unlikelyUsersAndWhy: basicReport.customerAnalysis.unlikelyUsersAndWhy,
        verifiedFacts: Array.isArray(parsed.customerAnalysis.verifiedFacts) && parsed.customerAnalysis.verifiedFacts.length > 0
          ? parsed.customerAnalysis.verifiedFacts
          : basicReport.customerAnalysis.verifiedFacts,
        hypotheses: Array.isArray(parsed.customerAnalysis.hypotheses) && parsed.customerAnalysis.hypotheses.length > 0
          ? parsed.customerAnalysis.hypotheses
          : basicReport.customerAnalysis.hypotheses,
      }
    }

    if (parsed.marketAndCompetitors && typeof parsed.marketAndCompetitors === 'object') {
      finalReport.marketAndCompetitors = {
        relevantCompetitors: Array.isArray(parsed.marketAndCompetitors.relevantCompetitors) && parsed.marketAndCompetitors.relevantCompetitors.length > 0
          ? parsed.marketAndCompetitors.relevantCompetitors
          : basicReport.marketAndCompetitors.relevantCompetitors,
        existingAlternatives: Array.isArray(parsed.marketAndCompetitors.existingAlternatives) && parsed.marketAndCompetitors.existingAlternatives.length > 0
          ? parsed.marketAndCompetitors.existingAlternatives
          : basicReport.marketAndCompetitors.existingAlternatives,
        competitorComparison: basicReport.marketAndCompetitors.competitorComparison,
        differentiationOpportunities: Array.isArray(parsed.marketAndCompetitors.differentiationOpportunities) && parsed.marketAndCompetitors.differentiationOpportunities.length > 0
          ? parsed.marketAndCompetitors.differentiationOpportunities
          : basicReport.marketAndCompetitors.differentiationOpportunities,
        researchLimitationsNotice: basicReport.marketAndCompetitors.researchLimitationsNotice,
      }
    }

    if (Array.isArray(parsed.risksAndWeaknesses) && parsed.risksAndWeaknesses.length > 0) {
      finalReport.risksAndWeaknesses = parsed.risksAndWeaknesses.map((r: any, idx: number) => ({
        risk: String(r.risk || `Risk ${idx + 1}`),
        whyItMatters: String(r.whyItMatters || 'Could negatively impact adoption.'),
        failureMechanism: String(r.failureMechanism || 'Customers stay with existing workarounds.'),
        severity: (r.severity === 'High' || r.severity === 'Medium' || r.severity === 'Low') ? r.severity : 'Medium',
        mitigationStrategy: String(r.mitigationStrategy || 'Validate before committing building time.'),
      }))
    }

    if (Array.isArray(parsed.assumptionAnalysis) && parsed.assumptionAnalysis.length > 0) {
      finalReport.assumptionAnalysis = parsed.assumptionAnalysis.map((as: any, idx: number) => ({
        assumption: String(as.assumption || `Assumption ${idx + 1}`),
        whyItMatters: String(as.whyItMatters || 'Core to viability.'),
        ifFalseConsequence: String(as.ifFalseConsequence || 'Value proposition breaks.'),
        testMethod: String(as.testMethod || 'Ask potential users during interviews.'),
      }))
    }

    if (Array.isArray(parsed.experiments) && parsed.experiments.length > 0) {
      finalReport.experiments = parsed.experiments.map((exp: any, idx: number) => ({
        id: `ai-exp-${idx + 1}`,
        hypothesis: String(exp.hypothesis || `Hypothesis ${idx + 1}`),
        how: String(exp.how || 'Run low-code validation.'),
        participants: '5-10 target users',
        effort: '1-3 days',
        success: String(exp.success || 'Customer commitments or deposit signups'),
        positive: 'Proceed to next milestone',
        negative: 'Pivot or re-scope problem',
        status: 'Not started' as const,
        notes: '',
      }))
    }

    if (typeof parsed.score === 'number' && parsed.score >= 1 && parsed.score <= 100) {
      finalReport.score = parsed.score
    }

    // Synthesize Section 1 to 9 Overall Verdict
    finalReport.overallVerdict = generateOverallVerdict(form, finalReport, interviews, trackedAssumptions)
  } else {
    // Pure Deterministic Basic Evaluation (Transparent & Accurate)
    const noticeText = isQuotaExceeded
      ? 'OpenRouter free model quota is currently exhausted. FOCAS Basic Evaluation generated this report using structured business logic.'
      : 'AI is temporarily unavailable. FOCAS Basic Evaluation is ready to help you continue.'

    finalReport = generateBasicEvaluation(
      form,
      interviews,
      trackedAssumptions,
      isQuotaExceeded,
      noticeText
    )
    modelUsed = 'FOCAS Basic Evaluation (Rule-Based)'
  }

  completedStages.push('Generating the final report')
  updateProgress('Generating the final report')

  return {
    analysis: finalReport,
    modelUsed,
    evaluationType: isFallback ? 'basic' : 'ai',
    isQuotaExceeded,
    error: isFallback ? fallbackReason : undefined,
  }
}

/**
 * Structured, rule-based thinking partner guidance when AI is offline.
 * Provides transparent, honest answers based directly on the founder's project and validation evidence.
 */
export function getStructuredAdvisorResponse(
  question: string,
  form: IdeaForm,
  analysis?: Analysis
): string {
  const q = question.toLowerCase().trim()
  const name = form.name || 'this idea'
  const verdict = analysis?.overallVerdict?.decision || analysis?.finalRecommendation?.verdict || 'VALIDATE FIRST'

  if (q.includes('why') && (q.includes('conclusion') || q.includes('verdict') || q.includes('reason'))) {
    const explanation =
      analysis?.overallVerdict?.conciseExplanation ||
      analysis?.finalRecommendation?.verdictReasoning ||
      'This verdict was selected based on the completeness of customer pain evidence and willingness to pay.'
    const strongestReason = analysis?.overallVerdict?.strongestReason || 'Unproven customer willingness to pay.'
    const biggestConcern = analysis?.overallVerdict?.biggestConcern || 'Habit inertia and customer acquisition friction.'

    return `Here is why FOCAS reached the recommendation of "${verdict}":\n\n` +
      `• Primary Reason: ${strongestReason}\n\n` +
      `• Core Explanation: ${explanation}\n\n` +
      `• Biggest Risk: ${biggestConcern}\n\n` +
      `To update this verdict, log customer discovery calls in the "Validation & Evidence" tab.`
  }

  if (q.includes('assumption') || q.includes('dangerous') || q.includes('risk')) {
    const critical = analysis?.overallVerdict?.criticalAssumption?.assumption ||
      analysis?.assumptionAnalysis?.[0]?.assumption ||
      `Assumes ${form.customer || 'customers'} feel this problem often enough to abandon their current habits and pay money.`
    const test = analysis?.overallVerdict?.criticalAssumption?.cheapestTest ||
      'Conduct 5 Mom-Test discovery interviews focusing on past behavior without pitching the product.'

    return `The single most critical assumption for ${name} is:\n\n` +
      `"${critical}"\n\n` +
      `Why it matters: If this assumption is false, customers will not pay and your business will run out of resources.\n\n` +
      `Cheapest way to test it: ${test}`
  }

  if (q.includes('willingness') || q.includes('pay') || q.includes('price') || q.includes('pricing')) {
    const exp2 = analysis?.experiments?.find(e => e.id === 'exp-2')
    return `To test willingness to pay without writing code:\n\n` +
      `1. Do not ask "Would you pay for this?" (People almost always say yes politely).\n` +
      `2. Instead, ask about the past: "How much did you spend the last time this broke?"\n` +
      `3. Ask for a commitment: Offer to solve it manually or ask for a refundable $20 deposit or signed Letter of Intent (LOI).\n\n` +
      (exp2 ? `Recommended experiment: ${exp2.how}` : '')
  }

  if (q.includes('question') || q.includes('interview') || q.includes('ask') || q.includes('customer')) {
    const questions = analysis?.openQuestions?.focusedFollowUpQuestions || analysis?.questions || [
      'When was the last time this problem happened?',
      'Walk me through what you did step-by-step to handle it.',
      'What was the most frustrating part of that process?',
      'What other solutions have you tried?',
      'Who would have the budget or authority to pay for a tool?',
    ]
    return `Here are 5 non-leading customer discovery questions (The Mom Test style) to ask potential buyers:\n\n` +
      questions.map((item, idx) => `${idx + 1}. "${item}"`).join('\n\n')
  }

  if (q.includes('next') || q.includes('action') || q.includes('what should i do') || q.includes('step')) {
    const nextActions = analysis?.overallVerdict?.nextThreeActions || [
      { rank: 1, title: 'Customer Discovery Calls', what: 'Talk to 5 target users about their daily routine.' },
      { rank: 2, title: 'Map Current Workaround', what: 'Document how they currently solve this with spreadsheets or notes.' },
      { rank: 3, title: 'Test Willingness to Pay', what: 'Ask for a pre-order or letter of intent before writing software.' },
    ]
    return `Here are your suggested next steps for ${name}:\n\n` +
      nextActions.map(a => `${a.rank}. **${a.title}**: ${a.what}`).join('\n\n')
  }

  // General honest fallback response
  return `The external AI model is currently offline or rate-limited. As your rule-based thinking partner, I cannot generate freeform answers right now, but here is what your current evaluation records for ${name}:\n\n` +
    `• Target Customer: ${form.customer || 'Unspecified'}\n` +
    `• Current Alternative: ${form.current || 'Manual workarounds'}\n` +
    `• Current Verdict: ${verdict}\n` +
    `• Key Next Action: ${analysis?.overallVerdict?.singleMostImportantNextAction || 'Conduct 5 customer discovery interviews.'}\n\n` +
    `You can use the suggested action buttons below to inspect specific reasoning, assumptions, and validation plans.`
}

/**
 * Chat implementation calling secure server-side endpoint (/api/chat).
 * Protects OPENROUTER_API_KEY from exposure in the client browser.
 * Falls back to honest structured guidance if external AI is unavailable.
 */
export async function chatWithOllama(
  form: IdeaForm,
  analysis: Analysis | undefined,
  messages: { role: 'user' | 'assistant'; content: string }[],
  _model = DEFAULT_MODEL
): Promise<string> {
  const validUserMessages = messages
    .filter(m => m && typeof m.content === 'string' && m.content.trim().length > 0)
    .map(m => ({
      role: m.role,
      content: m.content.trim(),
    }))

  const lastUserText = validUserMessages[validUserMessages.length - 1]?.content || ''

  // 1. Call secure server-side chat endpoint
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 25000)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form,
        analysis,
        messages: validUserMessages,
      }),
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      if (data?.success && data?.message) {
        return data.message
      }
      if (data && !data.success) {
        throw new Error(data.message || data.error || 'The AI service returned an error.')
      }
    } else {
      const data = await res.json().catch(() => null)
      throw new Error(data?.message || data?.error || `AI service returned error (${res.status}).`)
    }
  } catch (err: any) {
    if (err.message?.includes('OPENROUTER_API_KEY') || err.message?.includes('rate limit') || err.message?.includes('quota') || err.message?.includes('invalid')) {
      throw err
    }
    console.warn('Server chat call failed, testing local fallback:', err.message)
  }

  // 2. Direct local Ollama fallback if running in offline local dev
  for (const base of BASE_URLS) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 20000)

      const res = await fetch(`${base}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5:1.5b',
          messages: [
            {
              role: 'system',
              content:
                'You are FOCAS AI, an honest startup advisor. Speak in simple, everyday English without corporate jargon.',
            },
            ...validUserMessages,
          ],
          stream: false,
          options: { num_predict: 800, temperature: 0.65 },
        }),
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (res.ok) {
        const data = await res.json()
        if (data?.message?.content) {
          return data.message.content
        }
      }
    } catch {
      // try next
    }
  }

  // 3. Transparent Honest Rule-Based Advisor (Zero external AI dependencies)
  return getStructuredAdvisorResponse(lastUserText, form, analysis)
}
