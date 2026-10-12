import { cards, categoriesOf } from './cards'

/** The Vocabulary section: words and phrases from vocabulary.md. Connectors and particles are in cards.ts. */
export const vocabulary = cards.filter(item => item.section === 'vocabulary')
export const categories = categoriesOf('vocabulary')
export const vocabularyById = new Map(vocabulary.map(item => [item.id, item]))
