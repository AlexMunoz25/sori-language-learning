import { expect, test, type Page } from '@playwright/test'
import { vocabulary, vocabularyById } from '../src/data/vocabulary'
import { koreanKey, lookAlikeGroups, meaningKey } from '../src/recall/answers'
import { buildTest, capacity, recencyOf } from '../src/recall/generate'
import { questionRuleById, questionRules } from '../src/recall/questionRules'
import type { TestQuestion } from '../src/recall/types'

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

test.describe('Generation and answer keys', () => {
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
        const counts = questionRules.map(candidate => questions.filter(question => question.type === candidate.id).length)
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
})

type Seed = { category?: string; filter?: 'all' | 'difficult'; difficult?: string[]; only?: 'korean-to-english' | 'english-to-korean'; mode?: string; order?: string[]; index?: number }
async function openTest(page: Page, options: Seed = {}) {
  const { category = 'Verbs', filter = 'all', difficult = [], only, mode = 'test', index = 0 } = options
  const order = options.order ?? (category === 'Verbs' ? ['Verbs:배워요'] : [])
  await page.addInitScript(({ category, filter, progress, disabledTypes, mode, order, index }) => {
    if (sessionStorage.getItem('test.seeded')) return
    sessionStorage.setItem('test.seeded', 'true')
    localStorage.setItem('sori.progress.v1', JSON.stringify(progress))
    if (disabledTypes.length) localStorage.setItem('sori.testPreferences.v1', JSON.stringify({ length: 10, disabledTypes }))
    sessionStorage.setItem('sori.session.v1', JSON.stringify({ category, mode, filter, order, index }))
  }, {
    category, filter, mode, order, index,
    progress: Object.fromEntries(difficult.map(word => [byWord(word).id, 'difficult'])),
    disabledTypes: only ? questionRules.filter(candidate => candidate.id !== only).map(candidate => candidate.id) : [],
  })
  await page.goto('/')
}

const question = (page: Page) => page.getByTestId('test-question')
const pad = (page: Page) => page.getByTestId('writing-pad')
const count = (page: Page) => page.getByTestId('test-count')
const answerField = (page: Page) => page.getByRole('textbox', { name: 'Meaning in English' })
const row = (page: Page, korean: string) => page.getByTestId('test-row').filter({ has: page.getByText(korean, { exact: true }) })
const saved = (page: Page) => page.evaluate(() => JSON.parse(sessionStorage.getItem('sori.test.v1') ?? 'null'))
/** Answers and Next are ignored for 300ms after a question or answer appears, so a double tap can't skip either. */
const settle = (page: Page) => page.waitForTimeout(350)

