import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { recallData } from '../src/data/recall-data'
import { vocabulary, vocabularyById } from '../src/data/vocabulary'
import { koreanKey, lookAlikeGroups, meaningKey } from '../src/recall/answers'
import { acceptedTexts, givesAway, matchEnglish } from '../src/recall/english'
import { buildTest, capacity, recencyOf } from '../src/recall/generate'
import { gradeReading } from '../src/recall/handwriting'
import { meaningTerms } from '../src/recall/hints'
import { normalizeKorean } from '../src/recall/korean'
import { questionRuleById, questionRules } from '../src/recall/questionRules'
import { scoreTest } from '../src/recall/scoring'
import type { AnswerRecord, TestQuestion } from '../src/recall/types'

const byWord = (word: string, category?: string) => vocabulary.find(item => item.korean === word && (!category || item.category === category))!
const inCategory = (category: string) => vocabulary.filter(item => item.category === category)
const rule = (id: string) => questionRuleById.get(id)!

/** Deterministic randomness (mulberry32), so generation tests cover many shuffles reproducibly. */
function seeded(seed: number) {
  return () => {
    seed = seed + 0x6D2B79F5 | 0
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed)
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value
    return ((value ^ value >>> 14) >>> 0) / 4294967296
  }
}
const promptOf = (question: TestQuestion) => `${question.type}|${rule(question.type).promptKey(vocabularyById.get(question.itemId)!)}`
const longestRun = (questions: TestQuestion[]) => questions.reduce((state, question, index) => {
  const run = index && questions[index - 1].type === question.type ? state.run + 1 : 1
  return { run, max: Math.max(state.max, run) }
}, { run: 0, max: 0 }).max
const alike = (a: TestQuestion, b: TestQuestion) =>
  lookAlikeGroups(vocabularyById.get(a.itemId)!).some(key => lookAlikeGroups(vocabularyById.get(b.itemId)!).includes(key))

