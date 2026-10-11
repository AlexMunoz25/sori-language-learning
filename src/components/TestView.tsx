import { useEffect, useMemo, useRef } from 'react'
import { flushSync } from 'react-dom'
import { ArrowRight, Check, Eye, Star, Volume2, X } from 'lucide-react'
import { vocabularyById } from '../data/vocabulary'
import type { TestPool, TestSession } from '../hooks/useTestSession'
import { useSpeech } from '../hooks/useSpeech'
import { emptyAnswer, isBlank, verdictOf } from '../recall/answers'
import { capacity } from '../recall/generate'
import type { Answer, AnswerRecord, TestQuestion } from '../recall/types'
import type { Progress, VocabularyItem, WordStatus } from '../types/vocabulary'
import { EmptyCollection } from './EmptyCollection'
import { questionTypeById, questionTypes } from './testTypes'
import { WordNotes } from './WordNotes'
import { WritingPad } from './WritingPad'

/** Moves focus to where the next step happens. Called right after a synchronous render, so the text field also opens the phone keyboard. */
function focusStep() {
  const target = document.getElementById('test-answer') ?? document.querySelector<HTMLElement>('[data-test-prompt]')
  target?.focus({ preventScroll: true })
}
const focusById = (id: string) => document.getElementById(id)?.focus()

interface Props {
  test: TestSession
  /** Words in the current collection and category. */
  pool: VocabularyItem[]
  poolInfo: TestPool
  poolLabel: string
  progress: Progress
  difficultCount: number
  onSelect: (category: string, filter: 'all' | 'difficult') => void
  onSetStatus: (ids: string[], status: WordStatus | null) => void
  announce: (message: string) => void
}

/** Testing evaluates recall: questions without hints, an answer you check yourself, and results that feed the Difficult pile. */
export function TestView(props: Props) {
  const { test, pool, poolInfo, announce } = props
  const { disabledTypes } = test.preferences
  // How many questions this pool can really give (one type enabled: look-alikes sharing a prompt count once).
  const { usable, questionCount } = useMemo(() => {
    const usable = pool.filter(item => test.enabledRules.some(rule => rule.supports(item)))
    return { usable, questionCount: capacity(usable, test.enabledRules) }
  }, [pool, disabledTypes])
  function begin() {
    let count = 0
    flushSync(() => { count = test.start(usable, poolInfo) })
    if (!count) return
    window.scrollTo({ top: 0 })
    announce(`Question 1 of ${count}`)
    focusStep()
  }
  if (test.phase === 'setup') return <TestSetup {...props} usable={usable} questionCount={questionCount} onStart={begin} />
  if (test.phase === 'complete') return <TestResults {...props} usable={usable} onStart={begin} />
  return <QuestionCard key={test.question!.id} test={test} announce={announce} />
}

function TestSetup({ test, pool, poolLabel, difficultCount, onSelect, usable, questionCount, onStart }: Props & { usable: VocabularyItem[]; questionCount: number; onStart: () => void }) {
  if (!pool.length) return <EmptyCollection difficultCount={difficultCount} onSelect={onSelect} />
  const sizes = ([10, 20] as const).filter(size => size < questionCount)
  const length = test.preferences.length !== 'all' && sizes.some(size => size === test.preferences.length) ? test.preferences.length : 'all'
  const enabled = new Set(test.enabledRules.map(rule => rule.id))
  return <section className="study-card test-card" aria-labelledby="test-setup-title">
    <div className="card-kicker flex items-center justify-between gap-3"><span>TEST YOUR RECALL</span><span className="tiny-dot" /></div>
    <h2 id="test-setup-title" tabIndex={-1} className="test-title">How much do you remember?</h2>
    <p className="test-lead">No hints or anchors: answer, then check yourself.</p>
    <p className="test-pool-line" data-testid="test-pool">{poolLabel} · {usable.length} {usable.length === 1 ? 'word' : 'words'}</p>
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
        {questionTypes.map(type => {
          const on = enabled.has(type.id)
          return <button key={type.id} className="test-type" aria-pressed={on} disabled={on && enabled.size === 1}
            title={on && enabled.size === 1 ? 'At least one question type stays on' : undefined} onClick={() => test.toggleType(type.id)}>
            <span className="test-type-check" aria-hidden="true">{on && <Check size={14} strokeWidth={2.4} />}</span>
            <span><strong>{type.label}</strong><span>{type.instruction}</span></span>
          </button>
        })}
      </div>
    </div>
    <button className="primary-button test-start" disabled={!usable.length} onClick={onStart}>Start test<ArrowRight size={18} /></button>
  </section>
}

