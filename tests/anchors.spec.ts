import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { rootParts } from '../src/data/root-anchors'
import { vocabulary } from '../src/data/vocabulary'
import { defaultLanguages, fitsLanguages } from '../src/hooks/useLanguages'
import type { VocabularyItem } from '../src/types/vocabulary'

const byWord = (word: string) => vocabulary.find(item => item.korean === word)!
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()

async function openCard(page: Page, word: string, anchors?: unknown) {
  const item = byWord(word)
  // Seed once per test, so reloads keep whatever the page saved.
  await page.addInitScript(({ id, category, anchors }) => {
    localStorage.setItem('sori.guideSeen.v1', 'true')
    if (sessionStorage.getItem('test.seeded')) return
    sessionStorage.setItem('test.seeded', 'true')
    sessionStorage.setItem('sori.session.v1', JSON.stringify({ category, mode: 'standard', filter: 'all', order: [id], index: 0 }))
    if (anchors !== undefined) localStorage.setItem('sori.anchors.v1', typeof anchors === 'string' ? anchors : JSON.stringify(anchors))
  }, { id: item.id, category: item.category, anchors })
  await page.goto('/')
  return item
}
const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sori.anchors.v1') ?? '{}'))
/** What the chooser lists for a learner of English, Spanish, and French; other languages wait one tap away. */
const shown = (item: VocabularyItem) => item.anchors.filter(anchor => fitsLanguages(anchor, defaultLanguages))

test('Every word offers three ways it sounds (two when a third would be weak), one way Korean builds it, and up to two real moments', () => {
  for (const item of vocabulary) {
    // Italian, Portuguese, and German speakers get one more hook on some cards (it1, pt1, de1).
    const extra = item.anchors.filter(anchor => /^(it|pt|de)\d$/.test(anchor.id))
    const own = item.anchors.filter(anchor => !extra.includes(anchor))
    const sounds = own.filter(anchor => ['sound', 'reading', 'loanword'].includes(anchor.kind))
    expect(sounds.length, item.id).toBeGreaterThanOrEqual(2)
    expect(sounds.length, item.id).toBeLessThanOrEqual(3)
    expect(own.filter(anchor => anchor.kind === 'roots' || anchor.kind === 'pattern'), item.id).toHaveLength(1)
    expect(own.filter(anchor => anchor.kind === 'culture').length, item.id).toBeLessThanOrEqual(2)
    expect(new Set(item.anchors.map(anchor => anchor.id)).size, item.id).toBe(item.anchors.length)
    expect(new Set(item.anchors.map(anchor => anchor.text)).size, item.id).toBe(item.anchors.length)
    for (const anchor of extra) expect(anchor.id, item.id).toBe(`${anchor.language}1`)
  }
  // Most words have all three sound hooks.
  const three = vocabulary.filter(item => item.anchors.filter(anchor => !/^(it|pt|de)\d$/.test(anchor.id) && ['sound', 'reading', 'loanword'].includes(anchor.kind)).length === 3)
  expect(three.length).toBeGreaterThan(vocabulary.length * 0.45)
  // Five-star anchors are kept verbatim as the default.
  expect(byWord('멀어요').anchors.find(anchor => anchor.preselected)?.text).toContain('MORDOR')
  expect(byWord('밝아요').anchors.find(anchor => anchor.preselected)?.text).toContain('BULB')
})

