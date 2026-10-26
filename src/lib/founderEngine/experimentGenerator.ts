import type { Experiment } from '../../types'
import type { UnderstoodIdea } from './ideaUnderstanding'
import { getFrameworkById } from './knowledgeLibrary'

export interface DetailedValidationExperiment {
  id: string
  objective: string
  targetParticipants: string
  actionsToTake: string
  questionsToAsk: string[]
  evidenceToCollect: string
  successCriterion: string
  positiveInterpretation: string
  negativeInterpretation: string
  inconclusiveInterpretation: string
  status: 'Not started' | 'In progress' | 'Completed'
  notes: string
  // Legacy / simple experiment format compatibility
  hypothesis: string
  how: string
  participants: string
  effort: string
  success: string
  positive: string
  negative: string
}

/**
 * Module 9: Validation Experiment Generator
 * Recommends practical pre-build validation experiments tailored to the founder's idea.
 */
export function generateValidationExperiments(
  understood: UnderstoodIdea
): DetailedValidationExperiment[] {
  const fw = getFrameworkById('experiment-design-precommitment')
  const customer = understood.cleanCustomer || 'Target customers'
  const problem = understood.cleanProblem
  const workaround = understood.cleanWorkaround
  const isB2B = understood.signals.isB2B

  const experiments: DetailedValidationExperiment[] = []

  // Experiment 1: The Mom Test Discovery Call Sprint
  experiments.push({
    id: 'exp-mom-test',
    objective: 'Confirm problem frequency and existing budget allocation without pitching a solution.',
    targetParticipants: `5 to 8 specific individuals in your primary beachhead (${customer}).`,
    actionsToTake:
      'Reach out via warm introductions or personalized LinkedIn/email notes. Conduct 20-minute interviews exploring their past behavior, previous workarounds, and how much time/money they spent on this pain last month.',
    questionsToAsk: [
      'When was the last time this specific problem happened to you?',
      'Can you walk me through your workflow when it happened?',
      'What did you try to do to fix it, and how much did that tool or workaround cost?',
      'Why haven\'t you solved this yet?',
    ],
    evidenceToCollect: 'Direct quotes, concrete dollar or hourly costs mentioned, and specific names of tools currently used.',
    successCriterion: 'At least 4 of 6 participants confirm this is a top-3 monthly operational headache and have spent money or manual hours on workarounds.',
    positiveInterpretation: 'Strong problem-market fit. Customers are actively in pain and seeking solutions.',
    negativeInterpretation: 'The issue is a minor annoyance rather than an acute priority. Pivot the problem focus before building.',
    inconclusiveInterpretation: 'Interviews were too vague or focused on future hypothetical questions rather than past behavior. Re-interview with strict Mom Test rules.',
    status: 'Not started',
    notes: 'Rule: Never mention your proposed idea during the first 15 minutes of the call.',
    hypothesis: `${customer} considers this problem a severe, costly issue they actively want to resolve.`,
    how: 'Conduct 5 Mom Test discovery interviews focused on past behavior and current workflow costs.',
    participants: `5 qualified ${customer}`,
    effort: '1 week (3-5 hours total)',
    success: '4/5 confirm acute pain and active ongoing workarounds',
    positive: 'Problem is confirmed real and acute; proceed to solution testing.',
    negative: 'Problem is negligible; revise target segment or problem statement.',
  })

  // Experiment 2: The Concierge MVP / Manual Service Test
  experiments.push({
    id: 'exp-concierge',
    objective: 'Deliver the core value promise manually behind the scenes to test whether the outcome is actually valuable.',
    targetParticipants: `2 to 3 early adopter ${customer} who confirmed pain in discovery calls.`,
    actionsToTake:
      'Offer to perform the task or workflow for the customer manually using spreadsheets, emails, and direct coordination. Do not write automated software code yet.',
    questionsToAsk: [
      'Did receiving this manual outcome solve your immediate need?',
      'How much time or headache did this save you compared to your usual routine?',
      'Would you pay $50 to have this handled for you every week?',
    ],
    evidenceToCollect: 'Qualitative satisfaction, turnaround speed, and willingness to share raw data/files with you.',
    successCriterion: 'All test participants express relief, thank you for the deliverable, and ask if you can continue providing it.',
    positiveInterpretation: 'Solution-problem fit is verified. You now know the exact edge cases and data flow required before writing automated code.',
    negativeInterpretation: 'Even when done manually for free, users fail to send inputs or ignore the output. The outcome is not valuable enough.',
    inconclusiveInterpretation: 'Users were overwhelmed by the manual coordination. Simplify the input requirement.',
    status: 'Not started',
    notes: 'Doing things that do not scale teaches you the exact architecture needed for the software.',
    hypothesis: 'Manually generating the core outcome delivers immediate high-value relief to the customer.',
    how: 'Act as a "concierge" and solve the problem manually for 3 early adopters using spreadsheets.',
    participants: `3 early adopters from ${customer}`,
    effort: '3 to 5 days',
    success: 'All 3 rely on the manual deliverable and request ongoing continuation.',
    positive: 'Solution delivers proven value; proceed to automate the core loop.',
    negative: 'Deliverable has minimal perceived value; rethink the core offering.',
  })

  // Experiment 3: Pre-Commitment / Letter of Intent (LOI) Test
  experiments.push({
    id: 'exp-precommitment',
    objective: 'Test economic skin-in-the-game before writing production software.',
    targetParticipants: isB2B ? '3 to 5 business decision makers' : '20 prospective consumer signups',
    actionsToTake: isB2B
      ? 'Present a 1-page Pilot Agreement offering a 50% discount on the first year in exchange for a non-binding Letter of Intent (LOI) or a refundable $50 pilot deposit.'
      : 'Create a clean 1-page landing overview with a "Pre-order early bird access for $10" button using Stripe checkout.',
    questionsToAsk: [
      'If we commit to delivering this within 4 weeks, can you authorize this pilot deposit today?',
      'What specific security or functional sign-off is required from your team to greenlight this?',
    ],
    evidenceToCollect: 'Stripe deposits, signed LOIs, or written commitments to pilot upon delivery.',
    successCriterion: isB2B
      ? 'At least 2 signed LOIs or pilot commitments with a defined start date.'
      : 'At least 5 paid deposits or pre-orders.',
    positiveInterpretation: 'Commercial demand is validated. Proceed to build the minimal functional MVP with maximum confidence.',
    negativeInterpretation: 'Zero deposits secured. Re-examine pricing, value proposition, or economic buyer qualification.',
    inconclusiveInterpretation: 'Buyers claim interest but postpone signing due to holiday or budget cycles. Follow up in 14 days.',
    status: 'Not started',
    notes: 'Skin-in-the-game is the only true validation metric in entrepreneurship.',
    hypothesis: 'Target customers will put down financial or reputational commitments before software is built.',
    how: isB2B ? 'Secure 2 non-binding LOIs or pilot deposits' : 'Launch a 1-page pre-order page with Stripe deposit',
    participants: isB2B ? '5 business managers' : '50 target visitors',
    effort: '1 to 2 weeks',
    success: isB2B ? '2 signed LOIs or deposits' : '5 paid pre-orders',
    positive: 'Strongest possible validation; build the initial version immediately.',
    negative: 'Willingness-to-pay missing; pivot value proposition or pricing model.',
  })

  return experiments
}
