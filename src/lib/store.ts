import { useEffect, useState, useCallback, useRef } from 'react'
import type { Project, Status, ChatMessage, CustomerInterview, TrackedAssumption } from '../types'
import { SAMPLE_PROJECTS } from '../data/sample'
import {
  isSupabaseConfigured,
  supabase,
  getCurrentUser,
  fetchProjectsFromCloud,
  upsertProjectToCloud,
  deleteProjectFromCloud,
  renameProjectInCloud,
  updateProjectStatusInCloud,
  syncLocalProjectsToCloud,
  syncChatHistoryToCloud,
} from './supabase'
import type { User } from '@supabase/supabase-js'

const STORAGE_KEY_V2 = 'focas.projects.v2'
const STORAGE_KEY_V1 = 'focas.projects.v1'
const STORAGE_KEY_GUEST_PREFS = 'focas.guest.preferences.v1'

export interface GuestPreferences {
  isGuest: boolean
  lastActive: string
  dismissedSyncNotice?: boolean
}

export function getGuestPreferences(): GuestPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUEST_PREFS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        return {
          isGuest: Boolean(parsed.isGuest),
          lastActive: typeof parsed.lastActive === 'string' ? parsed.lastActive : new Date().toISOString(),
          dismissedSyncNotice: Boolean(parsed.dismissedSyncNotice),
        }
      }
    }
  } catch (err) {
    console.warn('Failed to read guest preferences from localStorage:', err)
  }
  return {
    isGuest: true,
    lastActive: new Date().toISOString(),
    dismissedSyncNotice: false,
  }
}

export function saveGuestPreferences(patch: Partial<GuestPreferences>): void {
  try {
    const current = getGuestPreferences()
    const updated = {
      ...current,
      ...patch,
      lastActive: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY_GUEST_PREFS, JSON.stringify(updated))
  } catch (err) {
    console.warn('Failed to save guest preferences to localStorage:', err)
  }
}

function loadInitialProjects(): Project[] {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2)
    if (rawV2) {
      let parsed: any
      try {
        parsed = JSON.parse(rawV2)
      } catch (parseErr) {
        console.warn('Corrupted JSON detected in localStorage, falling back to samples:', parseErr)
        return sortProjects(SAMPLE_PROJECTS)
      }

      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate each item to guarantee no corrupted or malformed objects break the UI
        const validatedProjects: Project[] = parsed
          .filter(p => p && typeof p === 'object' && typeof p.id === 'string' && p.form && typeof p.form === 'object')
          .map(p => ({
            ...p,
            status: normalizeStatus(p.status),
            history: Array.isArray(p.history) ? p.history : [],
            chatHistory: Array.isArray(p.chatHistory) ? p.chatHistory : [],
            interviews: Array.isArray(p.interviews) ? p.interviews : [],
            trackedAssumptions: Array.isArray(p.trackedAssumptions) ? p.trackedAssumptions : [],
            sprint: p.sprint && typeof p.sprint === 'object' ? p.sprint : undefined,
            timeline: Array.isArray(p.timeline) ? p.timeline : [],
            reminderPreferences: p.reminderPreferences && typeof p.reminderPreferences === 'object' ? p.reminderPreferences : undefined,
            lastRecalculationDelta: p.lastRecalculationDelta && typeof p.lastRecalculationDelta === 'object' ? p.lastRecalculationDelta : undefined,
            updated: typeof p.updated === 'string' ? p.updated : new Date().toISOString(),
          }))

        if (validatedProjects.length > 0) {
          return sortProjects(validatedProjects)
        }
      }
    }

    // Attempt migration from v1
    const rawV1 = localStorage.getItem(STORAGE_KEY_V1)
    if (rawV1) {
      try {
        const parsedV1 = JSON.parse(rawV1)
        if (Array.isArray(parsedV1)) {
          const migrated: Project[] = parsedV1
            .filter(p => p && typeof p === 'object' && typeof p.id === 'string' && p.form && typeof p.form === 'object')
            .map(p => ({
              ...p,
              status: normalizeStatus(p.status),
              history: Array.isArray(p.history) ? p.history : [],
              chatHistory: Array.isArray(p.chatHistory) ? p.chatHistory : [],
              interviews: [],
              trackedAssumptions: [],
              updated: typeof p.updated === 'string' ? p.updated : new Date().toISOString(),
            }))
          try {
            localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated))
          } catch {
            // private mode or quota
          }
          return sortProjects(migrated)
        }
      } catch {
        // ignore corrupted v1
      }
    }

    return sortProjects(SAMPLE_PROJECTS)
  } catch (err) {
    console.warn('Failed to load projects from localStorage:', err)
    return sortProjects(SAMPLE_PROJECTS)
  }
}

function normalizeStatus(s?: string): Status {
  if (s === 'Evaluating' || s === 'Validating' || s === 'Building' || s === 'Paused') {
    return s
  }
  if (s === 'Complete') return 'Validating'
  return 'Evaluating'
}

