/**
 * Checks cultural anchors against the real thing and writes the ones that pass to src/data/culture-anchors.json.
 *
 *   npm run anchors:culture -- <candidates.json> [--lengths lengths.json] [--write]
 *   npm run anchors:culture -- --recheck [--write]
 *
 * A candidate names a card, the moment, and an official upload (for a song, its official audio, whose timing is the
 * timed lyrics'; `video` adds its music video, watched from the start):
 *   { "card": "Seasons:봄", "media": "song", "title": "봄날 (Spring Day)", "by": "BTS", "year": 2017,
 *     "quote": "그 [봄]날이 올까", "translation": "Will that spring day come?", "why": "…",
 *     "url": "https://www.youtube.com/watch?v=…", "lrclib": 36767587, "sources": ["https://…"] }
 * Checks, nothing taken on trust:
 *   - a song's line must be in its timed lyrics on LRCLIB (`lrclib`: the record id); its second there is recorded;
 *   - the upload must exist (YouTube oEmbed), which also says whether it may be embedded;
 *   - a start second is set only when the upload is as long as the timed track (±2 s), from YOUTUBE_API_KEY (YouTube
 *     Data API) or a `--lengths` file of { videoId: seconds } with how you measured them; otherwise the link opens at 0:00.
 * Other media (a show's title, a film's line) need source pages in `sources`, and never get a start second here.
 * Without --write it only reports. --recheck re-runs the checks on everything already in the file.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { cardById } from '../../src/data/cards'
import { cultureAnchors, plainQuote, videoId } from '../../src/data/culture-anchors'
import type { CultureMedia, CultureSource } from '../../src/types/vocabulary'

interface Candidate {
  card: string; media: CultureMedia; title: string; by: string; year?: number; quote: string; translation: string; why: string
  url: string; video?: string; lrclib?: number; sources?: string[]
}

const args = process.argv.slice(2)
const write = args.includes('--write')
const recheck = args.includes('--recheck')
const lengthsAt = args.indexOf('--lengths')
const lengths: Record<string, number> = lengthsAt >= 0 ? JSON.parse(readFileSync(args[lengthsAt + 1], 'utf8')) : {}
const file = args.find((arg, index) => !arg.startsWith('--') && index !== lengthsAt + 1)
if (!file && !recheck) throw new Error('Usage: npm run anchors:culture -- <candidates.json> [--lengths lengths.json] [--write] | --recheck [--write]')

const today = new Date().toISOString().slice(0, 10)
const agent = { 'User-Agent': 'sori-anchor-check/1.0 (language-learning app; low volume)' }
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
/** Letters only, for finding a line however it's spaced or punctuated. */
const bare = (text: string) => text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

async function timedLine(id: number, quote: string) {
  const response = await fetch(`https://lrclib.net/api/get/${id}`, { headers: agent })
  if (!response.ok) return { problem: `LRCLIB record ${id}: HTTP ${response.status}` }
  const record = await response.json() as { syncedLyrics?: string; duration?: number }
  const wanted = bare(plainQuote(quote))
  for (const raw of (record.syncedLyrics ?? '').split('\n')) {
    const stamp = raw.match(/^\[(\d+):(\d+(?:\.\d+)?)\]/)
    if (stamp && bare(raw.replace(/\[[^\]]*\]/g, '')).includes(wanted)) {
      return { at: Math.round((Number(stamp[1]) * 60 + Number(stamp[2])) * 100) / 100, duration: record.duration }
    }
  }
  return { problem: `the line isn't in LRCLIB record ${id}'s timed lyrics` }
}

/** Exists and may be embedded (200), exists but not embeddable (401/403), or gone (404). */
async function upload(url: string) {
  const response = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`, { headers: agent })
  if (response.ok) return { embed: true, channel: ((await response.json()) as { author_name?: string }).author_name }
  if (response.status === 401 || response.status === 403) return { embed: false }
  return { problem: `the upload isn't available (oEmbed HTTP ${response.status})` }
}

