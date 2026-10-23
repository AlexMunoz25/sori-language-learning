import { useEffect, useState } from 'react'
import { AudioLines, Check, ClipboardCheck, Download, GraduationCap, HelpCircle, Languages, Leaf, Library, Lightbulb, Repeat } from 'lucide-react'
import { BottomNav } from './components/BottomNav'
import { CategorySelector } from './components/CategorySelector'
import { LanguagesSheet } from './components/LanguagesSheet'
import { LearnView } from './components/LearnView'
import { LibraryView } from './components/LibraryView'
import { Modal } from './components/Modal'
import { ReviewView } from './components/ReviewView'
import { SearchSheet } from './components/SearchSheet'
import { SectionTabs } from './components/SectionTabs'
import { cardById, cards, sectionInfo } from './data/cards'
import { unitById } from './data/units'
import { anchorFeedback } from './hooks/useAnchorChoice'
import { readStorage, writeStorage } from './hooks/storage'
import { useLanguages } from './hooks/useLanguages'
import { useLearn } from './hooks/useLearn'
import { useReview } from './hooks/useReview'
import { useStudySession, type Destination } from './hooks/useStudySession'
import { useTestSession } from './hooks/useTestSession'
import type { RecallEntry } from './recall/review'

type Sheet = 'category' | 'search' | 'languages' | 'guide'
const guideSeenKey = 'sori.guideSeen.v1'
const titles: Record<Destination, string> = { learn: 'Learn', library: 'Library', review: 'Review' }
/** Korean inside an announcement is marked as Korean, so screen readers switch voice for it. */
const spoken = (text: string) => text.split(/([가-힣]+(?:\s+[가-힣]+)*\??)/).map((part, index) => index % 2 ? <span key={index} lang="ko">{part}</span> : part)

