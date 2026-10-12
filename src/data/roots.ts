import conceptData from './root-concepts.json' with { type: 'json' }
import reviewData from './origin-reviews.json' with { type: 'json' }
import sourceData from './origin-sources.json' with { type: 'json' }
import type { OriginReview, OriginSource, RootConcept, RootsAid } from '../types/roots'
import type { CardSource, VocabularySource } from '../types/vocabulary'

export const rootConcepts = conceptData as Record<string, RootConcept>
export const originReviews: Record<string, OriginReview> = reviewData as Record<string, OriginReview>
export const originSources: Record<string, OriginSource> = sourceData

const relationLabels: Record<RootConcept['kind'], string> = {
  hanja: 'Shared Hanja', stem: 'Same word / stem', pattern: 'Shared pattern', loanword: 'Same loanword',
}

type Card = CardSource & Partial<Pick<VocabularySource, 'sourceKind' | 'sourceLine'>>
/** A connector or particle explains the pattern it shares, so it leads; then words, then phrases, in source order. */
const order = (card: Card) => card.sourceLine === undefined ? -1 : Number(card.sourceKind === 'phrase')

/** Only curated concept IDs make an edge. Hangul spelling is never used to infer a relationship. */
export function buildRootsAids(items: Card[]): Map<string, RootsAid> {
  const members = new Map<string, Card[]>()
  for (const item of items) {
    for (const id of originReviews[item.id]?.componentIds ?? []) {
      members.set(id, [...members.get(id) ?? [], item])
    }
  }
  return new Map(items.flatMap(item => {
    const review = originReviews[item.id]
    if (!review || (!review.componentIds.length && !review.note)) return []
    const components = review.componentIds.map(id => ({ id, ...rootConcepts[id] }))
    // Specific lexical connections precede broad conjugation patterns. A round-robin
    // across components keeps a second useful root from disappearing in a large family.
    const queues = [...components].sort((a, b) =>
      Number(a.kind === 'pattern') - Number(b.kind === 'pattern')
      || (members.get(a.id)?.length ?? 0) - (members.get(b.id)?.length ?? 0)
    ).map(component => ({ component, words: [...members.get(component.id) ?? []]
      .filter(other => other.id !== item.id && other.korean !== item.korean)
      .sort((a, b) => order(a) - order(b) || (a.sourceLine ?? 0) - (b.sourceLine ?? 0)),
    }))
    const related: RootsAid['related'] = []
    const seen = new Set<string>()
    while (related.length < 5 && queues.some(queue => queue.words.length)) {
      for (const { component, words } of queues) {
        let other = words.shift()
        while (other && seen.has(other.id)) other = words.shift()
        if (!other || related.length >= 5) continue
        seen.add(other.id)
        related.push({ id: other.id, korean: other.korean, meaning: other.meaning, kind: component.kind,
          connection: `${relationLabels[component.kind]} · ${component.label}${component.hanja ? ` (${component.hanja})` : ''} = ${component.meaning}`,
        })
      }
    }
    // Sources cover both sides of the displayed relationships, with duplicates removed.
    const sourceIds = [...new Set([...review.sourceIds, ...related.flatMap(word => originReviews[word.id].sourceIds)])]
    return [[item.id, { kind: review.kind, components, note: review.note, related,
      sources: sourceIds.map(id => originSources[id]),
    }] as const]
  }))
}
