import { recallData } from '../data/recall-data'
import { distinctiveSpeaker, koreanKey, meaningKey } from './answers'
import { anchorCloze, anchorPrompt, categoryClue, formHint, meaningTerms, type Hint } from './hints'
import { matchKorean } from './korean'
import type { QuestionRule } from './types'

const present = (hints: Array<Hint | false | undefined>) => hints.filter((hint): hint is Hint => !!hint && !!hint.text)

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
    // Replaced by the deterministic matcher once it lands: until then only an exact match is graded without asking.
    evaluate: (item, answer) => {
      const typed = answer.kind === 'text' ? answer.text.trim().toLowerCase() : ''
      const exact = [item.meaning, ...item.meaning.split(' / ')].some(sense => sense.trim().toLowerCase() === typed)
      return { result: exact ? 'correct' : 'uncertain', by: 'match', read: typed }
    },
    hints: (item, { anchor }) => present([
      anchor !== undefined && { kind: 'anchor', text: anchorCloze(anchor, meaningTerms(item, recallData[item.id]?.accept)) ?? '' },
      { kind: 'meaning', text: recallData[item.id]?.clue ?? categoryClue(item) },
    ]),
  },
  {
    id: 'english-to-korean',
    answer: 'ink',
    supports: () => true,
    promptKey: item => `${item.meaning.trim().toLowerCase()}|${distinctiveSpeaker(item) ?? ''}`,
    answerKey: koreanKey,
    // Replaced by handwriting recognition once the engine is chosen: until then the learner judges.
    evaluate: () => ({ result: 'uncertain', by: 'unavailable' }),
    grade: (item, read) => matchKorean(read, koreanKey(item)).matched ? 'correct' : 'incorrect',
    hints: (item, { anchor }) => present([
      anchor !== undefined && { kind: 'anchor', text: anchorPrompt(anchor) ?? '' },
      { kind: 'form', text: formHint(item) },
    ]),
  },
]

export const questionRuleById = new Map(questionRules.map(rule => [rule.id, rule]))
