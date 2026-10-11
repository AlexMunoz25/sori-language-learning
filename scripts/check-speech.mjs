import { chromium } from '@playwright/test'

// An actual browser/device integration probe. This does not mock or generate audio.
const browser = await chromium.launch({ channel: 'chrome', headless: !process.argv.includes('--headed') })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.addInitScript(() => {
    window.__speechProbe = []
    const original = speechSynthesis.speak.bind(speechSynthesis)
    speechSynthesis.speak = utterance => {
      const record = { text: utterance.text, language: utterance.lang, rate: utterance.rate, voice: utterance.voice?.name ?? 'browser default', events: [] }
      window.__speechProbe.push(record)
      utterance.addEventListener('start', () => record.events.push('start'))
      utterance.addEventListener('end', () => record.events.push('end'))
      utterance.addEventListener('error', event => record.events.push(`error:${event.error}`))
      original(utterance)
    }
    sessionStorage.setItem('sori.session.v1', JSON.stringify({ category: 'Verbs', mode: 'standard', filter: 'all', order: ['Verbs:배워요'], index: 0 }))
  })
  await page.goto('http://localhost:5173')
  await page.waitForTimeout(1000)
  const voices = await page.evaluate(() => speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('ko')).map(voice => ({ name: voice.name, lang: voice.lang, local: voice.localService })))
  console.log('Available Korean voices:', JSON.stringify(voices))
  console.log('Autoplay calls:', await page.evaluate(() => window.__speechProbe.length))
  for (const label of ['Play pronunciation', 'Play slowly']) {
    await page.getByRole('button', { name: label, exact: true }).click()
    await page.waitForFunction(() => window.__speechProbe.at(-1)?.events.some(event => event === 'end' || event.startsWith('error:')), undefined, { timeout: 15000 }).catch(() => {})
  }
  const result = await page.evaluate(() => window.__speechProbe)
  console.log('Native speech events:', JSON.stringify(result, null, 2))
  if (!result.every(record => record.events.includes('start') && record.events.includes('end'))) process.exitCode = 1
} finally { await browser.close() }
