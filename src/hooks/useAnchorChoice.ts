import { useState } from 'react'
import type { AnchorCandidate, VocabularyItem } from '../types/vocabulary'
import { isRecord, readStorage, writeStorage } from './storage'

export const anchorStorageKey = 'sori.anchors.v1'
/** Recall checks after this many calendar days with the same anchor. */
export const checkpoints = [1, 3, 7]
export const customAnchorId = 'custom'

export interface RecallCheck { anchor: string; day: number; at: string; recalled: boolean }
export interface AnchorRecord {
  selected?: string
  selectedAt?: string
  custom?: string
  ratings?: Record<string, number>
  checks?: RecallCheck[]
  wantsNew?: boolean
}

function sanitize(value: unknown): AnchorRecord | undefined {
  if (!isRecord(value)) return
  const record: AnchorRecord = {}
  if (typeof value.selected === 'string') record.selected = value.selected
  if (typeof value.selectedAt === 'string' && !Number.isNaN(Date.parse(value.selectedAt))) record.selectedAt = value.selectedAt
  if (typeof value.custom === 'string' && value.custom.trim()) record.custom = value.custom.trim().slice(0, 200)
  if (isRecord(value.ratings)) {
    const ratings = Object.entries(value.ratings).filter(([, stars]) => Number.isInteger(stars) && Number(stars) >= 1 && Number(stars) <= 5)
    if (ratings.length) record.ratings = Object.fromEntries(ratings) as Record<string, number>
  }
  if (Array.isArray(value.checks)) {
    const checks = value.checks.filter((check): check is RecallCheck => isRecord(check) && typeof check.anchor === 'string'
      && typeof check.day === 'number' && typeof check.at === 'string' && typeof check.recalled === 'boolean')
    if (checks.length) record.checks = checks
  }
  if (value.wantsNew === true) record.wantsNew = true
  return record
}

export function readAnchorRecords(): Record<string, AnchorRecord> {
  const stored = readStorage('localStorage', anchorStorageKey)
  if (!isRecord(stored)) return {}
  return Object.fromEntries(Object.entries(stored).flatMap(([id, value]) => {
    const record = sanitize(value)
    return record ? [[id, record]] : []
  }))
}

/** Whole calendar days between two moments, in local time: yesterday evening → this morning is 1. */
export function calendarDaysBetween(from: string, now: Date): number {
  const start = new Date(from)
  return Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    - new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) / 86_400_000)
}

/** Checks made with the anchor that is selected now, since it was selected. */
export function currentChecks(record: AnchorRecord): RecallCheck[] {
  return (record.checks ?? []).filter(check => check.anchor === record.selected && !!record.selectedAt && check.at >= record.selectedAt)
}

/** The latest checkpoint reached and not yet answered. A late review answers every earlier one too. */
export function dueCheckpoint(record: AnchorRecord, now = new Date()): number | undefined {
  if (!record.selected || !record.selectedAt) return
  const elapsed = calendarDaysBetween(record.selectedAt, now)
  const reached = checkpoints.filter(day => elapsed >= day).at(-1)
  const answered = Math.max(0, ...currentChecks(record).map(check => check.day))
  return reached && reached > answered ? reached : undefined
}

/** Two or more misses, and more misses than successes, with the current anchor. */
export function isStruggling(record: AnchorRecord): boolean {
  const checks = currentChecks(record)
  const misses = checks.filter(check => !check.recalled).length
  return misses >= 2 && misses * 2 > checks.length
}

export function anchorFor(item: VocabularyItem, record: AnchorRecord): AnchorCandidate | undefined {
  if (record.selected === customAnchorId && record.custom) {
    return { id: customAnchorId, text: record.custom, kind: 'sound', language: 'mixed' }
  }
  return item.anchors.find(anchor => anchor.id === record.selected)
}

