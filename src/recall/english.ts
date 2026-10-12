import { recallData } from '../data/recall-data'
import { cards } from '../data/cards'
import type { VocabularyItem } from '../types/vocabulary'
import { meaningKey } from './answers'
import { editDistance } from './distance'
import type { Evaluation } from './types'

/** Read as the word they stand for: British spellings, irregular plurals, film for movie, negations. */
const spellings: Record<string, string> = {
  grey: 'gray', colour: 'color', favourite: 'favorite', mum: 'mom', theatre: 'theater', centre: 'center', programme: 'program', neighbour: 'neighbor',
  men: 'man', women: 'woman', children: 'child', film: 'movie', films: 'movies', no: 'not', never: 'not',
}
/** Words with no meaning of their own in an answer: "to eat", "the weather is hot", "I'm an engineer", "I will go". Never "not". */
const fillers = new Set(['a', 'an', 'the', 'to', 'i', 'im', 'am', 'is', 'are', 'was', 'were', 'be', 'it', 'its', 'my', 'your', 'you', 'do', 'does', 'did',
  'will', 'would', 'can', 'could', 'should', 'shall', 'may', 'might', 'must', 'some', 'very', 'really', 'and', 'of'])

/**
 * Lower-case words without accents or apostrophes: "Café" → cafe, "R&B" → r and b. Contractions are spelled out, so every
 * negation reads "not" (didn't, can't, won't) and "I'll" is never "ill". A possessive stays a word of its own, so
 * "mother's father" never reads as "mother and father".
 */
