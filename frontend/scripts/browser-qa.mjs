import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'

const require = createRequire(import.meta.url)
const axePath = require.resolve('axe-core/axe.min.js')
const baseUrl = (process.env.QA_URL ?? 'http://127.0.0.1:5173').replace(/\/$/, '')
const outputDir = process.env.QA_OUTPUT_DIR ?? '/tmp/entrela-browser-qa'

const allPages = [
  { name: 'home', path: '/' },
  { name: 'login', path: '/entrar' },
  { name: 'painel', path: '/painel' },
  { name: 'criar', path: '/rascunho' },
  { name: 'editar', path: '/editar' },
  { name: 'configuracoes', path: '/configuracoes/conta' },
  { name: 'preview', path: '/pre-visualizacao' },
  { name: 'publico', path: '/publico/token-publico-de-auditoria-1234567890' },
]

const requestedPages = new Set((process.env.QA_PAGES ?? '').split(',').filter(Boolean))
const pages = requestedPages.size > 0
  ? allPages.filter((page) => requestedPages.has(page.name))
  : allPages

const profiles = [
  { name: 'desktop', width: 1440, height: 1000, deviceScaleFactor: 1 },
  { name: 'tablet', width: 768, height: 1024, deviceScaleFactor: 1 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 1 },
]

const report = {
  url: baseUrl,
  generatedAt: new Date().toISOString(),
  pages: [],
}

async function auditarComponente(page, selector) {
  return page.evaluate(async (alvo) => {
    const elemento = document.querySelector(alvo)
    if (!elemento) return [{ id: 'componente-ausente', targets: [alvo] }]
    const results = await window.axe.run(elemento, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    })
    return results.violations.map((violation) => ({
      id: violation.id,
      targets: violation.nodes.map((node) => node.target.join(' ')),
    }))
  }, selector)
}

await mkdir(outputDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
})

