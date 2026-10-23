import { cardById, cards } from '../data/cards'
import { conjugations, type Conjugation } from '../data/conjugations'
import { recallData } from '../data/recall-data'
import { isRecord } from '../hooks/storage'
import type { GrammarExample, VocabularyItem, WordExample } from '../types/vocabulary'
import { distinctiveSpeaker, koreanKey, lookAlikeGroups, meaningKey } from './answers'
import { acceptedTexts, givesAway, matchEnglish } from './english'
import { readHandwriting } from './handwriting'
import { conjugate, explain, optionsFor } from './conjugate'
import { anchorCloze, anchorPrompt, categoryClue, cultureCloze, cultureCue, formHint, meaningTerms, mentions, readingSyllables, type Hint } from './hints'
import { matchKorean } from './korean'
import { shuffle } from './random'
import { rootChain, rootParts } from '../data/root-anchors'
import type { HintContext, QuestionRule } from './types'

const present = (hints: Array<Hint | false | undefined>) => hints.filter((hint): hint is Hint => !!hint && !!hint.text)
/** A root-based anchor hints with its parts' meanings (月 MOON + DAY): no Korean, no reading. */
const anchorChain = (anchor: NonNullable<HintContext['anchor']>) => {
  const parsed = anchor.kind === 'roots' ? rootParts(anchor.text) : undefined
  return parsed && rootChain(parsed.parts)
}

/** A Complete the sentence question: which sentence, and its four options in the order shown. */
export interface GapQuestion { example: number; options: string[] }
/** The sentences a card can be asked in: a grammar point's examples, or a word's one sentence. */
export const sentencesOf = (item: VocabularyItem): Array<GrammarExample | WordExample> => item.grammar?.examples ?? (item.example ? [item.example] : [])
/** The studied piece in a sentence: 는 in 저[는] 학생이에요, 사과 in 저는 [사과]를 좋아해요. */
export const gapAnswer = (example: { korean: string }) => example.korean.match(/\[([^\]]*)\]/)?.[1] ?? ''
export const gapExample = (item: VocabularyItem, data: unknown) => sentencesOf(item)[(data as GapQuestion).example]

/** Ends in a final consonant (책, 빵): then the particle after the blank (책을, 빵을) never gives the answer away. */
const closed = (word: string) => { const code = word.charCodeAt(word.length - 1) - 0xac00; return code >= 0 && code < 11172 && code % 28 !== 0 }
/** Words that could stand in a word's place: same category, another meaning, never a look-alike or the category's own name. */
function rivalsOf(item: VocabularyItem) {
  const groups = lookAlikeGroups(item)
  return cards.filter(other => other.section === 'vocabulary' && other.category === item.category && other.id !== item.id
    && other.sourceKind !== 'heading' && !lookAlikeGroups(other).some(key => groups.includes(key)))
}
/** Three wrong words for a word's sentence, ending like the answer where the category allows: the English decides. */
function wordOptions(item: VocabularyItem, random: () => number) {
  const rivals = rivalsOf(item)
  const alike = rivals.filter(other => closed(other.korean) === closed(item.korean))
  return [...new Set(shuffle(alike.length >= 3 ? alike : rivals, undefined, random).map(other => other.korean))].slice(0, 3)
}
/** A meaning clue for Korean → English, unless it would say the answer; else what kind of word it is. */
const clueFor = (item: VocabularyItem, safe: (text: string | undefined) => string | undefined = text => text) =>
  [recallData[item.id]?.clue, categoryClue(item)].find(clue => safe(clue)) ?? ''

