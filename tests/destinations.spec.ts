import { expect, test, type Page } from '@playwright/test'
import { cardById } from '../src/data/cards'
import { units } from '../src/data/units'
import { formQuestion, gapAnswer, sentencesOf, type FormQuestion, type GapQuestion } from '../src/recall/questionRules'
import type { RecallEntry, ReviewState } from '../src/recall/review'

const settle = (page: Page) => page.waitForTimeout(350)
const card = (id: string) => cardById.get(id)!
const main = (page: Page) => page.getByRole('navigation', { name: 'Main' })
/** Today in the browser's local time: reviews are due by calendar day. */
const localDay = (page: Page, offset = 0) => page.evaluate(days => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}, offset)

interface Seed {
  /** Saved study session; none means a new learner who has seen the welcome guide. */
  session?: Record<string, unknown>
  review?: Record<string, ReviewState>
  recall?: RecallEntry[]
  anchors?: Record<string, unknown>
  disabledTypes?: string[]
}
/** Opens the app with saved progress, and speech recorded instead of spoken. */
async function open(page: Page, { session, review, recall, anchors, disabledTypes }: Seed = {}) {
  await page.addInitScript(({ session, review, recall, anchors, disabledTypes }) => {
    localStorage.setItem('sori.guideSeen.v1', 'true')
    if (!sessionStorage.getItem('test.seeded')) {
      sessionStorage.setItem('test.seeded', 'true')
      if (session) sessionStorage.setItem('sori.session.v1', JSON.stringify(session))
      if (review) localStorage.setItem('sori.review.v1', JSON.stringify({ version: 1, cards: review }))
      if (recall) localStorage.setItem('sori.recall.v1', JSON.stringify({ version: 1, entries: recall }))
      if (anchors) localStorage.setItem('sori.anchors.v1', JSON.stringify(anchors))
      if (disabledTypes) localStorage.setItem('sori.testPreferences.v1', JSON.stringify({ length: 10, disabledTypes }))
    }
    const calls: string[] = []
    Object.defineProperty(window, '__spoken', { value: calls })
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => [{ lang: 'ko-KR', name: 'Korean test voice', localService: true }],
      addEventListener: () => {}, removeEventListener: () => {}, cancel: () => {},
      speak: (utterance: SpeechSynthesisUtterance) => { calls.push(utterance.text); setTimeout(() => utterance.dispatchEvent(new Event('end')), 50) },
    } })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class extends EventTarget {
      text: string; lang = ''; rate = 1; pitch = 1; voice: unknown = null
      onend: (() => void) | null = null
      onerror: ((event: unknown) => void) | null = null
      constructor(text: string) { super(); this.text = text; this.addEventListener('end', () => this.onend?.()) }
    } })
  }, { session, review, recall, anchors, disabledTypes })
  await page.goto('/')
}
const spoken = (page: Page) => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken)

/** Answers whatever question is showing, correctly, read from the running test that asks it. */
async function answerRight(page: Page, storageKey: string) {
  const { itemId, type, data } = await page.evaluate(key => {
    const saved = JSON.parse(sessionStorage.getItem(key)!).test
    return saved.questions[saved.current]
  }, storageKey)
  const item = card(itemId)
  await settle(page)
  if (type === 'korean-to-english') {
    await page.getByRole('textbox', { name: 'Meaning in English' }).fill(item.meaning.split(' / ')[0].replace(/\([^)]*\)/g, '').trim())
    await page.getByRole('button', { name: 'Check answer' }).click()
  } else {
    expect(['complete-sentence', 'conjugate']).toContain(type)
    const answer = type === 'conjugate' ? formQuestion(item, data as FormQuestion).expected : gapAnswer(sentencesOf(item)[(data as GapQuestion).example])
    await page.getByRole('radio', { name: answer, exact: true }).check()
    await settle(page)
    await page.getByRole('button', { name: 'Check answer' }).click()
  }
  await expect(page.getByTestId('test-result')).toHaveAttribute('data-outcome', 'correct')
  await settle(page)
  await page.locator('#test-next').click()
  return itemId
}

