import type { Project, IdeaForm, CustomerInterview, ValidationSprint, ProjectTimelineEntry } from '../types'
import { generateBasicEvaluation } from '../lib/basicEvaluation'
import { generateInitialSprint } from '../lib/validationSprint'

const mk = (
  name: string,
  description: string,
  problem: string,
  customer: string,
  current: string
): IdeaForm => ({
  name,
  description,
  problem,
  solution: description,
  customer,
  segment: 'Independent operators',
  market: 'Urban US',
  current,
  model: '$49/mo SaaS',
  stage: 'Idea',
  competitors: 'Excel, WhatsApp groups',
  demand: 'Spoke to 3 owners who confirmed $400/mo waste',
})

const a = mk(
  'Inventory management for local retailers',
  'Simple stock tracking and automatic reorder alerts for single-location specialty shops.',
  'Retailers lose up to 15% in revenue to stock-outs and excess dead inventory.',
  'Independent specialty retail store owners',
  'Handwritten logbooks and Excel sheets'
)

const b = mk(
  'Patient cancellation and deposit coordinator',
  'Automated reminder and deposit collection assistant for private dental and physical therapy clinics.',
  'Clinics lose over $1,200 each week from last-minute appointment no-shows.',
  'Private medical and physiotherapy clinic managers',
  'Manual phone calls and paper appointment cards'
)

const sampleInterviewsA: CustomerInterview[] = [
  {
    id: 'int-1',
    date: '2026-10-18',
    intervieweeRole: 'Owner, Downtown Bookshop & Gifts',
    problemConfirmed: true,
    frequency: 'Daily',
    wouldPay: true,
    estimatedBudget: '$50/mo',
    currentWorkaround: 'Daily Excel sheet count done after closing',
    keyQuotes: 'We ran out of our top holiday candle on Saturday and lost at least $600 in sales.',
    notes: 'Strong willingness to pay if it runs on an iPad at checkout.',
  },
  {
    id: 'int-2',
    date: '2026-10-21',
    intervieweeRole: 'Store Manager, Heritage Home Goods',
    problemConfirmed: true,
    frequency: 'Weekly',
    wouldPay: false,
    estimatedBudget: '',
    currentWorkaround: 'Weekly physical count by staff',
    keyQuotes: 'It is annoying, but our staff has downtime during Tuesday mornings anyway.',
    notes: 'Considers pain moderate; would not allocate new software budget.',
  },
]

const analysisA = generateBasicEvaluation(a, sampleInterviewsA)
const sprintA = generateInitialSprint({ id: 's1', form: a, status: 'Validating', updated: '2026-10-24', analysis: analysisA })

// Mark step 2 and 3 complete in sample
sprintA.tasks = sprintA.tasks.map(t => {
  if (t.id === 'step-1-eval' || t.id === 'step-2-beachhead' || t.id === 'step-3-contact') {
    return { ...t, status: 'Completed' }
  }
  return t
})

const sampleTimelineA: ProjectTimelineEntry[] = [
  {
    id: 'tl-1',
    timestamp: '2026-10-21T15:30:00Z',
    type: 'interview_logged',
    title: 'Interview Logged: Store Manager, Heritage Home Goods',
    description: 'Problem confirmed, but willingness to pay was refuted (uses existing staff downtime).',
  },
  {
    id: 'tl-2',
    timestamp: '2026-10-18T11:00:00Z',
    type: 'interview_logged',
    title: 'Interview Logged: Owner, Downtown Bookshop',
    description: 'Confirmed acute holiday stockout pain ($600 lost) and stated willingness to pay $50/mo.',
    scoreDelta: { before: 25, after: 45 },
  },
  {
    id: 'tl-3',
    timestamp: '2026-10-15T09:00:00Z',
    type: 'sprint_started',
    title: '7-Day Customer Discovery Sprint Started',
    description: 'Initial deterministic evaluation completed with baseline readiness score of 25/100.',
  },
]

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: 's1',
    form: a,
    status: 'Validating',
    updated: '2026-10-24',
    analysis: analysisA,
    interviews: sampleInterviewsA,
    sprint: sprintA,
    timeline: sampleTimelineA,
    sample: true,
  },
  {
    id: 's2',
    form: b,
    status: 'Evaluating',
    updated: '2026-10-26',
    sample: true,
  },
]
