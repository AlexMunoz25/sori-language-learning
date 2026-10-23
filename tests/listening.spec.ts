import { expect, test, type Page } from '@playwright/test'
import { vocabulary } from '../src/data/vocabulary'

const byWord = (word: string) => vocabulary.find(item => item.korean === word)!

async function openListening(page: Page, word: string) {
  const item = byWord(word)
  // Seed once per test, so reloads keep whatever the page saved.
  await page.addInitScript(({ id, category }) => {
    localStorage.setItem('sori.guideSeen.v1', 'true')
    if (sessionStorage.getItem('test.seeded')) return
    sessionStorage.setItem('test.seeded', 'true')
    sessionStorage.setItem('sori.session.v1', JSON.stringify({ category, mode: 'listening', filter: 'all', order: [id], index: 0 }))
  }, { id: item.id, category: item.category })
  await page.goto('/')
  return item
}

const pad = (page: Page) => page.getByTestId('writing-pad')

/** Draws one mouse stroke on the pad between two points given as fractions of its size. */
async function draw(page: Page, from: [number, number], to: [number, number]) {
  const box = (await pad(page).locator('canvas').boundingBox())!
  await page.mouse.move(box.x + box.width * from[0], box.y + box.height * from[1])
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * to[0], box.y + box.height * to[1], { steps: 8 })
  await page.mouse.up()
}

const inkPixels = (page: Page) => pad(page).locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
  const { data } = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height)
  let count = 0
  for (let index = 3; index < data.length; index += 4) if (data[index] > 0) count++
  return count
})

/** The strongest ink alpha in a small square around a point on the pad (fractions of its size). */
const inkAt = (page: Page, x: number, y: number) => pad(page).locator('canvas').evaluate((canvas: HTMLCanvasElement, [x, y]) => {
  const { data } = canvas.getContext('2d')!.getImageData(Math.round(x * canvas.width) - 2, Math.round(y * canvas.height) - 2, 5, 5)
  let alpha = 0
  for (let index = 3; index < data.length; index += 4) alpha = Math.max(alpha, data[index])
  return alpha
}, [x, y])

async function tap(page: Page, x: number, y: number) {
  const box = (await pad(page).locator('canvas').boundingBox())!
  await page.mouse.click(box.x + box.width * x, box.y + box.height * y)
}

test('Your writing stays on the pad and the word is revealed directly below it', async ({ page }) => {
  await openListening(page, '배워요')
  await expect(pad(page)).toHaveAttribute('data-strokes', '0')
  await expect(page.getByText('Write the Korean word here')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled()
  await draw(page, [.2, .3], [.4, .7])
  await draw(page, [.5, .3], [.8, .3])
  await expect(pad(page)).toHaveAttribute('data-strokes', '2')
  await expect(page.getByText('Write the Korean word here')).toHaveCount(0)
  await expect(page.getByRole('img', { name: 'Your writing: 2 strokes' })).toBeVisible()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  const ink = await inkPixels(page)
  expect(ink).toBeGreaterThan(50)

  await page.getByRole('button', { name: 'Reveal word' }).click()
  const word = page.getByTestId('korean-word')
  await expect(word).toHaveText('배워요')
  const surface = (await page.locator('.writing-surface').boundingBox())!
  const answer = (await word.boundingBox())!
  expect(answer.y).toBeGreaterThan(surface.y + surface.height)
  expect(answer.y - (surface.y + surface.height)).toBeLessThan(90)
  // Both stay visible for comparison.
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  expect(await inkPixels(page)).toBeGreaterThan(ink * .8)

  await page.getByRole('button', { name: 'Hide word' }).click()
  await expect(word).toHaveCount(0)
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  await page.getByRole('button', { name: 'Clear all' }).click()
  await expect(pad(page)).toHaveAttribute('data-strokes', '0')
  expect(await inkPixels(page)).toBe(0)
})

test('The eraser removes only the stroke you touch, Clear all removes everything, and Undo reverses either', async ({ page }) => {
  await openListening(page, '배워요')
  const pen = page.getByRole('button', { name: 'Pen', exact: true })
  const eraser = page.getByRole('button', { name: 'Eraser', exact: true })
  const undo = page.getByRole('button', { name: 'Undo', exact: true })
  await expect(eraser).toBeDisabled()
  await draw(page, [.1, .3], [.4, .3])
  await draw(page, [.1, .7], [.4, .7])
  await draw(page, [.7, .2], [.7, .8])
  await expect(pad(page)).toHaveAttribute('data-strokes', '3')
  await eraser.click()
  await expect(eraser).toHaveAttribute('aria-pressed', 'true')
  await expect(pen).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByText('Tap or swipe over a stroke to erase it')).toBeVisible()

  // A tap erases just the stroke under it; a tap on empty space erases nothing.
  await tap(page, .25, .3)
  await expect(pad(page)).toHaveAttribute('data-strokes', '2')
  expect(await inkAt(page, .25, .3)).toBe(0)
  expect(await inkAt(page, .25, .7)).toBeGreaterThan(0)
  expect(await inkAt(page, .7, .5)).toBeGreaterThan(0)
  await tap(page, .9, .1)
  await expect(pad(page)).toHaveAttribute('data-strokes', '2')
  await undo.click()
  await expect(pad(page)).toHaveAttribute('data-strokes', '3')
  expect(await inkAt(page, .25, .3)).toBeGreaterThan(0)

  // A swipe erases every stroke it crosses, as one step for Undo.
  await draw(page, [.25, .1], [.25, .9])
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  expect(await inkAt(page, .7, .5)).toBeGreaterThan(0)
  await undo.click()
  await expect(pad(page)).toHaveAttribute('data-strokes', '3')

  await pen.click()
  await expect(page.getByText('Tap or swipe over a stroke to erase it')).toHaveCount(0)
  await draw(page, [.5, .9], [.6, .9])
  await expect(pad(page)).toHaveAttribute('data-strokes', '4')
  await page.getByRole('button', { name: 'Clear all' }).click()
  await expect(pad(page)).toHaveAttribute('data-strokes', '0')
  expect(await inkPixels(page)).toBe(0)
  await undo.click()
  await expect(pad(page)).toHaveAttribute('data-strokes', '4')
})

