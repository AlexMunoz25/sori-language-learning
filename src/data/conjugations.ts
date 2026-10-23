import type { Ending } from '../recall/conjugate'

/** The words a “Build the form” question may conjugate. */
export type ConjugationWords = 'verbs' | 'adjectives' | 'both' | 'nouns'
export interface Conjugation {
  ending: Ending
  words: ConjugationWords
}

/**
 * Grammar cards that build a form, keyed by card id: which form, on which of the learner's words. A card without an
 * entry is asked only in sentences.
 */
export const conjugations: Record<string, Conjugation> = {
  'tense:-아요/어요': { ending: 'present', words: 'both' },
  'tense:-았/었어요': { ending: 'past', words: 'both' },
  'tense:-(으)ㄹ 거예요': { ending: 'future', words: 'verbs' },
  'tense:-고 있어요': { ending: 'progressive', words: 'verbs' },
  'speech:합니다체': { ending: 'formal', words: 'both' },
  'speech:반말': { ending: 'casual', words: 'both' },
  'honorific:-(으)시-': { ending: 'honorific', words: 'verbs' },
  'ending:-이에요/예요': { ending: 'copula', words: 'nouns' },
  'ending:아니에요': { ending: 'notBe', words: 'nouns' },
  'ending:-고 싶어요': { ending: 'want', words: 'verbs' },
  'ending:-(으)ㄹ 수 있어요/없어요': { ending: 'can', words: 'verbs' },
  'ending:-아야/어야 해요': { ending: 'must', words: 'both' },
  'ending:안': { ending: 'negative', words: 'both' },
  'ending:못': { ending: 'cannot', words: 'verbs' },
  'ending:-(으)세요': { ending: 'please', words: 'verbs' },
  'ending:-지 마세요': { ending: 'dont', words: 'verbs' },
  'ending:-아/어 주세요': { ending: 'pleaseForMe', words: 'verbs' },
  'ending:-(으)ㄹ까요?': { ending: 'shallWe', words: 'verbs' },
}