test.describe('Generation, answer keys, grading, hints, and scoring', () => {
  test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== 'desktop', 'Pure logic runs once') })

  test('Every test length: distinct words and prompts, balanced types, short runs, look-alikes apart', () => {
    const pools = { Music: inCategory('Music'), Food: inCategory('Food'), Adjectives: inCategory('Adjectives'), 'All words': vocabulary }
    for (const [name, pool] of Object.entries(pools)) for (const length of [10, 20, pool.length]) {
      for (let seed = 1; seed <= (pool.length > 100 && length === pool.length ? 30 : 120); seed++) {
        const questions = buildTest(pool, { length, rules: questionRules, random: seeded(seed) })
        const label = `${name}, ${length} questions, seed ${seed}`
        expect(questions.map(question => question.id), label).toEqual(questions.map((_, index) => `q${index + 1}`))
        expect(questions, label).toHaveLength(Math.min(length, pool.length))
        expect(new Set(questions.map(question => question.itemId)).size, label).toBe(questions.length)
        expect(new Set(questions.map(promptOf)).size, label).toBe(questions.length)
        const counts = questionRules.filter(candidate => pool.some(item => candidate.supports(item)))
          .map(candidate => questions.filter(question => question.type === candidate.id).length)
        expect(Math.max(...counts) - Math.min(...counts), label).toBeLessThanOrEqual(1)
        expect(longestRun(questions), label).toBeLessThanOrEqual(3)
        expect(questions.some((question, index) => index > 0 && alike(questions[index - 1], question)), label).toBe(false)
      }
    }
  })

  test('With one type, look-alikes sharing a prompt count once, and setup can say so', () => {
    const englishToKorean = [rule('english-to-korean')]
    expect(capacity(inCategory('Music'), englishToKorean)).toBe(12)
    expect(capacity([byWord('락'), byWord('록')], englishToKorean)).toBe(1)
    expect(capacity(vocabulary, [rule('korean-to-english')])).toBe(324)
    expect(capacity(vocabulary, questionRules)).toBe(vocabulary.length)
    for (let seed = 1; seed <= 40; seed++) {
      const questions = buildTest(inCategory('Music'), { length: 14, rules: englishToKorean, random: seeded(seed) })
      expect(questions).toHaveLength(12)
      expect(new Set(questions.map(promptOf)).size).toBe(12)
    }
  })

  test('Short tests skip look-alikes, a small pool gives every word once, and new tests prefer untested words', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const groups = buildTest(inCategory('Food'), { length: 10, rules: questionRules, random: seeded(seed) })
        .flatMap(question => lookAlikeGroups(vocabularyById.get(question.itemId)!))
      expect(new Set(groups).size, `seed ${seed}`).toBe(groups.length)
    }
    const seasons = buildTest(inCategory('Seasons'), { length: 10, rules: questionRules, random: seeded(3) })
    expect(seasons.map(question => question.itemId).sort()).toEqual(inCategory('Seasons').map(item => item.id).sort())

    const verbs = inCategory('Verbs')
    expect(recencyOf([['a', 'b'], ['b', 'c'], ['d']])).toEqual(new Map([['a', 3], ['b', 2], ['c', 2], ['d', 1]]))
    const first = buildTest(verbs, { length: 10, rules: questionRules, random: seeded(1) })
    const second = buildTest(verbs, { length: 10, rules: questionRules, random: seeded(2), recent: recencyOf([first.map(question => question.itemId)]) })
    expect(second.filter(question => first.some(earlier => earlier.itemId === question.itemId))).toHaveLength(0)
    // Once fresh words run out, the oldest test's words come back before newer ones.
    const older = verbs.slice(20, 30).map(item => item.id)
    const newer = verbs.slice(0, 20).map(item => item.id)
    const third = buildTest(verbs, { length: 16, rules: questionRules, random: seeded(4), recent: recencyOf([older, newer]) })
    const fresh = verbs.slice(30).map(item => item.id)
    expect(third.map(question => question.itemId).sort()).toEqual([...fresh, ...older].sort())
  })

  test('Answer keys accept what the prompt allows, and nothing it rules out', () => {
    const alternatives = (key: { alternatives: Array<{ text: string }> }) => key.alternatives.map(alternative => alternative.text)
    expect(alternatives(koreanKey(byWord('형')))).not.toContain('오빠')
    expect(alternatives(koreanKey(byWord('오빠')))).not.toContain('형')
    expect(koreanKey(byWord('배워요')).alternatives).toContainEqual({ text: '배우다', reason: 'dictionary form' })
    expect(koreanKey(byWord('채소')).alternatives).toContainEqual({ text: '야채', reason: 'same meaning' })
    expect(alternatives(meaningKey(byWord('가요', 'Verbs')))).toEqual(['pop / popular music'])
    expect(meaningKey(byWord('사과')).alternatives).toEqual([])
  })

  test('Typed meanings: forms, spacing, synonyms, and small typos count; another word’s meaning never does', () => {
    const cases: Array<[string, string, 'correct' | 'incorrect' | 'uncertain', string?]> = [
      // The meaning as written, in any form.
      ['예뻐요', 'Pretty!', 'correct'], ['배', 'pears', 'correct'], ['수영', 'to swim', 'correct'], ['가요', 'going', 'correct', 'Verbs'],
      ['엊그제', 'day before yesterday', 'correct'], ['한국어를 배워요', 'I am learning Korean', 'correct'], ['밥 먹어요', 'having a meal', 'correct'],
      ['아이스크림', 'icecream', 'correct'], ['케이팝', 'kpop', 'correct'], ['힙합', 'hip hop', 'correct'], ['알앤비', 'R & B', 'correct'],
      ['카페', 'cafe', 'correct'], ['회색', 'grey', 'correct'], ['엄마', 'mum', 'correct'], ['남자', 'men', 'correct'], ['영화', 'film', 'correct'],
      // Any one sense, any optional part, or several senses at once.
      ['아파요', 'hurt', 'correct'], ['아파요', 'sick, hurt', 'correct'], ['더워요', 'hot', 'correct'], ['더워요', 'hot weather', 'correct'],
      ['가요', 'pop music', 'correct', 'Verbs'], ['무슨 운동을 해요?', 'what exercise do you do', 'correct'],
      // Small typos in longer words.
      ['예뻐요', 'prety', 'correct'], ['일요일', 'sundya', 'correct'], ['회사원', 'company employe', 'correct'],
      // Negation always matters.
      ['재미없어요', "isn't fun", 'correct'], ['재미없어요', 'fun', 'incorrect'], ['재미없어요', 'not boring', 'incorrect'], ['맛없어요', 'delicious', 'incorrect'],
      // Another word's meaning is wrong, however close: "warm" is 따뜻해요, "tea" is 차, "blue" is 파란색, "bag" is 가방.
      ['더워요', 'warm', 'incorrect'], ['뜨거워요', 'hot weather', 'incorrect'], ['녹차', 'tea', 'incorrect'], ['남색', 'blue', 'incorrect'],
      ['커요', 'bag', 'incorrect'], ['형', 'younger brother', 'incorrect'], ['일요일', 'monday', 'incorrect'], ['가요', 'to come', 'incorrect', 'Verbs'],
      // Short words must be exact; close ones and partial ones are the learner's call.
      ['배', 'bear', 'uncertain'], ['형', 'brother', 'uncertain'], ['회사원', 'employee', 'uncertain'], ['아파요', 'sick / tired', 'uncertain'],
      // Reviewed synonyms count; their opposites, and other words' synonyms, never pass as typos.
      ['싸요', 'inexpensive', 'correct'], ['싸요', 'expensive', 'incorrect'], ['행복해요', 'unhappy', 'incorrect'], ['재미있어요', 'uninteresting', 'incorrect'],
      ['지갑', 'purse', 'correct'], ['지갑', 'nurse', 'incorrect'], ['같아요', 'identical', 'correct'], ['외할아버지', "mother's father", 'correct'],
      ['외할아버지', 'mother and father', 'incorrect'], ['날씨가 더워요', "it's hot", 'correct'], ['코미디 영화', 'comedy film', 'correct'],
      // Not English at all.
      ['사과', '사과', 'incorrect'], ['사과', '???', 'incorrect'],
      // Forms are inflections, never look-alikes: cut is not cute, hat is not hate, tiring is 힘들어요, not 피곤해요 (tired).
      ['귀여워요', 'cut', 'uncertain'], ['싫어해요', 'hat', 'uncertain'], ['싫어해요', 'hates', 'correct'], ['울어요', 'cries', 'correct'],
      ['써요', 'writing', 'correct'], ['피곤해요', 'tiring', 'incorrect'], ['힘들어요', 'tired', 'incorrect'],
      // In short words a changed letter is another word (light/night, short/shirt), so it's asked, not forgiven.
      ['밝아요', 'night', 'uncertain'], ['짧아요', 'shirt', 'uncertain'],
      // Every negation counts, and contractions are spelled out: "I'll" is not ill.
      ['무슨 색깔을 좋아해요?', "What color didn't you like?", 'incorrect'], ['무슨 색깔을 좋아해요?', 'What color do you never like?', 'incorrect'],
      ['아파요', "I'll", 'incorrect'], ['가요', 'I will go', 'correct', 'Verbs'],
    ]
    for (const [korean, typed, expected, category] of cases) {
      expect(matchEnglish(typed, byWord(korean, category)).result, `${korean}: “${typed}”`).toBe(expected)
    }
    // Reviewed synonyms count, and are hidden from anchor hints like the meaning itself.
    for (const item of vocabulary) for (const synonym of recallData[item.id]?.accept ?? []) {
      expect(matchEnglish(synonym, item).result, `${item.korean}: synonym “${synonym}”`).toBe('correct')
      expect(acceptedTexts(item)).toContain(synonym)
    }
    // Every card's own meaning, and each sense of it, is correct.
    for (const item of vocabulary) for (const sense of item.meaning.split(/ \/ (?![^(]*\))/)) {
      expect(matchEnglish(sense, item).result, `${item.korean}: “${sense}”`).toBe('correct')
    }
  })

  test('Handwriting readings are graded by what was written, and doubt goes to the learner', () => {
    const apple = koreanKey(byWord('사과'))
    expect(gradeReading(['사과', '사고'], apple)).toMatchObject({ result: 'correct', read: '사과', matched: '사과' })
    // The engine's runner-up is the answer: the learner says which they wrote.
    expect(gradeReading(['사고', '사과', '서고'], apple)).toMatchObject({ result: 'uncertain', read: '사고', alternatives: ['사과', '서고'] })
    // One letter from the answer: messy writing or a misspelling, so ask.
    expect(gradeReading(['사꽈'], apple).result).toBe('uncertain')
    // The engine "corrected" a misspelling into the answer, and its list shows little agreement: ask before crediting it.
    expect(gradeReading(['가르쳐요', '가르처요', '가 르처요', '가르 처요'], koreanKey(byWord('가르쳐요')))).toMatchObject({ result: 'uncertain', read: '가르쳐요', alternatives: ['가르처요'] })
    expect(gradeReading(['가르쳐요', '가르쳐요.', '가르 쳐요', '가르처요'], koreanKey(byWord('가르쳐요'))).result).toBe('correct')
    // Another vocabulary word is wrong; a misreading of correct writing (가을 read as 17을) is never marked wrong, only asked.
    expect(gradeReading(['바나나'], apple)).toMatchObject({ result: 'incorrect', read: '바나나' })
    expect(gradeReading(['17을', '가을'], koreanKey(byWord('가을'))).result).toBe('uncertain')
    expect(gradeReading(['17을'], koreanKey(byWord('가을'))).result).toBe('uncertain')
    expect(gradeReading(['앱'], koreanKey(byWord('랩'))).result).toBe('uncertain')
    expect(gradeReading([], apple)).toMatchObject({ result: 'uncertain', by: 'recognizer' })
    // Spacing and punctuation never matter; the dictionary form and same-meaning words count.
    expect(gradeReading(['무슨음식을 제일좋아해요'], koreanKey(byWord('무슨 음식을 제일 좋아해요?'))).result).toBe('correct')
    expect(gradeReading(['배우다'], koreanKey(byWord('배워요')))).toMatchObject({ result: 'correct', matched: '배우다' })
    expect(gradeReading(['야채'], koreanKey(byWord('채소'))).result).toBe('correct')
    // Latin letters in an answer may be written in either case.
    expect(gradeReading(['SF영화', 'sF영화', 'Sf영화', 'sf영화', 'SF 영화'], koreanKey(byWord('SF 영화'))).result).toBe('correct')
    expect(rule('english-to-korean').grade!(byWord('SF 영화'), 'sf영화')).toBe('correct')
    // 오빠 is “older brother” for a female speaker, not for the male speaker the 형 prompt names.
    expect(gradeReading(['오빠'], koreanKey(byWord('형'))).result).toBe('incorrect')
    expect(rule('english-to-korean').grade!(byWord('형'), '형')).toBe('correct')
    expect(rule('english-to-korean').grade!(byWord('형'), '오빠')).toBe('incorrect')
  })

  test('Recorded engine readings: correct writing is never marked wrong, and misspellings are rarely credited', () => {
    // The handwriting engine's real answers to 1,692 synthetic handwriting samples (see docs/handwriting-recognition.md).
    const { rows } = JSON.parse(readFileSync(new URL('./fixtures/handwriting-readings.json', import.meta.url), 'utf8')) as { rows: Array<[string, string, string, string, string[]]> }
    const keyOf = (word: string) => koreanKey(vocabulary.find(item => normalizeKorean(item.korean) === normalizeKorean(word))!)
    const tally: Record<string, Record<'correct' | 'uncertain' | 'incorrect', number>> = {}
    for (const [kind, level, expected, written, candidates] of rows) {
      const result = gradeReading(candidates, keyOf(expected)).result
      for (const group of [kind, `${kind} · ${level}`]) (tally[group] ??= { correct: 0, uncertain: 0, incorrect: 0 })[result]++
      if (kind === 'correct') expect(result, `${written}: ${candidates.join(', ')}`).not.toBe('incorrect')
      if (kind === 'other word') expect(result, `${written} for ${expected}`).not.toBe('correct')
    }
    const share = (group: string, result: 'correct' | 'uncertain' | 'incorrect') => tally[group][result] / Object.values(tally[group]).reduce((a, b) => a + b)
    // Most correct writing is graded at once, even messy; the rest is asked, never marked down.
    expect(share('correct', 'correct')).toBeGreaterThan(.85)
    expect(share('correct · messy', 'correct')).toBeGreaterThan(.75)
    // A misspelling the engine "corrects" into the answer is usually caught and asked about.
    expect(share('misspelled', 'correct')).toBeLessThan(.06)
  })

  test('Scoring: 1 point, ½ with any hint, 0 when incorrect; answers still in doubt never count', () => {
    const questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'].map(id => ({ id, itemId: vocabulary[0].id, type: 'korean-to-english' }))
    const at = '2026-10-11T00:00:00.000Z'
    const answers: Record<string, AnswerRecord> = {
      q1: { answer: { kind: 'text', text: 'pretty' }, answeredAt: at, hints: 0, auto: { result: 'correct', by: 'match' } },
      q2: { answer: { kind: 'text', text: 'pretty' }, answeredAt: at, hints: 2, auto: { result: 'correct', by: 'match' } },
      q3: { answer: { kind: 'text', text: 'ugly' }, answeredAt: at, hints: 1, auto: { result: 'incorrect', by: 'match' } },
      // The learner's call settles a doubt either way, and overrides the app.
      q4: { answer: { kind: 'text', text: 'prety' }, answeredAt: at, hints: 0, auto: { result: 'uncertain', by: 'match' }, self: 'correct' },
      q5: { answer: { kind: 'text', text: 'beautiful' }, answeredAt: at, hints: 0, auto: { result: 'uncertain', by: 'match' } },
    }
    expect(scoreTest(questions, answers)).toEqual({ earned: 2.5, possible: 4, percent: 63, correct: 2, hinted: 1, incorrect: 1, pending: 1, settledByLearner: 1 })
    expect(scoreTest(questions, {})).toMatchObject({ earned: 0, possible: 0, percent: 0 })
  })

  test('Hints never give the answer away, and every question has one', () => {
    test.setTimeout(120_000)
    const koToEn = rule('korean-to-english')
    const enToKo = rule('english-to-korean')
    for (const item of vocabulary) {
      const terms = meaningTerms(acceptedTexts(item)).filter(term => term.length >= 3)
      const reading = (item.pronunciation ?? '').toLowerCase().replace(/[^a-z]/g, '')
      expect(koToEn.hints(item, {}).length, item.id).toBeGreaterThan(0)
      expect(enToKo.hints(item, {}).length, item.id).toBeGreaterThan(0)
      const checked = new Set<string>()
      for (const anchor of item.anchors) {
        const context = { anchor: { text: anchor.text, kind: anchor.kind, own: false, source: anchor.source } }
        for (const hint of koToEn.hints(item, context)) {
          const said = terms.filter(term => new RegExp(`\\b${term}`, 'i').test(hint.text))
          expect(said, `${item.id} #${anchor.id} KO→EN ${hint.kind}: ${hint.text}`).toEqual([])
          expect(hint.text, item.id).not.toMatch(/[가-힣]/)
          // Nothing in a hint is an answer the grader would accept: not "LIKE", "Grey", "THOR's day", or "pe(ar)".
          if (!checked.has(hint.text)) expect(givesAway(hint.text, item), `${item.id} #${anchor.id} KO→EN ${hint.kind}: ${hint.text}`).toBe(false)
          checked.add(hint.text)
        }
        for (const hint of enToKo.hints(item, context)) {
          expect(hint.text, `${item.id} #${anchor.id} EN→KO ${hint.kind}`).not.toMatch(/[가-힣]/)
          if (reading.length >= 4) expect(hint.text.toLowerCase().replace(/[^a-z]/g, ''), `${item.id} #${anchor.id}: ${hint.text}`).not.toContain(reading)
        }
      }
    }
  })
})

