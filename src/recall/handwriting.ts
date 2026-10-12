import { vocabulary } from '../data/vocabulary'
import type { InkStroke } from './ink'
import { matchKorean, normalizeKorean, toJamo } from './korean'
import type { Answer, AnswerKey, Evaluation } from './types'

/** Reads handwriting into text candidates, most likely first. Engines are interchangeable: the grading below never changes. */
export interface HandwritingRecognizer {
  /** Shown to the learner, e.g. in the privacy note. */
  name: string
  recognize(strokes: InkStroke[], options: { aspect: number; signal?: AbortSignal }): Promise<string[]>
}

const timeoutMs = 6000
/**
 * Google's handwriting input engine, the one behind Gboard and Google Translate handwriting. It reads strokes in their
 * order and direction, trained on real handwriting, so it reads what was written rather than how neatly. No key is needed;
 * only the ink is sent (no cookies, no page address). The endpoint is undocumented: if it stops answering, every written
 * answer simply goes to the learner to judge.
 */
export const googleHandwriting: HandwritingRecognizer = {
  name: 'Google handwriting recognition',
  async recognize(strokes, { aspect, signal }) {
    // The scale the grading below was measured at (a 420×184 pad), keeping this pad's own proportions.
    const height = 184
    const width = Math.round(height * aspect)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const stop = () => controller.abort()
    signal?.addEventListener('abort', stop)
    try {
      const ink = strokes.map(stroke => [stroke.map(point => Math.round(point.x * width)), stroke.map(point => Math.round(point.y * height)), stroke.map(point => point.t)])
      const response = await fetch('https://inputtools.google.com/request?ime=handwriting&app=sori&cs=1&oe=UTF-8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options: 'enable_pre_space', requests: [{ writing_guide: { writing_area_width: width, writing_area_height: height }, ink, language: 'ko' }] }),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: controller.signal,
      })
      const data: unknown = await response.json()
      if (!Array.isArray(data) || data[0] !== 'SUCCESS') throw new Error('Handwriting recognition failed')
      const candidates = data[1]?.[0]?.[1]
      return Array.isArray(candidates) ? candidates.filter((text): text is string => typeof text === 'string') : []
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', stop)
    }
  },
}

/**
 * How much of the engine's list must agree on an accepted first reading (spacing and punctuation aside) for it to count
 * without asking. The engine's language model sometimes "corrects" a misspelled non-word into the answer (갈샠 → 갈색), and
 * then usually lists the real spelling too. Measured on synthetic handwriting in October 2026: at 0.5, 88% of correct
 * answers (94% neat, 80% messy) count at once and none is ever marked wrong, while about 5% of non-word misspellings still
 * pass. At 0.6: 73% and 3%. Without the check: 99% and 13%.
 */
export const agreement = 0.5

/** Every word in the vocabulary, with dictionary forms: reading one of them instead of the answer is a different word, not a doubt. */
const lexicon = new Set(vocabulary.flatMap(item => [item.korean, item.dictionaryForm ?? ''].map(normalizeKorean).filter(Boolean)))

/** Candidates that differ only in spacing or punctuation are one reading; the engine's first spelling of it is shown. */
function distinctReadings(candidates: string[]) {
  const seen = new Set<string>()
  return candidates.map(text => text.trim()).filter(text => {
    const key = normalizeKorean(text)
    return key && !seen.has(key) && !!seen.add(key)
  })
}

/**
 * Grades the engine's candidates against the answer key (the word, its dictionary form, same-meaning words), deterministically.
 * Correct: the answer, read with the engine's agreement. Incorrect: clearly something else, another word or nothing like the
 * answer. Anything in between is the learner's call, asked before any grade, so the engine's doubt never costs a point.
 */
export function gradeReading(candidates: string[], key: AnswerKey): Evaluation {
  const strings = candidates.map(normalizeKorean).filter(Boolean)
  const readings = distinctReadings(candidates)
  if (!readings.length) return { result: 'uncertain', by: 'recognizer', reason: 'couldn’t make out the writing' }
  const [read, ...alternatives] = readings
  const base = { by: 'recognizer' as const, read, alternatives: alternatives.slice(0, 4) }
  const top = matchKorean(read, key)
  const share = strings.filter(text => text === normalizeKorean(read)).length / strings.length
  if (top.matched) return share >= agreement
    ? { ...base, result: 'correct', matched: top.matched, confidence: share }
    : { ...base, result: 'uncertain', matched: top.matched, confidence: share, reason: 'it could also be read another way' }
  const lower = readings.map(reading => matchKorean(reading, key).matched).find(Boolean)
  if (lower) return { ...base, result: 'uncertain', matched: lower, reason: 'it could be read more than one way' }
  const letters = Math.min(...[key.expected, ...key.alternatives.map(alternative => alternative.text)].map(text => toJamo(text).length))
  if (lexicon.has(normalizeKorean(read)) || top.distance >= Math.max(4, Math.ceil(.4 * letters))) return { ...base, result: 'incorrect' }
  return { ...base, result: 'uncertain', reason: 'close to the answer' }
}

/** Recognition plus grading. Failure to read (offline, no response) is never a grade: the learner is asked instead. */
export async function readHandwriting(answer: Answer, key: AnswerKey, signal?: AbortSignal, recognizer = googleHandwriting): Promise<Evaluation> {
  if (answer.kind !== 'ink') return { result: 'uncertain', by: 'unavailable' }
  try {
    return gradeReading(await recognizer.recognize(answer.strokes, { aspect: answer.aspect ?? 2.3, signal }), key)
  } catch {
    return { result: 'uncertain', by: 'unavailable', reason: typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'no answer from the recognizer' }
  }
}
