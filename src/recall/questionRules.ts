import { recallData } from '../data/recall-data'
import { isRecord } from '../hooks/storage'
import type { GrammarExample, VocabularyItem } from '../types/vocabulary'
import { distinctiveSpeaker, koreanKey, meaningKey } from './answers'
import { acceptedTexts, givesAway, matchEnglish } from './english'
import { readHandwriting } from './handwriting'
import { anchorCloze, anchorPrompt, categoryClue, formHint, meaningTerms, mentions, readingSyllables, type Hint } from './hints'
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

/** A Complete the sentence question: which example, and its four options in the order shown. */
export interface GapQuestion { example: number; options: string[] }
/** The studied piece in an example: 는 in 저[는] 학생이에요. */
export const gapAnswer = (example: GrammarExample) => example.korean.match(/\[([^\]]*)\]/)?.[1] ?? ''
export const gapExample = (item: VocabularyItem, data: unknown) => item.grammar!.examples[(data as GapQuestion).example]
/** A meaning clue for Korean → English, unless it would say the answer; else what kind of word it is. */
const clueFor = (item: VocabularyItem, safe: (text: string | undefined) => string | undefined = text => text) =>
  [recallData[item.id]?.clue, categoryClue(item)].find(clue => safe(clue)) ?? ''

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
        anchor && anchor.kind !== 'loanword' && { kind: 'anchor', text: safe(anchorChain(anchor) ?? anchorCloze(anchor.text, terms, readingSyllables(item))) ?? '' },
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
      anchor && { kind: 'anchor', text: anchorChain(anchor) ?? anchorPrompt(anchor.text, readingSyllables(item), anchor.own) ?? '' },
      { kind: 'form', text: formHint(item) },
    ]),
  },
  {
    id: 'complete-sentence',
    answer: 'choice',
    supports: item => !!item.grammar?.examples.length,
    promptKey: item => item.id,
    answerKey: (item, data) => ({ expected: gapAnswer(gapExample(item, data)), alternatives: [] }),
    // One of the card's sentences, with its piece and three wrong ones in random order.
    prepare: (item, { random }) => {
      const examples = item.grammar!.examples
      const example = Math.floor(random() * examples.length)
      return { example, options: shuffle([gapAnswer(examples[example]), ...examples[example].gap], undefined, random) } satisfies GapQuestion
    },
    parseData: (value, item) => {
      if (!isRecord(value) || typeof value.example !== 'number' || !Array.isArray(value.options)) return undefined
      const example = item.grammar?.examples[value.example]
      const options = value.options
      const expected = example && [gapAnswer(example), ...example.gap]
      return expected && options.length === expected.length && expected.every(option => options.includes(option))
        ? { example: value.example, options: [...options] as string[] } satisfies GapQuestion : undefined
    },
    evaluate: (item, answer, { data }) => answer.kind === 'choice' && answer.choice === gapAnswer(gapExample(item, data))
      ? { result: 'correct', by: 'match', read: answer.choice } : { result: 'incorrect', by: 'match', ...answer.kind === 'choice' ? { read: answer.choice } : {} },
    // What the missing piece does, without its Korean; then two wrong options fewer.
    hints: item => present([
      { kind: 'meaning', text: clueFor(item) },
      { kind: 'narrow', text: 'Two wrong options are gone.' },
    ]),
  },
]

export const questionRuleById = new Map(questionRules.map(rule => [rule.id, rule]))
