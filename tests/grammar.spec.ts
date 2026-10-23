import { expect, test, type Page } from '@playwright/test'
import { cardById, cards, collectionInfo, sectionOf } from '../src/data/cards'
import { grammarSources } from '../src/data/grammar'
import { acceptedTexts, givesAway, matchEnglish } from '../src/recall/english'
import { buildTest } from '../src/recall/generate'
import { gapAnswer, questionRuleById, type GapQuestion } from '../src/recall/questionRules'
import { rootParts } from '../src/data/root-anchors'
import { meaningTerms } from '../src/recall/hints'

const card = (id: string) => cardById.get(id)!
const rule = (id: string) => questionRuleById.get(id)!
const plain = (korean: string) => korean.replace(/[[\]]/g, '')
const settle = (page: Page) => page.waitForTimeout(350)

/** Opens the app on one card, with speech recorded instead of spoken. */
async function seed(page: Page, { category, order = [], mode = 'standard', progress = {}, disabledTypes }: {
  category: string; order?: string[]; mode?: string; progress?: Record<string, string>; disabledTypes?: string[]
}) {
  await page.addInitScript(({ category, order, mode, progress, disabledTypes }) => {
    localStorage.setItem('sori.guideSeen.v1', 'true')
    if (!sessionStorage.getItem('test.seeded')) {
      sessionStorage.setItem('test.seeded', 'true')
      sessionStorage.setItem('sori.session.v1', JSON.stringify({ category, mode, filter: 'all', order, index: 0 }))
      localStorage.setItem('sori.progress.v1', JSON.stringify(progress))
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
  }, { category, order, mode, progress, disabledTypes })
  await page.goto('/')
}
const spoken = (page: Page) => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken)
/** The card and sentence a Complete the sentence question shows: its sentence around the blank, and its English. */
async function shownGap(page: Page) {
  const sentence = await page.getByTestId('test-sentence').evaluate(element => {
    const copy = element.cloneNode(true) as HTMLElement
    copy.querySelector('[data-testid="sentence-blank"]')?.remove()
    return copy.textContent
  })
  const english = await page.getByTestId('test-translation').textContent()
  for (const item of cards) for (const example of item.grammar?.examples ?? []) {
    if (example.english === english && example.korean.replace(/\[[^\]]*\]/, '') === sentence) return { item, example, answer: gapAnswer(example) }
  }
  throw new Error(`No example shows “${sentence}” / “${english}”`)
}

