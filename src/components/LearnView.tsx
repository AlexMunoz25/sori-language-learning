import { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, Check, Lightbulb, MessageSquareQuote, Ruler, Turtle, Volume2 } from 'lucide-react'
import { cardById, nounOf, nounsFor, sectionInfo, spokenText } from '../data/cards'
import { stepsOf, units, type LessonStep, type Unit } from '../data/units'
import { useAnchorChoice } from '../hooks/useAnchorChoice'
import { closeUnit, finishUnit, openUnit, setPractice, setStep, useLearn } from '../hooks/useLearn'
import { languageOptions, useLanguages } from '../hooks/useLanguages'
import { introduceCards } from '../hooks/useReview'
import { useSpeech } from '../hooks/useSpeech'
import type { TestSession } from '../hooks/useTestSession'
import { buildPractice } from '../recall/practice'
import { sentencesOf } from '../recall/questionRules'
import { outcomeOf } from '../recall/scoring'
import type { VocabularyItem } from '../types/vocabulary'
import { plainSentence, Sentence } from './GrammarContent'
import { KoreanWord } from './KoreanWord'
import { MemoryAnchor } from './MemoryAnchor'
import { outcomeLabels, QuestionCard } from './TestView'

const cardsOf = (unit: Unit) => unit.cards.map(id => cardById.get(id)!)
const focus = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus())

/** Learn: guided units. Each one meets a few cards at a time, practises them, and hands them to Review. */
export function LearnView({ practice, due, announce, onLanguages, onReview }: {
  practice: TestSession; due: number; announce: (message: string) => void; onLanguages: () => void; onReview: () => void
}) {
  const learn = useLearn()
  const unit = learn.open ? units.find(candidate => candidate.id === learn.open) : undefined
  if (unit) return <Lesson unit={unit} step={learn.units[unit.id]?.step ?? 0} practice={practice} announce={announce} />
  return <LearnHome due={due} onLanguages={onLanguages} onReview={onReview} />
}

function LearnHome({ due, onLanguages, onReview }: { due: number; onLanguages: () => void; onReview: () => void }) {
  const learn = useLearn()
  const languages = useLanguages()
  const next = units.findIndex(unit => !learn.units[unit.id]?.done)
  const spoken = languageOptions.filter(option => languages.includes(option.id)).map(option => option.label)
  return <>
    <section className="learn-intro" aria-labelledby="learn-title">
      <h2 id="learn-title" tabIndex={-1} className="test-title">Guided lessons</h2>
      <p className="test-lead">Hear each card, give it an anchor, see it at work, then recall and use it. Review brings it back just before you’d forget.</p>
      <p className="learn-languages">Anchors in {spoken.join(', ')} · <button className="test-link" aria-haspopup="dialog" onClick={onLanguages}>Change languages</button></p>
    </section>
    {/* Revisiting is part of learning: what's due comes first. */}
    {due > 0 && <button className="learn-due" data-testid="learn-due" onClick={onReview}>
      <span><strong>{due} due in Review</strong> Recall them before they fade</span><ArrowRight size={17} aria-hidden="true" /></button>}
    <ol className="unit-list" aria-label="Units">
      {units.map((unit, index) => {
        const progress = learn.units[unit.id]
        const status = progress?.done ? 'done' : progress?.step ? 'started' : 'new'
        const verb = status === 'done' ? 'Again' : status === 'started' ? 'Continue' : 'Start'
        const upNext = index === next
        const go = <button className={upNext ? 'primary-button' : 'secondary-button unit-go'} aria-label={`${verb} ${unit.title}`} onClick={() => { openUnit(unit.id); focus('lesson-title') }}>
          {verb}<ArrowRight size={17} /></button>
        return <li key={unit.id}>
          <article className={`unit-card ${status} ${upNext ? 'next' : ''}`} aria-labelledby={`unit-${unit.id}`} data-testid="unit-card">
            <div className="unit-head">
              <div>
                <p className="unit-number">Unit {index + 1}{status === 'done' && <span className="unit-done"><Check size={13} aria-hidden="true" />Done</span>}{upNext && status !== 'done' && <span className="unit-next">Up next</span>}</p>
                <h3 id={`unit-${unit.id}`} className="unit-title">{unit.title}</h3>
              </div>
              {!upNext && go}
            </div>
            <p className="unit-goal">{unit.goal}</p>
            <p className="unit-cards">{cardsOf(unit).map(item => <span key={item.id} lang="ko">{item.korean}</span>)}</p>
            {upNext && go}
          </article>
        </li>
      })}
    </ol>
  </>
}

