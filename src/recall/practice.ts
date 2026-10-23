import type { VocabularyItem } from '../types/vocabulary'
import { questionRuleById } from './questionRules'
import { shuffle } from './random'
import type { TestQuestion } from './types'

/** Practice in a lesson, in this order: recall what each card means, then use each one where it can be used. */
const recallTypes = ['korean-to-english']
// Endings and tenses build their form on a word the learner knows; everything else completes a sentence.
const applyTypes = ['conjugate', 'complete-sentence']

/**
 * A lesson's practice for the cards just met: first every meaning (typed), then each card at work, in a sentence or a
 * conjugated form, where the card has one. Cards are mixed within each half so the order isn't the order they were met.
 * `lesson` is every card in the unit, so a grammar point is built on the unit's own words even when they're met later.
 */
export function buildPractice(items: VocabularyItem[], random: () => number = Math.random, lesson: VocabularyItem[] = items): TestQuestion[] {
  const ask = (types: string[]) => shuffle(items, undefined, random).flatMap(item => {
    const rule = types.map(id => questionRuleById.get(id)).find(candidate => candidate?.supports(item))
    return rule ? [{ item, rule }] : []
  })
  return [...ask(recallTypes), ...ask(applyTypes)].map(({ item, rule }, index) => ({
    id: `q${index + 1}`,
    itemId: item.id,
    type: rule.id,
    ...rule.prepare ? { data: rule.prepare(item, { pool: lesson, random }) } : {},
  }))
}