/** A Build the form question: which of the learner's words, and its four forms in the order shown. */
export interface FormQuestion { word: string; options: string[] }
// Feelings make odd requests (“please don't like”), and these verbs have their own respectful words (드세요, 주무세요).
const feelings = new Set(['좋아하다', '사랑하다', '싫어하다'])
const ownHonorific = new Set(['먹다', '마시다', '자다', '말하다', '있다'])
const requests = new Set(['please', 'dont', 'pleaseForMe', 'shallWe', 'honorific', 'honorificPast'])
/** The dictionary form a word conjugates from, or a noun as it stands. */
export const baseOf = (item: VocabularyItem) => item.dictionaryForm ?? item.korean
/** The learner's words a grammar card can be built on: verbs and adjectives from their dictionary form, or job nouns. */
export function formWords({ ending, words }: Conjugation) {
  return cards.filter(item => {
    if (item.section !== 'vocabulary' || item.sourceKind === 'heading') return false
    if (words === 'nouns') return item.category === 'Jobs / Occupations'
    if (!item.dictionaryForm || /생겼다$/.test(item.dictionaryForm)) return false
    const verb = item.category === 'Verbs'
    if (words === 'verbs' ? !verb : words === 'adjectives' ? item.category !== 'Adjectives' : !verb && item.category !== 'Adjectives') return false
    if (requests.has(ending) && feelings.has(item.dictionaryForm)) return false
    return !(['please', 'honorific', 'honorificPast'].includes(ending) && ownHonorific.has(item.dictionaryForm))
  }).filter(item => optionsFor(baseOf(item), ending))
}
/** The word and form a Build the form question asks about. */
export function formQuestion(item: VocabularyItem, data: unknown) {
  const spec = conjugations[item.id]
  const word = cardById.get((data as FormQuestion).word)!
  return { spec, word, base: baseOf(word), expected: conjugate(baseOf(word), spec.ending) }
}

/**
 * The test modes, without any UI: generation, saving, evaluation, hints, and scoring read only this list.
 * Register a mode here, then give it a view (label, prompt, solution) in components/testTypes.tsx.
 */
