import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseVocabulary, phrases, proseNotes } from '../src/data/source'
import { memoryAids } from '../src/data/memory-aids'
import { rootParts } from '../src/data/root-anchors'
import { recallData } from '../src/data/recall-data'
import { originReviews, originSources, rootConcepts } from '../src/data/roots'
import { cardById, cards, collectionInfo, collectionList, sections } from '../src/data/cards'
import { grammarSources } from '../src/data/grammar'
import { units, unitById } from '../src/data/units'
import { wordExamples } from '../src/data/word-examples'
import { gapAnswer, questionRuleById, sentencesOf } from '../src/recall/questionRules'
import { acceptedTexts, givesAway, matchEnglish } from '../src/recall/english'
import { hookWords, meaningTerms, mentions } from '../src/recall/hints'
import { conjugate } from '../src/recall/conjugate'
import { cultureAnchors } from '../src/data/culture-anchors'
import { familyWords } from '../src/data/family-words'

const markdown = readFileSync('vocabulary.md', 'utf8')
const lines = markdown.split(/\r?\n/)
const parsed = parseVocabulary(markdown)
const generated = JSON.parse(readFileSync('src/data/vocabulary.generated.json', 'utf8'))
assert.deepEqual(generated, parsed, 'Generated data is stale. Run npm run data:generate.')
assert.equal(new Set(parsed.map(item => item.id)).size, parsed.length, 'Duplicate card ids')

const tableRows = lines.flatMap((line, index) => line.startsWith('|') && /[가-힣]/.test(line) ? [index + 1] : [])
for (const line of tableRows) {
  const items = parsed.filter(item => item.sourceLine === line)
  assert(items.length, `Unimported vocabulary row ${line}`)
  const cells = lines[line - 1].split('|').slice(1, -1).map(cell => cell.replace(/★\s*/g, '').trim())
  const conjugated = !!items[0].dictionaryForm
  for (const item of items) assert.equal(item.meaning, cells[conjugated ? 2 : 1], `Changed source meaning at ${line}`)
}
for (const [index, line] of lines.entries()) {
  if (!/[가-힣]/.test(line) || line.startsWith('|')) continue
  const covered = /^#{1,2}\s+\d+\./.test(line)
    || phrases.some(([, , anchor]) => line.startsWith(anchor))
    || proseNotes.some(note => line.startsWith(note.anchor))
  assert(covered, `Unreviewed Korean prose on line ${index + 1}: ${line}`)
}