type Seed = { category?: string; filter?: 'all' | 'difficult'; difficult?: string[]; only?: 'korean-to-english' | 'english-to-korean'; mode?: string; order?: string[]; index?: number; anchors?: Record<string, string> }
async function openTest(page: Page, options: Seed = {}) {
  const { category = 'Verbs', filter = 'all', difficult = [], only, mode = 'test', index = 0, anchors = {} } = options
  const order = options.order ?? (category === 'Verbs' ? ['Verbs:배워요'] : [])
  await page.addInitScript(({ category, filter, progress, disabledTypes, mode, order, index, anchors }) => {
    localStorage.setItem('sori.guideSeen.v1', 'true')
    if (sessionStorage.getItem('test.seeded')) return
    sessionStorage.setItem('test.seeded', 'true')
    localStorage.setItem('sori.progress.v1', JSON.stringify(progress))
    if (Object.keys(anchors).length) localStorage.setItem('sori.anchors.v1', JSON.stringify(anchors))
    if (disabledTypes.length) localStorage.setItem('sori.testPreferences.v1', JSON.stringify({ length: 10, disabledTypes }))
    sessionStorage.setItem('sori.session.v1', JSON.stringify({ category, mode, filter, order, index }))
  }, {
    category, filter, mode, order, index,
    progress: Object.fromEntries(difficult.map(word => [byWord(word).id, 'difficult'])),
    disabledTypes: only ? questionRules.filter(candidate => candidate.id !== only).map(candidate => candidate.id) : [],
    anchors: Object.fromEntries(Object.entries(anchors).map(([word, id]) => [byWord(word).id, { selected: id, selectedAt: new Date().toISOString() }])),
  })
  await page.goto('/')
}

/** Stands in for the handwriting engine: a fixed reading, a reading per request, or no connection. */
async function recognizer(page: Page, reply: string[] | 'offline' | ((request: { ink: number[][][] }) => string[])) {
  const requests: Array<{ ink: number[][][]; language: string; writing_guide: { writing_area_width: number; writing_area_height: number } }> = []
  await page.route('https://inputtools.google.com/**', async route => {
    if (reply === 'offline') return route.abort('internetdisconnected')
    const request = route.request().postDataJSON().requests[0]
    requests.push(request)
    const candidates = typeof reply === 'function' ? reply(request) : reply
    await route.fulfill({ json: ['SUCCESS', [['mock', candidates, [], { is_html_escaped: false }]]], headers: { 'Access-Control-Allow-Origin': '*' } })
  })
  return requests
}

