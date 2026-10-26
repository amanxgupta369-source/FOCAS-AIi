import assert from 'node:assert/strict'
import {
  FOUNDER_KNOWLEDGE_LIBRARY,
  getFrameworkById,
} from '../src/lib/founderEngine/knowledgeLibrary.ts'
import { understandIdea } from '../src/lib/founderEngine/ideaUnderstanding.ts'
import { detectMissingInformation } from '../src/lib/founderEngine/missingInfoDetection.ts'
import { validateProblem } from '../src/lib/founderEngine/problemValidation.ts'
import { analyzeCustomer } from '../src/lib/founderEngine/customerAnalysis.ts'
import { analyzeCompetitorsAndAlternatives } from '../src/lib/founderEngine/competitorAlternatives.ts'
import { analyzeFeasibility } from '../src/lib/founderEngine/feasibilityAnalysis.ts'
import { analyzeBusinessModel } from '../src/lib/founderEngine/businessModelAnalysis.ts'
import { analyzeRisks } from '../src/lib/founderEngine/riskAnalysis.ts'
import { generateValidationExperiments } from '../src/lib/founderEngine/experimentGenerator.ts'
import { generateActionPlan } from '../src/lib/founderEngine/actionPlanGenerator.ts'
import { evaluateDecision } from '../src/lib/founderEngine/decisionEngine.ts'
import {
  evaluateStartupIdea,
  getDeterministicAdvisorResponse,
} from '../src/lib/founderEngine/index.ts'

console.log('================================================================')
console.log('FOCAS Deterministic Founder Intelligence Engine Test Suite')
console.log('================================================================')

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
// TEST GROUP 1: Versioned Knowledge Library Integrity
// ----------------------------------------------------------------------------
console.log('\n[1] Testing Founder Knowledge Library Integrity...')

test('Library contains all 11 required domain frameworks', () => {
  assert.equal(FOUNDER_KNOWLEDGE_LIBRARY.length, 11)
  const areas = new Set(FOUNDER_KNOWLEDGE_LIBRARY.map(f => f.area))
  assert.ok(areas.has('Customer Discovery'))
  assert.ok(areas.has('Problem Validation'))
  assert.ok(areas.has('Market Hypotheses'))
  assert.ok(areas.has('Competitor Analysis'))
  assert.ok(areas.has('Product Feasibility'))
  assert.ok(areas.has('Pricing and Business Models'))
  assert.ok(areas.has('Distribution and Customer Acquisition'))
  assert.ok(areas.has('Product-Market Fit'))
  assert.ok(areas.has('Experiment Design'))
  assert.ok(areas.has('Startup Financial Fundamentals'))
  assert.ok(areas.has('Technical and Operational Risk'))
})

test('Every framework has complete metadata (id, version, purpose, rules, limitations, examples, source)', () => {
  for (const f of FOUNDER_KNOWLEDGE_LIBRARY) {
    assert.ok(f.id, 'Missing id')
    assert.ok(f.version, `Missing version for ${f.id}`)
    assert.ok(f.title, `Missing title for ${f.id}`)
    assert.ok(f.purpose, `Missing purpose for ${f.id}`)
    assert.ok(Array.isArray(f.requiredInputs) && f.requiredInputs.length > 0, `Missing requiredInputs for ${f.id}`)
    assert.ok(Array.isArray(f.decisionRules) && f.decisionRules.length > 0, `Missing decisionRules for ${f.id}`)
    assert.ok(Array.isArray(f.limitations) && f.limitations.length > 0, `Missing limitations for ${f.id}`)
    assert.ok(Array.isArray(f.examples) && f.examples.length > 0, `Missing examples for ${f.id}`)
    assert.ok(f.source, `Missing source for ${f.id}`)
  }
})

test('getFrameworkById retrieves framework accurately', () => {
  const momTest = getFrameworkById('customer-discovery-mom-test')
  assert.ok(momTest)
  assert.equal(momTest.id, 'customer-discovery-mom-test')
  assert.ok(momTest.title.includes('The Mom Test'))
})

// ----------------------------------------------------------------------------
// TEST GROUP 2: Idea Understanding Module
// ----------------------------------------------------------------------------
console.log('\n[2] Testing Module 1: Idea Understanding...')

