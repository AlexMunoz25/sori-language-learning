import { expect, test } from '@playwright/test'
import { cardById, cards } from '../src/data/cards'
import { searchCards } from '../src/data/search'
import { stepsOf, units } from '../src/data/units'
import { conjugate, mistakes, optionsFor, type Ending } from '../src/recall/conjugate'
import { buildPractice } from '../src/recall/practice'
import { conjugations } from '../src/data/conjugations'
import { formQuestion, formWords, questionRuleById, type FormQuestion } from '../src/recall/questionRules'
import { addDays, anchorEvidence, applyMark, dueIds, introduce, intervals, nextDue, parseEntries, parseStates, schedule, type RecallEntry } from '../src/recall/review'

test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== 'desktop', 'Pure logic runs once') })

const today = '2026-10-12'

test('Spaced repetition: up a box when recalled, the same box with a hint, back to tomorrow when forgotten', () => {
  // A first answer: recalled without help skips ahead to three days; anything less comes back tomorrow.
  expect(schedule(undefined, 'correct', today)).toMatchObject({ box: 2, due: '2026-10-15', reps: 1, lapses: 0 })
  expect(schedule(undefined, 'hinted', today)).toMatchObject({ box: 1, due: '2026-10-13' })
  expect(schedule(undefined, 'incorrect', today)).toMatchObject({ box: 1, due: '2026-10-13', lapses: 1 })
  // Due: each box waits longer, up to four months.
  let state = schedule(undefined, 'correct', today)
  let day = today
  for (const expected of [3, 4, 5, 6, 7, 7]) {
    day = state.due
    state = schedule(state, 'correct', day)
    expect(state.box).toBe(expected)
    expect(state.due).toBe(addDays(day, intervals[expected]))
  }
  expect(schedule(state, 'hinted', state.due)).toMatchObject({ box: 7 })
  expect(schedule(state, 'incorrect', state.due)).toMatchObject({ box: 1, due: addDays(state.due, 1), lapses: 1 })
  // Not due yet: an extra test never moves a card up, but forgetting still brings it back tomorrow.
  const waiting = { box: 4, due: '2026-10-20', reps: 3, lapses: 0 }
  expect(schedule(waiting, 'correct', today)).toMatchObject({ box: 4, due: '2026-10-20', reps: 4 })
  expect(schedule(waiting, 'incorrect', today)).toMatchObject({ box: 1, due: '2026-10-13' })
})

test('Marks, lessons, and the due list feed the same schedule', () => {
  expect(applyMark(undefined, 'difficult', today)).toMatchObject({ box: 0, due: today })
  expect(applyMark({ box: 5, due: '2026-11-01', reps: 4, lapses: 0 }, 'difficult', today)).toMatchObject({ box: 1, due: today, reps: 4 })
  expect(applyMark(undefined, 'known', today)).toMatchObject({ box: 3, due: '2026-10-19' })
  const kept = { box: 5, due: '2026-11-01', reps: 4, lapses: 0 }
  expect(applyMark(kept, 'known', today)).toBe(kept)
  expect(introduce(undefined, today)).toMatchObject({ box: 1, due: '2026-10-13', reps: 0 })
  expect(introduce(kept, today)).toBe(kept)
  const states = {
    a: { box: 2, due: '2026-10-12', reps: 1, lapses: 0 },
    b: { box: 1, due: '2026-10-10', reps: 1, lapses: 1 },
    c: { box: 0, due: '2026-10-12', reps: 0, lapses: 0 },
    d: { box: 3, due: '2026-10-14', reps: 2, lapses: 0 },
  }
  // The most overdue first, then the least known.
  expect(dueIds(states, today)).toEqual(['b', 'c', 'a'])
  expect(nextDue(states, today)).toBe('2026-10-14')
  // Across months and years, in local time.
  expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  expect(addDays('2027-02-28', 1)).toBe('2027-03-01')
})

test('Saved schedules and answers are checked on the way in', () => {
  const id = 'Verbs:먹어요'
  const known = (key: string) => cardById.has(key)
  expect(parseStates({ [id]: { box: 99, due: '2026-10-12', reps: -1 }, ghost: { box: 1, due: '2026-10-12' }, 'Verbs:가요': { due: 'soon' } }, known))
    .toEqual({ [id]: { box: 7, due: '2026-10-12', reps: 0, lapses: 0 } })
  const entry: RecallEntry = { id, at: '2026-10-12T09:00:00.000Z', via: 'test', type: 'korean-to-english', outcome: 'correct', anchor: '2' }
  expect(parseEntries([entry, { ...entry, outcome: 'great' }, { ...entry, id: 'ghost' }, 'nope'], known)).toEqual([entry])
})

