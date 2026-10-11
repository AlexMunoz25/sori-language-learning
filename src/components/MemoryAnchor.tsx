import { useEffect, useState } from 'react'
import { ArrowLeftRight, Check, PenLine, Sparkles, Star } from 'lucide-react'
import type { AnchorCandidate, VocabularyItem } from '../types/vocabulary'
import { customAnchorId, type AnchorChoice } from '../hooks/useAnchorChoice'

const kindLabels = { sound: 'Phonetic mnemonic', reading: 'Reading cue', roots: 'Verified word components', loanword: 'Borrowed word' }

function label(anchor: AnchorCandidate) {
  if (anchor.id === customAnchorId) return 'Your own anchor'
  return kindLabels[anchor.kind] + (anchor.kind === 'sound' ? ` · ${anchor.language.toUpperCase()}` : '')
}

function AnchorNote({ anchor }: { anchor: AnchorCandidate }) {
  if (anchor.id === customAnchorId) return null
  if (anchor.kind === 'sound') return <p className="reading-note">Approximate sound association, not the word’s origin</p>
  if (anchor.kind === 'roots' || anchor.kind === 'loanword') {
    return <p className="reading-note">Evidence & related words in Roots{anchor.text.includes('≈') && ' · ≈ marks a sound-alike'}</p>
  }
  return null
}

export function MemoryAnchor({ item, choice }: { item: VocabularyItem; choice: AnchorChoice }) {
  const { selected, record } = choice
  const [choosing, setChoosing] = useState(false)
  const [fallback, setFallback] = useState<'closed' | 'open' | 'write'>('closed')
  const [draft, setDraft] = useState(record.custom ?? '')
  // A five-star default counts as chosen once it is actually seen, so recall checks can start.
  useEffect(() => { choice.adoptDefault() }, [])

  function close() { setChoosing(false); setFallback('closed') }

  if (selected && !choosing) {
    const rating = record.ratings?.[selected.id] ?? 0
    return <div className="anchor-selected">
      <div className="anchor-head flex items-center justify-between gap-2">
        <p className="aid-kind">{label(selected)}</p>
        <button className="anchor-change" aria-label="Change memory anchor" onClick={() => setChoosing(true)}><ArrowLeftRight size={12} aria-hidden="true" />Change</button>
      </div>
      <p className="anchor-meaning">{item.meaning}<span aria-hidden="true"> →</span></p>
      <p data-testid="mnemonic">{selected.text}</p>
      <AnchorNote anchor={selected} />
      <div className="anchor-rating flex items-center" role="group" aria-label="How well does this anchor stick?">
        {[1, 2, 3, 4, 5].map(stars => <button key={stars} aria-label={`Rate ${stars} of 5`} aria-pressed={rating === stars} onClick={() => choice.rate(selected.id, stars)}>
          <Star size={13} fill={rating >= stars ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>)}
      </div>
      {choice.struggling && <p className="anchor-nudge" data-testid="anchor-nudge">This one hasn’t stuck in recent checks. <button onClick={() => setChoosing(true)}>Try another?</button></p>}
    </div>
  }

  const options = record.custom ? [...item.anchors, { id: customAnchorId, text: record.custom, kind: 'sound' as const, language: 'mixed' as const }] : item.anchors
  return <div className="anchor-chooser" data-testid="anchor-chooser">
    <p className="aid-kind">{selected ? 'Choose another anchor' : 'Pick the one that sticks'}</p>
    <p className="anchor-meaning">{item.meaning}<span aria-hidden="true"> →</span></p>
    <ul className="anchor-options">
      {options.map(anchor => {
        const current = anchor.id === selected?.id
        return <li key={anchor.id}>
          <button className={`anchor-option${current ? ' current' : ''}`} aria-pressed={current} data-testid="anchor-option" onClick={() => { choice.select(anchor.id); close() }}>
            <span className="anchor-option-text">{anchor.text}</span>
            <span className="anchor-option-tag">{current && <Check size={11} aria-hidden="true" />}{current ? 'Current · ' : ''}{label(anchor)}</span>
          </button>
        </li>
      })}
    </ul>
    <div className="anchor-footer flex items-center justify-between gap-2">
      <button className="anchor-link" aria-expanded={fallback !== 'closed'} onClick={() => setFallback(fallback === 'closed' ? 'open' : 'closed')}>None of these work?</button>
      {selected && <button className="anchor-link" onClick={close}>Keep current</button>}
    </div>
    {fallback === 'open' && <div className="anchor-fallback">
      <button onClick={() => setFallback('write')}><PenLine size={14} aria-hidden="true" />Write my own</button>
      <button aria-pressed={!!record.wantsNew} onClick={choice.toggleWantsNew}><Sparkles size={14} aria-hidden="true" />{record.wantsNew ? 'New ideas requested' : 'Ask for new ideas'}</button>
      {record.wantsNew && <p className="reading-note">Saved. This word appears in your anchor feedback (? → Download) for the next update.</p>}
    </div>}
    {fallback === 'write' && <form className="anchor-write" onSubmit={event => {
      event.preventDefault()
      if (!draft.trim()) return
      choice.saveCustom(draft)
      close()
    }}>
      <label className="reading-note" htmlFor={`own-anchor-${item.id}`}>What does {item.korean} sound like to you?</label>
      <textarea id={`own-anchor-${item.id}`} value={draft} maxLength={200} rows={2} onChange={event => setDraft(event.target.value)} />
      <button type="submit" disabled={!draft.trim()}>Save and use it</button>
    </form>}
    {!choice.saved && <p className="reading-note">Storage unavailable · your choice lasts until you close this page</p>}
  </div>
}
