import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AudioLines, BookOpen, Check, ChevronDown, Eye, EyeOff, Lightbulb, MessageSquareQuote, MessageSquareText, Network, RotateCcw, Ruler, Scale, Sparkles, Star, Turtle, Volume2, X } from 'lucide-react'
import { sectionInfo, spokenText } from '../data/cards'
import type { StudyMode, VocabularyItem, WordStatus } from '../types/vocabulary'
import { useAnchorChoice } from '../hooks/useAnchorChoice'
import { useSpeech } from '../hooks/useSpeech'
import { GrammarComparisons, GrammarExamples, GrammarTricks, GrammarUsage } from './GrammarContent'
import { KoreanWord } from './KoreanWord'
import { MemoryAnchor } from './MemoryAnchor'
import { RootsContent } from './RootsContent'
import { WordNotes } from './WordNotes'
import { WritingPad } from './WritingPad'

function Reveal({ label, icon, children, tone = '', compact = false, defaultOpen = false }: { label: string; icon: ReactNode; children: ReactNode; tone?: string; compact?: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = `reveal-${label.toLowerCase().replaceAll(' ', '-')}`
  return <section className={`reveal ${tone} ${open ? 'is-open' : ''}`}>
    <button className="reveal-trigger flex items-center gap-3" aria-label={`${open ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      {icon}<span className="flex-1 text-left">{compact || open ? label : `Show ${label.toLowerCase()}`}</span><ChevronDown size={17} className="reveal-chevron" />
    </button>
    {open && <div id={id} className="reveal-content">{children}</div>}
  </section>
}

export function StudyCard({ item, mode, status, onMark, onNavigate, onLearn, openAnchor = false }: {
  item: VocabularyItem; mode: StudyMode; status?: WordStatus; onMark: (status: WordStatus) => void; onNavigate: (direction: 1 | -1) => void
  /** Listening only: open this word in Standard mode. */
  onLearn?: () => void
  /** Arrived from Learn: start with the Memory Anchor open. */
  openAnchor?: boolean
}) {
  const listening = mode === 'listening'
  const [noun] = sectionInfo[item.section].noun
  const [wordVisible, setWordVisible] = useState(false)
  const [reset, setReset] = useState(0)
  const speech = useSpeech()
  const anchor = useAnchorChoice(item)
  const card = useRef<HTMLElement>(null)
  const touch = useRef<{ x: number; y: number; time: number } | null>(null)
  const { cancel } = speech
  useEffect(() => () => cancel(), [cancel])
  useEffect(() => { if (openAnchor) card.current?.focus({ preventScroll: true }) }, [])
  const koreanWord = <KoreanWord word={item.korean} />
  return <article ref={card} tabIndex={-1} className={`study-card ${listening ? 'listening-card' : ''} ${item.grammar ? 'grammar-card' : ''}`} aria-label={item.grammar ? `${item.section === 'connectors' ? 'Connector' : 'Particle'} study card` : 'Vocabulary study card'}
    onTouchStart={event => {
      // Writing on the pad must never turn the page.
      if (event.touches.length !== 1 || (event.target as HTMLElement).closest('button, a, input, .writing-pad')) { touch.current = null; return }
      const first = event.touches[0]
      touch.current = { x: first.clientX, y: first.clientY, time: Date.now() }
    }}
    onTouchCancel={() => { touch.current = null }}
    onTouchEnd={event => {
      if (!touch.current || !event.changedTouches[0]) return
      const deltaX = event.changedTouches[0].clientX - touch.current.x
      const deltaY = event.changedTouches[0].clientY - touch.current.y
      if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.6 && Date.now() - touch.current.time < 900) onNavigate(deltaX < 0 ? 1 : -1)
      touch.current = null
    }}>
    <div className="card-kicker flex items-center justify-between gap-3"><span>{listening ? 'LISTEN & WRITE' : 'A MOMENT TO REMEMBER'}</span><span className="tiny-dot" /></div>
    {!listening && <div className="word-stage">{koreanWord}</div>}
    <div className="audio-controls flex items-center justify-center gap-3">
      <button className={`audio-normal ${speech.playing === 'normal' ? 'playing' : ''}`} aria-label="Play pronunciation" onClick={() => speech.speak(spokenText(item), 'normal')} disabled={!speech.supported}>
        <Volume2 size={22} strokeWidth={1.7} /><span>Normal</span>{speech.playing === 'normal' && <span className="playing-dot" />}
      </button>
      <button className={`audio-slow ${speech.playing === 'slow' ? 'playing' : ''}`} aria-label="Play slowly" onClick={() => speech.speak(spokenText(item), 'slow')} disabled={!speech.supported}>
        <Turtle size={22} strokeWidth={1.6} /><span>Slow</span>
      </button>
    </div>
    <div className="audio-feedback" aria-live="polite">
      {!speech.supported && <p>Speech isn’t supported in this browser. You can still reveal and study the {noun}.</p>}
      {speech.error && <p>{speech.error}</p>}
    </div>
    {listening ? <div className="listening-exercise">
      {/* The meaning is a second prompt: recall the word from it without seeing any Korean. */}
      <Reveal label="Meaning" icon={<MessageSquareText size={18} />}>
        <p className="meaning" data-testid="meaning">{item.meaning}</p>
        {item.speaker && <p className="detail-note">Used by: {item.speaker}</p>}
      </Reveal>
      <WritingPad>
        <button className="reveal-word" aria-expanded={wordVisible} aria-controls="listening-answer" onClick={() => setWordVisible(!wordVisible)}>
          {wordVisible ? <EyeOff size={18} /> : <Eye size={18} />}{wordVisible ? `Hide ${noun}` : `Reveal ${noun}`}
        </button>
      </WritingPad>
      <div id="listening-answer" className="listening-answer" aria-live="polite">{wordVisible && koreanWord}</div>
    </div> : <div className="reveals" key={reset}>
      <Reveal label="Pronunciation" icon={<AudioLines size={18} />}>
        <p className="pronunciation" data-testid="pronunciation">{item.pronunciation ?? 'Listen to the audio for pronunciation.'}</p>
        <p className="reading-note">Approximate reading guide · let the audio lead</p>
      </Reveal>
      <div className={`memory-layers ${item.roots ? 'two-layers' : ''}`}>
        <Reveal label="Memory Anchor" icon={<Lightbulb size={17} />} tone="anchor-reveal" compact defaultOpen={openAnchor && reset === 0}>
          <MemoryAnchor item={item} choice={anchor} />
        </Reveal>
        {item.roots && <Reveal label="Roots" icon={<Network size={17} />} tone="roots-reveal" compact>
          <RootsContent aid={item.roots} />
        </Reveal>}
      </div>
      {/* Connectors and particles: how it's used, in sentences, rules, tricks, and side by side with look-alikes. One row of
          tiles keeps the card on one screen; each opens its own panel below. */}
      {item.grammar && <div className="memory-layers grammar-layers">
        <Reveal label="Examples" icon={<MessageSquareQuote size={17} />} tone="examples-reveal" compact>
          <GrammarExamples grammar={item.grammar} speech={speech} />
        </Reveal>
        <Reveal label="Usage rules" icon={<Ruler size={17} />} tone="usage-reveal" compact>
          <GrammarUsage grammar={item.grammar} />
        </Reveal>
        <Reveal label="Memory tricks" icon={<Sparkles size={17} />} tone="tricks-reveal" compact>
          <GrammarTricks grammar={item.grammar} />
        </Reveal>
        <Reveal label="Comparisons" icon={<Scale size={17} />} tone="compare-reveal" compact>
          <GrammarComparisons grammar={item.grammar} />
        </Reveal>
      </div>}
      <Reveal label="Meaning" icon={<Eye size={18} />}>
        <p className="meaning" data-testid="meaning">{item.meaning}</p>
        {anchor.due && <div className="recall-check" data-testid="recall-check">
          <p>Day {anchor.due} anchor check: did you remember it?</p>
          <div className="flex gap-2">
            <button onClick={() => anchor.recordCheck(true)}><Check size={14} aria-hidden="true" />Remembered</button>
            <button onClick={() => anchor.recordCheck(false)}><X size={14} aria-hidden="true" />Forgot</button>
          </div>
        </div>}
        <WordNotes item={item} />
        <button className="try-again" onClick={() => { setReset(reset + 1); speech.cancel() }}><RotateCcw size={14} />Hide & try again</button>
      </Reveal>
    </div>}
    <div className={`progress-controls grid gap-2 ${listening ? 'grid-cols-3' : 'grid-cols-2'}`}>
      <button className={`mark-button difficult ${status === 'difficult' ? 'active' : ''}`} aria-label="Mark as difficult" aria-pressed={status === 'difficult'} onClick={() => onMark('difficult')}><Star size={18} fill={status === 'difficult' ? 'currentColor' : 'none'} />Difficult</button>
      <button className={`mark-button known ${status === 'known' ? 'active' : ''}`} aria-label="Mark as known" aria-pressed={status === 'known'} onClick={() => onMark('known')}><Check size={19} />Known</button>
      {listening && <button className="mark-button learn" aria-label={`Learn this ${noun}`} onClick={onLearn}><BookOpen size={18} />Learn</button>}
    </div>
  </article>
}
