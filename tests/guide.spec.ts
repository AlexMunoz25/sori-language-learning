import { expect, test } from '@playwright/test'

test('The guide welcomes first-time visitors, stays dismissed on return, and can be reopened', async ({ page, context }) => {
  await page.goto('/')
  const guide = page.getByRole('dialog', { name: 'Make the sound stick' })
  await expect(guide).toBeVisible()
  await expect(guide.getByText('Hi, I’m Alex Marin', { exact: false })).toBeInViewport()
  await expect(guide.getByRole('link', { name: 'EigenAlex' })).toHaveAttribute('href', 'https://github.com/AlexMunoz25')
  await expect(guide.getByRole('button', { name: 'Close make the sound stick' })).toBeFocused()

  await guide.getByRole('button', { name: 'Close make the sound stick' }).click()
  await expect(guide).not.toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'A little, every day.' })).toBeVisible()
  await expect(guide).not.toBeVisible()

  const returnVisit = await context.newPage()
  await returnVisit.goto('/')
  await expect(returnVisit.getByRole('heading', { name: 'A little, every day.' })).toBeVisible()
  await expect(returnVisit.getByRole('dialog', { name: 'Make the sound stick' })).not.toBeVisible()
  await returnVisit.close()

  await page.getByRole('button', { name: 'How to study' }).click()
  await expect(guide).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(guide).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'How to study' })).toBeFocused()
})

test('The first-visit guide can be dismissed when browser storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage blocked') }
    Storage.prototype.setItem = () => { throw new Error('Storage blocked') }
  })
  await page.goto('/')
  const guide = page.getByRole('dialog', { name: 'Make the sound stick' })
  await expect(guide).toBeVisible()
  await guide.getByRole('button', { name: 'Close make the sound stick' }).click()
  await expect(guide).not.toBeVisible()
  await page.getByRole('button', { name: 'How to study' }).click()
  await expect(guide).toBeVisible()
})
