import { useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { ArrowLeft, ArrowRight, AudioLines, BookOpen, Check, ChevronDown, ClipboardCheck, Download, Headphones, HelpCircle, Layers, Leaf, Lightbulb, Shuffle, Star } from 'lucide-react'
import { CategorySelector } from './components/CategorySelector'
import { EmptyCollection } from './components/EmptyCollection'
import { Modal } from './components/Modal'
import { StudyCard } from './components/StudyCard'
import { TestView } from './components/TestView'
import { vocabulary, vocabularyById } from './data/vocabulary'
import { anchorFeedback } from './hooks/useAnchorChoice'
import { eligible, useStudySession, type StudyFilter } from './hooks/useStudySession'
import { useTestSession } from './hooks/useTestSession'

const poolLabel = ({ category, filter }: { category: string; filter: StudyFilter }) => filter === 'difficult' ? `Difficult · ${category}` : category
/** Korean inside an announcement is marked as Korean, so screen readers switch voice for it. */
const spoken = (text: string) => text.split(/([가-힣]+(?:\s+[가-힣]+)*\??)/).map((part, index) => index % 2 ? <span key={index} lang="ko">{part}</span> : part)

function downloadAnchorFeedback() {
  const feedback = anchorFeedback(vocabulary)
  const url = URL.createObjectURL(new Blob([JSON.stringify(feedback, null, 2)], { type: 'application/json' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: `sori-anchor-feedback-${feedback.exportedAt.slice(0, 10)}.json` })
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function App() {
  const session = useStudySession()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  // Learn opens this card (same word, same position) in Standard mode with its Memory Anchor showing.
  const [learning, setLearning] = useState<{ id: string; revision: number }>()
  const { item, mode, total, index, filter } = session
  const test = useTestSession()
  const testing = mode === 'test'
  // While a test runs, nothing may change the words it draws from or move the hidden deck.
  const testRunning = testing && (test.phase === 'answering' || test.phase === 'reviewing')
  const pool = useMemo(() => eligible(session.category, filter, session.progress).map(id => vocabularyById.get(id)!), [session.category, filter, session.progress])
  const feedback = guideOpen ? anchorFeedback(vocabulary).summary : undefined
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (testing || categoryOpen || guideOpen || event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); session.navigate(event.key === 'ArrowRight' ? 1 : -1) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [testing, categoryOpen, guideOpen, session.navigate])
  useEffect(() => { if (!testing) setAnnouncement(total ? `Card ${index + 1} of ${total}` : 'No words in this selection') }, [index, total, item?.id, testing])
  const answeredCount = Object.keys(test.test?.answers ?? {}).length
  const questionCount = test.test?.questions.length ?? 0

  return <div className="app-shell">
    <header className="app-header flex items-center justify-between">
      <a className="brand flex items-center gap-2.5" href="/" aria-label="Sori home"><span className="brand-mark"><AudioLines size={23} strokeWidth={1.7} /></span><span>sori<span className="brand-period">.</span></span></a>
      <div className="flex items-center gap-3"><span className="saved-label"><span />On your own rhythm</span><button className="icon-button help-button" aria-label="How to study" onClick={() => setGuideOpen(true)}><HelpCircle size={21} strokeWidth={1.6} /></button></div>
    </header>
    <main className="study-main">
      <div className="page-intro flex items-center justify-between gap-4">
        <div><p className="eyebrow">YOUR DAILY KOREAN</p><h1>A little, every day.</h1></div>
        <span className="intro-leaf" aria-hidden="true"><Leaf size={25} strokeWidth={1.4} /></span>
      </div>
      <div className="mode-selector grid grid-cols-3 gap-1" role="group" aria-label="Study mode">
        <button className={mode === 'standard' ? 'selected' : ''} aria-pressed={mode === 'standard'} onClick={() => session.setMode('standard')}><BookOpen size={17} />Standard</button>
        <button className={mode === 'listening' ? 'selected' : ''} aria-pressed={mode === 'listening'} onClick={() => session.setMode('listening')}><Headphones size={18} />Listening</button>
        <button className={testing ? 'selected' : ''} aria-pressed={testing} onClick={() => session.setMode('test')}><ClipboardCheck size={17} />Test</button>
      </div>
      <div className="deck-toolbar flex items-center justify-between gap-3">
        {testRunning && test.test
          ? <span className="test-pool flex items-center gap-2"><Layers size={17} /><span>{poolLabel(test.test.pool)}</span></span>
          : <button className="category-trigger flex items-center gap-2" onClick={() => setCategoryOpen(true)} aria-label="Choose category" aria-haspopup="dialog"><Layers size={17} /><span>{session.category}</span><ChevronDown size={16} /></button>}
        {testing
          ? testRunning ? <div className="flex items-center gap-1"><span className="deck-count" data-testid="test-count">Question {test.test!.current + 1} of {questionCount}</span>
            <button className="end-test" onClick={() => {
              // The button disappears with the test, so focus moves to what replaces it.
              flushSync(() => test.end())
              setAnnouncement(answeredCount ? 'Test ended' : 'Test cancelled')
              document.getElementById(answeredCount ? 'test-results-title' : 'test-setup-title')?.focus()
            }}>End test</button></div>
            : <span className="deck-count">{pool.length} {pool.length === 1 ? 'word' : 'words'}</span>
          : <div className="flex items-center gap-1"><span className="deck-count" data-testid="deck-count">{total ? index + 1 : 0}<span> / {total}</span></span><button className="icon-button shuffle-button" aria-label="Shuffle words" disabled={total < 2} onClick={() => { session.reshuffle(); setAnnouncement('Words shuffled') }}><Shuffle size={18} /></button></div>}
      </div>
      {testing
        ? <div className="deck-progress" role="progressbar" aria-label="Test progress" aria-valuenow={answeredCount} aria-valuemin={0} aria-valuemax={questionCount || 1}
          aria-valuetext={testRunning ? `Question ${test.test!.current + 1} of ${questionCount}` : test.phase === 'complete' ? `${answeredCount} answered` : 'Not started'}>
          <span style={{ width: `${questionCount ? answeredCount / questionCount * 100 : 0}%` }} /></div>
        : <div className="deck-progress" role="progressbar" aria-label="Position in deck" aria-valuenow={total ? index + 1 : 0} aria-valuemin={0} aria-valuemax={total || 1}><span style={{ width: `${total ? (index + 1) / total * 100 : 0}%` }} /></div>}
      {testing ? <TestView test={test} pool={pool} poolInfo={{ category: session.category, filter }} poolLabel={poolLabel({ category: session.category, filter })}
        progress={session.progress} difficultCount={session.difficultCount} onSelect={(category, nextFilter) => session.select(category, nextFilter)}
        onSetStatus={session.setStatus} announce={setAnnouncement} />
        : item ? <StudyCard key={`${item.id}:${mode}:${session.revision}`} item={item} mode={mode} status={session.progress[item.id]} onMark={status => {
        session.mark(status)
        setAnnouncement(session.progress[item.id] === status ? 'Mark removed' : `Marked as ${status}`)
      }} onNavigate={session.navigate} openAnchor={learning?.id === item.id && learning.revision === session.revision} onLearn={() => {
        setLearning({ id: item.id, revision: session.revision })
        session.setMode('standard')
        setAnnouncement(`Learning ${item.korean}`)
        window.scrollTo({ top: 0 })
      }} /> : <EmptyCollection difficultCount={session.difficultCount} onSelect={(category, nextFilter) => session.select(category, nextFilter)} />}
      {!testing && item && <nav className="card-navigation flex items-center justify-between gap-3" aria-label="Word navigation">
        <button className="previous-button" aria-label="Previous word" disabled={total < 2} onClick={() => session.navigate(-1)}><ArrowLeft size={20} /><span>Previous</span></button>
        <span className="swipe-note">Swipe to explore</span>
        <button className="next-button" aria-label="Next word" disabled={total < 2} onClick={() => session.navigate(1)}><span>Next</span><ArrowRight size={20} /></button>
      </nav>}
      <div className="session-note flex items-center justify-center gap-1.5"><Check size={13} />{session.storageAvailable && test.storageAvailable ? <span>{session.knownCount} known · Progress saved on this device</span> : <span>Storage unavailable · progress lasts until you close this page</span>}</div>
    </main>
    {!testRunning && <footer className="app-footer">
      <nav className="bottom-nav grid grid-cols-2" aria-label="Word collection">
        <button className={filter === 'all' ? 'selected' : ''} aria-pressed={filter === 'all'} onClick={() => { if (filter !== 'all') session.select(session.category, 'all') }}><BookOpen size={20} strokeWidth={1.7} /><span>Study</span></button>
        <button className={filter === 'difficult' ? 'selected' : ''} aria-pressed={filter === 'difficult'} onClick={() => { if (filter !== 'difficult') session.select('All words', 'difficult') }}><Star size={20} strokeWidth={1.7} /><span>Difficult</span><span className="nav-badge">{session.difficultCount}</span></button>
      </nav>
    </footer>}
    <div className="sr-only" role="status" aria-live="polite">{spoken(announcement)}</div>
    <CategorySelector open={categoryOpen} onClose={() => setCategoryOpen(false)} selected={session.category} onSelect={category => session.select(category)} difficult={filter === 'difficult'} progress={session.progress} />
    <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Make the sound stick">
      <div className="guide-content">
        <p className="guide-lead">A few words. A little curiosity. As often as you like.</p>
        <ol><li><strong>Listen first.</strong> Play at a natural or slower pace. Try to recognize the sound before revealing anything.</li><li><strong>Find your hook.</strong> Memory Anchor offers three ways to hear the word as something you already know. Pick the one that sticks; only your pick shows from then on, and Change brings the others back. Roots shows researched word origins and related words.</li><li><strong>Check the meaning.</strong> Reveal it when you’re ready. Dictionary forms and useful notes appear here too.</li><li><strong>Come back to the tricky ones.</strong> Mark Difficult to build a personal practice pile. Mark Known when it sticks.</li></ol>
        <div className="guide-note"><Headphones size={20} /><div><strong>A little help with listening</strong><p>Listening mode hides the Korean. Play the word, or show just its meaning, write what you recall on the pad, then reveal the word below your writing to compare. Learn opens the word in Standard mode with its Memory Anchor. Audio only plays when you tap. Your browser uses an available Korean voice; voice quality and offline availability depend on your device.</p></div></div>
        <div className="guide-note"><ClipboardCheck size={20} /><div><strong>Test what you remember</strong><p>Test asks one question at a time from the words you've chosen, with no hints or anchors: type the English for a Korean word, or write the Korean for an English meaning. Check your answer against the correct one, say whether you remembered it, and add forgotten words to Difficult from the results.</p></div></div>
        <div className="guide-note"><Lightbulb size={20} /><div><strong>Is your anchor working?</strong><p>One, three, and seven days after you pick an anchor, Meaning asks whether you remembered the word. If an anchor keeps failing, you'll get a gentle nudge to try another; it never changes on its own.</p>
          {feedback && <p className="feedback-summary">{feedback.chosen} chosen · {feedback.rated} rated · {feedback.recallChecks} recall checks · {feedback.wantNewIdeas} asking for new ideas</p>}
          <button className="feedback-download" onClick={downloadAnchorFeedback}><Download size={14} aria-hidden="true" />Download anchor feedback</button></div></div>
        <p className="guide-small">Reading guides approximate pronunciation: eo ≈ 어, eu ≈ 으. Sound anchors are approximate too; let the audio guide your pronunciation. Use ← → keys or swipe across the word to navigate.</p>
        <p className="guide-small">Your marks, anchor choices, and ratings stay in this browser. No account, tracking, or sync. Clearing browser storage also clears your progress.</p>
      </div>
    </Modal>
  </div>
}
