import {
  parseJsonBody,
  sendJson,
  getRequestId,
  getClientIp,
  checkRateLimit,
  logEvent,
} from './_shared.js'

export default async function handler(req, res) {
  const requestId = getRequestId(req)
  const startTime = Date.now()

  if (req.method !== 'POST') {
    return sendJson(res, 405, {
      success: false,
      requestId,
      error: 'Method not allowed. Use POST.',
      code: 'METHOD_NOT_ALLOWED',
    })
  }

  const clientIp = getClientIp(req)
  const rateLimit = checkRateLimit(clientIp, { limit: 60, windowMs: 3600000 })
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
    const form = body?.form

    if (!form || typeof form !== 'object') {
      return sendJson(res, 400, {
        success: false,
        requestId,
        error: 'Missing required "form" object in request body.',
        code: 'INVALID_INPUT',
      })
    }

    const cleanName = String(form.name || 'Untitled Idea').slice(0, 200).trim()
    const cleanProblem = String(form.problem || '').slice(0, 4000).trim()
    const cleanCustomer = String(form.customer || 'Target Users').slice(0, 1000).trim()
    const cleanSolution = String(form.solution || form.description || '').slice(0, 4000).trim()
    const cleanWorkaround = String(form.current || '').slice(0, 2000).trim()
    const cleanModel = String(form.model || '').slice(0, 1000).trim()

    // Deterministic Evaluation Response
    const evaluationData = {
      executiveSummary: {
        ideaSimple: cleanName,
        problemOverview: cleanProblem,
        intendedCustomer: cleanCustomer,
        opportunityOverview: `Addresses ${cleanProblem.slice(0, 100)} by automating manual workarounds.`,
        biggestConcern: 'Unverified willingness to pay and habit inertia.',
        recommendedAction: 'Conduct 5 Mom Test customer interviews before writing software.',
      },
      problemAnalysis: {
        exactProblem: cleanProblem,
        whoExperiencesIt: cleanCustomer,
        whenAndWhy: 'During regular operational tasks when manual workarounds are used.',
        currentWorkarounds: cleanWorkaround || 'Spreadsheets, manual email chains, or doing nothing.',
        evidenceStatus: 'Hypothesis stage. Requires empirical customer discovery.',
        unverifiedAspects: 'Frequency and willingness to pay.',
      },
      customerAnalysis: {
        primarySegment: cleanCustomer,
        secondarySegment: 'Adjacent operators facing similar workflow friction.',
        needsAndMotivations: 'Reduce time spent and eliminate manual errors.',
        earlyAdopters: `${cleanCustomer} who currently spend >3 hours/week on manual workarounds.`,
        unlikelyUsersAndWhy: 'Casual users who only encounter this once a year.',
        verifiedFacts: [],
        hypotheses: [`Assumption: ${cleanCustomer} considers this a top-3 monthly problem.`],
      },
      solutionAnalysis: {
        howItWorks: cleanSolution,
        featureMapping: [
          { feature: 'Core Automation Loop', problemSolved: cleanProblem.slice(0, 80) },
        ],
        mvpScope: 'Build only the single automated core loop in 14 days.',
        buildFirst: ['Primary data input form', 'Core output deliverable'],
        postpone: ['Native mobile apps', 'Enterprise SSO', 'Automated team billing'],
        adoptionChallenges: 'Habit inertia and onboarding friction.',
      },
      marketAndCompetitors: {
        relevantCompetitors: [String(form.competitors || 'None specifically identified by founder.')],
        existingAlternatives: [
          cleanWorkaround || 'Manual spreadsheets and email',
          'Inaction / enduring the problem',
        ],
        competitorComparison: [],
        differentiationOpportunities: ['Extreme simplicity', 'Faster time-to-first-value'],
        researchLimitationsNotice: 'FOCAS does not fabricate fictional competitor statistics.',
      },
      businessModel: {
        possibleRevenueModels: [cleanModel || 'Direct Monthly Subscription ($49 - $99/mo)'],
        whoPaysAndWhy: `${cleanCustomer} pays to eliminate operational waste and errors.`,
        pricingHypotheses: 'Charge upfront flat pricing for early pilot adopters.',
        acquisitionChallenges: 'Outbound sales requires direct founder outreach.',
        retentionChallenges: 'Episodic problems face high churn risk.',
      },
      risksAndWeaknesses: [
        {
          risk: 'Willingness to Pay Deficiency',
          whyItMatters: 'Polite verbal encouragement often fails to convert to payment.',
          failureMechanism: 'Prospects praise the idea but refuse to pay when asked.',
          severity: 'High',
          mitigationStrategy: 'Ask for a pre-order deposit or signed LOI before building.',
        },
        {
          risk: 'Habit Inertia',
          whyItMatters: 'Users default to free spreadsheets rather than learning new software.',
          failureMechanism: 'Switching costs exceed perceived daily benefit.',
          severity: 'High',
          mitigationStrategy: 'Make time-to-value under 3 minutes with 1-click import.',
        },
      ],
      assumptionAnalysis: [
        {
          assumption: `${cleanCustomer} experiences this problem acutely enough to pay.`,
          whyItMatters: 'Core foundation of commercial viability.',
          ifFalseConsequence: 'High customer acquisition cost and lack of traction.',
          testMethod: 'Conduct 5 Mom Test interviews.',
        },
      ],
      experiments: [
        {
          hypothesis: `${cleanCustomer} will confirm acute pain and existing budget.`,
          how: 'Conduct 5 Mom Test interviews exploring past behavior and workaround costs.',
          participants: `5 ${cleanCustomer}`,
          effort: '1 week',
          success: '4/5 confirm acute pain',
          positive: 'Proceed to concierge test',
          negative: 'Pivot target segment or problem statement',
        },
      ],
      score: 45,
    }

    logEvent({
      level: 'info',
      event: 'deterministic_evaluation_generated',
      requestId,
      durationMs: Date.now() - startTime,
    })

    return sendJson(res, 200, {
      success: true,
      requestId,
      model: 'FOCAS Deterministic Engine',
      data: evaluationData,
      deterministic: true,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return sendJson(res, err.status || 500, {
      success: false,
      requestId,
      error: err.message || 'Internal server error.',
      code: err.code || 'INTERNAL_ERROR',
    })
  }
}