const question = (page: Page) => page.getByTestId('test-question')
const pad = (page: Page) => page.getByTestId('writing-pad')
const count = (page: Page) => page.getByTestId('test-count')
const result = (page: Page) => page.getByTestId('test-result')
const answerField = (page: Page) => page.getByRole('textbox', { name: 'Meaning in English' })
const row = (page: Page, korean: string) => page.getByTestId('test-row').filter({ has: page.getByText(korean, { exact: true }) })
const saved = (page: Page) => page.evaluate(() => JSON.parse(sessionStorage.getItem('sori.test.v1') ?? 'null'))
/** Answers and Next are ignored for 300ms after a question or answer appears, so a double tap can't skip either. */
const settle = (page: Page) => page.waitForTimeout(350)

/** Which card of the test's pool the current question is about, read from what is on screen. */
async function currentItem(page: Page, pool: typeof vocabulary) {
  const type = await question(page).getAttribute('data-type')
  if (type === 'korean-to-english') {
    const korean = await question(page).getByTestId('korean-word').textContent()
    return pool.find(item => item.korean === korean)!
  }
  if (type === 'complete-sentence') {
    const english = await page.getByTestId('test-translation').textContent()
    return pool.find(item => item.example?.english === english)!
  }
  const meaning = await page.getByTestId('test-meaning').textContent()
  return pool.find(item => item.meaning === meaning)!
}
const words = (...list: string[]) => list.map(word => byWord(word))

async function draw(page: Page, from: [number, number] = [.2, .3], to: [number, number] = [.45, .7]) {
  const box = (await pad(page).locator('canvas').boundingBox())!
  await page.mouse.move(box.x + box.width * from[0], box.y + box.height * from[1])
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * to[0], box.y + box.height * to[1], { steps: 6 })
  await page.mouse.up()
}
const inkPixels = (page: Page) => pad(page).locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
  const { data } = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height)
  let painted = 0
  for (let index = 3; index < data.length; index += 4) if (data[index] > 0) painted++
  return painted
})
async function reveal(page: Page) {
  await settle(page)
  await question(page).getByRole('button', { name: /^(Show|Check) answer$/ }).click()
}
/** Types an answer and checks it with Enter. */
async function answer(page: Page, text: string) {
  await answerField(page).fill(text)
  await settle(page)
  await answerField(page).press('Enter')
}
async function proceed(page: Page) {
  await settle(page)
  await page.locator('#test-next').click()
}

const main = (page: Page) => page.getByRole('navigation', { name: 'Main' })
const go = (page: Page, destination: 'Learn' | 'Library' | 'Review') => main(page).getByRole('button', { name: new RegExp(`^${destination}`) }).click()

test('Review builds tests from the Library selection, and a test leaves the deck alone', async ({ page }) => {
  await openTest(page, { mode: 'standard' })
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
  await go(page, 'Review')
  await expect(page.getByTestId('test-pool')).toHaveText('Verbs · 36 words')
  const lengths = page.getByRole('group', { name: 'Questions' }).getByRole('button')
  await expect(lengths).toHaveText(['10', '20', 'All 36'])
  await expect(lengths.first()).toHaveAttribute('aria-pressed', 'true')
  // Words have sentences too, so they can also be asked in context.
  const types = page.getByRole('group', { name: 'Question types' }).getByRole('button')
  await expect(types).toHaveText([/Korean → English/, /English → Korean/, /Complete the sentence/])
  for (const type of await types.all()) await expect(type).toHaveAttribute('aria-pressed', 'true')
  // Handwriting leaves the device to be read, so setup says so.
  await expect(page.getByText(/Handwriting is read by Google handwriting recognition/)).toBeVisible()
  await page.getByRole('button', { name: 'Start test' }).click()
  await expect(count(page)).toHaveText('Question 1 of 10')
  await expect(page.getByTestId('running-score')).toHaveText('0/0 pts')
  // Nothing that changes the test's words is there mid-test, and arrow keys don't move it.
  await expect(page.getByRole('button', { name: 'Choose category' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Choose what to test' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Next word' })).toHaveCount(0)
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  for (const key of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'ArrowRight']) await page.keyboard.press(key)
  await expect(count(page)).toHaveText('Question 1 of 10')
  // The Library is one tap away, on the same card, and the test waits.
  await go(page, 'Library')
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
  await expect(page.getByTestId('deck-count')).toHaveText('1 / 36')
  await go(page, 'Review')
  await expect(count(page)).toHaveText('Question 1 of 10')
})

test('Korean → English: Enter checks once, the answer is graded at once, and Enter continues', async ({ page }) => {
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['배워요', '사과', '오빠'], only: 'korean-to-english' })
  await expect(page.getByRole('group', { name: 'Questions' }).getByRole('button')).toHaveText(['All 3'])
  await page.getByRole('button', { name: 'Start test' }).click()
  const first = await currentItem(page, words('배워요', '사과', '오빠'))
  await expect(question(page)).not.toContainText(first.meaning)
  await expect(answerField(page)).toBeFocused()
  await expect(question(page).getByRole('button', { name: 'Show answer' })).toBeVisible()
  // The meaning in another form, with a typo, still counts.
  await answer(page, `${first.meaning.replace(/^to /, '').toUpperCase()}`)
  await expect(page.getByTestId('your-answer')).toHaveText(first.meaning.replace(/^to /, '').toUpperCase())
  await expect(page.getByTestId('test-solution')).toHaveText(first.meaning)
  await expect(result(page)).toHaveAttribute('data-outcome', 'correct')
  await expect(page.getByTestId('test-points')).toHaveText('+1 point')
  await expect(page.getByTestId('running-score')).toHaveText('1/1 pts')
  await expect(count(page)).toHaveText('Question 1 of 3')
  await expect(page.getByRole('button', { name: 'Next question' })).toBeFocused()
  await settle(page)
  await page.keyboard.press('Enter')
  await expect(count(page)).toHaveText('Question 2 of 3')
  await expect(answerField(page)).toBeFocused()

  // A blank answer is shown as such and scores nothing.
  await reveal(page)
  await expect(page.getByTestId('your-answer')).toHaveText('Left blank')
  await expect(result(page)).toHaveAttribute('data-outcome', 'incorrect')
  await expect(page.getByTestId('test-points')).toHaveText('0 points')
  await proceed(page)
  // Something unrelated is simply wrong; the learner may still say it means the same.
  await answer(page, 'xylophone')
  await expect(result(page)).toHaveAttribute('data-outcome', 'incorrect')
  await page.getByRole('button', { name: 'Count my answer' }).click()
  await expect(result(page)).toHaveAttribute('data-outcome', 'correct')
  await expect(result(page)).toContainText('Changed by you')
  // Each button replaces the one pressed, and focus follows.
  await expect(page.getByRole('button', { name: 'Undo your call' })).toBeFocused()
  await page.getByRole('button', { name: 'Undo your call' }).click()
  await expect(result(page)).toHaveAttribute('data-outcome', 'incorrect')
  await expect(page.getByRole('button', { name: 'Count my answer' })).toBeFocused()
  await proceed(page)
  await expect(page.getByRole('heading', { name: 'Test complete' })).toBeFocused()
  await expect(page.getByTestId('test-score')).toHaveText('1 / 3 points33%')
  await expect(page.getByTestId('test-breakdown')).toHaveText(['1 correct', '0 with a hint', '2 incorrect'].join(''))
  await expect(page.getByTestId('test-row')).toHaveCount(3)
})

