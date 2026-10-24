import {
  callOpenRouter,
  callLocalOllamaChat,
  parseJsonBody,
  sendJson,
  cleanThinkingTags,
  getRequestId,
  getClientIp,
  checkRateLimit,
  logEvent,
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

  // 2. Rate limiting check (60 chat requests per hour per IP)
  const clientIp = getClientIp(req)
  const rateLimit = checkRateLimit(clientIp, { limit: 60, windowMs: 3600000 })
  if (!rateLimit.allowed) {
    logEvent({
      level: 'warn',
      event: 'chat_rate_limit_exceeded',
      requestId,
      metadata: { ip: clientIp },
    })
    return sendJson(res, 429, {
      success: false,
      requestId,
      error: `Rate limit exceeded. Maximum 60 chat messages per hour. Try again in ${rateLimit.retryAfterSeconds}s.`,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Rate limit reached. Please wait a moment before sending more messages.',
    })
  }

  try {
    // 3. Body parsing (enforced 64KB max)
    const body = await parseJsonBody(req)
    const { form = {}, analysis, messages = [] } = body

    // 4. Input validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return sendJson(res, 400, {
        success: false,
        requestId,
        error: 'Messages must be a non-empty array of chat items.',
        code: 'INVALID_INPUT',
      })
    }

    const hasIdeaContext = Boolean(analysis || (form && form.name && String(form.name).trim().length > 0))

    let systemPrompt = ''
    if (hasIdeaContext) {
      const contextSummary = analysis
        ? `Startup Evaluation Context:
- Name: ${String(form.name || 'Untitled').slice(0, 150)}
- Problem: ${String(analysis.problemAnalysis?.exactProblem || form.problem || '').slice(0, 500)}
- Intended Customer: ${String(analysis.customerAnalysis?.primarySegment || form.customer || '').slice(0, 300)}
- Current Workaround: ${String(analysis.problemAnalysis?.currentWorkarounds || form.current || '').slice(0, 300)}
- Executive Summary: ${String(analysis.executiveSummary?.ideaSimple || '').slice(0, 300)}
- Biggest Concern: ${String(analysis.executiveSummary?.biggestConcern || '').slice(0, 300)}
- Key Risks: ${(analysis.risksAndWeaknesses || []).slice(0, 4).map(r => `${r.risk}`).join('; ')}
- Critical Assumptions: ${(analysis.assumptionAnalysis || []).slice(0, 4).map(a => a.assumption).join('; ')}
- Verdict: ${analysis.overallVerdict?.decision || analysis.finalRecommendation?.verdict || ''}`
        : `Startup Details:
- Name: ${String(form.name || 'Untitled').slice(0, 150)}
- Problem: ${String(form.problem || 'N/A').slice(0, 500)}
- Customer: ${String(form.customer || 'N/A').slice(0, 300)}
- Proposed Solution: ${String(form.solution || 'N/A').slice(0, 500)}`

      systemPrompt = `You are FOCAS AI, an honest, clear-thinking startup advisor talking with a founder about their startup idea.
You have access to their startup idea details and evaluation context below:

${contextSummary}

HOW YOU MUST TALK (MANDATORY RULES):
1. Use simple, everyday English. Write like a thoughtful human mentor, not a business textbook or robot.
2. Write short, clear sentences. Explain one idea at a time.
3. A complete beginner must understand your answer without looking up business terms.
4. Avoid corporate jargon completely.
5. If you must use a technical or business word, explain what it means in plain English right away.
6. Do not automatically agree with the founder. If an assumption looks weak, explain why it might fail.
7. Ask ONE or TWO focused questions at a time instead of overwhelming the user.
8. Give practical, concrete next steps with clear reasons.
9. Distinguish verified facts from speculation.
10. Never guarantee success.`
    } else {
      systemPrompt = `You are FOCAS AI, a thoughtful, honest thinking partner for aspiring founders, first-time entrepreneurs, student builders, and indie hackers.

YOUR PURPOSE:
Help users discover real problems worth solving, explore markets, brainstorm opportunities, challenge assumptions, and learn how to validate before building. You work with users who do not have a startup idea yet, as well as those exploring broad concepts.

YOUR BEHAVIOR (MANDATORY RULES):
1. Think WITH the user, not FOR them. Act like an honest, thoughtful mentor, not a generic chatbot that agrees with everything.
2. Use simple, everyday English. Write short, clear sentences. A beginner must understand everything immediately.
3. Challenge weak reasoning respectfully. Explain WHY an idea or assumption might fail in the real world.
4. When the user has no startup idea, guide them to discover problems from their daily observations, job experiences, frustrations, or specific skills.
5. When the user's question is vague, help them clarify it gently.
6. Ask ONE or TWO focused questions at a time. Never overwhelm the user with long lists of questions.
7. Give practical, concrete next steps rather than motivational filler.
8. Distinguish verified facts from guesses and speculation.
9. Never guarantee that an idea or business will succeed.
10. When a clear problem and solution start to form, encourage the user to run a structured evaluation.`
    }

    // Sanitize user messages (limit to recent 20 messages, each max 2000 chars)
    const validUserMessages = messages
      .slice(-20)
      .filter(m => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content).trim().slice(0, 2000),
      }))

    const chatPayloadMessages = [
      { role: 'system', content: systemPrompt },
      ...validUserMessages,
    ]

    // 5. Call OpenRouter if configured
    const hasKey = Boolean((process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || '').trim())
    const isCloud = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production')

    if (hasKey) {
      try {
        const reply = await callOpenRouter({
          messages: chatPayloadMessages,
          temperature: 0.65,
          maxTokens: 800,
          timeoutMs: 25000,
          requestId,
        })
        return sendJson(res, 200, {
          success: true,
          requestId,
          provider: 'openrouter',
          message: cleanThinkingTags(reply),
        })
      } catch (openRouterErr) {
        logEvent({
          level: 'warn',
          event: 'chat_openrouter_failed',
          requestId,
          error: openRouterErr.message,
        })

        // Try local Ollama fallback ONLY if running in local environment (not cloud / Vercel)
        if (!isCloud) {
          try {
            const fallbackReply = await callLocalOllamaChat({
              messages: chatPayloadMessages,
              timeoutMs: 15000,
              requestId,
            })
            return sendJson(res, 200, {
              success: true,
              requestId,
              provider: 'ollama-fallback',
              message: cleanThinkingTags(fallbackReply),
            })
          } catch {
            // Local Ollama offline
          }
        }

        const statusCode = openRouterErr.status || 502
        const isRateLimit = openRouterErr.isQuotaExceeded || openRouterErr.status === 429
        const isInvalidKey = openRouterErr.status === 401 || openRouterErr.code === 'INVALID_API_KEY'
        const isTimeout = openRouterErr.name === 'AbortError' || openRouterErr.message?.includes('timed out')

        let userFriendlyMsg = 'The AI service encountered a temporary error. Please try again in a moment.'
        if (isInvalidKey) {
          userFriendlyMsg = 'The configured OPENROUTER_API_KEY is invalid or unauthorized. Please verify your OpenRouter key.'
        } else if (isRateLimit) {
          userFriendlyMsg = 'The free AI service is temporarily busy due to provider rate limits. Please wait 15–20 seconds and ask again.'
        } else if (isTimeout) {
          userFriendlyMsg = 'The AI request timed out after 25s. Please try again in a moment.'
        }

        return sendJson(res, statusCode >= 400 && statusCode < 600 ? statusCode : 502, {
          success: false,
          requestId,
          isQuotaExceeded: isRateLimit,
          code: openRouterErr.code || (isRateLimit ? 'RATE_LIMIT_EXCEEDED' : 'AI_ERROR'),
          error: userFriendlyMsg,
          message: userFriendlyMsg,
        })
      }
    } else {
      // No key configured on server
      if (!isCloud) {
        try {
          const reply = await callLocalOllamaChat({
            messages: chatPayloadMessages,
            timeoutMs: 15000,
            requestId,
          })
          return sendJson(res, 200, {
            success: true,
            requestId,
            provider: 'ollama',
            message: cleanThinkingTags(reply),
          })
        } catch {
          // fall through to error
        }
      }

      return sendJson(res, 503, {
        success: false,
        requestId,
        code: 'CONFIG_MISSING_KEY',
        error: 'OPENROUTER_API_KEY is not configured on your server.',
        message:
          'OPENROUTER_API_KEY is not configured on your server. Please add OPENROUTER_API_KEY in your Vercel Project Settings > Environment Variables.',
      })
    }
  } catch (err) {
    const statusCode = err.status || 500
    logEvent({
      level: 'error',
      event: 'chat_handler_error',
      requestId,
      error: err.message,
    })
    return sendJson(res, statusCode === 413 ? 413 : 500, {
      success: false,
      requestId,
      error: err.message || 'Server error processing chat request.',
      message: 'Server error processing chat request.',
    })
  }
}
