import { cards } from '../data/cards'
import { isRecord } from '../hooks/storage'
import type { VocabularyItem } from '../types/vocabulary'
import { parseStrokes } from './ink'
import type { Answer, AnswerKey, AnswerKind, AnswerRecord, Verdict } from './types'

export const emptyAnswer = (kind: AnswerKind): Answer => kind === 'text' ? { kind, text: '' } : kind === 'choice' ? { kind, choice: '' } : { kind, strokes: [] }
export const isBlank = (answer: Answer) => answer.kind === 'text' ? !answer.text.trim() : answer.kind === 'choice' ? !answer.choice : !answer.strokes.length

export function parseAnswer(value: unknown, kind: AnswerKind): Answer | null {
  if (!isRecord(value) || value.kind !== kind) return null
  if (kind === 'text') return typeof value.text === 'string' && value.text.length <= 500 ? { kind, text: value.text } : null
  if (kind === 'choice') return typeof value.choice === 'string' && value.choice.length <= 50 ? { kind, choice: value.choice } : null
  const strokes = parseStrokes(value.strokes)
  const { aspect } = value
  return strokes ? { kind, strokes, ...typeof aspect === 'number' && aspect >= .25 && aspect <= 8 ? { aspect } : {} } : null
}

/** The learner's decision wins; an uncertain evaluation is no verdict until they decide. */
export const verdictOf = (record?: AnswerRecord): Verdict | undefined =>
  record?.self ?? (record?.auto && record.auto.result !== 'uncertain' ? record.auto.result : undefined)

const normalize = (meaning: string) => meaning.trim().toLowerCase()

/** The speaker only matters when it tells words apart: 형 (male speaker) and 오빠 (female speaker) are both “older brother”. */
export const distinctiveSpeaker = (item: VocabularyItem) => item.speaker && item.speaker !== 'anyone' ? item.speaker : undefined

function distinct(alternatives: AnswerKey['alternatives'], expected: string) {
  const seen = new Set([expected])
  return alternatives.filter(({ text }) => !seen.has(text) && seen.add(text))
}

/** Korean → English: the meaning, plus the other meaning of a word written the same way (가요: to go / popular music). */
export function meaningKey(item: VocabularyItem): AnswerKey {
  const alternatives = cards
    .filter(other => other.korean === item.korean && normalize(other.meaning) !== normalize(item.meaning))
    .map(other => ({ text: other.meaning, reason: `also written ${item.korean}` }))
  return { expected: item.meaning, alternatives: distinct(alternatives, item.meaning) }
}

/** English → Korean: the word, its dictionary form, and other words with the same meaning for the same speaker. */
export function koreanKey(item: VocabularyItem): AnswerKey {
  const speaker = distinctiveSpeaker(item)
  const alternatives = [
    ...item.dictionaryForm ? [{ text: item.dictionaryForm, reason: 'dictionary form' }] : [],
    ...cards
      .filter(other => other.id !== item.id && normalize(other.meaning) === normalize(item.meaning) && distinctiveSpeaker(other) === speaker)
      .map(other => ({ text: other.korean, reason: 'same meaning' })),
  ]
  return { expected: item.korean, alternatives: distinct(alternatives, item.korean) }
}

/** Cards that give each other away inside one test: the same Korean, or the same meaning. */
export const lookAlikeGroups = (item: VocabularyItem) => [`ko:${item.korean}`, `en:${normalize(item.meaning)}`]
