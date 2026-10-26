import type { ExecutionStep, TimelineMilestone } from '../../types'
import type { UnderstoodIdea } from './ideaUnderstanding'

export interface ActionPlanResult {
  executionPlan: ExecutionStep[]
  timelineMilestones: TimelineMilestone[]
  nextThreeActions: {
    rank: number
    title: string
    what: string
    how: string
    whyPriority: string
    targetResult: string
    followOnDecision: string
  }[]
  nextFiveActions: string[]
}

/**
 * Module 10: Action Plan Generator
 * Converts findings and frameworks into an actionable, prioritized roadmap with clear deliverables and decision gates.
 */
export function generateActionPlan(
  understood: UnderstoodIdea
): ActionPlanResult {
  const customer = understood.cleanCustomer || 'target customers'
  const isB2B = understood.signals.isB2B

  const executionPlan: ExecutionStep[] = [
    {
      priority: 1,
      what: `Conduct 5 Customer Discovery Calls with ${customer}`,
      how: [
        'Identify 15 potential interviewees in online communities, LinkedIn, or personal network',
        'Ask open-ended Mom Test questions about recent experiences with this problem',
        'Inquire about what they paid for tools, consultants, or employee hours to handle it',
      ],
      why: 'Verifies whether the pain is severe and recurring before investing any engineering time.',
      evidenceToCollect: 'Direct quotes, recorded numbers, and specific workaround workflows.',
      howToInterpret: 'If 4/5 confirm acute frustration, proceed. If they describe it as a minor issue, rethink.',
      nextStep: 'Offer a manual concierge pilot to the most enthusiastic interviewee.',
    },
    {
      priority: 2,
      what: 'Deliver a Manual Concierge Solution for 2 Test Users',
      how: [
        'Take real customer input data manually over email or spreadsheet',
        'Handcraft the desired output deliverable behind the scenes',
        'Deliver the completed result within 24 hours and observe their reaction',
      ],
      why: 'Proves the value proposition and reveals edge cases without writing complex frontend code.',
      evidenceToCollect: 'User relief, speed of response, and unsolicited questions about pricing.',
      howToInterpret: 'If users rely on the deliverable, your solution works. If they ignore it, the output lacks value.',
      nextStep: 'Request an early bird pre-commitment or pilot deposit.',
    },
    {
      priority: 3,
      what: 'Secure Skin-in-the-Game Pre-Commitment',
      how: [
        isB2B
          ? 'Draft a simple 1-page pilot letter offering 50% discount for feedback and an early deposit'
          : 'Set up a simple 1-page pre-order page with Stripe test deposit ($10 refundable)',
        'Present it directly to the concierge test participants',
      ],
      why: 'Financial or reputational commitment is the only unambiguous validation metric.',
      evidenceToCollect: 'Stripe receipts or signed pilot letters.',
      howToInterpret: 'Positive payment = strong green light to build. Hesitation = revisit pricing or pain severity.',
      nextStep: 'Build the automated core loop MVP.',
    },
    {
      priority: 4,
      what: 'Build the Minimal Automated Core Loop (MVP)',
      how: [
        'Build only the primary input form and the core automation processing engine',
        'Omit secondary features: social login, dark mode, complex team settings, mobile app',
        'Deploy on modern web infrastructure (e.g. Vercel) with clean error handling',
      ],
      why: 'Minimizes time-to-first-customer and preserves development energy.',
      evidenceToCollect: 'Customer activation rate and time spent inside the product.',
      howToInterpret: 'If users return weekly without reminders, you have early retention.',
      nextStep: 'Test Sean Ellis 40% product-market fit benchmark.',
    },
  ]

  const timelineMilestones: TimelineMilestone[] = [
    {
      action: 'Phase 1: Customer Discovery & Problem Verification',
      timeEstimate: 'Week 1 (Days 1–7)',
      dependency: 'Completed Idea Framing',
      expectedDeliverable: '5 logged interview transcripts with verified pain points',
      decisionPoint: 'Does the problem justify paying to eliminate it? If yes, continue to Phase 2; if no, pivot.',
    },
    {
      action: 'Phase 2: Concierge / Manual Solution Delivery',
      timeEstimate: 'Week 2 (Days 8–14)',
      dependency: 'Confirmed Pain Points from Phase 1',
      expectedDeliverable: '2 happy test users served manually via spreadsheets/email',
      decisionPoint: 'Did the manual deliverable create immense relief? If yes, test pre-commitment.',
    },
    {
      action: 'Phase 3: Pre-Commitment & Pilot Agreements',
      timeEstimate: 'Week 3 (Days 15–21)',
      dependency: 'Validated Concierge Results',
      expectedDeliverable: 'At least 1-2 pre-orders, deposits, or signed pilot LOIs',
      decisionPoint: 'Are customers willing to commit money/reputation? If yes, initiate software build.',
    },
    {
      action: 'Phase 4: Smallest Possible Automated MVP Build',
      timeEstimate: 'Weeks 4–6 (Days 22–42)',
      dependency: 'Secured Pre-Commitments',
      expectedDeliverable: 'Functional web application delivering the core loop to pilot users',
      decisionPoint: 'Do early users log in weekly and achieve the promised outcome?',
    },
  ]

  const nextThreeActions = [
    {
      rank: 1,
      title: 'Interview 5 Target Customers',
      what: `Conduct 5 Mom-Test discovery calls with ${customer} without pitching your software.`,
      how: 'Reach out on LinkedIn, niche forums, or via warm introductions with a research inquiry.',
      whyPriority: 'Validates that the problem is top-of-mind and acutely felt before any code is written.',
      targetResult: '5 logged interview records with direct quotes and verified budget or workaround costs.',
      followOnDecision: 'If pain is confirmed by at least 4/5, proceed to manual concierge testing; otherwise pivot.',
    },
    {
      rank: 2,
      title: 'Map Existing Workaround & Costs',
      what: 'Document the exact steps, tools, and hourly costs customers currently spend on this task.',
      how: 'Shadow a target customer or ask them to screen-share their current manual process.',
      whyPriority: 'You cannot displace a customer\'s current habit without understanding its exact mechanics.',
      targetResult: 'A step-by-step breakdown of the current workflow with estimated cost/time per week.',
      followOnDecision: 'Design your MVP to eliminate at least 50% of the friction in that specific workflow.',
    },
    {
      rank: 3,
      title: 'Run a 48-Hour Concierge Test',
      what: 'Solve the problem for 2 people manually using off-the-shelf tools, email, or spreadsheets.',
      how: 'Offer to handle the task for free in exchange for real-time feedback on the output deliverable.',
      whyPriority: 'Validates that the deliverable provides real value before spending weeks coding automation.',
      targetResult: '2 completed manual deliverables and documented feedback from recipients.',
      followOnDecision: 'If both users ask to keep using it, ask for a pre-order deposit and begin the software MVP.',
    },
  ]

  const nextFiveActions = [
    `Schedule and conduct 5 Mom Test discovery calls with ${customer} to verify recurring pain.`,
    'Document the exact manual steps and spreadsheets target users currently use to cope with the problem.',
    'Deliver the promised outcome manually to 2 prospective customers as a concierge test.',
    'Ask for an early pilot deposit, pre-order, or Letter of Intent to verify commercial buying intent.',
    'Scope and build only the single core loop MVP in 14 days, postponing non-essential features.',
  ]

  return {
    executionPlan,
    timelineMilestones,
    nextThreeActions,
    nextFiveActions,
  }
}
