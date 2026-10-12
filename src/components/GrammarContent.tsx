import { useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { cardById } from '../data/cards'
import type { useSpeech } from '../hooks/useSpeech'
import type { GrammarDetails } from '../types/vocabulary'

/** “저[는] 학생이에요.” → before, the studied piece, after. */
export function sentenceParts(korean: string) {
  const [, before = korean, piece = '', after = ''] = korean.match(/^(.*?)\[([^\]]*)\](.*)$/) ?? []
  return { before, piece, after }
}
/** The sentence as said and written, without the bracket marks. */
export const plainSentence = (korean: string) => korean.replace(/[[\]]/g, '')

/** A sentence with its studied piece highlighted, or blanked out for a question. */
export function Sentence({ korean, blank = false, filled }: { korean: string; blank?: boolean; filled?: string }) {
  const { before, piece, after } = sentenceParts(korean)
  return <span lang="ko">{before}{blank
    ? <span className={`grammar-blank ${filled ? 'filled' : ''}`} data-testid="sentence-blank">{filled ?? <span className="sr-only">blank</span>}</span>
    : <mark className="grammar-mark">{piece}</mark>}{after}</span>
}

type Speech = ReturnType<typeof useSpeech>

export function GrammarExamples({ grammar, speech }: { grammar: GrammarDetails; speech: Speech }) {
  const [playing, setPlaying] = useState<number>()
  useEffect(() => { if (!speech.playing) setPlaying(undefined) }, [speech.playing])
  return <ol className="grammar-examples" data-testid="grammar-examples">
    {grammar.examples.map((example, index) => <li key={index}>
      <div className="grammar-example-text">
        <p className="grammar-sentence"><Sentence korean={example.korean} /></p>
        <p className="grammar-english">{example.english}</p>
      </div>
      <button className={`grammar-play ${playing === index ? 'playing' : ''}`} aria-label={`Play: ${plainSentence(example.korean)}`} disabled={!speech.supported}
        onClick={() => { speech.speak(plainSentence(example.korean), 'normal'); setPlaying(index) }}>
        <Volume2 size={16} aria-hidden="true" />
      </button>
    </li>)}
  </ol>
}

export function GrammarUsage({ grammar }: { grammar: GrammarDetails }) {
  return <div className="grammar-usage" data-testid="grammar-usage">
    <dl className="grammar-forms">
      {grammar.forms.map(({ form, when }, index) => <div key={index}><dt lang="ko">{form}</dt><dd>{when}</dd></div>)}
    </dl>
    <ul className="grammar-list">{grammar.rules.map((rule, index) => <li key={index}>{rule}</li>)}</ul>
  </div>
}

export function GrammarTricks({ grammar }: { grammar: GrammarDetails }) {
  return <ul className="grammar-list grammar-tricks" data-testid="grammar-tricks">{grammar.tricks.map((trick, index) => <li key={index}>{trick}</li>)}</ul>
}

export function GrammarComparisons({ grammar }: { grammar: GrammarDetails }) {
  return <div className="grammar-comparisons" data-testid="grammar-comparisons">
    {grammar.comparisons.map((comparison, index) => <section key={index}>
      <h3 lang="ko">{comparison.title}</h3>
      <p className="grammar-compared">{comparison.with.map(id => cardById.get(id)).filter(other => !!other).map(other =>
        <span key={other.id}><span lang="ko">{other.korean}</span> {other.meaning}</span>)}</p>
      <ul className="grammar-list">{comparison.points.map((point, index) => <li key={index}>{point}</li>)}</ul>
    </section>)}
  </div>
}
