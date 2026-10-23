import { useState } from 'react'
import { ExternalLink, Play, X } from 'lucide-react'
import type { CultureMedia, CultureSource } from '../types/vocabulary'
import { clock, videoId, watchUrl } from '../data/culture-anchors'
import { Sentence } from './GrammarContent'

export const mediaLabels: Record<CultureMedia, string> = { song: 'Song', drama: 'Drama', film: 'Film', show: 'TV show', animation: 'Animation' }

/** The line as heard, the word highlighted, with its English; `full` adds the title and why it sticks. */
export function CultureLine({ source, full = false }: { source: CultureSource; full?: boolean }) {
  return <span className="culture-line">
    <span className="culture-quote"><Sentence korean={source.quote} /></span>
    <span className="culture-translation">{source.translation}</span>
    {full && <span className="culture-title"><span lang="ko">{source.title}</span> · {source.by}{source.year ? ` · ${source.year}` : ''}</span>}
    {full && <span className="culture-why">{source.why}</span>}
  </span>
}

/**
 * Play the moment: on YouTube, or here when the upload allows embedding. Nothing loads from YouTube until the learner
 * presses play, and closing the player stops it.
 */
export function CulturePlayer({ source }: { source: CultureSource }) {
  const [playing, setPlaying] = useState(false)
  const at = source.start !== undefined ? clock(source.start) : undefined
  const name = `${source.title}, ${source.by}`
  const params = new URLSearchParams({ autoplay: '1', rel: '0', ...source.start !== undefined ? { start: String(source.start) } : {} })
  return <div className="culture-player" data-testid="culture-player">
    {playing && <div className="culture-frame">
      <iframe src={`https://www.youtube-nocookie.com/embed/${videoId(source.url)}?${params}`} title={`${name} on YouTube`} data-testid="culture-frame"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    </div>}
    <div className="culture-actions flex flex-wrap items-center gap-2">
      {source.embed && <button className="culture-play" aria-pressed={playing} aria-label={playing ? `Close the player for ${name}` : `Play ${name}${at ? ` from ${at}` : ''}`}
        onClick={() => setPlaying(!playing)}>
        {playing ? <><X size={14} aria-hidden="true" />Close</> : <><Play size={14} aria-hidden="true" />Play{at ? ` from ${at}` : ''}</>}
      </button>}
      {/* Not playable here: open the moment on YouTube instead. */}
      {!source.embed && <a className="culture-link" href={watchUrl(source)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${name} on YouTube${at ? ` at ${at}` : ''}`}>
        Listen{at ? ` from ${at}` : ''}<ExternalLink size={12} aria-hidden="true" />
      </a>}
      {source.video && <a className="culture-link" href={source.video} target="_blank" rel="noopener noreferrer" aria-label={`Watch the music video for ${name} on YouTube`}>
        Music video<ExternalLink size={12} aria-hidden="true" />
      </a>}
      {source.embed && !source.video && <a className="culture-link" href={watchUrl(source)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${name} on YouTube${at ? ` at ${at}` : ''}`}>
        YouTube<ExternalLink size={12} aria-hidden="true" />
      </a>}
    </div>
  </div>
}
