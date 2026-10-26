/**
 * FOCAS - Production Server-Side Shared Utilities
 *
 * Deterministic Founder Intelligence Platform (Zero External AI API Dependencies).
 * Provides:
 * 1. Safe JSON request parsing with strict body size limits (max 64KB).
 * 2. Sliding-window rate limiter & usage telemetry for abuse protection.
 * 3. Request tracking (requestId) and structured safe logging (zero secrets/PII stored).
 * 4. Standardized HTTP response helpers.
 */

export const MAX_BODY_BYTES = 64 * 1024 // 64 KB

const SERVER_START_TIME = Date.now()

// ============================================================================
// 1. In-Memory Usage Metrics & Telemetry (No Secrets or User Content Stored)
// ============================================================================
const metrics = {
  totalRequests: 0,
  successfulCalls: 0,
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

export function checkRateLimit(ip, { limit = 60, windowMs = 3600000 } = {}) {
  const now = Date.now()
  const cleanIp = (ip || 'unknown').replace(/[^a-zA-Z0-9.:_-]/g, '').slice(0, 45)

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
// 3. Request Tracking & Safe Structured Logging
// ============================================================================
export function getRequestId(req) {
  const incoming = req.headers?.['x-request-id']
  if (incoming && typeof incoming === 'string') {
    return incoming.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64)
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function logEvent({
  level = 'info',
  event,
  requestId = 'req_unknown',
  durationMs,
  status,
  metadata = {},
}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    requestId,
    ...(durationMs !== undefined ? { durationMs } : {}),
    ...(status !== undefined ? { status } : {}),
    ...metadata,
  }
  console.log(JSON.stringify(entry))
}

// ============================================================================
// 4. Request Body Parsing & Response Helpers
// ============================================================================
export async function parseJsonBody(req, maxBytes = MAX_BODY_BYTES) {
  if (req.body && typeof req.body === 'object') {
    return req.body
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      const err = new Error('Invalid JSON string in request body.')
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
        const err = new Error(`Payload exceeds maximum allowed size of ${maxBytes / 1024} KB.`)
        err.status = 413
        reject(err)
        req.destroy()
        return
      }
      raw += chunk
    })

    req.on('end', () => {
      if (!raw || !raw.trim()) {
        resolve({})
        return
      }
      try {
        const parsed = JSON.parse(raw)
        resolve(parsed)
      } catch {
        const err = new Error('Malformed JSON payload.')
        err.status = 400
        reject(err)
      }
    })

    req.on('error', err => reject(err))
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