function Lesson({ unit, step, practice, announce }: { unit: Unit; step: number; practice: TestSession; announce: (message: string) => void }) {
  const steps = stepsOf(unit)
  const current = steps[step] ?? steps[0]
  const meets = steps.filter(entry => entry.kind === 'meet').length
  function go(next: number) {
    setStep(unit.id, next)
    window.scrollTo({ top: 0 })
    const target = steps[next]
    announce(target.kind === 'meet' ? `Card ${target.position} of ${meets}` : target.kind === 'practice' ? 'Practice' : target.kind === 'done' ? 'Unit complete' : unit.title)
    focus('lesson-step-title')
  }
  return <>
    <div className="lesson-bar flex items-center justify-between gap-3">
      <button className="test-link lesson-leave" onClick={() => { closeUnit(); focus('learn-title') }}><ArrowLeft size={16} />Learn</button>
      <h2 id="lesson-title" tabIndex={-1} className="lesson-title">{unit.title}</h2>
      <span className="deck-count" data-testid="lesson-count">{Math.min(step + 1, steps.length)}<span> / {steps.length}</span></span>
    </div>
    <div className="deck-progress" role="progressbar" aria-label="Lesson progress" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={steps.length}>
      <span style={{ width: `${(step + 1) / steps.length * 100}%` }} /></div>
    <LessonStepView key={`${unit.id}:${step}`} unit={unit} step={current} index={step} meets={meets} practice={practice} announce={announce} onNext={() => go(step + 1)} />
  </>
}

function LessonStepView({ unit, step, index, meets, practice, announce, onNext }: {
  unit: Unit; step: LessonStep; index: number; meets: number; practice: TestSession; announce: (message: string) => void; onNext: () => void
}) {
  if (step.kind === 'intro') return <UnitIntro unit={unit} onNext={onNext} />
  if (step.kind === 'meet') return <MeetCard item={cardById.get(step.id)!} position={step.position} total={meets} onNext={onNext} />
  if (step.kind === 'practice') return <Practice ids={step.ids} lesson={unit.cards} practiceKey={`${unit.id}:${index}`} test={practice} announce={announce} onNext={onNext} />
  return <UnitDone unit={unit} />
}

function UnitIntro({ unit, onNext }: { unit: Unit; onNext: () => void }) {
  const items = cardsOf(unit)
  const [, plural] = nounsFor(items)
  return <section className="study-card lesson-card" aria-labelledby="lesson-step-title" data-testid="unit-intro">
    <div className="card-kicker flex items-center justify-between gap-3"><span>UNIT {units.indexOf(unit) + 1}</span><span className="tiny-dot" /></div>
    <h3 id="lesson-step-title" tabIndex={-1} className="test-title">{unit.goal}</h3>
    <p className="test-lead">You’ll meet {items.length} {plural === 'cards' ? 'cards' : plural}, a few at a time: hear each one, choose an anchor that makes it stick, see it in a sentence, then practise.</p>
    <ul className="lesson-preview">{items.map(item => <li key={item.id}><span lang="ko">{item.korean}</span><span>{item.meaning}</span></li>)}</ul>
    <button className="primary-button" onClick={onNext}>Start<ArrowRight size={18} /></button>
  </section>
}

/** Meet one card: hear it, choose an anchor, see it at work. Meaning shows from the start: this is learning, not testing. */
function MeetCard({ item, position, total, onNext }: { item: VocabularyItem; position: number; total: number; onNext: () => void }) {
  const speech = useSpeech()
  const anchor = useAnchorChoice(item)
  const { cancel } = speech
  useEffect(() => () => cancel(), [cancel])
  const sentence = sentencesOf(item)[0]
  return <article className="study-card lesson-card meet-card" aria-labelledby="lesson-step-title" data-testid="meet-card">
    <div className="card-kicker flex items-center justify-between gap-3"><span>{position} OF {total} · NEW {nounOf(item).toUpperCase()}</span><span className="tiny-dot" /></div>
    <div className="word-stage lesson-stage"><KoreanWord word={item.korean} /></div>
    <p className="lesson-reading" data-testid="pronunciation">{item.pronunciation}</p>
    <div className="audio-controls flex items-center justify-center gap-3">
      <button className={`audio-normal ${speech.playing === 'normal' ? 'playing' : ''}`} aria-label="Play pronunciation" onClick={() => speech.speak(spokenText(item), 'normal')} disabled={!speech.supported}>
        <Volume2 size={22} strokeWidth={1.7} /><span>Normal</span></button>
      <button className={`audio-slow ${speech.playing === 'slow' ? 'playing' : ''}`} aria-label="Play slowly" onClick={() => speech.speak(spokenText(item), 'slow')} disabled={!speech.supported}>
        <Turtle size={22} strokeWidth={1.6} /><span>Slow</span></button>
    </div>
    {speech.error && <p className="detail-note">{speech.error}</p>}
    <h3 id="lesson-step-title" tabIndex={-1} className="lesson-meaning" data-testid="meaning">{item.meaning}</h3>
    <section className="lesson-section anchor-section" aria-label="Make it stick">
      <p className="lesson-label"><Lightbulb size={15} aria-hidden="true" />Make it stick</p>
      <MemoryAnchor item={item} choice={anchor} />
    </section>
    {sentence && <section className="lesson-section" aria-label="In a sentence">
      <p className="lesson-label"><MessageSquareQuote size={15} aria-hidden="true" />In a sentence</p>
      <p className="grammar-sentence"><Sentence korean={sentence.korean} /></p>
      <p className="grammar-english">{sentence.english}</p>
      <button className="test-play" aria-label={`Play: ${plainSentence(sentence.korean)}`} onClick={() => speech.speak(plainSentence(sentence.korean), 'normal')} disabled={!speech.supported}><Volume2 size={17} />Hear it</button>
    </section>}
    {item.grammar && <section className="lesson-section" aria-label="How it attaches">
      <p className="lesson-label"><Ruler size={15} aria-hidden="true" />How it attaches</p>
      <dl className="grammar-forms">{item.grammar.forms.map(({ form, when }, index) => <div key={index}><dt lang="ko">{form}</dt><dd>{when}</dd></div>)}</dl>
    </section>}
    <button className="primary-button lesson-next" onClick={onNext}>{anchor.selected ? 'Continue' : 'Continue without an anchor'}<ArrowRight size={18} /></button>
  </article>
}