export const questionRules: QuestionRule[] = [
  {
    id: 'korean-to-english',
    answer: 'text',
    supports: () => true,
    promptKey: item => item.korean,
    answerKey: meaningKey,
    evaluate: (item, answer) => matchEnglish(answer.kind === 'text' ? answer.text : '', item),
    // A borrowed word's anchor is the English word itself, so it can't hint at the meaning without giving it away. Whatever
    // remains is checked by the grader itself: a hint containing anything it would accept as the answer is dropped.
    hints: (item, { anchor }) => {
      const terms = meaningTerms(acceptedTexts(item))
      const safe = (text: string | undefined) => text && !mentions(text, terms) && !givesAway(text, item) ? text : undefined
      return present([
        anchor && anchor.kind !== 'loanword' && { kind: 'anchor', text: safe(anchor.source ? cultureCloze(anchor.source, terms, readingSyllables(item))
          : anchorChain(anchor) ?? anchorCloze(anchor.text, terms, readingSyllables(item))) ?? '' },
        { kind: 'meaning', text: clueFor(item, safe) },
      ])
    },
  },
  {
    id: 'english-to-korean',
    answer: 'ink',
    // Connectors and particles share meanings (and: 그리고, -고, 하고), so only words are asked this way.
    supports: item => item.section === 'vocabulary',
    promptKey: item => `${item.meaning.trim().toLowerCase()}|${distinctiveSpeaker(item) ?? ''}`,
    answerKey: koreanKey,
    evaluate: (item, answer, { signal }) => readHandwriting(answer, koreanKey(item), signal),
    grade: (item, read) => matchKorean(read, koreanKey(item)).matched ? 'correct' : 'incorrect',
    hints: (item, { anchor }) => present([
      anchor && { kind: 'anchor', text: (anchor.source ? cultureCue(anchor.source, readingSyllables(item))
        : anchorChain(anchor) ?? anchorPrompt(anchor.text, readingSyllables(item), anchor.own)) ?? '' },
      { kind: 'form', text: formHint(item) },
    ]),
  },
  {
    id: 'complete-sentence',
    answer: 'choice',
    // Grammar brings its own wrong options; a word borrows three from its category.
    supports: item => item.grammar ? item.grammar.examples.length > 0 : !!item.example && rivalsOf(item).length >= 3,
    promptKey: item => item.id,
    answerKey: (item, data) => ({ expected: gapAnswer(gapExample(item, data)), alternatives: [] }),
    // One of the card's sentences, with its piece and three wrong ones in random order.
    prepare: (item, { random }) => {
      const sentences = sentencesOf(item)
      const example = Math.floor(random() * sentences.length)
      const wrong = item.grammar ? item.grammar.examples[example].gap : wordOptions(item, random)
      return { example, options: shuffle([gapAnswer(sentences[example]), ...wrong], undefined, random) } satisfies GapQuestion
    },
    parseData: (value, item) => {
      if (!isRecord(value) || typeof value.example !== 'number' || !Array.isArray(value.options)) return undefined
      const sentence = sentencesOf(item)[value.example]
      const options = value.options
      if (!sentence || options.length !== 4 || new Set(options).size !== 4 || !options.every(option => typeof option === 'string')) return undefined
      const answer = gapAnswer(sentence)
      const wrong = options.filter(option => option !== answer)
      const fits = wrong.length === 3 && (item.grammar
        ? (sentence as GrammarExample).gap.every(option => wrong.includes(option))
        : wrong.every(option => rivalsOf(item).some(other => other.korean === option)))
      return fits ? { example: value.example, options: [...options] as string[] } satisfies GapQuestion : undefined
    },
    evaluate: (item, answer, { data }) => answer.kind === 'choice' && answer.choice === gapAnswer(gapExample(item, data))
      ? { result: 'correct', by: 'match', read: answer.choice } : { result: 'incorrect', by: 'match', ...answer.kind === 'choice' ? { read: answer.choice } : {} },
    // A grammar point: what the missing piece does, without its Korean. A word: its shape (the English already says what it means).
    // Then two wrong options fewer.
    hints: item => present([
      item.grammar ? { kind: 'meaning', text: clueFor(item) } : { kind: 'form', text: formHint(item) },
      { kind: 'narrow', text: 'Two wrong options are gone.' },
    ]),
  },
  {
    id: 'conjugate',
    answer: 'choice',
    // Endings, tenses, speech levels, and respect, built on the learner's own words: 먹다 → 먹었어요.
    supports: item => !!conjugations[item.id] && formWords(conjugations[item.id]).length > 0,
    promptKey: item => item.id,
    answerKey: (item, data) => ({ expected: formQuestion(item, data).expected, alternatives: [] }),
    // On a word studied alongside it when one fits (a lesson's own verbs: 먹다 → 먹었어요), else on any of the learner's words.
    prepare: (item, { pool, random }) => {
      const spec = conjugations[item.id]
      const all = formWords(spec)
      const studied = all.filter(word => pool.some(other => other.id === word.id))
      const words = studied.length ? studied : all
      const word = words[Math.floor(random() * words.length)]
      return { word: word.id, options: shuffle(optionsFor(baseOf(word), spec.ending)!, undefined, random) } satisfies FormQuestion
    },
    parseData: (value, item) => {
      const spec = conjugations[item.id]
      if (!spec || !isRecord(value) || typeof value.word !== 'string' || !Array.isArray(value.options)) return undefined
      const word = formWords(spec).find(candidate => candidate.id === value.word)
      const expected = word && optionsFor(baseOf(word), spec.ending)
      const options = value.options
      return expected && options.length === expected.length && expected.every(option => options.includes(option))
        ? { word: word.id, options: [...options] as string[] } satisfies FormQuestion : undefined
    },
    evaluate: (item, answer, { data }) => answer.kind === 'choice' && answer.choice === formQuestion(item, data).expected
      ? { result: 'correct', by: 'match', read: answer.choice } : { result: 'incorrect', by: 'match', ...answer.kind === 'choice' ? { read: answer.choice } : {} },
    // How this word takes this ending, then two wrong options fewer.
    hints: (item, { data }) => {
      const { spec, base } = formQuestion(item, data)
      return present([{ kind: 'rule', text: explain(base, spec.ending) }, { kind: 'narrow', text: 'Two wrong options are gone.' }])
    },
  },
]

export const questionRuleById = new Map(questionRules.map(rule => [rule.id, rule]))