test('Words with meaningful parts offer one candidate that explains them, without breaking what was rated', () => {
  const rootAnchor = (word: string) => byWord(word).anchors.find(anchor => anchor.kind === 'roots' && rootParts(anchor.text))
  const parted = vocabulary.filter(item => item.anchors.some(anchor => anchor.kind === 'roots' && rootParts(anchor.text)))
  expect(parted.length).toBeGreaterThanOrEqual(120)
  // The learner's own example, rated five stars, is the default for 말해요.
  expect(byWord('말해요').anchors.find(anchor => anchor.preselected)?.text).toBe('말 mal = WORDS + 해요 hae-yo = DO → doing speech: to speak.')
  expect(rootParts(rootAnchor('공항')!.text)?.parts).toEqual([
    { korean: '공', hanja: '空', reading: 'gong', meaning: 'AIR' }, { korean: '항', hanja: '港', reading: 'hang', meaning: 'PORT' },
  ])
  // Rated anchors stay: five stars as the default, four stars as candidate 1.
  expect(byWord('형용사').anchors.find(anchor => anchor.preselected)?.text).toContain('HUGE, YOUNG, SAD')
  expect(byWord('재미없어요').anchors.find(anchor => anchor.preselected)?.text).toContain('OOPS')
  expect(byWord('재미있어요').anchors[0].text).toContain('JAMMING')
  expect(byWord('똑같아요').anchors[0].text).toContain('TikTOK')
  // A shared sound is never a shared root: 공원's 공 is 公, public, not 空 (air) of 공항; 병원's 원 is not 공원's 園.
  expect(rootAnchor('공원')!.text).toContain('公')
  expect(rootAnchor('공원')!.text).not.toContain('空')
  expect(rootAnchor('병원')!.text).toContain('Not 공원\'s 원 (園)')
  // No breakdown is forced where the record has none.
  for (const word of ['예뻐요', '사과', '김치', '어머니', '남편']) expect(rootAnchor(word), word).toBeUndefined()
})

