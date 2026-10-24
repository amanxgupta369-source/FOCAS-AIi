import { useState } from 'react'
import type { IdeaForm, Project, Stage } from '../types'
import { Field, Glass } from '../components/ui'

type K = keyof IdeaForm
interface F { k: K; label: string; ph: string; area?: boolean; max?: number }
const STEPS: { title: string; fields: F[] }[] = [
  { title: 'Idea overview', fields: [
    { k: 'name', label: 'Startup idea name', ph: 'e.g. CaféCycle', max: 80 },
    { k: 'description', label: 'Short description', ph: 'One or two sentences on what it is', area: true, max: 300 },
    { k: 'problem', label: 'Problem being solved', ph: 'What goes wrong today?', area: true, max: 400 },
    { k: 'solution', label: 'Proposed solution', ph: 'How would you solve it?', area: true, max: 400 }] },
  { title: 'Target customer', fields: [
    { k: 'customer', label: 'Target customer', ph: 'e.g. Owners of independent cafés' },
    { k: 'segment', label: 'Customer segment', ph: 'e.g. 1–3 location cafés' },
    { k: 'market', label: 'Geography or target market', ph: 'e.g. Urban UK' },
    { k: 'frequency', label: 'How often does this problem occur?', ph: 'e.g. Daily, weekly, monthly…' },
    { k: 'current', label: 'How customers solve this today', ph: 'Not sure yet? Leave it blank.', area: true, max: 400 }] },
  { title: 'Business context', fields: [
    { k: 'model', label: 'Business model (if known)', ph: 'e.g. Monthly subscription' },
    { k: 'costs', label: 'Estimated costs & constraints (if known)', ph: 'e.g. Max $500 initial budget, 1 developer, regulatory limits…', area: true },
    { k: 'competitors', label: 'Existing competitors (if known)', ph: 'Names or "none that I know of"', area: true },
    { k: 'demand', label: 'Evidence of customer demand', ph: 'Interviews, waitlist, requests… or leave blank', area: true },
    { k: 'priorExperiments', label: 'Experiments already attempted & results (if any)', ph: 'e.g. Landing page with 15 signups, 3 café owner chats…', area: true }] },
]
const STAGES: Stage[] = ['Idea', 'Research', 'Prototype', 'Launched']
export const EMPTY: IdeaForm = { name: '', description: '', problem: '', solution: '', customer: '', segment: '', market: '', current: '', model: '', stage: 'Idea', competitors: '', demand: '', frequency: '', costs: '', priorExperiments: '' }

export default function Wizard({ existing, seed, onSave, onCancel }: { existing?: Project; seed?: string; onSave: (f: IdeaForm, evaluate: boolean) => void; onCancel: () => void }) {
  const [step, setStep] = useState(0)
  const [f, setF] = useState<IdeaForm>(existing?.form ?? { ...EMPTY, description: seed ?? '' })
  const [err, setErr] = useState<Partial<Record<K, string>>>({})
  const validate = () => {
    const e: Partial<Record<K, string>> = {}
    if (!f.name.trim()) e.name = 'Give your idea a name.'
    if (f.description.trim().length < 10) e.description = 'Add at least a short sentence (10+ characters).'
    setErr(e); return Object.keys(e).length === 0
  }
  const next = () => { if (step > 0 || validate()) setStep(s => s + 1) }
  const set = (k: K, v: string) => setF(p => ({ ...p, [k]: v }))
  const labels = ['Overview', 'Customer', 'Context', 'Review']
  return (
    <div className="rise mx-auto max-w-2xl">
      <Glass className="p-6 sm:p-8">
        <ol className="mb-6 flex gap-2" aria-label="Progress">{labels.map((l, i) => <li key={l} aria-current={i === step ? 'step' : undefined} className={`flex-1 rounded-full py-1 text-center text-xs font-medium ${i <= step ? 'bg-dusk-deep text-white' : 'bg-white/15 text-dusk-mute'}`}>{l}</li>)}</ol>
        <h1 className="mb-1 text-2xl font-semibold">{step < 3 ? STEPS[step].title : 'Review your idea'}</h1>
        <p className="mb-5 text-sm text-dusk-mute">Only the name and description are required. FOCAS will ask about the rest later.</p>
        {step < 3 ? <div className="space-y-4">
          {STEPS[step].fields.map(x => <Field key={x.k} id={x.k} label={x.label} value={f[x.k] ?? ''} placeholder={x.ph} area={x.area} max={x.max} error={err[x.k]} onChange={v => set(x.k, v)} />)}
          {step === 2 && <fieldset><legend className="mb-1 text-sm font-medium">Current stage</legend><div className="flex flex-wrap gap-2">
            {STAGES.map(s => <button key={s} type="button" aria-pressed={f.stage === s} onClick={() => setF(p => ({ ...p, stage: s }))} className={`btn ${f.stage === s ? 'bg-dusk-deep text-white' : 'bg-white/15'}`}>{s}</button>)}</div></fieldset>}
        </div> : <dl className="space-y-2 text-sm">{(Object.keys(f) as K[]).map(k => <div key={k} className="rounded-xl bg-white/10 p-3"><dt className="text-xs uppercase text-dusk-mute">{k}</dt><dd>{f[k] || <em className="text-dusk-mute">Not provided yet</em>}</dd></div>)}</dl>}
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button className="btn-ghost" onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}>{step === 0 ? 'Cancel' : 'Back'}</button>
          <div className="flex flex-wrap gap-3">
            <button className="btn-ghost" onClick={() => validate() && onSave(f, false)}>Save draft</button>
            {step < 3 ? <button className="btn-primary" onClick={next}>Continue</button> : <button className="btn-primary" onClick={() => validate() && onSave(f, true)}>Evaluate idea</button>}
          </div>
        </div>
      </Glass>
    </div>
  )
}
