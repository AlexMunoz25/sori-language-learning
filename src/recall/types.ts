import type { AnchorKind, VocabularyItem } from '../types/vocabulary'
import type { Hint } from './hints'
import type { InkStroke } from './ink'

/** How the learner answers. A new kind adds a variant here and a field in TestView. */
export type Answer = { kind: 'text'; text: string }
  /** `aspect`: width ÷ height of the pad it was written on, so recognition sees the shapes undistorted. */
  | { kind: 'ink'; strokes: InkStroke[]; aspect?: number }
  /** One of the options the question offered; empty until one is picked. */
  | { kind: 'choice'; choice: string }
export type AnswerKind = Answer['kind']
export type Verdict = 'correct' | 'incorrect'

/** The correct answer plus everything else that should count, each with the reason it counts. */
export interface AnswerKey { expected: string; alternatives: Array<{ text: string; reason: string }> }

/** The logic half of a test mode (recall/questionRules.ts); components/testTypes.tsx adds how it looks. */
export interface QuestionRule {
  /** Stable: saved with tests and preferences. */
  id: string
  answer: AnswerKind
  supports(item: VocabularyItem): boolean
  /** What the learner sees. No two questions in one test share a prompt. */
  promptKey(item: VocabularyItem): string
  /** The correct answer and what else counts; `data` is the question's payload, when the rule prepares one. */
  answerKey(item: VocabularyItem, data?: unknown): AnswerKey
  /** Optional payload fixed when the test is built, such as multiple-choice options. Comes with `parseData`. */
  prepare?(item: VocabularyItem, context: { pool: VocabularyItem[]; random: () => number }): unknown
  /** Validates a restored payload; undefined rejects it. */
  parseData?(value: unknown, item: VocabularyItem): unknown
  /** Reads and grades an answer: deterministic matching, or recognition plus matching. Must not throw for bad input. */
  evaluate(item: VocabularyItem, answer: Answer, context: EvaluationContext): Evaluation | Promise<Evaluation>
  /** Nudges for this direction, subtlest first. */
  hints(item: VocabularyItem, context: HintContext): Hint[]
  /** Grades a reading the learner confirmed or corrected (handwriting): deterministic. */
  grade?(item: VocabularyItem, read: string): Verdict
}

export interface EvaluationContext {
  signal?: AbortSignal
  /** The question's payload from `prepare`. */
  data?: unknown
}
export interface HintContext {
  /** The question's payload from `prepare`. */
  data?: unknown
  /** The learner's saved Memory Anchor for the card, if any. `own`: one they wrote, so it may lack the usual CAPITAL keywords. */
  anchor?: { text: string; kind: AnchorKind; own: boolean }
}

export interface TestQuestion {
  /** Positional (q1…qN), never derived from the card, so a future mode may ask the same card twice. */
  id: string
  itemId: string
  type: string
  data?: unknown
}

/** How the app read an answer. 'uncertain' never becomes a grade on its own: the learner is asked first. */
export interface Evaluation {
  result: Verdict | 'uncertain'
  /** blank: nothing answered; match: typed text compared with the answer key; recognizer: handwriting read by an engine; unavailable: it couldn't be read. */
  by: 'blank' | 'match' | 'recognizer' | 'unavailable'
  /** What the app read: the recognised handwriting, or the typed text as compared. */
  read?: string
  /** Other plausible readings of the handwriting, best first. */
  alternatives?: string[]
  /** 0–1, when the evaluator has one. */
  confidence?: number
  /** The accepted answer it matched, e.g. a synonym or the dictionary form. */
  matched?: string
  /** A few words on why, e.g. 'small typo'. */
  reason?: string
}

export interface AnswerRecord {
  answer: Answer
  answeredAt: string
  /** Hints shown before checking. Any hint caps the question at half a point. */
  hints: number
  /** The app's evaluation; missing while it is still running. */
  auto?: Evaluation
  /** The learner's decision when the app asked, or when they corrected a reading. Never overwritten by the app. */
  self?: Verdict
  /** The learner's correction of what their handwriting says. */
  corrected?: string
}
