import { useSyncExternalStore } from 'react'
import { cardById } from '../data/cards'
import { applyMark, dayKey, dueIds, introduce, nextDue, parseEntries, parseStates, schedule, type RecallEntry, type ReviewStates } from '../recall/review'
import { isRecord, readStorage, writeStorage } from './storage'

export const reviewStorageKey = 'sori.review.v1'
export const recallLogKey = 'sori.recall.v1'
/** Enough for years of daily practice; the oldest answers go first. */
const maxEntries = 4000

interface ReviewStore { states: ReviewStates; entries: RecallEntry[]; saved: boolean }
const known = (id: string) => cardById.has(id)

function load(): ReviewStore {
  const states = readStorage('localStorage', reviewStorageKey)
  const log = readStorage('localStorage', recallLogKey)
  return { states: parseStates(isRecord(states) ? states.cards : undefined, known), entries: parseEntries(isRecord(log) ? log.entries : undefined, known), saved: true }
}

// One store for the whole app: the nav badge, Review, and anchor evidence all see an answer the moment it's graded.
let store: ReviewStore | undefined
const listeners = new Set<() => void>()
const snapshot = () => store ??= load()
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }

function commit(states: ReviewStates, entries: RecallEntry[]) {
  const kept = entries.slice(-maxEntries)
  const saved = writeStorage('localStorage', reviewStorageKey, { version: 1, cards: states })
    && writeStorage('localStorage', recallLogKey, { version: 1, entries: kept })
  store = { states, entries: kept, saved }
  listeners.forEach(listener => listener())
}

/** Graded answers, from a test, a review, or a lesson: logged with the anchor in use, and each card rescheduled. */
export function recordAnswers(entries: RecallEntry[]) {
  if (!entries.length) return
  const { states, entries: log } = snapshot()
  const next = { ...states }
  for (const entry of entries) if (known(entry.id)) next[entry.id] = schedule(next[entry.id], entry.outcome, dayKey(new Date(entry.at)))
  commit(next, [...log, ...entries.filter(entry => known(entry.id))])
}
/** Difficult brings cards back today; Known schedules a check a week out for cards never reviewed. */
export function markForReview(ids: string[], status: 'difficult' | 'known') {
  const { states, entries } = snapshot()
  const today = dayKey()
  const next = { ...states }
  for (const id of ids) if (known(id)) next[id] = applyMark(next[id], status, today)
  commit(next, entries)
}
/** Cards met in a lesson join Review, first due tomorrow. */
export function introduceCards(ids: string[]) {
  const { states, entries } = snapshot()
  const today = dayKey()
  const next = { ...states }
  for (const id of ids) if (known(id)) next[id] = introduce(next[id], today)
  commit(next, entries)
}

export function useReview() {
  const { states, entries, saved } = useSyncExternalStore(subscribe, snapshot)
  const today = dayKey()
  return { states, entries, saved, today, due: dueIds(states, today, known), next: nextDue(states, today) }
}
/** Only the recall log, for anchor evidence. */
export const useRecallLog = () => useSyncExternalStore(subscribe, snapshot).entries
