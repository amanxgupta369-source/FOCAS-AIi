import type { Analysis, IdeaForm } from '../types'
import { generateOverallVerdict } from './verdict'

/**
 * Plain-English First-Principles Startup Evaluation Generator.
 *
 * Produces a full 12-section evaluation that any beginner can easily understand:
 * - Simple everyday English
 * - Short, clear sentences
 * - Explains one idea at a time
 * - No robotic jargon or corporate buzzwords
 * - Separates proven facts from unverified assumptions
 * - Never invents fake competitors, prices, or statistics
 */
export function generateAnalysis(f: IdeaForm): Analysis {
  const name = f.name || 'This startup idea'
  const who = f.customer || 'Target customers (not specified by founder)'
  const segment = f.segment || 'Small business segment'
  const market = f.market || 'Target market'
  const hasDemand = !!(f.demand && f.demand.trim().length > 0)
  const hasCompetitors = !!(f.competitors && f.competitors.trim().length > 0)
  const hasCurrent = !!(f.current && f.current.trim().length > 0)
  const problem = f.problem || 'Specific problem details have not been provided yet.'
  const solution = f.solution || f.description || 'Proposed tool details have not been provided yet.'
  const currentWorkaround = f.current || 'Manual processes, spreadsheets, or living with the inconvenience'

  // Evidence classification: separating known facts from unverified assumptions
  const verifiedFacts: string[] = []
  const hypotheses: string[] = []

  if (hasDemand) {
    verifiedFacts.push(`Customer interest noted by founder: "${f.demand.slice(0, 160)}"`)
  } else {
    hypotheses.push('Customer willingness to pay is unproven. No customer interview notes, deposits, or sales receipts were provided.')
  }

  if (hasCurrent) {
    verifiedFacts.push(`Current customer habit noted by founder: "${f.current.slice(0, 160)}"`)
  } else {
    hypotheses.push('How customers currently cope with this problem day-to-day has not been verified yet.')
  }

  hypotheses.push(`Assumes ${who} experience this problem often enough to spend time and money trying a new tool.`)
  hypotheses.push(`Assumes moving away from ${currentWorkaround} is easy enough that people will change their daily routine.`)

  const directCompetitors = hasCompetitors
    ? [f.competitors]
    : ['None specifically named by founder. Familiar spreadsheets, manual notes, and existing free habits are your biggest competition.']

  // 1. Executive Summary (Simple, plain words)
  const executiveSummary = {
    ideaSimple: `${name} is an idea for a simple tool designed to help ${who} solve: "${problem.slice(0, 120)}".`,
    problemOverview: `People currently deal with this by using ${currentWorkaround}. This takes up valuable time and causes annoying mistakes.`,
    intendedCustomer: `The main customer to start with is ${who}${f.segment ? ` (specifically in ${f.segment})` : ''}.`,
    opportunityOverview: hasDemand
      ? `You have early signs of customer interest ("${f.demand.slice(0, 80)}"). If this problem genuinely costs people hours or money every week, a simple automated tool could be a great small business.`
      : `This sounds like a helpful idea, but you have no proof yet that real customers care enough to pay money for a solution.`,
    biggestConcern: hasCurrent
      ? `The biggest risk is customer habit. People already know how to use ${currentWorkaround}, and they might not want to spend the effort to learn your new tool unless it is much faster and easier.`
      : 'The biggest risk is building a "nice-to-have" tool that people praise politely, but never actually pay to use.',
    recommendedAction: `Talk to 8 to 10 potential customers this week. Ask about how they dealt with this problem in the past before you write any code.`,
  }

  // 2. Problem Analysis
  const problemAnalysis = {
    exactProblem: problem,
    whoExperiencesIt: `${who} (${segment}), especially the people who have to do the hands-on daily work rather than senior executives.`,
    whenAndWhy: `This breakdown happens during regular daily routines when manual steps become too slow, confusing, or full of human mistakes.`,
    currentWorkarounds: currentWorkaround,
    evidenceStatus: hasDemand
      ? `Early conversational signal noted by founder: "${f.demand.slice(0, 120)}". This is promising, but you need to confirm whether people will actually pay.`
      : 'Unproven assumption. You do not have customer interview notes, payment deposits, or usage numbers yet.',
    unverifiedAspects: `Unanswered questions: How many times each week does this problem happen? How much money or time does it cost them? Does the person feeling the pain have their own budget to buy a tool?`,
  }

  // 3. Customer Analysis
  const customerAnalysis = {
    primarySegment: `${who} — people who manage daily ${segment} tasks.`,
    secondarySegment: `Colleagues, outside assistants, or contractors who work closely with them.`,
    needsAndMotivations: `They want to stop wasting time on boring repetitive tasks, avoid embarrassing mistakes, and finish their work faster.`,
    earlyAdopters: `People who recently suffered a frustrating, costly mistake and have already spent hours trying to fix it using ${currentWorkaround}.`,
    unlikelyUsersAndWhy: `Very large companies with strict IT rules and long approval steps, or people who only run into this problem once or twice a year.`,
    verifiedFacts,
    hypotheses,
  }

  // 4. Solution Analysis
  const solutionAnalysis = {
    howItWorks: `The tool takes in the user's messy information, does the hard processing automatically, and hands back the finished result to ${who}.`,
    featureMapping: [
      {
        feature: 'Quick and clean input flow',
        problemSolved: 'Stops users from having to manually type data over and over into different files.',
      },
      {
        feature: 'Instant status updates and error alerts',
        problemSolved: 'Stops surprises and lets users know immediately if something went wrong.',
      },
      {
        feature: 'Easy export and sharing',
        problemSolved: 'Lets the user send the final result to teammates in seconds.',
      },
    ],
    mvpScope: `A simple, single-page website where a user can enter their information, see the automated result right away, and download or share it.`,
    buildFirst: [
      'The single core calculation or workflow that delivers the main benefit reliably.',
      'A simple screen that takes under 3 minutes to test without complex setup.',
      'A quick way to export or share the finished result.',
    ],
    postpone: [
      'Complicated user roles, permissions, and team management settings.',
      'Custom colors, company logos, and theme builders.',
      'Automated subscription billing before you confirm people will pay (send manual invoices first).',
    ],
    adoptionChallenges: `People are used to their old habits. If your new tool takes more than 5 minutes to figure out, users will give up and go back to their spreadsheets.`,
  }

  // 5. Market and Competitor Analysis
  const marketAndCompetitors = {
    relevantCompetitors: directCompetitors,
    existingAlternatives: [
      currentWorkaround,
      'Everyday office tools (Google Sheets, Microsoft Excel, Notion, paper notes).',
      'Doing nothing: enduring the problem because learning new software feels like a hassle.',
    ],
    competitorComparison: [
      {
        name: hasCompetitors ? f.competitors : 'Big established software companies',
        targetAudience: 'Larger companies with lots of different departments',
        coreFeatures: 'Huge tool with hundreds of settings and complex menus',
        positioning: 'All-in-one software trying to do everything for everybody',
        pricingInfo: 'Typically expensive monthly plans ($50 to $300 per month); requires direct testing to confirm.',
      },
      {
        name: 'Manual Spreadsheets and Notes',
        targetAudience: who,
        coreFeatures: 'Familiar, highly flexible, and costs zero extra dollars',
        positioning: 'The default tool everyone already uses',
        pricingInfo: '$0 direct software bill, but costs hours of wasted employee time every week.',
      },
    ],
    differentiationOpportunities: [
      `Extreme simplicity: Solve this one specific problem 5 times faster than bloated general software.`,
      `Tailored specifically for ${who}, speaking their language rather than confusing technical jargon.`,
      `Fast setup: Let a new user see real value in under 3 minutes without requiring sales demos or lengthy training.`,
    ],
    researchLimitationsNotice:
      'Note: This analysis is based on founder inputs and common industry patterns. Live web search is disabled in this environment. You should test and compare competitor tools directly to check their current pricing and features.',
  }

  // 6. Business Model
  const businessModel = {
    possibleRevenueModels: [
      f.model || 'Simple monthly subscription ($29 to $79 per month depending on team size).',
      'Pay-per-use plan where customers pay only when they process a batch of work.',
      'Discounted yearly plan to get upfront cash to fund development.',
    ],
    whoPaysAndWhy: `The business owner or manager who directly feels the pain of wasted employee hours or costly mistakes.`,
    pricingHypotheses: `If your tool saves a customer 5 hours of work every month, charging $40 to $80 per month gives them an obvious, easy return on their money.`,
    acquisitionChallenges: `Finding customers without burning money on expensive social media ads. You will need to reach out directly through email, LinkedIn, or community groups at first.`,
    retentionChallenges: `Making sure the tool becomes part of their regular weekly routine, rather than a novelty they try once and forget about.`,
  }

  // 7. Risks and Weaknesses (Clear, practical explanations)
  const risksAndWeaknesses = [
    {
      risk: 'Old Habits and Resistance to Change',
      whyItMatters: 'If learning your tool feels harder than putting up with their current headache, customers will do nothing.',
      failureMechanism: 'People tell you the idea sounds amazing during chats, but never actually finish setting up an account.',
      severity: 'High' as const,
      mitigationStrategy: 'Make the first version so easy that a user gets a helpful result in under 2 minutes.',
    },
    {
      risk: 'People Refuse to Pay When Asked for Money',
      whyItMatters: 'Users may happily try a free prototype, but disappear the moment you introduce a monthly fee.',
      failureMechanism: 'You end up with free users who cancel their accounts as soon as you ask for payment.',
      severity: 'High' as const,
      mitigationStrategy: 'Ask for a small refundable deposit or a signed letter of intent before you write any software code.',
    },
    {
      risk: 'Building Too Many Features Too Early',
      whyItMatters: 'Trying to add every feature that someone mentions will waste your time and make the product confusing.',
      failureMechanism: 'You build a slow, complicated tool that does 10 things poorly instead of one thing exceptionally well.',
      severity: 'Medium' as const,
      mitigationStrategy: 'Solve only the single biggest bottleneck until you have at least 10 delighted paying customers.',
    },
    {
      risk: 'It Costs More to Find a Customer Than What They Pay You',
      whyItMatters: 'If it costs you $200 in ads to win a customer who only pays $30 per month and cancels after two months, you will run out of money.',
      failureMechanism: 'Running out of cash because marketing is too expensive.',
      severity: 'Medium' as const,
      mitigationStrategy: 'Reach out to customers directly yourself before spending any money on paid advertising.',
    },
  ]

  // 8. Assumption Analysis
  const assumptionAnalysis = [
    {
      assumption: `${who} run into this problem often enough (at least once a week) to care about finding a solution.`,
      whyItMatters: 'If this problem only happens once a year, customers will not bother paying for a dedicated tool.',
      ifFalseConsequence: 'Customers cancel their subscription because they rarely use the product.',
      testMethod: 'Ask 10 target buyers: "When did this happen last, and what exact steps did you take to deal with it?"',
    },
    {
      assumption: 'The person who feels the pain has the budget to buy the tool without asking multiple bosses.',
      whyItMatters: 'If buying requires approval from corporate executives, your sales will take months instead of days.',
      ifFalseConsequence: 'Sales get stuck waiting for permissions, and you run out of time.',
      testMethod: 'Ask in chats: "If a tool solved this tomorrow for $50 a month, could you put that on your card today?"',
    },
    {
      assumption: `Your tool can replace ${currentWorkaround} without forcing people to change their entire routine.`,
      whyItMatters: 'Changing how people work is the hardest part of building any new business tool.',
      ifFalseConsequence: 'People try your tool once, get confused, and go right back to their old spreadsheets.',
      testMethod: 'Do the work by hand for 2 or 3 customers first and see what they find confusing or annoying.',
    },
  ]

  // 9. Validation Plan (Practical, straightforward experiments)
  const validationPlan = {
    experiments: [
      {
        id: 'exp-1',
        objective: 'Find out how often this problem happens, how much it hurts, and what people spend on it today.',
        targetParticipants: `10 people matching the profile of ${who}.`,
        actionsToTake: 'Have 20-minute chats asking about their past week. Ask only about what they actually did in the past. Never pitch your idea.',
        questionsToAsk: [
          'Can you walk me through the last time you ran into this problem?',
          'What did you do to fix it, and how long did that take?',
          'How much money or staff time did that cost your team last month?',
          'Have you tried any other tools before? Why did you stop using them?',
        ],
        evidenceToCollect: 'Direct quotes describing real wasted hours, financial losses, and active attempts to find a fix.',
        successCriterion: 'At least 6 out of 10 people describe a recent, painful struggle and say they want a better way.',
        positiveInterpretation: 'The problem is acute and real. Move forward to showing wireframes or a simple prototype.',
        negativeInterpretation: 'The problem is only a minor annoyance. Do not build; rethink the customer group or the problem.',
        inconclusiveInterpretation: 'Results are mixed. Narrow down to the 2 or 3 people who felt the strongest pain and study them.',
        status: 'Not started' as const,
        notes: '',
      },
      {
        id: 'exp-2',
        objective: 'Test whether people will commit money before you spend weeks building software.',
        targetParticipants: '5 people from Experiment 1 who experienced the highest pain.',
        actionsToTake: 'Show them a simple clickable wireframe or offer to do the work by hand for them. Ask them to join an early testing group with a small refundable deposit ($50 to $100) or signed letter of intent.',
        questionsToAsk: [
          'If this simple tool were available on Monday, how would it change your weekly routine?',
          'What would stop you from using this starting next week?',
          'Would you be willing to put down a small $50 deposit today to guarantee early access?',
        ],
        evidenceToCollect: 'Signed agreements, deposits, or the exact reasons why they say they cannot pay.',
        successCriterion: 'At least 2 out of 5 people agree to put down a deposit or sign an agreement.',
        positiveInterpretation: 'Strong proof that customers will pay. Start building the tiny first version.',
        negativeInterpretation: 'People will not pay for this solution. Adjust your offer before writing code.',
        inconclusiveInterpretation: 'People demand lots of extra features. Do not build everything; find out the single must-have feature.',
        status: 'Not started' as const,
        notes: '',
      },
    ],
  }

  // 10. Competitive Advantage
  const competitiveAdvantage = {
    plausibleDifferentiators: [
      `100% focused on ${who}, making complicated all-in-one software feel clunky and slow.`,
      'Speed: Giving the user their finished result in 2 minutes instead of hours of manual entry.',
      'Founder attention: Talking directly with early users and fixing their complaints within 24 hours.',
    ],
    hardToSustainAdvantages: [
      'Pretty visual design and colors (other companies can copy your screens in a few weeks).',
      'Single feature buttons (competitors can easily add the same button if they see users want it).',
      'Lower prices (large competitors have deep pockets and can cut prices to match you).',
    ],
    defensibleAdvantages: [
      'Saving the customer’s past records and templates so moving away to another tool feels painful.',
      'Connecting directly into the tools they already use every day (like their email or chat apps).',
      'Strong trust and reputation built by personally helping your first 20 customers succeed.',
    ],
    easilyCopiedFeatures: [
      'Basic charts and summary cards.',
      'Simple email notifications.',
      'Standard data tables and search boxes.',
    ],
  }

  // 11. Final Recommendation (Direct, practical advice)
  const finalRecommendation = {
    verdict: hasDemand ? ('Validate Further' as const) : ('Revise' as const),
    verdictReasoning: hasDemand
      ? `Talk to potential customers directly to confirm they will pay. You have promising early interest, but nobody has spent money or signed a contract yet.`
      : `Pause development and rethink the customer problem. Building software without real customer evidence risks wasting months of effort on something nobody wants.`,
    strongestArgumentsFor: [
      `Focus: Building a simple tool specifically for ${who} is much more attractive than bloated software that tries to do everything.`,
      `Existing waste: Customers are already wasting hours using ${currentWorkaround}, giving you a clear comparison to prove your value.`,
    ],
    strongestObjections: [
      'No confirmed budget: People often complain about manual work, but refuse to spend money to replace it.',
      'Old habits: Getting busy people to change how they work every day is the hardest challenge in software.',
    ],
    nextFiveActions: [
      `1. Write a short list of questions to ask potential customers about what they did last week (never ask if they would buy your idea).`,
      `2. Reach out to 15 people who match ${who} and schedule 8 to 10 chats.`,
      `3. Measure how much time and money each person currently wastes using ${currentWorkaround}.`,
      `4. Build a simple clickable mock-up or do the work manually for 2 customers to learn the details.`,
      `5. Ask 2 customers to put down a small deposit before you write computer code.`,
    ],
  }

  // 12. Open Questions
  const openQuestions = {
    missingMaterialInfo: [
      'How much money does your target customer typically have to spend on small software tools each month?',
      'Who is the exact person who makes the decision to buy, compared to the person who uses the tool every day?',
      'Are there any privacy, security, or legal rules that apply to this work?',
    ],
    focusedFollowUpQuestions: [
      `Have you personally spoken with at least 5 target ${who} about what this problem actually costs them?`,
      'What is the single biggest reason a potential customer might say "no" to your offer?',
      'How do you plan to find your first 20 paying customers without spending money on ads?',
    ],
    limitationsNotice:
      'This evaluation is based on your idea details and startup best practices. You must talk directly with real customers in the field to confirm whether these recommendations work in your specific market.',
  }

  const analysisResult: Analysis = {
    score: hasDemand ? 72 : 58,
    executiveSummary,
    problemAnalysis,
    customerAnalysis,
    solutionAnalysis,
    marketAndCompetitors,
    businessModel,
    risksAndWeaknesses,
    assumptionAnalysis,
    validationPlan,
    competitiveAdvantage,
    finalRecommendation,
    openQuestions,

    // Backward-compatible properties
    opportunities: [
      `Clear focus: A dedicated tool for ${who} that replaces the mess of ${currentWorkaround}.`,
      'Saving time: Giving users a fast, automated answer in minutes instead of hours of manual work.',
      'Early mover advantage if you focus on a specific group that other software companies ignore.',
    ],
    risks: risksAndWeaknesses.map(r => `${r.risk}: ${r.whyItMatters}`),
    assumptions: assumptionAnalysis.map(a => `${a.assumption} (How to test: ${a.testMethod})`),
    questions: openQuestions.focusedFollowUpQuestions,
    experiments: validationPlan.experiments.map(e => ({
      id: e.id,
      hypothesis: e.objective,
      how: e.actionsToTake,
      participants: e.targetParticipants,
      effort: '1 to 2 weeks',
      success: e.successCriterion,
      positive: e.positiveInterpretation,
      negative: e.negativeInterpretation,
      status: e.status,
      notes: e.notes,
    })),
    nextSteps: finalRecommendation.nextFiveActions,

    // UI compatibility summaries
    problemSolution: {
      problemSummary: problemAnalysis.exactProblem,
      solutionSummary: solutionAnalysis.howItWorks,
      problemUrgency: hasDemand ? 'Moderate (Early founder feedback)' : 'Unproven (Needs customer interviews)',
    },
    targetCustomers: {
      profile: customerAnalysis.primarySegment,
      verifiedSignals: verifiedFacts,
      unverifiedAssumptions: hypotheses,
    },
    competitorAnalysis: {
      directCompetitors: marketAndCompetitors.relevantCompetitors,
      indirectWorkarounds: marketAndCompetitors.existingAlternatives,
      switchingBarriers: [
        'People sticking with their familiar habits and spreadsheets.',
        'The time and effort it takes to move information into a new tool.',
      ],
    },
  }

  // Synthesize Section 1 to 9 Overall Verdict final report
  analysisResult.overallVerdict = generateOverallVerdict(f, analysisResult)
  return analysisResult
}
