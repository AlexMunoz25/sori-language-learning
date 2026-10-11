import source from './vocabulary.generated.json' with { type: 'json' }
import { memoryAids } from './memory-aids'
import { buildRootsAids } from './roots'
import type { VocabularyItem, VocabularySource } from '../types/vocabulary'

const roots = buildRootsAids(source as VocabularySource[])

// memory-aids.ts is the single source of Memory Anchors. Roots stays a separate reveal.
export const vocabulary: VocabularyItem[] = (source as VocabularySource[]).map(item => ({
  ...item, ...memoryAids[item.id] ?? memoryAids[item.korean], roots: roots.get(item.id),
}))

export const categories = [...new Set(vocabulary.map(item => item.category))].map(name => ({
  name,
  count: vocabulary.filter(item => item.category === name).length,
}))
export const vocabularyById = new Map(vocabulary.map(item => [item.id, item]))
