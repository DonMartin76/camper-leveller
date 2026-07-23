// Captures reference screenshots of the app on a standard iPhone 17 viewport.
//
// Usage:
//   npm run screenshots
//
// It starts its own Vite dev server (unless SCREENSHOT_URL is set), opens a
// Chromium browser (Playwright's bundled build, falling back to an installed
// Google Chrome / Edge), and writes PNGs into the gitignored screenshots/ folder:
//   - portrait.png         the "rotate your phone" notice
//   - landscape-idle.png   the pre-measurement landscape view
//   - landscape-active.png the live guidance with a representative tilt applied
//
// Requires either `npx playwright install chromium` once, or Google Chrome installed.

import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

// iPhone 17 (6.3" display, 2622x1206 physical @ ~3x) -> 402x874 CSS points.
const IPHONE_17 = {
  portrait: { width: 402, height: 874 },
  landscape: { width: 874, height: 402 },
  deviceScaleFactor: 3,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
}

const PORT = 5199
const BASE_URL = process.env.SCREENSHOT_URL ?? `http://127.0.0.1:${PORT}/`
const OUT_DIR = resolve('screenshots')

async function launchBrowser() {
  const attempts = [{}, { channel: 'chrome' }, { channel: 'msedge' }]
  let lastError
  for (const options of attempts) {
    try {
      return await chromium.launch({ headless: true, ...options })
    } catch (error) {
      lastError = error
    }
  }
  throw new Error(
    `Could not launch a Chromium browser. Run "npx playwright install chromium" once, or install Google Chrome.\n${lastError}`,
  )
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // server not ready yet
    }
    await new Promise((done) => setTimeout(done, 300))
  }
  throw new Error(`Timed out waiting for the dev server at ${url}`)
}

function startDevServer() {
  const bin = resolve('node_modules/.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite')
  return spawn(bin, ['--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], { stdio: 'ignore' })
}

async function newDevicePage(browser, viewport) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: IPHONE_17.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
    userAgent: IPHONE_17.userAgent,
  })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  return { context, page }
}

async function captureLandscape(browser) {
  const { context, page } = await newDevicePage(browser, IPHONE_17.landscape)
  await page.screenshot({ path: resolve(OUT_DIR, 'landscape-idle.png') })

  // Enter the live measurement state and apply a representative tilt so the
  // screenshot shows real leveling guidance rather than the empty prompt.
  await page.getByText('Enable motion').click().catch(() => {})
  await page.waitForTimeout(150)
  await page.evaluate(() => {
    const event = new Event('deviceorientation')
    Object.defineProperty(event, 'beta', { value: 3.3 })
    Object.defineProperty(event, 'gamma', { value: -4.3 })
    window.dispatchEvent(event)
  })
  await page.waitForTimeout(300)
  await page.screenshot({ path: resolve(OUT_DIR, 'landscape-active.png') })
  await context.close()
}

async function capturePortrait(browser) {
  const { context, page } = await newDevicePage(browser, IPHONE_17.portrait)
  await page.screenshot({ path: resolve(OUT_DIR, 'portrait.png') })
  await context.close()
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const server = process.env.SCREENSHOT_URL ? null : startDevServer()
  const stopServer = () => server && !server.killed && server.kill('SIGTERM')
  process.on('exit', stopServer)

  let browser
  try {
    await waitForServer(BASE_URL)
    browser = await launchBrowser()
    await captureLandscape(browser)
    await capturePortrait(browser)
    console.log(`Saved screenshots to ${OUT_DIR}`)
  } finally {
    if (browser) await browser.close()
    stopServer()
  }
}

main().catch((error) => {
  console.error(error.message ?? error)
  process.exitCode = 1
})
