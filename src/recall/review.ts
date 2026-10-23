import { isRecord } from '../hooks/storage'

/**
 * Spaced repetition, Leitner style: each card sits in a box, and a box sets how many days pass before the card
 * comes back. Recalled without help: up a box. With a hint: same box. Forgotten: back to tomorrow.
 */
export const intervals = [0, 1, 3, 7, 14, 30, 60, 120]
const lastBox = intervals.length - 1

export interface ReviewState {
  box: number
  /** Local calendar day it's due, YYYY-MM-DD. */
  due: string
  reps: number
  lapses: number
  last?: string
}
export type ReviewStates = Record<string, ReviewState>
export type RecallOutcome = 'correct' | 'hinted' | 'incorrect'

/** Where an answer was given: a test, a review session, or a lesson's practice. */
export type RecallSource = 'test' | 'review' | 'learn'
export interface RecallEntry {
  id: string
  at: string
  via: RecallSource
  /** The question type that asked it. */
  type: string
  outcome: RecallOutcome
  /** The Memory Anchor the learner had chosen when it was asked, if any. */
  anchor?: string
}

/** Today in local time, YYYY-MM-DD: a review due “tomorrow” comes back after midnight, not after 24 hours. */
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function addDays(day: string, days: number) {
  const [year, month, date] = day.split('-').map(Number)
  return dayKey(new Date(year, month - 1, date + days))
}
const isDay = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
const at = (box: number, today: string) => addDays(today, intervals[box])

/**
 * The next state after an answer. Answering before the card is due (an extra test, the same day's second look)
 * never moves it up, so cramming can't stretch the intervals; forgetting always brings it back tomorrow.
 */
export function schedule(state: ReviewState | undefined, outcome: RecallOutcome, today: string): ReviewState {
  const reps = (state?.reps ?? 0) + 1
  const lapses = (state?.lapses ?? 0) + (outcome === 'incorrect' ? 1 : 0)
  if (outcome === 'incorrect') return { box: 1, due: at(1, today), reps, lapses, last: today }
  if (!state) {
    const box = outcome === 'correct' ? 2 : 1
    return { box, due: at(box, today), reps, lapses, last: today }
  }
  if (state.due > today) return { ...state, reps, last: today }
  const box = outcome === 'correct' ? Math.min(state.box + 1, lastBox) : Math.max(state.box, 1)
  return { box, due: at(box, today), reps, lapses, last: today }
}

/** Met in a lesson: first review tomorrow. A card already scheduled keeps its place. */
export const introduce = (state: ReviewState | undefined, today: string): ReviewState => state ?? { box: 1, due: at(1, today), reps: 0, lapses: 0 }

/** Marked Difficult: due today, in an early box. Marked Known: a confirming check a week out if it was never scheduled. */
export function applyMark(state: ReviewState | undefined, status: 'difficult' | 'known', today: string): ReviewState {
  if (status === 'difficult') return { box: Math.min(state?.box ?? 0, 1), due: today, reps: state?.reps ?? 0, lapses: state?.lapses ?? 0, ...state?.last ? { last: state.last } : {} }
  return state ?? { box: 3, due: at(3, today), reps: 0, lapses: 0 }
}

/** Cards due today or earlier: the most overdue first, then the least known. */
export function dueIds(states: ReviewStates, today: string, known: (id: string) => boolean = () => true) {
  return Object.entries(states).filter(([id, state]) => known(id) && state.due <= today)
    .sort(([, a], [, b]) => a.due.localeCompare(b.due) || a.box - b.box).map(([id]) => id)
}

/** The next day anything is due after today, for “next review tomorrow”. */
export function nextDue(states: ReviewStates, today: string) {
  return Object.values(states).map(state => state.due).filter(day => day > today).sort()[0]
}

export function parseStates(value: unknown, known: (id: string) => boolean): ReviewStates {
  const states: ReviewStates = {}
  if (!isRecord(value)) return states
  for (const [id, raw] of Object.entries(value)) {
    if (!known(id) || !isRecord(raw) || !isDay(raw.due)) continue
    const box = Number.isInteger(raw.box) ? Math.max(0, Math.min(Number(raw.box), lastBox)) : 1
    const count = (field: unknown) => Number.isInteger(field) && Number(field) >= 0 ? Number(field) : 0
    states[id] = { box, due: raw.due, reps: count(raw.reps), lapses: count(raw.lapses), ...isDay(raw.last) ? { last: raw.last } : {} }
  }
  return states
}

const outcomes: RecallOutcome[] = ['correct', 'hinted', 'incorrect']
const sources: RecallSource[] = ['test', 'review', 'learn']
export function parseEntries(value: unknown, known: (id: string) => boolean): RecallEntry[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is RecallEntry => isRecord(entry) && typeof entry.id === 'string' && known(entry.id)
    && typeof entry.at === 'string' && !Number.isNaN(Date.parse(entry.at)) && sources.includes(entry.via as RecallSource)
    && typeof entry.type === 'string' && outcomes.includes(entry.outcome as RecallOutcome) && (entry.anchor === undefined || typeof entry.anchor === 'string'))
    .map(({ id, at, via, type, outcome, anchor }) => ({ id, at, via, type, outcome, ...anchor !== undefined ? { anchor } : {} }))
}

export interface AnchorEvidence { asked: number; correct: number; hinted: number; incorrect: number }
/** How each of a card's anchors did when the card was asked: the evidence that an anchor helps recall. */
export function anchorEvidence(entries: RecallEntry[], id: string) {
  const evidence: Record<string, AnchorEvidence> = {}
  for (const entry of entries) {
    if (entry.id !== id || !entry.anchor) continue
    const tally = evidence[entry.anchor] ??= { asked: 0, correct: 0, hinted: 0, incorrect: 0 }
    tally.asked++
    tally[entry.outcome]++
  }
  return evidence
}
