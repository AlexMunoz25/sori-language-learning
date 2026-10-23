import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { ArrowRight, Check, Eye, Lightbulb, LoaderCircle, RefreshCw, RotateCcw, Star, Undo2, Volume2, X } from 'lucide-react'
import { cardById, countOf, nounsFor, sectionOf } from '../data/cards'
import { savedAnchor } from '../hooks/useAnchorChoice'
import type { TestPool, TestSession } from '../hooks/useTestSession'
import { useSpeech } from '../hooks/useSpeech'
import { emptyAnswer, isBlank } from '../recall/answers'
import { sameAnswer } from '../recall/english'
import { capacity } from '../recall/generate'
import { googleHandwriting } from '../recall/handwriting'
import type { Hint } from '../recall/hints'
import { formatPoints, outcomeOf, pointsFor, type Outcome } from '../recall/scoring'
import type { Answer, AnswerKey, AnswerRecord, Evaluation, TestQuestion, Verdict } from '../recall/types'
import type { Progress, VocabularyItem, WordStatus } from '../types/vocabulary'
import { EmptyCollection } from './EmptyCollection'
import { InkPreview } from './InkPreview'
import { questionTypeById, questionTypes, type QuestionType } from './testTypes'
import { WordNotes } from './WordNotes'
import { WritingPad } from './WritingPad'

/** Moves focus to where the next step happens. Called right after a synchronous render, so the text field also opens the phone keyboard. */
export function focusQuestion() {
  const target = document.getElementById('test-answer') ?? document.querySelector<HTMLElement>('[data-test-prompt]')
  target?.focus({ preventScroll: true })
}
const focusById = (id: string) => document.getElementById(id)?.focus()
/** Brings a control into view and focus without jumping the page more than needed. */
function bring(element: HTMLElement | null) {
  element?.focus({ preventScroll: true })
  element?.scrollIntoView({ block: 'nearest' })
}

export const outcomeLabels: Record<Outcome, string> = { correct: 'Correct', hinted: 'Correct with a hint', incorrect: 'Incorrect', pending: 'Not graded' }
const pointsLabel = (value: number) => `${value > 0 ? '+' : ''}${formatPoints(value)} ${value === 1 ? 'point' : 'points'}`
const hintLabels: Record<Hint['kind'], string> = { anchor: 'Your anchor', meaning: 'Clue', form: 'Shape', narrow: 'Fewer options', rule: 'Rule' }
const blankLabels: Record<Answer['kind'], string> = { text: 'Left blank', ink: 'Nothing written', choice: 'Nothing chosen' }
const doubts: Record<string, string> = { 'close spelling': 'Close, but spelled differently.', 'partly right': 'Partly right.', 'extra words': 'Right, with extra words.' }
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

interface Props {
  test: TestSession
  /** Cards in the current selection: new tests draw from them. */
  pool: VocabularyItem[]
  poolInfo: TestPool
  poolLabel: string
  progress: Progress
  difficultCount: number
  onSelect: (category: string, filter: 'all' | 'difficult') => void
  /** Opens the selection sheet, to test other cards. */
  onChoose: () => void
  onSetStatus: (ids: string[], status: WordStatus | null) => void
  announce: (message: string) => void
}

/** Testing evaluates recall: answers are graded for you, a hint costs half a point, and results feed the Difficult pile. */
export function TestView(props: Props) {
  const { test, pool, poolInfo, announce } = props
  const { disabledTypes } = test.preferences
  // How many questions this pool can really give (one type enabled: look-alikes sharing a prompt count once).
  const { usable, questionCount } = useMemo(() => {
    const rules = test.rulesFor(pool)
    const usable = pool.filter(item => rules.some(rule => rule.supports(item)))
    return { usable, questionCount: capacity(usable, rules) }
  }, [pool, disabledTypes])
  function opened(count: number) {
    if (!count) return
    window.scrollTo({ top: 0 })
    announce(`Question 1 of ${count}`)
    focusQuestion()
  }
  function begin() {
    let count = 0
    flushSync(() => { count = test.start(usable, poolInfo) })
    opened(count)
  }
  function retake() {
    let count = 0
    flushSync(() => { count = test.retake() })
    opened(count)
  }
  if (test.phase === 'setup') return <TestSetup {...props} usable={usable} questionCount={questionCount} onStart={begin} />
  if (test.phase === 'complete') return <TestResults {...props} usable={usable} onStart={begin} onRetake={retake} />
  return <QuestionCard key={test.question!.id} test={test} announce={announce} />
}

