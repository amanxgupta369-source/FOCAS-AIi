import { useState, type ReactNode } from 'react'
import {
  LayoutDashboard,
  Plus,
  Menu,
  Search,
  X,
  Settings,
  FolderKanban,
  Pencil,
  Trash2,
  Compass,
  Calendar,
  AlertCircle,
  Check,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  Cloud,
  Filter,
  LogIn,
  LogOut,
  Sparkles,
  Target,
  TrendingUp,
  FileText,
  Activity as ActivityIcon,
} from 'lucide-react'
import type { Project, Route, Status, ProjectStatus } from '../types'
import { Badge, Demo, Glass, Logo } from '../components/ui'
import { signOutUser } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import { isWeeklyActiveValidatingProject, getAnalyticsEvents } from '../lib/analytics'

const STATUS_OPTIONS: ProjectStatus[] = ['Evaluating', 'Validating', 'Building', 'Paused']

export function Shell({
  projects,
  route,
  go,
  user,
  onOpenAuth,
  children,
}: {
  projects: Project[]
  route: Route
  go: (r: Route) => void
  user?: User | null
  onOpenAuth?: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')

  const list = projects.filter(p =>
    (p.form.name || '').toLowerCase().includes(q.toLowerCase()) ||
    (p.form.description || '').toLowerCase().includes(q.toLowerCase())
  )

  const activeId =
    route.page === 'project' || route.page === 'verdict' ? route.id : projects[0]?.id

  const activeProject = projects.find(p => p.id === activeId)

  const nav = (r: Route) => {
    go(r)
    setOpen(false)
  }

  // Sidebar navigation for desktop / slide-over
  const side = (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <Logo />
        <button
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      <button className="btn-primary w-full shadow-sm" onClick={() => nav({ page: 'new' })}>
        <Plus size={16} /> Evaluate new idea
      </button>

      <div className="space-y-1">
        {activeId && (
          <button
            className={`btn-ghost w-full justify-start text-xs font-semibold ${
              route.page === 'project' && (!('view' in route) || route.view === 'today')
                ? 'btn-dark text-white shadow-sm'
                : 'text-[#1E293B] hover:bg-white/50'
            }`}
            onClick={() => nav({ page: 'project', id: activeId, view: 'today' })}
          >
            <Target size={15} className="text-[#5B7E98]" />
            <span className="truncate">Today: {activeProject?.form.name || 'Current Project'}</span>
          </button>
        )}

        <button
          className={`btn-ghost w-full justify-start text-xs font-semibold ${
            route.page === 'dashboard' || route.page === 'projects'
              ? 'btn-dark text-white shadow-sm'
              : 'text-[#1E293B] hover:bg-white/50'
          }`}
          onClick={() => nav({ page: 'dashboard' })}
        >
          <FolderKanban size={15} /> All Projects ({projects.length})
        </button>

        <button
          className={`btn-ghost w-full justify-start text-xs font-semibold ${
            route.page === 'activity'
              ? 'btn-dark text-white shadow-sm'
              : 'text-[#1E293B] hover:bg-white/50'
          }`}
          onClick={() => nav({ page: 'activity' })}
        >
          <TrendingUp size={15} /> Validation Activity
        </button>
      </div>

      <label className="relative mt-1">
        <span className="sr-only">Search projects</span>
        <Search size={14} className="absolute left-3 top-3 text-slate-400" />
        <input
          className="input pl-9 text-xs"
          placeholder="Search projects..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        {q && (
          <button
            onClick={() => setQ('')}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </label>

      <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <span>Saved Projects</span>
        <span>{projects.length}</span>
      </div>

      <ul className="flex-1 space-y-1.5 overflow-y-auto pr-0.5">
        {list.length === 0 && (
          <li className="p-3 text-xs text-slate-500 rounded-xl bg-white/30 border border-white/50 text-center">
            {q ? `No project matches "${q}"` : 'No projects saved yet.'}
          </li>
        )}
        {list.map(p => {
          const verdict = p.analysis?.overallVerdict?.decision
          const isSelected = activeId === p.id && route.page === 'project'
          return (
            <li key={p.id}>
              <button
                onClick={() => nav({ page: 'project', id: p.id, view: 'today' })}
                className={`w-full rounded-2xl p-3 text-left text-xs transition border ${
                  isSelected
                    ? 'btn-dark text-white border-white/20 shadow-sm'
                    : 'bg-white/40 text-slate-800 border-white/60 hover:bg-white/65'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`block font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {p.form.name || 'Untitled Project'}
                  </span>
                  {verdict && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        verdict === 'BUILD'
                          ? 'bg-emerald-100 text-emerald-900'
                          : verdict === 'VALIDATE FIRST'
                            ? 'bg-blue-100 text-blue-900'
                            : verdict === 'RETHINK'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {verdict === "DON'T PURSUE THIS VERSION" ? "DON'T" : verdict}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{p.status}</span>
                  <span className="font-mono font-bold text-slate-500">
                    {p.analysis ? `${p.analysis.score} pts` : 'Pending'}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {/* User / Auth footer */}
      <div className="border-t border-slate-200 pt-2.5">
        {user ? (
          <div className="rounded-2xl bg-white/40 border border-white/60 p-2.5 space-y-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Cloud size={14} className="text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-900 truncate leading-tight">
                  {user.email || 'Founder Account'}
                </p>
                <p className="text-[9px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                  <span>Cloud Sync Active</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                onClick={onOpenAuth}
                className="flex-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold bg-white/60 hover:bg-white/80 text-slate-800 border border-white/70 transition text-center shadow-xs"
              >
                Account
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOutUser()
                  } catch (e) {
                    console.error('Sign out failed:', e)
                  }
                }}
                className="py-1.5 px-2 rounded-lg text-[10px] font-semibold text-rose-700 hover:bg-rose-50 transition flex items-center gap-1 border border-rose-200"
                title="Sign Out"
              >
                <LogOut size={11} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              onClick={onOpenAuth}
              className="btn-dark flex items-center justify-center gap-2 w-full rounded-xl py-2 px-3 text-xs font-semibold text-white shadow-sm transition"
            >
              <LogIn size={14} />
              <span>Sign In / Cloud Sync</span>
            </button>
            <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
              <span>Local Guest Mode</span>
              <span className="text-[9px]">Saved in browser</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen gap-4 p-2 sm:p-4 text-[#1E293B] max-w-[100vw] overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="glass-solid sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 md:block lg:w-72 rounded-3xl">
        {side}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-[#1E293B]/50 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <aside
            className="glass-solid h-full w-80 max-w-[85vw] shadow-2xl p-0 rounded-r-3xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {side}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 pb-28 md:pb-8">
        {/* Mobile Top Header (Clean, compact, no horizontal overflow) */}
        <div className="flex items-center justify-between mb-3 px-1 py-1 md:hidden border-b border-white/40 pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <button
              className="p-2.5 rounded-xl bg-white/40 border border-white/60 text-slate-700 hover:bg-white/70 min-w-[44px] min-h-[44px] flex items-center justify-center transition active:scale-95 shrink-0"
              onClick={() => setOpen(true)}
              aria-label="Open project menu"
            >
              <Menu size={20} />
            </button>
            <div className="truncate">
              <Logo />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {user ? (
              <button
                onClick={onOpenAuth}
                className="py-1.5 px-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-1.5 min-h-[44px] max-w-[130px] sm:max-w-[160px]"
              >
                <Cloud size={14} className="text-emerald-700 shrink-0" />
                <span className="truncate">{user.email?.split('@')[0]}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="py-2 px-3.5 rounded-xl btn-dark text-white text-xs font-semibold min-h-[44px] flex items-center justify-center shadow-xs"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (Centered Prominent CTA, thumb reachable, safe area aware) */}
      <nav className="mobile-bottom-nav md:hidden px-2 py-1" aria-label="Mobile Navigation">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Today Dashboard */}
          <button
            onClick={() => {
              if (activeId) {
                nav({ page: 'project', id: activeId, view: 'today' })
              } else if (projects[0]) {
                nav({ page: 'project', id: projects[0].id, view: 'today' })
              } else {
                nav({ page: 'new' })
              }
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl min-w-[56px] min-h-[48px] transition active:scale-95 ${
              route.page === 'project' && (!('view' in route) || route.view === 'today')
                ? 'text-[#536f91] font-bold bg-[#536f91]/15'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Target size={20} className={route.page === 'project' && (!('view' in route) || route.view === 'today') ? 'stroke-[2.5]' : ''} />
            <span className="text-[10px] mt-0.5 leading-none">Today</span>
          </button>

          {/* 2. Projects List */}
          <button
            onClick={() => nav({ page: 'dashboard' })}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl min-w-[56px] min-h-[48px] transition active:scale-95 ${
              route.page === 'dashboard' || route.page === 'projects'
                ? 'text-[#536f91] font-bold bg-[#536f91]/15'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <FolderKanban size={20} className={route.page === 'dashboard' ? 'stroke-[2.5]' : ''} />
            <span className="text-[10px] mt-0.5 leading-none">Projects</span>
          </button>

          {/* 3. Centered Prominent CTA: Evaluate */}
          <button
            onClick={() => nav({ page: 'new' })}
            className="flex flex-col items-center justify-center -mt-4 transition active:scale-95 group focus:outline-none"
            aria-label="Evaluate new idea"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 transition ${
              route.page === 'new'
                ? 'bg-[#3d5574] text-white border-white scale-105 shadow-xl'
                : 'bg-[#536f91] text-white border-white/80 group-hover:bg-[#3d5574]'
            }`}>
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <span className={`text-[10px] mt-1 font-bold ${
              route.page === 'new' ? 'text-[#536f91]' : 'text-slate-600'
            }`}>
              Evaluate
            </span>
          </button>

          {/* 4. Activity & Timeline */}
          <button
            onClick={() => nav({ page: 'activity' })}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl min-w-[56px] min-h-[48px] transition active:scale-95 ${
              route.page === 'activity'
                ? 'text-[#536f91] font-bold bg-[#536f91]/15'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <TrendingUp size={20} className={route.page === 'activity' ? 'stroke-[2.5]' : ''} />
            <span className="text-[10px] mt-0.5 leading-none">Activity</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export function ActivityView({
  projects,
  go,
}: {
  projects: Project[]
  go: (r: Route) => void
}) {
  const events = getAnalyticsEvents()
  const activeValidatingCount = projects.filter(p => isWeeklyActiveValidatingProject(p.id)).length

  return (
    <div className="rise space-y-5 max-w-4xl mx-auto px-2 sm:px-4 pb-12">
      <Glass className="p-5 sm:p-7 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/60 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                <ActivityIcon size={18} />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Validation Activity Feed</h1>
            </div>
            <p className="text-xs text-slate-500">
              Measure genuine validation progress: tasks, customer interviews, and recalculations.
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/40 border border-white/60 text-xs">
            <span className="text-slate-500 text-[11px] block">Weekly Active Validating Projects</span>
            <span className="text-base font-extrabold text-[#5B7E98] font-mono">
              {activeValidatingCount} of {projects.length}
            </span>
          </div>
        </div>

        {/* Aggregated recent timeline from all projects */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Project Milestones
          </h2>
          {projects.length === 0 ? (
            <p className="text-xs text-slate-500 p-4 text-center">No projects saved yet.</p>
          ) : (
            projects.flatMap(p => (p.timeline || []).map(t => ({ ...t, project: p }))).length === 0 ? (
              <p className="text-xs text-slate-500 p-4 text-center">No timeline activity logged yet.</p>
            ) : (
              projects
                .flatMap(p => (p.timeline || []).map(t => ({ ...t, project: p })))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 10)
                .map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white/40 border border-white/60 flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-slate-900">{item.project.form.name}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-blue-700">{item.title}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-white/40">
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => go({ page: 'project', id: item.project.id, view: 'today' })}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 min-h-[32px] flex items-center"
                      >
                        Open Workspace →
                      </button>
                    </div>
                  </div>
                ))
            )
          )}
        </div>
      </Glass>
    </div>
  )
}

export default function Dashboard({
  projects,
  go,
  onRename,
  onUpdateStatus,
  onDelete,
  storageError,
}: {
  projects: Project[]
  go: (r: Route) => void
  onRename?: (id: string, newName: string) => void
  onUpdateStatus?: (id: string, status: Status) => void
  onDelete?: (id: string) => void
  storageError?: string | null
}) {
  const [idea, setIdea] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | ProjectStatus>('All')
  const [sortBy, setSortBy] = useState<'updated' | 'name'>('updated')

  // Inline editing state for project renaming
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameText, setRenameText] = useState('')

  // Inline delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleStartRename = (project: Project) => {
    setRenamingId(project.id)
    setRenameText(project.form.name || '')
  }

  const handleSaveRename = (id: string) => {
    if (renameText.trim() && onRename) {
      onRename(id, renameText.trim())
    }
    setRenamingId(null)
  }

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id)
    }
    setConfirmDeleteId(null)
  }

  // Filter & sort projects
  const filteredProjects = projects
    .filter(p => {
      const name = (p.form.name || '').toLowerCase()
      const desc = (p.form.description || '').toLowerCase()
      const prob = (p.form.problem || '').toLowerCase()
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch = !query || name.includes(query) || desc.includes(query) || prob.includes(query)

      const matchesStatus =
        statusFilter === 'All' ||
        p.status === statusFilter ||
        (statusFilter === 'Validating' && p.status === 'Complete') ||
        (statusFilter === 'Evaluating' && p.status === 'Draft')

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return (a.form.name || '').localeCompare(b.form.name || '')
      }
      return new Date(b.updated || 0).getTime() - new Date(a.updated || 0).getTime()
    })

  const getVerdictBadge = (project: Project) => {
    const verdict = project.analysis?.overallVerdict?.decision
    if (!verdict) {
      return (
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/40 text-slate-700 border border-white/60 font-medium">
          Not evaluated yet
        </span>
      )
    }

    switch (verdict) {
      case 'BUILD':
        return (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold inline-flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-700" /> BUILD
          </span>
        )
      case 'VALIDATE FIRST':
        return (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-300 font-bold inline-flex items-center gap-1">
            <Lightbulb size={12} className="text-blue-700" /> VALIDATE FIRST
          </span>
        )
      case 'RETHINK':
        return (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-bold inline-flex items-center gap-1">
            <AlertTriangle size={12} className="text-amber-700" /> RETHINK
          </span>
        )
      case "DON'T PURSUE THIS VERSION":
      default:
        return (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-900 border border-rose-300 font-bold inline-flex items-center gap-1">
            <XCircle size={12} className="text-rose-700" /> DON'T PURSUE
          </span>
        )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Building':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200'
      case 'Validating':
      case 'Complete':
        return 'bg-blue-50 text-blue-900 border-blue-200'
      case 'Evaluating':
      case 'Draft':
      case 'Analyzing':
        return 'bg-amber-50 text-amber-900 border-amber-200'
      case 'Paused':
      default:
        return 'bg-white/40 text-[#1E293B] border-white/60'
    }
  }

  return (
    <div className="rise space-y-6 pb-12 max-w-5xl mx-auto px-2 sm:px-4">
      {/* Storage Alert if any */}
      {storageError && (
        <Glass className="p-4 bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <p className="text-xs">{storageError}</p>
        </Glass>
      )}

      {/* Hero Welcome & Quick Idea Evaluator */}
      <Glass className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 border border-white/70 text-slate-700 text-[11px] font-semibold mb-3">
          <Sparkles size={12} className="text-[#5B7E98]" />
          <span>Continuous Founder Validation Workspace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, founder.
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
          Evaluate ideas with first-principles logic, run structured discovery sprints, log customer evidence, and receive your next best action.
        </p>

        <form
          className="mt-5 flex flex-col gap-2.5 sm:flex-row"
          onSubmit={e => {
            e.preventDefault()
            go({ page: 'new', seed: idea })
          }}
        >
          <label className="flex-1">
            <span className="sr-only">Describe your startup idea</span>
            <input
              className="input h-12 text-sm rounded-xl"
              placeholder="e.g. A tool that helps independent coffee shops cut daily milk waste…"
              value={idea}
              onChange={e => setIdea(e.target.value)}
            />
          </label>
          <button className="btn-dark h-12 px-6 shrink-0 font-semibold rounded-xl" type="submit">
            Evaluate idea →
          </button>
        </form>
      </Glass>

      {/* Projects Management Section */}
      <Glass className="p-4 sm:p-6 md:p-7 space-y-5 rounded-2xl sm:rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="text-slate-800 shrink-0" size={24} />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Startup Projects</h2>
              <p className="text-xs text-slate-500">
                Track your active validation sprints, interviews, and evidence deltas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => go({ page: 'new' })}
              className="btn-primary text-xs flex items-center gap-1.5 px-3.5 py-2 font-semibold rounded-xl"
            >
              <Plus size={14} /> New project
            </button>
            <Demo />
          </div>
        </div>

        {/* Filters, Search & Sort Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects by name or problem..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pl-9 pr-9 text-xs sm:text-sm h-11 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-slate-700 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filters (Swipeable on phones, comfortable touch targets) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none touch-scroll py-1 -mx-1 px-1">
            <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1 shrink-0">
              <Filter size={12} /> Status:
            </span>
            {(['All', ...STATUS_OPTIONS] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition shrink-0 min-h-[36px] flex items-center justify-center active:scale-95 ${
                  statusFilter === st
                    ? 'btn-dark text-white shadow-xs'
                    : 'bg-white/40 text-slate-700 hover:bg-white/70 border border-white/50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white/50 border border-white/60 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium cursor-pointer min-h-[36px]"
            >
              <option value="updated">Recently updated</option>
              <option value="name">Project name (A–Z)</option>
            </select>
          </div>
        </div>
      </Glass>

      {/* Project Cards Grid - Direct on the atmospheric blue background */}
      {filteredProjects.length === 0 ? (
        <div className="p-8 text-center rounded-3xl glass space-y-3">
            <FolderKanban className="mx-auto text-slate-400" size={36} />
            <h3 className="font-bold text-slate-900 text-base">
              {searchQuery || statusFilter !== 'All'
                ? 'No matching projects found'
                : 'No startup projects saved yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'All'
                ? `No projects matched "${searchQuery}". Try clearing your filters.`
                : 'Start by evaluating your first idea. Your answers, discovery sprint, and interview log will be saved here.'}
            </p>
            {(searchQuery || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('All')
                }}
                className="btn-ghost text-xs mt-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(p => {
              const hasAnalysis = !!p.analysis
              const description =
                p.form.description ||
                p.form.problem ||
                'No description provided for this idea yet.'
              const verdictBadge = getVerdictBadge(p)
              const completedTasksCount = p.sprint?.tasks.filter(t => t.status === 'Completed').length ?? (p.analysis ? 1 : 0)
              const interviewCount = p.interviews?.length || 0

              return (
                <div
                  key={p.id}
                  className="glass rounded-3xl p-5 flex flex-col justify-between hover:border-sky-300/50 hover:shadow-glass-hover transition space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Header: Title or Rename input */}
                    <div className="flex items-start justify-between gap-2">
                      {renamingId === p.id ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={renameText}
                            onChange={e => setRenameText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveRename(p.id)
                              if (e.key === 'Escape') setRenamingId(null)
                            }}
                            className="input text-xs h-8 flex-1 bg-white/60 border-white/70"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(p.id)}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Save name"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={() => setRenamingId(null)}
                            className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-slate-700 border border-white/60"
                            title="Cancel"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-bold text-base text-slate-900 leading-snug break-words flex-1 line-clamp-2">
                          {p.form.name || 'Untitled Idea'}
                        </h3>
                      )}

                      {renamingId !== p.id && (
                        <button
                          onClick={() => handleStartRename(p)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-white/50 transition"
                          title="Rename project"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {description}
                    </p>

                    {/* Status & Latest Verdict */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Status:</span>
                        {onUpdateStatus ? (
                          <select
                            value={p.status}
                            onChange={e => onUpdateStatus(p.id, e.target.value as Status)}
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border cursor-pointer ${getStatusColor(
                              p.status
                            )}`}
                            title="Click to update project status"
                          >
                            <option value="Evaluating">Evaluating</option>
                            <option value="Validating">Validating</option>
                            <option value="Building">Building</option>
                            <option value="Paused">Paused</option>
                          </select>
                        ) : (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(
                              p.status
                            )}`}
                          >
                            {p.status}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Verdict:</span>
                        <div>{verdictBadge}</div>
                      </div>

                      {p.analysis && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Readiness Score:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {p.analysis.score} / 100
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Validation Sprint:</span>
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          Step {completedTasksCount} of 7
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Interviews:</span>
                        <span className="text-[11px] font-medium text-slate-700">
                          {interviewCount} logged
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata and Actions */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />{' '}
                        {new Date(p.updated).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {p.history && p.history.length > 0 && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 border border-white/50 text-slate-700 font-medium"
                          title="Previous evaluation versions"
                        >
                          v{p.history.length + 1}
                        </span>
                      )}
                    </div>

                    {/* Delete Confirmation Alert Banner */}
                    {confirmDeleteId === p.id ? (
                      <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-950 space-y-2">
                        <p className="font-bold text-rose-900">
                          Delete "{p.form.name}"?
                        </p>
                        <p className="text-[11px] text-rose-800 leading-snug">
                          This will remove all saved reports, versions, and interviews.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="btn-ghost text-xs py-1 px-2.5 h-auto text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="btn-primary text-xs py-1 px-2.5 h-auto bg-rose-600 hover:bg-rose-700 text-white border-0 font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                          <button
                            onClick={() => go({ page: 'project', id: p.id, view: 'today' })}
                            className="btn-primary text-xs py-2 px-3 flex items-center gap-1 font-bold rounded-xl shadow-xs min-h-[40px] flex-1 sm:flex-initial justify-center active:scale-98"
                          >
                            Open Today <ArrowRight size={13} />
                          </button>
                          {hasAnalysis && (
                            <button
                              onClick={() => go({ page: 'project', id: p.id, view: 'report' })}
                              className="btn-ghost text-xs py-2 px-2.5 flex items-center gap-1 font-semibold rounded-xl text-slate-700 min-h-[40px] justify-center active:scale-98"
                              title="Go directly to Detailed Report"
                            >
                              <FileText size={13} /> Report
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
                          title="Delete project"
                          aria-label={`Delete ${p.form.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