test('Anchor evidence: how a card did while each anchor was the learner’s choice', () => {
  const entry = (anchor: string | undefined, outcome: RecallEntry['outcome']): RecallEntry => ({ id: 'Verbs:먹어요', at: '2026-10-12T09:00:00.000Z', via: 'review', type: 'korean-to-english', outcome, ...anchor ? { anchor } : {} })
  const log = [entry('1', 'correct'), entry('1', 'correct'), entry('1', 'hinted'), entry('2', 'incorrect'), entry(undefined, 'correct'), { ...entry('1', 'correct'), id: 'Verbs:가요' }]
  expect(anchorEvidence(log, 'Verbs:먹어요')).toEqual({ 1: { asked: 3, correct: 2, hinted: 1, incorrect: 0 }, 2: { asked: 1, correct: 0, hinted: 0, incorrect: 1 } })
})

test('Conjugation: every polite form in the deck, the irregulars, and wrong options that are always wrong', () => {
  const conjugated = cards.filter(item => item.dictionaryForm)
  expect(conjugated.length).toBeGreaterThan(80)
  for (const item of conjugated) expect(conjugate(item.dictionaryForm!, 'present'), item.dictionaryForm).toBe(item.presentForm)
  const forms: Array<[string, Ending, string]> = [
    ['가다', 'past', '갔어요'], ['마시다', 'past', '마셨어요'], ['공부하다', 'past', '공부했어요'], ['듣다', 'past', '들었어요'], ['덥다', 'past', '더웠어요'],
    ['돕다', 'present', '도와요'], ['모르다', 'past', '몰랐어요'], ['쓰다', 'past', '썼어요'], ['낫다', 'present', '나아요'], ['빨갛다', 'present', '빨개요'],
    ['가다', 'future', '갈 거예요'], ['살다', 'future', '살 거예요'], ['듣다', 'future', '들을 거예요'], ['덥다', 'future', '더울 거예요'],
    ['읽다', 'please', '읽으세요'], ['살다', 'please', '사세요'], ['만들다', 'honorificPast', '만드셨어요'], ['걷다', 'please', '걸으세요'],
    ['가다', 'formal', '갑니다'], ['먹다', 'formal', '먹습니다'], ['살다', 'formal', '삽니다'], ['덥다', 'formal', '덥습니다'],
    ['먹다', 'shallWe', '먹을까요?'], ['공부하다', 'must', '공부해야 해요'], ['기다리다', 'pleaseForMe', '기다려 주세요'], ['가다', 'casual', '가'],
    ['먹다', 'want', '먹고 싶어요'], ['가다', 'dont', '가지 마세요'], ['먹다', 'negative', '먹지 않아요'], ['가다', 'cannot', '가지 못해요'], ['먹다', 'progressive', '먹고 있어요'],
    ['학생', 'copula', '학생이에요'], ['의사', 'copula', '의사예요'], ['학생', 'notBe', '학생이 아니에요'], ['의사', 'notBe', '의사가 아니에요'],
  ]
  for (const [word, ending, expected] of forms) expect(conjugate(word, ending), `${word} ${ending}`).toBe(expected)
  // Valid variants are never offered as wrong: uncontracted 마시어요, 보아요, 의사이에요, written 하여요.
  const valid = new Set(['마시어요', '보아요', '주어요', '배우어요', '의사이에요', '공부하여요'])
  const endings: Ending[] = ['present', 'past', 'future', 'progressive', 'want', 'can', 'must', 'please', 'dont', 'pleaseForMe', 'shallWe', 'negative', 'cannot', 'formal', 'casual', 'honorific', 'honorificPast']
  for (const item of conjugated.filter(card => !/생겼다$/.test(card.dictionaryForm!))) for (const ending of endings) {
    const options = optionsFor(item.dictionaryForm!, ending)!
    expect(options, `${item.dictionaryForm} ${ending}`).toHaveLength(4)
    expect(new Set(options).size).toBe(4)
    for (const wrong of mistakes(item.dictionaryForm!, ending)) {
      expect(wrong).not.toBe(conjugate(item.dictionaryForm!, ending))
      expect(valid.has(wrong), wrong).toBe(false)
    }
  }
  expect(mistakes('마시다', 'present')).not.toContain('마시어요')
  expect(mistakes('의사', 'copula')).toEqual(['의사에요', '의사이예요', '의사가 아니에요'])
})

test('Search finds a card by Korean in any form, by English, and by how it sounds', () => {
  expect(searchCards('커피')[0].id).toBe('Drinks:커피')
  expect(searchCards('coffee')[0].id).toBe('Drinks:커피')
  expect(searchCards('keo-pi')[0].id).toBe('Drinks:커피')
  // Dictionary forms and grammar pieces count too: 먹다 finds 먹어요, 은 finds 은/는, “topic” finds it by its job.
  expect(searchCards('먹다')[0].id).toBe('Verbs:먹어요')
  expect(searchCards('은').map(item => item.id)).toContain('particle:은/는')
  expect(searchCards('topic').map(item => item.id)).toContain('particle:은/는')
  expect(searchCards('   ')).toEqual([])
  expect(searchCards('xylophone')).toEqual([])
})