function TestSetup({ test, pool, poolInfo, poolLabel, difficultCount, onSelect, onChoose, usable, questionCount, onStart }: Props & { usable: VocabularyItem[]; questionCount: number; onStart: () => void }) {
  if (!pool.length) return <EmptyCollection section={sectionOf(poolInfo.category) ?? 'vocabulary'} difficultCount={difficultCount} onSelect={onSelect} />
  const sizes = ([10, 20] as const).filter(size => size < questionCount)
  const length = test.preferences.length !== 'all' && sizes.some(size => size === test.preferences.length) ? test.preferences.length : 'all'
  const enabled = new Set(test.rulesFor(pool).map(rule => rule.id))
  // Only the modes that can ask these cards: English → Korean for words, Build the form for endings and tenses.
  const types = questionTypes.filter(type => pool.some(item => type.supports(item)))
  return <section className="study-card test-card" aria-labelledby="test-setup-title">
    <div className="card-kicker flex items-center justify-between gap-3"><span>TEST YOUR RECALL</span><span className="tiny-dot" /></div>
    <h2 id="test-setup-title" tabIndex={-1} className="test-title">How much do you remember?</h2>
    <p className="test-lead">Checked for you: 1 point each, ½ with a hint.</p>
    <div className="test-pool-row flex items-baseline justify-between gap-3">
      <p className="test-pool-line" data-testid="test-pool">{poolLabel} · {countOf(poolInfo.category, usable.length)}</p>
      <button className="test-link" aria-label="Choose what to test" aria-haspopup="dialog" onClick={onChoose}>Change</button>
    </div>
    <div className="test-option">
      <p className="test-label" id="test-length-label">Questions</p>
      <div className="segmented" role="group" aria-labelledby="test-length-label">
        {sizes.map(size => <button key={size} aria-pressed={length === size} onClick={() => test.setLength(size)}>{size}</button>)}
        {/* Already showing as chosen when the saved size doesn't fit this pool: tapping it mustn't overwrite that size. */}
        <button aria-pressed={length === 'all'} onClick={() => { if (length !== 'all') test.setLength('all') }}>All {questionCount}</button>
      </div>
      {questionCount < usable.length && <p className="test-note">Words that share a prompt, like 락 and 록, take turns across tests.</p>}
    </div>
    <div className="test-option">
      <p className="test-label" id="test-types-label">Question types</p>
      <div className="test-types" role="group" aria-labelledby="test-types-label">
        {types.map(type => {
          const on = enabled.has(type.id)
          return <button key={type.id} className="test-type" aria-pressed={on} disabled={on && enabled.size === 1}
            title={on && enabled.size === 1 ? 'At least one question type stays on' : undefined} onClick={() => test.toggleType(type.id, pool)}>
            <span className="test-type-check" aria-hidden="true">{on && <Check size={14} strokeWidth={2.4} />}</span>
            <span><strong>{type.label}</strong><span>{type.instruction}</span></span>
          </button>
        })}
      </div>
    </div>
    <button className="primary-button test-start" disabled={!usable.length} onClick={onStart}>Start test<ArrowRight size={18} /></button>
    {enabled.has('english-to-korean') && <p className="test-privacy">Handwriting is read by {googleHandwriting.name}: only your strokes are sent, when you check an answer.</p>}
  </section>
}