// Grammar: ids by collection, and categories that never repeat across sections or collections (a category names both).
assert.equal(new Set(cards.map(item => item.id)).size, cards.length, 'Duplicate card ids across sections')
const selections = [...sections.map(section => section.all), ...collectionList.map(collection => collection.all)]
for (const { id } of sections) {
  const names = new Set(cards.filter(item => item.section === id).map(item => item.category))
  assert(names.size && selections.every(name => !names.has(name)), `Categories for ${id}`)
  for (const name of names) assert(cards.every(item => item.category !== name || (item.section === id && item.collection === cards.find(other => other.category === name)!.collection)), `Category in two sections or collections: ${name}`)
}
/** “-(으)니까” → 으니까, 니까; “-아서” → 아서; “-을까요?” → 을까요. Hyphens mark where a piece attaches. */
const expand = (form: string) => {
  const bare = form.replace(/-|\?/g, '')
  return bare.includes('(') ? [bare.replace(/[()]/g, ''), bare.replace(/\([^)]*\)/g, '')] : [bare]
}
/** Endings that fuse with their stem (가 + 았어요 → 갔어요) and respectful words in any form (드세요, 드셨어요). */
const conjugating = new Set(['endings', 'tenses', 'speech-levels', 'honorifics'])
function bracketFits(item: (typeof grammarSources)[number], answer: string, pieces: string[]) {
  if (pieces.some(piece => piece.endsWith(answer))) return true
  if (!conjugating.has(item.collection)) return false
  // A fused ending still ends like one of its forms; a respectful word still starts like itself.
  return pieces.some(piece => piece.length >= 2 && answer.endsWith(piece.slice(-2))) || (/다$/.test(item.korean) && answer.startsWith(item.korean[0]))
}
for (const item of grammarSources) {
  const { id, grammar } = item
  assert(id === `${collectionInfo[item.collection]?.prefix}:${item.korean}`, `Grammar ids are prefix:korean by collection: ${id}`)
  assert(/^[가-힣, ?]+$/.test(grammar.speech), `Speech is Korean only: ${id}`)
  assert(grammar.forms.length >= 1 && grammar.forms.length <= 5 && grammar.forms.every(form => form.form.trim() && form.when.trim()), `Forms and when to use them: ${id}`)
  const pieces = grammar.forms.flatMap(form => expand(form.form))
  assert.equal(grammar.examples.length, 3, `Three examples: ${id}`)
  assert.equal(new Set(grammar.examples.map(example => example.korean)).size, 3, `Repeated example: ${id}`)
  for (const example of grammar.examples) {
    const answer = gapAnswer(example)
    assert(/^[^[\]]*\[[^[\]]+\][^[\]]*$/.test(example.korean), `One bracketed piece per example: ${id} “${example.korean}”`)
    // The bracket holds the piece as written: a form, or its end after a contracted stem (가[서], 해[서]), or a fused ending ([갔어요]).
    assert(bracketFits(item, answer, pieces), `The bracket isn't one of the forms: ${id} “${example.korean}”`)
    assert(example.english.trim() && !/[가-힣]/.test(example.english), `English translation: ${id} “${example.korean}”`)
    assert.equal(example.gap.length, 3, `Three wrong options: ${id} “${example.korean}”`)
    assert.equal(new Set([answer, ...example.gap]).size, 4, `Wrong options are distinct from each other and the answer: ${id} “${example.korean}”`)
    assert(example.gap.every(option => /^[가-힣 ?]+$/.test(option)), `Wrong options are Korean pieces: ${id} “${example.korean}”`)
    assert(example.why.trim() && example.why.length <= 160, `A short why: ${id} “${example.korean}”`)
  }
  assert(grammar.rules.length >= 2 && grammar.rules.length <= 5 && grammar.rules.every(rule => rule.length <= 180), `Two to five short usage rules: ${id}`)
  assert(grammar.tricks.length >= 1 && grammar.tricks.length <= 3 && grammar.tricks.every(trick => trick.length <= 160), `One to three short memory tricks: ${id}`)
  assert(grammar.comparisons.length >= 1 && grammar.comparisons.length <= 3, `One to three comparisons: ${id}`)
  for (const comparison of grammar.comparisons) {
    assert(comparison.title.trim() && comparison.with.length, `Comparison title and partner: ${id}`)
    for (const other of comparison.with) assert(cardById.has(other) && other !== id, `Compared with an unknown card: ${id} → ${other}`)
    assert(comparison.points.length >= 2 && comparison.points.length <= 4 && comparison.points.every(point => point.length <= 180), `Two to four short points: ${id} · ${comparison.title}`)
  }
}

// Words: one sentence each, the word bracketed exactly as the card writes it, askable in Complete the sentence.
for (const [id, example] of Object.entries(wordExamples)) {
  const item = cardById.get(id)
  assert(item?.section === 'vocabulary', `An example for a card that isn't a word: ${id}`)
  assert(/^[^[\]]*\[[^[\]]+\][^[\]]*[.?!]$/.test(example.korean), `One bracketed word per sentence, ending in punctuation: ${id} “${example.korean}”`)
  assert.equal(gapAnswer(example), item.korean, `The bracket is the word exactly as written: ${id} “${example.korean}”`)
  assert(example.english.trim() && !/[가-힣]/.test(example.english), `English translation: ${id} “${example.korean}”`)
  assert(questionRuleById.get('complete-sentence')!.supports(item), `Too few words in the category to ask this sentence: ${id}`)
}
// Learn: every unit's cards exist, appear once, and can be met in a sentence.
for (const unit of units) {
  assert(unit.title.trim() && unit.goal.trim() && unitById.get(unit.id) === unit, `A titled unit with a goal and a unique id: ${unit.id}`)
  assert(unit.cards.length >= 3 && unit.cards.length <= 8 && new Set(unit.cards).size === unit.cards.length, `Three to eight distinct cards: ${unit.id}`)
  for (const id of unit.cards) {
    assert(cardById.has(id), `A unit card that doesn't exist: ${unit.id} → ${id}`)
    assert(sentencesOf(cardById.get(id)!).length, `A unit card without a sentence to meet it in: ${unit.id} → ${id}`)
  }
}