test('Correctly extracts signals from B2B SaaS idea', () => {
  const form = {
    name: 'AuditFlow',
    description: 'Automated GDPR compliance audits for fintech SaaS companies.',
    problem: 'Companies spend 40 hours monthly fixing manual audit errors and risking heavy GDPR fines.',
    solution: 'Automated continuous audit scanner that connects to AWS and outputs compliance logs.',
    customer: 'Chief Information Security Officers at fintech startups',
    segment: 'B2B SaaS companies with 20-100 employees',
    market: 'European Union and UK',
    current: 'Manual spreadsheets, external consultants, and Jira checklists',
    model: 'B2B subscription ($299/mo per seat)',
    stage: 'Idea',
    competitors: 'Vanta, Secureframe',
    demand: 'Spoke with 3 CISOs who confirmed annual audit headaches',
    frequency: 'Monthly',
    costs: '$200/mo server hosting and cloud API costs',
    priorExperiments: 'Consulting pilot with 1 startup',
  }

  const u = understandIdea(form)
  assert.equal(u.cleanName, 'AuditFlow')
  assert.ok(u.signals.isB2B)
  assert.ok(!u.signals.isConsumer)
  assert.ok(u.signals.hasSpecificCustomer)
  assert.ok(u.signals.hasPainTrigger)
  assert.ok(u.signals.hasIdentifiedAlternatives)
  assert.ok(u.signals.hasCostEstimate)
  assert.equal(u.frequencyCategory, 'Monthly')
})

test('Correctly identifies marketplace and consumer ideas', () => {
  const form = {
    name: 'TutorNest',
    description: 'A two-sided marketplace connecting student math tutors with parents.',
    problem: 'Parents waste hours searching for affordable math tutors for their high school kids.',
    solution: 'A marketplace matching verified college tutors with local parents.',
    customer: 'Parents with high school students',
    segment: 'Suburban families',
    market: 'US',
    current: 'Facebook groups, word of mouth',
    model: '15% transaction take-rate per lesson',
    stage: 'Idea',
    competitors: 'Wyzant, Varsity Tutors',
    demand: '',
    frequency: 'Weekly',
  }

  const u = understandIdea(form)
  assert.ok(u.signals.isMarketplace)
  assert.ok(u.signals.isConsumer)
  assert.equal(u.frequencyCategory, 'Weekly')
})

// ----------------------------------------------------------------------------
// TEST GROUP 3: Missing Information Detection Module
// ----------------------------------------------------------------------------
console.log('\n[3] Testing Module 2: Missing Information Detection...')

test('Detects missing frequency, costs, and demand in incomplete idea', () => {
  const form = {
    name: 'QuickClean',
    description: 'A website for cleaning services.',
    problem: 'People want clean homes.',
    solution: 'App to book cleaners.',
    customer: 'Everyone',
    segment: '',
    market: '',
    current: '',
    model: '',
    stage: 'Idea',
    competitors: '',
    demand: '',
  }

  const u = understandIdea(form)
  const missing = detectMissingInformation(form, u)

  assert.equal(missing.completenessRating, 'Critically Incomplete')
  assert.ok(missing.missingMaterialInfo.length >= 4)
  assert.ok(missing.missingMaterialInfo.some(m => m.includes('frequency')))
  assert.ok(missing.missingMaterialInfo.some(m => m.includes('customer is defined too broadly')))
  assert.ok(missing.missingMaterialInfo.some(m => m.includes('cope with this problem today')))
  assert.ok(missing.focusedFollowUpQuestions.length > 0)
})

// ----------------------------------------------------------------------------
// TEST GROUP 4: Problem Validation Module
// ----------------------------------------------------------------------------
console.log('\n[4] Testing Module 3: Problem Validation...')

test('Assigns high acuity score to Hair-on-Fire B2B problem with financial and legal triggers', () => {
  const form = {
    name: 'TaxShield',
    description: 'Automated VAT reconciliation.',
    problem: 'Small retailers lose thousands in penalties and waste 20 hours/month on VAT errors.',
    solution: 'Automated VAT reconciliation engine.',
    customer: 'E-commerce business owners',
    segment: 'Online stores doing >$50k/mo',
    market: 'UK',
    current: 'Excel spreadsheets and late-night bookkeeping',
    model: 'Monthly subscription',
    stage: 'Idea',
    competitors: '',
    demand: '',
    frequency: 'Monthly',
  }

  const u = understandIdea(form)
  const pv = validateProblem(u)

  assert.ok(pv.acuityScore >= 60, `Expected acuityScore >= 60, got ${pv.acuityScore}`)
  assert.ok(pv.severityDrivers.some(d => d.includes('penalty') || d.includes('hours')))
})

// ----------------------------------------------------------------------------
// TEST GROUP 5: Competitor & Alternatives (No Hallucinations Rule)
// ----------------------------------------------------------------------------
console.log('\n[5] Testing Module 5: Competitor & Alternatives Honesty...')

