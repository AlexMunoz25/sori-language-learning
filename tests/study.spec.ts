import { expect, test, type Page } from '@playwright/test'
import { vocabulary, categories } from '../src/data/vocabulary'

async function seed(page: Page, mode = 'standard') {
  await page.addInitScript(({ mode }) => {
    if (!sessionStorage.getItem('test.seeded')) {
      sessionStorage.setItem('sori.session.v1', JSON.stringify({ category: 'Verbs', mode, filter: 'all', order: ['Verbs:배워요'], index: 0 }))
      sessionStorage.setItem('test.seeded', 'true')
    }
    const calls: unknown[] = []
    const events = new EventTarget()
    let voices: unknown[] = []
    let pending: ReturnType<typeof setTimeout> | undefined
    Object.defineProperty(window, '__speechCalls', { value: calls })
    Object.defineProperty(window, '__loadVoices', { value: () => {
      voices = [
        { lang: 'en-US', name: 'English', localService: true },
        { lang: 'ko-KR', name: 'Korean test voice', localService: true },
      ]
      events.dispatchEvent(new Event('voiceschanged'))
    } })
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => voices,
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
      cancel: () => { clearTimeout(pending); calls.push({ action: 'cancel' }) },
      speak: (utterance: SpeechSynthesisUtterance) => {
        calls.push({ action: 'speak', text: utterance.text, rate: utterance.rate, lang: utterance.lang, voice: utterance.voice?.name })
        pending = setTimeout(() => utterance.dispatchEvent(new Event('end')), 80)
      },
    } })
    // A plain test utterance lets tests supply synthetic voice objects.
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class extends EventTarget {
      text: string; lang = ''; rate = 1; pitch = 1; voice: unknown = null
      onend: (() => void) | null = null
      onerror: ((event: unknown) => void) | null = null
      constructor(text: string) { super(); this.text = text; this.addEventListener('end', () => this.onend?.()) }
    } })
  }, { mode })
  await page.goto('/')
}

test('Standard: each reveal is independent and resets on navigation', async ({ page }) => {
  await seed(page)
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
  await expect(page.getByTestId('meaning')).toHaveCount(0)
  await expect(page.getByTestId('pronunciation')).toHaveCount(0)
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await expect(page.getByTestId('anchor-option')).toHaveCount(3)
  await page.getByTestId('anchor-option').first().click()
  await expect(page.getByTestId('mnemonic')).toHaveText(vocabulary.find(item => item.id === 'Verbs:배워요')!.anchors[0].text)
  await expect(page.getByTestId('meaning')).toHaveCount(0)
  await expect(page.getByTestId('pronunciation')).toHaveCount(0)
  await page.getByRole('button', { name: 'Show meaning' }).click()
  await expect(page.getByTestId('meaning')).toHaveText('to learn')
  await expect(page.getByText('배우다', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Show pronunciation' }).click()
  await expect(page.getByTestId('pronunciation')).toHaveText('bae-wo-yo')
  await page.getByRole('button', { name: 'Hide & try again' }).click()
  await expect(page.getByTestId('meaning')).toHaveCount(0)
  await expect(page.getByTestId('mnemonic')).toHaveCount(0)
  await page.getByRole('button', { name: 'Next word' }).click()
  await expect(page.getByTestId('korean-word')).not.toHaveText('배워요')
  await expect(page.getByTestId('meaning')).toHaveCount(0)
  await page.getByRole('button', { name: 'Previous word' }).click()
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
})

test('Listening hides all answers, never autoplays, and uses loaded Korean voices', async ({ page }) => {
  await seed(page, 'listening')
  await expect(page.getByTestId('korean-word')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Show memory anchor' })).toHaveCount(0)
  const calls = () => page.evaluate(() => (window as unknown as { __speechCalls: Array<Record<string, unknown>> }).__speechCalls)
  expect((await calls()).filter(call => call.action === 'speak')).toHaveLength(0)
  await page.getByRole('button', { name: 'Play pronunciation' }).click()
  expect((await calls()).at(-1)).toMatchObject({ action: 'speak', lang: 'ko-KR', rate: .85, text: '배워요' })
  await page.evaluate(() => (window as unknown as { __loadVoices: () => void }).__loadVoices())
  await page.getByRole('button', { name: 'Play slowly' }).click()
  const history = await calls()
  expect(history.at(-2)).toEqual({ action: 'cancel' })
  expect(history.at(-1)).toMatchObject({ action: 'speak', rate: .6, voice: 'Korean test voice' })
  await page.getByRole('button', { name: 'Reveal word' }).click()
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
  await expect(page.getByTestId('meaning')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Show memory anchor' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Show meaning' }).click()
  await expect(page.getByTestId('meaning')).toHaveText('to learn')
  await page.getByRole('button', { name: 'Next word' }).click()
  await expect(page.getByTestId('korean-word')).toHaveCount(0)
  expect((await calls()).filter(call => call.action === 'speak')).toHaveLength(2)
})

test('Categories have source counts, filter correctly, and persist with mode', async ({ page }) => {
  await seed(page)
  await page.getByRole('button', { name: 'Choose category' }).click()
  const dialog = page.getByRole('dialog', { name: 'Choose your words' })
  await expect(dialog.getByRole('button', { name: `All words ${vocabulary.length}` })).toBeVisible()
  for (const category of categories) await expect(dialog.getByRole('button', { name: `${category.name} ${category.count}`, exact: true })).toHaveCount(1)
  await dialog.getByRole('searchbox').fill('fruit')
  await expect(dialog.locator('.category-option')).toHaveCount(1)
  await dialog.getByRole('button', { name: 'Fruit 13' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByTestId('deck-count')).toHaveText('1 / 13')
  const word = await page.getByTestId('korean-word').textContent()
  expect(vocabulary.filter(item => item.category === 'Fruit').map(item => item.korean)).toContain(word)
  await page.getByRole('button', { name: 'Listening', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Listening', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Choose category' })).toContainText('Fruit')
  await expect(page.getByTestId('korean-word')).toHaveCount(0)
})

test('Difficult and known marks persist, stay exclusive, and update the practice pile', async ({ page }) => {
  await seed(page)
  await page.getByRole('button', { name: 'Mark as difficult' }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Mark as difficult' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('navigation', { name: 'Word collection' }).getByRole('button', { name: 'Difficult 1' }).click()
  await expect(page.getByTestId('deck-count')).toHaveText('1 / 1')
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
  await page.getByRole('button', { name: 'Mark as known' }).click()
  await expect(page.getByText('Give tricky words a little love.')).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sori.progress.v1')!))).toEqual({ 'Verbs:배워요': 'known' })
  await page.reload()
  await expect(page.getByText('1 known · Progress saved on this device')).toBeVisible()
  await page.getByRole('button', { name: 'Explore your words' }).click()
  await expect(page.getByTestId('deck-count')).toHaveText(`1 / ${vocabulary.length}`)
})

test('Navigation restores position and shuffle avoids an immediate repeat', async ({ page }) => {
  await seed(page)
  await page.keyboard.press('ArrowRight')
  const second = await page.getByTestId('korean-word').textContent()
  await page.reload()
  await expect(page.getByTestId('korean-word')).toHaveText(second!)
  await expect(page.getByTestId('deck-count')).toHaveText('2 / 36')
  await page.getByRole('button', { name: 'Shuffle words' }).click()
  await expect(page.getByTestId('korean-word')).not.toHaveText(second!)
  await expect(page.getByTestId('deck-count')).toHaveText('1 / 36')
})

test('Horizontal swipes navigate, while small or vertical gestures do not', async ({ page }) => {
  await seed(page)
  async function swipe(x: number, y: number) {
    await page.getByTestId('korean-word').evaluate((element, { x, y }) => {
      const start = new Touch({ identifier: 1, target: element, clientX: 240, clientY: 340 })
      const end = new Touch({ identifier: 1, target: element, clientX: 240 + x, clientY: 340 + y })
      element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [start] }))
      element.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [end] }))
    }, { x, y })
  }
  await swipe(-20, 0)
  await swipe(-80, 160)
  await expect(page.getByTestId('deck-count')).toHaveText('1 / 36')
  await swipe(-100, 10)
  await expect(page.getByTestId('deck-count')).toHaveText('2 / 36')
  await swipe(100, 5)
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
})

