import type { CultureSource, VocabularyItem } from '../types/vocabulary'

/** A nudge toward the answer that never states it. Any hint caps the question at half a point. */
export interface Hint {
  /** narrow: takes two wrong options away from a choice question. */
  kind: 'anchor' | 'meaning' | 'form' | 'narrow' | 'rule'
  text: string
}

const hangulRun = /[ᄀ-ᇿ㄰-㆏가-힯][ᄀ-ᇿ㄰-㆏가-힯\s?!.,·-]*/g
const capsWord = /\p{Lu}[\p{Lu}'’-]*\p{Lu}/gu
/**
 * An anchor's hook words: whole words in capitals, in any language (BULB, MÃE, ÜBERMORGEN, I'LL), never Korean, which
 * has no capitals. They make two candidates the same idea, and a keyword one card's own.
 */
export const hookWords = (text: string) => (text.match(/\p{L}(?:\p{L}|['’-](?=\p{L}))*/gu) ?? [])
  // A capitalized compound is one keyword (NAIL-THIN, TO-GO); in a mixed one only the capital part counts (Go-go-GADGET).
  .flatMap(word => capital(word) ? [word] : word.split('-'))
  .filter(word => word.replace(/['’-]/g, '').length >= 2 && capital(word))
const capital = (word: string) => word === word.toUpperCase() && word !== word.toLowerCase()

/** Words that only hold an answer together; "like", "most", or "what" can be the answer itself, so they are masked. */
const functionWords = new Set(['a', 'an', 'the', 'to', 'of', 'and', 'or', 'in', 'on', 'at', 'for', 'with', 'is', 'be', 'do', 'you', 'your', 'it'])

const tidy = (text: string) => text
  .replace(/\(\s*\)/g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s+([,.;:!?)”’])/g, '$1')
  .replace(/([(“‘])\s+/g, '$1')
  .replace(/^[\s:;,.+=–—-]+|[\s:;,+=–—-]+$/g, '')
  .trim()

/** The word's reading guide as syllables (ye-ppeo-yo → ye, ppeo, yo): hints never spell the Korean sound out. */
export const readingSyllables = (item: VocabularyItem) => (item.pronunciation ?? '').toLowerCase().split(/[^a-z]+/).filter(part => part.length >= 2)

/** A romanised piece of the word itself (ju-MAL, TAE-KKWON-DO, po-do, myeon). Hyphenated English (ice-cold) and CAPITAL hooks stay. */
function spellsWord(token: string, syllables: string[]) {
  const word = token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')
  if (word.includes('-')) return word.toLowerCase().split('-').some(part => syllables.includes(part))
  return word.length >= 3 && word === word.toLowerCase() && syllables.includes(word)
}
const leaks = (text: string, syllables: string[]) => /[가-힣ᄀ-ᇿ㄰-㆏]/.test(text) || text.split(/\s+/).some(token => spellsWord(token, syllables))

/**
 * The familiar part of an anchor: the phrase before its first arrow or sound mapping, without Korean or the word's own
 * reading. "A light BULB: bright → 밝 balk" gives "A light BULB: bright"; "Saturday at the MALL: ju-MAL" gives
 * "Saturday at the MALL"; "BORDEAUX grapes (포도 po-do) + JUICE" gives "BORDEAUX grapes + JUICE".
 */
export function anchorHook(text: string, syllables: string[] = []) {
  // An arrow inside brackets ("FANTASY (f → p)") is part of the hook, not the end of it.
  const beforeArrow = text.split(/→(?![^(]*\))/)[0]
  const cut = beforeArrow.indexOf('≈')
  let hook = cut >= 0 ? beforeArrow.slice(0, cut).replace(/[:;,]\s*[a-zà-ÿ'’ -]{1,24}$/, '') : beforeArrow
  hook = hook.replace(hangulRun, ' ')
  // Only a reading, the word's own or the keyword's: "(po-do)", ": ju-MAL", ": ko-be", ": …myun".
  const onlyReading = (part: string) => {
    const tokens = part.split(/[\s,.:;=+]+/).filter(Boolean)
    return !!tokens.length && tokens.every(token => spellsWord(token, syllables) || /^…?[a-z]+(-[a-z]+)+$|^…[a-z]+$/.test(token))
  }
  hook = hook.replace(/\(([^)]*)\)/g, (group, inner: string) => onlyReading(inner) ? ' ' : group)
  hook = hook.replace(/[:;,=]\s*[^:;,=]*$/, tail => onlyReading(tail.slice(1)) ? '' : tail)
  return tidy(hook)
}

/** Irregular forms, so a hint can't say "bought" for to buy or "ran" for to run. */
const irregular: Record<string, string> = {
  went: 'go', gone: 'go', came: 'come', ate: 'eat', eaten: 'eat', drank: 'drink', drunk: 'drink', slept: 'sleep', taught: 'teach',
  learnt: 'learn', saw: 'see', seen: 'see', met: 'meet', wrote: 'write', written: 'write', bought: 'buy', made: 'make', gave: 'give',
  given: 'give', woke: 'wake', woken: 'wake', got: 'get', spoke: 'speak', spoken: 'speak', heard: 'hear', rode: 'ride', ridden: 'ride',
  took: 'take', taken: 'take', swam: 'swim', ran: 'run', sang: 'sing', sung: 'sing', men: 'man', women: 'woman', children: 'child',
}
const spellings: Record<string, string> = { grey: 'gray', colour: 'color', favourite: 'favorite', mum: 'mom', theatre: 'theater', centre: 'center' }
/** Lower case, without accents or a possessive, in one spelling: MAMÁ → mama, Grey → gray, Red's → red. */
const base = (word: string) => {
  const lower = word.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/['’]s$/, '')
  return irregular[lower] ?? spellings[lower] ?? lower
}
/** A word's stem for loose matching: different ~ difference, beautiful ~ beauty, learns ~ learn. */
const stem = (word: string) => word.replace(/(ing|ed|es|s|ly|ness|ful)$/, '').slice(0, 7)
/** The same word in any form: Red's, fastest, faraway, hates, writing, cries, prettiest, bought, MAMÁ. Masking too much only hides more. */
const sameWord = (word: string, term: string) => {
  const [a, b] = [base(word), base(term)]
  if (a === b || (b.length >= 3 && a.startsWith(b))) return true
  // write → writing, make → making; cry → cries, pretty → prettiest
  const root = b.slice(0, -1)
  const endings = b.endsWith('e') ? /^(ing|ed|er|est)$/ : b.endsWith('y') ? /^(ies|ied|ier|iest|ily|iness)$/ : undefined
  if (endings && b.length >= 3 && a.startsWith(root) && endings.test(a.slice(root.length))) return true
  const [x, y] = [stem(a), stem(b)]
  return x.length >= 2 && (x === y || (Math.min(x.length, y.length) >= 5 && (x.startsWith(y) || y.startsWith(x))))
}

/** Whether a text says any of these words, in any form: a clue that does would give the answer away. */
export const mentions = (text: string, terms: string[]) => (text.match(/[A-Za-zÀ-ÿ'’]+/g) ?? []).some(word => terms.some(term => sameWord(word, term)))

/** Content words of every way to say the meaning (senses and accepted synonyms), for masking. */
export function meaningTerms(answers: string[]) {
  return [...new Set(answers.flatMap(sense => sense.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().split(/[^a-z'’]+/)).filter(word => word.length > 1 && !functionWords.has(word)))]
}

/** Enough left to jog the memory: at least one real word besides the blanks. */
const useful = (text: string) => text.split(/[^\p{L}]+/u).some(word => word.length >= 3)

/** Korean → English: the anchor with the meaning blanked out, e.g. "A light BULB: ___". Undefined if nothing useful and safe is left. */
export function anchorCloze(text: string, terms: string[], syllables: string[] = []) {
  const hook = anchorHook(text, syllables)
  let masked = false
  const cloze = tidy(hook.replace(/[A-Za-zÀ-ÿ'’]+/g, word => terms.some(term => sameWord(word, term)) ? (masked = true, '___') : word)).replace(/___(\s*,?\s*___)+/g, '___')
  if (!useful(cloze) || leaks(cloze, syllables)) return undefined
  return masked || /[A-Z]{2}/.test(cloze) ? cloze : undefined
}

/**
 * English → Korean: the anchor with its sound keywords cut to a first letter, e.g. "A light B…: bright". A hook without
 * keywords is only offered when it is the learner's own, as its opening words.
 */
export function anchorPrompt(text: string, syllables: string[] = [], own = false) {
  const hook = anchorHook(text, syllables)
  const keywords = [...new Set(hook.match(capsWord) ?? [])]
  let masked: string | undefined
  if (keywords.length) {
    masked = hook.replace(capsWord, keyword => `${keyword[0]}…`)
    // A keyword repeated in lower case would give it away again.
    for (const keyword of keywords) masked = masked.replace(new RegExp(`\\b${keyword.toLowerCase().replace(/[’']/g, "['’]")}\\b`, 'g'), `${keyword[0].toLowerCase()}…`)
    masked = tidy(masked)
  } else if (own) {
    const words = hook.split(' ')
    masked = words.length > 3 ? `${words.slice(0, Math.ceil(words.length / 2)).join(' ')}…` : undefined
  }
  return masked && useful(masked) && !leaks(masked, syllables) ? masked : undefined
}

/** Korean → English, from a song or show: its line in English with the meaning blanked, and whose it is. */
export function cultureCloze(source: CultureSource, terms: string[], syllables: string[] = []) {
  const line = tidy(source.translation.replace(/[A-Za-zÀ-ÿ'’]+/g, word => terms.some(term => sameWord(word, term)) ? '___' : word)).replace(/___(\s*,?\s*___)+/g, '___')
  const cue = `“${line}” (${source.by})`
  return useful(line) && !leaks(cue, syllables) ? cue : undefined
}

/** English → Korean, from a song or show: what it is and its English title, never its Korean or a reading. */
export function cultureCue(source: CultureSource, syllables: string[] = []) {
  const english = tidy(source.title.replace(hangulRun, ' ').replace(/[()]/g, ' '))
  const kind = { song: 'song', drama: 'drama', film: 'film', show: 'show', animation: 'cartoon' }[source.media]
  // An English title can spell the Korean itself (Bom Bom Bom, Tayo): then only what it is and whose.
  const reading = syllables.join('')
  const spells = english.toLowerCase().split(/[^a-z]+/).some(word => word.length >= 2 && (syllables.includes(word) || (reading.length >= 3 && word.includes(reading))))
  const cue = useful(english) && !spells ? `${source.by}’s ${kind} “${english}”` : `a ${kind} by ${source.by}`
  return leaks(cue, syllables) ? undefined : `Heard in ${cue}`
}

const syllables = (korean: string) => [...korean].filter(char => /[가-힯]/.test(char)).length

/** English → Korean: the word's shape, never its syllables: "3 syllables · starts with an “s” sound". */
export function formHint(item: VocabularyItem) {
  const words = item.korean.trim().split(/\s+/).length
  const count = syllables(item.korean)
  const reading = (item.pronunciation ?? '').toLowerCase()
  const onset = reading.match(/^[^aeiou\s-]+/)?.[0]
  const shape = words > 1 ? `${words} words, ${count} syllables` : `${count} ${count === 1 ? 'syllable' : 'syllables'}`
  // Letter names: an “s” sound, a “b” sound.
  return `${shape} · starts with ${onset ? `${/^[fhlmnrsx]/.test(onset) ? 'an' : 'a'} “${onset}” sound` : 'a vowel sound'}`
}

/** Korean → English, when no clue was written for the card: what kind of word it is. */
const categoryClues: Record<string, string> = {
  Adjectives: 'It describes how something is.',
  Verbs: 'It’s something you do.',
  'Time & days': 'It’s about when.',
  'Sports / Exercise': 'It’s a way to move or play.',
  Seasons: 'It’s a time of year.',
  Colors: 'It’s something you see, not touch.',
  Fruit: 'It grows on a tree or a vine.',
  Drinks: 'You’d have it in a glass or a cup.',
  Food: 'You’d find it at the table.',
  Movies: 'You’d find it at the cinema.',
  Music: 'You’d hear it rather than see it.',
  Family: 'It’s about the people closest to you.',
  Objects: 'It’s a thing you can hold or use.',
  'Jobs / Occupations': 'It’s what someone does for a living.',
  Places: 'It’s somewhere you can go.',
  'Useful words': 'It helps you ask or talk about things.',
  'Useful phrases': 'It’s something you’d say in a conversation.',
}
export const categoryClue = (item: VocabularyItem) => categoryClues[item.category] ?? 'Think of where you met this word.'
