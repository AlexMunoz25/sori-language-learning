import { useEffect, useState } from 'react'
import { vocabularyById } from '../data/vocabulary'
import { emptyAnswer, isBlank, parseAnswer, verdictOf } from '../recall/answers'
import { buildTest, recencyOf } from '../recall/generate'
import { compactStrokes, previewStrokes } from '../recall/ink'
import { questionRuleById, questionRules } from '../recall/questionRules'
import { scoreTest } from '../recall/scoring'
import type { Answer, AnswerRecord, Evaluation, QuestionRule, TestQuestion, Verdict } from '../recall/types'
import type { VocabularyItem } from '../types/vocabulary'
import { isRecord, readStorage, writeStorage } from './storage'
import { validCategory, type StudyFilter } from './useStudySession'

export type TestLength = 10 | 20 | 'all'
export interface TestPreferences {
  length: TestLength
  /** Disabled rather than enabled, so a newly registered mode starts switched on. */
  disabledTypes: string[]
}
/** Which words a test drew from, kept for its label while it runs. */
export interface TestPool { category: string; filter: StudyFilter }
/**
 * answering → checking (the answer is being read) → confirming (only when the app isn't sure: the learner
 * decides before anything is graded) → reviewing (graded) → the next question, or complete.
 */
export type TestPhase = 'setup' | 'answering' | 'checking' | 'confirming' | 'reviewing' | 'complete'
export interface ActiveTest {
  pool: TestPool
  questions: TestQuestion[]
  answers: Record<string, AnswerRecord>
  current: number
  ended: boolean
  /** The current question's answer before it's checked; kept here so switching modes or reloading keeps it. */
  draft: Answer | null
  /** Hints shown so far for the current question. */
  hints: number
}
interface Store { test: ActiveTest | null; history: string[][]; preferences: TestPreferences }

export const testStorageKey = 'sori.test.v1'
const preferencesKey = 'sori.testPreferences.v1'
const verdicts = ['correct', 'incorrect'] as const
const isVerdict = (value: unknown): value is Verdict => verdicts.includes(value as Verdict)
const shortText = (value: unknown, max = 200) => typeof value === 'string' && value.length <= max ? value : undefined

function parsePreferences(value: unknown): TestPreferences {
  const saved = isRecord(value) ? value : {}
  const length = saved.length === 20 || saved.length === 'all' ? saved.length : 10
  const disabled = Array.isArray(saved.disabledTypes)
    ? [...new Set(saved.disabledTypes.filter((id): id is string => typeof id === 'string' && questionRuleById.has(id)))] : []
  return { length, disabledTypes: disabled.length >= questionRules.length ? [] : disabled }
}

function parseEvaluation(value: unknown): Evaluation | undefined {
  if (!isRecord(value)) return undefined
  const { result, by } = value
  if (!(isVerdict(result) || result === 'uncertain') || !(by === 'blank' || by === 'match' || by === 'recognizer' || by === 'unavailable')) return undefined
  const evaluation: Evaluation = { result, by }
  const read = shortText(value.read)
  if (read !== undefined) evaluation.read = read
  if (Array.isArray(value.alternatives)) evaluation.alternatives = value.alternatives.filter((text): text is string => shortText(text) !== undefined).slice(0, 10)
  if (typeof value.confidence === 'number' && value.confidence >= 0 && value.confidence <= 1) evaluation.confidence = value.confidence
  const matched = shortText(value.matched)
  if (matched !== undefined) evaluation.matched = matched
  const reason = shortText(value.reason)
  if (reason !== undefined) evaluation.reason = reason
  return evaluation
}

function parseRecord(value: unknown, rule: QuestionRule): AnswerRecord | null {
  if (!isRecord(value) || typeof value.answeredAt !== 'string') return null
  // Damaged handwriting loses only its ink: the evaluation keeps what it read and whether it was blank.
  const answer = parseAnswer(value.answer, rule.answer) ?? (rule.answer === 'ink' ? emptyAnswer('ink') : null)
  if (!answer) return null
  const hints = typeof value.hints === 'number' && Number.isInteger(value.hints) && value.hints >= 0 && value.hints <= 9 ? value.hints : 0
  const auto = parseEvaluation(value.auto)
  const corrected = shortText(value.corrected, 100)
  return { answer, answeredAt: value.answeredAt, hints, ...auto ? { auto } : {}, ...isVerdict(value.self) ? { self: value.self } : {}, ...corrected !== undefined ? { corrected } : {} }
}

