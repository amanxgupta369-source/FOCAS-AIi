export type ProjectStatus = 'Evaluating' | 'Validating' | 'Building' | 'Paused'
export type Status = ProjectStatus | 'Draft' | 'Analyzing' | 'Complete'
export type ExpStatus = 'Not started' | 'In progress' | 'Completed'
export type Stage = 'Idea' | 'Research' | 'Prototype' | 'Launched'

export interface CustomerInterview {
  id: string
  date: string
  intervieweeRole: string
  problemConfirmed: boolean
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Rarely' | 'Never' | 'Unknown'
  wouldPay: boolean
  estimatedBudget?: string
  currentWorkaround: string
  keyQuotes: string
  notes: string
}

export type AssumptionState = 'Untested' | 'Supported' | 'Disproved'

export interface TrackedAssumption {
  id: string
  assumption: string
  category: 'Problem' | 'Customer' | 'Solution' | 'Pricing' | 'Market'
  state: AssumptionState
  evidenceNotes: string
  lastUpdated: string
}

export interface IdeaForm {
  name: string
  description: string
  problem: string
  solution: string
  customer: string
  segment: string
  market: string
  current: string
  model: string
  stage: Stage
  competitors: string
  demand: string
  frequency?: string
  costs?: string
  priorExperiments?: string
}

export interface Experiment {
  id: string
  hypothesis: string
  how: string
  participants: string
  effort: string
  success: string
  positive: string
  negative: string
  status: ExpStatus
  notes: string
}

export type EvaluationStage =
  | 'Understanding the idea'
  | 'Evaluating the problem and customers'
  | 'Analysing competitors and risks'
  | 'Preparing recommendations'
  | 'Generating the final report'

export interface EvaluationProgress {
  currentStage: EvaluationStage
  completedStages: EvaluationStage[]
  tokens: number
  elapsedSeconds: number
}

// 12-Section Detailed Startup Evaluation Framework
export interface Analysis {
  // 1. Executive Summary
  executiveSummary: {
    ideaSimple: string
    problemOverview: string
    intendedCustomer: string
    opportunityOverview: string
    biggestConcern: string
    recommendedAction: string
  }

  // 2. Problem Analysis
  problemAnalysis: {
    exactProblem: string
    whoExperiencesIt: string
    whenAndWhy: string
    currentWorkarounds: string
    evidenceStatus: string
    unverifiedAspects: string
  }

  // 3. Customer Analysis
  customerAnalysis: {
    primarySegment: string
    secondarySegment: string
    needsAndMotivations: string
    earlyAdopters: string
    unlikelyUsersAndWhy: string
    verifiedFacts: string[]
    hypotheses: string[]
  }

  // 4. Solution Analysis
  solutionAnalysis: {
    howItWorks: string
    featureMapping: { feature: string; problemSolved: string }[]
    mvpScope: string
    buildFirst: string[]
    postpone: string[]
    adoptionChallenges: string
  }

  // 5. Market and Competitor Analysis
  marketAndCompetitors: {
    relevantCompetitors: string[]
    existingAlternatives: string[]
    competitorComparison: {
      name: string
      targetAudience: string
      coreFeatures: string
      positioning: string
      pricingInfo: string
    }[]
    differentiationOpportunities: string[]
    researchLimitationsNotice: string
  }

  // 6. Business Model
  businessModel: {
    possibleRevenueModels: string[]
    whoPaysAndWhy: string
    pricingHypotheses: string
    acquisitionChallenges: string
    retentionChallenges: string
  }

  // 7. Risks and Weaknesses
  risksAndWeaknesses: {
    risk: string
    whyItMatters: string
    failureMechanism: string
    severity: 'High' | 'Medium' | 'Low'
    mitigationStrategy: string
  }[]

  // 8. Assumption Analysis
  assumptionAnalysis: {
    assumption: string
    whyItMatters: string
    ifFalseConsequence: string
    testMethod: string
  }[]

  // 9. Validation Plan
  validationPlan: {
    experiments: {
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
      status: ExpStatus
      notes: string
    }[]
  }

  // 10. Competitive Advantage
  competitiveAdvantage: {
    plausibleDifferentiators: string[]
    hardToSustainAdvantages: string[]
    defensibleAdvantages: string[]
    easilyCopiedFeatures: string[]
  }

  // 11. Final Recommendation
  finalRecommendation: {
    verdict: 'VALIDATE' | 'PROCEED WITH A SMALL MVP' | 'REVISE' | 'STOP OR RECONSIDER' | 'Proceed' | 'Revise' | 'Validate Further' | 'Reconsider'
    verdictReasoning: string
    strongestArgumentsFor: string[]
    strongestObjections: string[]
    nextFiveActions: string[]
  }

  // 12. Open Questions
  openQuestions: {
    missingMaterialInfo: string[]
    focusedFollowUpQuestions: string[]
    limitationsNotice: string
  }

  // Final Overall Verdict synthesized report (Section 1 to 9)
  overallVerdict?: OverallVerdictReport

