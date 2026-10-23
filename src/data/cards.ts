import source from './vocabulary.generated.json' with { type: 'json' }
import { grammarSources } from './grammar'
import { cultureCandidates } from './culture-anchors'
import { memoryAids } from './memory-aids'
import { buildRootsAids } from './roots'
import { wordExamples } from './word-examples'
import type { GrammarCollection, Section, VocabularyItem, VocabularySource } from '../types/vocabulary'

export interface SectionInfo {
  id: Section
  label: string
  /** The selection that holds every card of the section. */
  all: string
  /** One card, several cards: “word”, “words”. */
  noun: [string, string]
}
export const sections: SectionInfo[] = [
  { id: 'vocabulary', label: 'Vocabulary', all: 'All words', noun: ['word', 'words'] },
  { id: 'grammar', label: 'Grammar', all: 'All grammar', noun: ['grammar point', 'grammar points'] },
]
export const sectionInfo = Object.fromEntries(sections.map(section => [section.id, section])) as Record<Section, SectionInfo>

export interface CollectionInfo {
  id: GrammarCollection
  label: string
  /** The selection that holds every card of the collection. */
  all: string
  noun: [string, string]
  /** What a card's id starts with: particle:은/는. */
  prefix: string
}
/** In Library order. A collection shows once it has cards. */
export const collectionList: CollectionInfo[] = [
  { id: 'particles', label: 'Particles', all: 'All particles', noun: ['particle', 'particles'], prefix: 'particle' },
  { id: 'connectors', label: 'Connectors', all: 'All connectors', noun: ['connector', 'connectors'], prefix: 'connector' },
  { id: 'endings', label: 'Endings', all: 'All endings', noun: ['ending', 'endings'], prefix: 'ending' },
  { id: 'tenses', label: 'Tenses', all: 'All tenses', noun: ['tense', 'tenses'], prefix: 'tense' },
  { id: 'speech-levels', label: 'Speech levels', all: 'All speech levels', noun: ['speech level', 'speech levels'], prefix: 'speech' },
  { id: 'honorifics', label: 'Honorifics', all: 'All honorifics', noun: ['honorific', 'honorifics'], prefix: 'honorific' },
]
export const collectionInfo = Object.fromEntries(collectionList.map(collection => [collection.id, collection])) as Record<GrammarCollection, CollectionInfo>

const words = source as VocabularySource[]
// Built over every card at once, so a particle and the phrases that use it can point to each other.
const roots = buildRootsAids([...words, ...grammarSources])

// memory-aids.ts holds the written Memory Anchors, culture-anchors.ts the verified media moments. Roots stays a separate reveal.
const aidOf = (id: string, key = id) => {
  const aid = memoryAids[id] ?? memoryAids[key]
  return { ...aid, anchors: [...aid?.anchors ?? [], ...cultureCandidates(id)] }
}
export const cards: VocabularyItem[] = [
  ...words.map(item => ({ ...item, section: 'vocabulary' as const, ...aidOf(item.id, item.korean), roots: roots.get(item.id), example: wordExamples[item.id] })),
  ...grammarSources.map(item => ({ ...item, ...aidOf(item.id), roots: roots.get(item.id) })),
]
export const cardById = new Map(cards.map(item => [item.id, item]))

/** The collections that have cards, in Library order. */
export const collections = collectionList.filter(collection => cards.some(item => item.collection === collection.id))

/** The categories of a section or collection, in source order, with how many cards each holds. */
export function categoriesOf(scope: Section | GrammarCollection) {
  const within = cards.filter(item => item.section === scope || item.collection === scope)
  return [...new Set(within.map(item => item.category))].map(name => ({ name, count: within.filter(item => item.category === name).length }))
}

/** A collection's “All …” selection or one of its categories names that collection. */
export function collectionOf(selection: string): GrammarCollection | undefined {
  return collectionList.find(collection => collection.all === selection)?.id ?? cards.find(item => item.category === selection)?.collection
}
/** Category names never repeat, so any selection (“All words”, “All particles”, “Contrast”) names its section. */
export function sectionOf(selection: string): Section | undefined {
  if (collectionList.some(collection => collection.all === selection)) return 'grammar'
  return sections.find(section => section.all === selection)?.id ?? cards.find(item => item.category === selection)?.section
}
/** Whether a card is part of a selection: its section's “All …”, its collection's, or its own category. */
export const inSelection = (item: VocabularyItem, selection: string) =>
  selection === sectionInfo[item.section].all || (!!item.collection && selection === collectionInfo[item.collection].all) || selection === item.category

/** What a selection's cards are called: words, particles, or grammar points when collections mix. */
export function nounsOf(selection: string): [string, string] {
  const collection = collectionOf(selection)
  return collection ? collectionInfo[collection].noun : sectionInfo[sectionOf(selection) ?? 'vocabulary'].noun
}
/** “1 particle”, “3 words”, “12 grammar points”. */
export const countOf = (selection: string, count: number) => `${count} ${nounsOf(selection)[count === 1 ? 0 : 1]}`
/** What a set of cards is called: their shared collection, their section, or just cards. */
export function nounsFor(items: VocabularyItem[]): [string, string] {
  const [first] = items
  if (!first) return ['card', 'cards']
  if (first.collection && items.every(item => item.collection === first.collection)) return collectionInfo[first.collection].noun
  return items.every(item => item.section === first.section) ? sectionInfo[first.section].noun : ['card', 'cards']
}
/** “particle”, “word”: what one card is. */
export const nounOf = (item: VocabularyItem) => item.collection ? collectionInfo[item.collection].noun[0] : sectionInfo[item.section].noun[0]
/** What the speaker buttons say: a word as written, or a grammar point in its forms (은, 는) or in use (가면, 먹으면). */
export const spokenText = (item: VocabularyItem) => item.grammar?.speech ?? item.korean
