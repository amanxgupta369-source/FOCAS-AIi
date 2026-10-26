import {
  sendJson,
  getRequestId,
  getTelemetry,
} from './_shared.js'

export default async function handler(req, res) {
  const requestId = getRequestId(req)
  const telemetry = getTelemetry()

  return sendJson(res, 200, {
    status: 'ok',
    requestId,
    online: true,
    provider: 'focas-deterministic-engine',
    model: 'FOCAS Founder Intelligence Library (11 Frameworks)',
    deterministic: true,
    telemetry: {
      uptimeSeconds: telemetry.uptimeSeconds,
      totalRequests: telemetry.totalRequests,
      rateLimitHits: telemetry.rateLimitHits,
    },
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  })
}