try {
  for (const pageDefinition of pages) {
    const pageReport = { ...pageDefinition, profiles: [] }

    for (const profile of profiles) {
      const page = await browser.newPage()
      const consoleErrors = []

      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text())
      })
      page.on('pageerror', (error) => consoleErrors.push(error.message))

      if (pageDefinition.name === 'publico' || pageDefinition.name === 'criar') {
        await page.setRequestInterception(true)
        page.on('request', (request) => {
          const url = new URL(request.url())
          if (pageDefinition.name === 'criar' && request.method() === 'POST' && url.pathname === '/v1/momentos') {
            request.respond({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({ dados: { estado: 'RASCUNHO', momentoId: '00000000-0000-7000-8000-000000000001', versaoDeRascunhoId: '00000000-0000-7000-8000-000000000002' }, metadados: { idDaRequisicao: 'qa', versaoDaAPI: 'v1' } }),
            })
          } else if (pageDefinition.name === 'criar' && request.method() === 'POST' && url.pathname.endsWith('/ficheiros/uploads')) {
            request.respond({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({ dados: { estado: 'PENDENTE', expiraEm: '2026-08-27T20:00:00.000Z', ficheiroId: '00000000-0000-7000-8000-000000000003', upload: { campos: { 'Content-Type': 'image/png' }, url: `${baseUrl}/media-local/uploads` } }, metadados: { idDaRequisicao: 'qa', versaoDaAPI: 'v1' } }),
            })
          } else if (pageDefinition.name === 'criar' && request.method() === 'PUT' && url.pathname === '/media-local/uploads') {
            request.respond({ status: 204 })
          } else if (pageDefinition.name === 'criar' && request.method() === 'POST' && url.pathname.endsWith('/confirmacoes')) {
            request.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ dados: { estado: 'PRONTO', ficheiroId: '00000000-0000-7000-8000-000000000003' }, metadados: { idDaRequisicao: 'qa', versaoDaAPI: 'v1' } }),
            })
          } else if (pageDefinition.name === 'criar' && request.method() === 'PATCH' && url.pathname.startsWith('/v1/momentos/')) {
            request.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ dados: { estado: 'RASCUNHO', momentoId: '00000000-0000-7000-8000-000000000001', versaoId: '00000000-0000-7000-8000-000000000002' }, metadados: { idDaRequisicao: 'qa', versaoDaAPI: 'v1' } }),
            })
          } else if (pageDefinition.name === 'publico' && url.pathname.endsWith('/abrir')) {
            request.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ dados: { estado: 'ATIVA', etapa: { chave: 'revelacao-final', final: true, ordem: 1, texto: 'Este momento foi preparado com cuidado.' } }, metadados: { idDaRequisicao: 'qa', versaoDaAPI: 'v1' } }),
            })
          } else if (pageDefinition.name === 'publico' && url.pathname.endsWith('/continuar')) {
            request.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ dados: { estado: 'CONCLUIDA', repetida: false }, metadados: { idDaRequisicao: 'qa', versaoDaAPI: 'v1' } }),
            })
          } else if (pageDefinition.name === 'publico' && request.url().includes('/momento/token-publico-de-auditoria-1234567890')) {
            request.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ dados: { capa: { tipo: 'COR', corHexadecimal: '#D8BFD8' }, estado: 'DISPONIVEL', modeloEditorial: 'CARTA_INTIMA', titulo: 'Uma carta para quando precisares' }, metadados: { idDaRequisicao: 'qa', versaoDaAPI: 'v1' } }),
            })
          } else request.continue()
        })
      }

      await page.setViewport(profile)
      await page.goto(`${baseUrl}${pageDefinition.path}`, { waitUntil: 'networkidle0' })
      await new Promise((resolve) => setTimeout(resolve, 1600))

      const layout = await page.evaluate(() => {
        const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect().toJSON() ?? null
        const images = [...document.images]

        return {
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
          pageHeight: document.documentElement.scrollHeight,
          main: rect('main'),
          hero: rect('.hero'),
          heroContent: rect('.hero-content'),
          authCard: rect('.auth-card'),
          dashboard: rect('.dashboard-main'),
          creationLayout: rect('.creation-layout'),
          editorWorkspace: rect('.editor-workspace'),
          settings: rect('.settings-main'),
          publicExperience: rect('.public-experience__main'),
          headerBrand: rect('.brand-mark'),
          internalBrand: rect('.internal-brand'),
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
          details: violation.nodes.map((node) => node.failureSummary),
        }))
      })

      await page.screenshot({
        path: `${outputDir}/${pageDefinition.name}-${profile.name}-full.png`,
        fullPage: true,
      })

      const profileResult = {
        ...profile,
        layout,
        consoleErrors,
        accessibility,
      }

      if (pageDefinition.name === 'home') {
        await page.evaluate(() => document.querySelector('.closing')?.scrollIntoView({ block: 'center' }))
        await new Promise((resolve) => setTimeout(resolve, 1000))

        profileResult.closing = await page.evaluate(() => ({
          visible: document.querySelector('.closing')?.classList.contains('closing--visible'),
          titleOpacity: getComputedStyle(document.querySelector('.closing h2')).opacity,
        }))

        await page.screenshot({
          path: `${outputDir}/${pageDefinition.name}-${profile.name}-closing.png`,
          fullPage: false,
        })

        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
        await new Promise((resolve) => setTimeout(resolve, 250))
      }

      if (pageDefinition.name === 'home' && profile.name === 'desktop') {
        const visualThemes = [
          { name: 'celebrar', selector: '.hero-example--celebrar', word: 'momento' },
          { name: 'surpreender', selector: '.hero-example--surpreender', word: 'presente' },
          { name: 'convidar', selector: '.hero-example--convidar', word: 'convite' },
        ]

        profileResult.visualThemes = []

        for (const theme of visualThemes) {
          await page.hover(theme.selector)
          await new Promise((resolve) => setTimeout(resolve, 900))

          const state = await page.evaluate(() => ({
            heroClass: document.querySelector('.hero')?.className,
            word: document.querySelector('.rotating-word')?.textContent,
            visibleCards: [...document.querySelectorAll('.floating-card')]
              .filter((card) => Number(getComputedStyle(card).opacity) > 0.8)
              .length,
          }))

          profileResult.visualThemes.push({ ...theme, ...state })
          await page.screenshot({
            path: `${outputDir}/${pageDefinition.name}-desktop-${theme.name}.png`,
            fullPage: false,
          })
        }
      }

      if (pageDefinition.name === 'painel') {
        await page.evaluate(() => [...document.querySelectorAll('.segmented-control button')]
          .find((button) => button.textContent?.trim() === 'Modelos')?.click())
        await new Promise((resolve) => setTimeout(resolve, 120))
        profileResult.library = await page.evaluate(() => ({
          cards: document.querySelectorAll('.template-card').length,
          heading: document.querySelector('.dashboard-library h2')?.textContent,
        }))
        if (profile.name === 'desktop') {
          await page.click('button[aria-label="Notificações"]')
          profileResult.notificationsPopover = await page.evaluate(() => ({
            expanded: document.querySelector('button[aria-label="Notificações"]')?.getAttribute('aria-expanded'),
            open: Boolean(document.querySelector('.internal-notifications')),
          }))
          profileResult.notificationsPopover.accessibility = await auditarComponente(page, '.internal-notifications')
          await page.screenshot({ path: `${outputDir}/painel-desktop-popover-notificacoes.png`, fullPage: false })
          await page.keyboard.press('Escape')
        }
      }

      if (pageDefinition.name === 'criar') {
        await page.type('.creation-title-input', 'Uma memória para ti')
        await page.type('.creation-block--recipient input', 'Ana')
        profileResult.creation = await page.evaluate(() => ({
          title: document.querySelector('.creation-title-input')?.value,
          recipient: document.querySelector('.creation-block--recipient input')?.value,
          coverCopy: document.querySelector('.cover-preview__copy strong')?.textContent,
        }))
        if (profile.name === 'desktop') {
          await page.click('.cover-preview')
          const coverInput = await page.$('.modal-upload-option input[type="file"]')
          await coverInput.uploadFile('../referencias/luma-login/login-mobile-390x844.png')
          await new Promise((resolve) => setTimeout(resolve, 180))
          profileResult.creationCover = await page.evaluate(() => ({
            file: document.querySelector('.modal-upload-option strong')?.textContent,
            preview: document.querySelector('.cover-preview')?.classList.contains('cover-preview--image'),
          }))
          await page.keyboard.press('Escape')
          await page.evaluate(() => document.querySelector('.creation-form__meta .chip-button:last-child')?.click())
          await new Promise((resolve) => setTimeout(resolve, 220))
          profileResult.creationModal = await page.evaluate(() => ({
            open: Boolean(document.querySelector('[role="dialog"]')),
            title: document.querySelector('.entrela-modal h2')?.textContent,
          }))
          profileResult.creationModal.accessibility = await auditarComponente(page, '.entrela-modal')
          await page.screenshot({ path: `${outputDir}/criar-desktop-modal-acesso.png`, fullPage: false })
          await page.keyboard.press('Escape')
          await page.click('.primary-wide-button')
          await page.waitForFunction(() => window.location.pathname === '/editar')
          await new Promise((resolve) => setTimeout(resolve, 220))
          profileResult.creationFlow = await page.evaluate(() => ({
            path: window.location.pathname,
            editorTitle: document.querySelector('.editor-toolbar strong')?.textContent,
            recipient: document.querySelector('.editor-cover-mini strong')?.textContent,
          }))
        }
      }

      if (pageDefinition.name === 'editar') {
        profileResult.editor = await page.evaluate(() => ({
          steps: document.querySelectorAll('.editor-outline li').length,
          title: document.querySelector('.editor-step-title')?.value,
        }))
        if (profile.name === 'desktop') {
          await page.click('.editor-publish-card button')
          await new Promise((resolve) => setTimeout(resolve, 220))
          profileResult.publicationModal = await page.evaluate(() => ({
            open: Boolean(document.querySelector('[role="dialog"]')),
            checks: document.querySelectorAll('.publication-checklist > div').length,
          }))
          profileResult.publicationModal.accessibility = await auditarComponente(page, '.entrela-modal')
          await page.screenshot({ path: `${outputDir}/editar-desktop-modal-publicacao.png`, fullPage: false })
          await page.click('.entrela-modal__footer .dark-button')
          await new Promise((resolve) => setTimeout(resolve, 220))
          profileResult.publicationFlow = await page.evaluate(() => ({
            open: Boolean(document.querySelector('[role="dialog"]')),
            title: document.querySelector('.entrela-modal h2')?.textContent,
            state: document.querySelector('.save-state')?.textContent,
          }))
          profileResult.publicationFlow.accessibility = await auditarComponente(page, '.entrela-modal')
          await page.screenshot({ path: `${outputDir}/editar-desktop-modal-sucesso.png`, fullPage: false })
        }
      }

      if (pageDefinition.name === 'configuracoes' && profile.name === 'desktop') {
        await page.evaluate(() => [...document.querySelectorAll('.definition-row__control button')]
          .find((button) => button.textContent?.trim() === 'Gerir')?.click())
        await new Promise((resolve) => setTimeout(resolve, 180))
        profileResult.sessionModal = await page.evaluate(() => ({
          open: Boolean(document.querySelector('[role="dialog"]')),
          title: document.querySelector('.entrela-modal h2')?.textContent,
          devices: document.querySelectorAll('.session-device-card').length,
        }))
        profileResult.sessionModal.accessibility = await auditarComponente(page, '.entrela-modal')
        await page.screenshot({ path: `${outputDir}/configuracoes-desktop-modal-sessao.png`, fullPage: false })
        await page.keyboard.press('Escape')
      }

      if (pageDefinition.name === 'publico' && profile.name === 'desktop') {
        await page.click('.public-open-button')
        await page.waitForSelector('.public-story')
        profileResult.recipientFlow = await page.evaluate(() => ({
          opened: Boolean(document.querySelector('.public-story')),
          title: document.querySelector('.public-story__copy h1')?.textContent,
        }))
        await page.click('.public-story__continue')
        await page.waitForSelector('#completed-title')
        profileResult.recipientFlow.completed = await page.$eval('#completed-title', (element) => element.textContent)
      }

      pageReport.profiles.push(profileResult)
      await page.close()
    }

    report.pages.push(pageReport)
  }
} finally {
  await browser.close()
}

await writeFile(`${outputDir}/report.json`, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
