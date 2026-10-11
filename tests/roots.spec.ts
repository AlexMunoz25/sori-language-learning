import { expect, test, type Page } from '@playwright/test'
import { vocabulary } from '../src/data/vocabulary'
import { originReviews } from '../src/data/roots'

const byWord = (word: string) => vocabulary.find(item => item.korean === word)!
const related = (word: string) => byWord(word).roots?.related ?? []

async function openCard(page: Page, word: string, mode = 'standard') {
  const item = byWord(word)
  await page.addInitScript(({ id, category, mode }) => {
    sessionStorage.setItem('sori.session.v1', JSON.stringify({ category, mode, filter: 'all', order: [id], index: 0 }))
  }, { id: item.id, category: item.category, mode })
  await page.goto('/')
}

test('Verified connections explain the shared meaning and distinguish homophonous roots', () => {
  expect(related('학교')).toEqual(expect.arrayContaining([expect.objectContaining({ korean: '학생', connection: expect.stringContaining('學') })]))
  expect(related('학교').map(item => item.korean)).not.toContain('교실')
  expect(related('도서관')).toEqual(expect.arrayContaining([expect.objectContaining({ korean: '서점', connection: expect.stringContaining('writing / books') })]))
  expect(related('연필').map(item => item.korean)).toContain('필통')
  expect(related('의사').map(item => item.korean)).toEqual(expect.arrayContaining(['간호사', '약사', '요리사']))
  expect(related('의사').map(item => item.korean)).not.toContain('변호사')
  expect(related('변호사')).toEqual(expect.arrayContaining([expect.objectContaining({ korean: '간호사', connection: expect.stringContaining('護') })]))
  for (const [a, b] of [['공원', '공항'], ['공원', '병원'], ['안경', '경찰'], ['여행', '행복해요'], ['음식', '음악'], ['배우', '배워요'], ['배', '배구'], ['시계', '시장'], ['장소', '청소해요']]) {
    const first = originReviews[byWord(a).id].componentIds
    const second = originReviews[byWord(b).id].componentIds
    expect(first.filter(id => second.includes(id)), `${a} / ${b} must not share a fabricated component`).toEqual([])
  }
  expect(related('녹차').map(item => item.korean)).toContain('초록색')
  expect(related('홍차').map(item => item.korean)).toContain('분홍색')
  expect(related('들어요')).toEqual(expect.arrayContaining([expect.objectContaining({ korean: '걸어요', kind: 'pattern' })]))
})

test('Roots, Memory Anchor, pronunciation, and meaning reveal independently', async ({ page }, info) => {
  await openCard(page, '학교')
  await expect(page.getByTestId('roots')).toHaveCount(0)
  await expect(page.getByTestId('mnemonic')).toHaveCount(0)
  await page.getByRole('button', { name: 'Show roots', exact: true }).click()
  await expect(page.getByTestId('roots')).toContainText('學')
  await expect(page.getByTestId('related-words')).toContainText('학생')
  await expect(page.getByTestId('related-words')).toContainText('Shared Hanja')
  await expect(page.getByTestId('related-words')).toContainText('learning / study')
  await expect(page.getByTestId('mnemonic')).toHaveCount(0)
  await expect(page.getByTestId('meaning')).toHaveCount(0)
  await expect(page.getByTestId('pronunciation')).toHaveCount(0)
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  const first = byWord('학교').anchors[0]
  await page.getByTestId('anchor-option').first().click()
  await expect(page.getByTestId('mnemonic')).toHaveText(first.text)
  expect(first.kind).toBe('sound')
  await expect(page.getByText(`Phonetic mnemonic · ${first.language.toUpperCase()}`)).toBeVisible()
  await expect(page.getByText('Approximate sound association, not the word’s origin')).toBeVisible()
  await expect(page.getByTestId('meaning')).toHaveCount(0)
  await page.locator('.root-sources summary').click()
  await expect(page.getByRole('link', { name: 'NIKL Korean Basic Dictionary · 학교' })).toHaveAttribute('href', /ParaWordNo=73276/)
  await page.locator('.root-sources summary').click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `test-results/${info.project.name}-roots.png`, fullPage: true })
  await page.getByRole('button', { name: 'Show meaning', exact: true }).click()
  await page.getByRole('button', { name: 'Hide & try again' }).click()
  await expect(page.getByTestId('roots')).toHaveCount(0)
  await expect(page.getByTestId('mnemonic')).toHaveCount(0)
})

test('Listening leaves both memory layers to Learn, which opens them on the same word', async ({ page }) => {
  await openCard(page, '도서관', 'listening')
  await page.getByRole('button', { name: 'Reveal word' }).click()
  await expect(page.getByRole('button', { name: 'Show roots' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Show memory anchor' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Learn this word' }).click()
  await expect(page.getByTestId('korean-word')).toHaveText('도서관')
  await expect(page.getByTestId('anchor-option')).toHaveCount(3)
  await expect(page.getByTestId('roots')).toHaveCount(0)
  await page.getByRole('button', { name: 'Show roots' }).click()
  await expect(page.getByTestId('related-words')).toContainText('서점')
  await expect(page.getByTestId('meaning')).toHaveCount(0)
  await page.getByRole('button', { name: 'Next word' }).click()
  await expect(page.getByTestId('roots')).toHaveCount(0)
  await expect(page.getByTestId('anchor-option')).toHaveCount(0)
})

test('Every anchor candidate names its evidence type', () => {
  for (const item of vocabulary) for (const anchor of item.anchors) {
    expect(['sound', 'roots', 'loanword', 'reading'], `${item.id}#${anchor.id}`).toContain(anchor.kind)
  }
})

test('Word-part anchors are labelled as verified and explain the sound-alike marker', async ({ page }) => {
  await openCard(page, '날씨가 더워요')
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  const index = byWord('날씨가 더워요').anchors.findIndex(anchor => anchor.kind === 'roots' && anchor.text.includes('≈'))
  await page.getByTestId('anchor-option').nth(index).click()
  await expect(page.getByText('Verified word components')).toBeVisible()
  await expect(page.getByTestId('mnemonic')).toContainText('≈')
  await expect(page.getByText('≈ marks a sound-alike', { exact: false })).toBeVisible()
})

test('Unhelpful origins can be omitted without breaking study', async ({ page }) => {
  await openCard(page, '겨울')
  await expect(page.getByRole('button', { name: 'Show roots' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await expect(page.getByTestId('anchor-option')).toHaveCount(3)
  await page.getByRole('button', { name: 'Show pronunciation' }).click()
  await expect(page.getByTestId('pronunciation')).toHaveText('gyeo-ul')
  await page.getByRole('button', { name: 'Show meaning' }).click()
  await expect(page.getByTestId('meaning')).toHaveText('winter')
})

test('Long components and expanded sources stay within phone widths', async ({ page }, info) => {
  await openCard(page, '한국어를 배워요')
  for (const name of ['Show roots', 'Show memory anchor']) {
    const button = page.getByRole('button', { name, exact: true })
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await button.click()
  }
  await expect(page.getByTestId('roots')).toContainText('語')
  await page.locator('.root-sources summary').click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `test-results/${info.project.name}-phrase-roots.png`, fullPage: true })
})
