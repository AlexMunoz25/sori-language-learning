import type { ComponentType } from 'react'
import { spokenText } from '../data/cards'
import { distinctiveSpeaker } from '../recall/answers'
import { endingLabels, explain } from '../recall/conjugate'
import { formQuestion, gapExample, questionRules } from '../recall/questionRules'
import type { Answer, AnswerKey, QuestionRule, TestQuestion } from '../recall/types'
import type { VocabularyItem } from '../types/vocabulary'
import { plainSentence, Sentence } from './GrammarContent'
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
  /** The question. Must not give the answer away. `answer`: the learner's answer so far. */
  Prompt: ComponentType<{ item: VocabularyItem; question: TestQuestion; answer: Answer }>
  /** The answer key, revealed after checking. */
  Solution: ComponentType<{ item: VocabularyItem; question: TestQuestion; answerKey: AnswerKey }>
  /** What Hear it says after the answer; the card's own audio unless set. */
  speech?: (item: VocabularyItem, question: TestQuestion) => string
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
  'complete-sentence': {
    label: 'Complete the sentence',
    shortLabel: 'Sentence',
    instruction: 'Pick the piece that fits',
    notes: { forms: false, speaker: false },
    // The blank shows the option picked, so the whole sentence can be read before checking.
    Prompt: ({ item, question, answer }) => {
      const example = gapExample(item, question.data)
      return <div className="test-stage gap-stage">
        <p className="test-sentence" data-testid="test-sentence"><Sentence korean={example.korean} blank filled={answer.kind === 'choice' && answer.choice ? answer.choice : undefined} /></p>
        <p className="test-translation" data-testid="test-translation">{example.english}</p>
      </div>
    },
    Solution: ({ item, question }) => {
      const example = gapExample(item, question.data)
      return <div className="test-solution" data-testid="test-solution">
        <p className="test-label">Answer</p>
        <p className="test-sentence"><Sentence korean={example.korean} /></p>
        {'why' in example && <p className="test-explanation">{example.why}</p>}
        <p className="test-studied"><span lang="ko">{item.korean}</span>{item.meaning}</p>
      </div>
    },
    speech: (item, question) => plainSentence(gapExample(item, question.data).korean),
  },
  'conjugate': {
    label: 'Build the form',
    shortLabel: 'Form',
    instruction: 'Pick the right form',
    notes: { forms: false, speaker: false },
    // One of the learner's words in its dictionary form, and the form wanted: 먹다 → Past · polite.
    Prompt: ({ item, question }) => {
      const { spec, word, base } = formQuestion(item, question.data)
      return <div className="test-stage form-stage">
        <p className="form-target" data-testid="form-target">{endingLabels[spec.ending]}</p>
        <KoreanWord word={base} />
        <p className="test-translation" data-testid="test-translation">{word.meaning}</p>
      </div>
    },
    Solution: ({ item, question, answerKey }) => {
      const { spec, base } = formQuestion(item, question.data)
      return <div className="test-solution" data-testid="test-solution">
        <p className="test-label">Answer</p>
        <p className="test-sentence" lang="ko">{answerKey.expected}</p>
        <p className="test-explanation">{explain(base, spec.ending)}</p>
        <p className="test-studied"><span lang="ko">{item.korean}</span>{item.meaning}</p>
      </div>
    },
    speech: (item, question) => formQuestion(item, question.data).expected,
  },
}

export const questionTypes: QuestionType[] = questionRules.map(rule => {
  const view = views[rule.id]
  if (!view) throw new Error(`Test mode “${rule.id}” needs a view in components/testTypes.tsx`)
  return { speech: spokenText, ...rule, ...view }
})

export const questionTypeById = new Map(questionTypes.map(type => [type.id, type]))