test('Does NOT fabricate fake competitor companies, prices, or user statistics', () => {
  const form = {
    name: 'BakeSync',
    description: 'Bakery inventory management.',
    problem: 'Bakeries throw away leftover dough every morning.',
    solution: 'Daily batch predictor.',
    customer: 'Artisan bakeries',
    segment: 'Independent bakeries',
    market: 'Local',
    current: 'Whiteboard notes and gut feeling',
    model: '$50/mo',
    stage: 'Idea',
    competitors: '', // Founder did not supply competitors
    demand: '',
  }

  const u = understandIdea(form)
  const ca = analyzeCompetitorsAndAlternatives(u)

  assert.ok(ca.relevantCompetitors[0].includes('None specifically identified by founder'))
  assert.ok(ca.existingAlternatives.some(a => a.includes('Whiteboard notes') || a.includes('manual routines')))
  assert.ok(ca.researchLimitationsNotice.includes('does not hallucinate fictional competitor companies'))
})

// ----------------------------------------------------------------------------
// TEST GROUP 6: Feasibility & MVP Scoping
// ----------------------------------------------------------------------------
console.log('\n[6] Testing Module 6: Product Feasibility & MVP Scoping...')

test('Separates build-first essentials from postponed features for Lean MVP', () => {
  const form = {
    name: 'FitTrack',
    description: 'Personal training client workout logger.',
    problem: 'Trainers lose track of client workout sets on paper.',
    solution: 'Client tracking interface.',
    customer: 'Independent personal trainers',
    segment: 'Solo gym trainers',
    market: 'US',
    current: 'Paper notebooks and WhatsApp messages',
    model: '$29/mo',
    stage: 'Idea',
    competitors: '',
    demand: '',
  }

  const u = understandIdea(form)
  const feas = analyzeFeasibility(u)

  assert.ok(feas.buildFirst.length > 0)
  assert.ok(feas.postpone.length > 0)
  assert.ok(feas.postpone.some(p => p.includes('mobile apps') || p.includes('billing') || p.includes('enterprise')))
  assert.ok(feas.estimatedTimeToMvpWeeks <= 4)
})

// ----------------------------------------------------------------------------
// TEST GROUP 7: Risk Identification & Mitigation
// ----------------------------------------------------------------------------
console.log('\n[7] Testing Module 8: Risk Analysis...')

test('Identifies Willingness-to-Pay Deficiency, Habit Inertia, and Distribution risks', () => {
  const form = {
    name: 'InvoiceAlert',
    description: 'Unpaid invoice reminder tool.',
    problem: 'Freelancers get paid 30 days late.',
    solution: 'Automated invoice follow-up messages.',
    customer: 'Freelancers',
    segment: 'Freelance copywriters',
    market: 'Global',
    current: 'Manual calendar reminders and awkward emails',
    model: '$9/mo',
    stage: 'Idea',
    competitors: '',
    demand: '',
  }

  const u = understandIdea(form)
  const risks = analyzeRisks(u)

  assert.ok(risks.length >= 4)
  assert.ok(risks.some(r => r.risk.includes('Willingness-to-Pay')))
  assert.ok(risks.some(r => r.risk.includes('Status-Quo Bias') || r.risk.includes('Inertia')))
  assert.ok(risks.some(r => r.risk.includes('Distribution')))
})

// ----------------------------------------------------------------------------
// TEST GROUP 8: Decision Engine Tree Logic
// ----------------------------------------------------------------------------
console.log('\n[8] Testing Module 11: Decision Engine Tree Logic...')

test('Recommends VALIDATE FIRST for ideas with plausible logic but zero interviews', () => {
  const form = {
    name: 'DocuSync',
    description: 'Syncs vendor PDF receipts to QuickBooks.',
    problem: 'Bookkeepers spend 8 hours every Friday manually typing receipt numbers into accounting tools.',
    solution: '1-click receipt parser for QuickBooks.',
    customer: 'Bookkeepers and accountants',
    segment: 'Solo accounting practitioners',
    market: 'US',
    current: 'Typing by hand into QuickBooks',
    model: '$49/mo',
    stage: 'Idea',
    competitors: 'Dext, Hubdoc',
    demand: '',
    frequency: 'Weekly',
  }

  const u = understandIdea(form)
  const pv = validateProblem(u)
  const dec = evaluateDecision(u, pv, [], [])

  assert.equal(dec.decision, 'VALIDATE FIRST')
  assert.equal(dec.finalRecommendationVerdict, 'VALIDATE')
  assert.ok(dec.readinessScore >= 40 && dec.readinessScore <= 75)
  assert.ok(dec.scoreBreakdown.explanation.includes('Readiness Index'))
})