/** Recall the cards just met, then use them: graded like any test, logged for Review. */
function Practice({ ids, lesson, practiceKey, test, announce, onNext }: {
  ids: string[]; lesson: string[]; practiceKey: string; test: TestSession; announce: (message: string) => void; onNext: () => void
}) {
  const learn = useLearn()
  const started = useRef(false)
  const ours = learn.practice === practiceKey && !!test.test
  useEffect(() => {
    // Coming back to an unfinished practice resumes it; otherwise it starts fresh.
    if (ours || started.current) return
    started.current = true
    const cards = (list: string[]) => list.map(id => cardById.get(id)!)
    if (test.startQuestions(buildPractice(cards(ids), Math.random, cards(lesson)), { category: sectionInfo.vocabulary.all, filter: 'all' })) setPractice(practiceKey)
  }, [ours])
  if (!ours) return null
  if (test.phase === 'complete') return <PracticeDone test={test} onNext={() => { test.reset(); setPractice(undefined); onNext() }} />
  const active = test.test!
  return <>
    <p className="lesson-practice" data-testid="practice-count">Practice · {active.current + 1} of {active.questions.length}</p>
    <QuestionCard key={test.question!.id} test={test} announce={announce} />
  </>
}

function PracticeDone({ test, onNext }: { test: TestSession; onNext: () => void }) {
  const active = test.test!
  const score = test.score!
  const right = score.correct + score.hinted
  return <section className="study-card lesson-card" aria-labelledby="test-results-title" data-testid="practice-done">
    <div className="card-kicker flex items-center justify-between gap-3"><span>PRACTICE</span><span className="tiny-dot" /></div>
    <h3 id="test-results-title" tabIndex={-1} className="test-title">{right} of {score.possible} right</h3>
    <p className="test-lead">{score.incorrect ? 'The ones you missed come back in Review tomorrow; the rest a little later.' : 'All of them. Review will bring them back a little later, to keep them.'}</p>
    <ul className="test-review-list" aria-label="Your answers">
      {active.questions.map(question => {
        const item = cardById.get(question.itemId)!
        const outcome = outcomeOf(active.answers[question.id])
        return <li key={question.id} className="test-row" data-outcome={outcome}><div className="test-row-main">
          <p className="test-row-word"><span lang="ko">{item.korean}</span><span>{item.meaning}</span></p>
          <p className="test-row-meta"><span className={`test-row-verdict ${outcome}`}>{outcomeLabels[outcome]}</span></p>
        </div></li>
      })}
    </ul>
    <button className="primary-button" onClick={onNext}>Continue<ArrowRight size={18} /></button>
  </section>
}

function UnitDone({ unit }: { unit: Unit }) {
  const items = cardsOf(unit)
  const [one, many] = nounsFor(items)
  const index = units.indexOf(unit)
  const following = units[index + 1]
  // Finishing hands the unit's cards to Review: first review tomorrow, unless Review already has them.
  useEffect(() => { introduceCards(unit.cards); finishUnit(unit.id) }, [unit.id])
  return <section className="study-card lesson-card" aria-labelledby="lesson-step-title" data-testid="unit-done">
    <div className="card-kicker flex items-center justify-between gap-3"><span>UNIT {index + 1} COMPLETE</span><span className="tiny-dot" /></div>
    <h3 id="lesson-step-title" tabIndex={-1} className="test-title">Nicely done</h3>
    <p className="test-lead">You met {items.length} {items.length === 1 ? one : many}. They’re in Review now, and the first review is tomorrow.</p>
    <p className="unit-cards">{items.map(item => <span key={item.id} lang="ko">{item.korean}</span>)}</p>
    <div className="test-actions">
      {following && <button className="primary-button" onClick={() => { openUnit(following.id); focus('lesson-title') }}>Next: {following.title}<ArrowRight size={18} /></button>}
      <button className={following ? 'secondary-button' : 'primary-button'} onClick={() => { closeUnit(); focus('learn-title') }}>Back to Learn</button>
    </div>
  </section>
}
