import source from './vocabulary.generated.json' with { type: 'json' }
import { grammarSources } from './grammar'
import { memoryAids } from './memory-aids'
import { buildRootsAids } from './roots'
import type { Section, VocabularyItem, VocabularySource } from '../types/vocabulary'

export interface SectionInfo {
  id: Section
  label: string
  /** The category that holds every card of the section. */
  all: string
  /** One card, several cards: “word”, “words”. */
  noun: [string, string]
}
export const sections: SectionInfo[] = [
  { id: 'vocabulary', label: 'Vocabulary', all: 'All words', noun: ['word', 'words'] },
  { id: 'connectors', label: 'Connectors', all: 'All connectors', noun: ['connector', 'connectors'] },
  { id: 'particles', label: 'Particles', all: 'All particles', noun: ['particle', 'particles'] },
]
export const sectionInfo = Object.fromEntries(sections.map(section => [section.id, section])) as Record<Section, SectionInfo>

const words = source as VocabularySource[]
// Built over every card at once, so a particle and the phrases that use it can point to each other.
const roots = buildRootsAids([...words, ...grammarSources])

// memory-aids.ts is the single source of Memory Anchors. Roots stays a separate reveal.
export const cards: VocabularyItem[] = [
  ...words.map(item => ({ ...item, section: 'vocabulary' as const, ...memoryAids[item.id] ?? memoryAids[item.korean], roots: roots.get(item.id) })),
  ...grammarSources.map(item => ({ ...item, ...memoryAids[item.id], roots: roots.get(item.id) })),
]
export const cardById = new Map(cards.map(item => [item.id, item]))

/** A section's categories, in source order, with how many cards each holds. */
export const categoriesOf = (section: Section) => [...new Set(cards.filter(item => item.section === section).map(item => item.category))].map(name => ({
  name,
  count: cards.filter(item => item.section === section && item.category === name).length,
}))
/** Category names never repeat across sections, so a category names its section. */
export const sectionOf = (category: string): Section | undefined =>
  sections.find(section => section.all === category)?.id ?? cards.find(item => item.category === category)?.section
/** “1 particle”, “3 words”. */
export const countOf = (section: Section, count: number) => `${count} ${sectionInfo[section].noun[count === 1 ? 0 : 1]}`
/** What the speaker buttons say: a word as written, or a connector or particle in its forms (은, 는) or in use (가면, 먹으면). */
export const spokenText = (item: VocabularyItem) => item.grammar?.speech ?? item.korean