/** Hints, subtlest first: each one is shown on request, and any of them caps the question at half a point. */
function HintArea({ hints, shown, open, onShow }: { hints: Hint[]; shown: number; open: boolean; onShow: () => void }) {
  if (!hints.length || (!shown && !open)) return null
  return <div className="test-hints" data-testid="test-hints">
    {hints.slice(0, shown).map((hint, index) => <p key={index} className="test-hint" data-kind={hint.kind} tabIndex={-1}>
      <Lightbulb size={14} aria-hidden="true" /><span><span className="test-hint-kind">{hintLabels[hint.kind]}</span>{hint.text}</span>
    </p>)}
    {open && shown < hints.length && <button className="hint-button" onClick={onShow} aria-describedby="hint-cost">
      <Lightbulb size={15} aria-hidden="true" />{shown ? 'Another hint' : 'Hint'}
      <span className="hint-cost" id="hint-cost" aria-hidden="true">{shown ? 'no extra cost' : 'max ½ point'}</span>
    </button>}
  </div>
}

/** What the app read in the handwriting, or what the learner said it reads. */
function Reading({ record }: { record: AnswerRecord }) {
  const read = record.corrected ?? record.auto?.read
  if (!read || record.auto?.by === 'blank') return null
  return <p className="test-reading" data-testid="test-reading">{record.corrected !== undefined ? 'You wrote' : 'Read as'} <span lang="ko">{read}</span></p>
}

/** Why it was graded this way, in a few words; nothing when it's plain. */
function explanation(record: AnswerRecord, kind: Answer['kind']): ReactNode {
  const { auto, self, corrected } = record
  if (self && corrected === undefined) return auto?.result === 'uncertain' ? 'Your call' : 'Changed by you'
  if (!auto || self) return
  if (auto.by === 'blank') return blankLabels[kind]
  if (kind === 'ink' || auto.result !== 'correct') return auto.reason && auto.by === 'match' ? capitalize(auto.reason) : undefined
  if (auto.reason === 'small typo') return <>Small typo, counted as “{auto.matched}”</>
  if (auto.reason === 'same meaning') return 'Accepted synonym'
  if (auto.reason) return <>{capitalize(auto.reason)}: “{auto.matched}”</>
  if (auto.matched && auto.read && !sameAnswer(auto.read, auto.matched)) return <>Counted as “{auto.matched}”</>
}

function ResultLine({ record, kind }: { record: AnswerRecord; kind: Answer['kind'] }) {
  const outcome = outcomeOf(record)
  const points = pointsFor(record) ?? 0
  const why = explanation(record, kind)
  return <div className={`test-result ${outcome}`} data-testid="test-result" data-outcome={outcome}>
    <p>{outcome === 'incorrect' ? <X size={17} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}<strong>{outcomeLabels[outcome]}</strong>
      <span className="test-points" data-testid="test-points">{pointsLabel(points)}</span></p>
    {why && <p className="test-why">{why}</p>}
  </div>
}

/** Handwriting the app wasn't sure about, or couldn't read at all: the learner says what they wrote before anything is graded. */
function ConfirmReading({ evaluation, onPick, onCompare, onRetry }: { evaluation: Evaluation; onPick: (reading: string) => void; onCompare: () => void; onRetry: () => void }) {
  const readings = evaluation.read ? [evaluation.read, ...evaluation.alternatives ?? []] : []
  if (!readings.length) {
    const offline = evaluation.reason === 'offline'
    return <div className="test-confirm" data-testid="test-confirm">
      <p className="confirm-question">{evaluation.by === 'unavailable'
        ? offline ? 'You seem to be offline, so your handwriting can’t be read.' : 'Your handwriting couldn’t be read just now.'
        : 'We couldn’t make out the writing.'}</p>
      <div className="confirm-choices">
        {evaluation.by === 'unavailable' && <button data-confirm-first onClick={onRetry}><RefreshCw size={16} aria-hidden="true" />Try again</button>}
        <button data-confirm-first={evaluation.by === 'unavailable' ? undefined : true} onClick={onCompare}><Eye size={16} aria-hidden="true" />Compare with the answer</button>
      </div>
    </div>
  }
  return <div className="test-confirm" data-testid="test-confirm">
    <p className="confirm-question" id="confirm-question">{readings.length > 1 ? 'Not sure what this says. Which did you write?' : 'Not sure what this says. Is this what you wrote?'}</p>
    <div className="confirm-readings" role="group" aria-labelledby="confirm-question">
      {readings.map((reading, index) => <button key={reading} lang="ko" data-confirm-first={index ? undefined : true} onClick={() => onPick(reading)}>{reading}</button>)}
    </div>
    <button className="test-link" onClick={onCompare}>{readings.length > 1 ? 'None of these' : 'No'}: compare with the answer</button>
  </div>
}

