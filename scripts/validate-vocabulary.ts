import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseVocabulary, phrases, proseNotes } from '../src/data/source'
import { memoryAids } from '../src/data/memory-aids'
import { rootParts } from '../src/data/root-anchors'
import { recallData } from '../src/data/recall-data'
import { originReviews, originSources, rootConcepts } from '../src/data/roots'
import { cardById, cards, sections } from '../src/data/cards'
import { grammarSources } from '../src/data/grammar'
import { gapAnswer } from '../src/recall/questionRules'
import { acceptedTexts, givesAway, matchEnglish } from '../src/recall/english'
import { meaningTerms, mentions } from '../src/recall/hints'

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

// Connectors and particles: ids by section, and categories that never repeat across sections (a category names its section).
assert.equal(new Set(cards.map(item => item.id)).size, cards.length, 'Duplicate card ids across sections')
for (const { id, all } of sections) {
  const names = new Set(cards.filter(item => item.section === id).map(item => item.category))
  assert(names.size && !names.has(all), `Categories for ${id}`)
  for (const name of names) assert(cards.every(item => item.category !== name || item.section === id), `Category in two sections: ${name}`)
}
/** “-(으)니까” → 으니까, 니까; “-아서” → 아서. Hyphens mark where a piece attaches. */
const expand = (form: string) => {
  const bare = form.replace(/-/g, '')
  return bare.includes('(') ? [bare.replace(/[()]/g, ''), bare.replace(/\([^)]*\)/g, '')] : [bare]
}
for (const item of grammarSources) {
  const { id, section, grammar } = item
  assert(id === `${section === 'connectors' ? 'connector' : 'particle'}:${item.korean}`, `Grammar ids are section:korean: ${id}`)
  assert(/^[가-힣, ]+$/.test(grammar.speech), `Speech is Korean only: ${id}`)
  assert(grammar.forms.length >= 1 && grammar.forms.length <= 5 && grammar.forms.every(form => form.form.trim() && form.when.trim()), `Forms and when to use them: ${id}`)
  const pieces = grammar.forms.flatMap(form => expand(form.form))
  assert.equal(grammar.examples.length, 3, `Three examples: ${id}`)
  assert.equal(new Set(grammar.examples.map(example => example.korean)).size, 3, `Repeated example: ${id}`)
  for (const example of grammar.examples) {
    const answer = gapAnswer(example)
    assert(/^[^[\]]*\[[^[\]]+\][^[\]]*$/.test(example.korean), `One bracketed piece per example: ${id} “${example.korean}”`)
    // The bracket holds the piece as written: a form, or its end after a contracted stem (가[서], 해[서]).
    assert(pieces.some(piece => piece.endsWith(answer)), `The bracket isn't one of the forms: ${id} “${example.korean}”`)
    assert(example.english.trim() && !/[가-힣]/.test(example.english), `English translation: ${id} “${example.korean}”`)
    assert.equal(example.gap.length, 3, `Three wrong options: ${id} “${example.korean}”`)
    assert.equal(new Set([answer, ...example.gap]).size, 4, `Wrong options are distinct from each other and the answer: ${id} “${example.korean}”`)
    assert(example.gap.every(option => /^[가-힣 ]+$/.test(option)), `Wrong options are Korean pieces: ${id} “${example.korean}”`)
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

const used = new Set<string>()
for (const item of [...parsed, ...grammarSources]) {
  const key = memoryAids[item.id] ? item.id : item.korean
  const aid = memoryAids[key]
  assert(aid?.pronunciation, `Missing reviewed memory-aid entry or reading guide: ${item.id}`)
  // Three genuinely different candidates: the learner picks the one that sticks.
  assert.equal(aid.anchors.length, 3, `Three anchor candidates: ${item.id}`)
  assert.equal(new Set(aid.anchors.map(anchor => anchor.id)).size, 3, `Candidate ids must be unique: ${item.id}`)
  assert.equal(new Set(aid.anchors.map(anchor => anchor.text.toLowerCase())).size, 3, `Duplicate candidate: ${item.id}`)
  assert(aid.anchors.filter(anchor => anchor.preselected).length <= 1, `One default at most: ${item.id}`)
  const hooks = aid.anchors.filter(anchor => anchor.kind !== 'loanword').map(anchor => (anchor.text.match(/\b[A-ZÁÉÍÓÚÑÀÈÊÎÔÛÇ][A-ZÁÉÍÓÚÑÀÈÊÎÔÛÇ'-]+\b/g) ?? []).sort().join(' '))
  assert.equal(new Set(hooks.filter(Boolean)).size, hooks.filter(Boolean).length, `Two candidates share the same hook: ${item.id}`)
  for (const anchor of aid.anchors) {
    assert(anchor.text.length <= 140, `Keep the cue compact: ${item.id}#${anchor.id}`)
    assert(!/think of this word|remember this|associate this with|PENDING|TODO/i.test(anchor.text), `Placeholder: ${item.id}#${anchor.id}`)
  }
  used.add(key)
}
assert.deepEqual(Object.keys(memoryAids).filter(key => !used.has(key)), [], 'Orphaned memory aids')
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
const connectors = grammarSources.filter(item => item.section === 'connectors').length
console.log(`✓ ${connectors} connectors and ${grammarSources.length - connectors} particles: forms, ${grammarSources.length * 3} bracketed examples with 3 wrong options and a why each, usage rules, memory tricks, comparisons`)
console.log(`✓ ${cards.length}/${cards.length} cards have reviewed memory-aid entries and reading guides`)
console.log(`✓ ${cards.reduce((total, item) => total + item.anchors.length, 0)} Memory Anchor candidates, 3 per card; ${cards.filter(item => item.anchors.some(anchor => anchor.preselected)).length} five-star defaults`)
console.log(`✓ ${cards.filter(item => item.anchors.some(anchor => anchor.kind === 'roots')).length} cards with a root-based anchor, ${cards.filter(item => item.anchors.some(anchor => anchor.kind === 'roots' && rootParts(anchor.text))).length} of them part by part; every Hanja and Korean piece checked against the record`)
console.log(`✓ ${cards.length}/${cards.length} origin review records; ${cards.filter(item => item.roots).length} sourced Roots aids`)
console.log(`✓ ${usedComponents.size} explicit component identities; no relationships inferred from matching syllables`)
console.log('✓ All Korean prose accounted for; source meanings and forms preserved')
console.log(`✓ ${cards.length}/${cards.length} test clues that keep the answer hidden; ${Object.values(recallData).reduce((total, entry) => total + (entry.accept?.length ?? 0), 0)} reviewed synonyms`)
console.table(counts)
