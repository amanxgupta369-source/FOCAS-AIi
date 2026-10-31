/**
 * Privacy-Conscious Product Analytics for FOCAS AI
 *
 * Never collects or transmits startup ideas, interview transcripts, customer names,
 * or raw notes. Only tracks anonymous validation activity events and funnel progression.
 */

export type AnalyticsEventType =
  | 'idea_evaluation_started'
  | 'idea_evaluation_completed'
  | 'validation_sprint_started'
  | 'next_action_clicked'
  | 'validation_task_completed'
  | 'customer_interview_logged'
  | 'evidence_added'
  | 'evaluation_recalculated'
  | 'score_change_viewed'
  | 'weekly_review_generated'
  | 'reminder_clicked'
  | 'project_returned'

export interface AnalyticsEvent {
  id: string
  event: AnalyticsEventType
  timestamp: string
  projectId?: string
  metadata?: {
    stepNumber?: number
    readinessScore?: number
    deltaPoints?: number
    interviewCount?: number
    taskType?: string
  }
}

const STORAGE_KEY_ANALYTICS = 'focas.analytics.events.v1'
const MAX_LOCAL_EVENTS = 200

export function trackEvent(
  event: AnalyticsEventType,
  projectId?: string,
  metadata?: AnalyticsEvent['metadata']
): void {
  try {
    const record: AnalyticsEvent = {
      id: crypto.randomUUID(),
      event,
      timestamp: new Date().toISOString(),
      projectId,
      metadata,
    }

    // Persist locally for private founder audit & session metrics
    const raw = localStorage.getItem(STORAGE_KEY_ANALYTICS)
    const list: AnalyticsEvent[] = raw ? JSON.parse(raw) : []
    list.unshift(record)
    if (list.length > MAX_LOCAL_EVENTS) {
      list.length = MAX_LOCAL_EVENTS
    }
    localStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(list))

    // Optional dispatch for browser developer visibility
    if (typeof window !== 'undefined' && (window as any).__FOCAS_ANALYTICS_DEBUG) {
      console.log(`[FOCAS Analytics] ${event}`, metadata)
    }
  } catch (err) {
    // Analytics failures must never interrupt user flow
  }
}

export function getAnalyticsEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANALYTICS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Checks if a project is actively validating within the last 7 days.
 * Definition: Completed a task, logged an interview/evidence, or recalculated within 7 days.
 */
export function isWeeklyActiveValidatingProject(projectId: string, daysThreshold = 7): boolean {
  try {
    const events = getAnalyticsEvents()
    const cutoff = Date.now() - daysThreshold * 24 * 60 * 60 * 1000
    return events.some(e => {
      if (e.projectId !== projectId) return false
      const eventTime = new Date(e.timestamp).getTime()
      if (eventTime < cutoff) return false
      return (
        e.event === 'validation_task_completed' ||
        e.event === 'customer_interview_logged' ||
        e.event === 'evidence_added' ||
        e.event === 'evaluation_recalculated'
      )
    })
  } catch {
    return false
  }
}
