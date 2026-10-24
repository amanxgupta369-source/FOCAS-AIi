/**
 * FOCAS AI - Supabase Database & Authentication Client
 *
 * Implements:
 * 1. Safe, conditional initialization (app works 100% in local guest mode when Supabase is unconfigured).
 * 2. Multi-tenant user auth (Email/Password & Magic Link).
 * 3. PostgreSQL persistence with verified responses and RLS enforcement.
 * 4. Automatic migration helper to sync guest/local projects into cloud account upon login.
 */

import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { Project, Status, EvaluationVersion, CustomerInterview, TrackedAssumption, ChatMessage } from '../types'

let rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}.supabase.co`
}
const supabaseUrl = rawUrl
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

// ============================================================================
// Auth Helpers
// ============================================================================

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return user
  } catch {
    return null
  }
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signInWithMagicLink(email: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  if (error) throw error
  return data
}

export async function resetPasswordForEmail(email: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: window.location.origin,
  })
  if (error) throw error
  return data
}

export async function signOutUser() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ============================================================================
// Multi-Tenant Cloud Database Operations (Row-Level Security Protected)
// ============================================================================

export async function fetchProjectsFromCloud(userId: string): Promise<Project[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      status,
      form,
      analysis,
      model_used,
      evaluation_type,
      is_quota_exceeded,
      error,
      updated_at
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch projects from Supabase:', error.message)
    throw new Error(`Cloud database error: ${error.message}`)
  }

  // Also fetch customer interviews & assumptions if present
  const { data: interviewsData } = await supabase
    .from('customer_interviews')
    .select('*')
    .eq('user_id', userId)

  const { data: assumptionsData } = await supabase
    .from('tracked_assumptions')
    .select('*')
  const { data: historyData } = await supabase
    .from('evaluation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  const { data: chatData } = await supabase
    .from('project_chat')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  const interviewsByProject = new Map<string, CustomerInterview[]>()
  for (const item of (interviewsData || [])) {
    const list = interviewsByProject.get(item.project_id) || []
    list.push({
      id: item.id,
      date: item.interview_date,
      intervieweeRole: item.interviewee_role,
      problemConfirmed: item.problem_confirmed,
      frequency: item.frequency as any,
      wouldPay: item.would_pay,
      estimatedBudget: item.estimated_budget,
      currentWorkaround: item.current_workaround,
      keyQuotes: item.key_quotes,
      notes: item.notes,
    })
    interviewsByProject.set(item.project_id, list)
  }

  const assumptionsByProject = new Map<string, TrackedAssumption[]>()
  for (const item of (assumptionsData || [])) {
    const list = assumptionsByProject.get(item.project_id) || []
    list.push({
      id: item.id,
      assumption: item.assumption,
      category: item.category as any,
      state: item.state as any,
      evidenceNotes: item.evidence_notes,
      lastUpdated: item.updated_at,
    })
    assumptionsByProject.set(item.project_id, list)
  }

  const historyByProject = new Map<string, EvaluationVersion[]>()
  for (const item of (historyData || [])) {
    const list = historyByProject.get(item.project_id) || []
    list.push({
      id: item.id,
      timestamp: item.created_at,
      form: item.form,
      analysis: item.analysis,
      modelUsed: item.model_used || undefined,
    })
    historyByProject.set(item.project_id, list)
  }

  const chatByProject = new Map<string, any[]>()
  for (const item of (chatData || [])) {
    const list = chatByProject.get(item.project_id) || []
    list.push({
      role: item.role,
      text: item.content,
      timestamp: item.created_at,
    })
    chatByProject.set(item.project_id, list)
  }

  return (data || []).map(row => ({
    id: row.id,
    form: {
      ...row.form,
      name: row.name || row.form?.name || 'Untitled Project',
      description: row.description || row.form?.description || '',
    },
    status: (row.status as Status) || 'Evaluating',
    updated: row.updated_at,
    analysis: row.analysis || undefined,
    modelUsed: row.model_used || undefined,
    evaluationType: row.evaluation_type || undefined,
    isQuotaExceeded: row.is_quota_exceeded || false,
    error: row.error || undefined,
    interviews: interviewsByProject.get(row.id) || [],
    trackedAssumptions: assumptionsByProject.get(row.id) || [],
    history: historyByProject.get(row.id) || [],
    chatHistory: chatByProject.get(row.id) || [],
  }))
}

export async function upsertProjectToCloud(project: Project, userId: string): Promise<void> {
  if (!supabase) return

  const payload = {
    id: project.id,
    user_id: userId,
    name: project.form.name || 'Untitled Project',
    description: project.form.description || '',
    status: project.status,
    form: project.form,
    analysis: project.analysis || null,
    model_used: project.modelUsed || null,
    evaluation_type: project.evaluationType || 'ai',
    is_quota_exceeded: project.isQuotaExceeded || false,
    error: project.error || null,
    updated_at: new Date().toISOString(),
  }

  // Enforce server verification: do NOT claim success unless DB confirms
  const { error } = await supabase
    .from('projects')
    .upsert(payload, { onConflict: 'id' })

  if (error) {
    console.error('Database write error in upsertProjectToCloud:', error)
    throw new Error(`Failed to save project to cloud database: ${error.message}`)
  }

  // Persist interviews if any
  if (project.interviews && project.interviews.length > 0) {
    const interviewRows = project.interviews.map(i => ({
      id: i.id,
      project_id: project.id,
      user_id: userId,
      interviewee_role: i.intervieweeRole,
      interview_date: i.date,
      problem_confirmed: i.problemConfirmed,
      frequency: i.frequency,
      would_pay: i.wouldPay,
      estimated_budget: i.estimatedBudget || '',
      current_workaround: i.currentWorkaround || '',
      key_quotes: i.keyQuotes || '',
      notes: i.notes || '',
      updated_at: new Date().toISOString(),
    }))

    const { error: intErr } = await supabase
      .from('customer_interviews')
      .upsert(interviewRows, { onConflict: 'id' })

    if (intErr) {
      console.warn('Failed to sync customer interviews:', intErr.message)
    }
  }

  // Persist assumptions if any
  if (project.trackedAssumptions && project.trackedAssumptions.length > 0) {
    const assumptionRows = project.trackedAssumptions.map(a => ({
      id: a.id,
      project_id: project.id,
      user_id: userId,
      assumption: a.assumption,
      category: a.category,
      state: a.state,
      evidence_notes: a.evidenceNotes || '',
      updated_at: new Date().toISOString(),
    }))

    const { error: assErr } = await supabase
      .from('tracked_assumptions')
      .upsert(assumptionRows, { onConflict: 'id' })

    if (assErr) {
      console.warn('Failed to sync tracked assumptions:', assErr.message)
    }
  }

  // Persist evaluation history versions if any
  if (project.history && project.history.length > 0) {
    const historyRows = project.history.map(h => ({
      id: h.id,
      project_id: project.id,
      user_id: userId,
      form: h.form,
      analysis: h.analysis,
      model_used: h.modelUsed || null,
      created_at: h.timestamp || new Date().toISOString(),
    }))

    const { error: histErr } = await supabase
      .from('evaluation_history')
      .upsert(historyRows, { onConflict: 'id' })

    if (histErr) {
      console.warn('Failed to sync evaluation history:', histErr.message)
    }
  }
}

export async function syncChatHistoryToCloud(
  projectId: string,
  chatHistory: ChatMessage[],
  userId: string
): Promise<void> {
  if (!supabase || chatHistory.length === 0) return

  const chatRows = chatHistory.map(c => ({
    project_id: projectId,
    user_id: userId,
    role: c.role,
    content: c.text,
    created_at: c.timestamp || new Date().toISOString(),
  }))

  const { error } = await supabase.from('project_chat').insert(chatRows)
  if (error) {
    console.warn('Failed to persist chat message to cloud:', error.message)
  }
}

export async function deleteProjectFromCloud(projectId: string, userId: string): Promise<void> {
  if (!supabase) return

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete project from cloud database: ${error.message}`)
  }
}