test('Recommends BUILD when multiple interviews confirm acute pain and willingness to pay', () => {
  const form = {
    name: 'DocuSync',
    description: 'Syncs vendor PDF receipts to QuickBooks.',
    problem: 'Bookkeepers spend 8 hours every Friday manually typing receipt numbers into accounting tools.',
    solution: '1-click receipt parser for QuickBooks.',
    customer: 'Bookkeepers and accountants',
    segment: 'Solo accounting practitioners',
    market: 'US',
    current: 'Typing by hand into QuickBooks',
    model: '$49/mo',
    stage: 'Prototype',
    competitors: 'Dext, Hubdoc',
    demand: '4 bookkeepers stated they would pay $50/mo immediately',
    frequency: 'Weekly',
  }

  const interviews = [
    { id: '1', date: '2026-10-01', intervieweeRole: 'Bookkeeper', problemConfirmed: true, frequency: 'Weekly', wouldPay: true, currentWorkaround: 'Typing manual numbers', keyQuotes: 'I hate Fridays', notes: 'Urgent' },
    { id: '2', date: '2026-10-02', intervieweeRole: 'Accountant', problemConfirmed: true, frequency: 'Weekly', wouldPay: true, currentWorkaround: 'Typing manual numbers', keyQuotes: 'Take my money', notes: 'Wants pilot' },
    { id: '3', date: '2026-10-03', intervieweeRole: 'CPA', problemConfirmed: true, frequency: 'Daily', wouldPay: true, currentWorkaround: 'Typing manual numbers', keyQuotes: 'Big time saver', notes: 'Ready to buy' },
  ]

  const u = understandIdea(form)
  const pv = validateProblem(u, interviews)
  const dec = evaluateDecision(u, pv, interviews, [])

  assert.equal(dec.decision, 'BUILD')
  assert.equal(dec.finalRecommendationVerdict, 'PROCEED WITH A SMALL MVP')
  assert.ok(dec.readinessScore >= 75)
})

test('Recommends DONT PURSUE when critical assumptions are disproved by evidence', () => {
  const form = {
    name: 'PetSitterCoin',
    description: 'Blockchain pet sitting marketplace.',
    problem: 'Pet sitters want crypto tokens.',
    solution: 'Crypto pet sitting token.',
    customer: 'Pet owners',
    segment: 'Crypto holders with pets',
    market: 'US',
    current: 'Cash and Rover',
    model: 'Token appreciation',
    stage: 'Idea',
    competitors: 'Rover',
    demand: '',
  }

  const disprovedAssumptions = [
    { id: 'a1', assumption: 'Pet owners want to pay in crypto tokens', category: 'Customer', state: 'Disproved', evidenceNotes: '10/10 owners refused', lastUpdated: '2026-10-01' },
    { id: 'a2', assumption: 'Pet sitters want token payouts instead of cash', category: 'Pricing', state: 'Disproved', evidenceNotes: 'All sitters demanded bank transfer', lastUpdated: '2026-10-01' },
  ]

  const u = understandIdea(form)
  const pv = validateProblem(u, [], disprovedAssumptions)
  const dec = evaluateDecision(u, pv, [], disprovedAssumptions)

  assert.equal(dec.decision, "DON'T PURSUE THIS VERSION")
  assert.equal(dec.finalRecommendationVerdict, 'STOP OR RECONSIDER')
  assert.ok(dec.verdictReasoning.includes('disproved assumption'))
})

// ----------------------------------------------------------------------------
// TEST GROUP 9: End-to-End Startup Idea Evaluation & Output Interface
// ----------------------------------------------------------------------------
console.log('\n[9] Testing End-to-End evaluateStartupIdea...')