function downloadAnchorFeedback(entries: RecallEntry[], languages: string[]) {
  const feedback = anchorFeedback(cards, entries, languages)
  const url = URL.createObjectURL(new Blob([JSON.stringify(feedback, null, 2)], { type: 'application/json' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: `sori-anchor-feedback-${feedback.exportedAt.slice(0, 10)}.json` })
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function App() {
  const session = useStudySession()
  const test = useTestSession()
  // A lesson's practice runs apart from Review's tests, so neither ever replaces the other.
  const practice = useTestSession({ storageKey: 'sori.learnTest.v1', source: 'learn', savePreferences: false })
  const review = useReview()
  const learn = useLearn()
  const languages = useLanguages()
  const [sheet, setSheet] = useState<Sheet | null>(() => readStorage('localStorage', guideSeenKey) === true ? null : 'guide')
  useEffect(() => {
    if (sheet === 'guide') writeStorage('localStorage', guideSeenKey, true)
  }, [sheet])
  const [announcement, setAnnouncement] = useState('')
  const { destination } = session
  const feedback = sheet === 'guide' ? anchorFeedback(cards, review.entries, languages).summary : undefined
  const close = () => setSheet(null)

  return <div className="app-shell" data-destination={destination}>
    <header className="app-header flex items-center justify-between">
      <a className="brand flex items-center gap-2.5" href="/" aria-label="Sori home"><span className="brand-mark"><AudioLines size={23} strokeWidth={1.7} /></span><span>sori<span className="brand-period">.</span></span></a>
      {/* The Library's halves: in the header's middle on wide screens; on phones, a row of their own under the brand. */}
      {destination === 'library' && <SectionTabs section={session.section} onSelect={next => {
        session.switchSection(next)
        setAnnouncement(sectionInfo[next].label)
      }} />}
      <div className="header-actions flex items-center gap-1">
        <span className="saved-label"><span />On your own rhythm</span>
        <button className="icon-button" aria-label="Languages you know" aria-haspopup="dialog" onClick={() => setSheet('languages')}><Languages size={20} strokeWidth={1.6} /></button>
        <button className="icon-button help-button" aria-label="How to study" aria-haspopup="dialog" onClick={() => setSheet('guide')}><HelpCircle size={21} strokeWidth={1.6} /></button>
      </div>
    </header>
    <main className="study-main">
      <div className="page-intro flex items-center justify-between gap-4">
        <div><p className="eyebrow">{titles[destination].toUpperCase()} · YOUR DAILY KOREAN</p><h1>A little, every day.</h1></div>
        <span className="intro-leaf" aria-hidden="true"><Leaf size={25} strokeWidth={1.4} /></span>
      </div>
      {destination === 'learn' && <LearnView practice={practice} due={review.due.length} announce={setAnnouncement} onLanguages={() => setSheet('languages')}
        onReview={() => { session.go('review'); setAnnouncement(titles.review); window.scrollTo({ top: 0 }) }} />}
      {destination === 'library' && <LibraryView session={session} announce={setAnnouncement} onChoose={() => setSheet('category')} onSearch={() => setSheet('search')} blocked={!!sheet} />}
      {destination === 'review' && <ReviewView session={session} test={test} announce={setAnnouncement} onChoose={() => setSheet('category')} />}
      <div className="session-note flex items-center justify-center gap-1.5"><Check size={13} />{session.storageAvailable && test.storageAvailable && review.saved
        ? <span>{session.knownCount} known · Progress saved on this device</span> : <span>Storage unavailable · progress lasts until you close this page</span>}</div>
    </main>
    {/* Always there: a test or a lesson left half-way waits, exactly as it was, until you come back. */}
    <footer className="app-footer"><BottomNav destination={destination} due={review.due.length} onGo={next => {
      session.go(next)
      setAnnouncement(learn.open && next === 'learn' ? `Learn: ${unitById.get(learn.open)?.title ?? ''}` : titles[next])
      window.scrollTo({ top: 0 })
    }} /></footer>
    <div className="sr-only" role="status" aria-live="polite">{spoken(announcement)}</div>
    <CategorySelector open={sheet === 'category'} onClose={close} section={session.section} selected={session.category} filter={session.filter}
      onSelect={(category, filter) => session.select(category, filter)} progress={session.progress} />
    <SearchSheet open={sheet === 'search'} onClose={close} onOpen={id => { session.open(id); setAnnouncement(`Opened ${cardById.get(id)?.korean ?? ''}`) }} />
    <LanguagesSheet open={sheet === 'languages'} onClose={close} />
    <Modal open={sheet === 'guide'} onClose={close} title="Make the sound stick">
      <div className="guide-content">
        <div className="guide-welcome">
          <p><strong>Hi, I’m Alex Marin (<a href="https://github.com/AlexMunoz25" target="_blank" rel="noopener noreferrer">EigenAlex</a>).</strong></p>
          <p>I’m a robotics and aerospace engineer learning Korean. It’s been a real challenge, so I built Sori to help myself learn, one small step at a time. If it makes your journey a little easier too, that’s even better.</p>
          <p>Thanks for being here. Let’s keep learning together!</p>
        </div>
        <p className="guide-lead">Hear it, anchor it, see it at work, recall it, use it, and come back to it.</p>
        <div className="guide-note"><GraduationCap size={20} /><div><strong>Learn</strong><p>Guided units, a few cards at a time. Hear each one, pick the Memory Anchor that makes it stick (or write your own), see it in a sentence, then recall its meaning and use it. Finished cards go to Review.</p></div></div>
        <div className="guide-note"><Library size={20} /><div><strong>Library</strong><p>Every word and grammar point, to explore at your pace. Vocabulary and Grammar each keep their place; Grammar holds particles, connectors, and more. Standard reveals pronunciation, anchors, Roots, examples, and meaning one at a time; Listening hides the Korean so you can write what you hear. Search finds anything by Korean, English, or how it sounds.</p></div></div>
        <div className="guide-note"><Repeat size={20} /><div><strong>Review</strong><p>Cards come back just before you’d forget them: tomorrow if you missed one, a little later each time you knew it. Test yourself on any selection, and practise your Difficult pile. Answers are checked for you; a hint makes a correct answer worth ½ point.</p></div></div>
        <div className="guide-note"><Lightbulb size={20} /><div><strong>Is your anchor working?</strong><p>Each word offers anchors of three kinds: how it sounds, how Korean builds it, and real moments from Korean songs and shows, which play from YouTube only when you press play. An invented sound-alike is labelled as one; an anchor built from verified roots says so, with the evidence in Roots. Each anchor shows how often you recalled the card while using it, and one, three, and seven days after you pick one, Meaning asks whether you remembered. A failing anchor gets a gentle nudge; it never changes on its own. Anchors in the languages you know come first.</p>
          {feedback && <p className="feedback-summary">{feedback.chosen} chosen · {feedback.rated} rated · {feedback.recallChecks} recall checks · {feedback.tested} tested with an anchor · {feedback.wantNewIdeas} asking for new ideas</p>}
          <button className="feedback-download" onClick={() => downloadAnchorFeedback(review.entries, languages)}><Download size={14} aria-hidden="true" />Download anchor feedback</button></div></div>
        <div className="guide-note"><ClipboardCheck size={20} /><div><strong>Handwriting</strong><p>English → Korean questions ask you to write the word. Google's handwriting recognition reads it (only your strokes are sent), and when it isn't sure, you say what you wrote.</p></div></div>
        <p className="guide-small">Reading guides approximate pronunciation: eo ≈ 어, eu ≈ 으. Let the audio lead. Use ← → keys or swipe to move between cards.</p>
        <p className="guide-small">Your marks, anchors, ratings, lessons, and reviews stay in this browser. No account, tracking, or sync. Clearing browser storage also clears your progress.</p>
      </div>
    </Modal>
  </div>
}