/** Two choices, the first one focused when they appear. */
function Choice({ question, yes, no, onDecide }: { question: string; yes: string; no: string; onDecide: (verdict: Verdict) => void }) {
  return <div className="test-confirm" data-testid="test-confirm">
    <p className="confirm-question" id="confirm-question">{question}</p>
    <div className="confirm-choices" role="group" aria-labelledby="confirm-question">
      <button data-confirm-first onClick={() => onDecide('correct')}><Check size={16} aria-hidden="true" />{yes}</button>
      <button onClick={() => onDecide('incorrect')}><X size={16} aria-hidden="true" />{no}</button>
    </div>
  </div>
}

/** After grading: the app may have misread the handwriting or missed a synonym; the learner can say so, and take it back. */
function Override({ record, kind, answerKey, onCorrect, onDecide, onUndo }: {
  record: AnswerRecord; kind: Answer['kind']; answerKey: AnswerKey
  onCorrect: (reading: string) => void; onDecide: (verdict: Verdict) => void; onUndo: () => void
}) {
  const [open, setOpen] = useState(false)
  const { auto } = record
  // Each action replaces the button pressed, so focus moves to what replaces it (or stays where the next step put it).
  const then = (action: () => void, ...ids: string[]) => {
    flushSync(action)
    ids.map(id => document.getElementById(id)).find(Boolean)?.focus()
  }
  if (record.self) return <p className="test-override"><button id="test-undo" className="test-link" onClick={() => then(onUndo, 'test-count-mine', 'test-misread', 'test-misread-first')}>
    <Undo2 size={13} aria-hidden="true" />Undo your call</button></p>
  if (!auto || auto.result !== 'incorrect' || auto.by === 'blank') return null
  if (kind === 'text') return <p className="test-override">Means the same? <button id="test-count-mine" className="test-link" onClick={() => then(() => onDecide('correct'), 'test-undo')}>Count my answer</button></p>
  // A choice is the option picked: nothing to misread or reword.
  if (kind === 'choice') return null
  const options = [...new Set([answerKey.expected, ...answerKey.alternatives.map(alternative => alternative.text), ...auto.alternatives ?? []])]
  if (!open) return <p className="test-override">Misread? <button id="test-misread" className="test-link" aria-expanded={false} onClick={() => then(() => setOpen(true), 'test-misread-first')}>Tell us what you wrote</button></p>
  return <div className="test-override">
    <p id="override-question">What did you write?</p>
    <div className="confirm-readings" role="group" aria-labelledby="override-question">
      {options.map((option, index) => <button key={option} id={index ? undefined : 'test-misread-first'} lang="ko" onClick={() => then(() => onCorrect(option), 'test-undo')}>{option}</button>)}
    </div>
  </div>
}

/**
 * The options of a choice question, as radio buttons: arrows move between them, Enter checks. Once answered,
 * the right one and the learner's pick are marked; options a hint took away stay visible, struck through.
 */
function ChoiceField({ options, removed, picked, expected, answered, label, describedBy, checkLabel, onPick, onCheck }: {
  options: string[]; removed: string[]; picked: string; expected: string; answered: boolean; label: string; describedBy: string; checkLabel: string
  onPick: (choice: string) => void; onCheck: () => void
}) {
  return <form className="test-form" onSubmit={event => { event.preventDefault(); onCheck() }}>
    <p className="test-label" id="choice-label">{label}</p>
    <div className="choice-options" role="radiogroup" aria-labelledby="choice-label" aria-describedby={describedBy} data-testid="choice-options"
      onKeyDown={event => { if (event.key === 'Enter' && !event.repeat && !answered) { event.preventDefault(); onCheck() } }}>
      {options.map(option => {
        const state = !answered ? '' : option === expected ? 'right' : option === picked ? 'wrong' : ''
        return <label key={option} className={`choice-option ${state} ${removed.includes(option) ? 'gone' : ''}`} data-state={state || undefined}>
          <input type="radio" name="test-choice" value={option} checked={picked === option} disabled={answered || removed.includes(option)} onChange={() => onPick(option)} />
          <span lang="ko">{option}</span>
          {state === 'right' && <Check size={16} aria-label="correct answer" />}
          {state === 'wrong' && <X size={16} aria-label="your answer" />}
        </label>
      })}
    </div>
    {!answered && <button type="submit" className="test-check">{checkLabel}</button>}
  </form>
}