/** Anchors written for speakers of one more language: at most one per card and language, beside the core one to three. */
const extraLanguage = (id: string) => /^(it|pt|de)\d$/.test(id)
const used = new Set<string>()
for (const item of [...parsed, ...grammarSources]) {
  const key = memoryAids[item.id] ? item.id : item.korean
  const aid = memoryAids[key]
  assert(aid?.pronunciation, `Missing reviewed memory-aid entry or reading guide: ${item.id}`)
  // Genuinely different candidates, never filler: the learner picks the one that sticks. A word has three ways it
  // sounds (two when a third would be weak) and one way Korean builds it; a grammar point, one to three candidates.
  const core = aid.anchors.filter(anchor => !extraLanguage(anchor.id))
  if (grammarSources.some(source => source.id === item.id)) assert(core.length >= 1 && core.length <= 3, `One to three anchor candidates: ${item.id}`)
  else {
    const sounds = core.filter(anchor => anchor.kind === 'sound' || anchor.kind === 'reading' || anchor.kind === 'loanword').length
    assert(sounds >= 2 && sounds <= 3, `Two or three sound hooks: ${item.id} has ${sounds}`)
    assert.equal(core.filter(anchor => anchor.kind === 'roots' || anchor.kind === 'pattern').length, 1, `One Korean roots or pattern candidate: ${item.id}`)
  }
  for (const language of ['it', 'pt', 'de']) assert(aid.anchors.filter(anchor => extraLanguage(anchor.id) && anchor.language === language).length <= 1, `One ${language} anchor at most: ${item.id}`)
  assert(aid.anchors.filter(anchor => extraLanguage(anchor.id)).every(anchor => anchor.id.startsWith(anchor.language)), `Language anchors are numbered by language: ${item.id}`)
  assert.equal(new Set(aid.anchors.map(anchor => anchor.id)).size, aid.anchors.length, `Candidate ids must be unique: ${item.id}`)
  assert.equal(new Set(aid.anchors.map(anchor => anchor.text.toLowerCase())).size, aid.anchors.length, `Duplicate candidate: ${item.id}`)
  assert(aid.anchors.filter(anchor => anchor.preselected).length <= 1, `One default at most: ${item.id}`)
  const hooks = aid.anchors.filter(anchor => anchor.kind !== 'loanword').map(anchor => hookWords(anchor.text).sort().join(' '))
  assert.equal(new Set(hooks.filter(Boolean)).size, hooks.filter(Boolean).length, `Two candidates share the same hook: ${item.id}`)
  for (const anchor of aid.anchors) {
    assert(anchor.text.length <= 140, `Keep the cue compact: ${item.id}#${anchor.id}`)
    assert(!/think of this word|remember this|associate this with|PENDING|TODO/i.test(anchor.text), `Placeholder: ${item.id}#${anchor.id}`)
  }
  used.add(key)
}
assert.deepEqual(Object.keys(memoryAids).filter(key => !used.has(key)), [], 'Orphaned memory aids')

