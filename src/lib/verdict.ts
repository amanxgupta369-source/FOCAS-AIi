import type {
  Analysis,
  CustomerInterview,
  FinalDecisionVerdict,
  IdeaForm,
  OverallVerdictReport,
  TrackedAssumption,
  VerdictFactor,
  ExecutionStep,
  TimelineMilestone,
} from '../types'

/**
 * Plain-English First-Principles Synthesis Engine for FOCAS AI - Overall Verdict
 *
 * Designed so a beginner can understand every recommendation without looking up business terms:
 * - Simple everyday English
 * - Short, clear sentences
 * - Explains one idea at a time
 * - Zero buzzwords or corporate jargon
 * - Honest challenges to weak assumptions
 * - Grounded strictly in available facts and evaluation data
 */
export function generateOverallVerdict(
  form: IdeaForm,
  analysis: Analysis,
  interviews: CustomerInterview[] = [],
  trackedAssumptions: TrackedAssumption[] = []
): OverallVerdictReport {
  const name = form.name?.trim() || 'This startup idea'
  const customer = form.customer?.trim() || analysis.customerAnalysis?.primarySegment || 'target customers'
  const problem = form.problem?.trim() || analysis.problemAnalysis?.exactProblem || 'an unstated daily problem'
  const solution = form.solution?.trim() || form.description?.trim() || analysis.solutionAnalysis?.howItWorks || 'proposed tool'
  const workaround = form.current?.trim() || analysis.problemAnalysis?.currentWorkarounds || 'manual workarounds or spreadsheets'
  const demandRaw = form.demand?.trim() || ''
  const competitorsRaw = form.competitors?.trim() || ''

  const interviewCount = interviews.length
  const confirmedCount = interviews.filter(i => i.problemConfirmed).length
  const wouldPayCount = interviews.filter(i => i.wouldPay).length
  const disprovedList = trackedAssumptions.filter(a => a.state === 'Disproved')
  const supportedList = trackedAssumptions.filter(a => a.state === 'Supported')

  const hasDemand = demandRaw.length > 10 || wouldPayCount >= 2
  const hasWorkaround = workaround.length > 5 && !workaround.toLowerCase().includes('not sure')
  const hasCustomer = customer.length > 3 && !customer.toLowerCase().includes('not specified')
  const hasProblem = problem.length > 20 && !problem.toLowerCase().includes('not been provided')

  // -------------------------------------------------------------
  // SECTION 1: FINAL VERDICT SELECTION
  // Options: BUILD | VALIDATE FIRST | RETHINK | DON'T PURSUE THIS VERSION
  // -------------------------------------------------------------
  let decision: FinalDecisionVerdict
  let conciseExplanation: string
  let strongestReason: string
  let biggestConcern: string
  let singleMostImportantNextAction: string
  let isProvisionalNotice: string

  // Dynamic decision synthesis based on recorded evidence
  if (disprovedList.length >= 2 || (interviewCount >= 3 && confirmedCount === 0)) {
    decision = "DON'T PURSUE THIS VERSION"
    conciseExplanation =
      `Based on recorded customer validation, ${disprovedList.length > 0 ? `${disprovedList.length} critical assumption(s) were disproved` : 'early interviews failed to confirm problem urgency'}. ` +
      `Building software now risks burning time and money on a problem customers are willing to tolerate. ` +
      `Do not write code for this version. Step back and explore an adjacent problem or alternative customer segment.`
    strongestReason = disprovedList.length > 0
      ? `Disproved assumption: "${disprovedList[0].assumption}" (${disprovedList[0].evidenceNotes || 'No willingness to pay or switch'}).`
      : 'Customer interviews did not validate the pain point.'
    biggestConcern = 'Building a product for an issue people can easily ignore or endure without buying software.'
    singleMostImportantNextAction = 'Debrief your interview notes, identify why customers declined, and test an alternative problem statement.'
    isProvisionalNotice = 'This decision reflects your recorded validation evidence. If you discover a painful sub-problem, update your project details.'
  } else if (!hasProblem && !hasDemand) {
    decision = "DON'T PURSUE THIS VERSION"
    conciseExplanation =
      `${name} does not yet have a clearly described customer problem or any real proof that customers want it. ` +
      `If you start building software now, you risk spending months of hard work on something nobody actually needs. ` +
      `Step back and talk to potential users first to discover what is genuinely broken in their daily work.`
    strongestReason = 'There is no proof yet that any real person or company has an urgent problem here.'
    biggestConcern = 'Building software for a theoretical convenience that people will neither use nor pay for.'
    singleMostImportantNextAction = 'Have 5 to 8 open discovery conversations with people who might need this, and listen to what they struggle with today.'
    isProvisionalNotice = 'This verdict is based on an incomplete problem description. If you uncover real customer frustration, this verdict will change.'
  } else if (interviewCount >= 4 && wouldPayCount >= 3 && disprovedList.length === 0) {
    decision = 'BUILD'
    conciseExplanation =
      `Strong validation: ${wouldPayCount} out of ${interviewCount} interviewed customers confirmed severe pain and expressed willingness to pay, with zero disproved critical assumptions. ` +
      `This justifies building a small, focused prototype. ` +
      `Keep this first version minimalist. Solve only the single most painful part of the problem so you can deploy it to your early interviewees immediately.`
    strongestReason = `${wouldPayCount} customers stated willingness to pay during discovery interviews.`
    biggestConcern = 'Feature creep: Adding too many secondary features before testing retention with your first 3 users.'
    singleMostImportantNextAction = 'Build a minimalist prototype or manual concierge workflow and deliver it directly to the customers who agreed to pay.'
    isProvisionalNotice = 'This recommendation is backed by your logged interviews. Monitor whether interviewees actually pay when the prototype is delivered.'
  } else if (!hasDemand && (!hasCustomer || !hasWorkaround)) {
    decision = 'RETHINK'
    conciseExplanation =
      `The broad topic for ${name} may be interesting, but your target customer and their existing alternatives are too vague. ` +
      `If you do not know exactly who hurts from this problem and how they cope today, you cannot build something better. ` +
      `Pick one specific group of users first and learn how they handle this problem right now before writing code.`
    strongestReason = 'The target audience is too broad. When you try to build for everyone, you build for no one.'
    biggestConcern = 'People usually stick with their familiar habits. If your tool is only a little bit better, users will not switch.'
    singleMostImportantNextAction = 'Narrow down your target customer to one specific group (for example, small teams of 3 to 5 people) and map out how they work today.'
    isProvisionalNotice = 'This verdict is based on an early idea. Once you narrow down the customer profile and their current habits, we will update the recommendation.'
  } else if (hasDemand && hasWorkaround && hasCustomer && hasProblem) {
    decision = 'BUILD'
    conciseExplanation =
      `You have identified a real daily problem, a clear target customer (${customer}), and a known alternative they currently use (${workaround}). ` +
      `You also have early signs of customer interest. ` +
      `This justifies building a small, simple prototype. ` +
      `Keep this first version tiny. Solve only the single most painful part of the problem so you can test it with real users quickly.`
    strongestReason = 'You have a clear customer, a painful problem they currently try to fix, and early proof of interest.'
    biggestConcern = 'Adding too many features too early, before proving that early users will keep using the product and pay for it.'
    singleMostImportantNextAction = 'Build a tiny first version that solves just the single most painful bottleneck in under 5 minutes of setup.'
    isProvisionalNotice = 'This recommendation assumes your early customer interest is genuine. If test users do not use your first prototype within 14 days, pause and ask why.'
  } else {
    // Default safe first-principles recommendation
    decision = 'VALIDATE FIRST'
    conciseExplanation =
      `Your idea makes logical sense, but customer demand and willingness to pay are still unproven assumptions. ` +
      `People often say an idea sounds great in friendly chats, but then refuse to change their habits or spend real money when asked to pay. ` +
      `Do not write code yet. First, confirm whether customers actually care enough to pay for a better solution.`
    strongestReason = interviewCount > 0
      ? `You have logged ${interviewCount} interview(s), but have not yet secured definitive pre-orders or payment commitments.`
      : 'The idea sounds reasonable, but you have no proof yet that anyone will pay money to solve this.'
    biggestConcern = 'Building a "nice-to-have" tool that people praise politely, but never actually pay to use.'
    singleMostImportantNextAction = 'Log at least 5 customer discovery interviews in the Validation tab and ask prospects for a letter of intent or deposit.'
    isProvisionalNotice = 'This verdict is based on unverified assumptions. When you record customer interviews showing willingness to pay, the verdict will upgrade to BUILD.'
  }

  // -------------------------------------------------------------
  // SECTION 2: WHY COULD THIS IDEA SUCCEED OR FAIL?
  // -------------------------------------------------------------
  const whyItCouldSucceed: VerdictFactor[] = [
    {
      issue: 'Doing One Job Much Better Than Complicated Tools',
      whyItMatters: 'Large software tools are often bloated, hard to set up, and force users to jump through dozens of confusing menus.',
      businessImpact: 'If your tool solves their single biggest headache with just one clean click, customers will gladly pay and tell their friends.',
      supportingEvidence: hasWorkaround
        ? `Customers currently rely on ${workaround}, which shows they are already spending daily effort dealing with this.`
        : 'People consistently prefer a simple tool that does one job well over a giant confusing system.',
      uncertainties: 'Whether customers care enough about this convenience to pay for another monthly subscription.',
    },
    {
      issue: 'Customers Already Waste Real Time Dealing With This',
      whyItMatters: 'When people already lose hours every week to a problem, it is very easy to show them the value of your solution.',
      businessImpact: 'You can clearly show customers how many hours they will save each week, which makes it much easier to close sales.',
      supportingEvidence: hasDemand
        ? `You noted customer interest: "${demandRaw.slice(0, 80)}", which suggests people are aware of the waste.`
        : 'Manual processes lead to mistakes and wasted hours that give you a clear comparison.',
      uncertainties: 'Exactly how many hours or dollars the customer loses each week has not yet been measured in real interviews.',
    },
    {
      issue: 'Quick and Obvious Value on Day One',
      whyItMatters: 'New products win when users get immediate relief during their very first session without lengthy training.',
      businessImpact: 'Users stick around instead of giving up during sign-up, giving you happy early testimonials.',
      supportingEvidence: 'The first version can be kept very small, focusing purely on solving the main breakdown.',
      uncertainties: 'Whether customers will demand connections to other existing tools before they find it truly useful.',
    },
  ]

  const whyItCouldFail: VerdictFactor[] = [
    {
      issue: 'People Stick With Old Habits Instead of Trying Something New',
      whyItMatters: 'The default choice for most people is to do nothing. Changing daily habits takes real effort.',
      businessImpact: 'Potential buyers may tell you your idea sounds wonderful, but never actually finish setting up an account.',
      supportingEvidence: hasWorkaround
        ? `Customers already have routines around ${workaround}. Familiar habits are surprisingly hard to break.`
        : 'There is no proof yet that users feel urgent enough about this to change their routine.',
      uncertainties: 'Whether this problem happens often enough (every week vs once a year) to make using a new tool a regular habit.',
    },
    {
      issue: 'People Might Love It When It Is Free, But Refuse to Pay',
      whyItMatters: 'Many people will happily use a free tool or accept free help, but walk away the moment you ask for a credit card.',
      businessImpact: 'Your business will run out of money if you spend time helping users who never become paying customers.',
      supportingEvidence: hasDemand
        ? 'Reported customer interest is conversational so far. No customer has paid money or signed a contract yet.'
        : 'No payment history or pricing feedback was provided in the idea details.',
      uncertainties: 'How much customers are willing to spend and whether the person talking to you actually has the budget to buy software.',
    },
    {
      issue: 'Free Alternatives Like Spreadsheets Might Be "Good Enough"',
      whyItMatters: 'Spreadsheets (like Excel or Google Sheets) and chat apps are already installed and cost nothing extra.',
      businessImpact: 'Your real competitor is not just other startups. It is free tools that people already know how to use.',
      supportingEvidence: competitorsRaw
        ? `Competitors mentioned (${competitorsRaw.slice(0, 60)}) plus existing free spreadsheets.`
        : 'Spreadsheets and manual notes are the universal default competitor for almost all business tools.',
      uncertainties: 'How badly the customer wants to eliminate manual spreadsheet work before they are willing to pay for automation.',
    },
  ]

  // -------------------------------------------------------------
  // SECTION 3: WHAT SHOULD THE FOUNDER BUILD?
  // -------------------------------------------------------------
  const minimumViableScope = {
    firstCustomerSegment: customer,
    problemToSolve: problem,
    essentialFunctionality: [
      'A simple, clean input flow (uploading a file, filling a short form, or connecting one source) that takes under 3 minutes.',
      'The core engine that takes that input and produces the correct, helpful result reliably.',
      'A clear screen or export summary that immediately shows the user that their problem is solved.',
    ],
    excludedScope: [
      'Complex team roles, sub-accounts, and complicated permission settings.',
      'Custom color themes, logos, and advanced dashboard customization.',
      'Automated subscription billing systems (send simple manual invoices or payment links at first).',
      'Mobile apps (build a simple website that works on phones first).',
    ],
    whyThisScopeIsAppropriate:
      'This small scope answers the only question that matters right now: does this tool solve the main problem well enough that people feel relief? Building anything extra before proving this is a waste of time and money.',
    resultJustifyingFurtherDevelopment:
      'At least 3 different customers use this simple tool every week and tell you they would be upset if you took it away.',
    recommendedFormat:
      decision === 'BUILD'
        ? 'A simple web page with one clear job, or a prototype where you handle some steps manually behind the scenes.'
        : 'A clickable prototype or a manual service where you do the work by hand to test whether people actually want the result.',
  }

  // -------------------------------------------------------------
  // SECTION 4: HOW SHOULD THE FOUNDER EXECUTE?
  // -------------------------------------------------------------
  const executionPlan: ExecutionStep[] = [
    {
      priority: 1,
      what: `Talk to 8 to 10 potential customers (${customer}) about their current struggles`,
      how: [
        'Find 15 to 20 people who match your exact target customer on LinkedIn, online communities, or through mutual contacts.',
        'Ask only about their past behavior: "Tell me about the last time you ran into this problem. What did you do? What did it cost you in time or money?"',
        'Do NOT pitch your idea during these chats. Never ask "Would you buy this?". People will say yes just to be polite.',
      ],
      why: 'This tells you whether the problem is an urgent daily pain or just a minor annoyance that people do not care about.',
      evidenceToCollect: 'Specific stories about past time lost, money wasted, and tools they tried and gave up on.',
      howToInterpret:
        'If at least 6 out of 10 people describe recent, painful struggles and are actively looking for a fix, the problem is real. If not, refine who you are targeting.',
      nextStep: 'Group the interview notes to find the single biggest headache shared by almost everyone you spoke with.',
    },
    {
      priority: 2,
      what: 'Solve the problem by hand for 2 or 3 test customers first',
      how: [
        'Offer to do the work manually for 2 friendly users behind the scenes using simple spreadsheets or scripts.',
        'Deliver the finished work on time and watch closely where confusion or mistakes happen.',
        'Ask the user: "Did this give you what you needed? What is missing?"',
      ],
      why: 'Doing the work by hand teaches you every tricky detail of the job before you write any expensive computer code.',
      evidenceToCollect: 'How long the task took you, what the user thought of the result, and whether they ask you to do it again next week.',
      howToInterpret:
        'If the customer asks you to do it again and relies on the result, you understand the problem. If they ignore it, the solution is not helpful yet.',
      nextStep: 'Write down the exact step-by-step recipe needed to turn this manual work into software.',
    },
    {
      priority: 3,
      what: 'Test if customers will commit money before you build the software',
      how: [
        'Show your early mock-up or the results of your manual test to 5 qualified customers.',
        'Ask them to join an early testing group: "We are onboarding 5 early partners this month. Would you put down a small refundable deposit of $50, or sign an early agreement?"',
        'Listen carefully to what they say when money is mentioned.',
      ],
      why: 'Compliments are free, but paying money proves real demand. This protects you from building something nobody will buy.',
      evidenceToCollect: 'Signed agreements, deposits, or the exact reasons why a customer says they cannot pay today.',
      howToInterpret:
        'If 2 or more customers put down money or sign an agreement, you have strong proof to start building. If zero agree, rethink your offer or pricing.',
      nextStep: 'Start building only the essential features outlined in Section 3.',
    },
    {
      priority: 4,
      what: 'Give your tiny first version to those early test customers',
      how: [
        'Build the simplest web tool that automates the steps you learned during the manual test.',
        'Watch the test customers try it on a shared screen during their first session to see where they get stuck.',
        'Check whether they keep coming back to use it on their own over the next two weeks.',
      ],
      why: 'This shows whether the product is easy enough to use and whether it truly replaces their old habits.',
      evidenceToCollect: 'How often they log in without you reminding them, and what errors or complaints they report.',
      howToInterpret:
        'If they use it every week without you asking, you have something people want. If they stop using it, the tool is still too difficult or not helpful enough.',
      nextStep: 'Fix the top complaints from these early users before opening the product to the general public.',
    },
  ]

  // -------------------------------------------------------------
  // SECTION 5: WHEN SHOULD EACH ACTION HAPPEN?
  // -------------------------------------------------------------
  const milestones: TimelineMilestone[] = [
    {
      action: 'Step 1: Talk to potential customers and confirm the problem',
      timeEstimate: 'Weeks 1 to 2 (about 10 to 14 days)',
      dependency: 'Reaching out to 15 or more target customers to schedule chats',
      expectedDeliverable: 'Notes from 10 customer interviews showing how much time and money they currently waste',
      decisionPoint: 'DECISION: If fewer than 5 people experience real weekly pain, stop and pick a different customer group.',
    },
    {
      action: 'Step 2: Do the work by hand for 2 test customers',
      timeEstimate: 'Week 3 (about 5 to 7 days)',
      dependency: 'Finding at least 2 people from Step 1 willing to let you help them',
      expectedDeliverable: 'A written list of the exact steps needed to solve the problem from start to finish',
      decisionPoint: 'DECISION: If customers do not love the manual result, fix the output before writing software.',
    },
    {
      action: 'Step 3: Ask for small pre-commitments before coding',
      timeEstimate: 'Week 4 (about 5 to 7 days)',
      dependency: 'A clear one-page summary of what your tool will do and what it will cost',
      expectedDeliverable: 'At least 2 signed letters of intent or small refundable deposits',
      decisionPoint: 'DECISION: If zero people commit, DO NOT BUILD YET. Rethink your pricing or what you are offering.',
    },
    {
      action: 'Step 4: Build the tiny first version and onboard pilot users',
      timeEstimate: 'Weeks 5 to 7 (about 2 to 3 weeks)',
      dependency: 'Confirmed pre-commitments from Step 3',
      expectedDeliverable: 'A simple working web page tested with your early partners',
      decisionPoint: 'DECISION: See if users keep using it after 14 days. If they do, prepare for a wider launch.',
    },
  ]

  // -------------------------------------------------------------
  // SECTION 6: COMPETITIVE ADVANTAGE
  // -------------------------------------------------------------
  const competitiveAdvantage = {
    currentAlternatives: [
      hasWorkaround ? workaround : 'Manual spreadsheets, email threads, and paper checklists',
      'General-purpose tools like Google Sheets, Excel, or Notion',
      'Doing nothing: living with the headache because learning new software feels like too much work',
    ],
    strongestCompetitors: competitorsRaw
      ? [competitorsRaw, 'Spreadsheets and manual work', 'General business software']
      : ['Manual habits and spreadsheets', 'General office software', 'Existing free workarounds'],
    whyCustomerMightSwitch:
      hasWorkaround
        ? `Customers will only switch away from ${workaround} if your product saves them several hours every week or prevents costly mistakes.`
        : 'Customers will switch only if your product gives them noticeable relief in the first two minutes of use.',
    keyDifferentiator:
      `Focusing 100% on ${customer}. General tools try to please everyone; your tool solves one specific problem easily and quickly.`,
    isDefensibleOrEasyToCopy:
      'Other companies could easily copy your visual design or basic features. You need to give customers a clear reason to choose you: deeper understanding of their daily workflow, saving their past data, and integrating directly into how they already work.',
    validationTestForAdvantage:
      'Put your prototype and a standard spreadsheet side-by-side in front of 3 users. Time how long each takes, and check which one they voluntarily open after one week.',
    researchDisclosureNotice:
      'Note: This analysis uses the information you provided and standard industry patterns. You should search for and test competitor tools directly to verify their pricing and features.',
  }

  // -------------------------------------------------------------
  // SECTION 7: THE CRITICAL ASSUMPTION
  // -------------------------------------------------------------
  const criticalAssumption = {
    assumption: `That ${customer} experience "${problem.slice(0, 90)}" often enough and painfully enough to stop using their current habit and pay for your tool.`,
    whyBusinessDependsOnIt:
      'Your whole business depends on this assumption. If people only find this problem slightly annoying, they will never pay money or take the time to learn a new tool.',
    ifFalseConsequence:
      'You could spend months building a clean product that people praise in conversations, but nobody ever pays for or uses regularly.',
    cheapestTest:
      'Offer to solve the problem for 5 target customers by hand for $50 this week, before writing any software code.',
    positiveSignalMeaning:
      'At least 2 people pay or sign an agreement right away. This gives you strong confidence to build your first version.',
    negativeSignalMeaning:
      'People say no or tell you they are happy sticking with their current spreadsheet. Stop building. Change who you are targeting or what problem you solve.',
    inconclusiveSignalMeaning:
      'People say they like it, but demand 10 extra features before deciding. This usually means the problem is a "nice-to-have" rather than an urgent pain.',
    verdictAdjustmentOnResults:
      'If positive: Upgrade recommendation to BUILD. If negative: Change recommendation to RETHINK or STOP. If unclear: Stay in VALIDATE FIRST with a narrower customer group.',
  }

  // -------------------------------------------------------------
  // SECTION 8: WHAT WOULD CHANGE THE VERDICT?
  // -------------------------------------------------------------
  const whatWouldChangeVerdict = {
    moreConfidentConditions: [
      'Proof that 5 or more target customers lose real money or multiple hours every single week to this exact problem.',
      'Getting 2 or more customers to sign an agreement or pay a small deposit before the product is built.',
      'A test customer voluntarily sharing the tool with a colleague because it helped them so much.',
    ],
    lessConfidentConditions: [
      'Customers telling you in interviews that this problem happens less than once a month.',
      'Users saying they are completely fine using free spreadsheets once you dig into the details.',
      'Finding out that buying software at these companies requires approval from multiple managers over many months.',
    ],
    changeCustomerConditions: [
      'You discover that regular workers feel the pain daily, but the boss holding the credit card does not care enough to pay.',
      'One specific sub-group (for example, solo business owners) shows much higher interest and willingness to pay than larger teams.',
    ],
    changeSolutionConditions: [
      'Users refuse to log into a new website and ask for the tool to work directly inside email or Slack.',
      'Your manual test reveals that the real struggle is collecting the data in the first place, rather than processing it.',
    ],
    stopConditions: [
      'Fewer than 3 out of 10 people you interview have tried to solve this problem with time or money in the last 3 months.',
      'You find an existing well-known company that already gives away the exact same solution for free.',
      'It costs more money and time to find each new customer than the customer will ever pay you in return.',
    ],
  }

  // -------------------------------------------------------------
  // SECTION 9: YOUR NEXT THREE ACTIONS
  // -------------------------------------------------------------
  const nextThreeActions = [
    {
      rank: 1,
      title: 'Action 1: Talk to 8 to 10 potential customers',
      what: `Have 8 to 10 discovery conversations with real ${customer}.`,
      how: 'Find them on LinkedIn, online forums, or through friends. Ask only about what they did last week and how they currently handle this problem. Never ask if they would buy your idea.',
      whyPriority:
        'This stops you from building based on guesses. It proves whether this is a genuine headache or just a minor annoyance.',
      targetResult:
        'A list where at least 6 out of 10 people describe a frustrating, costly problem they experienced in the last two weeks.',
      followOnDecision:
        'If confirmed, move to Action 2. If fewer than 4 people report real pain, stop and rethink the problem.',
    },
    {
      rank: 2,
      title: 'Action 2: Try the existing alternatives yourself',
      what: `Spend time using the tools people use today (${hasWorkaround ? workaround : 'spreadsheets'}).`,
      how: 'Spend 2 full hours doing the work using existing methods. Note down the exact moments where you get frustrated, make mistakes, or waste time.',
      whyPriority:
        'You cannot build a clearly better product without knowing the strengths and weaknesses of what customers already use.',
      targetResult:
        'A simple list showing the exact steps where existing tools fail users today.',
      followOnDecision:
        'Make sure your proposed product fixes that exact step, rather than just copying what already exists.',
    },
    {
      rank: 3,
      title: 'Action 3: Get small pre-commitments before writing code',
      what: 'Ask 3 customers who experienced high pain to sponsor an early pilot.',
      how: 'Write a simple one-page note explaining what your tool will do and when it will be ready. Ask for a refundable $50 deposit or a signed letter of intent.',
      whyPriority:
        'The only honest proof of customer demand is commitment. Polite compliments cost nothing; putting down money is real proof.',
      targetResult: 'At least 2 signed agreements or small deposits before you write code.',
      followOnDecision:
        'If customers commit: Start building the tiny first version. If they refuse: Ask why and rethink your pricing or offer.',
    },
  ]

  return {
    decision,
    conciseExplanation,
    strongestReason,
    biggestConcern,
    singleMostImportantNextAction,
    isProvisionalNotice,
    whyItCouldSucceed,
    whyItCouldFail,
    minimumViableScope,
    executionPlan,
    timeline: {
      milestones,
      scheduleEstimateDisclaimer:
        'This timeline is a practical guide for a small team. Times will vary depending on how quickly customers reply to you.',
    },
    competitiveAdvantage,
    criticalAssumption,
    whatWouldChangeVerdict,
    nextThreeActions,
  }
}