test('Erasing the last stroke hands back the pen', async ({ page }) => {
  await openListening(page, '배워요')
  await draw(page, [.2, .5], [.6, .5])
  await page.getByRole('button', { name: 'Eraser', exact: true }).click()
  await tap(page, .4, .5)
  await expect(pad(page)).toHaveAttribute('data-strokes', '0')
  await expect(page.getByRole('button', { name: 'Pen', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Eraser', exact: true })).toBeDisabled()
  await draw(page, [.2, .5], [.6, .5])
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
})

test('The meaning and the word reveal independently, and the meaning shows no Korean', async ({ page }) => {
  await openListening(page, '배워요')
  const card = page.getByRole('article', { name: 'Vocabulary study card' })
  await page.getByRole('button', { name: 'Show meaning' }).click()
  await expect(page.getByTestId('meaning')).toHaveText('to learn')
  await expect(page.getByTestId('korean-word')).toHaveCount(0)
  // Dictionary forms and notes contain Korean, so they stay out of the listening card.
  await expect(card).not.toContainText(/[가-힣]/)
  await page.getByRole('button', { name: 'Reveal word' }).click()
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
  await expect(page.getByTestId('meaning')).toBeVisible()
  await page.getByRole('button', { name: 'Hide meaning' }).click()
  await expect(page.getByTestId('meaning')).toHaveCount(0)
  await expect(page.getByTestId('korean-word')).toHaveText('배워요')
})

test('The meaning names who says the word when that tells similar words apart', async ({ page }) => {
  const item = vocabulary.find(entry => entry.speaker && entry.speaker !== 'anyone')!
  await openListening(page, item.korean)
  await page.getByRole('button', { name: 'Show meaning' }).click()
  await expect(page.getByRole('article', { name: 'Vocabulary study card' })).toContainText(`Used by: ${item.speaker}`)
})

test('Study opens the same word in Standard mode with its Memory Anchor showing', async ({ page }) => {
  await openListening(page, '배워요')
  await page.getByRole('button', { name: 'Next word' }).click()
  await page.getByRole('button', { name: 'Reveal word' }).click()
  const word = await page.getByTestId('korean-word').textContent()
  await page.getByRole('button', { name: 'Study this word' }).click()
  await expect(page.getByRole('button', { name: 'Standard', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('korean-word')).toHaveText(word!)
  await expect(page.getByTestId('deck-count')).toHaveText(/^2 \//)
  await expect(page.getByRole('button', { name: 'Hide memory anchor' })).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByTestId('mnemonic').or(page.getByTestId('anchor-chooser'))).toBeVisible()
  await expect(page.getByTestId('meaning')).toHaveCount(0)
  await expect(pad(page)).toHaveCount(0)
  // Hide & try again closes the anchor like every other reveal.
  await page.getByRole('button', { name: 'Show meaning' }).click()
  await page.getByRole('button', { name: 'Hide & try again' }).click()
  await expect(page.getByTestId('mnemonic').or(page.getByTestId('anchor-chooser'))).toHaveCount(0)
  // Back to Listening: the same word, hidden again, on a clean pad.
  await page.getByRole('button', { name: 'Listening', exact: true }).click()
  await expect(page.getByTestId('korean-word')).toHaveCount(0)
  await expect(pad(page)).toHaveAttribute('data-strokes', '0')
  await page.getByRole('button', { name: 'Reveal word' }).click()
  await expect(page.getByTestId('korean-word')).toHaveText(word!)
})

test('Writing never swipes to another word, ignores a second finger, and is cleared by navigation', async ({ page }) => {
  await openListening(page, '배워요')
  const canvas = pad(page).locator('canvas')
  // A long horizontal touch on the pad is writing, not a swipe.
  await canvas.evaluate(element => {
    const box = element.getBoundingClientRect()
    const start = new Touch({ identifier: 1, target: element, clientX: box.left + 20, clientY: box.top + 40 })
    const end = new Touch({ identifier: 1, target: element, clientX: box.right - 20, clientY: box.top + 44 })
    element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [start] }))
    element.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [end] }))
  })
  await expect(page.getByTestId('deck-count')).toHaveText(/^1 \//)
  // A resting palm (a second pointer) while writing adds nothing.
  await canvas.evaluate(element => {
    const box = element.getBoundingClientRect()
    const fire = (type: string, pointerId: number, x: number, y: number) => element.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId, pointerType: 'touch', isPrimary: pointerId === 2,
      clientX: box.left + x * box.width, clientY: box.top + y * box.height,
    }))
    fire('pointerdown', 2, .1, .5)
    fire('pointerdown', 3, .9, .9)
    fire('pointermove', 3, .8, .8)
    fire('pointerup', 3, .8, .8)
    fire('pointermove', 2, .5, .5)
    fire('pointerup', 2, .5, .5)
  })
  await expect(pad(page)).toHaveAttribute('data-strokes', '1')
  await draw(page, [.2, .5], [.8, .5])
  await expect(pad(page)).toHaveAttribute('data-strokes', '2')
  await page.getByRole('button', { name: 'Next word' }).click()
  await expect(page.getByTestId('deck-count')).toHaveText(/^2 \//)
  await expect(pad(page)).toHaveAttribute('data-strokes', '0')
  expect(await inkPixels(page)).toBe(0)
})

