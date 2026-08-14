import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'

const require = createRequire(import.meta.url)
const axePath = require.resolve('axe-core/axe.min.js')
const baseUrl = process.env.QA_URL ?? 'http://127.0.0.1:5173/'
const outputDir = process.env.QA_OUTPUT_DIR ?? '/tmp/entrela-browser-qa'

const profiles = [
  { name: 'desktop', width: 1440, height: 1000, deviceScaleFactor: 1 },
  { name: 'tablet', width: 768, height: 1024, deviceScaleFactor: 1 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 1 },
]

const report = {
  url: baseUrl,
  generatedAt: new Date().toISOString(),
  profiles: [],
}

await mkdir(outputDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
})

try {
  for (const profile of profiles) {
    const page = await browser.newPage()
    const consoleErrors = []

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('pageerror', (error) => consoleErrors.push(error.message))

    await page.setViewport(profile)
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    await new Promise((resolve) => setTimeout(resolve, 2600))

    const layout = await page.evaluate(() => {
      const hero = document.querySelector('.hero')
      const content = document.querySelector('.hero-content')
      const closing = document.querySelector('.closing')
      const images = [...document.images]
      const visibleCards = [...document.querySelectorAll('.floating-card')].filter((card) => {
        const style = getComputedStyle(card)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })

      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        pageHeight: document.documentElement.scrollHeight,
        hero: hero?.getBoundingClientRect().toJSON(),
        content: content?.getBoundingClientRect().toJSON(),
        closing: closing?.getBoundingClientRect().toJSON(),
        visibleCardCount: visibleCards.length,
        unloadedImages: images
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute('src')),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      }
    })

    await page.addScriptTag({ path: axePath })
    const accessibility = await page.evaluate(async () => {
      const results = await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
        },
      })

      return results.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.length,
        targets: violation.nodes.map((node) => node.target.join(' ')),
      }))
    })

    await page.screenshot({
      path: `${outputDir}/${profile.name}-full.png`,
      fullPage: true,
    })

    const profileResult = {
      ...profile,
      layout,
      consoleErrors,
      accessibility,
    }

    if (profile.name === 'desktop') {
      await page.hover('.hero-primary-action')
      await new Promise((resolve) => setTimeout(resolve, 850))

      profileResult.reveal = await page.evaluate(() => ({
        active: document.querySelector('.hero')?.classList.contains('hero--awake'),
        word: document.querySelector('.rotating-word')?.textContent,
        clipPath: getComputedStyle(document.querySelector('.hero-reveal')).clipPath,
      }))

      await page.screenshot({
        path: `${outputDir}/desktop-reveal.png`,
        clip: { x: 0, y: 0, width: profile.width, height: profile.height },
      })
    }

    report.profiles.push(profileResult)
    await page.close()
  }
} finally {
  await browser.close()
}

await writeFile(`${outputDir}/report.json`, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