test('Phone layout fits with usable touch targets and no horizontal overflow', async ({ page }, testInfo) => {
  await seed(page)
  const dimensions = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: innerHeight, scrollHeight: document.documentElement.scrollHeight }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width)
  expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.height + 1)
  for (const label of ['Play pronunciation', 'Play slowly', 'Show pronunciation', 'Show memory anchor', 'Show meaning', 'Next word', 'Previous word']) {
    const box = await page.getByRole('button', { name: label, exact: true }).boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
  await page.screenshot({ path: `test-results/${testInfo.project.name}-standard.png`, fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await page.getByRole('button', { name: 'Show meaning' }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(dimensions.width)
  await page.screenshot({ path: `test-results/${testInfo.project.name}-revealed.png`, fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: 'Listening', exact: true }).click()
  await page.screenshot({ path: `test-results/${testInfo.project.name}-listening.png`, fullPage: true, animations: 'disabled' })
})

test('Malformed storage and unavailable speech do not break study', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sori.progress.v1', '{broken')
    sessionStorage.setItem('sori.session.v1', JSON.stringify({ category: 99, order: [null, false, '__proto__'], index: -44 }))
    Object.defineProperty(window, 'speechSynthesis', { value: undefined })
    delete (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance
  })
  await page.goto('/')
  await expect(page.getByTestId('korean-word')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play pronunciation' })).toBeDisabled()
  await expect(page.getByText('Speech isn’t supported in this browser.', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Show meaning' }).click()
  await expect(page.getByTestId('meaning')).toBeVisible()
})

test('Speech failures and blocked storage leave all study controls working', async ({ page }) => {
  await seed(page)
  await page.evaluate(() => {
    window.speechSynthesis.speak = () => { throw new Error('Speech engine unavailable') }
  })
  await page.getByRole('button', { name: 'Play pronunciation' }).click()
  await expect(page.getByText('Audio isn’t available right now.', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Show meaning' }).click()
  await expect(page.getByTestId('meaning')).toHaveText('to learn')
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Storage blocked') } })
  await page.getByRole('button', { name: 'Mark as difficult' }).click()
  await expect(page.getByText('Storage unavailable', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mark as difficult' })).toHaveAttribute('aria-pressed', 'true')
})

test('Every source phrase fits horizontally and deck rollover avoids repetition', async ({ page }) => {
  await seed(page)
  await page.getByRole('button', { name: 'Choose category' }).click()
  await page.getByRole('dialog').getByRole('searchbox').fill('Useful phrases')
  await page.getByRole('button', { name: 'Useful phrases 24' }).click()
  const seen: string[] = []
  for (let index = 0; index < 24; index++) {
    const word = await page.getByTestId('korean-word').textContent()
    expect(seen).not.toContain(word)
    seen.push(word!)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.getByRole('button', { name: 'Next word' }).click()
  }
  await expect(page.getByTestId('deck-count')).toHaveText('1 / 24')
  await expect(page.getByTestId('korean-word')).not.toHaveText(seen.at(-1)!)
  expect(seen.sort()).toEqual(vocabulary.filter(item => item.sourceKind === 'phrase').map(item => item.korean).sort())
})
