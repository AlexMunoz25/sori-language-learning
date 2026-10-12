import { ArrowUpRight } from 'lucide-react'
import type { RootsAid } from '../types/roots'

const originLabels: Record<RootsAid['kind'], string> = {
  native: 'Native Korean',
  'sino-korean': 'Sino-Korean · Hanja',
  loanword: 'Loanword',
  mixed: 'Mixed components',
  phrase: 'Phrase pattern',
  uncertain: 'Verified components / form',
}

export function RootsContent({ aid }: { aid: RootsAid }) {
  return <div className="roots-content" data-testid="roots">
    <p className="roots-kind">{originLabels[aid.kind]}</p>
    <dl className="root-components">
      {aid.components.map(component => <div key={component.id}>
        <dt><span lang="ko">{component.label}</span>{component.hanja && <span className="root-hanja" lang="ko">{component.hanja}</span>}</dt>
        <dd>{component.meaning}</dd>
      </div>)}
    </dl>
    {aid.note && <p className="root-note">{aid.note}</p>}
    {aid.related.length > 0 && <div className="related-words" data-testid="related-words">
      <h3>Related in your cards</h3>
      <ul>{aid.related.map(word => <li key={word.id}>
        <span className="related-word"><span lang="ko">{word.korean}</span><span>{word.meaning}</span></span>
        <span className="related-connection">{word.connection}</span>
      </li>)}</ul>
    </div>}
    <details className="root-sources">
      <summary>Sources <span>{aid.sources.length}</span></summary>
      <ul>{aid.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={13} aria-hidden="true" /></a></li>)}</ul>
    </details>
  </div>
}
