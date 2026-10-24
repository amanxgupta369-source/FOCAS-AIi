import {
  callOpenRouter,
  callLocalOllamaChat,
  extractJsonObject,
  parseJsonBody,
  sendJson,
  getRequestId,
  getClientIp,
  checkRateLimit,
  logEvent,
  OPENROUTER_MODEL,
} from './_shared.js'

export default async function handler(req, res) {
  const requestId = getRequestId(req)
  const startTime = Date.now()

  // 1. Method check
  if (req.method !== 'POST') {
    return sendJson(res, 405, {
      success: false,
      requestId,
      error: 'Method not allowed. Use POST.',
      code: 'METHOD_NOT_ALLOWED',
    })
  }

  // 2. Rate limiting check (25 evaluations per hour per IP)
  const clientIp = getClientIp(req)
  const rateLimit = checkRateLimit(clientIp, { limit: 25, windowMs: 3600000 })
  if (!rateLimit.allowed) {
    logEvent({
      level: 'warn',
      event: 'rate_limit_exceeded',
      requestId,
      metadata: { ip: clientIp, limit: rateLimit.limit },
    })
    return sendJson(res, 429, {
      success: false,
      requestId,
      fallback: true,
      isQuotaExceeded: false,
      error: `Rate limit exceeded. Maximum 25 evaluations per hour allowed. Try again in ${rateLimit.retryAfterSeconds}s.`,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
      code: 'RATE_LIMIT_EXCEEDED',
      notice: 'Rate limit reached. FOCAS Basic Evaluation is ready to help you continue offline.',
    })
  }

  try {
    // 3. Body parsing and size check (enforced max 64KB)
    const body = await parseJsonBody(req)
    const form = body?.form

    // 4. Input validation
    if (!form || typeof form !== 'object') {
      return sendJson(res, 400, {
        success: false,
        requestId,
        error: 'Missing required "form" object in request body.',
        code: 'INVALID_INPUT',
      })
    }

    // Sanitize string lengths to prevent prompt injection or denial-of-service
    const cleanName = String(form.name || '').slice(0, 200).trim()
    const cleanProblem = String(form.problem || '').slice(0, 4000).trim()
    const cleanSolution = String(form.solution || '').slice(0, 4000).trim()
    const cleanCustomer = String(form.customer || '').slice(0, 1000).trim()
    const cleanSegment = String(form.segment || '').slice(0, 500).trim()
    const cleanMarket = String(form.market || '').slice(0, 500).trim()
    const cleanCurrent = String(form.current || '').slice(0, 2000).trim()
    const cleanCompetitors = String(form.competitors || '').slice(0, 2000).trim()
    const cleanDemand = String(form.demand || '').slice(0, 3000).trim()
    const cleanModel = String(form.model || '').slice(0, 1000).trim()
    const cleanStage = String(form.stage || 'Idea').slice(0, 50).trim()

    const hasDemand = cleanDemand.length > 0

    const evaluationPrompt = `You are FOCAS AI, a clear-thinking startup advisor.
Your job is to challenge this startup idea, explain what could make it succeed or fail, and give practical advice.

CRITICAL LANGUAGE RULES:
- Use simple, everyday English that a beginner can easily understand.
- Write short, clear sentences. Explain one idea at a time.
- Never use corporate buzzwords like "leverage synergies", "defensible moat", or "unlock scalable growth".
- If you use a business term, explain it in simple terms immediately.
- Clearly distinguish verified facts, estimates, and assumptions.
- Never invent competitors, statistics, or customer quotes.

STARTUP DETAILS:
- Name: ${cleanName || 'Untitled'}
- Description: ${String(form.description || '').slice(0, 2000) || 'N/A'}
- Problem: ${cleanProblem || 'N/A'}
- Proposed Solution: ${cleanSolution || 'N/A'}
- Target Customer: ${cleanCustomer || 'N/A'} (Segment: ${cleanSegment || 'N/A'}, Market: ${cleanMarket || 'N/A'})
- Existing Workarounds: ${cleanCurrent || 'N/A'}
- Competitors: ${cleanCompetitors || 'None specified'}
- Customer Demand Evidence: ${cleanDemand || 'None provided'}
- Business Model: ${cleanModel || 'N/A'}
- Stage: ${cleanStage || 'Idea'}

Output ONLY a single valid JSON object with these fields in simple, clear English:
{
  "executiveSummary": {
    "ideaSimple": "Explain the idea in simple everyday words (2-3 short sentences)",
    "problemOverview": "Explain what problem this fixes and what people do today without it (2-3 short sentences)",
    "intendedCustomer": "Who specifically needs this most right now (1-2 sentences)",
    "opportunityOverview": "Why this could be a good small business or product (2-3 short sentences)",
    "biggestConcern": "The single biggest reason this idea could fail (2 clear sentences)",
    "recommendedAction": "The exact first thing the founder should do this week to test this"
  },
  "problemAnalysis": {
    "exactProblem": "Break down the exact problem in plain English",
    "whoExperiencesIt": "Who hurts from this problem daily, and who can easily live without fixing it",
    "severity": "${hasDemand ? 'High - painful daily friction' : 'Medium - noticeable friction but needs validation'}",
    "currentWorkarounds": "What people do right now instead of buying a new tool",
    "evidenceStatus": "${hasDemand ? 'Evaluate whether the demand is real customer proof or just polite encouragement' : 'State plainly that this problem is still an unproven guess'}",
    "unverifiedAspects": "What important questions about the customer remain unanswered"
  },
  "customerAnalysis": {
    "primarySegment": "Specific primary customer profile",
    "earlyAdopters": "Who would adopt this first and why",
    "verifiedFacts": ["Known facts provided by the founder"],
    "hypotheses": ["Key customer assumptions that need validation"]
  },
  "marketAndCompetitors": {
    "existingAlternatives": ["What people currently use instead"],
    "relevantCompetitors": ["Known types of competitors or tools in this space"],
    "differentiationOpportunities": ["How this can stand out simply"]
  },
  "businessModel": {
    "whoPaysAndWhy": "Who hands over the money and why they would pay",
    "pricingHypotheses": "How much could be charged, and what needs to be true for customers to pay that",
    "acquisitionChallenges": "Why it might be hard or expensive to find customers, and how to reach them directly"
  },
  "risksAndWeaknesses": [
    {
      "risk": "Biggest failure risk 1",
      "whyItMatters": "Why this could cause the startup to fail",
      "severity": "High"
    },
    {
      "risk": "Failure risk 2",
      "whyItMatters": "Why this matters",
      "severity": "Medium"
    }
  ],
  "assumptionAnalysis": [
    {
      "assumption": "Critical assumption 1",
      "whyItMatters": "Why this must be true for the business to work",
      "testMethod": "How to test this in 1 week without code"
    },
    {
      "assumption": "Critical assumption 2",
      "whyItMatters": "Why this matters",
      "testMethod": "How to test this"
    }
  ],
  "experiments": [
    {
      "hypothesis": "What assumption are you testing?",
      "how": "Specific no-code test to run this week (e.g. 5 customer interviews or landing page)",
      "success": "What specific customer response proves the hypothesis"
    }
  ],
  "recommendedNextSteps": [
    "Step 1: The very first action to take this week",
    "Step 2: Second validation step",
    "Step 3: Third step"
  ],
  "score": ${hasDemand ? 70 : 60}
}`

    let rawOutput = ''
    let provider = 'openrouter'

    // 5. Attempt OpenRouter if API key is present
    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim()) {
      try {
        rawOutput = await callOpenRouter({
          messages: [
            {
              role: 'system',
              content: 'You are FOCAS AI, an expert startup advisor. Always return valid JSON only in plain simple English. Never wrap in extra markdown.',
            },
            {
              role: 'user',
              content: evaluationPrompt,
            },
          ],
          temperature: 0.25,
          maxTokens: 2000,
          timeoutMs: 30000,
          requestId,
        })
      } catch (openRouterErr) {
        const isQuota = openRouterErr.isQuotaExceeded || openRouterErr.status === 429
        logEvent({
          level: isQuota ? 'warn' : 'error',
          event: 'openrouter_eval_fallback_triggered',
          requestId,
          durationMs: Date.now() - startTime,
          error: openRouterErr.message,
          metadata: { isQuota },
        })

        if (isQuota) {
          return sendJson(res, 200, {
            success: false,
            requestId,
            fallback: true,
            isQuotaExceeded: true,
            error: openRouterErr.message,
            notice: 'OpenRouter free model quota exhausted or rate-limited. FOCAS Basic Evaluation activated.',
          })
        }

        // If not quota exhausted, try local Ollama if running
        try {
          rawOutput = await callLocalOllamaChat({
            messages: [
              { role: 'system', content: 'You are FOCAS AI. Return valid JSON only.' },
              { role: 'user', content: evaluationPrompt },
            ],
            timeoutMs: 20000,
            requestId,
          })
          provider = 'ollama-fallback'
        } catch {
          return sendJson(res, 200, {
            success: false,
            requestId,
            fallback: true,
            isQuotaExceeded: false,
            error: openRouterErr.message,
            notice: 'AI is temporarily unavailable. FOCAS Basic Evaluation is ready to help you continue.',
          })
        }
      }
    } else {
      // No OpenRouter API key configured: try local Ollama for local dev
      try {
        rawOutput = await callLocalOllamaChat({
          messages: [
            { role: 'system', content: 'You are FOCAS AI. Return valid JSON only.' },
            { role: 'user', content: evaluationPrompt },
          ],
          timeoutMs: 20000,
          requestId,
        })
        provider = 'ollama'
      } catch (ollamaErr) {
        return sendJson(res, 200, {
          success: false,
          requestId,
          fallback: true,
          isQuotaExceeded: false,
          error: 'AI is unavailable (no key or offline). FOCAS Basic Evaluation activated.',
          notice: 'AI is temporarily unavailable. FOCAS Basic Evaluation is ready to help you continue.',
        })
      }
    }

    // 6. Parse and validate JSON output
    const cleanedJsonStr = extractJsonObject(rawOutput)
    try {
      const parsedData = JSON.parse(cleanedJsonStr)
      if (!parsedData || typeof parsedData !== 'object' || Object.keys(parsedData).length === 0) {
        throw new Error('Empty JSON response from AI')
      }

      logEvent({
        level: 'info',
        event: 'evaluate_completed_successfully',
        requestId,
        durationMs: Date.now() - startTime,
        metadata: { provider },
      })

      return sendJson(res, 200, {
        success: true,
        requestId,
        provider,
        model: provider === 'openrouter' ? OPENROUTER_MODEL : 'local-ollama',
        data: parsedData,
      })
    } catch (parseErr) {
      logEvent({
        level: 'warn',
        event: 'ai_json_parse_failed',
        requestId,
        error: parseErr.message,
      })
      return sendJson(res, 200, {
        success: false,
        requestId,
        fallback: true,
        isQuotaExceeded: false,
        error: 'AI returned empty or unparseable response.',
        notice: 'AI returned non-standard format. FOCAS Basic Evaluation generated this report reliably.',
      })
    }
  } catch (err) {
    const statusCode = err.status || 500
    logEvent({
      level: 'error',
      event: 'server_evaluate_error',
      requestId,
      durationMs: Date.now() - startTime,
      error: err.message,
    })

    return sendJson(res, statusCode === 413 ? 413 : 200, {
      success: false,
      requestId,
      fallback: true,
      isQuotaExceeded: false,
      error: err.message || 'Internal evaluation failure',
      notice: 'Server error processing evaluation. FOCAS Basic Evaluation is ready to help you continue.',
    })
  }
}