/** All or nothing: a saved test that doesn't fully check out returns to setup instead of resuming wrongly. */
function parseTest(value: unknown): ActiveTest | null {
  if (!isRecord(value) || !Array.isArray(value.questions) || !value.questions.length || !isRecord(value.answers)) return null
  const questions: TestQuestion[] = []
  for (const raw of value.questions) {
    if (!isRecord(raw) || typeof raw.id !== 'string' || typeof raw.itemId !== 'string' || typeof raw.type !== 'string'
      || questions.some(question => question.id === raw.id)) return null
    const item = vocabularyById.get(raw.itemId)
    const rule = questionRuleById.get(raw.type)
    if (!item || !rule?.supports(item)) return null
    const data = rule.parseData ? rule.parseData(raw.data, item) : undefined
    if (rule.parseData && data === undefined) return null
    questions.push({ id: raw.id, itemId: raw.itemId, type: raw.type, ...data === undefined ? {} : { data } })
  }
  const current = value.current
  if (typeof current !== 'number' || !Number.isInteger(current) || current < 0 || current > questions.length) return null
  const answers: Record<string, AnswerRecord> = {}
  for (const [index, question] of questions.entries()) {
    const saved = value.answers[question.id]
    // Everything before the current question is answered; nothing after it is.
    if (saved === undefined ? index < current : index > current) return null
    if (saved === undefined) continue
    const record = parseRecord(saved, questionRuleById.get(question.type)!)
    if (!record) return null
    answers[question.id] = record
  }
  // A damaged draft is dropped rather than costing the whole test.
  const currentRule = questions[current] && questionRuleById.get(questions[current].type)
  const draft = value.draft == null || !currentRule ? null : parseAnswer(value.draft, currentRule.answer)
  const category = isRecord(value.pool) ? value.pool.category : undefined
  const filter = isRecord(value.pool) ? value.pool.filter : undefined
  const pool: TestPool = validCategory(category) && (filter === 'all' || filter === 'difficult') ? { category, filter } : { category: 'All words', filter: 'all' }
  const hints = typeof value.hints === 'number' && Number.isInteger(value.hints) && value.hints >= 0 && value.hints <= 9 ? value.hints : 0
  return { pool, questions, answers, current, ended: value.ended === true, draft, hints }
}

function initialStore(): Store {
  const saved = readStorage('sessionStorage', testStorageKey)
  const history = isRecord(saved) && Array.isArray(saved.history)
    ? saved.history.filter(Array.isArray).map(ids => ids.filter((id: unknown): id is string => typeof id === 'string' && vocabularyById.has(id))).slice(-20) : []
  return { test: isRecord(saved) ? parseTest(saved.test) : null, history, preferences: parsePreferences(readStorage('localStorage', preferencesKey)) }
}

/** Keeps the save small: full handwriting only for the current question; earlier ones keep a light preview. */
function serialize({ test, history }: Store) {
  if (!test) return { version: 1, test: null, history }
  const currentId = test.questions[test.current]?.id
  const answers = Object.fromEntries(Object.entries(test.answers).map(([id, record]) => [id, record.answer.kind === 'ink'
    ? { ...record, answer: { kind: 'ink', strokes: id === currentId ? compactStrokes(record.answer.strokes) : previewStrokes(record.answer.strokes) } } : record]))
  const draft = test.draft?.kind === 'ink' ? { kind: 'ink', strokes: compactStrokes(test.draft.strokes) } : test.draft
  return { version: 1, test: { ...test, answers, draft }, history }
}

const isPromise = <T,>(value: T | Promise<T>): value is Promise<T> => typeof (value as Promise<T>)?.then === 'function'

