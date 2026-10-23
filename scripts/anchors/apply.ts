/**
 * Merges reviewed anchor candidates into src/data/memory-aids.ts (the vocabulary `entries` block).
 *
 *   npm run anchors:apply -- <candidates.json> [more.json…] [--dry]
 *
 * Each file is the writers' output for packets from `npm run anchors:packets` (docs/anchor-brief.md):
 *   [{ "id": "Adjectives:차가워요",
 *      "review": { "1": { "stars": 4, "verdict": "keep" }, "2": { "stars": 2, "verdict": "replace" }, "3": { "verdict": "polish", "text": "…" } },
 *      "add": [{ "kind": "sound", "language": "en", "text": "…", "stars": 5, "first": true }],
 *      "newWords": { "눈물": "tears (눈 eye + 물 water)" } }]
 * Polishing keeps a candidate's id, so a learner's choice survives; a replaced candidate disappears; added ones get new
 * ids. `first` puts a candidate at the top of the list (the learner's own examples). New words for pattern anchors join
 * family-words.ts: review them before applying. Every word must end with three phonetic candidates and one roots or
 * pattern candidate, and new keywords must be unused elsewhere. Then run `npm run data:validate`.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { cardById, cards } from '../../src/data/cards'
import { familyWords } from '../../src/data/family-words'
import { hookWords } from '../../src/recall/hints'
import type { AnchorKind } from '../../src/types/vocabulary'

interface Review { stars?: number; verdict: 'keep' | 'polish' | 'replace'; text?: string }
interface Added { kind: AnchorKind; language: string; text: string; stars?: number; first?: boolean }
interface Candidates { id: string; review?: Record<string, Review>; add?: Added[]; newWords?: Record<string, string>; note?: string }

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const files = args.filter(arg => !arg.startsWith('--'))
if (!files.length) throw new Error('Usage: npm run anchors:apply -- <candidates.json> [more.json…] [--dry]')

const aidsPath = 'src/data/memory-aids.ts'
const source = readFileSync(aidsPath, 'utf8')
const open = 'const entries = `\n'
const start = source.indexOf(open) + open.length
const end = source.indexOf('\n`', start)
if (start < open.length || end < 0) throw new Error('memory-aids.ts has no entries block')

// The block as cards: a header (`key|reading`) and candidate lines (`id|language|kind|text`, `*` for a five-star default).
interface Line { id: string; star: boolean; language: string; kind: string; text: string }
const blocks = new Map<string, { header: string; lines: Line[] }>()
const order: string[] = []
let current: { header: string; lines: Line[] } | undefined
for (const raw of source.slice(start, end).split('\n')) {
  if (!raw.startsWith('  ')) {
    current = { header: raw, lines: [] }
    blocks.set(raw.split('|')[0], current)
    order.push(raw.split('|')[0])
    continue
  }
  const [id, language, kind, ...text] = raw.trim().split('|')
  current!.lines.push({ id: id.replace('*', ''), star: id.endsWith('*'), language, kind, text: text.join('|') })
}

const phonetic = new Set(['sound', 'reading', 'loanword'])
const problems: string[] = []
const newWords: Record<string, string> = {}
const fresh = new Map<string, string>() // keyword → card, for keywords added in this run

for (const file of files) for (const entry of JSON.parse(readFileSync(file, 'utf8')) as Candidates[]) {
  const item = cardById.get(entry.id)
  if (!item) { problems.push(`Unknown card: ${entry.id}`); continue }
  const key = blocks.has(item.id) ? item.id : item.korean
  const block = blocks.get(key)
  if (!block) { problems.push(`No memory-aid block for ${entry.id}`); continue }
  const before = new Set(block.lines.flatMap(line => hookWords(line.text)))
  for (const line of [...block.lines]) {
    const review = entry.review?.[line.id]
    if (!review) { problems.push(`${entry.id}#${line.id}: not reviewed`); continue }
    if (review.verdict === 'replace') {
      if (line.star) problems.push(`${entry.id}#${line.id}: a five-star default is never replaced`)
      else block.lines.splice(block.lines.indexOf(line), 1)
    } else if (review.verdict === 'polish') {
      if (!review.text?.trim()) problems.push(`${entry.id}#${line.id}: polish without text`)
      else line.text = review.text.trim()
    }
  }
  let next = Math.max(0, ...block.lines.map(line => Number(line.id)).filter(Number.isFinite)) + 1
  const top: Line[] = []
  for (const added of entry.add ?? []) {
    const line = { id: String(next++), star: false, language: added.language, kind: added.kind, text: added.text.trim() }
    if (added.first) top.push(line)
    else block.lines.push(line)
    // A keyword is one card's own; two-letter words (GO, ÇA) are too common to own, and a phrase shares its words' hooks.
    for (const keyword of hookWords(line.text).filter(word => word.replace(/['’-]/g, '').length >= 3)) {
      if (before.has(keyword)) continue
      const related = (other: { id: string; korean: string }) => [item, other].some(card => card.id.startsWith('phrase:'))
        && (item.korean.includes(other.korean.replace(/요$/, '')) || other.korean.includes(item.korean.replace(/요$/, '')))
      const elsewhere = cards.filter(other => other.id !== item.id && !related(other)
        && other.anchors.some(anchor => anchor.kind !== 'culture' && hookWords(anchor.text).includes(keyword)))
      if (elsewhere.length && !added.first) problems.push(`${entry.id}: keyword ${keyword} is already used by ${elsewhere.map(other => other.korean).join(', ')}`)
      const other = fresh.get(keyword)
      if (other && other !== item.id && !related(cardById.get(other)!)) problems.push(`${entry.id}: keyword ${keyword} is also new on ${other}`)
      fresh.set(keyword, item.id)
    }
  }
  block.lines.unshift(...top)
  Object.assign(newWords, entry.newWords ?? {})

  // Three ways it sounds, one way Korean builds it (two phonetic only with a reason).
  const sounds = block.lines.filter(line => phonetic.has(line.kind) && !/^(it|pt|de)\d$/.test(line.id)).length
  const structure = block.lines.filter(line => line.kind === 'roots' || line.kind === 'pattern').length
  if (sounds !== 3 && !(sounds === 2 && entry.note)) problems.push(`${entry.id}: ${sounds} phonetic candidates (3 expected)`)
  if (structure !== 1) problems.push(`${entry.id}: ${structure} roots/pattern candidates (1 expected)`)
  for (const line of block.lines) {
    if (line.text.length > 140) problems.push(`${entry.id}#${line.id}: longer than 140 characters`)
    if (line.text.includes('|') || line.text.includes('`')) problems.push(`${entry.id}#${line.id}: | and \` can't appear in a candidate`)
  }
}

if (problems.length) {
  console.error(problems.map(problem => `✗ ${problem}`).join('\n'))
  process.exit(1)
}
const block = order.map(key => {
  const { header, lines } = blocks.get(key)!
  return [header, ...lines.map(line => `  ${line.id}${line.star ? '*' : ''}|${line.language}|${line.kind}|${line.text}`)].join('\n')
}).join('\n')
const words = Object.entries({ ...familyWords, ...newWords }).sort(([a], [b]) => a.localeCompare(b, 'ko'))
if (dry) {
  console.log(`Dry run: ${files.length} file(s) check out; ${Object.keys(newWords).length} new family words.`)
} else {
  writeFileSync(aidsPath, source.slice(0, start) + block + source.slice(end))
  const familyPath = 'src/data/family-words.ts'
  const family = readFileSync(familyPath, 'utf8')
  writeFileSync(familyPath, family.replace(/export const familyWords: Record<string, string> = \{[\s\S]*?\n?\}\n/,
    `export const familyWords: Record<string, string> = {${words.length ? '\n' + words.map(([word, meaning]) => `  ${JSON.stringify(word)}: ${JSON.stringify(meaning)},`).join('\n') + '\n' : ''}}\n`))
  console.log(`Applied ${files.length} file(s); ${words.length} family words. Next: npm run data:validate`)
}
