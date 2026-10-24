import type { Project, IdeaForm } from '../types'
import { generateAnalysis } from '../lib/analysis'

const mk = (name: string, description: string, problem: string, customer: string, current: string): IdeaForm => ({
  name, description, problem, solution: description, customer, segment: 'Small teams', market: 'Illustrative sample', current,
  model: '', stage: 'Idea', competitors: '', demand: '',
})
const a = mk('AI onboarding assistant for small businesses', 'Guides new hires through setup tasks automatically.', 'New hires take weeks to become productive.', 'Owners of 5–30 person businesses', 'Shared documents and ad-hoc mentoring')
const b = mk('Inventory management for local retailers', 'Simple stock tracking for single-location shops.', 'Retailers lose sales to stock-outs and overstock.', 'Independent shop owners', 'Spreadsheets and memory')
export const SAMPLE_PROJECTS: Project[] = [
  { id: 's1', form: a, status: 'Validating', updated: '2026-10-05', analysis: generateAnalysis(a), sample: true },
  { id: 's2', form: b, status: 'Evaluating', updated: '2026-10-12', sample: true },
]
