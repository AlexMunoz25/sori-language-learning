import type { RootsAid } from './roots'

/** The Library's two halves: words and phrases, and the grammar that puts them to work. */
export type Section = 'vocabulary' | 'grammar'
/**
 * Grammar, by the job it does: particles mark a word's role, connectors link clauses and sentences, endings add
 * meaning to a verb, tenses place it in time, speech levels and honorifics set the register.
 */
export type GrammarCollection = 'particles' | 'connectors' | 'endings' | 'tenses' | 'speech-levels' | 'honorifics'

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

/** A word at work in one sentence: the word in [brackets], exactly as the card writes it, and the English. */
export interface WordExample {
  korean: string
  english: string
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
  section: 'grammar'
  collection: GrammarCollection
  grammar: GrammarDetails
}

export type AnchorLanguage = 'en' | 'es' | 'fr' | 'pt' | 'it' | 'de' | 'ja' | 'zh' | 'ko' | 'mixed'
/**
 * sound: invented sound-alike; roots: rests on verified word parts; loanword: the source word itself; pattern: a true
 * Korean pattern the word follows or a family it belongs to (예쁘다 → 예뻐요 like 바쁘다 → 바빠요); culture: a real, checked
 * moment in Korean-language media where the word is heard.
 */
export type AnchorKind = 'sound' | 'reading' | 'roots' | 'loanword' | 'pattern' | 'culture'

export type CultureMedia = 'song' | 'drama' | 'film' | 'show' | 'animation'

/** Where a cultural anchor's moment can be heard, and how it was checked. Never written from memory: see docs/memory-anchors.md. */
export interface CultureSource {
  media: CultureMedia
  /** As released, Korean first: 봄날 (Spring Day). */
  title: string
  /** Who: BTS, IU, Pinkfong, tvN. */
  by: string
  year?: number
  /** The line as sung or spoken, with the word's form in brackets: 그 [봄]날이 올까. */
  quote: string
  /** The line in English. */
  translation: string
  /** One line on why this moment makes the word stick. */
  why: string
  /** An official upload where the moment can be heard: for a song, its official audio, so the timing is the record's. */
  url: string
  /** Seconds into that upload, just before the line; only when checked against it. */
  start?: number
  /** A song's official music video, to watch from the start. */
  video?: string
  /** Whether the upload may be played inside the app. */
  embed: boolean
  /** What the moment was checked against: timed lyrics, the upload's length, a source page. */
  evidence: string[]
  /** The day it was last checked, YYYY-MM-DD. */
  checked: string
}

export interface AnchorCandidate {
  /** Stable within a card. Polishing keeps the id; a new idea gets a new id. */
  id: string
  text: string
  kind: AnchorKind
  /** Language of the familiar hook; `ko` hooks onto another Korean word or Korean media. */
  language: AnchorLanguage
  /** Kept from a five-star rating: chosen until the learner picks another. */
  preselected?: boolean
  /** Cultural anchors only: the moment and its evidence. */
  source?: CultureSource
}

export interface MemoryAid {
  pronunciation: string
  anchors: AnchorCandidate[]
}

/**
 * Any card: a word or phrase (with its place in vocabulary.md) or a grammar point (with its collection and details).
 * Learn, the Library, Review, anchors, and Roots all work on this one shape.
 */
export interface VocabularyItem extends CardSource, MemoryAid, Partial<Omit<VocabularySource, keyof CardSource>> {
  section: Section
  collection?: GrammarCollection
  roots?: RootsAid
  grammar?: GrammarDetails
  /** A word's sentence, for context and for Complete the sentence. */
  example?: WordExample
}
/** How the Library shows a card: read and reveal, or hear and write. */
export type StudyMode = 'standard' | 'listening'
export type WordStatus = 'difficult' | 'known'
export type Progress = Record<string, WordStatus>