function sortProjects(list: Project[]): Project[] {
  return [...list].sort((a, b) => {
    const timeA = new Date(a.updated || 0).getTime()
    const timeB = new Date(b.updated || 0).getTime()
    return timeB - timeA
  })
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(loadInitialProjects)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isCloudSyncing, setIsCloudSyncing] = useState(false)
  const activeUserRef = useRef<User | null>(null)

  // 1. Listen for Supabase Authentication State Changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    getCurrentUser().then(u => {
      setUser(u)
      activeUserRef.current = u
      if (u) {
        loadCloudProjects(u.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      activeUserRef.current = currentUser
      if (currentUser) {
        await loadCloudProjects(currentUser.id)
      } else {
        // Logged out -> revert to local storage
        setProjects(loadInitialProjects())
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loadCloudProjects = async (userId: string) => {
    setIsCloudSyncing(true)
    try {
      const cloudProjects = await fetchProjectsFromCloud(userId)
      if (cloudProjects.length > 0) {
        setProjects(sortProjects(cloudProjects))
      } else {
        // Brand new user: keep local projects or samples so they are not faced with a blank screen
        const local = loadInitialProjects()
        setProjects(local)
      }
      setStorageError(null)
    } catch (err: any) {
      console.warn('Could not load cloud projects, staying with local cache:', err.message)
      setStorageError('Could not sync with cloud database. Working in offline cache mode.')
    } finally {
      setIsCloudSyncing(false)
    }
  }

  // 2. Persist to localStorage whenever projects change (offline fallback & cache)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(projects))
      if (!user) setStorageError(null)
    } catch (err: any) {
      console.error('Failed to save projects to localStorage:', err)
      setStorageError('Storage quota exceeded or browser storage is disabled.')
    }
  }, [projects, user])

  // 3. Upsert with Verified Database Persistence
  const upsert = useCallback(async (p: Project) => {
    // Optimistic UI update
    setProjects(prev => {
      const exists = prev.some(x => x.id === p.id)
      const updatedList = exists ? prev.map(x => (x.id === p.id ? p : x)) : [p, ...prev]
      return sortProjects(updatedList)
    })

    // If user is authenticated, enforce cloud database confirmation
    const currentUser = activeUserRef.current
    if (currentUser && isSupabaseConfigured) {
      try {
        await upsertProjectToCloud(p, currentUser.id)
        setStorageError(null)
      } catch (err: any) {
        console.error('Cloud save failed:', err.message)
        setStorageError(`Failed to save to cloud database: ${err.message}. Local copy preserved.`)
      }
    }
  }, [])

  // 4. Rename
  const rename = useCallback(async (id: string, newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed) return

    setProjects(prev =>
      sortProjects(
        prev.map(p =>
          p.id === id
            ? {
                ...p,
                form: { ...p.form, name: trimmed },
                updated: new Date().toISOString(),
              }
            : p
        )
      )
    )

    const currentUser = activeUserRef.current
    if (currentUser && isSupabaseConfigured) {
      try {
        await renameProjectInCloud(id, trimmed, currentUser.id)
      } catch (err: any) {
        setStorageError(`Failed to update project name in cloud: ${err.message}`)
      }
    }
  }, [])

  // 5. Update Status
  const updateStatus = useCallback(async (id: string, status: Status) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status,
              updated: new Date().toISOString(),
            }
          : p
      )
    )

    const currentUser = activeUserRef.current
    if (currentUser && isSupabaseConfigured) {
      try {
        await updateProjectStatusInCloud(id, status, currentUser.id)
      } catch (err: any) {
        setStorageError(`Failed to update status in cloud: ${err.message}`)
      }
    }
  }, [])

  // 6. Save Chat History
  const saveChatHistory = useCallback(async (id: string, chatHistory: ChatMessage[]) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, chatHistory } : p))
    )

    const currentUser = activeUserRef.current
    if (currentUser && isSupabaseConfigured) {
      try {
        await syncChatHistoryToCloud(id, chatHistory, currentUser.id)
      } catch (err: any) {
        console.warn('Could not sync chat to cloud:', err.message)
      }
    }
  }, [])

  // 7. Delete with Verified Cloud Confirmation
  const remove = useCallback(async (id: string) => {
    setProjects(prev => prev.filter(x => x.id !== id))

    const currentUser = activeUserRef.current
    if (currentUser && isSupabaseConfigured) {
      try {
        await deleteProjectFromCloud(id, currentUser.id)
        setStorageError(null)
      } catch (err: any) {
        setStorageError(`Failed to delete project from cloud: ${err.message}`)
      }
    }
  }, [])

  // 8. Migration helper: Sync local guest projects into cloud account
  const syncGuestProjectsToCloud = useCallback(async () => {
    const currentUser = activeUserRef.current
    if (!currentUser || !isSupabaseConfigured) return 0

    setIsCloudSyncing(true)
    try {
      const local = loadInitialProjects()
      const count = await syncLocalProjectsToCloud(local, currentUser.id)
      await loadCloudProjects(currentUser.id)
      return count
    } catch (err: any) {
      setStorageError(`Migration failed: ${err.message}`)
      return 0
    } finally {
      setIsCloudSyncing(false)
    }
  }, [])

  return {
    projects,
    upsert,
    rename,
    updateStatus,
    saveChatHistory,
    remove,
    storageError,
    user,
    isCloud: Boolean(user && isSupabaseConfigured),
    isSupabaseConfigured,
    isCloudSyncing,
    syncGuestProjectsToCloud,
  }
}