test.describe('Grammar cards', () => {
  test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== 'desktop', 'Pure logic runs once') })

  test('Every grammar collection holds its cards, each with the full set of layers', () => {
    for (const collection of Object.keys(collectionInfo) as (keyof typeof collectionInfo)[]) {
      const deck = cards.filter(item => item.collection === collection)
      expect(deck.length, collection).toBeGreaterThanOrEqual(collection === 'connectors' || collection === 'particles' ? 20 : 3)
      for (const item of deck) {
        // One to three anchors: a weak one never fills a slot. Another language the learner knows may add one.
        const core = item.anchors.filter(anchor => !/^(it|pt|de)\d$/.test(anchor.id))
        expect(core.length, item.id).toBeGreaterThanOrEqual(1)
        expect(core.length, item.id).toBeLessThanOrEqual(3)
        expect(item.pronunciation, item.id).toBeTruthy()
        expect(item.roots?.sources.length ?? 0, `${item.id} has evidence`).toBeGreaterThanOrEqual(item.roots ? 1 : 0)
        const { grammar } = item
        expect(grammar?.examples, item.id).toHaveLength(3)
        expect(grammar!.forms.length, item.id).toBeGreaterThan(0)
        expect(grammar!.rules.length, item.id).toBeGreaterThanOrEqual(2)
        expect(grammar!.tricks.length, item.id).toBeGreaterThan(0)
        expect(grammar!.comparisons.length, item.id).toBeGreaterThan(0)
        expect(sectionOf(item.category), item.id).toBe('grammar')
      }
    }
    // The comparisons the learner asked for, both ways.
    const compares = (id: string, other: string) => card(id).grammar!.comparisons.some(comparison => comparison.with.includes(other))
    expect(compares('particle:은/는', 'particle:이/가')).toBe(true)
    expect(compares('particle:이/가', 'particle:은/는')).toBe(true)
    expect(compares('connector:-고', 'connector:그리고')).toBe(true)
    expect(compares('connector:그리고', 'connector:-고')).toBe(true)
  })

  test('A root-based anchor only where the origin record breaks the item into parts', () => {
    for (const item of grammarSources) {
      const full = card(item.id)
      const roots = full.anchors.filter(anchor => anchor.kind === 'roots')
      if (!full.roots?.components.length) expect(roots, `${item.id} has no recorded parts`).toHaveLength(0)
      for (const anchor of roots) {
        const parsed = rootParts(anchor.text)
        expect(parsed, `${item.id}: ${anchor.text}`).toBeTruthy()
        // Every Korean piece of the anchor is in the item itself, its note, or a related card.
        const record = [full.korean, full.roots?.note, ...full.roots?.components.map(component => component.label) ?? [], ...full.roots?.related.map(word => word.korean) ?? []].join(' ')
        for (const part of parsed!.parts) expect(record, `${item.id}: ${part.korean}`).toContain(part.korean.replace(/^-|-$/g, ''))
      }
    }
  })

  test('Particles point to the phrases that use them, and back', () => {
    const subject = card('particle:이/가').roots!
    expect(subject.related.map(word => word.korean)).toContain('날씨가 더워요')
    expect(card('phrase:날씨가 더워요').roots!.related.map(word => word.id)).toContain('particle:이/가')
    const object = card('particle:을/를').roots!
    expect(object.related.map(word => word.korean)).toContain('한국어를 배워요')
  })

  test('Complete the sentence: four options, one right, saved and restored exactly', () => {
    const complete = rule('complete-sentence')
    // A word's sentence borrows three wrong words from its category: never a look-alike, ending like the answer
    // where it can, so the particle after the blank (를 or 을) never gives it away.
    const apple = card('Fruit:사과')
    for (let seed = 1; seed <= 20; seed++) {
      let state = seed
      const random = () => (state = (state * 16807) % 2147483647) / 2147483647
      const data = complete.prepare!(apple, { pool: [apple], random }) as GapQuestion
      expect(data.options).toContain('사과')
      for (const option of data.options.filter(option => option !== '사과')) {
        const other = cards.find(item => item.korean === option && item.category === 'Fruit')!
        expect(other.meaning, option).not.toBe(apple.meaning)
        expect(other.sourceKind, option).not.toBe('heading')
        expect(/[가-힣]$/.test(option) && (option.charCodeAt(option.length - 1) - 0xac00) % 28 === 0, option).toBe(true)
      }
      expect(complete.parseData!(JSON.parse(JSON.stringify(data)), apple)).toEqual(data)
    }
    // A tampered save: a word from another category, or no right answer at all.
    expect(complete.parseData!({ example: 0, options: ['사과', '포도', '바나나', '커피'] }, apple)).toBeUndefined()
    expect(complete.parseData!({ example: 0, options: ['포도', '바나나', '딸기', '키위'] }, apple)).toBeUndefined()
    expect(rule('english-to-korean').supports(card('particle:은/는'))).toBe(false)
    const pool = cards.filter(item => item.grammar)
    for (let seed = 1; seed <= 20; seed++) {
      let state = seed
      const random = () => (state = (state * 16807) % 2147483647) / 2147483647
      const questions = buildTest(pool, { length: pool.length, rules: [complete], random })
      expect(questions).toHaveLength(pool.length)
      for (const question of questions) {
        const item = card(question.itemId)
        const data = question.data as GapQuestion
        const example = item.grammar!.examples[data.example]
        const answer = gapAnswer(example)
        expect(data.options, item.id).toHaveLength(4)
        expect(new Set(data.options).size, item.id).toBe(4)
        expect(data.options, item.id).toContain(answer)
        expect(complete.parseData!(JSON.parse(JSON.stringify(data)), item), item.id).toEqual(data)
        expect(complete.evaluate(item, { kind: 'choice', choice: answer }, { data })).toMatchObject({ result: 'correct' })
        for (const wrong of example.gap) expect(complete.evaluate(item, { kind: 'choice', choice: wrong }, { data })).toMatchObject({ result: 'incorrect' })
        expect(complete.hints(item, { data }).map(hint => hint.kind)).toEqual(['meaning', 'narrow'])
        // Neither hint names the piece.
        for (const hint of complete.hints(item, { data })) expect(hint.text, item.id).not.toMatch(/[가-힣]/)
      }
    }
    // Tampered saves are rejected: a changed option, or an example that doesn't exist.
    const item = card('particle:은/는')
    const options = [gapAnswer(item.grammar!.examples[0]), ...item.grammar!.examples[0].gap]
    expect(complete.parseData!({ example: 0, options: [...options.slice(0, 3), '가'] }, item)).toBeUndefined()
    expect(complete.parseData!({ example: 7, options }, item)).toBeUndefined()
  })

  test('Korean → English hints never give a connector or particle away, whichever anchor was chosen', () => {
    const koToEn = rule('korean-to-english')
    for (const item of cards.filter(entry => entry.grammar)) {
      expect(koToEn.hints(item, {}).length, item.id).toBeGreaterThan(0)
      const terms = meaningTerms(acceptedTexts(item)).filter(term => term.length >= 3)
      for (const anchor of item.anchors) {
        for (const hint of koToEn.hints(item, { anchor: { text: anchor.text, kind: anchor.kind, own: false, source: anchor.source } })) {
          const label = `${item.id} #${anchor.id} ${hint.kind}: ${hint.text}`
          expect(hint.text, label).not.toMatch(/[가-힣]/)
          expect(terms.filter(term => new RegExp(`\\b${term}`, 'i').test(hint.text)), label).toEqual([])
          expect(givesAway(hint.text, item), label).toBe(false)
        }
      }
    }
  })

  test('Korean → English: the meaning and every reviewed synonym count; words and grammar each get their own kinds of question', () => {
    for (const item of cards.filter(entry => entry.grammar)) {
      for (const sense of item.meaning.split(' / ')) expect(matchEnglish(sense.replace(/\([^)]*\)/g, ''), item).result, `${item.id}: ${sense}`).toBe('correct')
    }
    const rules = [...questionRuleById.values()]
    const words = cards.filter(item => item.section === 'vocabulary' && item.example)
    expect(new Set(buildTest(words, { length: words.length, rules, random: () => 0.3 }).map(question => question.type)))
      .toEqual(new Set(['korean-to-english', 'english-to-korean', 'complete-sentence']))
    // Grammar is never asked English → Korean: grammar points share meanings (and: 그리고, -고, 하고).
    const grammar = cards.filter(item => item.section === 'grammar')
    expect(buildTest(grammar, { length: grammar.length, rules, random: () => 0.3 }).some(question => question.type === 'english-to-korean')).toBe(false)
  })
})

