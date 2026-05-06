import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const baseUrl = process.env.ELEVATEOS_DEMO_URL ?? 'https://elevateos.org'
const outputDir = process.env.ELEVATEOS_DEMO_VIDEO_DIR ?? 'C:/Users/School/Downloads/techstars-demo-recording'
const viewportWidth = Number(process.env.ELEVATEOS_DEMO_WIDTH ?? 1440)
const viewportHeight = Number(process.env.ELEVATEOS_DEMO_HEIGHT ?? 900)

function wait(page, ms) {
  return page.waitForTimeout(ms)
}

async function closeLoginModal(page) {
  const closeButton = page.getByRole('button', { name: 'Close login modal' })
  await closeButton.click()
  await wait(page, 500)
}

async function settle(page, ms = 1100) {
  await page.waitForLoadState('networkidle').catch(() => {})
  await wait(page, ms)
}

async function clickContinue(page) {
  const continueButton = page.getByRole('button', { name: 'Continue' })
  await continueButton.click()
  await settle(page, 900)
}

async function prepareOutputDir() {
  await fs.mkdir(outputDir, { recursive: true })
  const entries = await fs.readdir(outputDir)
  await Promise.all(
    entries.map(async (entry) => {
      if (entry.endsWith('.webm')) {
        await fs.unlink(path.join(outputDir, entry))
      }
    }),
  )
}

async function main() {
  await prepareOutputDir()

  const browser = await chromium.launch({
    headless: true,
  })

  const context = await browser.newContext({
    viewport: { width: viewportWidth, height: viewportHeight },
    recordVideo: {
      dir: outputDir,
      size: { width: viewportWidth, height: viewportHeight },
    },
  })

  const page = await context.newPage()

  try {
    await page.goto(`${baseUrl}/home`, { waitUntil: 'networkidle' })
    await wait(page, 1200)

    await page.getByRole('link', { name: 'Login' }).click()
    await wait(page, 1000)
    await closeLoginModal(page)

    await page.getByText('Student journey').scrollIntoViewIfNeeded()
    await wait(page, 1200)

    await page.getByRole('link', { name: 'Open student demo' }).click()
    await settle(page, 1200)

    await page.getByText('Student setup').scrollIntoViewIfNeeded()
    await wait(page, 1000)

    await clickContinue(page)
    await clickContinue(page)
    await clickContinue(page)

    const privacyPrompt = page.getByText('I agree to the placeholder privacy policy', { exact: false })
    await privacyPrompt.click()
    await wait(page, 700)

    await page.getByRole('button', { name: 'Create my profile' }).click()
    await settle(page, 1500)

    await page.getByText('Product story').scrollIntoViewIfNeeded()
    await wait(page, 1200)

    await page.getByRole('link', { name: 'Tutor hub' }).click()
    await settle(page, 1200)

    await page.getByText('Tutor hub').scrollIntoViewIfNeeded().catch(() => {})
    await wait(page, 800)
  } finally {
    await context.close()
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