// Pattern anchors state real Korean: every word in them is a card, a form of one, in the card's Roots record, or reviewed in family-words.ts.
const verbEndings = ['present', 'past', 'casual', 'future', 'want', 'can', 'please'] as const
const particleEndings = new Set(['이에요', '예요', '이야', '에서', '으로', '처럼', '이', '가', '을', '를', '은', '는', '도', '만', '에', '로', '와', '과', '의', '야'])
// A family word's gloss names its reviewed parts too: 봄바람 "spring breeze (봄 + 바람 wind)".
const knownKorean = new Set<string>(Object.entries(familyWords).flatMap(entry => entry.join(' ').match(/[가-힣]+/g) ?? []))
for (const item of cards) {
  for (const text of [item.korean, item.dictionaryForm, item.presentForm]) for (const piece of text?.match(/[가-힣]+/g) ?? []) knownKorean.add(piece)
  if (item.section === 'vocabulary' && item.dictionaryForm) for (const ending of verbEndings) {
    try { for (const piece of conjugate(item.dictionaryForm, ending).match(/[가-힣]+/g) ?? []) knownKorean.add(piece) } catch { /* not every word takes every ending */ }
  }
}
for (const item of cards) for (const anchor of item.anchors.filter(candidate => candidate.kind === 'pattern')) {
  const record = JSON.stringify(item.roots ?? {})
  // A known word may carry a particle or the copula: 직업이, 엔지니어예요, 남자와.
  const known = (piece: string): boolean => knownKorean.has(piece) || record.includes(piece)
    || [...particleEndings].some(ending => piece.endsWith(ending) && piece.length > ending.length && known(piece.slice(0, -ending.length)))
  for (const piece of anchor.text.match(/[가-힣]+/g) ?? []) {
    assert(piece.length === 1 || known(piece), `Unreviewed Korean in a pattern anchor: ${item.id}#${anchor.id} ${piece}`)
  }
  for (const hanja of anchor.text.match(/\p{Script=Han}/gu) ?? []) assert(record.includes(hanja), `Hanja not in the card's record: ${item.id}#${anchor.id} ${hanja}`)
}

/**
 * Cultural anchors are real moments, never written from memory. Each names an official upload and what it was checked
 * against: `lrclib:<record>@<seconds>` (the line in the song's timed lyrics), `length:<seconds>` (the upload is that
 * long, matching the timed track, which is what lets `start` point into it), or a source page.
 */
