import assert from 'node:assert/strict'
import { understandIdea } from '../src/lib/founderEngine/ideaUnderstanding.ts'
import { analyzeCustomer } from '../src/lib/founderEngine/customerAnalysis.ts'
import { evaluateStartupIdea } from '../src/lib/founderEngine/index.ts'
import {
  generateInitialSprint,
  getSprintProgress,
  determineNextBestAction,
  computeRecalculationDelta,
  generateWeeklyReviewSummary,
} from '../src/lib/validationSprint.ts'

console.log('================================================================')
console.log('FOCAS AI: Validation Workspace & Evidence Test Suite')
console.log('================================================================\n')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  ✓ PASS: ${name}`)
    passed++
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`)
    console.error(`    ${err.message}`)
    failed++
  }
}

// ----------------------------------------------------------------------------
// TEST 1: Minimal-Input Idea Evaluation (Single Freeform Description)
// ----------------------------------------------------------------------------
test('Minimal input: only description provided derives title and customer assumption', () => {
  const minimalForm = {
    name: '',
    description: 'A tool that helps independent coffee shops cut daily milk waste and spoilage',
    problem: '',
    solution: '',
    customer: '',
    segment: '',
    market: '',
    current: '',
    model: '',
    stage: 'Idea',
    competitors: '',
    demand: '',
  }

  const understood = understandIdea(minimalForm)

  // Title must be derived rather than generic 'Untitled Concept'
  assert.ok(understood.cleanName.length > 0)
  assert.ok(understood.cleanName.toLowerCase().includes('tool that helps independent coffee'))

  // Customer must be inferred from coffee shop mention
  assert.ok(understood.cleanCustomer.length > 0)
  assert.equal(understood.cleanCustomer, 'Independent café owners')
  assert.equal(understood.isCustomerAssumed, true)
  assert.ok(understood.assumedCustomerNote.includes('Inferred assumption'))
})

// ----------------------------------------------------------------------------
// TEST 2: Missing Target Customer Handling & No Blank Prose
// ----------------------------------------------------------------------------
test('Missing customer produces explicit preliminary assumptions and clean Mom Test questions', () => {
  const minimalForm = {
    name: 'AutoReconcile',
    description: 'An app that reconciles invoices automatically using OCR and banks',
    problem: 'Manual bookkeeping takes 10 hours a week',
    solution: 'OCR parsing',
    customer: '',
    segment: '',
    market: '',
    current: '',
    model: '',
    stage: 'Idea',
    competitors: '',
    demand: '',
  }

  const understood = understandIdea(minimalForm)
  const custVal = analyzeCustomer(understood)

  // Must not have blank customer or bracket template artifacts like [problem]
  assert.ok(!custVal.primarySegment.includes('undefined'))
  assert.ok(custVal.primarySegment.length > 5)

  for (const q of custVal.momTestQuestions) {
    assert.ok(!q.includes('undefined'), `Found undefined in question: ${q}`)
    assert.ok(!q.includes('[]'), `Found empty brackets in question: ${q}`)
    assert.ok(!q.includes('[object'), `Found [object in question: ${q}`)
  }

  // Full evaluation must include explicit customer assumption
  const analysis = evaluateStartupIdea(minimalForm)
  assert.ok(analysis.assumptionAnalysis.length > 0)
})

// ----------------------------------------------------------------------------
// TEST 3: Guided 7-Day Validation Sprint Creation & Endowed Progress
// ----------------------------------------------------------------------------
test('Sprint creation generates 7 steps with Step 1 completed (endowed progress)', () => {
  const mockProject = {
    id: 'p-1',
    form: {
      name: 'CaféFlow',
      description: 'Inventory assistant for independent cafes',
      problem: 'Milk spoilage costs $300 a month',
      solution: 'Daily prediction',
      customer: 'Independent café owners',
      segment: 'Single-location cafes',
      market: 'London',
      current: 'Paper sheets',
      model: '$29/mo',
      stage: 'Idea',
      competitors: '',
      demand: '',
    },
    status: 'Validating',
    updated: new Date().toISOString(),
  }

  const sprint = generateInitialSprint(mockProject)
  assert.equal(sprint.tasks.length, 7)

  // Step 1 must be marked 'Completed' (endowed progress effect)
  const step1 = sprint.tasks.find(t => t.stepNumber === 1)
  assert.ok(step1)
  assert.equal(step1.status, 'Completed')

  // Steps 2 to 7 must be Pending
  const remaining = sprint.tasks.filter(t => t.stepNumber > 1)
  assert.ok(remaining.every(t => t.status === 'Pending'))

  const progress = getSprintProgress(sprint)
  assert.equal(progress.completedCount, 1)
  assert.equal(progress.totalCount, 7)
  assert.equal(progress.percent, 14)
  assert.equal(progress.currentTask?.stepNumber, 2)
})

