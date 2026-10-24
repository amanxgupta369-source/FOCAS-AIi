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
} from 'lucide-react'
import type { Project, Route, Status, ProjectStatus } from '../types'
import { Badge, Demo, Glass, Logo } from '../components/ui'
import { signOutUser } from '../lib/supabase'
import { getDailyDiscovery } from '../data/discoveryData'
import type { User } from '@supabase/supabase-js'

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
    route.page === 'project' || route.page === 'verdict' ? route.id : ''

  const nav = (r: Route) => {
    go(r)
    setOpen(false)
  }

  const side = (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <Logo />
        <button
          className="md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      <button className="btn-primary" onClick={() => nav({ page: 'new' })}>
        <Plus size={16} /> New project
      </button>

      <button
        className={`btn-ghost justify-start ${
          route.page === 'dashboard' ? 'ring-2 ring-dusk' : ''
        }`}
        onClick={() => nav({ page: 'dashboard' })}
      >
        <LayoutDashboard size={16} /> Home & Projects
      </button>

      <button
        className={`btn-ghost justify-start ${
          route.page === 'discover' ? 'ring-2 ring-dusk bg-white/20 font-semibold' : ''
        }`}
        onClick={() => nav({ page: 'discover' })}
      >
        <Compass size={16} className="text-dusk-deep" /> Discover Problems
      </button>

      <button
        className={`btn-ghost justify-start ${
          route.page === 'chat' ? 'ring-2 ring-dusk bg-white/20 font-semibold' : ''
        }`}
        onClick={() => nav({ page: 'chat' })}
      >
        <Sparkles size={16} className="text-dusk-deep" /> Think with FOCAS
      </button>

      <label className="relative">
        <span className="sr-only">Search projects</span>
        <Search size={14} className="absolute left-3 top-3.5 text-dusk-mute" />
        <input
          className="input pl-9 text-xs"
          placeholder="Search projects..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        {q && (
          <button
            onClick={() => setQ('')}
            className="absolute right-3 top-3 text-dusk-mute hover:text-dusk-ink"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </label>

      <div className="flex items-center justify-between px-1 text-xs text-dusk-mute font-medium">
        <span>Saved Projects</span>
        <span>{projects.length}</span>
      </div>

      <ul className="flex-1 space-y-1.5 overflow-y-auto pr-0.5">
        {list.length === 0 && (
          <li className="p-3 text-xs text-dusk-mute rounded-xl bg-white/5 border border-white/10 text-center">
            {q ? `No project matches "${q}"` : 'No projects saved yet.'}
          </li>
        )}
        {list.map(p => {
          const verdict = p.analysis?.overallVerdict?.decision
          return (
            <li key={p.id}>
              <button
                onClick={() => nav({ page: 'project', id: p.id })}
                className={`w-full rounded-xl p-3 text-left text-sm transition hover:bg-white/20 ${
                  activeId === p.id
                    ? 'bg-white/25 shadow-sm border border-white/20'
                    : 'bg-white/10 border border-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="block truncate font-medium">{p.form.name || 'Untitled Project'}</span>
                  {verdict && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
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
                <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-dusk-mute">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/20 text-dusk-ink">
                    {p.status}
                  </span>
                  <span className="text-[11px]">
                    {new Date(p.updated).toLocaleDateString()}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="border-t border-white/15 pt-2.5">
        {user ? (
          <div className="rounded-2xl bg-white/20 border border-white/25 p-2.5 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Cloud size={14} className="text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-dusk-ink truncate leading-tight">
                  {user.email || 'Founder Account'}
                </p>
                <p className="text-[9px] text-emerald-800 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                  <span>Cloud Active</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                onClick={onOpenAuth}
                className="flex-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold bg-white/60 hover:bg-white text-dusk-ink transition text-center border border-white/30 shadow-xs"
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
                className="py-1.5 px-2 rounded-lg text-[10px] font-semibold text-rose-700 hover:bg-rose-50 transition flex items-center gap-1 border border-rose-200/50"
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
              className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 px-3 text-xs font-semibold text-white bg-dusk-ink hover:bg-dusk-deep shadow-md transition"
            >
              <LogIn size={15} />
              <span>Sign In / Create Account</span>
            </button>
            <div className="flex items-center justify-between px-1 text-[10px] text-dusk-mute">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/80"></span>
                <span>Guest Mode (Local)</span>
              </div>
              <span className="text-[9px] text-dusk-mute/80" title="Saved locally on this browser">This browser only</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen gap-4 p-3 md:p-4">
      <aside className="glass-solid sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 md:block lg:w-72">
        {side}
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-dusk-ink/30 md:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="glass-solid h-full w-80 max-w-[85vw]"
            onClick={e => e.stopPropagation()}
          >
            {side}
          </aside>
        </div>
      )}
      <main className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-3 md:hidden">
          <button
            className="btn-ghost"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} /> Menu
          </button>
          {user ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenAuth}
                className="btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-2.5"
              >
                <Cloud size={14} className="text-emerald-700" />
                <span className="max-w-[100px] truncate">{user.email || 'Account'}</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOutUser()
                  } catch (e) {
                    console.error('Sign out error:', e)
                  }
                }}
                className="rounded-lg p-1.5 text-rose-700 hover:bg-rose-50 transition border border-rose-200/40"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-xl bg-dusk-ink text-white px-3 py-1.5 text-xs font-semibold hover:bg-dusk-deep transition shadow-sm"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
        {children}
      </main>
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
  const dailyDiscovery = getDailyDiscovery()

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
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 text-dusk-mute border border-white/10 font-medium">
          Not evaluated yet
        </span>
      )
    }

    switch (verdict) {
      case 'BUILD':
        return (
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold inline-flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-700" /> BUILD
          </span>
        )
      case 'VALIDATE FIRST':
        return (
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-bold inline-flex items-center gap-1">
            <Lightbulb size={13} className="text-blue-700" /> VALIDATE FIRST
          </span>
        )
      case 'RETHINK':
        return (
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold inline-flex items-center gap-1">
            <AlertTriangle size={13} className="text-amber-700" /> RETHINK
          </span>
        )
      case "DON'T PURSUE THIS VERSION":
      default:
        return (
          <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-bold inline-flex items-center gap-1">
            <XCircle size={13} className="text-rose-700" /> DON'T PURSUE
          </span>
        )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Building':
        return 'bg-emerald-500/20 text-emerald-950 border-emerald-500/30'
      case 'Validating':
      case 'Complete':
        return 'bg-blue-500/20 text-blue-950 border-blue-500/30'
      case 'Evaluating':
      case 'Draft':
      case 'Analyzing':
        return 'bg-amber-500/20 text-amber-950 border-amber-500/30'
      case 'Paused':
      default:
        return 'bg-gray-500/20 text-gray-950 border-gray-500/30'
    }
  }

  return (
    <div className="rise space-y-6 pb-12">
      {/* Storage Alert if any */}
      {storageError && (
        <Glass className="p-4 bg-rose-50/30 border border-rose-300 text-rose-900 flex items-center gap-3">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <p className="text-xs">{storageError}</p>
        </Glass>
      )}

      {/* Hero Welcome & Quick Idea Evaluator */}
      <Glass className="p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold">Welcome back, founder.</h1>
        <p className="mt-2 max-w-2xl text-sm sm:text-base text-dusk-mute leading-relaxed">
          FOCAS is your AI startup advisor. We challenge weak assumptions, test whether customers will
          actually pay, and help you decide what to do before spending money building.
        </p>

        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={e => {
            e.preventDefault()
            go({ page: 'new', seed: idea })
          }}
        >
          <label className="flex-1">
            <span className="sr-only">Describe your startup idea</span>
            <input
              className="input h-12 text-sm sm:text-base"
              placeholder="e.g. A tool that helps independent coffee shops cut daily milk waste"
              value={idea}
              onChange={e => setIdea(e.target.value)}
            />
          </label>
          <button className="btn-primary h-12 px-6 shrink-0" type="submit">
            Evaluate new idea
          </button>
        </form>
      </Glass>

      {/* Daily Discovery Banner */}
      <div className="rounded-3xl bg-white/20 border border-white/30 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-dusk-deep text-white uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} /> Daily Discovery
            </span>
            <span className="text-xs font-semibold text-dusk-deep uppercase tracking-wide">
              {dailyDiscovery.category}
            </span>
            <span className="chip text-[10px] bg-amber-500/15 text-amber-900 border border-amber-500/30 font-medium">
              Hypothesis
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-dusk-ink">
            {dailyDiscovery.title}
          </h3>
          <p className="text-xs text-dusk-mute line-clamp-2 leading-relaxed">
            {dailyDiscovery.tagline}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={() => go({ page: 'discover', selectedId: dailyDiscovery.id })}
            className="btn-primary text-xs flex items-center justify-center gap-1.5 px-4 py-2.5 flex-1 md:flex-initial shadow-xs"
          >
            <Compass size={14} />
            <span>Explore Opportunities & Idea Lab</span>
          </button>
        </div>
      </div>

      {/* Projects Management Section */}
      <Glass className="p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="text-dusk-deep shrink-0" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-dusk-ink">Projects</h2>
              <p className="text-xs text-dusk-mute">
                Revisit, manage, and track your previous startup idea evaluations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => go({ page: 'new' })}
              className="btn-primary text-xs flex items-center gap-1.5 px-3.5 py-2"
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
            <Search size={15} className="absolute left-3 top-3.5 text-dusk-mute" />
            <input
              type="text"
              placeholder="Search projects by name or problem..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pl-9 pr-8 text-xs sm:text-sm h-10 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-dusk-mute hover:text-dusk-ink"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-dusk-mute font-medium mr-1 flex items-center gap-1">
              <Filter size={12} /> Status:
            </span>
            {(['All', ...STATUS_OPTIONS] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                  statusFilter === st
                    ? 'bg-dusk-deep text-white shadow-sm'
                    : 'bg-white/10 text-dusk-mute hover:bg-white/20 hover:text-dusk-ink'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 text-xs text-dusk-mute">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white/15 border border-white/20 text-dusk-ink text-xs rounded-lg px-2.5 py-1.5 font-medium cursor-pointer"
            >
              <option value="updated">Recently updated</option>
              <option value="name">Project name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <FolderKanban className="mx-auto text-dusk-mute/60" size={36} />
            <h3 className="font-semibold text-dusk-ink text-base">
              {searchQuery || statusFilter !== 'All'
                ? 'No matching projects found'
                : 'No startup projects saved yet'}
            </h3>
            <p className="text-xs text-dusk-mute max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'All'
                ? `No projects matched your search "${searchQuery}". Try adjusting your filters or search terms.`
                : 'Start by evaluating your first idea. Your answers, research reports, and chat history will be saved here automatically.'}
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

              return (
                <div
                  key={p.id}
                  className="rounded-2xl p-5 bg-white/10 border border-white/15 flex flex-col justify-between hover:bg-white/15 transition shadow-sm space-y-4"
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
                            className="input text-xs h-8 flex-1"
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
                            className="p-1.5 rounded-lg bg-white/20 text-dusk-mute hover:text-dusk-ink"
                            title="Cancel"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-semibold text-base text-dusk-ink truncate flex-1">
                          {p.form.name || 'Untitled Idea'}
                        </h3>
                      )}

                      {renamingId !== p.id && (
                        <button
                          onClick={() => handleStartRename(p)}
                          className="p-1 rounded-md text-dusk-mute hover:text-dusk-ink hover:bg-white/20 transition"
                          title="Rename project"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-dusk-mute line-clamp-2 leading-relaxed">
                      {description}
                    </p>

                    {/* Status & Latest Verdict */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-dusk-mute">Status:</span>
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
                        <span className="text-dusk-mute">Verdict:</span>
                        <div>{verdictBadge}</div>
                      </div>

                      {p.analysis && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-dusk-mute">Evaluation:</span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              p.evaluationType === 'basic' || p.analysis.evaluationType === 'basic'
                                ? 'bg-amber-500/20 text-amber-950 border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-950 border-emerald-500/30'
                            }`}
                          >
                            {p.evaluationType === 'basic' || p.analysis.evaluationType === 'basic'
                              ? 'Basic Evaluation'
                              : 'AI Evaluation'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata and Actions */}
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px] text-dusk-mute">
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
                          className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-dusk-ink font-medium"
                          title="Previous evaluation versions"
                        >
                          v{p.history.length + 1}
                        </span>
                      )}
                    </div>

                    {/* Delete Confirmation Alert Banner */}
                    {confirmDeleteId === p.id ? (
                      <div className="p-2.5 rounded-xl bg-rose-50/40 border border-rose-300 text-xs text-rose-950 space-y-2">
                        <p className="font-semibold text-rose-900">
                          Delete "{p.form.name}"?
                        </p>
                        <p className="text-[11px] text-rose-800 leading-snug">
                          This will remove all saved reports, versions, and chat history.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="btn-ghost text-xs py-1 px-2.5 h-auto text-dusk-ink"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="btn-primary text-xs py-1 px-2.5 h-auto bg-rose-600 hover:bg-rose-700 text-white border-0"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => go({ page: 'project', id: p.id })}
                            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                          >
                            Open <ArrowRight size={13} />
                          </button>
                          {hasAnalysis && (
                            <button
                              onClick={() => go({ page: 'verdict', id: p.id })}
                              className="btn-ghost text-xs py-1.5 px-2.5 flex items-center gap-1"
                              title="Go directly to Overall Verdict"
                            >
                              <Compass size={13} /> Verdict
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="p-1.5 rounded-lg text-dusk-mute hover:text-rose-700 hover:bg-rose-50/20 transition"
                          title="Delete project"
                          aria-label={`Delete ${p.form.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Glass>
    </div>
  )
}
