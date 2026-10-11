import { useEffect, useState } from 'react'
import { categories, vocabulary, vocabularyById } from '../data/vocabulary'
import { shuffle } from '../recall/random'
import type { AppMode, Progress, WordStatus } from '../types/vocabulary'
import { isRecord, readStorage, writeStorage } from './storage'

export type StudyFilter = 'all' | 'difficult'
interface Session {
  category: string
  mode: AppMode
  filter: StudyFilter
  order: string[]
  index: number
  progress: Progress
  revision: number
}
export const validCategory = (value: unknown): value is string => value === 'All words' || categories.some(category => category.name === value)

/** The ids in a collection (all or difficult) and category, in source order. Decks and tests both draw from it. */
export function eligible(category: string, filter: StudyFilter, progress: Progress) {
  return vocabulary.filter(item => (category === 'All words' || item.category === category)
    && (filter === 'all' || progress[item.id] === 'difficult')).map(item => item.id)
}

/**
 * New marks for the Difficult collection join its deck and removed ones leave it. The deck stays on the
 * same card, or moves to the next one still in it (the first, if none follow).
 */
function withProgress(previous: Session, progress: Progress): Session {
  if (previous.filter !== 'difficult') return { ...previous, progress }
  const ids = eligible(previous.category, 'difficult', progress)
  const kept = previous.order.filter(id => ids.includes(id))
  const order = [...kept, ...ids.filter(id => !kept.includes(id))]
  const next = previous.order.slice(previous.index).find(id => kept.includes(id))
  return { ...previous, progress, order, index: next ? order.indexOf(next) : 0 }
}

function initialSession(): Session {
  const storedProgress = readStorage('localStorage', 'sori.progress.v1')
  const progress: Progress = {}
  if (isRecord(storedProgress)) for (const [id, status] of Object.entries(storedProgress)) {
    if (vocabularyById.has(id) && (status === 'known' || status === 'difficult')) progress[id] = status
  }
  const prefs = readStorage('localStorage', 'sori.preferences.v1')
  const saved = readStorage('sessionStorage', 'sori.session.v1')
  const settings = isRecord(saved) ? saved : isRecord(prefs) ? prefs : {}
  const category = validCategory(settings.category) ? settings.category : 'All words'
  const mode: AppMode = settings.mode === 'listening' || settings.mode === 'test' ? settings.mode : 'standard'
  const filter = settings.filter === 'difficult' ? 'difficult' : 'all'
  const ids = eligible(category, filter, progress)
  const restored = isRecord(saved) && Array.isArray(saved.order) ? [...new Set(saved.order.filter((id): id is string => typeof id === 'string' && ids.includes(id)))] : []
  const order = [...restored, ...shuffle(ids.filter(id => !restored.includes(id)))]
  const index = isRecord(saved) && Number.isInteger(saved.index) && typeof saved.index === 'number'
    ? Math.max(0, Math.min(saved.index, order.length - 1)) : 0
  return { category, mode, filter, order, index, progress, revision: 0 }
}

export function useStudySession() {
  const [session, setSession] = useState(initialSession)
  const [storageAvailable, setStorageAvailable] = useState(true)
  useEffect(() => {
    const { category, mode, filter, order, index, progress } = session
    const results = [
      writeStorage('localStorage', 'sori.progress.v1', progress),
      writeStorage('localStorage', 'sori.preferences.v1', { category, mode, filter }),
      writeStorage('sessionStorage', 'sori.session.v1', { category, mode, filter, order, index }),
    ]
    setStorageAvailable(results.every(Boolean))
  }, [session])

  function select(category: string, filter: StudyFilter = session.filter) {
    setSession(previous => ({ ...previous, category, filter, index: 0,
      order: shuffle(eligible(category, filter, previous.progress), previous.order[previous.index]), revision: previous.revision + 1 }))
  }
  function navigate(direction: 1 | -1) {
    setSession(previous => {
      if (previous.order.length < 2) return previous
      const index = previous.index + direction
      if (index >= previous.order.length) return { ...previous, index: 0,
        order: shuffle(previous.order, previous.order[previous.index]), revision: previous.revision + 1 }
      return { ...previous, index: (index + previous.order.length) % previous.order.length, revision: previous.revision + 1 }
    })
  }
  function mark(status: WordStatus) {
    setSession(previous => {
      const id = previous.order[previous.index]
      if (!id) return previous
      const progress = { ...previous.progress }
      if (progress[id] === status) delete progress[id]
      else progress[id] = status
      return withProgress(previous, progress)
    })
  }
  /** Sets (never toggles) a mark on any words, e.g. from test results; null clears it. */
  function setStatus(ids: string[], status: WordStatus | null) {
    setSession(previous => {
      const progress = { ...previous.progress }
      for (const id of ids) {
        if (!vocabularyById.has(id)) continue
        if (status) progress[id] = status
        else delete progress[id]
      }
      return withProgress(previous, progress)
    })
  }
  return {
    ...session,
    item: vocabularyById.get(session.order[session.index]),
    total: session.order.length,
    knownCount: Object.values(session.progress).filter(status => status === 'known').length,
    difficultCount: Object.values(session.progress).filter(status => status === 'difficult').length,
    storageAvailable,
    select,
    navigate,
    mark,
    setStatus,
    setMode: (mode: AppMode) => setSession(previous => ({ ...previous, mode })),
    reshuffle: () => setSession(previous => ({ ...previous, index: 0,
      order: shuffle(previous.order, previous.order[previous.index]), revision: previous.revision + 1 })),
  }
}