export const words = (text: string) => text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[’‘`]/g, "'").replace(/&/g, ' and ')
  .replace(/\bcan'?t\b|\bcannot\b/g, 'can not').replace(/\bwon't\b/g, 'will not')
  .replace(/\b(do|does|did|is|are|was|were|have|has|had|could|should|would|must|need)n'?t\b/g, '$1 not').replace(/n't\b/g, ' not')
  .replace(/\b(it|that|what|he|she|there|here|who|where|how)'s\b/g, '$1 is').replace(/'s\b/g, ' s')
  .replace(/'ll\b/g, ' will').replace(/'ve\b/g, ' have').replace(/'re\b/g, ' are').replace(/'d\b/g, ' would').replace(/'m\b/g, ' am')
  .replace(/'/g, '').split(/[^a-z0-9]+/).filter(Boolean).map(word => spellings[word] ?? word)

const forms = new Map<string, Set<string>>()
/**
 * A word's inflections: -s, -es, -ed, -ing, with the usual spelling changes (dance → dancing, swim → swimming, study → studies).
 * A single letter has none: "a" is never "as".
 */
function formsOf(word: string) {
  let found = forms.get(word)
  if (found) return found
  if (word.length < 2) return new Set([word])
  found = new Set([word, `${word}s`, `${word}es`, `${word}ing`, `${word}ed`])
  if (word.endsWith('e')) found.add(`${word}d`).add(`${word.slice(0, -1)}ing`)
  if (/[^aeiou]y$/.test(word)) found.add(`${word.slice(0, -1)}ies`).add(`${word.slice(0, -1)}ied`)
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(word)) found.add(`${word}${word.at(-1)}ing`).add(`${word}${word.at(-1)}ed`)
  forms.set(word, found)
  return found
}
/** The same word, give or take an inflection: grape ~ grapes, swim ~ swimming, dance ~ dancing; never cut ~ cute or hat ~ hate. */
const sameForm = (a: string, b: string) => a === b || formsOf(a).has(b) || formsOf(b).has(a)

/** Typos forgiven in a word this long; one more is close enough to ask. Short words must be exact: pear is not bear. */
const tolerance = (length: number) => length <= 4 ? 0 : length <= 7 ? 1 : 2
/** A prefix that turns a word into its opposite is never a typo: interesting / uninteresting, expensive / inexpensive. */
const negates = (a: string, b: string) => {
  const [short, long] = a.length < b.length ? [a, b] : [b, a]
  return /^(un|in|im|il|ir|dis|non)$/.test(long.slice(0, long.length - short.length)) && long.endsWith(short)
}
/**
 * Whether a typed word is a forgiven typo of an answer word, close enough to ask about, or neither. In words of five
 * letters or fewer a changed letter often makes another word (light, night; short, shirt), so only a missing, extra, or
 * swapped letter is forgiven there.
 */
function typo(typed: string, word: string): 'typo' | 'close' | 'none' {
  if (negates(typed, word)) return 'none'
  const edits = editDistance([...typed], [...word])
  const changed = edits === 1 && typed.length === word.length && [...typed].filter((letter, index) => letter !== word[index]).length === 1
  if (edits <= tolerance(word.length) && !(changed && word.length <= 5)) return 'typo'
  return edits <= tolerance(word.length) + 1 && word.length >= 4 ? 'close' : 'none'
}

interface Sense { text: string; core: string[]; optional: string[] }

/** "sick / hurt" is two senses; in "hot (to touch / food)" the brackets are optional; "sport/exercise" gives one sense per word. */
function parseSenses(meaning: string): Sense[] {
  return meaning.split(/ \/ (?![^(]*\))/).flatMap(part => {
    const text = part.trim()
    const optional = words([...text.matchAll(/\(([^)]*)\)/g)].map(match => match[1]).join(' ')).filter(word => !fillers.has(word))
    const body = text.replace(/\([^)]*\)/g, ' ')
    const choice = body.match(/(\p{L}+)\/(\p{L}+)/u)
    return (choice ? [body.replace(choice[0], choice[1]), body.replace(choice[0], choice[2])] : [body]).map(variant => {
      const all = words(variant)
      const core = all.filter(word => !fillers.has(word))
      return { text, core: core.length ? core : all, optional }
    })
  })
}

/** How a typed answer relates to one sense: exact (forms and spacing aside), a forgiven typo, worth asking about, or nothing. */
type Fit = 'exact' | 'typo' | 'close' | 'extra' | 'partial' | 'none'

function fit(typed: string[], sense: Sense): Fit {
  const content = typed.filter(word => !fillers.has(word))
  const given = content.length ? content : typed
  const target = sense.core.join('')
  // Spacing never matters: icecream ~ ice cream, kpop ~ K-pop.
  if (given.join('') === target) return 'exact'
  // "not boring" is never a near miss for "boring", nor "didn't like" an extra word on "like".
  if (given.includes('not') !== sense.core.includes('not')) return 'none'
  const left = [...given]
  let matched = 0, typos = 0, close = false
  // A shared "not" alone makes nothing partly right.
  const partly = () => sense.core.length >= 2 && matched > (given.includes('not') ? 1 : 0) && matched * 2 >= sense.core.length
  for (const word of sense.core) {
    let index = left.findIndex(candidate => sameForm(candidate, word))
    if (index < 0) {
      if (word.length < 4) continue
      const verdicts = left.map(candidate => typo(candidate, word))
      index = verdicts.indexOf('typo')
      if (index >= 0) typos++
      else if ((index = verdicts.indexOf('close')) >= 0) close = true
      else continue
    }
    left.splice(index, 1)
    matched++
  }
  const extra = left.filter(word => !sense.optional.some(option => sameForm(option, word)))
  // A sentence may carry one word more: "I am learning Korean now".
  if (matched === sense.core.length && (!extra.length || (sense.core.length >= 3 && extra.length === 1))) return close ? 'close' : typos ? 'typo' : 'exact'
  const whole = typo(given.join(''), target)
  if (whole !== 'none') return whole
  if (matched === sense.core.length) return 'extra'
  return partly() ? 'partial' : 'none'
}

interface Accepted { sense: Sense; reason?: string }
const strength: Record<Fit, number> = { exact: 3, typo: 2, close: 1, extra: 1, partial: 1, none: 0 }
const doubts: Partial<Record<Fit, string>> = { close: 'close spelling', extra: 'extra words', partial: 'partly right' }
const accepted = new Map<string, Accepted[]>()
const others = new Map<string, Array<{ sense: Sense; korean: string; joined: string }>>()

/** Words of one sense may join another ("pop music" for "pop / popular music"), except "not", which always matters. */
function withSiblings(meaning: string) {
  const senses = parseSenses(meaning)
  const siblings = senses.flatMap(sense => sense.core).filter(word => word !== 'not')
  return senses.map(sense => ({ ...sense, optional: [...sense.optional, ...siblings] }))
}

/** Cards answered the same way: the same written word (가요 / 가요), or the same meaning (같아요 / 똑같아요). */
const answeredAlike = (item: VocabularyItem, other: VocabularyItem) =>
  other.korean === item.korean || other.meaning.trim().toLowerCase() === item.meaning.trim().toLowerCase()

/** Every way to say the answer: the card's senses, other meanings of the same written word (가요), and reviewed synonyms. */
function acceptedFor(item: VocabularyItem): Accepted[] {
  if (!accepted.has(item.id)) accepted.set(item.id, [
    ...withSiblings(item.meaning).map(sense => ({ sense })),
    ...meaningKey(item).alternatives.flatMap(({ text, reason }) => withSiblings(text).map(sense => ({ sense, reason }))),
    ...cards.filter(other => answeredAlike(item, other))
      .flatMap(other => recallData[other.id]?.accept ?? []).flatMap(parseSenses).map(sense => ({ sense, reason: 'same meaning' })),
  ])
  return accepted.get(item.id)!
}
/** The meanings (and reviewed synonyms) of every other word, so an answer that names one of them is never taken for a typo. */
function othersFor(item: VocabularyItem) {
  if (!others.has(item.id)) others.set(item.id, cards.filter(other => !answeredAlike(item, other))
    .flatMap(other => [other.meaning, ...recallData[other.id]?.accept ?? []].flatMap(parseSenses)
      .map(sense => ({ sense, korean: other.korean, joined: sense.core.join('') }))))
  return others.get(item.id)!
}
/** The same answer, forms and filler words aside: "pears" and "pear", "day before yesterday" and "the day before yesterday". */
export const sameAnswer = (a: string, b: string) => {
  const [x, y] = [a, b].map(text => words(text).filter(word => !fillers.has(word)))
  return x.length === y.length && x.every((word, index) => sameForm(word, y[index]))
}

/** What the masks in anchor hints must hide: every accepted way to say the meaning. */
export const acceptedTexts = (item: VocabularyItem) => [...new Set(acceptedFor(item).map(({ sense }) => sense.text))]

function best(typed: string[], item: VocabularyItem) {
  let found: { fit: Fit; entry?: Accepted } = { fit: 'none' }
  for (const entry of acceptedFor(item)) {
    const result = fit(typed, entry.sense)
    if (strength[result] > strength[found.fit]) found = { fit: result, entry }
    if (result === 'exact') break
  }
  return found
}
/** Another word whose meaning this answer is, exactly. Only senses with all their words present are compared in full. */
function namesOther(typed: string[], item: VocabularyItem) {
  const content = typed.filter(word => !fillers.has(word))
  const given = content.length ? content : typed
  const joined = given.join('')
  return othersFor(item).find(other => (other.joined === joined || other.sense.core.every(word => given.some(candidate => sameForm(candidate, word))))
    && fit(typed, other.sense) === 'exact')
}

/**
 * Grades a typed English meaning, deterministically. Correct: an accepted answer, give or take forms, spacing, and small typos.
 * Incorrect: the meaning of another word, or nothing like the answer. Anything in between is uncertain: the learner decides.
 */
export function matchEnglish(text: string, item: VocabularyItem): Evaluation {
  const read = text.trim()
  const typed = words(read)
  if (!typed.length) return { result: 'incorrect', by: 'match', read, reason: 'no English words' }
  const found = best(typed, item)
  const matched = found.entry?.sense.text
  if (found.fit === 'exact') return { result: 'correct', by: 'match', read, matched, ...found.entry?.reason ? { reason: found.entry.reason } : {} }
  // "warm" for 더워요, or "expensive" for 싸요 (cheap, inexpensive), names a different word, however close it looks.
  const other = namesOther(typed, item)
  if (other) return { result: 'incorrect', by: 'match', read, reason: `“${other.sense.text}” is ${other.korean}` }
  if (found.fit === 'typo') return { result: 'correct', by: 'match', read, matched, reason: 'small typo' }
  // Two answers in one ("sick, hurt"): all of them right is right; some of them right is worth asking.
  const parts = read.split(/[,;/]| or /i).map(words).filter(part => part.length)
  if (parts.length > 1) {
    const right = parts.map(part => { const fit = best(part, item).fit; return fit === 'exact' || (fit === 'typo' && !namesOther(part, item)) })
    if (right.every(Boolean)) return { result: 'correct', by: 'match', read, matched }
    if (right.some(Boolean)) return { result: 'uncertain', by: 'match', read, reason: 'partly right' }
  }
  if (strength[found.fit]) return { result: 'uncertain', by: 'match', read, matched, reason: doubts[found.fit] }
  return { result: 'incorrect', by: 'match', read }
}

/**
 * Whether a hint would hand over the answer: some run of one to three of its words, read with or without its brackets,
 * hyphens, and plus signs, would be graded correct ("Gandalf the Grey" for gray, "THOR's day" for Thursday, "pe(ar)" for pear).
 */
export function givesAway(text: string, item: VocabularyItem) {
  // Read across a "+" too: "AIR + PORT" spells airport.
  const joined = text.replace(/ \+ /g, ' ')
  const variants = new Set([text, joined, text.replace(/[()[\]]/g, ''), text.replace(/[-‐–—]/g, ''), text.replace(/[()[\]\-‐–—]/g, ''), joined.replace(/[()[\]\-‐–—]/g, '')])
  return [...variants].some(variant => {
    const tokens = variant.split(/\s+/).filter(Boolean)
    return tokens.some((_, start) => [1, 2, 3].some(size => start + size <= tokens.length
      && matchEnglish(tokens.slice(start, start + size).join(' '), item).result === 'correct'))
  })
}
