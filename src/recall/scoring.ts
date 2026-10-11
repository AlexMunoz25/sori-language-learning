import { verdictOf } from './answers'
import type { AnswerRecord, TestQuestion } from './types'

export const points = { correct: 1, withHint: 0.5, incorrect: 0 }

export type Outcome = 'correct' | 'hinted' | 'incorrect' | 'pending'

/** A graded answer is correct, correct with a hint, or incorrect; one still being read or awaiting the learner is pending. */
export function outcomeOf(record?: AnswerRecord): Outcome {
  const verdict = verdictOf(record)
  if (!verdict) return 'pending'
  if (verdict === 'incorrect') return 'incorrect'
  return record!.hints ? 'hinted' : 'correct'
}

/** Points for one question, or undefined until it's graded. Any hint caps it at half a point. */
export function pointsFor(record?: AnswerRecord): number | undefined {
  const outcome = outcomeOf(record)
  return outcome === 'pending' ? undefined : outcome === 'correct' ? points.correct : outcome === 'hinted' ? points.withHint : points.incorrect
}

/** The learner settled it: they confirmed or corrected a reading, or judged it themselves when it couldn't be read. */
export const settledByLearner = (record?: AnswerRecord) => !!record?.self

export interface TestScore {
  earned: number
  /** One point per graded question: unanswered ones (an ended test) and ungraded ones never lower the score. */
  possible: number
  /** 0–100, rounded. */
  percent: number
  correct: number
  hinted: number
  incorrect: number
  pending: number
  /** Graded with the learner's help instead of by the app alone. */
  settledByLearner: number
}

/** Derived from the answers every time, so no question can ever count twice. */
export function scoreTest(questions: TestQuestion[], answers: Record<string, AnswerRecord>): TestScore {
  const score: TestScore = { earned: 0, possible: 0, percent: 0, correct: 0, hinted: 0, incorrect: 0, pending: 0, settledByLearner: 0 }
  for (const question of questions) {
    const record = answers[question.id]
    if (!record) continue
    const outcome = outcomeOf(record)
    score[outcome]++
    if (outcome === 'pending') continue
    score.possible += points.correct
    score.earned += pointsFor(record)!
    if (settledByLearner(record)) score.settledByLearner++
  }
  score.percent = score.possible ? Math.round(score.earned / score.possible * 100) : 0
  return score
}

/** 3, 2.5, 0.5: halves are the only fractions points can have. */
export const formatPoints = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1)