/** The learner's pick, or the five-star default until they pick. A stored id that no longer exists means choosing again. */
export const selectedAnchor = (item: VocabularyItem, record: AnchorRecord) =>
  anchorFor(item, record) ?? (record.selected ? undefined : item.anchors.find(anchor => anchor.preselected))

/** The anchor a test hint may draw on, read fresh from storage. */
export function savedAnchor(item: VocabularyItem) {
  const anchor = selectedAnchor(item, readAnchorRecords()[item.id] ?? {})
  return anchor && { text: anchor.text, kind: anchor.kind, own: anchor.id === customAnchorId }
}

export function useAnchorChoice(item: VocabularyItem) {
  const [record, setRecord] = useState<AnchorRecord>(() => readAnchorRecords()[item.id] ?? {})
  const [saved, setSaved] = useState(true)
  function update(next: AnchorRecord) {
    const all = readAnchorRecords()
    all[item.id] = next
    setSaved(writeStorage('localStorage', anchorStorageKey, all))
    setRecord(next)
  }
  // A stored id that no longer exists (content changed) falls back to the five-star default or to choosing.
  const stored = anchorFor(item, record)
  const selected = selectedAnchor(item, record)
  return {
    record, saved, selected,
    due: stored ? dueCheckpoint(record) : undefined,
    struggling: stored ? isStruggling(record) : false,
    /** Start recall tracking for a five-star default the first time it is used. */
    adoptDefault() {
      if (!stored && selected) update({ ...record, selected: selected.id, selectedAt: new Date().toISOString() })
    },
    select(id: string) {
      if (id === record.selected && stored) return
      update({ ...record, selected: id, selectedAt: new Date().toISOString() })
    },
    rate(id: string, stars: number) {
      const ratings = { ...record.ratings }
      if (ratings[id] === stars) delete ratings[id]
      else ratings[id] = stars
      update({ ...record, ratings })
    },
    saveCustom(text: string) {
      update({ ...record, custom: text.trim().slice(0, 200), selected: customAnchorId, selectedAt: new Date().toISOString() })
    },
    toggleWantsNew() {
      const { wantsNew, ...rest } = record
      update(wantsNew ? rest : { ...rest, wantsNew: true })
    },
    recordCheck(recalled: boolean) {
      const day = dueCheckpoint(record)
      if (!day || !record.selected) return
      update({ ...record, checks: [...record.checks ?? [], { anchor: record.selected, day, at: new Date().toISOString(), recalled }] })
    },
  }
}
export type AnchorChoice = ReturnType<typeof useAnchorChoice>

/** Everything the learner has told the app about anchors, for the next round of improvements. */
export function anchorFeedback(vocabulary: VocabularyItem[]) {
  const records = readAnchorRecords()
  const cards = vocabulary.flatMap(item => {
    const record = records[item.id]
    if (!record || !Object.keys(record).length) return []
    const selected = anchorFor(item, record)
    return [{
      id: item.id, korean: item.korean, meaning: item.meaning,
      candidates: item.anchors.map(anchor => ({ id: anchor.id, text: anchor.text })),
      ...(selected ? { selected: selected.id, selectedText: selected.text, selectedAt: record.selectedAt } : {}),
      ...(record.custom ? { custom: record.custom } : {}),
      ...(record.ratings ? { ratings: record.ratings } : {}),
      ...(record.checks ? { checks: record.checks } : {}),
      ...(record.wantsNew ? { wantsNewIdeas: true } : {}),
    }]
  })
  return {
    app: 'sori', kind: 'memory-anchor-feedback', version: 1, exportedAt: new Date().toISOString(),
    summary: {
      chosen: cards.filter(card => card.selected).length,
      rated: cards.filter(card => card.ratings).length,
      recallChecks: cards.reduce((total, card) => total + (card.checks?.length ?? 0), 0),
      wantNewIdeas: cards.filter(card => card.wantsNewIdeas).length,
    },
    cards,
  }
}