test('The listening card fits phone widths with usable touch targets, even for a long phrase', async ({ page }, testInfo) => {
  await openListening(page, '무슨 음식을 제일 좋아해요?')
  await draw(page, [.1, .4], [.3, .6])
  for (const name of ['Play pronunciation', 'Show meaning', 'Reveal word', 'Pen', 'Eraser', 'Undo', 'Clear all', 'Study this word']) {
    const box = await page.getByRole('button', { name, exact: true }).boundingBox()
    expect(box!.height, name).toBeGreaterThanOrEqual(44)
  }
  expect((await page.locator('.writing-surface').boundingBox())!.height).toBeGreaterThanOrEqual(110)
  await page.getByRole('button', { name: 'Show meaning' }).click()
  await page.getByRole('button', { name: 'Reveal word' }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `test-results/${testInfo.project.name}-listening-written.png`, fullPage: true, animations: 'disabled' })
})

test('The eraser hint steps aside so it never hides ink for long', async ({ page }) => {
  await openListening(page, '배워요')
  await draw(page, [.2, .1], [.8, .1])
  await page.getByRole('button', { name: 'Eraser', exact: true }).click()
  const hint = page.getByText('Tap or swipe over a stroke to erase it')
  await expect(hint).toBeVisible()
  await expect(hint).toHaveCount(0, { timeout: 4000 })
  await page.getByRole('button', { name: 'Pen', exact: true }).click()
  await page.getByRole('button', { name: 'Eraser', exact: true }).click()
  await expect(hint).toBeVisible()
  await tap(page, .9, .9)
  await expect(hint).toHaveCount(0)
})