export function QuestionCard({ test, announce }: { test: TestSession; announce: (message: string) => void }) {
  const active = test.test!
  const question = test.question!
  const type = questionTypeById.get(question.type)!
  const item = cardById.get(question.itemId)!
  const { record, phase } = test
  const answer: Answer = record?.answer ?? active.draft ?? emptyAnswer(type.answer)
  // A reviewed answer remembers whether it was blank; restored handwriting from earlier questions isn't kept.
  const blank = record ? record.auto?.by === 'blank' : isBlank(answer)
  const answerKey = type.answerKey(item, question.data)
  // Choice questions: the options in the order shown; a Fewer options hint takes the first two wrong ones away.
  const options = (question.data as { options?: string[] } | undefined)?.options ?? []
  const wrongOptions = options.filter(option => option !== answerKey.expected)
  const position = active.current + 1
  const last = position >= active.questions.length
  const promptId = `${question.id}-prompt`
  const speech = useSpeech()
  const { cancel } = speech
  useEffect(() => () => cancel(), [cancel])
  const shownAt = useRef(performance.now())
  const revealedAt = useRef(0)
  const { forms = true, speaker = true } = type.notes ?? {}
  // From the anchor saved when the question appears; after a reload the same hints come back.
  const hints = useMemo(() => type.hints(item, { anchor: savedAnchor(item), data: question.data }), [question.id])
  const shownHints = record ? record.hints : active.hints
  const removed = hints.slice(0, shownHints).some(hint => hint.kind === 'narrow') ? wrongOptions.slice(0, 2) : []
  // Comparing their writing with the answer themselves, when the app couldn't read it.
  const [comparing, setComparing] = useState(false)
  // When a step's choices appeared: a doubled tap or Enter that arrives with them must not choose for the learner.
  const stepAt = useRef(0)
  const deliberate = <T extends unknown[]>(action: (...args: T) => void) => (...args: T) => { if (performance.now() - stepAt.current >= 300) action(...args) }

  // Every step moves focus to what comes next, and says what happened.
  const seen = useRef(phase)
  useLayoutEffect(() => {
    if (seen.current === phase) return
    seen.current = phase
    if (phase === 'checking') { announce('Reading your handwriting'); bring(document.getElementById('test-status')) }
    if (phase === 'confirming') {
      stepAt.current = performance.now()
      const evaluation = record?.auto
      announce(type.answer === 'text' ? `The answer is ${answerKey.expected}. Does yours mean the same?`
        : evaluation?.read ? `Not sure what this says. It could be ${[evaluation.read, ...evaluation.alternatives ?? []].join(', ')}.` : 'Your handwriting couldn’t be read.')
      bring(document.querySelector<HTMLElement>('[data-confirm-first]'))
    }
    if (phase === 'reviewing' && record) {
      revealedAt.current = performance.now()
      const score = test.score!
      announce(`${outcomeLabels[outcomeOf(record)]}, ${pointsLabel(pointsFor(record) ?? 0)}. Answer: ${answerKey.expected}. Score ${formatPoints(score.earned)} of ${score.possible}.`)
      bring(document.getElementById('test-next'))
    }
  })

  function check() {
    // A second tap or Enter that arrived with this question must not answer it before it's read.
    if (record || performance.now() - shownAt.current < 300) return
    flushSync(() => test.submit())
  }
  function showHint() {
    const shown = active.hints
    if (shown >= hints.length) return
    flushSync(() => {
      test.showHint()
      // A pick that a hint takes away is undone.
      if (hints[shown].kind === 'narrow' && answer.kind === 'choice' && wrongOptions.slice(0, 2).includes(answer.choice)) test.setDraft({ kind: 'choice', choice: '' })
    })
    announce(`Hint: ${hints[shown].text}`)
    // The last hint replaces its button: focus moves to the hint itself.
    if (shown + 1 >= hints.length) document.querySelector<HTMLElement>('.test-hint:last-of-type')?.focus()
  }
  function compare() {
    flushSync(() => setComparing(true))
    stepAt.current = performance.now()
    bring(document.querySelector<HTMLElement>('[data-confirm-first]'))
  }
  function next() {
    // A double tap or a held Enter must not skip past the answer just revealed.
    if (performance.now() - revealedAt.current < 300) return
    flushSync(() => test.next())
    if (last) { focusById('test-results-title'); return }
    window.scrollTo({ top: 0 })
    announce(`Question ${position + 1} of ${active.questions.length}`)
    focusQuestion()
  }
  const checkLabel = blank ? 'Show answer' : 'Check answer'
  const solution = <type.Solution item={item} question={question} answerKey={answerKey} />
  const showSolution = phase === 'reviewing' || (phase === 'confirming' && (type.answer === 'text' || comparing))

  // A held key repeats into whatever button the last one revealed: only a fresh press counts.
  return <article className="study-card test-card" aria-label="Test question" data-testid="test-question" data-type={type.id} data-phase={phase}
    onKeyDown={event => { if (event.repeat && (event.target as HTMLElement).closest('button')) event.preventDefault() }}>
    <div className="card-kicker flex items-center justify-between gap-3"><span>{type.label.toUpperCase()}</span><span className="tiny-dot" /></div>
    <div className="test-prompt" id={promptId} tabIndex={-1} data-test-prompt><type.Prompt item={item} question={question} answer={answer} /></div>
    <HintArea hints={hints} shown={record ? record.hints : active.hints} open={phase === 'answering'} onShow={showHint} />
    {answer.kind === 'text' && (record
      ? <div className="typed-answer"><p className="test-label">Your answer</p><p className={`typed-text ${blank ? 'blank' : ''}`} data-testid="your-answer">{blank ? 'Left blank' : answer.text}</p></div>
      : <form className="test-form" onSubmit={event => { event.preventDefault(); check() }}>
        <label className="test-label" htmlFor="test-answer">{type.fieldLabel ?? type.instruction}</label>
        <input id="test-answer" className="test-input" value={answer.text} placeholder={type.instruction} aria-describedby={promptId}
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} enterKeyHint="done" maxLength={200}
          onChange={event => test.setDraft({ kind: 'text', text: event.target.value })}
          // Enter held down on Next or Start keeps repeating into this new field.
          onKeyDown={event => { if (event.key === 'Enter' && event.repeat) event.preventDefault() }} />
        <button type="submit" className="test-check">{checkLabel}</button>
      </form>)}
    {answer.kind === 'choice' && <ChoiceField options={options} removed={removed} picked={answer.choice} expected={answerKey.expected} answered={!!record}
      label={type.instruction} describedBy={promptId} checkLabel={checkLabel} onPick={choice => test.setDraft({ kind: 'choice', choice })} onCheck={check} />}
    {answer.kind === 'ink' && <WritingPad readOnly={!!record} initialStrokes={answer.strokes} hint={type.instruction}
      onChange={(strokes, aspect) => test.setDraft({ kind: 'ink', strokes, aspect })}>
      {!record && <button className="reveal-word" onClick={check}>{blank ? <Eye size={18} /> : <Check size={18} />}{checkLabel}</button>}
    </WritingPad>}
    {phase === 'checking' && <p className="test-status" id="test-status" tabIndex={-1} data-testid="test-status"><LoaderCircle size={16} className="spin" aria-hidden="true" />Reading your handwriting…</p>}
    {showSolution && solution}
    {answer.kind === 'ink' && record && phase === 'reviewing' && <Reading record={record} />}
    {phase === 'confirming' && record?.auto && (type.answer === 'text'
      ? <Choice question={`${doubts[record.auto.reason ?? ''] ?? 'Not sure about this one.'} Does your answer mean the same?`} yes="Yes, count it" no="No" onDecide={deliberate(verdict => test.decide(verdict))} />
      : comparing
        ? <Choice question="Compare it with your writing. Is this what you wrote?" yes="Yes, I wrote this" no="No, something else" onDecide={deliberate(verdict => test.decide(verdict))} />
        : <ConfirmReading evaluation={record.auto} onPick={deliberate(reading => test.correct(reading))} onRetry={deliberate(() => test.recheck())} onCompare={deliberate(compare)} />)}
    {phase === 'reviewing' && record && <div className="test-review" data-testid="test-review">
      <ResultLine record={record} kind={answer.kind} />
      <WordNotes item={item} forms={forms} speaker={speaker} />
      <button className="test-play" onClick={() => speech.speak(type.speech!(item, question), 'normal')} disabled={!speech.supported}><Volume2 size={17} />Hear it</button>
      {speech.error && <p className="detail-note">{speech.error}</p>}
      <Override record={record} kind={answer.kind} answerKey={answerKey} onCorrect={reading => test.correct(reading)} onDecide={verdict => test.decide(verdict)} onUndo={() => test.undecide()} />
      <button id="test-next" className="primary-button test-next" onClick={next} onKeyDown={event => { if (event.repeat) event.preventDefault() }}>
        {last ? 'See results' : 'Next question'}<ArrowRight size={18} />
      </button>
    </div>}
  </article>
}

