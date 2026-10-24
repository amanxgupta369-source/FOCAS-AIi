import {
  sendJson,
  getRequestId,
  LOCAL_OLLAMA_BASE,
  OPENROUTER_MODEL,
  getTelemetry,
} from './_shared.js'

export default async function handler(req, res) {
  const requestId = getRequestId(req)
  const hasKey = Boolean(
    (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim()) ||
    (process.env.VITE_OPENROUTER_API_KEY && process.env.VITE_OPENROUTER_API_KEY.trim())
  )
  const isCloud = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production')

  let localOllamaConnected = false
  if (!hasKey && !isCloud) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 1500)
      const testRes = await fetch(`${LOCAL_OLLAMA_BASE}/api/tags`, { signal: controller.signal })
      clearTimeout(timer)
      localOllamaConnected = testRes.ok
    } catch {
      localOllamaConnected = false
    }
  }

  const isOnline = hasKey || localOllamaConnected
  const telemetry = getTelemetry()

  return sendJson(res, 200, {
    status: 'ok',
    requestId,
    online: isOnline,
    provider: hasKey ? 'openrouter' : localOllamaConnected ? 'ollama' : 'offline',
    model: hasKey ? OPENROUTER_MODEL : localOllamaConnected ? 'qwen2.5:1.5b (local)' : 'none',
    hasOpenRouterKey: hasKey, // safe boolean indicator, never the secret
    telemetry: {
      uptimeSeconds: telemetry.uptimeSeconds,
      totalRequests: telemetry.totalRequests,
      successfulAiCalls: telemetry.successfulAiCalls,
      fallbackBasicCalls: telemetry.fallbackBasicCalls,
      quotaHits429: telemetry.quotaHits429,
      rateLimitHits: telemetry.rateLimitHits,
    },
    version: '1.2.0',
    timestamp: new Date().toISOString(),
  })
}
