import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, Headphones, Layers, Search, Shuffle } from 'lucide-react'
import { nounsOf } from '../data/cards'
import type { StudySession } from '../hooks/useStudySession'
import { EmptyCollection } from './EmptyCollection'
import { StudyCard } from './StudyCard'

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
const label = ({ category, filter }: { category: string; filter: string }) => filter === 'difficult' ? `Difficult · ${category}` : category

/** The whole Library, one card at a time: read and reveal (Standard), or hear and write (Listening). */
export function LibraryView({ session, announce, onChoose, onSearch, blocked }: {
  session: StudySession; announce: (message: string) => void; onChoose: () => void; onSearch: () => void
  /** A sheet is open: arrow keys belong to it. */
  blocked: boolean
}) {
  const { item, mode, total, index } = session
  const [noun, nouns] = nounsOf(session.category)
  // Study (from Listening) opens this card, same position, in Standard mode with its Memory Anchor showing.
  const [studying, setStudying] = useState<{ id: string; revision: number }>()
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (blocked || event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); session.navigate(event.key === 'ArrowRight' ? 1 : -1) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [blocked, session.navigate])
  useEffect(() => { announce(total ? `Card ${index + 1} of ${total}` : `No ${nouns} in this selection`) }, [index, total, item?.id, nouns])

  return <>
    <div className="mode-selector grid grid-cols-2 gap-1" role="group" aria-label="Study mode">
      <button className={mode === 'standard' ? 'selected' : ''} aria-pressed={mode === 'standard'} onClick={() => session.setMode('standard')}><BookOpen size={17} />Standard</button>
      <button className={mode === 'listening' ? 'selected' : ''} aria-pressed={mode === 'listening'} onClick={() => session.setMode('listening')}><Headphones size={18} />Listening</button>
    </div>
    <div className="deck-toolbar flex items-center justify-between gap-3">
      <button className="category-trigger flex items-center gap-2" onClick={onChoose} aria-label="Choose category" aria-haspopup="dialog"><Layers size={17} /><span>{label(session)}</span><ChevronDown size={16} /></button>
      <div className="flex items-center gap-1">
        <span className="deck-count" data-testid="deck-count">{total ? index + 1 : 0}<span> / {total}</span></span>
        <button className="icon-button" aria-label="Search the Library" aria-haspopup="dialog" onClick={onSearch}><Search size={18} /></button>
        <button className="icon-button shuffle-button" aria-label={`Shuffle ${nouns}`} disabled={total < 2} onClick={() => { session.reshuffle(); announce(`${capitalize(nouns)} shuffled`) }}><Shuffle size={18} /></button>
      </div>
    </div>
    <div className="deck-progress" role="progressbar" aria-label="Position in deck" aria-valuenow={total ? index + 1 : 0} aria-valuemin={0} aria-valuemax={total || 1}><span style={{ width: `${total ? (index + 1) / total * 100 : 0}%` }} /></div>
    {item ? <StudyCard key={`${item.id}:${mode}:${session.revision}`} item={item} mode={mode} status={session.progress[item.id]} onMark={status => {
      session.mark(status)
      announce(session.progress[item.id] === status ? 'Mark removed' : `Marked as ${status}`)
    }} onNavigate={session.navigate} openAnchor={studying?.id === item.id && studying.revision === session.revision} onStudy={() => {
      setStudying({ id: item.id, revision: session.revision })
      session.setMode('standard')
      announce(`Studying ${item.korean}`)
      window.scrollTo({ top: 0 })
    }} /> : <EmptyCollection section={session.section} difficultCount={session.difficultCount} onSelect={(category, filter) => session.select(category, filter)} />}
    {item && <nav className="card-navigation flex items-center justify-between gap-3" aria-label={`${capitalize(noun)} navigation`}>
      <button className="previous-button" aria-label={`Previous ${noun}`} disabled={total < 2} onClick={() => session.navigate(-1)}><ArrowLeft size={20} /><span>Previous</span></button>
      <span className="swipe-note">Swipe to explore</span>
      <button className="next-button" aria-label={`Next ${noun}`} disabled={total < 2} onClick={() => session.navigate(1)}><span>Next</span><ArrowRight size={20} /></button>
    </nav>}
  </>
}
