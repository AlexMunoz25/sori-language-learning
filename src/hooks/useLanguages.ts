import { useSyncExternalStore } from 'react'
import type { AnchorCandidate, AnchorLanguage } from '../types/vocabulary'
import { isRecord, readStorage, writeStorage } from './storage'

export const languageStorageKey = 'sori.languages.v1'
/** Languages a Memory Anchor can hook into. English is the app's own language, so it is always on. */
export const languageOptions: Array<{ id: AnchorLanguage; label: string }> = [
  { id: 'en', label: 'English' }, { id: 'es', label: 'Spanish' }, { id: 'fr', label: 'French' }, { id: 'it', label: 'Italian' },
  { id: 'pt', label: 'Portuguese' }, { id: 'de', label: 'German' }, { id: 'ja', label: 'Japanese' },
]
/** The deck's anchors were first written for speakers of English, Spanish, and French. */
export const defaultLanguages: AnchorLanguage[] = ['en', 'es', 'fr']
const valid = new Set(languageOptions.map(option => option.id))

function load(): AnchorLanguage[] {
  const saved = readStorage('localStorage', languageStorageKey)
  const list = isRecord(saved) && Array.isArray(saved.languages) ? saved.languages.filter((id): id is AnchorLanguage => valid.has(id as AnchorLanguage)) : []
  return list.length ? [...new Set<AnchorLanguage>(['en', ...list])] : defaultLanguages
}
let current: AnchorLanguage[] | undefined
const listeners = new Set<() => void>()
const snapshot = () => current ??= load()
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }

export function setLanguages(languages: AnchorLanguage[]) {
  current = [...new Set<AnchorLanguage>(['en', ...languages.filter(id => valid.has(id))])]
  writeStorage('localStorage', languageStorageKey, { languages: current })
  listeners.forEach(listener => listener())
}
export const useLanguages = () => useSyncExternalStore(subscribe, snapshot)

/**
 * Whether an anchor speaks to this learner: English hooks, verified roots, loanwords, and mixed hooks always do; a hook
 * in another language does when they know it. The rest stay one tap away, never hidden for good.
 */
export const fitsLanguages = (anchor: AnchorCandidate, languages: AnchorLanguage[]) =>
  (anchor.kind !== 'sound' && anchor.kind !== 'reading') || anchor.language === 'en' || anchor.language === 'mixed' || anchor.language === 'ko' || languages.includes(anchor.language)