test('After the welcome, Learn meets its cards, practises them, and hands them to Review', async ({ page }) => {
  test.setTimeout(90_000)
  const unit = units[0]
  await open(page)
  await expect(main(page).getByRole('button', { name: 'Learn' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByTestId('unit-card').first()).toContainText('Up next')
  await page.getByRole('button', { name: `Start ${unit.title}` }).click()
  await expect(page.getByTestId('unit-intro')).toContainText(unit.goal)
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  const practised: string[] = []
  for (let step = 0; step < 20 && !(await page.getByTestId('unit-done').count()); step++) {
    if (await page.getByTestId('meet-card').count()) {
      const korean = await page.getByTestId('korean-word').textContent()
      const item = unit.cards.map(card).find(entry => entry.korean === korean)!
      expect(item, `${korean} belongs to the unit`).toBeTruthy()
      await expect(page.getByTestId('meaning')).toHaveText(item.meaning)
      // Hear it, choose an anchor, see it in a sentence.
      await page.getByRole('button', { name: 'Play pronunciation' }).click()
      await expect.poll(async () => (await spoken(page)).at(-1)).toBe(item.grammar?.speech ?? item.korean)
      if (item.id === unit.cards[0]) {
        await page.getByTestId('anchor-option').first().click()
        await expect(page.getByTestId('mnemonic')).toBeVisible()
      }
      await expect(page.getByRole('region', { name: 'In a sentence' }).locator('mark')).toHaveText(gapAnswer(sentencesOf(item)[0]))
      await page.getByRole('button', { name: /^Continue/ }).click()
    } else if (await page.getByTestId('practice-done').count()) {
      await expect(page.getByTestId('practice-done')).toContainText(/(\d+) of \1 right/)
      await page.getByRole('button', { name: 'Continue' }).click()
    } else {
      await expect(page.getByTestId('practice-count')).toBeVisible()
      practised.push(await answerRight(page, 'sori.learnTest.v1'))
    }
  }
  await expect(page.getByTestId('unit-done')).toContainText('Nicely done')
  // Every card was asked twice: what it means, then at work.
  expect([...new Set(practised)].sort()).toEqual([...unit.cards].sort())
  expect(practised).toHaveLength(unit.cards.length * 2)
  // Review has them all now; recalled without help in practice, each comes back in a few days.
  const scheduled = await page.evaluate(() => JSON.parse(localStorage.getItem('sori.review.v1')!).cards)
  for (const id of unit.cards) expect(scheduled[id]?.due, id).toBeTruthy()
  const log = await page.evaluate(() => JSON.parse(localStorage.getItem('sori.recall.v1')!).entries as RecallEntry[])
  expect(log.filter(entry => entry.via === 'learn')).toHaveLength(unit.cards.length * 2)
  // At work: -이에요/예요 builds a form on a job word; everything else completes a sentence.
  expect(log.filter(entry => entry.via === 'learn' && entry.type === 'conjugate').map(entry => entry.id)).toEqual(['ending:-이에요/예요'])
  expect(log.find(entry => entry.id === unit.cards[0])?.anchor).toBeTruthy()
  await page.getByRole('button', { name: 'Back to Learn' }).click()
  await expect(page.getByTestId('unit-card').first()).toContainText('Done')
  await expect(page.getByTestId('unit-card').nth(1)).toContainText('Up next')
})

test('Review brings back what’s due, and each answer reschedules its card', async ({ page }) => {
  const today = await (async () => { await page.goto('/'); return localDay(page) })()
  const due = ['Verbs:먹어요', 'Verbs:가요']
  await open(page, {
    session: { category: 'Verbs', destination: 'review', mode: 'standard', filter: 'all', order: [], index: 0 },
    review: Object.fromEntries(due.map(id => [id, { box: 2, due: today, reps: 1, lapses: 0 }])),
    anchors: { 'Verbs:먹어요': { selected: card('Verbs:먹어요').anchors[0].id, selectedAt: new Date().toISOString() } },
    disabledTypes: ['english-to-korean'],
  })
  await expect(main(page).getByRole('button', { name: /^Review/ })).toHaveAccessibleName('Review 2 due')
  await expect(page.getByRole('heading', { name: '2 words to review' })).toBeVisible()
  await expect(page.getByTestId('due-preview')).toHaveText('먹어요가요')
  await page.getByRole('button', { name: 'Start review' }).click()
  await expect(page.getByTestId('test-count')).toHaveText('Question 1 of 2')
  for (let index = 0; index < 2; index++) await answerRight(page, 'sori.test.v1')
  await expect(page.getByRole('heading', { name: 'Review complete' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retake test' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Back to Review' }).click()
  await expect(page.getByRole('heading', { name: 'All caught up' })).toBeVisible()
  await expect(main(page).getByRole('button', { name: /^Review/ })).toHaveAccessibleName('Review')
  // Recalled without help: one box up, due in a week.
  const week = await localDay(page, 7)
  const scheduled = await page.evaluate(() => JSON.parse(localStorage.getItem('sori.review.v1')!).cards)
  for (const id of due) expect(scheduled[id], id).toMatchObject({ box: 3, due: week, reps: 2 })
  await expect(page.getByTestId('due-panel')).toContainText('Next review on')
  // The answers are logged with the anchor in use.
  const log = await page.evaluate(() => JSON.parse(localStorage.getItem('sori.recall.v1')!).entries as RecallEntry[])
  expect(log.map(entry => entry.via)).toEqual(['review', 'review'])
  expect(log.find(entry => entry.id === 'Verbs:먹어요')).toMatchObject({ outcome: 'correct', anchor: card('Verbs:먹어요').anchors[0].id })
})

test('Search finds any card, word or grammar, and opens it in the Library', async ({ page }) => {
  await open(page, { session: { category: 'Verbs', destination: 'library', mode: 'standard', filter: 'all', order: ['Verbs:배워요'], index: 0 } })
  await page.getByRole('button', { name: 'Search the Library' }).click()
  const sheet = page.getByRole('dialog', { name: 'Search the Library' })
  await sheet.getByRole('searchbox', { name: 'Search words and grammar' }).fill('coffee')
  await sheet.getByRole('button', { name: /^커피/ }).first().click()
  await expect(sheet).toBeHidden()
  await expect(page.getByTestId('korean-word')).toHaveText('커피')
  // 커피 isn't a verb: it opens in the whole vocabulary, first in line.
  await expect(page.getByRole('button', { name: 'Choose category' })).toHaveText('All words')
  await expect(page.getByTestId('deck-count')).toHaveText(/^1 \//)
  await page.getByRole('button', { name: 'Search the Library' }).click()
  await sheet.getByRole('searchbox', { name: 'Search words and grammar' }).fill('topic')
  await sheet.getByRole('button', { name: /^은\/는/ }).click()
  await expect(page.getByTestId('korean-word')).toHaveText('은/는')
  await expect(page.getByRole('group', { name: 'Section' }).getByRole('button', { name: 'Grammar' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Search the Library' }).click()
  await sheet.getByRole('searchbox', { name: 'Search words and grammar' }).fill('zzzz')
  await expect(sheet.getByText('Nothing matches “zzzz”.', { exact: false })).toBeVisible()
})

test('Anchors in the languages you know come first; the rest wait one tap away', async ({ page }) => {
  await open(page, { session: { category: 'Family', destination: 'library', mode: 'standard', filter: 'all', order: ['Family:엄마'], index: 0 } })
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  const options = page.getByTestId('anchor-chooser').getByTestId('anchor-option')
  const mom = card('Family:엄마')
  const italian = mom.anchors.filter(anchor => anchor.kind === 'sound' && anchor.language === 'it')
  expect(italian.map(anchor => anchor.text).join(' ')).toContain('MAMMA MIA')
  // English, Spanish, and French to start with: MAMMA MIA is Italian.
  await expect(options).toHaveCount(mom.anchors.length - italian.length)
  await page.getByRole('button', { name: `More ideas in other languages (${italian.length})` }).click()
  await expect(page.getByTestId('other-language-anchors')).toContainText('MAMMA MIA')
  await page.getByRole('button', { name: 'Languages you know' }).click()
  const sheet = page.getByRole('dialog', { name: 'Languages you know' })
  await expect(sheet.getByRole('button', { name: /English/ })).toBeDisabled()
  await sheet.getByRole('button', { name: /Italian/ }).click()
  await expect(sheet.getByRole('button', { name: /Italian/ })).toHaveAttribute('aria-pressed', 'true')
  await sheet.getByRole('button', { name: 'Close languages you know' }).click()
  await expect(options).toHaveCount(mom.anchors.length)
  await expect(page.getByRole('button', { name: /More ideas in other languages/ })).toHaveCount(0)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sori.languages.v1')!).languages)).toEqual(['en', 'es', 'fr', 'it'])
})

test('Each anchor shows how its card did in tests and reviews while it was the one in use', async ({ page }) => {
  const item = card('Verbs:먹어요')
  const [first, second] = item.anchors
  const entry = (anchor: string, outcome: RecallEntry['outcome']): RecallEntry => ({ id: item.id, at: new Date().toISOString(), via: 'review', type: 'korean-to-english', outcome, anchor })
  await open(page, {
    session: { category: 'Verbs', destination: 'library', mode: 'standard', filter: 'all', order: [item.id], index: 0 },
    anchors: { [item.id]: { selected: first.id, selectedAt: new Date().toISOString() } },
    recall: [entry(first.id, 'correct'), entry(first.id, 'correct'), entry(first.id, 'hinted'), entry(second.id, 'incorrect')],
  })
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await expect(page.getByTestId('anchor-evidence')).toHaveText('In tests and reviews: 2 of 3 recalled · 1 with a hint')
  await page.getByRole('button', { name: 'Change memory anchor' }).click()
  // Options are grouped by kind, so find each by its tally: the one in use, and the one tried before.
  await expect(page.getByTestId('anchor-option').filter({ hasText: '2/3 recalled' })).toContainText('Current')
  await expect(page.getByTestId('anchor-option').filter({ hasText: '0/1 recalled' })).toHaveAttribute('aria-pressed', 'false')
})

test('A word’s sentence follows its meaning, highlighted and playable', async ({ page }) => {
  const item = card('Fruit:사과')
  await open(page, { session: { category: 'Fruit', destination: 'library', mode: 'standard', filter: 'all', order: [item.id], index: 0 } })
  await page.getByRole('button', { name: 'Show meaning' }).click()
  const example = page.getByTestId('word-example')
  await expect(example.locator('mark')).toHaveText('사과')
  await expect(example).toContainText(item.example!.english)
  await example.getByRole('button', { name: /^Play:/ }).click()
  await expect.poll(async () => (await spoken(page)).at(-1)).toBe(item.example!.korean.replace(/[[\]]/g, ''))
})