function ResultRow({ question, record, difficult, onToggle }: { question: TestQuestion; record: AnswerRecord; difficult: boolean; onToggle: () => void }) {
  const item = cardById.get(question.itemId)!
  const type: QuestionType = questionTypeById.get(question.type)!
  const outcome = outcomeOf(record)
  const points = pointsFor(record)
  const { answer, auto } = record
  const blank = auto?.by === 'blank'
  const read = record.corrected ?? auto?.read
  return <li className="test-row" data-testid="test-row" data-outcome={outcome}>
    {answer.kind === 'ink' && !blank && answer.strokes.length > 0 && <InkPreview strokes={answer.strokes} aspect={answer.aspect} label={`Your handwriting for ${item.meaning}`} />}
    <div className="test-row-main">
      <p className="test-row-word"><span lang="ko">{item.korean}</span><span>{item.meaning}</span></p>
      <p className="test-row-meta">
        <span>{type.shortLabel}</span>
        <span className={`test-row-verdict ${outcome}`}>{outcomeLabels[outcome]}{points !== undefined && ` · ${pointsLabel(points)}`}</span>
        {blank ? <span>{blankLabels[answer.kind]}</span>
          : answer.kind === 'text' ? <span>You wrote “{answer.text}”</span>
          : answer.kind === 'choice' ? <span>You chose “<span lang="ko">{answer.choice}</span>”</span>
            : read && <span>{record.corrected !== undefined ? 'You wrote' : 'Read as'} <span lang="ko">{read}</span></span>}
        {record.hints > 0 && <span>{record.hints} {record.hints === 1 ? 'hint' : 'hints'}</span>}
        {record.self && record.corrected === undefined && <span>your call</span>}
      </p>
    </div>
    <button className="test-row-star" aria-label={`Mark ${item.korean} as difficult`} aria-pressed={difficult} onClick={onToggle}>
      <Star size={18} fill={difficult ? 'currentColor' : 'none'} />
    </button>
  </li>
}