test('Learn: every unit meets its cards a few at a time, then practises them in two ways', () => {
  let ownWords = 0
  for (const unit of units) {
    const steps = stepsOf(unit)
    expect(steps[0]).toEqual({ kind: 'intro' })
    expect(steps.at(-1)).toEqual({ kind: 'done' })
    const met = steps.flatMap(step => step.kind === 'meet' ? [step.id] : [])
    expect(met, unit.id).toEqual(unit.cards)
    // Every group of two or three cards ends in a practice of exactly those cards.
    const practices = steps.flatMap(step => step.kind === 'practice' ? [step.ids] : [])
    expect(practices.flat(), unit.id).toEqual(unit.cards)
    for (const ids of practices) {
      expect(ids.length).toBeGreaterThanOrEqual(2)
      expect(ids.length).toBeLessThanOrEqual(3)
      const questions = buildPractice(ids.map(id => cardById.get(id)!), () => 0.5, unit.cards.map(id => cardById.get(id)!))
      // A grammar point is built on one of the unit's own words whenever one fits.
      for (const question of questions.filter(question => question.type === 'conjugate')) {
        const own = formWords(conjugations[question.itemId]).filter(word => unit.cards.includes(word.id)).map(word => word.id)
        if (own.length) { expect(own, `${unit.id} ${question.itemId}`).toContain((question.data as FormQuestion).word); ownWords++ }
      }
      // First what each card means, then each card at work (all of them have a sentence).
      expect(questions.slice(0, ids.length).every(question => question.type === 'korean-to-english')).toBe(true)
      expect(questions.slice(ids.length).map(question => question.itemId).sort()).toEqual([...ids].sort())
      for (const question of questions) {
        const rule = questionRuleById.get(question.type)!
        expect(rule.parseData ? rule.parseData(JSON.parse(JSON.stringify(question.data)), cardById.get(question.itemId)!) : undefined).toEqual(question.data)
      }
    }
  }
  // Most of the forms Learn teaches are built on the unit's own words (먹다 → 먹었어요 in What you did).
  expect(ownWords).toBeGreaterThanOrEqual(10)
})

test('Build the form: grammar cards conjugate the learner’s own words, and every wrong option is wrong', () => {
  const rule = questionRuleById.get('conjugate')!
  for (const [id, spec] of Object.entries(conjugations)) {
    const item = cardById.get(id)!
    expect(item, id).toBeTruthy()
    expect(rule.supports(item), id).toBe(true)
    for (let seed = 1; seed <= 12; seed++) {
      let state = seed
      const random = () => (state = (state * 16807) % 2147483647) / 2147483647
      const data = rule.prepare!(item, { pool: [item], random }) as FormQuestion
      const { expected, word } = formQuestion(item, data)
      expect(formWords(spec).map(candidate => candidate.id), id).toContain(word.id)
      expect(data.options, `${id} ${word.id}`).toHaveLength(4)
      expect(new Set(data.options).size).toBe(4)
      expect(data.options).toContain(expected)
      expect(rule.parseData!(JSON.parse(JSON.stringify(data)), item)).toEqual(data)
      expect(rule.evaluate(item, { kind: 'choice', choice: expected }, { data })).toMatchObject({ result: 'correct' })
      for (const wrong of data.options.filter(option => option !== expected)) expect(rule.evaluate(item, { kind: 'choice', choice: wrong }, { data })).toMatchObject({ result: 'incorrect' })
      const hints = rule.hints(item, { data })
      expect(hints.map(hint => hint.kind)).toEqual(['rule', 'narrow'])
      // The rule says how the word takes the ending, never the finished form.
      expect(hints[0].text, `${id} ${word.id}`).not.toContain(expected)
    }
  }
  // Respectful verbs have their own words (먹다 → 드세요), and nobody asks “please don't like it”.
  expect(formWords(conjugations['ending:-(으)세요']).map(item => item.dictionaryForm)).not.toContain('먹다')
  expect(formWords(conjugations['ending:-지 마세요']).map(item => item.dictionaryForm)).not.toContain('좋아하다')
  expect(formWords(conjugations['ending:-이에요/예요']).every(item => item.category === 'Jobs / Occupations')).toBe(true)
  // A tampered save, with an option that isn't one of the word's real mistakes, is refused.
  const past = cardById.get('tense:-았/었어요')!
  expect(rule.parseData!({ word: 'Verbs:먹어요', options: ['먹었어요', '먹았어요', '먹어요', '먹었다'] }, past)).toBeUndefined()
  expect(rule.parseData!({ word: 'Fruit:사과', options: ['사과', '사과를', '사과가', '사과는'] }, past)).toBeUndefined()
})
