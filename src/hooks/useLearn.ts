import { useSyncExternalStore } from 'react'
import { stepsOf, unitById } from '../data/units'
import { dayKey } from '../recall/review'
import { isRecord, readStorage, writeStorage } from './storage'

export const learnStorageKey = 'sori.learn.v1'
export interface UnitProgress { step: number; done?: string }
interface LearnState {
  /** The unit on screen, if a lesson is open. */
  open?: string
  units: Record<string, UnitProgress>
  /** Which practice step the lesson's running test belongs to (`unit:step`), so returning resumes it. */
  practice?: string
}

function load(): LearnState {
  const saved = readStorage('localStorage', learnStorageKey)
  if (!isRecord(saved)) return { units: {} }
  const units: Record<string, UnitProgress> = {}
  if (isRecord(saved.units)) for (const [id, raw] of Object.entries(saved.units)) {
    const unit = unitById.get(id)
    if (!unit || !isRecord(raw)) continue
    const last = stepsOf(unit).length - 1
    const step = Number.isInteger(raw.step) ? Math.max(0, Math.min(Number(raw.step), last)) : 0
    units[id] = { step, ...typeof raw.done === 'string' ? { done: raw.done } : {} }
  }
  const open = typeof saved.open === 'string' && unitById.has(saved.open) ? saved.open : undefined
  return { units, ...open ? { open } : {}, ...typeof saved.practice === 'string' ? { practice: saved.practice } : {} }
}

let state: LearnState | undefined
const listeners = new Set<() => void>()
const snapshot = () => state ??= load()
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
function commit(next: LearnState) {
  state = next
  writeStorage('localStorage', learnStorageKey, next)
  listeners.forEach(listener => listener())
}

export const useLearn = () => useSyncExternalStore(subscribe, snapshot)
/** Opens a unit where it was left; a finished one starts over from its introduction. */
export function openUnit(id: string) {
  const current = snapshot()
  const progress = current.units[id]
  commit({ ...current, open: id, units: { ...current.units, [id]: progress?.done ? { ...progress, step: 0 } : progress ?? { step: 0 } } })
}
export const closeUnit = () => { const { open: _, ...rest } = snapshot(); commit(rest) }
export function setStep(id: string, step: number) {
  const current = snapshot()
  commit({ ...current, units: { ...current.units, [id]: { ...current.units[id], step } } })
}
export function finishUnit(id: string) {
  const current = snapshot()
  commit({ ...current, units: { ...current.units, [id]: { ...current.units[id], done: current.units[id]?.done ?? dayKey() } } })
}
export const setPractice = (key: string | undefined) => {
  const { practice: _, ...rest } = snapshot()
  commit(key ? { ...rest, practice: key } : rest)
}