test('Vocabulary and Grammar keep their own place, and Grammar narrows by collection', async ({ page }) => {
  await seed(page, { category: 'Verbs', order: ['Verbs:배워요'] })
  const tabs = page.getByRole('group', { name: 'Section' })
  await expect(tabs.getByRole('button')).toHaveText(['Vocabulary', 'Grammar'])
  await expect(tabs.getByRole('button', { name: 'Vocabulary' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Next word' }).click()
  const second = await page.getByTestId('korean-word').textContent()

  await tabs.getByRole('button', { name: 'Grammar' }).click()
  await expect(page.getByRole('button', { name: 'Choose category' })).toHaveText('All grammar')
  await expect(page.getByTestId('deck-count')).toHaveText(`1 / ${cards.filter(item => item.section === 'grammar').length}`)
  await page.getByRole('button', { name: 'Choose category' }).click()
  const dialog = page.getByRole('dialog', { name: 'Choose your grammar points' })
  const particles = cards.filter(item => item.collection === 'particles')
  await expect(dialog.getByRole('button', { name: `All connectors ${cards.filter(item => item.collection === 'connectors').length}` })).toBeVisible()
  await expect(dialog.getByRole('button', { name: /Adjectives/ })).toHaveCount(0)
  await dialog.getByRole('button', { name: `All particles ${particles.length}` }).click()
  await expect(page.getByRole('button', { name: 'Choose category' })).toHaveText('All particles')
  await expect(page.getByTestId('deck-count')).toHaveText(`1 / ${particles.length}`)
  expect(particles.map(item => item.korean)).toContain(await page.getByTestId('korean-word').textContent())
  await expect(page.getByRole('article', { name: 'Particle study card' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next particle' })).toBeVisible()

  // Back to Vocabulary: the same category and card as before, also after a reload.
  await tabs.getByRole('button', { name: 'Vocabulary' }).click()
  await expect(page.getByRole('button', { name: 'Choose category' })).toHaveText('Verbs')
  await expect(page.getByTestId('korean-word')).toHaveText(second!)
  await page.reload()
  await expect(page.getByTestId('korean-word')).toHaveText(second!)
  await tabs.getByRole('button', { name: 'Grammar' }).click()
  await expect(page.getByRole('button', { name: 'Choose category' })).toHaveText('All particles')
})

test('A particle card: anchor, roots, examples to play, usage rules, tricks, and comparisons', async ({ page }) => {
  const item = card('particle:은/는')
  const grammar = item.grammar!
  await seed(page, { category: 'All particles', order: [item.id] })
  await expect(page.getByTestId('korean-word')).toHaveText('은/는')
  await page.getByRole('button', { name: 'Play pronunciation' }).click()
  await expect.poll(() => spoken(page)).toEqual([grammar.speech])

  await page.getByRole('button', { name: 'Show examples' }).click()
  const examples = page.getByTestId('grammar-examples')
  await expect(examples.locator('li')).toHaveCount(3)
  await expect(examples.locator('mark')).toHaveText(grammar.examples.map(gapAnswer))
  for (const example of grammar.examples) await expect(examples).toContainText(example.english)
  await examples.getByRole('button', { name: `Play: ${plain(grammar.examples[1].korean)}` }).click()
  await expect.poll(async () => (await spoken(page)).at(-1)).toBe(plain(grammar.examples[1].korean))

  await page.getByRole('button', { name: 'Show usage rules' }).click()
  for (const { form } of grammar.forms) await expect(page.getByTestId('grammar-usage').locator('dt', { hasText: form })).toHaveCount(1)
  await expect(page.getByTestId('grammar-usage').locator('li')).toHaveCount(grammar.rules.length)
  await page.getByRole('button', { name: 'Show memory tricks' }).click()
  await expect(page.getByTestId('grammar-tricks').locator('li')).toHaveText(grammar.tricks)
  await page.getByRole('button', { name: 'Show comparisons' }).click()
  const comparison = grammar.comparisons.find(entry => entry.with.includes('particle:이/가'))!
  await expect(page.getByTestId('grammar-comparisons')).toContainText(comparison.title)
  await expect(page.getByTestId('grammar-comparisons')).toContainText(card('particle:이/가').meaning)

  // The same anchor chooser as for words, and the choice is kept.
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await page.getByTestId('anchor-option').nth(1).click()
  await expect(page.getByTestId('mnemonic')).toHaveText(item.anchors[1].text)
  expect(await page.evaluate(id => JSON.parse(localStorage.getItem('sori.anchors.v1')!)[id].selected, item.id)).toBe(item.anchors[1].id)
  await page.getByRole('button', { name: 'Show meaning' }).click()
  await expect(page.getByTestId('meaning')).toHaveText(item.meaning)
})

test('Listening works for connectors too: hear the forms, reveal the connector, and study it', async ({ page }) => {
  const item = card('connector:-지만')
  await seed(page, { category: 'All connectors', order: [item.id], mode: 'listening' })
  await expect(page.getByTestId('korean-word')).toHaveCount(0)
  await page.getByRole('button', { name: 'Play pronunciation' }).click()
  await expect.poll(() => spoken(page)).toEqual([item.grammar!.speech])
  await page.getByRole('button', { name: 'Reveal connector' }).click()
  await expect(page.getByTestId('korean-word')).toHaveText(item.korean)
  await page.getByRole('button', { name: 'Study this connector' }).click()
  await expect(page.getByRole('button', { name: 'Standard', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Hide memory anchor' })).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('button', { name: 'Show examples' })).toBeVisible()
})

test('Each half of the Library keeps its own Difficult pile, and Review brings it back', async ({ page }) => {
  await seed(page, { category: 'All particles', order: ['particle:도'] })
  await page.getByRole('button', { name: 'Mark as difficult' }).click()
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: /Review/ }).click()
  const pile = page.getByTestId('difficult-panel')
  await expect(pile.getByText('1 grammar point')).toBeVisible()
  await expect(pile.getByRole('button', { name: 'Study difficult vocabulary' })).toHaveCount(0)
  // Marked Difficult: due in today's review.
  await expect(page.getByTestId('due-preview')).toContainText('도')
  await pile.getByRole('button', { name: 'Study difficult grammar' }).click()
  await expect(page.getByRole('button', { name: 'Choose category' })).toHaveText('Difficult · All grammar')
  await expect(page.getByTestId('korean-word')).toHaveText('도')
  await page.getByRole('group', { name: 'Section' }).getByRole('button', { name: 'Vocabulary' }).click()
  await expect(page.getByRole('button', { name: 'Choose category' })).toHaveText('All words')
})

test('Complete the sentence: pick, check, and see why; a hint removes two wrong options for half a point', async ({ page }) => {
  await seed(page, { category: 'All connectors', mode: 'test', disabledTypes: ['korean-to-english'] })
  const types = page.getByRole('group', { name: 'Question types' })
  await expect(types.getByRole('button')).toHaveText([/Korean → English/, /Complete the sentence/])
  await page.getByRole('button', { name: 'Start test' }).click()
  const question = page.getByTestId('test-question')
  await expect(question).toHaveAttribute('data-type', 'complete-sentence')

  const { example, answer } = await shownGap(page)

  await page.getByRole('button', { name: 'Hint' }).click()
  await page.getByRole('button', { name: 'Another hint' }).click()
  await expect(page.getByRole('radio', { disabled: true })).toHaveCount(2)
  await expect(page.getByRole('radio', { name: answer, exact: true })).toBeEnabled()
  // Arrow keys move between the options left; Enter checks.
  await page.getByRole('radio', { name: answer, exact: true }).check()
  await expect(page.getByTestId('sentence-blank')).toHaveText(answer)
  await settle(page)
  await page.getByRole('radio', { name: answer, exact: true }).press('Enter')
  await expect(page.getByTestId('test-result')).toHaveAttribute('data-outcome', 'hinted')
  await expect(page.getByTestId('test-points')).toHaveText('+0.5 points')
  await expect(page.getByTestId('test-solution')).toContainText(example.why)
  await expect(page.getByTestId('test-solution').locator('mark')).toHaveText(answer)
  await page.getByRole('button', { name: 'Hear it' }).click()
  await expect.poll(async () => (await spoken(page)).at(-1)).toBe(plain(example.korean))
})

test('Complete the sentence: a wrong pick is marked, the right option shown, and nothing can be changed after', async ({ page }) => {
  await seed(page, { category: 'All particles', mode: 'test', disabledTypes: ['korean-to-english'] })
  await page.getByRole('button', { name: 'Start test' }).click()
  const { example } = await shownGap(page)
  await page.getByRole('radio', { name: example.gap[0], exact: true }).check()
  await settle(page)
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByTestId('test-result')).toHaveAttribute('data-outcome', 'incorrect')
  await expect(page.locator('.choice-option[data-state="wrong"]')).toHaveText(example.gap[0])
  await expect(page.locator('.choice-option[data-state="right"]')).toHaveText(gapAnswer(example))
  await expect(page.getByRole('radio', { disabled: false })).toHaveCount(0)
  await expect(page.getByText('Count my answer')).toHaveCount(0)
  await page.reload()
  await expect(page.getByTestId('test-result')).toHaveAttribute('data-outcome', 'incorrect')
  await expect(page.locator('.choice-option[data-state="wrong"]')).toHaveText(example.gap[0])
})

test('A closed connector or particle card fits on one screen, like a word', async ({ page }) => {
  const longest = [...grammarSources].sort((a, b) => b.korean.length - a.korean.length)[0]
  await seed(page, { category: collectionInfo[longest.collection].all, order: [longest.id] })
  await expect(page.getByTestId('korean-word')).toHaveText(longest.korean)
  const size = await page.evaluate(() => ({ height: innerHeight, scrollHeight: document.documentElement.scrollHeight }))
  expect(size.scrollHeight).toBeLessThanOrEqual(size.height + 1)
})

test('Grammar cards and their test fit phones, with usable touch targets', async ({ page }, testInfo) => {
  const phone = testInfo.project.name === 'iphone-se'
  if (phone) await page.setViewportSize({ width: 375, height: 553 })
  const longest = [...grammarSources].sort((a, b) => b.grammar.examples.reduce((sum, example) => sum + example.korean.length, 0) - a.grammar.examples.reduce((sum, example) => sum + example.korean.length, 0))[0]
  await seed(page, { category: longest.collection === 'connectors' ? 'All connectors' : 'All particles', order: [longest.id] })
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  for (const name of ['Vocabulary', 'Grammar', 'Show examples', 'Show usage rules', 'Show memory tricks', 'Show comparisons']) {
    expect((await page.getByRole('button', { name, exact: true }).boundingBox())!.height, name).toBeGreaterThanOrEqual(44)
  }
  for (const name of ['Show examples', 'Show usage rules', 'Show memory tricks', 'Show comparisons', 'Show memory anchor', 'Show roots']) {
    const button = page.getByRole('button', { name, exact: true })
    if (await button.count()) await button.click()
  }
  expect(await fits()).toBe(true)
  await page.screenshot({ path: `test-results/${testInfo.project.name}-grammar-card.png`, fullPage: true, animations: 'disabled' })

  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: /Review/ }).click()
  await page.getByRole('button', { name: 'Korean → English', exact: false }).click()
  expect((await page.getByRole('button', { name: 'Start test' }).boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await page.getByRole('button', { name: 'Start test' }).click()
  await expect(page.getByTestId('test-question')).toHaveAttribute('data-type', 'complete-sentence')
  expect(await fits()).toBe(true)
  for (const radio of await page.getByRole('radio').all()) {
    const box = (await radio.boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    if (phone) await expect(radio).toBeInViewport({ ratio: 1 })
  }
  await page.getByRole('radio').first().check()
  await settle(page)
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.locator('#test-next')).toBeInViewport({ ratio: 1 })
  expect(await fits()).toBe(true)
  await page.screenshot({ path: `test-results/${testInfo.project.name}-complete-sentence.png`, fullPage: true, animations: 'disabled' })
})