// ----------------------------------------------------------------------------
// TEST 4: Next Best Action Determination
// ----------------------------------------------------------------------------
test('Next best action prioritizes first customer interview when 0 interviews logged', () => {
  const mockProjectZeroInterviews = {
    id: 'p-1',
    form: {
      name: 'CaféFlow',
      description: 'Inventory assistant for independent cafes',
      problem: 'Milk spoilage costs $300 a month',
      solution: 'Daily prediction',
      customer: 'Independent café owners',
      segment: 'Single-location cafes',
      market: 'London',
      current: 'Paper sheets',
      model: '$29/mo',
      stage: 'Idea',
      competitors: '',
      demand: '',
    },
    interviews: [],
    trackedAssumptions: [],
    status: 'Validating',
    updated: new Date().toISOString(),
  }

  const nextAction = determineNextBestAction(mockProjectZeroInterviews)
  assert.equal(nextAction.primaryActionType, 'interview')
  assert.ok(nextAction.action.includes('1 discovery call'))
  assert.ok(nextAction.primaryButtonLabel.includes('Log First Interview'))
})

// ----------------------------------------------------------------------------
// TEST 5: Customer Interview Logging & Readiness Score Delta
// ----------------------------------------------------------------------------
test('Recalculation delta increases score when problem is verified by customers', () => {
  const form = {
    name: 'ClinicRemind',
    description: 'Automatic patient deposit and cancellation manager for dental clinics',
    problem: 'No-shows cost $1,500 every week',
    solution: 'Automated SMS deposit collection',
    customer: 'Private dental clinic managers',
    segment: 'Solo practice clinics',
    market: 'US',
    current: 'Phone calls by receptionist',
    model: '$99/mo',
    stage: 'Idea',
    competitors: 'Manual calls',
    demand: '',
  }

  const initialAnalysis = evaluateStartupIdea(form, [])
  const initialScore = initialAnalysis.score

  // Add 3 positive interviews with confirmed pain
  const interviews = [
    {
      id: 'i-1',
      date: '2026-10-20',
      intervieweeRole: 'Dental Office Manager',
      problemConfirmed: true,
      frequency: 'Daily',
      wouldPay: true,
      estimatedBudget: '$100/mo',
      currentWorkaround: 'Excel sheet + calls',
      keyQuotes: 'We lost $2,000 this month alone from no-shows.',
      notes: 'Desperately needs automated deposit holding.',
    },
    {
      id: 'i-2',
      date: '2026-10-21',
      intervieweeRole: 'Lead Receptionist',
      problemConfirmed: true,
      frequency: 'Daily',
      wouldPay: true,
      estimatedBudget: '$80/mo',
      currentWorkaround: 'Sticky notes',
      keyQuotes: 'Calling 50 patients a day is exhausting.',
      notes: 'Strong buying intent.',
    },
    {
      id: 'i-3',
      date: '2026-10-22',
      intervieweeRole: 'Practice Owner / Dentist',
      problemConfirmed: true,
      frequency: 'Weekly',
      wouldPay: true,
      estimatedBudget: '$150/mo',
      currentWorkaround: 'Manual confirmation',
      keyQuotes: 'Empty chairs kill our practice profitability.',
      notes: 'Will sign up for a pilot today.',
    },
  ]

  const updatedAnalysis = evaluateStartupIdea(form, interviews)
  const updatedScore = updatedAnalysis.score

  assert.ok(
    updatedScore > initialScore,
    `Expected updated score (${updatedScore}) to exceed initial score (${initialScore})`
  )

  const delta = computeRecalculationDelta(initialAnalysis, updatedAnalysis, interviews, [])
  assert.equal(delta.scoreBefore, initialScore)
  assert.equal(delta.scoreAfter, updatedScore)
  assert.ok(delta.plainEnglishExplanation.includes('Readiness Index increased'))
  assert.ok(delta.plainEnglishExplanation.includes('3 of 3 target customers confirmed experiencing acute pain'))
})

