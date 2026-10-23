/**
 * Research packets for writing Memory Anchors: what a writer needs for each word, so candidates rest on the word's
 * real forms and its verified Roots record, keep the learner's rated anchors, and use keywords no other card uses.
 *
 *   npm run anchors:packets -- <outDir> [card ids…]
 *
 * Writes <outDir>/packet.json (the words, all vocabulary when no ids are given), taken.json (every CAPITAL keyword in use
 * and the cards using it), and vocab.json (every word with its dictionary and past forms, for patterns and families).
 * Writers follow docs/anchor-brief.md and hand back a candidates file for `npm run anchors:apply`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { cards, cardById } from '../../src/data/cards'
import { conjugate, explain } from '../../src/recall/conjugate'
import { hookWords } from '../../src/recall/hints'
import type { AnchorCandidate, VocabularyItem } from '../../src/types/vocabulary'

const [out, ...ids] = process.argv.slice(2)
if (!out) throw new Error('Usage: npm run anchors:packets -- <outDir> [card ids…]')

/** Anchors for speakers of one more language (it1, pt1, de1) stay as they are. */
const extraLanguage = (anchor: AnchorCandidate) => /^(it|pt|de)\d$/.test(anchor.id)
/** Rated four stars by the learner: the keyword stays (docs/anchor-feedback-analysis.md). Five stars are preselected. */
const fourStars: Record<string, string> = { '어려워요': 'ERROR', '추워요': 'ACHOO', '날씬해요': 'NAIL', '좋아요': 'JOY', '똑같아요': 'TikTOK', '재미있어요': 'JAMMING' }
const locked = (item: VocabularyItem, anchor: AnchorCandidate) => !!anchor.preselected || (!!fourStars[item.korean] && anchor.text.includes(fourStars[item.korean]))

function forms(item: VocabularyItem) {
  if (!item.dictionaryForm) return undefined
  const word = item.dictionaryForm
  const safe = (form: () => string) => { try { return form() } catch { return undefined } }
  return {
    dictionary: word, present: safe(() => conjugate(word, 'present')), past: safe(() => conjugate(word, 'past')),
    casual: safe(() => conjugate(word, 'casual')), future: safe(() => conjugate(word, 'future')), rule: safe(() => explain(word, 'present')),
  }
}

const words = ids.length ? ids.map(id => cardById.get(id) ?? (() => { throw new Error(`Unknown card: ${id}`) })()) : cards.filter(item => item.section === 'vocabulary')
const packet = words.map(item => ({
  id: item.id, korean: item.korean, meaning: item.meaning, category: item.category, reading: item.pronunciation,
  ...forms(item) ? { forms: forms(item) } : {},
  roots: item.roots ? {
    origin: item.roots.kind,
    components: item.roots.components.map(part => `${part.label}${part.hanja ? ` (${part.hanja})` : ''} = ${part.meaning} [${part.kind}]`),
    note: item.roots.note,
    related: item.roots.related.map(word => `${word.korean} (${word.meaning}): ${word.connection}`),
  } : { origin: 'none recorded' },
  anchors: item.anchors.filter(anchor => !extraLanguage(anchor) && anchor.kind !== 'culture')
    .map(anchor => ({ id: anchor.id, kind: anchor.kind, language: anchor.language, text: anchor.text, ...locked(item, anchor) ? { locked: true } : {} })),
  otherLanguages: item.anchors.filter(extraLanguage).map(anchor => `${anchor.language}: ${anchor.text}`),
}))

const taken: Record<string, string[]> = {}
for (const item of cards) for (const anchor of item.anchors) {
  if (anchor.kind === 'culture') continue
  for (const word of hookWords(anchor.text)) (taken[word] ??= []).push(item.korean)
}
const vocab = cards.filter(item => item.section === 'vocabulary').map(item => ({
  id: item.id, korean: item.korean, meaning: item.meaning, category: item.category,
  ...forms(item) ? { dictionary: forms(item)!.dictionary, past: forms(item)!.past } : {},
}))

mkdirSync(out, { recursive: true })
writeFileSync(`${out}/packet.json`, JSON.stringify(packet, null, 1))
writeFileSync(`${out}/taken.json`, JSON.stringify(Object.fromEntries(Object.entries(taken).sort()), null, 0))
writeFileSync(`${out}/vocab.json`, JSON.stringify(vocab, null, 0))
console.log(`${packet.length} words in ${out}/packet.json · ${Object.keys(taken).length} keywords in use`)