test('A root-based anchor shows each part on its own line, with the same words', async ({ page }) => {
  const item = await openCard(page, '말해요')
  const anchor = item.anchors.find(candidate => candidate.preselected)!
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await expect(page.getByTestId('mnemonic')).toHaveText(anchor.text)
  await expect(page.getByText('Verified word components')).toBeVisible()
  await expect(page.getByTestId('mnemonic').locator('.root-korean')).toHaveText(['말', '해요'])
  await expect(page.getByTestId('mnemonic').locator('.root-meaning')).toHaveText(['WORDS', 'DO'])
  const lines = await page.getByTestId('mnemonic').locator('.root-part, .root-gloss').evaluateAll(parts => parts.map(part => part.getBoundingClientRect().top))
  expect(new Set(lines).size).toBe(3)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('The candidates show until one is chosen; the choice persists and Change brings the others back', async ({ page }) => {
  const item = await openCard(page, '배워요')
  const pick = shown(item).filter(anchor => anchor.kind === 'sound')[1]
  const option = () => page.getByTestId('anchor-option').filter({ hasText: pick.text })
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await expect(page.getByTestId('anchor-option')).toHaveCount(shown(item).length)
  await expect(page.getByTestId('anchor-chooser').getByText('Pick the one that sticks')).toBeVisible()
  await option().click()
  await expect(page.getByTestId('anchor-option')).toHaveCount(0)
  await expect(page.getByTestId('mnemonic')).toHaveText(pick.text)
  expect((await stored(page))[item.id]).toMatchObject({ selected: pick.id })

  await page.reload()
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await expect(page.getByTestId('mnemonic')).toHaveText(pick.text)
  await page.getByRole('button', { name: 'Change memory anchor' }).click()
  await expect(page.getByTestId('anchor-option')).toHaveCount(shown(item).length)
  await expect(option()).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Keep current' }).click()
  await expect(page.getByTestId('mnemonic')).toHaveText(pick.text)
})

test('A five-star anchor starts selected and can still be changed', async ({ page }) => {
  const item = await openCard(page, '멀어요')
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await expect(page.getByTestId('anchor-option')).toHaveCount(0)
  await expect(page.getByTestId('mnemonic')).toHaveText(item.anchors.find(anchor => anchor.preselected)!.text)
  await page.getByRole('button', { name: 'Change memory anchor' }).click()
  await page.getByTestId('anchor-option').nth(2).click()
  await expect(page.getByTestId('mnemonic')).toHaveText(item.anchors[2].text)
})

test('Ratings, your own anchor, and requests for new ideas are saved', async ({ page }) => {
  const item = await openCard(page, '예뻐요')
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await page.getByTestId('anchor-option').first().click()
  await page.getByRole('button', { name: 'Rate 4 of 5' }).click()
  await expect(page.getByRole('button', { name: 'Rate 4 of 5' })).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: 'Change memory anchor' }).click()
  await page.getByRole('button', { name: 'None of these work?' }).click()
  await page.getByRole('button', { name: 'Ask for new ideas' }).click()
  await expect(page.getByRole('button', { name: 'New ideas requested' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Write my own' }).click()
  await page.getByLabel(`What does ${item.korean} sound like to you?`).fill('YEP-PO: my own picture')
  await page.getByRole('button', { name: 'Save and use it' }).click()
  await expect(page.getByTestId('mnemonic')).toHaveText('YEP-PO: my own picture')
  await expect(page.getByText('Your own anchor')).toBeVisible()

  expect((await stored(page))[item.id]).toMatchObject({
    selected: 'custom', custom: 'YEP-PO: my own picture', ratings: { [item.anchors[0].id]: 4 }, wantsNew: true,
  })
})

test('Recall checks come after 1, 3, and 7 days and nudge, never switch, when an anchor keeps failing', async ({ page }) => {
  const item = byWord('달라요')
  await openCard(page, '달라요', { [item.id]: {
    selected: item.anchors[0].id, selectedAt: daysAgo(3),
    checks: [{ anchor: item.anchors[0].id, day: 1, at: daysAgo(2), recalled: false }],
  } })
  await page.getByRole('button', { name: 'Show meaning' }).click()
  await expect(page.getByTestId('recall-check')).toContainText('Day 3')
  await page.getByRole('button', { name: 'Forgot' }).click()
  await expect(page.getByTestId('recall-check')).toHaveCount(0)

  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await expect(page.getByTestId('anchor-nudge')).toBeVisible()
  await expect(page.getByTestId('mnemonic')).toHaveText(item.anchors[0].text)
  const record = (await stored(page))[item.id]
  expect(record.selected).toBe(item.anchors[0].id)
  expect(record.checks.map((check: { day: number; recalled: boolean }) => [check.day, check.recalled])).toEqual([[1, false], [3, false]])
  await page.getByRole('button', { name: 'Try another?' }).click()
  await expect(page.getByTestId('anchor-option')).toHaveCount(shown(item).length)
})

test('No recall check before the first day, and none twice for the same checkpoint', async ({ page }) => {
  const item = byWord('달라요')
  await openCard(page, '달라요', { [item.id]: { selected: item.anchors[0].id, selectedAt: new Date().toISOString() } })
  await page.getByRole('button', { name: 'Show meaning' }).click()
  await expect(page.getByTestId('meaning')).toBeVisible()
  await expect(page.getByTestId('recall-check')).toHaveCount(0)
})

test('Anchor feedback downloads as JSON for the next round of improvements', async ({ page }) => {
  const item = byWord('달라요')
  await openCard(page, '달라요', { [item.id]: { selected: item.anchors[1].id, selectedAt: daysAgo(2), ratings: { [item.anchors[1].id]: 5 }, wantsNew: true } })
  await page.getByRole('button', { name: 'How to study' }).click()
  await expect(page.getByText('1 chosen · 1 rated · 0 recall checks · 0 tested with an anchor · 1 asking for new ideas')).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download anchor feedback' }).click()
  const file = await (await download).path()
  const feedback = JSON.parse(readFileSync(file, 'utf8'))
  expect(feedback).toMatchObject({ kind: 'memory-anchor-feedback', languages: ['en', 'es', 'fr'], summary: { chosen: 1, rated: 1, wantNewIdeas: 1 } })
  expect(feedback.cards[0]).toMatchObject({ id: item.id, selected: item.anchors[1].id, selectedText: item.anchors[1].text, ratings: { [item.anchors[1].id]: 5 } })
})

test('Corrupted anchor storage falls back to choosing', async ({ page }) => {
  const item = await openCard(page, '배워요', '{broken')
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await expect(page.getByTestId('anchor-option')).toHaveCount(shown(item).length)
  await page.getByTestId('anchor-option').first().click()
  await expect(page.getByTestId('mnemonic')).toBeVisible()
})