async function lengthOf(id: string) {
  if (lengths[id]) return lengths[id]
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return undefined
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${key}`)
  const iso = ((await response.json()) as { items?: Array<{ contentDetails: { duration: string } }> }).items?.[0]?.contentDetails.duration
  const [, h = 0, m = 0, s = 0] = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)?.map(Number) ?? []
  return iso ? h * 3600 + m * 60 + s : undefined
}

async function check(candidate: Candidate): Promise<{ source?: CultureSource; problems: string[]; notes: string[] }> {
  const problems: string[] = []
  const notes: string[] = []
  if (!cardById.has(candidate.card)) problems.push('unknown card')
  if (!/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(candidate.url)) problems.push('use a plain watch URL: https://www.youtube.com/watch?v=…')
  const evidence = [...candidate.sources ?? []]
  let start: number | undefined
  let line: { at?: number; duration?: number; problem?: string } | undefined
  if (candidate.media === 'song') {
    if (!candidate.lrclib) problems.push('a song needs its LRCLIB record (lrclib)')
    else {
      line = await timedLine(candidate.lrclib, candidate.quote)
      if (line.problem) problems.push(line.problem)
      else evidence.unshift(`lrclib:${candidate.lrclib}@${line.at}`)
    }
  } else if (!evidence.length) problems.push('a show, film, or animation needs source pages (sources)')
  const video = await upload(candidate.url)
  if (video.problem) problems.push(video.problem)
  else if (video.channel) notes.push(`channel: ${video.channel}`)
  if (candidate.video) {
    if (!/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(candidate.video)) problems.push('video: use a plain watch URL')
    else {
      const mv = await upload(candidate.video)
      if (mv.problem) problems.push(`video: ${mv.problem}`)
      else if (mv.channel) notes.push(`video channel: ${mv.channel}`)
    }
  }
  if (line?.at !== undefined && line.duration) {
    const length = await lengthOf(videoId(candidate.url))
    if (length !== undefined && Math.abs(length - line.duration) <= 2) {
      evidence.push(`length:${length}`)
      start = Math.max(0, Math.floor(line.at) - 2)
    } else notes.push(length === undefined ? 'no length known: the link opens at 0:00' : `upload is ${length}s, the timed track ${Math.round(line.duration)}s: the link opens at 0:00`)
  }
  if (problems.length) return { problems, notes }
  const { card: _card, lrclib: _lrclib, sources: _sources, ...rest } = candidate
  return { problems, notes, source: { ...rest, ...start !== undefined ? { start } : {}, embed: !!video.embed, evidence, checked: today } }
}

const results: Record<string, Array<CultureSource & { id: string }>> = recheck ? {} : structuredClone(cultureAnchors)
const candidates: Candidate[] = recheck
  ? Object.entries(cultureAnchors).flatMap(([card, entries]) => entries.map(entry => ({
    card, media: entry.media, title: entry.title, by: entry.by, year: entry.year, quote: entry.quote, translation: entry.translation, why: entry.why,
    url: entry.url, video: entry.video, lrclib: Number(entry.evidence.find(proof => proof.startsWith('lrclib:'))?.slice(7).split('@')[0]) || undefined,
    sources: entry.evidence.filter(proof => proof.startsWith('https://')),
  })))
  : JSON.parse(readFileSync(file!, 'utf8'))
// Candidates replace whatever their card had: c1 first, at most two.
for (const card of new Set(candidates.map(candidate => candidate.card))) delete results[card]
let failed = 0
for (const candidate of candidates) {
  const { source, problems, notes } = await check(candidate)
  const label = `${candidate.card} · ${candidate.by}, ${candidate.title}`
  if (problems.length) { failed++; console.log(`✗ ${label}: ${problems.join('; ')}`); continue }
  const list = results[candidate.card] ??= []
  if (list.length >= 2) { console.log(`✗ ${label}: a card takes two cultural anchors at most`); failed++; continue }
  list.push({ id: `c${list.length + 1}`, ...source! })
  console.log(`✓ ${label}${source!.start !== undefined ? ` · from ${source!.start}s` : ''}${notes.length ? ` (${notes.join('; ')})` : ''}`)
  await pause(400)
}
const sorted = Object.fromEntries(Object.entries(results).sort(([a], [b]) => a.localeCompare(b, 'ko')))
if (write) writeFileSync('src/data/culture-anchors.json', JSON.stringify(sorted, null, 1) + '\n')
console.log(`${candidates.length - failed} checked out, ${failed} failed${write ? '; written to src/data/culture-anchors.json' : ' (report only; --write to save)'}`)
