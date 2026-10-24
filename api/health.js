import { sendJson, getRequestId, getTelemetry } from './_shared.js'

export default function handler(req, res) {
  const requestId = getRequestId(req)
  const telemetry = getTelemetry()
  return sendJson(res, 200, {
    status: 'healthy',
    requestId,
    timestamp: new Date().toISOString(),
    uptimeSeconds: telemetry.uptimeSeconds,
  })
}