test('A close or partial typed answer is the learner’s call, made with the answer in view', async ({ page }) => {
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['형', '배'], only: 'korean-to-english' })
  await page.getByRole('button', { name: 'Start test' }).click()
  for (let index = 0; index < 2; index++) {
    const item = await currentItem(page, words('형', '배'))
    await answer(page, item.korean === '형' ? 'brother' : 'bear')
    // Nothing is graded yet: the answer is shown and the learner decides.
    await expect(question(page)).toHaveAttribute('data-phase', 'confirming')
    await expect(page.getByTestId('test-solution')).toHaveText(item.meaning)
    await expect(page.getByTestId('test-confirm')).toContainText(item.korean === '형' ? 'Partly right.' : 'Close, but spelled differently.')
    await expect(page.getByRole('button', { name: 'Yes, count it' })).toBeFocused()
    await expect(page.locator('#test-next')).toHaveCount(0)
    await expect(page.getByTestId('running-score')).toHaveText(index ? '1/1 pts' : '0/0 pts')
    // A reload keeps the question waiting for the learner.
    if (!index) { await page.reload(); await expect(question(page)).toHaveAttribute('data-phase', 'confirming') }
    await settle(page)
    await page.getByRole('button', { name: index ? 'No' : 'Yes, count it', exact: true }).click()
    await expect(result(page)).toHaveAttribute('data-outcome', index ? 'incorrect' : 'correct')
    await expect(result(page)).toContainText('Your call')
    await proceed(page)
  }
  await expect(page.getByTestId('test-score')).toHaveText('1 / 2 points50%')
  await expect(page.getByTestId('test-row').filter({ hasText: 'your call' })).toHaveCount(2)
})

test('Hints: one at a time from your anchor, then a clue; any hint makes the answer worth half a point', async ({ page }) => {
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['예뻐요', '바빠요'], only: 'korean-to-english', anchors: { 예뻐요: '1' } })
  await page.getByRole('button', { name: 'Start test' }).click()
  for (let index = 0; index < 2; index++) {
    const item = await currentItem(page, words('예뻐요', '바빠요'))
    const hint = page.getByRole('button', { name: /hint$/i })
    await expect(hint).toHaveAccessibleDescription('max ½ point')
    if (item.korean === '예뻐요') {
      // Your saved anchor, with the meaning blanked out; then the card's clue.
      await hint.click()
      await expect(page.getByTestId('test-hints')).toContainText('Your anchor')
      await expect(page.getByTestId('test-hints')).toContainText('Audrey HEPBURN')
      await expect(page.getByTestId('test-hints')).toContainText('___')
      await expect(page.getByRole('button', { name: 'Another hint' })).toHaveAccessibleDescription('no extra cost')
      await page.getByRole('button', { name: 'Another hint' }).click()
      await expect(page.getByTestId('test-hints').locator('.test-hint')).toHaveCount(2)
      await expect(page.getByRole('button', { name: /hint$/i })).toHaveCount(0)
      await expect(page.getByTestId('test-hints')).not.toContainText(/pretty/i)
      // Hints survive a reload, and still count.
      await page.reload()
      await expect(page.getByTestId('test-hints').locator('.test-hint')).toHaveCount(2)
      await answer(page, 'pretty')
      await expect(result(page)).toHaveAttribute('data-outcome', 'hinted')
      await expect(result(page)).toContainText('Correct with a hint')
      await expect(page.getByTestId('test-points')).toHaveText('+0.5 points')
    } else {
      // Answered without asking: the full point, and no hints shown afterwards.
      await answer(page, 'busy')
      await expect(page.getByTestId('test-points')).toHaveText('+1 point')
      await expect(page.getByTestId('test-hints')).toHaveCount(0)
    }
    await proceed(page)
  }
  await expect(page.getByTestId('test-score')).toHaveText('1.5 / 2 points75%')
  await expect(page.getByTestId('test-breakdown')).toHaveText(['1 correct', '1 with a hint', '0 incorrect'].join(''))
  await expect(row(page, '예뻐요')).toContainText('2 hints')
})

test('A held or doubled Enter never answers the next question for you', async ({ page }) => {
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['배워요', '사과', '오빠'], only: 'korean-to-english' })
  // Held on Start: the repeats land in the first question's field and must do nothing.
  await page.getByRole('button', { name: 'Start test' }).focus()
  await page.keyboard.down('Enter')
  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')
  await expect(count(page)).toHaveText('Question 1 of 3')
  await expect(page.getByTestId('test-review')).toHaveCount(0)
  await reveal(page)
  // Next ignores a tap that comes right after the answer appears.
  await page.locator('#test-next').click()
  await expect(count(page)).toHaveText('Question 1 of 3')
  // Held on Next: one step forward, and the new question stays unanswered.
  await settle(page)
  await page.locator('#test-next').focus()
  await page.keyboard.down('Enter')
  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')
  await expect(count(page)).toHaveText('Question 2 of 3')
  await expect(page.getByTestId('test-review')).toHaveCount(0)
  await expect(answerField(page)).toBeFocused()
})

test('A doubled or held Enter never answers the learner’s question for them', async ({ page }) => {
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['배', '사과'], only: 'korean-to-english' })
  await page.getByRole('button', { name: 'Start test' }).click()
  // Close but not the answer, so the learner is asked: bear for pear, ample for apple.
  const doubtful = async () => (await currentItem(page, words('배', '사과'))).korean === '배' ? 'bear' : 'ample'
  await answerField(page).fill(await doubtful())
  await settle(page)
  // Held: the key repeats onto “Yes, count it” the moment it appears, and must do nothing.
  await answerField(page).focus()
  await page.keyboard.down('Enter')
  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')
  await expect(question(page)).toHaveAttribute('data-phase', 'confirming')
  await expect(page.getByRole('button', { name: 'Yes, count it' })).toBeFocused()
  await settle(page)
  await page.getByRole('button', { name: 'No', exact: true }).click()
  await expect(result(page)).toHaveAttribute('data-outcome', 'incorrect')
  await proceed(page)
  // Pressed twice: the second press arrives with the question, and must do nothing either.
  await answerField(page).fill(await doubtful())
  await settle(page)
  await answerField(page).press('Enter')
  await page.keyboard.press('Enter')
  await expect(question(page)).toHaveAttribute('data-phase', 'confirming')
  await expect(page.getByTestId('running-score')).toHaveText('0/1 pts')
})

test('A reading cut short by End test and a reload still grades the answer', async ({ page }) => {
  let release = () => {}
  const held = new Promise<void>(resolve => { release = resolve })
  await page.route('https://inputtools.google.com/**', async route => {
    await held
    await route.fulfill({ json: ['SUCCESS', [['mock', ['사과'], [], {}]]], headers: { 'Access-Control-Allow-Origin': '*' } }).catch(() => {})
  })
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['사과', '배'], only: 'english-to-korean' })
  await page.getByRole('button', { name: 'Start test' }).click()
  const first = await currentItem(page, words('사과', '배'))
  await draw(page)
  await reveal(page)
  await expect(page.getByTestId('test-status')).toBeVisible()
  await page.getByRole('button', { name: 'End test' }).click()
  await expect(page.getByTestId('test-breakdown')).toContainText('1 not graded')
  await page.reload()
  release()
  await expect(row(page, first.korean)).toContainText(first.korean === '사과' ? 'Correct · +1 point' : 'Incorrect · 0 points')
  await expect(page.getByTestId('test-breakdown')).not.toContainText('not graded')
})

