import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/**
 * Skate session hours. The owner edits them at /admin; they are stored in the
 * `site_settings` row with key "hours". DEFAULT_HOURS is what the site shows until that
 * row has loaded, or if it cannot be reached.
 */

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
export type Day = (typeof DAYS)[number]

export type Session = {
  id: string
  day: Day
  name: string
  /** 24 hour "HH:MM" */
  start: string
  /** 24 hour "HH:MM" */
  end: string
  price: string
  details: string
}

export type Hours = {
  /** One line shown above the sessions, e.g. which dates the schedule covers. */
  season: string
  sessions: Session[]
  /** Free text lines for things that do not happen every week. */
  specials: string[]
}

export const DEFAULT_HOURS: Hours = {
  season: 'Effective September 9th through Memorial Day',
  sessions: [
    { id: 'wed-dollar', day: 'Wednesday', name: 'Dollar Night', start: '18:00', end: '20:00', price: '$1 admission', details: '$1 skate rental' },
    { id: 'wed-adult', day: 'Wednesday', name: 'Adult Night 18+', start: '20:00', end: '22:30', price: '$10 admission', details: '$2 skate rental' },
    { id: 'fri-family', day: 'Friday', name: 'Family Skate Night', start: '18:30', end: '21:00', price: '$45 family of 5', details: 'Includes skate rental, pizza & pitcher of pop. Single admission $10, skate rental $2.' },
    { id: 'sat-afternoon', day: 'Saturday', name: 'Afternoon Skate', start: '12:30', end: '15:00', price: '$8 admission', details: '$2 skate rental' },
    { id: 'sat-glow', day: 'Saturday', name: 'Roll & Glow with DJ Krazy K', start: '18:30', end: '21:00', price: '$10 admission', details: '$2 skate rental' },
    { id: 'sun-family', day: 'Sunday', name: 'Family Fun Day', start: '12:30', end: '15:00', price: '$35 family of 5', details: 'Includes skate rental, pizza & pitcher of pop. Or $8 single admission, $2 skate rental.' },
    { id: 'sun-adult', day: 'Sunday', name: 'Adult Night 18+', start: '20:00', end: '23:00', price: '$10 admission', details: '$2 skate rental' },
  ],
  specials: [
    'Last Monday of the month: Praise & Worship Skate, 6–8 PM. $5 admission, $2 skate rental.',
    'Watch for Teen Late Skates and Theme Nights.',
  ],
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function isTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_RE.test(value)
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export function sortSessions(sessions: Session[]): Session[] {
  return [...sessions].sort(
    (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start.localeCompare(b.start)
  )
}

/** Turns stored JSON into Hours, dropping anything malformed. Null when it is not hours at all. */
export function normalizeHours(raw: unknown): Hours | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  if (!Array.isArray(source.sessions)) return null

  const sessions: Session[] = []
  source.sessions.forEach((item, index) => {
    if (!item || typeof item !== 'object') return
    const s = item as Record<string, unknown>
    const day = DAYS.find((d) => d === s.day)
    if (!day || !isTime(s.start) || !isTime(s.end)) return
    sessions.push({
      id: text(s.id) || `session-${index}`,
      day,
      name: text(s.name),
      start: s.start,
      end: s.end,
      price: text(s.price),
      details: text(s.details),
    })
  })

  return {
    season: text(source.season),
    sessions: sortSessions(sessions),
    specials: Array.isArray(source.specials) ? source.specials.map(text).filter(Boolean) : [],
  }
}

/** "18:30" -> "6:30 PM", "18:00" -> "6 PM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`
}

export function formatRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

/** Card colour on the home page, picked from the session name. Decorative only. */
export function sessionVariant(name: string): '' | 'deal' | 'special' | 'glow' | 'popular' {
  if (/dollar|\$1\b/i.test(name)) return 'deal'
  if (/adult|\d{2}\+/i.test(name)) return 'special'
  if (/glow|\bdj\b/i.test(name)) return 'glow'
  if (/family/i.test(name)) return 'popular'
  return ''
}

/** The week at a glance: time ranges for each open day, and which days have no session. */
export function weekSummary(hours: Hours): { open: { day: Day; ranges: string[] }[]; closed: Day[] } {
  const open: { day: Day; ranges: string[] }[] = []
  const closed: Day[] = []
  DAYS.forEach((day) => {
    const sessions = hours.sessions.filter((s) => s.day === day)
    if (sessions.length === 0) {
      closed.push(day)
      return
    }
    open.push({
      day,
      ranges: sessions.map((s) => {
        const age = s.name.match(/\b\d{2}\+/)
        return `${formatRange(s.start, s.end)}${age ? ` (${age[0]})` : ''}`
      }),
    })
  })
  return { open, closed }
}

// ---------------------------------------------------------------- loading

const CACHE_KEY = 'bells-hours-v1'
let current: Hours | null = null
let request: Promise<void> | null = null
const listeners = new Set<(hours: Hours) => void>()

function readCache(): Hours | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    return raw ? normalizeHours(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

/** Keeps the LocalBusiness structured data in the page head in step with the hours. */
function syncStructuredData(hours: Hours) {
  document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
    try {
      const data = JSON.parse(el.textContent || '')
      if (data['@type'] !== 'LocalBusiness') return
      data.openingHoursSpecification = hours.sessions.map((s) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: s.day,
        opens: s.start,
        closes: s.end,
      }))
      el.textContent = JSON.stringify(data)
    } catch {
      // not ours to touch
    }
  })
}

/** Makes these the hours every mounted page shows. Called after a load and after an admin save. */
export function publishHours(hours: Hours) {
  current = hours
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(hours))
  } catch {
    // private browsing or storage full: the next visit simply loads them again
  }
  syncStructuredData(hours)
  listeners.forEach((listener) => listener(hours))
}

/** Reads the stored hours. Null when they cannot be read or are malformed. */
export async function fetchHours(): Promise<Hours | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'hours')
    .maybeSingle()
  if (error || !data) return null
  return normalizeHours(data.value)
}

function ensureLoaded() {
  if (request) return
  request = fetchHours()
    .then((hours) => {
      if (hours) publishHours(hours)
    })
    .catch(() => {
      // offline or blocked: the defaults (or the last visit's hours) stay on screen
    })
}

/** The current hours: the last known ones straight away, then the stored ones once loaded. */
export function useHours(): Hours {
  const [hours, setHours] = useState<Hours>(() => current ?? readCache() ?? DEFAULT_HOURS)

  useEffect(() => {
    listeners.add(setHours)
    if (current) setHours(current)
    ensureLoaded()
    return () => {
      listeners.delete(setHours)
    }
  }, [])

  return hours
}
