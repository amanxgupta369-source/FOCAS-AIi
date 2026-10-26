import {
  parseJsonBody,
  sendJson,
  getRequestId,
  getClientIp,
  checkRateLimit,
} from './_shared.js'

export default async function handler(req, res) {
  const requestId = getRequestId(req)

  if (req.method !== 'POST') {
    return sendJson(res, 405, {
      success: false,
      requestId,
      error: 'Method not allowed. Use POST.',
      code: 'METHOD_NOT_ALLOWED',
    })
  }

  const clientIp = getClientIp(req)
  const rateLimit = checkRateLimit(clientIp, { limit: 120, windowMs: 3600000 })
  if (!rateLimit.allowed) {
    return sendJson(res, 429, {
      success: false,
      requestId,
      error: `Rate limit exceeded. Try again in ${rateLimit.retryAfterSeconds}s.`,
      code: 'RATE_LIMIT_EXCEEDED',
    })
  }

  try {
    const body = await parseJsonBody(req)
    const { messages = [], form = {} } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return sendJson(res, 400, {
        success: false,
        requestId,
        error: 'Messages must be a non-empty array.',
        code: 'INVALID_INPUT',
      })
    }

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || ''
    const q = lastUserMsg.toLowerCase().trim()
    const name = form.name || 'your startup idea'

    let reply = ''

    if (q.includes('score') || q.includes('rating') || q.includes('point')) {
      reply =
        `### FOCAS Readiness Index\n\n` +
        `The readiness index is an **evidence-completeness heuristic**, not a speculative forecast. ` +
        `It measures the balance between verified facts and unproven assumptions for "${name}".\n\n` +
        `To increase your score, record 3 to 5 customer discovery interviews in the "Customer Interviews" tab and verify willingness to pay.`
    } else if (q.includes('risk') || q.includes('fail') || q.includes('danger')) {
      reply =
        `### Primary Risks for "${name}"\n\n` +
        `1. **Willingness to Pay Deficiency**: Customers often express polite encouragement but refuse to authorize budget when presented with a checkout link or invoice.\n` +
        `2. **Habit Inertia**: Users frequently prefer staying with free spreadsheets rather than investing hours learning a new platform.\n` +
        `3. **Distribution Failure**: Building software before establishing an outbound or content channel leaves the product with zero traffic.`
    } else if (q.includes('interview') || q.includes('question') || q.includes('mom test') || q.includes('talk')) {
      reply =
        `### 5 Non-Leading Discovery Questions (The Mom Test)\n\n` +
        `1. "When was the last time this specific problem happened to you?"\n` +
        `2. "Can you walk me through your workflow when it occurred?"\n` +
        `3. "What tools, spreadsheets, or manual steps did you use to fix it?"\n` +
        `4. "How much did you spend in time or money on that workaround?"\n` +
        `5. "What other solutions have you actively tried in the past year?"`
    } else if (q.includes('experiment') || q.includes('validate') || q.includes('test')) {
      reply =
        `### Recommended Validation Experiments\n\n` +
        `- **Discovery Sprint**: Conduct 5 Mom-Test interviews focused on past behavior and real workaround costs.\n` +
        `- **Concierge MVP**: Manually execute the task for 2 prospective customers via spreadsheets and email before coding.\n` +
        `- **Skin-in-the-Game Test**: Secure a refundable pilot deposit or non-binding Letter of Intent (LOI).`
    } else {
      reply =
        `### FOCAS Founder Intelligence Advisor\n\n` +
        `I operate as a deterministic, first-principles startup advisor without external AI dependencies.\n\n` +
        `You can ask:\n` +
        `- "Why was this score assigned?"\n` +
        `- "What is my biggest risk?"\n` +
        `- "What questions should I ask customers?"\n` +
        `- "What experiments should I run?"\n` +
        `- "What should I build first?"`
    }

    return sendJson(res, 200, {
      success: true,
      requestId,
      message: reply,
      text: reply,
      deterministic: true,
    })
  } catch (err) {
    return sendJson(res, err.status || 500, {
      success: false,
      requestId,
      error: err.message || 'Internal server error.',
      code: 'INTERNAL_ERROR',
    })
  }
}
