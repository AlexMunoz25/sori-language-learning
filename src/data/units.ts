/**
 * Learn's guided units, in order. Each pairs a grammar point or two with the words it puts to work, so a lesson ends
 * with something the learner can say. A unit meets its cards a few at a time, practises them, and hands them to Review.
 */
export interface Unit {
  id: string
  title: string
  /** What the learner can do afterwards, in one line. */
  goal: string
  /** Card ids in teaching order. */
  cards: string[]
}

export const units: Unit[] = [
  { id: 'who-you-are', title: 'Who you are', goal: 'Say who you are and what you do.',
    cards: ['ending:-이에요/예요', 'particle:은/는', 'Jobs / Occupations:학생', 'Jobs / Occupations:개발자', 'Jobs / Occupations:엔지니어', 'Jobs / Occupations:회사원'] },
  { id: 'who-you-are-not', title: 'Who you’re not', goal: 'Say what you’re not, and who did something.',
    cards: ['ending:아니에요', 'particle:이/가', 'Jobs / Occupations:선생님', 'Jobs / Occupations:의사', 'Jobs / Occupations:가수'] },
  { id: 'what-you-like', title: 'What you like', goal: 'Ask what someone likes, and say what you like most.',
    cards: ['particle:을/를', 'Verbs:좋아해요', 'Drinks:커피', 'Food:빵', 'Useful words:무슨', 'Useful words:제일'] },
  { id: 'where-you-go', title: 'Where you go', goal: 'Say where you’re going and where you come from.',
    cards: ['particle:에', 'Verbs:가요', 'Verbs:와요', 'Places:학교', 'Places:집', 'Places:회사'] },
  { id: 'where-it-happens', title: 'Where it happens', goal: 'Say where you study, work, and eat.',
    cards: ['particle:에서', 'Verbs:공부해요', 'Verbs:일해요', 'Places:도서관', 'Places:카페', 'Places:식당'] },
  { id: 'also-and-only', title: 'Also and only', goal: 'Add and limit: me too, only water.',
    cards: ['particle:도', 'particle:만', 'Verbs:마셔요', 'Drinks:물', 'Drinks:녹차', 'Food:김치'] },
  { id: 'what-you-did', title: 'What you did', goal: 'Talk about yesterday: what you ate, watched, and who you met.',
    cards: ['tense:-았/었어요', 'Time & days:어제', 'Verbs:먹어요', 'Verbs:봐요', 'Verbs:만나요'] },
  { id: 'and-but-so', title: 'And, but, so', goal: 'Link two ideas: one more fact, a contrast, a result.',
    cards: ['connector:그리고', 'connector:하지만', 'connector:그래서', 'Adjectives:재미있어요', 'Adjectives:어려워요', 'Adjectives:바빠요'] },
  { id: 'plans-and-wishes', title: 'Plans and wishes', goal: 'Say what you’re going to do, and what you want to do.',
    cards: ['tense:-(으)ㄹ 거예요', 'ending:-고 싶어요', 'Time & days:내일', 'Time & days:주말', 'Verbs:운동해요', 'Sports / Exercise:수영'] },
  { id: 'can-and-cannot', title: 'Can, can’t, don’t', goal: 'Say what you can do, what you can’t, and what you don’t.',
    cards: ['ending:-(으)ㄹ 수 있어요/없어요', 'ending:못', 'ending:안', 'Verbs:요리해요', 'Verbs:읽어요', 'Adjectives:피곤해요'] },
  { id: 'now-from-until', title: 'Now, from, until', goal: 'Say what’s happening now, and from when until when.',
    cards: ['tense:-고 있어요', 'particle:부터', 'particle:까지', 'Time & days:월요일', 'Time & days:금요일', 'heading:시간'] },
  { id: 'asking-nicely', title: 'Asking nicely', goal: 'Ask, offer, and suggest, politely.',
    cards: ['ending:-(으)세요', 'ending:-아/어 주세요', 'ending:-지 마세요', 'ending:-(으)ㄹ까요?', 'Verbs:기다려요', 'Verbs:가르쳐요'] },
  { id: 'polite-styles', title: 'Polite, formal, casual', goal: 'Choose how polite to sound, and show respect for who does it.',
    cards: ['speech:해요체', 'speech:합니다체', 'speech:반말', 'honorific:-(으)시-', 'Family:할머니', 'Family:할아버지'] },
  { id: 'respectful-words', title: 'Respectful words', goal: 'Talk to and about elders with the words they deserve.',
    cards: ['honorific:께서/께', 'honorific:드시다', 'honorific:주무시다', 'honorific:계시다', 'honorific:드리다', 'honorific:성함', 'honorific:연세'] },
]
export const unitById = new Map(units.map(unit => [unit.id, unit]))

export type LessonStep =
  | { kind: 'intro' }
  /** Meet one card: hear it, anchor it, see it in a sentence. */
  | { kind: 'meet'; id: string; position: number }
  /** Recall and use the cards just met. */
  | { kind: 'practice'; ids: string[] }
  | { kind: 'done' }

/** Cards in groups of about three, each group met one by one and then practised together. */
export function stepsOf(unit: Unit): LessonStep[] {
  const groups = Math.ceil(unit.cards.length / 3)
  const steps: LessonStep[] = [{ kind: 'intro' }]
  let start = 0
  for (let group = 0; group < groups; group++) {
    const size = Math.ceil((unit.cards.length - start) / (groups - group))
    const ids = unit.cards.slice(start, start + size)
    ids.forEach((id, offset) => steps.push({ kind: 'meet', id, position: start + offset + 1 }))
    steps.push({ kind: 'practice', ids })
    start += size
  }
  steps.push({ kind: 'done' })
  return steps
}
