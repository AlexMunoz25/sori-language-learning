import { useEffect, useState } from 'react'
import { cardById, cards, sectionInfo, sectionOf, sections } from '../data/cards'
import { shuffle } from '../recall/random'
import type { AppMode, Progress, Section, WordStatus } from '../types/vocabulary'
import { isRecord, readStorage, writeStorage } from './storage'

export type StudyFilter = 'all' | 'difficult'
/** One section's deck: its category, collection, and place. */
interface Deck {
  category: string
  filter: StudyFilter
  order: string[]
  index: number
}
interface Session extends Deck {
  mode: AppMode
  progress: Progress
  revision: number
  /** The other sections' decks, as they were left, so coming back finds the same card. */
  decks: Partial<Record<Section, Deck>>
}
/** A section's “All …” or one of its categories. The category names the section, so it's all a session needs to store. */
export const validCategory = (value: unknown): value is string => typeof value === 'string' && sectionOf(value) !== undefined

/** The ids in a collection (all or difficult) and category, in source order. Decks and tests both draw from it. */
export function eligible(category: string, filter: StudyFilter, progress: Progress) {
  const section = sectionOf(category)
  return cards.filter(item => item.section === section && (category === sectionInfo[item.section].all || item.category === category)
    && (filter === 'all' || progress[item.id] === 'difficult')).map(item => item.id)
}

/**
 * New marks for the Difficult collection join its deck and removed ones leave it. The deck stays on the
 * same card, or moves to the next one still in it (the first, if none follow).
 */
function withProgress<T extends Deck>(deck: T, progress: Progress): T {
  if (deck.filter !== 'difficult') return deck
  const ids = eligible(deck.category, 'difficult', progress)
  const kept = deck.order.filter(id => ids.includes(id))
  const order = [...kept, ...ids.filter(id => !kept.includes(id))]
  const next = deck.order.slice(deck.index).find(id => kept.includes(id))
  return { ...deck, order, index: next ? order.indexOf(next) : 0 }
}

/** A saved deck, checked card by card: cards that left the collection are dropped, new ones are shuffled in after the rest. */
function restoreDeck(saved: Record<string, unknown>, progress: Progress, fallback: string): Deck {
  const category = validCategory(saved.category) ? saved.category : fallback
  const filter = saved.filter === 'difficult' ? 'difficult' : 'all'
  const ids = eligible(category, filter, progress)
  const restored = Array.isArray(saved.order) ? [...new Set(saved.order.filter((id): id is string => typeof id === 'string' && ids.includes(id)))] : []
  const order = [...restored, ...shuffle(ids.filter(id => !restored.includes(id)))]
  const index = Number.isInteger(saved.index) && typeof saved.index === 'number' ? Math.max(0, Math.min(saved.index, order.length - 1)) : 0
  return { category, filter, order, index }
}
const deckOf = ({ category, filter, order, index }: Deck): Deck => ({ category, filter, order, index })
/** Puts the current deck aside under its section and takes the other section's out. */
function setAside(previous: Session, from: Section, to: Section): Session['decks'] {
  const { [to]: _, ...rest } = previous.decks
  return { ...rest, [from]: deckOf(previous) }
}

function initialSession(): Session {
  const storedProgress = readStorage('localStorage', 'sori.progress.v1')
  const progress: Progress = {}
  if (isRecord(storedProgress)) for (const [id, status] of Object.entries(storedProgress)) {
    if (cardById.has(id) && (status === 'known' || status === 'difficult')) progress[id] = status
  }
  const prefs = readStorage('localStorage', 'sori.preferences.v1')
  const saved = readStorage('sessionStorage', 'sori.session.v1')
  const settings = isRecord(saved) ? saved : isRecord(prefs) ? prefs : {}
  const mode: AppMode = settings.mode === 'listening' || settings.mode === 'test' ? settings.mode : 'standard'
  // Preferences keep only categories and collections; order and position last as long as the tab.
  const deck = restoreDeck(isRecord(saved) ? saved : { category: settings.category, filter: settings.filter }, progress, sectionInfo.vocabulary.all)
  const current = sectionOf(deck.category)!
  const others = isRecord(settings.decks) ? settings.decks : {}
  const decks: Session['decks'] = {}
  for (const { id, all } of sections) {
    const other = others[id]
    if (id !== current && isRecord(other) && sectionOf(String(other.category)) === id) decks[id] = restoreDeck(other, progress, all)
  }
  return { ...deck, mode, progress, revision: 0, decks }
}

export function useStudySession() {
  const [session, setSession] = useState(initialSession)
  const [storageAvailable, setStorageAvailable] = useState(true)
  useEffect(() => {
    const { category, mode, filter, order, index, progress, decks } = session
    const results = [
      writeStorage('localStorage', 'sori.progress.v1', progress),
      writeStorage('localStorage', 'sori.preferences.v1', { category, mode, filter,
        decks: Object.fromEntries(Object.entries(decks).map(([id, deck]) => [id, { category: deck!.category, filter: deck!.filter }])) }),
      writeStorage('sessionStorage', 'sori.session.v1', { category, mode, filter, order, index, decks }),
    ]
    setStorageAvailable(results.every(Boolean))
  }, [session])

  const section = sectionOf(session.category)!
  /** A category of this or another section; another section's deck is put aside to come back to. */
  function select(category: string, filter: StudyFilter = session.filter) {
    setSession(previous => {
      const from = sectionOf(previous.category)!
      const to = sectionOf(category)!
      const decks = from === to ? previous.decks : setAside(previous, from, to)
      return { ...previous, decks, category, filter, index: 0,
        order: shuffle(eligible(category, filter, previous.progress), previous.order[previous.index]), revision: previous.revision + 1 }
    })
  }
  /** Opens a section where it was left, or its whole deck the first time. */
  function switchSection(to: Section) {
    setSession(previous => {
      const from = sectionOf(previous.category)!
      if (from === to) return previous
      const saved = previous.decks[to]
      const deck = saved ? withProgress(saved, previous.progress)
        : { category: sectionInfo[to].all, filter: 'all' as const, order: shuffle(eligible(sectionInfo[to].all, 'all', previous.progress)), index: 0 }
      return { ...previous, ...deck, decks: setAside(previous, from, to), revision: previous.revision + 1 }
    })
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
      return { ...withProgress(previous, progress), progress }
    })
  }
  /** Sets (never toggles) a mark on any words, e.g. from test results; null clears it. */
  function setStatus(ids: string[], status: WordStatus | null) {
    setSession(previous => {
      const progress = { ...previous.progress }
      for (const id of ids) {
        if (!cardById.has(id)) continue
        if (status) progress[id] = status
        else delete progress[id]
      }
      return { ...withProgress(previous, progress), progress }
    })
  }
  const counted = (status: WordStatus) => Object.entries(session.progress).filter(([id, mark]) => mark === status && cardById.get(id)?.section === section).length
  return {
    ...session,
    section,
    item: cardById.get(session.order[session.index]),
    total: session.order.length,
    /** This section's marks: each section has its own Difficult pile. */
    knownCount: counted('known'),
    difficultCount: counted('difficult'),
    storageAvailable,
    select,
    switchSection,
    navigate,
    mark,
    setStatus,
    setMode: (mode: AppMode) => setSession(previous => ({ ...previous, mode })),
    reshuffle: () => setSession(previous => ({ ...previous, index: 0,
      order: shuffle(previous.order, previous.order[previous.index]), revision: previous.revision + 1 })),
  }
}