test('Generates complete 12-section Analysis and 9-section overallVerdict without external AI API', () => {
  const form = {
    name: 'ColdOutreachCleaner',
    description: 'Cleans B2B email lists to prevent domain blacklisting.',
    problem: 'Founders get their Google Workspace domains burned due to high bounce rates.',
    solution: 'Real-time SMTP bounce checker before sending cold emails.',
    customer: 'B2B startup founders doing outbound sales',
    segment: 'Early-stage tech startups',
    market: 'North America',
    current: 'NeverBounce, ZeroBounce, or not checking at all',
    model: '$39/month for 5,000 verifications',
    stage: 'Idea',
    competitors: 'NeverBounce, ZeroBounce',
    demand: 'Spoke with 5 founders who had domains burned',
    frequency: 'Daily',
    costs: '$50/mo server VPS',
    priorExperiments: 'Manual validation for 2 friends',
  }

  const analysis = evaluateStartupIdea(form)

  // Verify all 12 core sections exist
  assert.ok(analysis.executiveSummary, 'Missing executiveSummary')
  assert.ok(analysis.problemAnalysis, 'Missing problemAnalysis')
  assert.ok(analysis.customerAnalysis, 'Missing customerAnalysis')
  assert.ok(analysis.solutionAnalysis, 'Missing solutionAnalysis')
  assert.ok(analysis.marketAndCompetitors, 'Missing marketAndCompetitors')
  assert.ok(analysis.businessModel, 'Missing businessModel')
  assert.ok(analysis.risksAndWeaknesses, 'Missing risksAndWeaknesses')
  assert.ok(analysis.assumptionAnalysis, 'Missing assumptionAnalysis')
  assert.ok(analysis.validationPlan, 'Missing validationPlan')
  assert.ok(analysis.competitiveAdvantage, 'Missing competitiveAdvantage')
  assert.ok(analysis.finalRecommendation, 'Missing finalRecommendation')
  assert.ok(analysis.openQuestions, 'Missing openQuestions')

  // Verify 9-section Overall Verdict synthesized report
  assert.ok(analysis.overallVerdict, 'Missing overallVerdict')
  assert.ok(analysis.overallVerdict.decision)
  assert.ok(analysis.overallVerdict.whyItCouldSucceed.length > 0)
  assert.ok(analysis.overallVerdict.whyItCouldFail.length > 0)
  assert.ok(analysis.overallVerdict.minimumViableScope)
  assert.ok(analysis.overallVerdict.executionPlan.length > 0)
  assert.ok(analysis.overallVerdict.timeline.milestones.length > 0)
  assert.ok(analysis.overallVerdict.competitiveAdvantage)
  assert.ok(analysis.overallVerdict.criticalAssumption)
  assert.ok(analysis.overallVerdict.whatWouldChangeVerdict)
  assert.ok(analysis.overallVerdict.nextThreeActions.length === 3)

  // Verify evaluation notice explicitly states deterministic engine
  assert.ok(analysis.evaluationNotice.includes('Zero External AI API Dependencies'))
})

// ----------------------------------------------------------------------------
// TEST GROUP 10: Deterministic Thinking Partner Advisor
// ----------------------------------------------------------------------------
console.log('\n[10] Testing Deterministic Thinking Partner Advisor...')

test('Advisor answers score questions accurately without LLM call', () => {
  const form = { name: 'SaaSFlow', problem: 'Billing errors', customer: 'SaaS CEOs', solution: 'Fixer', model: '$99/mo', stage: 'Idea', competitors: '', demand: '', current: 'Stripe logs' }
  const analysis = evaluateStartupIdea(form)
  const project = { id: 'p1', form, analysis, status: 'Validating', updated: new Date().toISOString() }

  const reply = getDeterministicAdvisorResponse('Why did you give me this score?', project)
  assert.ok(reply.includes('FOCAS Readiness Index'))
  assert.ok(reply.includes('evidence-completeness index'))
  assert.ok(reply.includes('How to increase your readiness score'))
})

test('Advisor answers risk questions with structured failure modes', () => {
  const form = { name: 'SaaSFlow', problem: 'Billing errors', customer: 'SaaS CEOs', solution: 'Fixer', model: '$99/mo', stage: 'Idea', competitors: '', demand: '', current: 'Stripe logs' }
  const analysis = evaluateStartupIdea(form)
  const project = { id: 'p1', form, analysis, status: 'Validating', updated: new Date().toISOString() }

  const reply = getDeterministicAdvisorResponse('What is my biggest risk and how could this fail?', project)
  assert.ok(reply.includes('Top Risks for "SaaSFlow"'))
  assert.ok(reply.includes('Failure mechanism'))
  assert.ok(reply.includes('How to mitigate'))
})

test('Advisor returns 5 Mom Test questions when asked about customer interviews', () => {
  const form = { name: 'SaaSFlow', problem: 'Billing errors', customer: 'SaaS CEOs', solution: 'Fixer', model: '$99/mo', stage: 'Idea', competitors: '', demand: '', current: 'Stripe logs' }
  const analysis = evaluateStartupIdea(form)
  const project = { id: 'p1', form, analysis, status: 'Validating', updated: new Date().toISOString() }

  const reply = getDeterministicAdvisorResponse('What questions should I ask during customer discovery interviews?', project)
  assert.ok(reply.includes('The Mom Test'))
  assert.ok(reply.includes('When was the last time'))
})

console.log('\n================================================================')
console.log(`Results: ${passed} Passed, ${failed} Failed`)
console.log('================================================================')

if (failed > 0) {
  process.exit(1)
}