/** Which card of the test's pool the current question is about, read from what is on screen. */
async function currentItem(page: Page, pool: typeof vocabulary) {
  if (await question(page).getAttribute('data-type') === 'korean-to-english') {
    const korean = await question(page).getByTestId('korean-word').textContent()
    return pool.find(item => item.korean === korean)!
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
async function proceed(page: Page) {
  await settle(page)
  await page.locator('#test-next').click()
}

test('Test sits beside Standard and Listening, draws from the chosen words, and leaves the deck alone', async ({ page }) => {
  await openTest(page, { mode: 'standard' })
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
  await page.getByRole('button', { name: 'Test', exact: true }).click()
  await expect(page.getByTestId('test-pool')).toHaveText('Verbs · 36 words')
  const lengths = page.getByRole('group', { name: 'Questions' }).getByRole('button')
  await expect(lengths).toHaveText(['10', '20', 'All 36'])
  await expect(lengths.first()).toHaveAttribute('aria-pressed', 'true')
  const types = page.getByRole('group', { name: 'Question types' }).getByRole('button')
  await expect(types).toHaveCount(2)
  for (const type of await types.all()) await expect(type).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Start test' }).click()
  await expect(count(page)).toHaveText('Question 1 of 10')
  // Nothing that changes the words or the deck is available mid-test.
  await expect(page.getByRole('navigation', { name: 'Word collection' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Choose category' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Next word' })).toHaveCount(0)
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  for (const key of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'ArrowRight']) await page.keyboard.press(key)
  await expect(count(page)).toHaveText('Question 1 of 10')
  await page.getByRole('button', { name: 'Standard', exact: true }).click()
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
  await expect(page.getByTestId('deck-count')).toHaveText('1 / 36')
})

test('Korean → English: Enter checks once, both answers stay visible, and Enter continues', async ({ page }) => {
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['배워요', '사과', '오빠'], only: 'korean-to-english' })
  await expect(page.getByRole('group', { name: 'Questions' }).getByRole('button')).toHaveText(['All 3'])
  await page.getByRole('button', { name: 'Start test' }).click()
  const first = await currentItem(page, words('배워요', '사과', '오빠'))
  await expect(question(page)).not.toContainText(first.meaning)
  await expect(answerField(page)).toBeFocused()
  await expect(question(page).getByRole('button', { name: 'Show answer' })).toBeVisible()
  await answerField(page).fill('something close')
  await expect(question(page).getByRole('button', { name: 'Check answer' })).toBeVisible()
  await settle(page)
  await answerField(page).press('Enter')
  await expect(page.getByTestId('your-answer')).toHaveText('something close')
  await expect(page.getByTestId('test-solution')).toHaveText(first.meaning)
  await expect(count(page)).toHaveText('Question 1 of 3')
  await expect(page.getByRole('button', { name: 'Next question' })).toBeFocused()
  await settle(page)
  await page.keyboard.press('Enter')
  await expect(count(page)).toHaveText('Question 2 of 3')
  await expect(answerField(page)).toBeFocused()

  // A blank answer is shown as such and counts as forgotten until you say otherwise.
  await reveal(page)
  await expect(page.getByTestId('your-answer')).toHaveText('Left blank')
  await expect(page.getByRole('button', { name: 'Forgot' })).toHaveAttribute('aria-pressed', 'true')
  await proceed(page)
  await answerField(page).fill('a guess')
  await settle(page)
  await answerField(page).press('Enter')
  await page.getByRole('button', { name: 'Remembered' }).click()
  await expect(page.getByRole('button', { name: 'Remembered' })).toHaveAttribute('aria-pressed', 'true')
  await proceed(page)
  await expect(page.getByRole('heading', { name: 'Test complete' })).toBeFocused()
  await expect(page.getByTestId('test-score')).toHaveText('1 of 3 remembered · 1 not checked')
  await expect(page.getByTestId('test-row')).toHaveCount(3)
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

test('English → Korean: the word appears under your writing, and look-alikes are listed fairly', async ({ page }) => {
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

test('The dictionary form counts too, and a blank pad says so', async ({ page }) => {
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['배워요'], only: 'english-to-korean' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await reveal(page)
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
  await expect(page.getByTestId('test-alternatives')).toContainText('배우다 (dictionary form)')
  await expect(page.getByRole('img', { name: 'Writing pad: nothing written' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Forgot' })).toHaveAttribute('aria-pressed', 'true')
})

test('Erasing, undoing, and clearing on the test pad all update the saved answer', async ({ page }) => {
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
  await expect(page.getByRole('button', { name: 'Forgot' })).toHaveAttribute('aria-pressed', 'false')
  await proceed(page)
  // Moving on keeps only whether you wrote something; after a reload the result still says so.
  await page.reload()
  await reveal(page)
  await proceed(page)
  await expect(row(page, first.korean)).not.toContainText('Left blank')
  await expect(row(page, first.korean)).toContainText('Not checked')
})

test('Results send forgotten words to Difficult, and End test keeps the answers so far', async ({ page }) => {
  await openTest(page, { only: 'korean-to-english' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await reveal(page)
  const forgotten = await currentItem(page, inCategory('Verbs'))
  await proceed(page)
  await answerField(page).fill('my answer')
  await settle(page)
  await answerField(page).press('Enter')
  const remembered = await currentItem(page, inCategory('Verbs'))
  await page.getByRole('button', { name: 'Remembered' }).click()
  await page.getByRole('button', { name: 'End test' }).click()
  await expect(page.getByRole('heading', { name: 'Test ended' })).toBeFocused()
  await expect(page.getByTestId('test-score')).toHaveText('1 of 2 remembered')
  await expect(page.getByText('You answered 2 of 10 questions.')).toBeVisible()
  await expect(row(page, remembered.korean)).toContainText('You wrote “my answer”')
  // Only the two answered words count as tested.
  expect((await saved(page)).history).toEqual([[forgotten.id, remembered.id]])
  const collections = page.getByRole('navigation', { name: 'Word collection' })
  await expect(collections.getByRole('button', { name: 'Difficult 0' })).toBeVisible()
  await page.getByRole('button', { name: 'Add 1 forgotten word to Difficult' }).click()
  await expect(page.getByRole('heading', { name: 'Test ended' })).toBeFocused()
  await expect(collections.getByRole('button', { name: 'Difficult 1' })).toBeVisible()
  await expect(page.getByRole('button', { name: /forgotten word/ })).toHaveCount(0)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sori.progress.v1')!))).toEqual({ [forgotten.id]: 'difficult' })
  const star = page.getByRole('button', { name: `Mark ${remembered.korean} as difficult` })
  await expect(star).toHaveAttribute('aria-pressed', 'false')
  await star.click()
  await expect(star).toHaveAttribute('aria-pressed', 'true')
  await expect(collections.getByRole('button', { name: 'Difficult 2' })).toBeVisible()
  await page.getByRole('button', { name: 'Change settings' }).click()
  await expect(page.getByRole('heading', { name: 'How much do you remember?' })).toBeFocused()
})

test('Ending before any answer cancels the test without counting its words as tested', async ({ page }) => {
  await openTest(page, { only: 'korean-to-english' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await page.getByRole('button', { name: 'End test' }).click()
  await expect(page.getByRole('heading', { name: 'How much do you remember?' })).toBeFocused()
  expect((await saved(page)).history).toEqual([])
})

test('From the Difficult pile, remembered words can be marked Known, and the study deck keeps its card', async ({ page }) => {
  const words = ['빨간색', '주황색', '노란색', '초록색', '파란색']
  await openTest(page, { category: 'Colors', filter: 'difficult', difficult: words, mode: 'standard', only: 'korean-to-english', order: words.map(word => byWord(word).id), index: 3 })
  await expect(page.getByTestId('korean-word')).toHaveText('초록색')
  await page.getByRole('button', { name: 'Test', exact: true }).click()
  await page.getByRole('button', { name: 'Start test' }).click()
  for (let index = 1; index <= 5; index++) {
    await reveal(page)
    await page.getByRole('button', { name: 'Remembered' }).click()
    await proceed(page)
  }
  await expect(page.getByTestId('test-score')).toHaveText('5 of 5 remembered')
  await expect(page.getByRole('button', { name: /to Difficult/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Mark 5 remembered as Known' })).toBeVisible()
  // Take the first two off the pile: the study deck stays on 초록색.
  for (const word of words.slice(0, 2)) await page.getByRole('button', { name: `Mark ${word} as difficult` }).click()
  await page.getByRole('button', { name: 'Standard', exact: true }).click()
  await expect(page.getByTestId('korean-word')).toHaveText('초록색')
  await expect(page.getByTestId('deck-count')).toHaveText('2 / 3')
  await page.getByRole('button', { name: 'Test', exact: true }).click()
  await page.getByRole('button', { name: 'Mark 3 remembered as Known' }).click()
  await expect(page.getByRole('navigation', { name: 'Word collection' }).getByRole('button', { name: 'Difficult 0' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'New test' })).toBeDisabled()
  await expect(page.getByText('No words in Difficult · Colors.', { exact: false })).toBeVisible()
})

test('New test prefers words the last test didn’t ask, and settings are remembered', async ({ page }) => {
  await openTest(page, { only: 'korean-to-english' })
  await page.getByRole('button', { name: 'All 36' }).click()
  await page.getByRole('button', { name: '10', exact: true }).click()
  await expect(page.getByRole('group', { name: 'Question types' }).getByRole('button', { name: /English → Korean/ })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('group', { name: 'Question types' }).getByRole('button', { name: /Korean → English/ })).toBeDisabled()
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

test('A test survives switching modes and reloading, unchecked drafts included', async ({ page }) => {
  await openTest(page, { only: 'korean-to-english' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await answerField(page).fill('to g')
  await page.getByRole('button', { name: 'Standard', exact: true }).click()
  await expect(page.getByTestId('deck-count')).toHaveText('1 / 36')
  await page.getByRole('button', { name: 'Test', exact: true }).click()
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

test('Handwriting in progress survives a reload, painted', async ({ page }) => {
  await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['사과'], only: 'english-to-korean' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await draw(page)
  await page.reload()
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  expect(await inkPixels(page)).toBeGreaterThan(50)
  await reveal(page)
  await page.reload()
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  expect(await inkPixels(page)).toBeGreaterThan(50)
  await expect(page.getByTestId('korean-word')).toHaveText('사과')
})

test('Damaged saved tests are rejected or repaired, never half-restored', async ({ page }) => {
  await openTest(page, { only: 'korean-to-english' })
  await page.getByRole('button', { name: 'Start test' }).click()
  await answerField(page).fill('first')
  await settle(page)
  await answerField(page).press('Enter')
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
  ]
  for (const [label, change] of rejected) {
    await restore(change)
    await expect(page.getByRole('button', { name: 'Start test' }), label).toBeVisible()
  }
  // Damage limited to the draft or the pool label is repaired rather than costing the test.
  await restore(test => { test.draft = { kind: 'ink', strokes: [[{ x: 9, y: 'a', t: 0 }]] }; test.pool = { category: 42 } })
  await expect(count(page)).toHaveText('Question 2 of 10')
  await expect(page.getByText('Difficult ·')).toHaveCount(0)
  await expect(page.locator('.test-pool')).toContainText('All words')
  await page.evaluate(() => sessionStorage.setItem('sori.test.v1', '{broken'))
  await page.reload()
  await expect(page.getByRole('button', { name: 'Start test' })).toBeVisible()
})

test('A full test never repeats a word or a prompt', async ({ page }) => {
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
  await expect(page.getByTestId('test-score')).toHaveText('0 of 5 remembered')
})

for (const only of ['korean-to-english', 'english-to-korean'] as const) {
  test(`Test screens fit phones with usable touch targets, long prompts included (${only})`, async ({ page }, testInfo) => {
    const phone = testInfo.project.name === 'iphone-se'
    // Safari on an iPhone SE shows about 553px of a 667px screen.
    if (phone) await page.setViewportSize({ width: 375, height: 553 })
    await openTest(page, { category: 'All words', filter: 'difficult', difficult: ['회사원', '무슨 음식을 제일 좋아해요?'], only })
    const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    const tall = async (name: string) => expect((await page.getByRole('button', { name, exact: true }).boundingBox())!.height, name).toBeGreaterThanOrEqual(44)
    expect(await fits()).toBe(true)
    await tall('Start test')
    if (phone) await expect(page.getByRole('button', { name: 'Start test' })).toBeInViewport({ ratio: 1 })
    await page.getByRole('button', { name: 'Start test' }).click()
    for (let index = 0; index < 2; index++) {
      expect(await fits()).toBe(true)
      await tall('Show answer')
      await tall('End test')
      if (phone) await expect(question(page).getByRole('button', { name: 'Show answer' })).toBeInViewport({ ratio: 1 })
      await reveal(page)
      expect(await fits()).toBe(true)
      for (const name of ['Remembered', 'Forgot', 'Hear it']) await tall(name)
      // After checking, the self-check and Next come into view on their own.
      for (const name of ['Remembered', 'Forgot']) await expect(page.getByRole('button', { name })).toBeInViewport({ ratio: 1 })
      await expect(page.locator('#test-next')).toBeInViewport({ ratio: 1 })
      await proceed(page)
    }
    expect(await fits()).toBe(true)
    await tall('New test')
    await page.screenshot({ path: `test-results/${testInfo.project.name}-${only}-results.png`, fullPage: true, animations: 'disabled' })
  })
}
