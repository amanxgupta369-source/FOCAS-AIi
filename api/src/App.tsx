import { useState, useRef } from 'react'
import type { IdeaForm, Project, Route, EvaluationProgress } from './types'
import { useProjects } from './lib/store'
import { runDeterministicEvaluation as runBoundedEvaluation, DEFAULT_MODEL } from './lib/reasoningEngine'
import Landing from './pages/Landing'
import Dashboard, { Shell } from './pages/Dashboard'
import Wizard, { EMPTY } from './pages/Wizard'
import AnalysisPage from './pages/Analysis'
import OverallVerdictPage from './pages/Verdict'
import AuthModal from './components/AuthModal'

export default function App() {
  const {
    projects,
    upsert,
    rename,
    updateStatus,
    remove,
    storageError,
    user,
    syncGuestProjectsToCloud,
  } = useProjects()

  const [route, go] = useState<Route>({ page: 'landing' })
  const [progress, setProgress] = useState<EvaluationProgress | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const cancelAnalysis = (projectId: string) => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setProgress(null)
    const target = projects.find(p => p.id === projectId)
    if (target) {
      upsert({
        ...target,
        status: target.analysis ? 'Validating' : 'Evaluating',
        error: 'Evaluation was cancelled by user.',
        updated: new Date().toISOString(),
      })
    }
  }

  const save = async (form: IdeaForm, evaluate: boolean, editId?: string) => {
    // Cancel any ongoing evaluation
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }

    const old = projects.find(p => p.id === editId)
    const id = old?.id ?? crypto.randomUUID()

    // Preserve previous evaluation version if this project was already evaluated
    const existingHistory = old?.history || []
    const updatedHistory = old?.analysis
      ? [
          ...existingHistory,
          {
            id: crypto.randomUUID(),
            timestamp: old.updated || new Date().toISOString(),
            form: old.form,
            analysis: old.analysis,
            modelUsed: old.modelUsed,
          },
        ]
      : existingHistory

    const existingChat = old?.chatHistory || []
    const existingInterviews = old?.interviews || []
    const existingAssumptions = old?.trackedAssumptions || []

    if (evaluate) {
      const controller = new AbortController()
      abortRef.current = controller
      setProgress(null)

      const analyzing: Project = {
        id,
        form,
        updated: new Date().toISOString(),
        sample: old?.sample,
        status: 'Evaluating',
        analysis: undefined,
        error: undefined,
        modelUsed: DEFAULT_MODEL,
        evaluationType: old?.evaluationType,
        interviews: existingInterviews,
        trackedAssumptions: existingAssumptions,
        history: updatedHistory,
        chatHistory: existingChat,
      }
      upsert(analyzing)
      go({ page: 'project', id })

      try {
        const { analysis, modelUsed, evaluationType, isQuotaExceeded } = await runBoundedEvaluation(
          form,
          undefined,
          p => setProgress(p),
          controller.signal,
          existingInterviews,
          existingAssumptions
        )

        upsert({
          ...analyzing,
          status: 'Validating',
          analysis,
          modelUsed,
          evaluationType,
          isQuotaExceeded,
          error: undefined,
          updated: new Date().toISOString(),
          history: updatedHistory,
          chatHistory: existingChat,
          interviews: existingInterviews,
          trackedAssumptions: existingAssumptions.length > 0
            ? existingAssumptions
            : (analysis.assumptionAnalysis || []).map(a => ({
                id: crypto.randomUUID(),
                assumption: a.assumption,
                category: 'Problem' as const,
                state: 'Untested' as const,
                evidenceNotes: '',
                lastUpdated: new Date().toISOString(),
              })),
        })
      } catch (err: any) {
        console.error('Evaluation failed:', err)
        const isCancelled =
          controller.signal.aborted || err?.message?.includes('cancelled')

        upsert({
          ...analyzing,
          status: old?.status || 'Evaluating',
          analysis: old?.analysis, // preserve previous report on failure
          history: old?.history,
          chatHistory: existingChat,
          interviews: existingInterviews,
          trackedAssumptions: existingAssumptions,
          error: isCancelled
            ? 'Evaluation was cancelled.'
            : err?.message ||
              'Could not complete AI evaluation. Switched to FOCAS Basic Evaluation.',
          updated: new Date().toISOString(),
        })
      } finally {
        setProgress(null)
        if (abortRef.current === controller) {
          abortRef.current = null
        }
      }
    } else {
      const p: Project = {
        id,
        form,
        updated: new Date().toISOString(),
        sample: old?.sample,
        status: old?.status ?? 'Evaluating',
        analysis: old?.analysis,
        history: old?.history,
        chatHistory: existingChat,
        interviews: existingInterviews,
        trackedAssumptions: existingAssumptions,
      }
      upsert(p)
      go({ page: 'project', id: p.id })
    }
  }

  if (route.page === 'landing') {
    return (
      <>
        <Landing
          user={user}
          onOpenAuth={() => setAuthOpen(true)}
          onStart={(seed, evaluateImmediately) => {
            if (evaluateImmediately && seed?.trim()) {
              const derivedName = seed.split('.')[0].slice(0, 40).trim() || 'New Idea'
              save(
                {
                  ...EMPTY,
                  name: derivedName,
                  description: seed.trim(),
                  problem: seed.trim(),
                },
                true
              )
            } else if (seed?.trim()) {
              go({ page: 'new', seed })
            } else {
              go({ page: 'dashboard' })
            }
          }}
        />
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          user={user}
          onSyncGuestProjects={syncGuestProjectsToCloud}
        />
      </>
    )
  }

  const current =
    route.page === 'project' || route.page === 'verdict'
      ? projects.find(p => p.id === route.id)
      : undefined
  const editing =
    route.page === 'new' ? projects.find(p => p.id === route.editId) : undefined

  return (
    <>
      <Shell
        projects={projects}
        route={route}
        go={go}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
      >
        {route.page === 'dashboard' && (
          <Dashboard
            projects={projects}
            go={go}
            onRename={rename}
            onUpdateStatus={updateStatus}
            onDelete={remove}
            storageError={storageError}
          />
        )}

        {route.page === 'new' && (
          <Wizard
            key={route.editId ?? route.seed ?? 'new'}
            existing={editing}
            seed={route.seed}
            onSave={(f, e) => save(f, e, route.editId)}
            onCancel={() => go({ page: 'dashboard' })}
          />
        )}

        {route.page === 'project' &&
          (current ? (
            <AnalysisPage
              project={current}
              progress={progress}
              onChange={upsert}
              onEdit={() => go({ page: 'new', editId: current.id })}
              onReevaluate={() => save(current.form, true, current.id)}
              onCancelAnalysis={() => cancelAnalysis(current.id)}
              onDelete={() => {
                if (
                  window.confirm(
                    `Are you sure you want to delete “${current.form.name}”? All saved evaluation reports, history, and chat will be deleted.`
                  )
                ) {
                  remove(current.id)
                  go({ page: 'dashboard' })
                }
              }}
              onViewVerdict={() => go({ page: 'verdict', id: current.id })}
            />
          ) : (
            <p className="glass p-6">Project not found.</p>
          ))}

        {route.page === 'verdict' &&
          (current ? (
            <OverallVerdictPage project={current} go={go} />
          ) : (
            <p className="glass p-6">Project not found.</p>
          ))}
      </Shell>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        user={user}
        onSyncGuestProjects={syncGuestProjectsToCloud}
      />
    </>
  )
}