test('English → Korean: the handwriting is read, graded, and the word appears right under it', async ({ page }) => {
  const requests = await recognizer(page, ['형', '혐'])
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['형'], only: 'english-to-korean' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await expect(page.getByTestId('test-meaning')).toHaveText('older brother')
  await expect(question(page)).toContainText('Used by: male speaker')
  // Nothing on the card gives the Korean away before checking.
  await expect(question(page)).not.toContainText(/[가-힣]/)
  for (const name of ['Pen', 'Eraser', 'Undo', 'Clear all']) await expect(page.getByRole('button', { name, exact: true })).toBeVisible()
  await draw(page)
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  await reveal(page)
  await expect(result(page)).toHaveAttribute('data-outcome', 'correct')
  await expect(page.getByTestId('test-reading')).toHaveText('Read as 형')
  // Only the strokes are sent, in the engine's format, on the pad's own proportions.
  expect(requests).toHaveLength(1)
  expect(requests[0].language).toBe('ko')
  expect(requests[0].ink).toHaveLength(1)
  expect(requests[0].ink[0]).toHaveLength(3)
  const box = (await pad(page).locator('canvas').boundingBox())!
  expect(requests[0].writing_guide.writing_area_width / requests[0].writing_guide.writing_area_height).toBeCloseTo(box.width / box.height, 1)
  const answer = page.getByTestId('korean-word')
  await expect(answer).toHaveText('형')
  // The handwriting stays, locked and still painted, directly above the answer.
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  expect(await inkPixels(page)).toBeGreaterThan(50)
  await expect(page.getByRole('button', { name: 'Pen', exact: true })).toHaveCount(0)
  expect(await pad(page).locator('canvas').evaluate(canvas => getComputedStyle(canvas).touchAction)).toBe('pan-y')
  const surface = (await pad(page).locator('.writing-surface').boundingBox())!
  const word = (await answer.boundingBox())!
  expect(word.y).toBeGreaterThan(surface.y + surface.height)
  expect(word.y - (surface.y + surface.height)).toBeLessThan(90)
  // 오빠 also means older brother, but for a female speaker, so it isn't offered here.
  await expect(page.getByTestId('test-alternatives')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Hear it' })).toBeVisible()
})

test('When the reading is in doubt, the learner says what they wrote before anything is graded', async ({ page }) => {
  await recognizer(page, ['사고', '사과', '서고'])
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['사과', '배'], only: 'english-to-korean' })
  await page.getByRole('button', { name: 'Start test' }).click()
  for (let index = 0; index < 2; index++) {
    const item = await currentItem(page, words('사과', '배'))
    await draw(page)
    await reveal(page)
    if (item.korean === '배') {
      // Nothing like the answer: graded at once, and the learner can still fix a misreading.
      await expect(result(page)).toHaveAttribute('data-outcome', 'incorrect')
      await page.getByRole('button', { name: 'Tell us what you wrote' }).click()
      await page.getByRole('group', { name: 'What did you write?' }).getByRole('button', { name: '배', exact: true }).click()
      await expect(result(page)).toHaveAttribute('data-outcome', 'correct')
      await expect(page.getByTestId('test-reading')).toHaveText('You wrote 배')
    } else {
      // The answer is only the runner-up: no grade, no answer shown, until the learner says which they wrote.
      await expect(question(page)).toHaveAttribute('data-phase', 'confirming')
      await expect(page.getByTestId('test-solution')).toHaveCount(0)
      const options = page.getByRole('group', { name: 'Not sure what this says. Which did you write?' }).getByRole('button')
      await expect(options).toHaveText(['사고', '사과', '서고'])
      await expect(options.first()).toBeFocused()
      await settle(page)
      await options.first().click()
      await expect(result(page)).toHaveAttribute('data-outcome', 'incorrect')
      await expect(page.getByTestId('test-reading')).toHaveText('You wrote 사고')
      await expect(page.getByTestId('korean-word')).toHaveText('사과')
      // Changing your mind is possible until you move on.
      await page.getByRole('button', { name: 'Undo your call' }).click()
      await settle(page)
      await options.nth(1).click()
      await expect(result(page)).toHaveAttribute('data-outcome', 'correct')
    }
    await proceed(page)
  }
  await expect(page.getByTestId('test-score')).toHaveText('2 / 2 points100%')
  await expect(row(page, '사과')).toContainText('You wrote 사과')
  await expect(row(page, '사과').getByRole('img', { name: 'Your handwriting for apple' })).toBeVisible()
})

test('If the handwriting can’t be read, nothing is lost: try again, or compare with the answer yourself', async ({ page }) => {
  await recognizer(page, 'offline')
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['사과', '배'], only: 'english-to-korean' })
  await page.getByRole('button', { name: 'Start test' }).click()
  const first = await currentItem(page, words('사과', '배'))
  await draw(page)
  await reveal(page)
  await expect(page.getByTestId('test-confirm')).toContainText('couldn’t be read')
  await expect(page.getByTestId('running-score')).toHaveText('0/0 pts')
  // Back online: reading again grades it.
  await page.unroute('https://inputtools.google.com/**')
  await recognizer(page, [first.korean])
  await settle(page)
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(result(page)).toHaveAttribute('data-outcome', 'correct')
  await proceed(page)
  // Offline again: the learner compares their writing with the answer and decides.
  await page.unroute('https://inputtools.google.com/**')
  await recognizer(page, 'offline')
  await draw(page)
  await reveal(page)
  await expect(page.getByTestId('test-confirm')).toBeVisible()
  await settle(page)
  await page.getByRole('button', { name: 'Compare with the answer' }).click()
  await expect(page.getByTestId('korean-word')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Yes, I wrote this' })).toBeFocused()
  await settle(page)
  await page.getByRole('button', { name: 'Yes, I wrote this' }).click()
  await expect(result(page)).toHaveAttribute('data-outcome', 'correct')
  await expect(result(page)).toContainText('Your call')
  await proceed(page)
  await expect(page.getByTestId('test-score')).toHaveText('2 / 2 points100%')
})

test('The dictionary form counts too, and a blank pad says so', async ({ page }) => {
  const requests = await recognizer(page, ['배우다'])
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['배워요'], only: 'english-to-korean' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await reveal(page)
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
  await expect(page.getByTestId('test-alternatives')).toContainText('배우다 (dictionary form)')
  await expect(page.getByRole('img', { name: 'Writing pad: nothing written' })).toBeVisible()
  await expect(result(page)).toHaveAttribute('data-outcome', 'incorrect')
  await expect(result(page)).toContainText('Nothing written')
  // A blank pad is never sent anywhere.
  expect(requests).toHaveLength(0)
})

