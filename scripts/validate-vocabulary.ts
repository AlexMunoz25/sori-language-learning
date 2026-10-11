import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseVocabulary, phrases, proseNotes } from '../src/data/source'
import { memoryAids } from '../src/data/memory-aids'
import { originReviews, originSources, rootConcepts } from '../src/data/roots'
import { vocabulary } from '../src/data/vocabulary'

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

const used = new Set<string>()
for (const item of parsed) {
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
assert.deepEqual(Object.keys(originReviews).sort(), parsed.map(item => item.id).sort(), 'Every card needs an explicit origin review')
const validOrigins = new Set(['native', 'sino-korean', 'loanword', 'mixed', 'phrase', 'uncertain'])
const usedComponents = new Set<string>()
const usedSources = new Set<string>()
for (const item of vocabulary) {
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
const counts = Object.fromEntries([...new Set(parsed.map(item => item.category))].map(category => [category, parsed.filter(item => item.category === category).length]))
console.log(`✓ ${tableRows.length}/${tableRows.length} source table rows covered`)
console.log(`✓ ${parsed.filter(item => item.sourceKind === 'table').length} table cards (alternatives split), ${parsed.filter(item => item.sourceKind === 'heading').length} heading words, ${phrases.length} prose phrases`)
console.log(`✓ ${parsed.length}/${parsed.length} cards have reviewed memory-aid entries and reading guides`)
console.log(`✓ ${vocabulary.reduce((total, item) => total + item.anchors.length, 0)} Memory Anchor candidates, 3 per card; ${vocabulary.filter(item => item.anchors.some(anchor => anchor.preselected)).length} five-star defaults`)
console.log(`✓ ${vocabulary.length}/${vocabulary.length} origin review records; ${vocabulary.filter(item => item.roots).length} sourced Roots aids`)
console.log(`✓ ${usedComponents.size} explicit component identities; no relationships inferred from matching syllables`)
console.log('✓ All Korean prose accounted for; source meanings and forms preserved')
console.table(counts)
