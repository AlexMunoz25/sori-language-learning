import { useEffect, useState } from 'react'
import { ArrowLeftRight, Check, PenLine, Sparkles, Star } from 'lucide-react'
import type { AnchorCandidate, AnchorKind, VocabularyItem } from '../types/vocabulary'
import { customAnchorId, type AnchorChoice } from '../hooks/useAnchorChoice'
import { fitsLanguages, useLanguages } from '../hooks/useLanguages'
import { useRecallLog } from '../hooks/useReview'
import { rootParts } from '../data/root-anchors'
import { anchorEvidence, type AnchorEvidence } from '../recall/review'
import { CultureLine, CulturePlayer, mediaLabels } from './CultureMoment'

/** “3 of 4 recalled”: how the card did in tests, reviews, and lessons while this anchor was the learner's choice. */
const evidenceText = ({ asked, correct, hinted }: AnchorEvidence) => `${correct} of ${asked} recalled${hinted ? ` · ${hinted} with a hint` : ''}`

const kindLabels: Record<AnchorKind, string> = {
  sound: 'Phonetic mnemonic', reading: 'Reading cue', roots: 'Verified word components', loanword: 'Borrowed word', pattern: 'Korean pattern', culture: 'Heard in Korean media',
}

function label(anchor: AnchorCandidate) {
  if (anchor.id === customAnchorId) return 'Your own anchor'
  if (anchor.source) return `${mediaLabels[anchor.source.media]} · ${anchor.source.by}`
  return kindLabels[anchor.kind] + (anchor.kind === 'sound' ? ` · ${anchor.language.toUpperCase()}` : '')
}

/** The chooser's three groups: how it sounds, how Korean builds it, where you've heard it. */
type Group = 'sound' | 'korean' | 'culture'
const groupOf = (anchor: AnchorCandidate): Group => anchor.kind === 'culture' ? 'culture' : anchor.kind === 'roots' || anchor.kind === 'pattern' ? 'korean' : 'sound'
const groupTitles: Record<Group, string> = { sound: 'Sounds like', korean: 'Korean roots', culture: 'Heard in Korean media' }

/** An anchor's words. A root-based one is laid out part by part, Korean, Hanja, reading, meaning, with the same text. */
function AnchorText({ anchor, full = false }: { anchor: AnchorCandidate; full?: boolean }) {
  if (anchor.source) return <CultureLine source={anchor.source} full={full} />
  const parsed = anchor.kind === 'roots' ? rootParts(anchor.text) : undefined
  if (!parsed) return <>{anchor.text}</>
  return <span className="root-parts">
    {parsed.parts.map((part, index) => <span key={index} className="root-part">
      {index > 0 && <span className="root-plus"> + </span>}
      <span className="root-korean" lang="ko">{part.korean}</span>
      {part.hanja && <>{' '}<span className="root-hanja">({part.hanja})</span></>}
      {' '}<span className="root-reading">{part.reading}</span>{' = '}<strong className="root-meaning">{part.meaning}</strong>
    </span>)}
    <span className="root-gloss"> → {parsed.gloss}</span>
  </span>
}

function AnchorNote({ anchor, roots }: { anchor: AnchorCandidate; roots: boolean }) {
  if (anchor.id === customAnchorId) return null
  if (anchor.kind === 'sound') return <p className="reading-note">Approximate sound association, not the word’s origin</p>
  if (anchor.kind === 'culture') return <p className="reading-note">A real moment, not an invented association · checked {anchor.source?.checked}</p>
  if (anchor.kind === 'pattern') return <p className="reading-note">How Korean builds the word{roots && ' · related words in Roots'}</p>
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
  const [otherLanguages, setOtherLanguages] = useState(false)
  const languages = useLanguages()
  const evidence = anchorEvidence(useRecallLog(), item.id)
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
      <p data-testid="mnemonic"><AnchorText anchor={selected} full /></p>
      {selected.source && <CulturePlayer source={selected.source} />}
      <AnchorNote anchor={selected} roots={!!item.roots} />
      <div className="anchor-rating flex items-center" role="group" aria-label="How well does this anchor stick?">
        {[1, 2, 3, 4, 5].map(stars => <button key={stars} aria-label={`Rate ${stars} of 5`} aria-pressed={rating === stars} onClick={() => choice.rate(selected.id, stars)}>
          <Star size={13} fill={rating >= stars ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>)}
      </div>
      {evidence[selected.id] && <p className="anchor-evidence" data-testid="anchor-evidence">In tests and reviews: {evidenceText(evidence[selected.id])}</p>}
      {choice.struggling && <p className="anchor-nudge" data-testid="anchor-nudge">This one hasn’t stuck in recent checks. <button onClick={() => setChoosing(true)}>Try another?</button></p>}
    </div>
  }

  // Hooks in the learner's languages first; the rest one tap away. The current choice always shows.
  const fitting = item.anchors.filter(anchor => fitsLanguages(anchor, languages) || anchor.id === selected?.id)
  const others = fitting.length ? item.anchors.filter(anchor => !fitting.includes(anchor)) : []
  const custom = record.custom ? [{ id: customAnchorId, text: record.custom, kind: 'sound' as const, language: 'mixed' as const }] : []
  const option = (anchor: AnchorCandidate) => {
    const current = anchor.id === selected?.id
    const tally = evidence[anchor.id]
    return <li key={anchor.id} className={anchor.source ? 'anchor-culture-option' : undefined}>
      <button className={`anchor-option${current ? ' current' : ''}`} aria-pressed={current} data-testid="anchor-option" onClick={() => { choice.select(anchor.id); close() }}>
        <span className="anchor-option-text"><AnchorText anchor={anchor} /></span>
        <span className="anchor-option-tag">{current && <Check size={11} aria-hidden="true" />}{current ? 'Current · ' : ''}{label(anchor)}{tally && ` · ${tally.correct}/${tally.asked} recalled`}</span>
      </button>
      {/* Hearing the moment before choosing it: outside the button, so it never selects. */}
      {anchor.source && <CulturePlayer source={anchor.source} />}
    </li>
  }
  // Grouped by route to the meaning, in the learner's languages first; your own anchor joins how it sounds.
  const shown = [...fitting.length ? fitting : item.anchors, ...custom]
  const groups = (['sound', 'korean', 'culture'] as const).map(group => ({ group, anchors: shown.filter(anchor => groupOf(anchor) === group) })).filter(({ group, anchors }) => anchors.length || (group === 'sound' && others.length))
  return <div className="anchor-chooser" data-testid="anchor-chooser">
    <p className="aid-kind">{selected ? 'Choose another anchor' : 'Pick the one that sticks'}</p>
    <p className="anchor-meaning">{item.meaning}<span aria-hidden="true"> →</span></p>
    {groups.map(({ group, anchors }) => <section key={group} className="anchor-group" aria-label={groupTitles[group]} data-testid={`anchor-group-${group}`}>
      {groups.length > 1 && <p className="anchor-group-title">{groupTitles[group]}</p>}
      {anchors.length > 0 && <ul className="anchor-options">{anchors.map(option)}</ul>}
      {group === 'sound' && others.length > 0 && <button className="anchor-link anchor-more" aria-expanded={otherLanguages} onClick={() => setOtherLanguages(!otherLanguages)}>
        {otherLanguages ? 'Hide other languages' : `More ideas in other languages (${others.length})`}</button>}
      {group === 'sound' && otherLanguages && <ul className="anchor-options" data-testid="other-language-anchors">{others.map(option)}</ul>}
    </section>)}
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
