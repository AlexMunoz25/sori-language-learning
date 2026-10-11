import type { RootsAid } from './roots'

export interface VocabularySource {
  id: string
  korean: string
  dictionaryForm?: string
  presentForm?: string
  meaning: string
  category: string
  subcategory?: string
  speaker?: string
  note?: string
  sourceLine: number
  sourceText: string
  sourceKind: 'table' | 'phrase' | 'heading'
  sourceExtra?: boolean
}

export type AnchorLanguage = 'en' | 'es' | 'fr' | 'pt' | 'it' | 'de' | 'ja' | 'zh' | 'ko' | 'mixed'
/** sound: invented sound-alike; roots: rests on verified word parts; loanword: the source word itself. */
export type AnchorKind = 'sound' | 'reading' | 'roots' | 'loanword'

export interface AnchorCandidate {
  /** Stable within a card. Polishing keeps the id; a new idea gets a new id. */
  id: string
  text: string
  kind: AnchorKind
  /** Language of the familiar hook; `ko` hooks onto another Korean word. */
  language: AnchorLanguage
  /** Kept from a five-star rating: chosen until the learner picks another. */
  preselected?: boolean
}

export interface MemoryAid {
  pronunciation: string
  anchors: AnchorCandidate[]
}

export interface VocabularyItem extends VocabularySource, MemoryAid {
  roots?: RootsAid
}
export type StudyMode = 'standard' | 'listening'
/** Study modes show cards; Test runs its own question flow over the same words. */
export type AppMode = StudyMode | 'test'
export type WordStatus = 'difficult' | 'known'
export type Progress = Record<string, WordStatus>