// ----------------------------------------------------------------------------
// TEST 6: Disproved Assumptions Penalize Score Honestly
// ----------------------------------------------------------------------------
test('Disproved assumptions reduce score and update verdict honestly', () => {
  const form = {
    name: 'PetSocial',
    description: 'Social networking app for dog owners in parks',
    problem: 'Dog owners want to meet other dog owners nearby',
    solution: 'Mobile map app',
    customer: 'Urban dog owners',
    segment: 'Millennials',
    market: 'NYC',
    current: 'Chatting in park',
    model: 'Ads',
    stage: 'Idea',
    competitors: 'None',
    demand: '',
  }

  const baselineAnalysis = evaluateStartupIdea(form, [])

  // Two core assumptions refuted in customer interviews
  const disprovedAssumptions = [
    {
      id: 'a-1',
      assumption: 'Dog owners are willing to download an app to arrange park playdates',
      category: 'Customer',
      state: 'Disproved',
      evidenceNotes: '5 of 5 dog owners said talking in the park is free and they do not want another notification app.',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'a-2',
      assumption: 'Users will pay or tolerate ads to find park friends',
      category: 'Pricing',
      state: 'Disproved',
      evidenceNotes: '100% of respondents rejected ads or subscription.',
      lastUpdated: new Date().toISOString(),
    },
  ]

  const postTestAnalysis = evaluateStartupIdea(form, [], disprovedAssumptions)

  assert.ok(postTestAnalysis.score < baselineAnalysis.score)
  assert.equal(postTestAnalysis.overallVerdict?.decision, "DON'T PURSUE THIS VERSION")

  const delta = computeRecalculationDelta(baselineAnalysis, postTestAnalysis, [], disprovedAssumptions)
  assert.ok(delta.plainEnglishExplanation.includes('Readiness Index decreased'))
  assert.ok(delta.plainEnglishExplanation.includes('flagged as disproved'))
})

// ----------------------------------------------------------------------------
// TEST 7: Weekly Founder Review Summary Generation
// ----------------------------------------------------------------------------
test('Weekly founder review generates honest progress snapshot without fluff', () => {
  const project = {
    id: 'p-rev',
    form: {
      name: 'BakeSupply',
      description: 'Wholesale flour ordering for bakeries',
      problem: 'Distributor markups',
      customer: 'Independent bakery owners',
      segment: 'Artisan bakeries',
      market: 'UK',
      current: 'Distributors',
      model: '5% fee',
      stage: 'Idea',
      competitors: '',
      demand: '',
    },
    interviews: [
      {
        id: 'int-1',
        date: '2026-10-25',
        intervieweeRole: 'Head Baker',
        problemConfirmed: true,
        frequency: 'Weekly',
        wouldPay: false,
        estimatedBudget: '',
        currentWorkaround: 'Supplier phone orders',
        keyQuotes: 'Flour price is high, but delivery reliability is more important.',
        notes: 'Price is secondary to delivery timing.',
      },
    ],
    status: 'Validating',
    updated: new Date().toISOString(),
  }

  const summary = generateWeeklyReviewSummary(project)
  assert.ok(summary.headline.includes('BakeSupply'))
  assert.ok(summary.interviewsSummary.includes('1 total interview(s) logged'))
  assert.equal(summary.pricingStatus, 'Willingness to Pay Unproven')
})

// ----------------------------------------------------------------------------
// Summary Report
// ----------------------------------------------------------------------------
console.log('\n================================================================')
console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`)
console.log('================================================================\n')

if (failed > 0) {
  process.exit(1)
}