test('Erasing, undoing, and clearing on the test pad all update the saved answer', async ({ page }) => {
  const requests = await recognizer(page, ['바나나'])
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['사과', '형'], only: 'english-to-korean' })
  await page.getByRole('button', { name: 'Start test' }).click()
  const first = await currentItem(page, words('사과', '형'))
  await draw(page, [.1, .3], [.4, .3])
  await draw(page, [.1, .7], [.4, .7])
  await page.getByRole('button', { name: 'Eraser', exact: true }).click()
  const box = (await pad(page).locator('canvas').boundingBox())!
  await page.mouse.click(box.x + box.width * .25, box.y + box.height * .3)
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  await page.reload()
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  expect(await inkPixels(page)).toBeGreaterThan(50)
  await page.getByRole('button', { name: 'Clear all' }).click()
  await expect(question(page).getByRole('button', { name: 'Show answer' })).toBeVisible()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  await reveal(page)
  // The one remaining stroke is what was read.
  await expect(result(page)).toHaveAttribute('data-outcome', 'incorrect')
  expect(requests.at(-1)!.ink).toHaveLength(1)
  await proceed(page)
  // Moving on keeps a light copy of the writing; after a reload the result still shows it.
  await page.reload()
  await reveal(page)
  await proceed(page)
  await expect(row(page, first.korean)).toContainText('Read as 바나나')
  await expect(row(page, first.korean).getByRole('img', { name: `Your handwriting for ${first.meaning}` })).toBeVisible()
})

