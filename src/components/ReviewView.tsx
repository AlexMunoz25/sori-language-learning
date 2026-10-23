import { useMemo } from 'react'
import { flushSync } from 'react-dom'
import { ArrowRight, BookOpen, ClipboardCheck, Layers } from 'lucide-react'
import { cardById, countOf, nounsFor, sectionInfo, sections } from '../data/cards'
import { useReview } from '../hooks/useReview'
import { eligible, type StudySession } from '../hooks/useStudySession'
import type { TestPool, TestSession } from '../hooks/useTestSession'
import { addDays } from '../recall/review'
import { formatPoints } from '../recall/scoring'
import type { Section } from '../types/vocabulary'
import { focusQuestion, TestView } from './TestView'

/** A review asks at most this many cards; the rest wait for the next one. */
export const reviewSize = 20
const poolLabel = ({ category, filter, review }: TestPool) => review ? 'Due today' : filter === 'difficult' ? `Difficult · ${category}` : category
const weekday = new Intl.DateTimeFormat('en', { weekday: 'long' })
const date = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' })
/** “tomorrow”, “on Friday”, “on 14 Oct”. */
function when(day: string, today: string) {
  if (day === addDays(today, 1)) return 'tomorrow'
  const [year, month, dayOfMonth] = day.split('-').map(Number)
  const at = new Date(year, month - 1, dayOfMonth)
  return day <= addDays(today, 6) ? `on ${weekday.format(at)}` : `on ${date.format(at)}`
}

/** Review: the cards due today, any test you like, and the Difficult pile. A running test or review takes the whole screen. */
export function ReviewView({ session, test, announce, onChoose }: { session: StudySession; test: TestSession; announce: (message: string) => void; onChoose: () => void }) {
  const review = useReview()
  const pool = useMemo(() => eligible(session.category, session.filter, session.progress).map(id => cardById.get(id)!), [session.category, session.filter, session.progress])
  const info: TestPool = { category: session.category, filter: session.filter }
  const running = test.phase !== 'setup' && test.phase !== 'complete'

  function begin(start: () => number) {
    let count = 0
    flushSync(() => { count = start() })
    if (!count) return
    window.scrollTo({ top: 0 })
    announce(`Question 1 of ${count}`)
    focusQuestion()
  }
  const startReview = () => {
    const cards = review.due.slice(0, reviewSize).map(id => cardById.get(id)!)
    begin(() => test.startWith(cards, { category: sectionInfo.vocabulary.all, filter: 'all', review: true }, test.rulesFor(cards)))
  }
  const testDifficult = (section: Section) => {
    const all = sectionInfo[section].all
    session.select(all, 'difficult')
    begin(() => test.start(eligible(all, 'difficult', session.progress).map(id => cardById.get(id)!), { category: all, filter: 'difficult' }))
  }

  const view = <TestView test={test} pool={pool} poolInfo={info} poolLabel={poolLabel(info)} progress={session.progress} difficultCount={session.difficultCount}
    onSelect={(category, filter) => session.select(category, filter)} onChoose={onChoose} onSetStatus={session.setStatus} announce={announce} />

  if (test.phase !== 'setup' && test.test) {
    const active = test.test
    const answered = Object.keys(active.answers).length
    const total = active.questions.length
    return <>
      <div className="deck-toolbar flex items-center justify-between gap-3">
        <span className="test-pool flex items-center gap-2"><Layers size={17} /><span>{poolLabel(active.pool)}</span></span>
        {running ? <div className="flex items-center gap-1"><span className="deck-count" data-testid="test-count">Question {active.current + 1} of {total}</span>
          <span className="running-score" data-testid="running-score" aria-label={`Score: ${formatPoints(test.score!.earned)} of ${test.score!.possible} points`}>{formatPoints(test.score!.earned)}<span>/{test.score!.possible} pts</span></span>
          <button className="end-test" onClick={() => {
            // The button disappears with the test, so focus moves to what replaces it.
            flushSync(() => test.end())
            announce(answered ? `${active.pool.review ? 'Review' : 'Test'} ended` : 'Test cancelled')
            document.getElementById(answered ? 'test-results-title' : active.pool.review ? 'due-title' : 'test-setup-title')?.focus()
          }}>End {active.pool.review ? 'review' : 'test'}</button></div>
          : <span className="deck-count">{countOf(active.pool.review ? sectionInfo.vocabulary.all : active.pool.category, total)}</span>}
      </div>
      <div className="deck-progress" role="progressbar" aria-label="Test progress" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={total || 1}
        aria-valuetext={running ? `Question ${active.current + 1} of ${total}` : `${answered} answered`}><span style={{ width: `${total ? answered / total * 100 : 0}%` }} /></div>
      {view}
    </>
  }

  const due = review.due.map(id => cardById.get(id)!)
  const [one, many] = nounsFor(due)
  const difficult = sections.map(({ id, all }) => ({ id, all, count: eligible(all, 'difficult', session.progress).length })).filter(({ count }) => count)
  return <>
    {due.length ? <section className="study-card review-panel" aria-labelledby="due-title" data-testid="due-panel">
      <div className="card-kicker flex items-center justify-between gap-3"><span>DUE TODAY</span><span className="tiny-dot" /></div>
      <h2 id="due-title" tabIndex={-1} className="test-title">{due.length} {due.length === 1 ? one : many} to review</h2>
      <p className="test-lead">Each comes back just before you’d forget it.{due.length > reviewSize ? ` ${reviewSize} at a time.` : ''}</p>
      <p className="due-preview" data-testid="due-preview">{due.slice(0, 8).map(item => <span key={item.id} lang="ko">{item.korean}</span>)}{due.length > 8 && <span>…</span>}</p>
      <button className="primary-button" onClick={startReview}>Start review<ArrowRight size={18} /></button>
    </section>
    // Nothing due: one quiet line, so the test builder below stays in view.
      : <section className="review-caught-up" aria-labelledby="due-title" data-testid="due-panel">
        <h2 id="due-title" tabIndex={-1}>All caught up</h2>
        <p>{review.next ? `Next review ${when(review.next, review.today)}.` : 'Cards you meet in Learn, test, or mark Difficult come back here when they’re due.'}</p>
      </section>}
    {view}
    <section className="study-card review-panel" aria-labelledby="difficult-title" data-testid="difficult-panel">
      <div className="card-kicker flex items-center justify-between gap-3"><span>DIFFICULT</span><span className="tiny-dot" /></div>
      <h2 id="difficult-title" className="test-title">Your practice pile</h2>
      {difficult.length ? <ul className="difficult-list">{difficult.map(({ id, all, count }) => <li key={id}>
        <span className="difficult-count">{countOf(all, count)}</span>
        <button className="secondary-button" aria-label={`Study difficult ${sectionInfo[id].label.toLowerCase()}`} onClick={() => { session.select(all, 'difficult'); session.go('library') }}><BookOpen size={16} />Study</button>
        <button className="secondary-button" aria-label={`Test difficult ${sectionInfo[id].label.toLowerCase()}`} onClick={() => testDifficult(id)}><ClipboardCheck size={16} />Test</button>
      </li>)}</ul> : <p className="test-lead">Tap Difficult on any card: it joins this pile and comes back in today’s review.</p>}
    </section>
  </>
}
