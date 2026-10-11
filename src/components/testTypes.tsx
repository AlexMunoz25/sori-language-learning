import type { ComponentType } from 'react'
import { distinctiveSpeaker } from '../recall/answers'
import { questionRules } from '../recall/questionRules'
import type { AnswerKey, QuestionRule, TestQuestion } from '../recall/types'
import type { VocabularyItem } from '../types/vocabulary'
import { KoreanWord } from './KoreanWord'

/** How a test mode looks. TestView wraps the prompt for focus and descriptions, and adds the answer field and review. */
export interface QuestionView {
  /** Setup and the card's kicker, e.g. 'Korean → English'. */
  label: string
  /** Result rows, e.g. 'KO → EN'. */
  shortLabel: string
  /** What to do, on setup and inside the answer field. */
  instruction: string
  /** Visible label of a text answer field. */
  fieldLabel?: string
  /** Which word notes the review adds after the solution; both default to shown. */
  notes?: { forms?: boolean; speaker?: boolean }
  /** The question. Must not give the answer away. */
  Prompt: ComponentType<{ item: VocabularyItem; question: TestQuestion }>
  /** The answer key, revealed after checking. */
  Solution: ComponentType<{ item: VocabularyItem; question: TestQuestion; answerKey: AnswerKey }>
}
export type QuestionType = QuestionRule & QuestionView

function Alternatives({ answerKey, lang }: { answerKey: AnswerKey; lang?: string }) {
  if (!answerKey.alternatives.length) return null
  return <p className="test-alternatives" data-testid="test-alternatives">Also correct: {answerKey.alternatives.map(({ text, reason }, index) =>
    <span key={text}>{index ? ' · ' : ''}<span lang={lang}>{text}</span> <span className="test-reason">({reason})</span></span>)}</p>
}

const views: Record<string, QuestionView> = {
  'korean-to-english': {
    label: 'Korean → English',
    shortLabel: 'KO → EN',
    instruction: 'Type the meaning',
    fieldLabel: 'Meaning in English',
    Prompt: ({ item }) => <div className="test-stage"><KoreanWord word={item.korean} /></div>,
    Solution: ({ answerKey }) => <div className="test-solution">
      <p className="test-label">Meaning</p>
      <p className="meaning" data-testid="test-solution">{answerKey.expected}</p>
      <Alternatives answerKey={answerKey} />
    </div>,
  },
  'english-to-korean': {
    label: 'English → Korean',
    shortLabel: 'EN → KO',
    instruction: 'Write the word in Korean',
    // The dictionary form is listed with the answer, and the speaker is already part of the prompt.
    notes: { forms: false, speaker: false },
    Prompt: ({ item }) => {
      const speaker = distinctiveSpeaker(item)
      return <div className="test-stage">
        <p className="test-meaning" data-testid="test-meaning">{item.meaning}</p>
        {speaker && <p className="detail-note">Used by: {speaker}</p>}
      </div>
    },
    // Sits directly under the handwriting, so the two can be compared at a glance.
    Solution: ({ answerKey }) => <div className="test-solution pad-answer" data-testid="test-solution">
      <KoreanWord word={answerKey.expected} />
      <Alternatives answerKey={answerKey} lang="ko" />
    </div>,
  },
}

export const questionTypes: QuestionType[] = questionRules.map(rule => {
  const view = views[rule.id]
  if (!view) throw new Error(`Test mode “${rule.id}” needs a view in components/testTypes.tsx`)
  return { ...rule, ...view }
})

export const questionTypeById = new Map(questionTypes.map(type => [type.id, type]))