function TestResults({ test, progress, poolInfo, poolLabel, onSetStatus, announce, usable, onStart, onRetake }: Props & { usable: VocabularyItem[]; onStart: () => void; onRetake: () => void }) {
  // The pressed button disappears once used, so focus returns to the results heading.
  function setMarks(ids: string[], status: 'difficult' | 'known', message: string) {
    flushSync(() => onSetStatus(ids, status))
    announce(message)
    focusById('test-results-title')
  }
  const active = test.test!
  const score = test.score!
  const answered = active.questions.filter(question => active.answers[question.id])
  const outcomes = answered.map(question => outcomeOf(active.answers[question.id]))
  const endedEarly = answered.length < active.questions.length
  const ids = (...wanted: Outcome[]) => [...new Set(answered.filter((_, index) => wanted.includes(outcomes[index])).map(question => question.itemId))]
  // From the Difficult pile the useful step is the opposite one: take words recalled without help off it.
  const fromDifficult = active.pool.filter === 'difficult'
  const toDifficult = fromDifficult ? [] : ids('incorrect').filter(id => progress[id] !== 'difficult')
  const toKnown = fromDifficult ? ids('correct').filter(id => progress[id] === 'difficult') : []
  const total = `${formatPoints(score.earned)} of ${score.possible} ${score.possible === 1 ? 'point' : 'points'}`
  // A review asks the cards due today: it ends with Review again, not with a retake.
  const review = !!active.pool.review
  const kind = review ? 'Review' : 'Test'
  useEffect(() => { announce(`${kind} ${endedEarly ? 'ended' : 'complete'}. ${total}, ${score.percent}%.`) }, [])
  // What this test asked, and what a new test would ask: they differ once the learner changes the selection.
  const asked = [...new Set(active.questions.map(question => question.itemId))].map(id => cardById.get(id)!)
  const [one, many] = nounsFor(asked)
  const plural = (count: number) => `${count} ${count === 1 ? one : many}`

  return <section className="study-card test-card" aria-labelledby="test-results-title" data-testid="test-results">
    <div className="card-kicker flex items-center justify-between gap-3"><span>RESULTS</span><span className="tiny-dot" /></div>
    <h2 id="test-results-title" tabIndex={-1} className="test-title">{kind} {endedEarly ? 'ended' : 'complete'}</h2>
    <p className="test-score" data-testid="test-score"><strong>{formatPoints(score.earned)}</strong> / {score.possible} {score.possible === 1 ? 'point' : 'points'}<span className="test-percent">{score.percent}%</span></p>
    <ul className="test-breakdown" aria-label="Breakdown" data-testid="test-breakdown">
      <li className="correct"><strong>{score.correct}</strong> correct</li>
      <li className="hinted"><strong>{score.hinted}</strong> with a hint</li>
      <li className="incorrect"><strong>{score.incorrect}</strong> incorrect</li>
      {score.pending > 0 && <li><strong>{score.pending}</strong> not graded</li>}
    </ul>
    {endedEarly && <p className="test-lead">You answered {answered.length} of {active.questions.length} questions.</p>}
    {review ? <div className="test-actions">
      <button className="primary-button" onClick={() => { flushSync(() => test.reset()); focusById('due-title') }}>Back to Review<ArrowRight size={17} /></button>
    </div> : <div className="test-actions">
      <button className="primary-button" onClick={onRetake}><RotateCcw size={17} />Retake test</button>
      <button className="secondary-button" disabled={!usable.length} onClick={onStart}>New test<ArrowRight size={17} /></button>
      <button className="test-link" onClick={() => { flushSync(() => test.reset()); focusById('test-setup-title') }}>Change settings</button>
    </div>}
    <p className="test-next-pool">{review ? 'Each card comes back when it’s due: tomorrow if you missed it, a little later each time you knew it.'
      : <>Retake asks the same {plural(asked.length)} again in a new order. {usable.length ? `New tests use ${poolLabel} · ${countOf(poolInfo.category, usable.length)}.` : `Nothing in ${poolLabel} for a new test. Pick another collection or category.`}</>}</p>
    {toDifficult.length > 0 && <button className="test-bulk" onClick={() => setMarks(toDifficult, 'difficult', `Added ${plural(toDifficult.length)} to Difficult`)}>
      <Star size={16} />Add {toDifficult.length} incorrect {toDifficult.length === 1 ? one : many} to Difficult</button>}
    {toKnown.length > 0 && <button className="test-bulk known" onClick={() => setMarks(toKnown, 'known', `Marked ${plural(toKnown.length)} as known`)}>
      <Check size={16} />Mark {toKnown.length} correct without hints as Known</button>}
    <ul className="test-review-list" aria-label="Your answers">
      {answered.map(question => <ResultRow key={question.id} question={question} record={active.answers[question.id]} difficult={progress[question.itemId] === 'difficult'}
        onToggle={() => onSetStatus([question.itemId], progress[question.itemId] === 'difficult' ? null : 'difficult')} />)}
    </ul>
  </section>
}