function QuestionCard({ test, announce }: { test: TestSession; announce: (message: string) => void }) {
  const active = test.test!
  const question = test.question!
  const type = questionTypeById.get(question.type)!
  const item = vocabularyById.get(question.itemId)!
  const record = test.record
  const answer: Answer = record?.answer ?? active.draft ?? emptyAnswer(type.answer)
  // A reviewed answer remembers whether it was blank; restored handwriting from earlier questions isn't kept.
  const blank = record ? record.auto?.by === 'blank' : isBlank(answer)
  const answerKey = type.answerKey(item)
  const verdict = verdictOf(record)
  const position = active.current + 1
  const last = position >= active.questions.length
  const promptId = `${question.id}-prompt`
  const speech = useSpeech()
  const { cancel } = speech
  useEffect(() => () => cancel(), [cancel])
  const shownAt = useRef(performance.now())
  const revealedAt = useRef(0)
  const { forms = true, speaker = true } = type.notes ?? {}

  function check() {
    // A second tap or Enter that arrived with this question must not answer it before it's read.
    if (record || performance.now() - shownAt.current < 300) return
    flushSync(() => test.submit())
    revealedAt.current = performance.now()
    const others = answerKey.alternatives.map(alternative => alternative.text)
    announce(`Answer: ${answerKey.expected}.${others.length ? ` Also correct: ${others.join(', ')}.` : ''} Did you remember it?`)
    const next = document.getElementById('test-next')
    next?.focus({ preventScroll: true })
    // On a phone the self-check and Next sit below the answer: bring them up while keeping the answer in view.
    next?.scrollIntoView({ block: 'nearest' })
  }
  function next() {
    // A double tap or a held Enter must not skip past the answer just revealed.
    if (performance.now() - revealedAt.current < 300) return
    flushSync(() => test.next())
    if (last) { document.getElementById('test-results-title')?.focus(); return }
    window.scrollTo({ top: 0 })
    announce(`Question ${position + 1} of ${active.questions.length}`)
    focusStep()
  }
  const checkLabel = blank ? 'Show answer' : 'Check answer'

  return <article className="study-card test-card" aria-label="Test question" data-testid="test-question" data-type={type.id}>
    <div className="card-kicker flex items-center justify-between gap-3"><span>{type.label.toUpperCase()}</span><span className="tiny-dot" /></div>
    <div className="test-prompt" id={promptId} tabIndex={-1} data-test-prompt><type.Prompt item={item} question={question} /></div>
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
    {answer.kind === 'ink' && <WritingPad readOnly={!!record} initialStrokes={answer.strokes} hint={type.instruction}
      onChange={strokes => test.setDraft({ kind: 'ink', strokes })}>
      {!record && <button className="reveal-word" onClick={check}>{blank ? <Eye size={18} /> : <Check size={18} />}{checkLabel}</button>}
    </WritingPad>}
    {record && <div className="test-review" data-testid="test-review">
      <type.Solution item={item} question={question} answerKey={answerKey} />
      <WordNotes item={item} forms={forms} speaker={speaker} />
      <button className="test-play" onClick={() => speech.speak(item.korean, 'normal')} disabled={!speech.supported}><Volume2 size={17} />Hear it</button>
      {speech.error && <p className="detail-note">{speech.error}</p>}
      <div className="self-check">
        <p id={`${question.id}-self`}>Did you remember it?</p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby={`${question.id}-self`}>
          <button className={`mark-button known ${verdict === 'correct' ? 'active' : ''}`} aria-pressed={verdict === 'correct'} onClick={() => test.judge('correct')}><Check size={18} />Remembered</button>
          <button className={`mark-button difficult ${verdict === 'incorrect' ? 'active' : ''}`} aria-pressed={verdict === 'incorrect'} onClick={() => test.judge('incorrect')}><X size={18} />Forgot</button>
        </div>
      </div>
      <button id="test-next" className="primary-button test-next" onClick={next} onKeyDown={event => { if (event.repeat) event.preventDefault() }}>
        {last ? 'See results' : 'Next question'}<ArrowRight size={18} />
      </button>
    </div>}
  </article>
}

