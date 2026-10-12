import type { RootsAid } from './roots'

/** The app's three decks: words and phrases, connectors that link clauses and sentences, and particles that mark a word's role. */
export type Section = 'vocabulary' | 'connectors' | 'particles'

/** What every card has, wherever it comes from. */
export interface CardSource {
  id: string
  korean: string
  dictionaryForm?: string
  presentForm?: string
  meaning: string
  category: string
  subcategory?: string
  speaker?: string
  note?: string
}

/** A word or phrase from vocabulary.md, with where it stands there. */
export interface VocabularySource extends CardSource {
  sourceLine: number
  sourceText: string
  sourceKind: 'table' | 'phrase' | 'heading'
  sourceExtra?: boolean
}

/** One sentence that shows a connector or particle at work. */
export interface GrammarExample {
  /** Polite Korean with the studied piece in brackets, exactly as written: 저[는], 비싸[지만], 가[서]. */
  korean: string
  english: string
  /** Three wrong fillers for the bracket, for Complete the sentence: each fits the slot and is wrong for the English. */
  gap: string[]
  /** Why the bracketed piece fits and the likeliest wrong one doesn't, shown after answering. */
  why: string
}

export interface GrammarComparison {
  /** The cards compared with, by id. */
  with: string[]
  title: string
  points: string[]
}

/** How a connector or particle works: its shapes, sentences, rules, tricks, and look-alikes. */
export interface GrammarDetails {
  /** What the audio says: the forms themselves (은, 는) or short words using them (가면, 먹으면). */
  speech: string
  /** Every shape it takes and when: 은 after a consonant, 는 after a vowel. */
  forms: Array<{ form: string; when: string }>
  examples: GrammarExample[]
  /** Attachment, position, tense and register limits, common exceptions. */
  rules: string[]
  /** Shortcuts and patterns that make it stick. */
  tricks: string[]
  comparisons: GrammarComparison[]
}

export interface GrammarSource extends CardSource {
  section: Exclude<Section, 'vocabulary'>
  grammar: GrammarDetails
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

/**
 * Any study card: a word or phrase (with its place in vocabulary.md), a connector, or a particle (with its grammar).
 * Study, Listening, anchors, Roots, and tests all work on this one shape.
 */
export interface VocabularyItem extends CardSource, MemoryAid, Partial<Omit<VocabularySource, keyof CardSource>> {
  section: Section
  roots?: RootsAid
  grammar?: GrammarDetails
}
export type StudyMode = 'standard' | 'listening'
/** Study modes show cards; Test runs its own question flow over the same words. */
export type AppMode = StudyMode | 'test'
export type WordStatus = 'difficult' | 'known'
export type Progress = Record<string, WordStatus>
