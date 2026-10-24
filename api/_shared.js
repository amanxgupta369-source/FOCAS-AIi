/**
 * FOCAS AI - Production Server-Side Shared Utilities
 *
 * Provides:
 * 1. Secure OpenRouter API communication with server-side OPENROUTER_API_KEY.
 * 2. Request tracking (requestId) and structured logging (zero API key/PII leaks).
 * 3. Strict body size limits (max 64KB) and payload validation.
 * 4. Controlled retries (max 1 retry for transient 502/503, ZERO retries for 429 quota exhaustion).
 * 5. Sliding-window rate limiter & usage telemetry for abuse protection.
 * 6. Standardized API response helpers.
 */

export const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
export const OPENROUTER_MODEL = 'qwen/qwen-2.5-7b-instruct:free'
export const OPENROUTER_FALLBACK_MODELS = [
  'qwen/qwen-2.5-7b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'openrouter/free',
]
export const LOCAL_OLLAMA_BASE = 'http://127.0.0.1:11434'
export const MAX_BODY_BYTES = 64 * 1024 // 64 KB

const SERVER_START_TIME = Date.now()

// ============================================================================
// 1. In-Memory Usage Metrics & Telemetry (No Secrets or User Content Stored)
// ============================================================================
const metrics = {
  totalRequests: 0,
  successfulAiCalls: 0,
  fallbackBasicCalls: 0,
  quotaHits429: 0,
  rateLimitHits: 0,
  errorsCount: 0,
}

export function getTelemetry() {
  return {
    ...metrics,
    uptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
  }
}

// ============================================================================
// 2. Sliding-Window In-Memory Rate Limiter (Abuse & Overload Protection)
// ============================================================================
const rateLimitMap = new Map() // ip -> Array<timestamp>

export function checkRateLimit(ip, { limit = 30, windowMs = 3600000 } = {}) {
  const now = Date.now()
  const cleanIp = (ip || 'unknown').replace(/[^a-zA-Z0-9.:_-]/g, '').slice(0, 45)

  // Prune map if excessively large to avoid memory leaks
  if (rateLimitMap.size > 10000) {
    for (const [key, timestamps] of rateLimitMap.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs)
      if (valid.length === 0) rateLimitMap.delete(key)
      else rateLimitMap.set(key, valid)
    }
  }

  let timestamps = rateLimitMap.get(cleanIp) || []
  timestamps = timestamps.filter(t => now - t < windowMs)

  if (timestamps.length >= limit) {
    const oldest = timestamps[0]
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000))
    metrics.rateLimitHits++
    return {
      allowed: false,
      currentCount: timestamps.length,
      limit,
      retryAfterSeconds,
    }
  }

  timestamps.push(now)
  rateLimitMap.set(cleanIp, timestamps)
  return {
    allowed: true,
    currentCount: timestamps.length,
    limit,
    retryAfterSeconds: 0,
  }
}

export function getClientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for']
  if (forwarded) {
    return String(forwarded).split(',')[0].trim()
  }
  return req.headers?.['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1'
}

// ============================================================================
// 3. Request Tracking & Safe Structured Logging (Zero Secrets Leaked)
// ============================================================================
export function getRequestId(req) {
  const fromHeader = req.headers?.['x-request-id']
  if (fromHeader && typeof fromHeader === 'string' && fromHeader.length <= 64) {
    return fromHeader.replace(/[^a-zA-Z0-9_-]/g, '')
  }
  return 'req_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

/**
 * Emits structured log without ever logging API keys, tokens, or PII.
 */
export function logEvent({ level = 'info', event, requestId, durationMs, status, error, metadata = {} }) {
  const sanitizedMeta = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (/key|secret|token|auth|password|bearer/i.test(key)) {
      sanitizedMeta[key] = '[REDACTED]'
    } else if (typeof value === 'string' && value.length > 200) {
      sanitizedMeta[key] = value.slice(0, 200) + '... (truncated)'
    } else {
      sanitizedMeta[key] = value
    }
  }

  const logPayload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    requestId: requestId || 'none',
    durationMs: durationMs !== undefined ? Math.round(durationMs) : undefined,
    status: status || undefined,
    error: error ? String(error).slice(0, 300) : undefined,
    ...sanitizedMeta,
  }

  if (level === 'error') {
    console.error(JSON.stringify(logPayload))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logPayload))
  } else {
    console.log(JSON.stringify(logPayload))
  }
}