function ResultRow({ question, record, difficult, onToggle }: { question: TestQuestion; record: AnswerRecord; difficult: boolean; onToggle: () => void }) {
  const item = vocabularyById.get(question.itemId)!
  const type = questionTypeById.get(question.type)!
  const verdict = verdictOf(record)
  const blank = record.auto?.by === 'blank'
  return <li className="test-row" data-testid="test-row">
    <div className="test-row-main">
      <p className="test-row-word"><span lang="ko">{item.korean}</span><span>{item.meaning}</span></p>
      <p className="test-row-meta">
        <span>{type.shortLabel}</span>
        <span className={`test-row-verdict ${verdict ?? 'unchecked'}`}>{verdict === 'correct' ? 'Remembered' : verdict === 'incorrect' ? 'Forgot' : 'Not checked'}</span>
        {blank ? <span>Left blank</span> : record.answer.kind === 'text' && <span>You wrote “{record.answer.text}”</span>}
      </p>
    </div>
    <button className="test-row-star" aria-label={`Mark ${item.korean} as difficult`} aria-pressed={difficult} onClick={onToggle}>
      <Star size={18} fill={difficult ? 'currentColor' : 'none'} />
    </button>
  </li>
}

function TestResults({ test, progress, poolLabel, onSetStatus, announce, usable, onStart }: Props & { usable: VocabularyItem[]; onStart: () => void }) {
  // The pressed button disappears once used, so focus returns to the results heading.
  function setMarks(ids: string[], status: 'difficult' | 'known', message: string) {
    flushSync(() => onSetStatus(ids, status))
    announce(message)
    focusById('test-results-title')
  }
  const active = test.test!
  const answered = active.questions.filter(question => active.answers[question.id])
  const verdicts = answered.map(question => verdictOf(active.answers[question.id]))
  const remembered = verdicts.filter(verdict => verdict === 'correct').length
  const unchecked = verdicts.filter(verdict => !verdict).length
  const endedEarly = answered.length < active.questions.length
  const ids = (wanted: 'correct' | 'incorrect') => [...new Set(answered.filter((_, index) => verdicts[index] === wanted).map(question => question.itemId))]
  // From the Difficult pile the useful step is the opposite one: take remembered words off it.
  const fromDifficult = active.pool.filter === 'difficult'
  const toDifficult = fromDifficult ? [] : ids('incorrect').filter(id => progress[id] !== 'difficult')
  const toKnown = fromDifficult ? ids('correct').filter(id => progress[id] === 'difficult') : []
  const summary = `${remembered} of ${answered.length} remembered${unchecked ? ` · ${unchecked} not checked` : ''}`
  useEffect(() => { announce(`Test ${endedEarly ? 'ended' : 'complete'}. ${summary}`) }, [])
  const plural = (count: number) => `${count} ${count === 1 ? 'word' : 'words'}`

  return <section className="study-card test-card" aria-labelledby="test-results-title" data-testid="test-results">
    <div className="card-kicker flex items-center justify-between gap-3"><span>RESULTS</span><span className="tiny-dot" /></div>
    <h2 id="test-results-title" tabIndex={-1} className="test-title">{endedEarly ? 'Test ended' : 'Test complete'}</h2>
    <p className="test-score" data-testid="test-score">{summary}</p>
    {endedEarly && <p className="test-lead">You answered {answered.length} of {active.questions.length} questions.</p>}
    <div className="test-actions">
      <button className="primary-button" disabled={!usable.length} onClick={onStart}>New test<ArrowRight size={18} /></button>
      <button className="test-link" onClick={() => { flushSync(() => test.reset()); focusById('test-setup-title') }}>Change settings</button>
    </div>
    <p className="test-next-pool">{usable.length ? `New tests use ${poolLabel} · ${plural(usable.length)}` : `No words in ${poolLabel}. Pick another collection or category.`}</p>
    {toDifficult.length > 0 && <button className="test-bulk" onClick={() => setMarks(toDifficult, 'difficult', `Added ${plural(toDifficult.length)} to Difficult`)}>
      <Star size={16} />Add {toDifficult.length} forgotten {toDifficult.length === 1 ? 'word' : 'words'} to Difficult</button>}
    {toKnown.length > 0 && <button className="test-bulk known" onClick={() => setMarks(toKnown, 'known', `Marked ${plural(toKnown.length)} as known`)}>
      <Check size={16} />Mark {toKnown.length} remembered as Known</button>}
    <ul className="test-review-list" aria-label="Your answers">
      {answered.map(question => <ResultRow key={question.id} question={question} record={active.answers[question.id]} difficult={progress[question.itemId] === 'difficult'}
        onToggle={() => onSetStatus([question.itemId], progress[question.itemId] === 'difficult' ? null : 'difficult')} />)}
    </ul>
  </section>
}