export function useTestSession() {
  const [store, setStore] = useState(initialStore)
  const [storageAvailable, setStorageAvailable] = useState(true)
  useEffect(() => {
    const saved = writeStorage('sessionStorage', testStorageKey, serialize(store))
    // A failed write must not leave an older snapshot behind to resume from.
    if (!saved) try { window.sessionStorage.removeItem(testStorageKey) } catch { /* storage is blocked entirely */ }
    setStorageAvailable(writeStorage('localStorage', preferencesKey, store.preferences) && saved)
  }, [store])

  const { test, preferences } = store
  const enabledRules = questionRules.filter(rule => !preferences.disabledTypes.includes(rule.id))
  const question = test && !test.ended ? test.questions[test.current] : undefined
  const record = question && test?.answers[question.id]
  const phase: TestPhase = !test ? 'setup' : !question ? 'complete' : !record ? 'answering' : !record.auto ? 'checking'
    : verdictOf(record) ? 'reviewing' : 'confirming'
  const update = (change: (test: ActiveTest) => ActiveTest | null) =>
    setStore(previous => previous.test ? { ...previous, test: change(previous.test) } : previous)
  const setRecord = (id: string, change: (record: AnswerRecord) => AnswerRecord) =>
    update(test => test.answers[id] ? { ...test, answers: { ...test.answers, [id]: change(test.answers[id]) } } : test)

  // Answers that take time to read (handwriting) are evaluated here, so a reload mid-check simply reads them again.
  useEffect(() => {
    if (phase !== 'checking' || !question || !record) return
    const controller = new AbortController()
    const id = question.id
    Promise.resolve()
      .then(() => questionRuleById.get(question.type)!.evaluate(vocabularyById.get(question.itemId)!, record.answer, { signal: controller.signal }))
      .catch((): Evaluation => ({ result: 'uncertain', by: 'unavailable' }))
      .then(evaluation => { if (!controller.signal.aborted) setRecord(id, current => current.auto ? current : { ...current, auto: evaluation }) })
    return () => controller.abort()
  }, [phase, question?.id])

  /** A new test from these words; returns how many questions it has. Randomness stays out of state updaters. */
  function begin(pool: VocabularyItem[], info: TestPool, length: number, recent?: ReadonlyMap<string, number>) {
    const questions = buildTest(pool, { length, rules: enabledRules, recent })
    if (!questions.length) return 0
    setStore(previous => ({ ...previous, history: [...previous.history, questions.map(item => item.itemId)].slice(-20),
      test: { pool: info, questions, answers: {}, current: 0, ended: false, draft: null, hints: 0 } }))
    return questions.length
  }

  return {
    phase, test, question, record, preferences, enabledRules, storageAvailable,
    score: test ? scoreTest(test.questions, test.answers) : undefined,
    start: (pool: VocabularyItem[], info: TestPool) =>
      begin(pool, info, preferences.length === 'all' ? pool.length : preferences.length, recencyOf(store.history)),
    /** The same words again, in a new order and with new directions; the score, hints, and answers start over. */
    retake: () => {
      if (!test) return 0
      const items = [...new Set(test.questions.map(entry => entry.itemId))].map(id => vocabularyById.get(id)!)
      return begin(items, test.pool, items.length)
    },
    setDraft: (answer: Answer) => update(current => ({ ...current, draft: answer })),
    showHint: () => update(current => current.answers[current.questions[current.current]?.id] ? current : { ...current, hints: current.hints + 1 }),
    /** Records the answer with its hints; a synchronous evaluation grades it at once, otherwise it's read in the background. */
    submit: (evaluate?: (answer: Answer) => Evaluation | Promise<Evaluation>) => {
      if (!test || !question || test.answers[question.id] || test.ended) return
      const rule = questionRuleById.get(question.type)!
      const answer = test.draft?.kind === rule.answer ? test.draft : emptyAnswer(rule.answer)
      const answeredAt = new Date().toISOString()
      let auto: Evaluation | undefined = isBlank(answer) ? { result: 'incorrect', by: 'blank' } : undefined
      if (!auto && evaluate) {
        try {
          const result = evaluate(answer)
          if (!isPromise(result)) auto = result
        } catch { auto = { result: 'uncertain', by: 'unavailable' } }
      }
      const hints = test.hints
      update(current => current.answers[question.id] ? current
        : { ...current, draft: null, answers: { ...current.answers, [question.id]: { answer, answeredAt, hints, ...auto ? { auto } : {} } } })
    },
    /** The learner's decision when the app wasn't sure, or their correction of a misread answer. */
    decide: (verdict: Verdict, corrected?: string) => {
      if (question) setRecord(question.id, current => ({ ...current, self: verdict, ...corrected !== undefined ? { corrected } : {} }))
    },
    /** Moves on only once the question is graded, so every question is scored exactly once. */
    next: () => update(current => {
      const id = current.questions[current.current]?.id
      return id && verdictOf(current.answers[id]) ? { ...current, current: current.current + 1, draft: null, hints: 0 } : current
    }),
    /** Ends early: results for what was answered, or back to setup if nothing was. Only answered words count as tested. */
    end: () => setStore(previous => {
      if (!previous.test) return previous
      const answered = previous.test.questions.filter(entry => previous.test!.answers[entry.id]).map(entry => entry.itemId)
      const history = previous.history.slice(0, -1)
      return answered.length
        ? { ...previous, history: [...history, answered], test: { ...previous.test, ended: true, draft: null } }
        : { ...previous, history, test: null }
    }),
    reset: () => update(() => null),
    setLength: (length: TestLength) => setStore(previous => ({ ...previous, preferences: { ...previous.preferences, length } })),
    toggleType: (id: string) => setStore(previous => {
      const { disabledTypes } = previous.preferences
      const next = disabledTypes.includes(id) ? disabledTypes.filter(type => type !== id) : [...disabledTypes, id]
      return next.length >= questionRules.length ? previous : { ...previous, preferences: { ...previous.preferences, disabledTypes: next } }
    }),
  }
}

export type TestSession = ReturnType<typeof useTestSession>