// ============================================================================
// 4. Input Parsing & Request Size Enforcement
// ============================================================================
export async function parseJsonBody(req, { maxBytes = MAX_BODY_BYTES } = {}) {
  metrics.totalRequests++

  if (req.body && typeof req.body === 'object') {
    return req.body
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    if (Buffer.byteLength(req.body) > maxBytes) {
      const err = new Error(`Request payload exceeds maximum allowed limit of ${maxBytes / 1024}KB.`)
      err.status = 413
      throw err
    }
    try {
      return JSON.parse(req.body)
    } catch {
      const err = new Error('Invalid JSON payload.')
      err.status = 400
      throw err
    }
  }

  return new Promise((resolve, reject) => {
    let raw = ''
    let totalBytes = 0

    req.on('data', chunk => {
      totalBytes += chunk.length
      if (totalBytes > maxBytes) {
        const err = new Error(`Request payload exceeds maximum allowed limit of ${maxBytes / 1024}KB.`)
        err.status = 413
        reject(err)
        return
      }
      raw += chunk
    })

    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        const err = new Error('Invalid JSON in request body.')
        err.status = 400
        reject(err)
      }
    })

    req.on('error', err => {
      reject(err)
    })
  })
}

export function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data)
  }
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

export function cleanThinkingTags(text) {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

export function extractJsonObject(raw) {
  const withoutThinking = cleanThinkingTags(raw)
  const codeBlockMatch = withoutThinking.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim()
  }
  const firstBrace = withoutThinking.indexOf('{')
  const lastBrace = withoutThinking.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return withoutThinking.slice(firstBrace, lastBrace + 1)
  }
  return withoutThinking
}