  // Backward-compatible properties & summaries for quick access
  score: number
  opportunities: string[]
  risks: string[]
  assumptions: string[]
  questions: string[]
  experiments: Experiment[]
  nextSteps: string[]
  problemSolution?: {
    problemSummary: string
    solutionSummary: string
    problemUrgency: string
  }
  targetCustomers?: {
    profile: string
    verifiedSignals: string[]
    unverifiedAssumptions: string[]
  }
  competitorAnalysis?: {
    directCompetitors: string[]
    indirectWorkarounds: string[]
    switchingBarriers: string[]
  }
  evaluationType?: 'ai' | 'basic'
  evaluationNotice?: string
  isQuotaExceeded?: boolean
  interviewsSummary?: {
    total: number
    problemConfirmedCount: number
    wouldPayCount: number
  }
}

// Final 9-Section OVERALL VERDICT Report
export type FinalDecisionVerdict = 'BUILD' | 'VALIDATE FIRST' | 'RETHINK' | "DON'T PURSUE THIS VERSION"

export interface VerdictFactor {
  issue: string
  whyItMatters: string
  businessImpact: string
  supportingEvidence: string
  uncertainties: string
}

export interface ExecutionStep {
  priority: number
  what: string
  how: string[]
  why: string
  evidenceToCollect: string
  howToInterpret: string
  nextStep: string
}

export interface TimelineMilestone {
  action: string
  timeEstimate: string
  dependency: string
  expectedDeliverable: string
  decisionPoint: string
}

export interface OverallVerdictReport {
  // Section 1: Final Verdict
  decision: FinalDecisionVerdict
  conciseExplanation: string
  strongestReason: string
  biggestConcern: string
  singleMostImportantNextAction: string
  isProvisionalNotice: string

  // Section 2: Why Could This Idea Succeed or Fail?
  whyItCouldSucceed: VerdictFactor[]
  whyItCouldFail: VerdictFactor[]

  // Section 3: What Should the Founder Build?
  minimumViableScope: {
    firstCustomerSegment: string
    problemToSolve: string
    essentialFunctionality: string[]
    excludedScope: string[]
    whyThisScopeIsAppropriate: string
    resultJustifyingFurtherDevelopment: string
    recommendedFormat: string // manual concierge, clickable prototype, landing test, etc.
  }

  // Section 4: How Should the Founder Execute?
  executionPlan: ExecutionStep[]

  // Section 5: When Should Each Action Happen?
  timeline: {
    milestones: TimelineMilestone[]
    scheduleEstimateDisclaimer: string
  }

  // Section 6: Competitive Advantage
  competitiveAdvantage: {
    currentAlternatives: string[]
    strongestCompetitors: string[]
    whyCustomerMightSwitch: string
    keyDifferentiator: string
    isDefensibleOrEasyToCopy: string
    validationTestForAdvantage: string
    researchDisclosureNotice: string
  }

  // Section 7: The Critical Assumption
  criticalAssumption: {
    assumption: string
    whyBusinessDependsOnIt: string
    ifFalseConsequence: string
    cheapestTest: string
    positiveSignalMeaning: string
    negativeSignalMeaning: string
    inconclusiveSignalMeaning: string
    verdictAdjustmentOnResults: string
  }

  // Section 8: What Would Change the Verdict?
  whatWouldChangeVerdict: {
    moreConfidentConditions: string[]
    lessConfidentConditions: string[]
    changeCustomerConditions: string[]
    changeSolutionConditions: string[]
    stopConditions: string[]
  }

  // Section 9: Your Next Three Actions
  nextThreeActions: {
    rank: number
    title: string
    what: string
    how: string
    whyPriority: string
    targetResult: string
    followOnDecision: string
  }[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  error?: boolean
  timestamp?: string
}

export interface EvaluationVersion {
  id: string
  timestamp: string
  form: IdeaForm
  analysis: Analysis
  modelUsed?: string
}

export interface Project {
  id: string
  form: IdeaForm
  status: Status
  updated: string
  analysis?: Analysis
  sample?: boolean
  error?: string
  modelUsed?: string
  evaluationType?: 'ai' | 'basic'
  evaluationNotice?: string
  isQuotaExceeded?: boolean
  interviews?: CustomerInterview[]
  trackedAssumptions?: TrackedAssumption[]
  history?: EvaluationVersion[]
  chatHistory?: ChatMessage[]
}

export type DiscoveryCategory =
  | 'All'
  | 'Small Businesses'
  | 'Education'
  | 'Productivity'
  | 'Creator Tools'
  | 'Technology'
  | 'Everyday Life'

export interface DiscoveryOpportunity {
  id: string
  title: string
  category: Exclude<DiscoveryCategory, 'All'>
  tagline: string
  problem: string
  whoExperiencesIt: string
  whyItMatters: string
  existingAlternatives: string
  importantUnknowns: string[]
  investigationMethod: string
  actionPlan: string[]
  starterConcept: {
    name: string
    description: string
    problem: string
    solution: string
    customer: string
    model: string
  }
  framework: {
    name: string
    principle: string
    actionPrompt: string
  }
  realityCheckQuestions: {
    question: string
    criticalRisk: string
  }[]
  tags: string[]
  isHypothesis: true
}

export type Route =
  | { page: 'landing' | 'dashboard' }
  | { page: 'new'; editId?: string; seed?: string }
  | { page: 'project'; id: string }
  | { page: 'verdict'; id: string }