test('Results: score, percentage, breakdown, review; forgotten words go to Difficult, and End test keeps the answers so far', async ({ page }) => {
  await openTest(page, { only: 'korean-to-english' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await reveal(page)
  const forgotten = await currentItem(page, inCategory('Verbs'))
  await proceed(page)
  const remembered = await currentItem(page, inCategory('Verbs'))
  await answer(page, remembered.meaning)
  await expect(result(page)).toHaveAttribute('data-outcome', 'correct')
  await page.getByRole('button', { name: 'End test' }).click()
  await expect(page.getByRole('heading', { name: 'Test ended' })).toBeFocused()
  await expect(page.getByTestId('test-score')).toHaveText('1 / 2 points50%')
  await expect(page.getByText('You answered 2 of 10 questions.')).toBeVisible()
  await expect(row(page, remembered.korean)).toContainText(`You wrote “${remembered.meaning}”`)
  await expect(row(page, remembered.korean)).toContainText('Correct · +1 point')
  await expect(row(page, forgotten.korean)).toContainText('Incorrect · 0 points')
  // Only the two answered words count as tested.
  expect((await saved(page)).history).toEqual([[forgotten.id, remembered.id]])
  // Graded answers reschedule their words: the forgotten one tomorrow, the remembered one later. Nothing is due today yet.
  const review = main(page).getByRole('button', { name: /^Review/ })
  await expect(review).toHaveAccessibleName('Review')
  await page.getByRole('button', { name: 'Add 1 incorrect word to Difficult' }).click()
  await expect(page.getByRole('heading', { name: 'Test ended' })).toBeFocused()
  // Difficult words come back in today's review.
  await expect(review).toHaveAccessibleName('Review 1 due')
  await expect(page.getByRole('button', { name: /incorrect word/ })).toHaveCount(0)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sori.progress.v1')!))).toEqual({ [forgotten.id]: 'difficult' })
  const star = page.getByRole('button', { name: `Mark ${remembered.korean} as difficult` })
  await expect(star).toHaveAttribute('aria-pressed', 'false')
  await star.click()
  await expect(star).toHaveAttribute('aria-pressed', 'true')
  await expect(review).toHaveAccessibleName('Review 2 due')
  await page.getByRole('button', { name: 'Change settings' }).click()
  await expect(page.getByRole('heading', { name: 'How much do you remember?' })).toBeFocused()
})

test('Retake: the same words in a new order, with score, hints, and answers reset', async ({ page }) => {
  await openTest(page, { category: 'Colors', only: 'korean-to-english' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await page.getByRole('button', { name: 'Hint' }).click()
  for (let index = 0; index < 10; index++) { await reveal(page); await proceed(page) }
  await expect(page.getByTestId('test-score')).toHaveText('0 / 10 points0%')
  const before = (await saved(page)).test.questions as TestQuestion[]
  await page.getByRole('button', { name: 'Retake test' }).click()
  await expect(count(page)).toHaveText('Question 1 of 10')
  await expect(answerField(page)).toBeFocused()
  await expect(page.getByTestId('running-score')).toHaveText('0/0 pts')
  await expect(page.getByTestId('test-hints').locator('.test-hint')).toHaveCount(0)
  const after = (await saved(page)).test
  expect(after.answers).toEqual({})
  expect(after.hints).toBe(0)
  expect(after.questions.map((entry: TestQuestion) => entry.itemId).sort()).toEqual(before.map(entry => entry.itemId).sort())
  expect(after.questions.map((entry: TestQuestion) => entry.itemId)).not.toEqual(before.map(entry => entry.itemId))
})

test('Ending before any answer cancels the test without counting its words as tested', async ({ page }) => {
  await openTest(page, { only: 'korean-to-english' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await page.getByRole('button', { name: 'End test' }).click()
  await expect(page.getByRole('heading', { name: 'How much do you remember?' })).toBeFocused()
  expect((await saved(page)).history).toEqual([])
})

test('From the Difficult pile, words recalled without help can be marked Known, and the study deck keeps its card', async ({ page }) => {
  const colors = ['빨간색', '주황색', '노란색', '초록색', '파란색']
  await openTest(page, { category: 'Colors', filter: 'difficult', difficult: colors, mode: 'standard', only: 'korean-to-english', order: colors.map(word => byWord(word).id), index: 3 })
  await expect(page.getByTestId('korean-word')).toHaveText('초록색')
  await go(page, 'Review')
  await page.getByRole('button', { name: 'Start test' }).click()
  for (let index = 1; index <= 5; index++) {
    const item = await currentItem(page, words(...colors))
    // One of them with a hint: right, but not yet known.
    if (index === 1) await page.getByRole('button', { name: 'Hint' }).click()
    await answer(page, item.meaning)
    await proceed(page)
  }
  await expect(page.getByTestId('test-score')).toHaveText('4.5 / 5 points90%')
  await expect(page.getByRole('button', { name: /to Difficult/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Mark 4 correct without hints as Known' })).toBeVisible()
  // Take the first two off the pile: the study deck stays on 초록색.
  for (const word of colors.slice(0, 2)) await page.getByRole('button', { name: `Mark ${word} as difficult` }).click()
  await go(page, 'Library')
  await expect(page.getByTestId('korean-word')).toHaveText('초록색')
  await expect(page.getByTestId('deck-count')).toHaveText('2 / 3')
  await go(page, 'Review')
  await page.getByRole('button', { name: /^Mark \d correct without hints as Known$/ }).click()
  const left = await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('sori.progress.v1')!)).filter(status => status === 'difficult').length)
  await go(page, 'Library')
  await expect(page.getByTestId('deck-count')).toHaveText(`${left ? 1 : 0} / ${left}`)
})

test('New test prefers words the last test didn’t ask, and settings are remembered', async ({ page }) => {
  await openTest(page, { only: 'korean-to-english' })
  await page.getByRole('button', { name: 'All 36' }).click()
  await page.getByRole('button', { name: '10', exact: true }).click()
  await expect(page.getByRole('group', { name: 'Question types' }).getByRole('button', { name: /English → Korean/ })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('group', { name: 'Question types' }).getByRole('button', { name: /Korean → English/ })).toBeDisabled()
  await expect(page.getByText(/Handwriting is read by/)).toHaveCount(0)
  await page.getByRole('button', { name: '20', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: '20', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: '10', exact: true }).click()
  await page.getByRole('button', { name: 'Start test' }).click()
  for (let index = 1; index <= 10; index++) { await reveal(page); await proceed(page) }
  await page.getByRole('button', { name: 'New test' }).click()
  await expect(count(page)).toHaveText('Question 1 of 10')
  const [earlier, latest] = (await saved(page)).history
  expect(latest.filter((id: string) => earlier.includes(id))).toEqual([])
})

test('A test survives leaving Review and reloading, unchecked drafts included', async ({ page }) => {
  await openTest(page, { only: 'korean-to-english' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await answerField(page).fill('to g')
  await go(page, 'Library')
  await expect(page.getByTestId('deck-count')).toHaveText('1 / 36')
  await go(page, 'Review')
  await expect(count(page)).toHaveText('Question 1 of 10')
  await expect(answerField(page)).toHaveValue('to g')
  await page.reload()
  await expect(answerField(page)).toHaveValue('to g')
  await settle(page)
  await answerField(page).press('Enter')
  await expect(page.getByTestId('your-answer')).toHaveText('to g')
  await page.reload()
  await expect(page.getByTestId('your-answer')).toHaveText('to g')
  await expect(count(page)).toHaveText('Question 1 of 10')
})

test('Handwriting in progress survives a reload, painted, and a reading cut short starts again', async ({ page }) => {
  let release = () => {}
  const held = new Promise<void>(resolve => { release = resolve })
  await page.route('https://inputtools.google.com/**', async route => {
    await held
    await route.fulfill({ json: ['SUCCESS', [['mock', ['사과'], [], {}]]], headers: { 'Access-Control-Allow-Origin': '*' } }).catch(() => {})
  })
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['사과'], only: 'english-to-korean' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await draw(page)
  await page.reload()
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  expect(await inkPixels(page)).toBeGreaterThan(50)
  await reveal(page)
  await expect(page.getByTestId('test-status')).toHaveText('Reading your handwriting…')
  await expect(page.getByTestId('test-status')).toBeFocused()
  // Mode switches and reloads during the reading don't lose the answer.
  await page.reload()
  await expect(page.getByTestId('test-status')).toBeVisible()
  await expect(page.getByRole('button', { name: 'End test' })).toBeVisible()
  release()
  await expect(result(page)).toHaveAttribute('data-outcome', 'correct')
  await expect(page.locator('#test-next')).toBeFocused()
  await page.reload()
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  expect(await inkPixels(page)).toBeGreaterThan(50)
  await expect(page.getByTestId('korean-word')).toHaveText('사과')
  await expect(result(page)).toHaveAttribute('data-outcome', 'correct')
})

test('Damaged saved tests are rejected or repaired, never half-restored', async ({ page }) => {
  await openTest(page, { only: 'korean-to-english' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await answer(page, 'first')
  await proceed(page)
  const valid = await saved(page)
  const restore = async (change: (test: Record<string, any>) => void) => {
    const copy = structuredClone(valid)
    change(copy.test)
    await page.evaluate(value => sessionStorage.setItem('sori.test.v1', value), JSON.stringify(copy))
    await page.reload()
  }
  const rejected: Array<[string, (test: Record<string, any>) => void]> = [
    ['an unknown card', test => { test.questions[1].itemId = 'Verbs:gone' }],
    ['an unknown question type', test => { test.questions[1].type = 'nonexistent' }],
    ['a repeated question id', test => { test.questions[1].id = 'q1' }],
    ['a position past the end', test => { test.current = 99 }],
    ['a negative position', test => { test.current = -5 }],
    ['an answer after the current question', test => { test.answers.q3 = test.answers.q1 }],
    ['a missing answer before it', test => { delete test.answers.q1 }],
    ['a malformed typed answer', test => { test.answers.q1.answer.text = 5 }],
    ['an earlier answer without a grade', test => { test.answers.q1.auto = { result: 'maybe', by: 'magic' } }],
  ]
  for (const [label, change] of rejected) {
    await restore(change)
    await expect(page.getByRole('button', { name: 'Start test' }), label).toBeVisible()
  }
  // Damage limited to the draft, the pool label, hint counts, or an evaluation is repaired rather than costing the test.
  await restore(test => { test.draft = { kind: 'ink', strokes: [[{ x: 9, y: 'a', t: 0 }]] }; test.pool = { category: 42 }; test.hints = -3 })
  await expect(count(page)).toHaveText('Question 2 of 10')
  await expect(page.getByText('Difficult ·')).toHaveCount(0)
  await expect(page.locator('.test-pool')).toContainText('All words')
  await restore(test => { test.answers.q1.hints = 'lots' })
  await expect(count(page)).toHaveText('Question 2 of 10')
  await expect(page.getByTestId('running-score')).toHaveText('0/1 pts')
  await page.evaluate(() => sessionStorage.setItem('sori.test.v1', '{broken'))
  await page.reload()
  await expect(page.getByRole('button', { name: 'Start test' })).toBeVisible()
})

test('A full test never repeats a word or a prompt', async ({ page }) => {
  await recognizer(page, ['ㅡ'])
  await openTest(page, { category: 'Seasons' })
  await expect(page.getByRole('group', { name: 'Questions' }).getByRole('button')).toHaveText(['All 5'])
  await page.getByRole('button', { name: 'Start test' }).click()
  const seen: string[] = []
  for (let index = 1; index <= 5; index++) {
    await expect(count(page)).toHaveText(`Question ${index} of 5`)
    seen.push((await currentItem(page, inCategory('Seasons'))).id)
    await reveal(page)
    await proceed(page)
  }
  expect(new Set(seen).size).toBe(5)
  await expect(page.getByTestId('test-row')).toHaveCount(5)
  await expect(page.getByTestId('test-score')).toHaveText('0 / 5 points0%')
})

for (const only of ['korean-to-english', 'english-to-korean'] as const) {
  test(`Test screens fit phones with usable touch targets, long prompts included (${only})`, async ({ page }, testInfo) => {
    const phone = testInfo.project.name === 'iphone-se'
    await recognizer(page, ['아'])
    // Safari on an iPhone SE shows about 553px of a 667px screen.
    if (phone) await page.setViewportSize({ width: 375, height: 553 })
    await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['회사원', '무슨 음식을 제일 좋아해요?'], only })
    const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    const tall = async (name: string | RegExp) => expect((await page.getByRole('button', { name, exact: true }).boundingBox())!.height, String(name)).toBeGreaterThanOrEqual(44)
    expect(await fits()).toBe(true)
    await tall('Start test')
    if (phone) await expect(page.getByRole('button', { name: 'Start test' })).toBeInViewport({ ratio: 1 })
    await page.getByRole('button', { name: 'Start test' }).click()
    for (let index = 0; index < 2; index++) {
      expect(await fits()).toBe(true)
      await tall('Show answer')
      await tall('End test')
      expect((await page.getByRole('button', { name: 'Hint' }).boundingBox())!.height).toBeGreaterThanOrEqual(40)
      if (phone) for (const name of ['Show answer', 'Hint']) await expect(question(page).getByRole('button', { name })).toBeInViewport({ ratio: 1 })
      await reveal(page)
      expect(await fits()).toBe(true)
      await tall('Hear it')
      // After checking, the result and Next come into view on their own.
      await expect(result(page)).toBeInViewport()
      await expect(page.locator('#test-next')).toBeInViewport({ ratio: 1 })
      await proceed(page)
    }
    expect(await fits()).toBe(true)
    await tall('Retake test')
    await tall('New test')
    await page.screenshot({ path: `test-results/${testInfo.project.name}-${only}-results.png`, fullPage: true, animations: 'disabled' })
  })
}
