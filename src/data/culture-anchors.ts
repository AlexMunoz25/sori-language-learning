import data from './culture-anchors.json' with { type: 'json' }
import type { AnchorCandidate, CultureSource } from '../types/vocabulary'

/**
 * Verified moments in Korean-language media, by card id: the word heard in a real song, show, or film, with an official
 * upload to watch it and, when checked against that upload, the second the line starts. Nothing here is written from
 * memory. Each entry records what it was checked against: timed lyrics, the upload's length, a source page. See
 * docs/memory-anchors.md, "Cultural anchors". Ids are c1, c2, stable within a card like other candidates.
 * The data is culture-anchors.json, written by `npm run anchors:culture` after it checks each moment.
 */
export const cultureAnchors = data as Record<string, Array<CultureSource & { id: string }>>

/** The video id in a YouTube watch URL. */
export const videoId = (url: string) => {
  try { return new URL(url).searchParams.get('v') ?? '' } catch { return '' }
}

/** 0:49, 3:05. */
export const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

/** The line without its brackets: 그 봄날이 올까. */
export const plainQuote = (quote: string) => quote.replace(/[[\]]/g, '')

/** The upload at the moment, for opening on YouTube. */
export const watchUrl = ({ url, start }: CultureSource) => start === undefined ? url : `${url}&t=${start}s`

/** A card's cultural anchors as candidates. Their text is a readable summary, for the anchor feedback download. */
export function cultureCandidates(cardId: string): AnchorCandidate[] {
  return (cultureAnchors[cardId] ?? []).map(({ id, ...source }) => ({
    id, kind: 'culture' as const, language: 'ko' as const, source,
    text: `${source.by}, ${source.title}: “${plainQuote(source.quote)}” (${source.translation})`,
  }))
}