export async function renameProjectInCloud(projectId: string, newName: string, userId: string): Promise<void> {
  if (!supabase) return

  const { error } = await supabase
    .from('projects')
    .update({ name: newName, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to rename project in cloud: ${error.message}`)
  }
}

export async function updateProjectStatusInCloud(projectId: string, status: Status, userId: string): Promise<void> {
  if (!supabase) return

  const { error } = await supabase
    .from('projects')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to update project status in cloud: ${error.message}`)
  }
}

export async function saveEvaluationHistoryToCloud(
  projectId: string,
  version: EvaluationVersion,
  userId: string
): Promise<void> {
  if (!supabase) return

  const { error } = await supabase.from('evaluation_history').insert({
    id: version.id,
    project_id: projectId,
    user_id: userId,
    form: version.form,
    analysis: version.analysis,
    model_used: version.modelUsed || null,
    created_at: version.timestamp || new Date().toISOString(),
  })

  if (error) {
    console.warn('Failed to record evaluation history in cloud:', error.message)
  }
}

/**
 * Migration helper: Imports projects created during offline/guest mode into the user's Supabase account.
 */
export async function syncLocalProjectsToCloud(localProjects: Project[], userId: string): Promise<number> {
  if (!supabase || localProjects.length === 0) return 0

  let synced = 0
  for (const project of localProjects) {
    // Skip sample projects
    if (project.sample) continue
    try {
      await upsertProjectToCloud(project, userId)
      synced++
    } catch (err) {
      console.warn(`Failed to sync project ${project.id}:`, err)
    }
  }
  return synced
}