// ============================================================================
// 5. OpenRouter Client with Controlled Retries & Quota Protection
// ============================================================================
export async function callOpenRouter({
  messages,
  temperature = 0.25,
  maxTokens = 1400,
  timeoutMs = 25000,
  requestId = 'req_unknown',
}) {
  const apiKey = (process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || '').trim()
  if (!apiKey) {
    const err = new Error('OPENROUTER_API_KEY is not configured on the server.')
    err.status = 503
    err.code = 'CONFIG_MISSING_KEY'
    throw err
  }

  // Attempt up to 2 tries for transient network/502/503 errors.
  // STRICT RULE: If status === 429 (quota exhausted) or 401 (unauthorized), NEVER retry!
  const maxAttempts = 2
  let attempt = 0
  const modelsToTry = [OPENROUTER_MODEL, ...OPENROUTER_FALLBACK_MODELS.filter(m => m !== OPENROUTER_MODEL)]

  while (attempt < maxAttempts) {
    attempt++
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(new Error(`OpenRouter request timed out after ${timeoutMs / 1000}s`)), timeoutMs)
    const startTime = Date.now()

    try {
      const response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://focas-ai.app',
          'X-Title': 'FOCAS AI Startup Advisor',
        },
        body: JSON.stringify({
          models: modelsToTry,
          route: 'fallback',
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      })

      clearTimeout(timer)
      const durationMs = Date.now() - startTime

      // 401 Unauthorized: Invalid API key -> NO RETRY, throw immediately
      if (response.status === 401) {
        logEvent({
          level: 'error',
          event: 'openrouter_unauthorized',
          requestId,
          status: 401,
          durationMs,
        })
        const err = new Error('OpenRouter API key is invalid or unauthorized.')
        err.status = 401
        err.code = 'INVALID_API_KEY'
        throw err
      }

      // 429: Quota exhausted or rate limited -> NO RETRY LOOP
      if (response.status === 429) {
        metrics.quotaHits429++
        logEvent({
          level: 'warn',
          event: 'openrouter_quota_exhausted',
          requestId,
          status: 429,
          durationMs,
          metadata: { model: OPENROUTER_MODEL },
        })
        const err = new Error('OpenRouter free model quota exhausted or rate-limited.')
        err.status = 429
        err.code = 'RATE_LIMIT_EXCEEDED'
        err.isQuotaExceeded = true
        throw err
      }

      // Transient errors (502 Bad Gateway / 503 Service Unavailable / 504 Gateway Timeout)
      if ((response.status === 502 || response.status === 503 || response.status === 504) && attempt < maxAttempts) {
        logEvent({
          level: 'warn',
          event: 'openrouter_transient_error_retry',
          requestId,
          status: response.status,
          durationMs,
          metadata: { attempt, nextAction: 'retrying_once' },
        })
        await new Promise(r => setTimeout(r, 1200))
        continue
      }

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null)
        const errText = errorJson?.error?.message || response.statusText
        const err = new Error(`OpenRouter error (${response.status}): ${errText}`)
        err.status = response.status
        throw err
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      metrics.successfulAiCalls++

      logEvent({
        level: 'info',
        event: 'openrouter_call_success',
        requestId,
        status: 200,
        durationMs,
        metadata: { model: data.model || OPENROUTER_MODEL, tokensReturned: content.length },
      })

      return cleanThinkingTags(content)
    } catch (err) {
      clearTimeout(timer)

      // If quota exceeded or client aborted or invalid key, rethrow immediately without retrying
      if (
        err.isQuotaExceeded ||
        err.status === 429 ||
        err.status === 401 ||
        err.code === 'CONFIG_MISSING_KEY' ||
        err.code === 'INVALID_API_KEY'
      ) {
        throw err
      }

      // If transient network failure and attempts remain, retry once
      if (attempt < maxAttempts) {
        logEvent({
          level: 'warn',
          event: 'openrouter_network_retry',
          requestId,
          error: err.message,
          metadata: { attempt },
        })
        await new Promise(r => setTimeout(r, 1200))
        continue
      }

      metrics.errorsCount++
      throw err
    }
  }
}

/**
 * Fallback to local Ollama if developer has it running locally
 */
export async function callLocalOllamaChat({ messages, timeoutMs = 15000, requestId = 'req_local' }) {
  // CRITICAL: On Vercel or cloud production, Ollama at 127.0.0.1:11434 will NEVER exist.
  // Immediately throw so serverless execution does not hang for 20 seconds!
  const isCloudDeployment = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NODE_ENV === 'production'
  )
  if (isCloudDeployment) {
    throw new Error('Local Ollama is not available in cloud deployment environment (Vercel).')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error('Local Ollama timed out')), timeoutMs)

  try {
    // Detect active Ollama model (e.g. qwen3:4b or qwen2.5:1.5b)
    let modelToUse = 'qwen3:4b'
    try {
      const tagsRes = await fetch(`${LOCAL_OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(2000) })
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json()
        const models = (tagsData.models || []).map(m => m.name || m.model)
        if (models.length > 0) {
          const match = models.find(m => m.includes('qwen') || m.includes('llama')) || models[0]
          if (match) modelToUse = match
        }
      }
    } catch {
      // keep default modelToUse
    }

    const res = await fetch(`${LOCAL_OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        messages,
        stream: false,
        options: { num_predict: 1200, temperature: 0.6 },
      }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`Ollama status: ${res.status}`)
    const data = await res.json()
    return cleanThinkingTags(data?.message?.content || '')
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}
