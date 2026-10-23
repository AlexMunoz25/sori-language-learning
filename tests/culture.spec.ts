import { expect, test, type Page } from '@playwright/test'
import { cards } from '../src/data/cards'
import { clock, videoId } from '../src/data/culture-anchors'
import { acceptedTexts } from '../src/recall/english'
import { meaningTerms, mentions, readingSyllables } from '../src/recall/hints'
import { gapAnswer, questionRuleById } from '../src/recall/questionRules'
import type { VocabularyItem } from '../src/types/vocabulary'

const moments = cards.flatMap(item => item.anchors.filter(anchor => anchor.kind === 'culture').map(anchor => ({ item, anchor })))
// A song with a checked start, an embeddable official audio, and a music video: the full player.
const full = moments.find(({ anchor }) => anchor.source!.start !== undefined && anchor.source!.embed && anchor.source!.video) ?? moments[0]
const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sori.anchors.v1') ?? '{}'))

/** Opens a card in the Library. YouTube is never contacted: requests are recorded and answered locally. */
async function openCard(page: Page, item: VocabularyItem) {
  const youtube: string[] = []
  await page.route(/youtube(-nocookie)?\.com/, route => {
    youtube.push(route.request().url())
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>player</body></html>' })
  })
  await page.addInitScript(({ id, category }) => {
    localStorage.setItem('sori.guideSeen.v1', 'true')
    if (sessionStorage.getItem('test.seeded')) return
    sessionStorage.setItem('test.seeded', 'true')
    sessionStorage.setItem('sori.session.v1', JSON.stringify({ category, destination: 'library', mode: 'standard', filter: 'all', order: [id], index: 0 }))
  }, { id: item.id, category: item.category })
  await page.goto('/')
  return youtube
}

test.describe('Media moments, as data', () => {
  test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== 'desktop', 'Pure logic runs once') })

  test('Each moment is a real line with its evidence, in the card’s own words', () => {
    expect(moments.length).toBeGreaterThan(0)
    for (const { item, anchor } of moments) {
      const source = anchor.source!
      const where = `${item.id}#${anchor.id}`
      expect(anchor.id, where).toMatch(/^c[12]$/)
      expect(gapAnswer({ korean: source.quote }), where).not.toBe('')
      expect(source.translation, where).not.toMatch(/[가-힣]/)
      expect(source.url, where).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/)
      // A song's line is in its timed lyrics; a start second also needs the upload's length to match the timed track.
      if (source.media === 'song') expect(source.evidence.some(proof => /^lrclib:\d+@/.test(proof)), where).toBe(true)
      else expect(source.evidence.some(proof => proof.startsWith('https://')), where).toBe(true)
      if (source.start !== undefined) expect(source.evidence.some(proof => proof.startsWith('length:')), where).toBe(true)
    }
    // At most two per card, numbered in order.
    for (const item of cards) {
      const ids = item.anchors.filter(anchor => anchor.kind === 'culture').map(anchor => anchor.id)
      expect(ids, item.id).toEqual(['c1', 'c2'].slice(0, ids.length))
    }
  })

  test('A moment’s hints never give the word away: its English line with the meaning blanked, or its English title', () => {
    const koToEn = questionRuleById.get('korean-to-english')!
    const enToKo = questionRuleById.get('english-to-korean')!
    for (const { item, anchor } of moments) {
      const context = { anchor: { text: anchor.text, kind: anchor.kind, own: false, source: anchor.source } }
      const terms = meaningTerms(acceptedTexts(item)).filter(term => term.length >= 3)
      for (const hint of koToEn.hints(item, context)) {
        expect(hint.text, `${item.id} ${hint.text}`).not.toMatch(/[가-힣]/)
        expect(mentions(hint.text, terms), `${item.id} ${hint.text}`).toBe(false)
      }
      if (item.section !== 'vocabulary') continue
      const reading = readingSyllables(item)
      for (const hint of enToKo.hints(item, context)) {
        expect(hint.text, `${item.id} ${hint.text}`).not.toMatch(/[가-힣]/)
        expect(hint.text.toLowerCase().split(/[^a-z]+/).filter(word => reading.includes(word) && word.length >= 3), `${item.id} ${hint.text}`).toEqual([])
      }
    }
    // The moment is offered as a hint: who sings it, and the line with the meaning blanked.
    const { item, anchor } = full
    const hint = koToEn.hints(item, { anchor: { text: anchor.text, kind: anchor.kind, own: false, source: anchor.source } }).find(entry => entry.kind === 'anchor')
    if (hint) expect(hint.text).toContain(anchor.source!.by)
  })
})

test('The chooser groups candidates by kind, and a moment plays only when asked', async ({ page }) => {
  const { item, anchor } = full
  const source = anchor.source!
  const youtube = await openCard(page, item)
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  for (const group of ['sound', 'korean', 'culture']) await expect(page.getByTestId(`anchor-group-${group}`)).toBeVisible()
  await expect(page.getByTestId('anchor-group-sound').getByText('Sounds like')).toBeVisible()
  await expect(page.getByTestId('anchor-group-culture').getByText('Heard in Korean media')).toBeVisible()

  const moment = page.getByTestId('anchor-group-culture').locator('li').filter({ hasText: source.translation })
  await expect(moment.getByTestId('anchor-option').locator('mark')).toHaveText(gapAnswer({ korean: source.quote }))
  // Nothing comes from YouTube until play is pressed.
  await expect(page.getByTestId('culture-frame')).toHaveCount(0)
  expect(youtube).toEqual([])
  if (!source.embed) return
  const play = moment.getByRole('button', { name: new RegExp(`^Play .*${source.start !== undefined ? ` from ${clock(source.start)}` : ''}$`) })
  await play.click()
  const frame = moment.getByTestId('culture-frame')
  await expect(frame).toHaveAttribute('src', new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${videoId(source.url)}\\?autoplay=1&rel=0${source.start !== undefined ? `&start=${source.start}` : ''}$`))
  // Playing it doesn't choose it.
  await expect(moment.getByTestId('anchor-option')).toHaveAttribute('aria-pressed', 'false')
  await moment.getByRole('button', { name: /^Close the player/ }).click()
  await expect(page.getByTestId('culture-frame')).toHaveCount(0)
  if (source.video) await expect(moment.getByRole('link', { name: /^Watch the music video/ })).toHaveAttribute('href', source.video)
})

test('A chosen moment stays chosen, with its line, title, and player, across reloads', async ({ page }) => {
  const { item, anchor } = full
  const source = anchor.source!
  await openCard(page, item)
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await page.getByTestId('anchor-group-culture').getByTestId('anchor-option').filter({ hasText: source.translation }).click()
  expect((await stored(page))[item.id]).toMatchObject({ selected: anchor.id })
  const check = async () => {
    const mnemonic = page.getByTestId('mnemonic')
    await expect(mnemonic.locator('mark')).toHaveText(gapAnswer({ korean: source.quote }))
    await expect(mnemonic).toContainText(source.translation)
    await expect(mnemonic).toContainText(source.why)
    await expect(mnemonic).toContainText(source.by)
    await expect(page.getByTestId('culture-player')).toBeVisible()
    await expect(page.getByText(/A real moment, not an invented association/)).toBeVisible()
  }
  await check()
  await page.reload()
  await page.getByRole('button', { name: 'Show memory anchor' }).click()
  await check()
})