const youtubeWatch = /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/
/** The bracketed piece is the word: a noun with whatever follows it (봄날, 엄마가), or a verb or adjective in any form (좋은, 갔어). */
function formOf(item: (typeof cards)[number], piece: string) {
  const bare = piece.replace(/\s+/g, '')
  if (bare.includes(item.korean.replace(/\s+/g, ''))) return true
  const stem = item.dictionaryForm?.replace(/\s+/g, '').replace(/다$/, '')
  // A color is sung or said without its 색: 빨간 for 빨간색.
  if (!stem && /^[가-힣]+색$/.test(item.korean) && bare.startsWith(item.korean.slice(0, -1))) return true
  if (!stem) {
    const noun = item.korean.replace(/\s+/g, '')
    // A noun may fuse with a contracted 는 or 를: 오빠는 → 오빤, 나를 → 날.
    const code = noun.charCodeAt(noun.length - 1) - 0xac00
    const fused = code >= 0 && code % 28 === 0 ? [4, 8].map(tail => noun.slice(0, -1) + String.fromCharCode(0xac00 + code + tail)) : []
    return bare.startsWith(noun) || fused.some(form => bare.startsWith(form))
  }
  const initial = (syllable: string) => Math.floor((syllable.charCodeAt(0) - 0xac00) / 588)
  const head = stem.slice(0, -1)
  // A noun + 하다 verb is heard in its noun too: 요리 in 흑백요리사 for 요리해요.
  if (stem.endsWith('하') && head.length >= 2 && bare.startsWith(head)) return true
  // 르 stems put an ㄹ under the syllable before (다르다 → 달라, 빠르다 → 빨라): compare that syllable without its final.
  const open = (syllable: string) => Math.floor((syllable.charCodeAt(0) - 0xac00) / 28)
  const sameHead = bare.startsWith(head) || (head.length > 0 && bare.startsWith(head.slice(0, -1)) && open(bare[head.length - 1]) === open(head.at(-1)!))
  return sameHead && bare.length > head.length && initial(bare[head.length]) === initial(stem.at(-1)!)
}
/** A phrase is heard when its words come in order, each at least by its first syllables: 제일 좋아하는 for 제일 좋아해요. */
function phraseIn(item: (typeof cards)[number], piece: string) {
  let rest = piece.replace(/\s+/g, '')
  for (const word of item.korean.replace(/[?.!]/g, '').split(/\s+/)) {
    const lead = word.slice(0, Math.max(1, Math.min(2, word.length - 1)))
    const at = rest.indexOf(lead)
    if (at < 0) return false
    rest = rest.slice(at + lead.length)
  }
  return true
}
let cultural = 0
for (const [id, entries] of Object.entries(cultureAnchors)) {
  const item = cardById.get(id)
  assert(item, `Cultural anchor for an unknown card: ${id}`)
  assert(entries.length <= 2, `One or two cultural anchors at most: ${id}`)
  for (const [index, entry] of entries.entries()) {
    const where = `${id}#${entry.id}`
    assert.equal(entry.id, `c${index + 1}`, `Cultural anchors are numbered c1, c2: ${where}`)
    assert(['song', 'drama', 'film', 'show', 'animation'].includes(entry.media), `Unknown media: ${where}`)
    assert(entry.title.trim() && entry.by.trim(), `A title and who it's by: ${where}`)
    assert(/^[^[\]]*\[[^[\]]+\][^[\]]*$/.test(entry.quote) && entry.quote.length <= 80, `One short line with one bracketed form: ${where}`)
    const heard = gapAnswer({ korean: entry.quote })
    assert(item.id.startsWith('phrase:') ? phraseIn(item, heard) : formOf(item, heard), `The bracket isn't the word or a form of it: ${where} “${entry.quote}”`)
    assert(entry.translation.trim() && !/[가-힣]/.test(entry.translation), `The line in English: ${where}`)
    assert(entry.why.trim() && entry.why.length <= 120, `One short line on why it sticks: ${where}`)
    assert(youtubeWatch.test(entry.url) && (entry.video === undefined || youtubeWatch.test(entry.video)), `Official uploads' plain watch URLs: ${where}`)
    assert(typeof entry.embed === 'boolean', `Whether it may play inside the app: ${where}`)
    assert(/^\d{4}-\d{2}-\d{2}$/.test(entry.checked), `The day it was checked: ${where}`)
    assert(entry.evidence.length && entry.evidence.every(proof => /^(https:\/\/\S+|lrclib:\d+@\d+(\.\d+)?|length:\d+)$/.test(proof)), `What it was checked against: ${where}`)
    if (entry.start !== undefined) {
      // A start second is only kept when the upload is the timed track (same length), and it leads into the line.
      const line = entry.evidence.map(proof => proof.match(/^lrclib:\d+@([\d.]+)$/)?.[1]).find(Boolean)
      assert(Number.isInteger(entry.start) && entry.start >= 0, `A whole second: ${where}`)
      assert(line && entry.evidence.some(proof => proof.startsWith('length:')), `A start second needs the timed line and the upload's length: ${where}`)
      assert(Number(line) - entry.start >= 0 && Number(line) - entry.start <= 4, `The start leads into the line: ${where}`)
    }
    cultural++
  }
}
assert.deepEqual(Object.keys(originReviews).sort(), cards.map(item => item.id).sort(), 'Every card needs an explicit origin review')
const validOrigins = new Set(['native', 'sino-korean', 'loanword', 'mixed', 'phrase', 'uncertain'])
const usedComponents = new Set<string>()
const usedSources = new Set<string>()
for (const item of cards) {
  const review = originReviews[item.id]
  assert(review.lemma && validOrigins.has(review.kind), `Invalid origin review: ${item.id}`)
  assert(review.sourceIds.length || (review.kind === 'uncertain' && review.omissionReason && review.lookupUrls?.length), `Unaccounted research: ${item.id}`)
  assert(review.componentIds.length || review.note || review.omissionReason, `Record an omission decision: ${item.id}`)
  assert.equal(new Set(review.componentIds).size, review.componentIds.length, `Repeated component: ${item.id}`)
  for (const id of review.componentIds) {
    const component = rootConcepts[id]
    assert(component?.meaning && component.label, `Missing meaningful component: ${id}`)
    assert(['hanja', 'stem', 'pattern', 'loanword'].includes(component.kind), `Invalid component kind: ${id}`)
    if (component.kind === 'hanja') assert.equal(id, `hanja:${component.hanja}`, `Hanja identities must be explicit: ${id}`)
    usedComponents.add(id)
  }
  for (const id of review.sourceIds) {
    assert(originSources[id]?.title && originSources[id].url.startsWith('https://'), `Missing source: ${id}`)
    usedSources.add(id)
  }
  // Factual anchors are labelled as verified, so the card's Roots reveal must carry the evidence.
  for (const anchor of item.anchors) {
    if (anchor.kind === 'roots' || anchor.kind === 'loanword') {
      assert(item.roots?.sources.length, `A factual anchor needs a sourced Roots aid: ${item.id}#${anchor.id}`)
    }
    if (anchor.kind === 'loanword') assert(['loanword', 'mixed', 'phrase'].includes(review.kind), `Not a reviewed loanword: ${item.id}#${anchor.id}`)
    if (anchor.kind === 'roots') {
      // A root anchor states only what the record says: its Hanja are the card's, and its Korean pieces come from the card,
      // its note and components, or a card that shares a component. A shared syllable alone never links two words.
      const kin = cards.filter(other => other.id !== item.id && originReviews[other.id].componentIds.some(id => review.componentIds.includes(id)))
      const record = [item.korean, item.dictionaryForm, item.presentForm, review.note, ...review.componentIds.map(id => `${rootConcepts[id].label} ${rootConcepts[id].hanja ?? ''}`), ...kin.map(other => other.korean)].join(' ')
      for (const hanja of anchor.text.match(/\p{Script=Han}/gu) ?? []) assert(record.includes(hanja), `Hanja not in the card's record: ${item.id}#${anchor.id} ${hanja}`)
      for (const korean of anchor.text.match(/[가-힣]+/g) ?? []) assert(record.includes(korean), `Korean not in the card's record or a related card: ${item.id}#${anchor.id} ${korean}`)
      const parsed = rootParts(anchor.text)
      if (parsed) for (const part of parsed.parts) assert.equal(part.meaning, part.meaning.toUpperCase(), `Part meanings are in capitals: ${item.id}#${anchor.id}`)
    }
  }
  // Wherever the record breaks a word into meaningful parts, one candidate explains them.
  if (review.note && /[가-힣]+ \(\p{Script=Han}+\) = .+; [가-힣]+ \(\p{Script=Han}+\) = /u.test(review.note)) {
    assert(item.anchors.some(anchor => anchor.kind === 'roots'), `A Hanja breakdown without a root-based anchor: ${item.id}`)
  }
  if (item.roots) {
    assert(item.roots.sources.length, `Roots without evidence: ${item.id}`)
    assert(item.roots.related.length <= 5, `Too many related cards: ${item.id}`)
    for (const related of item.roots.related) {
      assert.notEqual(related.id, item.id)
      const shared = review.componentIds.filter(id => originReviews[related.id].componentIds.includes(id))
      assert(shared.length, `Unsupported link: ${item.id} → ${related.id}`)
      assert(shared.some(id => related.connection.includes(rootConcepts[id].meaning)), `Explain the shared meaning: ${related.id}`)
    }
  }
}
assert.deepEqual(Object.keys(rootConcepts).filter(id => !usedComponents.has(id)), [], 'Orphaned components')
assert.deepEqual(Object.keys(originSources).filter(id => !usedSources.has(id)), [], 'Orphaned sources')
// Test hints and typed-answer synonyms: a clue for every card that never says the answer, and synonyms that really count.
assert.deepEqual(Object.keys(recallData).filter(id => !cardById.has(id)), [], 'Orphaned recall data')
for (const item of cards) {
  const { clue = '', accept = [] } = recallData[item.id] ?? {}
  assert(clue.trim() && clue.length <= 90 && !/[가-힣]/.test(clue), `A short English clue for every card: ${item.id}`)
  assert(!mentions(clue, meaningTerms(acceptedTexts(item))) && !givesAway(clue, item), `The clue gives the answer away: ${item.id}`)
  assert.equal(new Set(accept).size, accept.length, `Repeated synonym: ${item.id}`)
  for (const text of accept) {
    assert(text.trim() && !/[가-힣]/.test(text), `Synonyms are English: ${item.id}`)
    assert.equal(matchEnglish(text, item).result, 'correct', `A synonym the matcher doesn't accept: ${item.id} “${text}”`)
  }
}
const counts = Object.fromEntries([...new Set(parsed.map(item => item.category))].map(category => [category, parsed.filter(item => item.category === category).length]))
console.log(`✓ ${tableRows.length}/${tableRows.length} source table rows covered`)
console.log(`✓ ${parsed.filter(item => item.sourceKind === 'table').length} table cards (alternatives split), ${parsed.filter(item => item.sourceKind === 'heading').length} heading words, ${phrases.length} prose phrases`)
const collectionCounts = collectionList.map(collection => `${grammarSources.filter(item => item.collection === collection.id).length} ${collection.label.toLowerCase()}`).join(', ')
console.log(`✓ Grammar: ${collectionCounts}; forms, ${grammarSources.length * 3} bracketed examples with 3 wrong options and a why each, usage rules, memory tricks, comparisons`)
console.log(`✓ ${Object.keys(wordExamples).length}/${parsed.filter(item => item.category !== 'Useful phrases').length} words have an example sentence, each askable in Complete the sentence`)
console.log(`✓ ${units.length} Learn units, ${units.reduce((total, unit) => total + unit.cards.length, 0)} cards, every one met in a sentence`)
console.log(`✓ ${cards.length}/${cards.length} cards have reviewed memory-aid entries and reading guides`)
const extras = cards.flatMap(item => item.anchors.filter(anchor => extraLanguage(anchor.id)))
const words = cards.filter(item => item.section === 'vocabulary')
const own = (item: (typeof cards)[number]) => item.anchors.filter(anchor => !extraLanguage(anchor.id))
const soundCount = (item: (typeof cards)[number]) => own(item).filter(anchor => ['sound', 'reading', 'loanword'].includes(anchor.kind)).length
console.log(`✓ Words: ${words.reduce((total, item) => total + own(item).length, 0)} Memory Anchor candidates (${words.filter(item => soundCount(item) === 3).length} words with three sound hooks, ${words.filter(item => soundCount(item) === 2).length} with two; one roots or pattern candidate each; ${cultural} media moments on ${words.filter(item => item.anchors.some(anchor => anchor.kind === 'culture')).length} words)`)
console.log(`✓ Grammar: ${cards.filter(item => item.section === 'grammar').reduce((total, item) => total + own(item).length, 0)} candidates, 1 to 3 per card; plus ${extras.length} for speakers of Italian, Portuguese, or German; ${cards.filter(item => item.anchors.some(anchor => anchor.preselected)).length} five-star defaults`)
console.log(`✓ ${cards.filter(item => item.anchors.some(anchor => anchor.kind === 'roots')).length} cards with a root-based anchor, ${cards.filter(item => item.anchors.some(anchor => anchor.kind === 'roots' && rootParts(anchor.text))).length} of them part by part; every Hanja and Korean piece checked against the record`)
console.log(`✓ ${cards.length}/${cards.length} origin review records; ${cards.filter(item => item.roots).length} sourced Roots aids`)
console.log(`✓ ${usedComponents.size} explicit component identities; no relationships inferred from matching syllables`)
console.log('✓ All Korean prose accounted for; source meanings and forms preserved')
console.log(`✓ ${cards.length}/${cards.length} test clues that keep the answer hidden; ${Object.values(recallData).reduce((total, entry) => total + (entry.accept?.length ?? 0), 0)} reviewed synonyms`)
console.table(counts)
