import type { VocabularyItem } from '../types/vocabulary'

/** A nudge toward the answer that never states it. Any hint caps the question at half a point. */
export interface Hint {
  kind: 'anchor' | 'meaning' | 'form'
  text: string
}

const hangulRun = /[ᄀ-ᇿ㄰-㆏가-힯][ᄀ-ᇿ㄰-㆏가-힯\s?!.,·-]*/g
const capsWord = /[A-ZÁÉÍÓÚÑÀÈÊÎÔÛÇÄÖÜ][A-ZÁÉÍÓÚÑÀÈÊÎÔÛÇÄÖÜ'’-]*[A-ZÁÉÍÓÚÑÀÈÊÎÔÛÇÄÖÜ]/g
const stopWords = new Set(['a', 'an', 'the', 'to', 'of', 'and', 'or', 'in', 'on', 'at', 'for', 'with', 'is', 'be', 'do', 'you', 'your', 'it', 'what', 'who', 'how', 'like', 'most', 'some', 'this', 'that', 'very', 'so', 'not'])

const tidy = (text: string) => text
  .replace(/\(\s*\)/g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s+([,.;:!?)”’])/g, '$1')
  .replace(/([(“‘])\s+/g, '$1')
  .replace(/^[\s:;,.–—-]+|[\s:;,–—-]+$/g, '')
  .trim()

/**
 * The familiar part of an anchor: the phrase before its first arrow or sound mapping, without Korean,
 * readings, or the romanised fragment a mapping starts with. "A light BULB: bright → 밝 balk" gives
 * "A light BULB: bright"; "Me queda CHICO (es. too small): chi-co ≈ ja-ga" gives "Me queda CHICO (es. too small)".
 */
export function anchorHook(text: string) {
  const beforeArrow = text.split('→')[0]
  const cut = beforeArrow.indexOf('≈')
  let hook = cut >= 0 ? beforeArrow.slice(0, cut).replace(/[:;,]\s*[a-zà-ÿ'’ -]{1,24}$/, '') : beforeArrow
  hook = hook.replace(hangulRun, ' ')
  return tidy(hook)
}

/** A word's stem for loose matching: different ~ difference, beautiful ~ beauty, learns ~ learn. */
const stem = (word: string) => word.toLowerCase().replace(/(ing|ed|es|s|ly|ness|ful)$/, '').slice(0, 7)
const sameWord = (word: string, term: string) => {
  const [a, b] = [stem(word), stem(term)]
  return a.length >= 3 && b.length >= 3 && (a === b || (Math.min(a.length, b.length) >= 5 && (a.startsWith(b) || b.startsWith(a))))
}

/** Content words of every way to say the meaning (senses and accepted synonyms), for masking. */
export function meaningTerms(item: VocabularyItem, synonyms: string[] = []) {
  return [...new Set([item.meaning, ...synonyms].flatMap(sense => sense.toLowerCase().split(/[^a-z'’]+/)).filter(word => word.length > 1 && !stopWords.has(word)))]
}

/** Korean → English: the anchor with the meaning blanked out, e.g. "A light BULB: ___". Undefined if nothing useful is left. */
export function anchorCloze(text: string, terms: string[]) {
  const hook = anchorHook(text)
  let masked = false
  const cloze = hook.replace(/[A-Za-zÀ-ÿ'’]+/g, word => terms.some(term => sameWord(word, term)) ? (masked = true, '___') : word)
  return tidy(cloze).replace(/___(\s*,?\s*___)+/g, '___').length > 3 && (masked || /[A-Z]{2}/.test(cloze)) ? tidy(cloze) : undefined
}

/** English → Korean: the anchor with its sound keywords cut to a first letter, e.g. "A light B…: bright". */
export function anchorPrompt(text: string) {
  const hook = anchorHook(text)
  const keywords = [...new Set(hook.match(capsWord) ?? [])]
  if (!keywords.length) {
    // The learner's own anchor has no capitals to mask: show only its opening words.
    const words = hook.split(' ')
    return words.length > 3 ? `${words.slice(0, Math.ceil(words.length / 2)).join(' ')}…` : undefined
  }
  let masked = hook.replace(capsWord, keyword => `${keyword[0]}…`)
  // A keyword repeated in lower case would give it away again.
  for (const keyword of keywords) masked = masked.replace(new RegExp(`\\b${keyword.toLowerCase().replace(/[’']/g, "['’]")}\\b`, 'g'), `${keyword[0].toLowerCase()}…`)
  return tidy(masked)
}

const syllables = (korean: string) => [...korean].filter(char => /[가-힯]/.test(char)).length

/** English → Korean: the word's shape, never its syllables: "3 syllables · starts with a “b” sound". */
export function formHint(item: VocabularyItem) {
  const words = item.korean.trim().split(/\s+/).length
  const count = syllables(item.korean)
  const reading = (item.pronunciation ?? '').toLowerCase()
  const onset = reading.match(/^[^aeiou\s-]+/)?.[0]
  const shape = words > 1 ? `${words} words, ${count} syllables` : `${count} ${count === 1 ? 'syllable' : 'syllables'}`
  return `${shape} · starts with ${onset ? `a “${onset}” sound` : 'a vowel sound'}`
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
