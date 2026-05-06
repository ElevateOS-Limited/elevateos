import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

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

async function ensureCanFinishSignup(page) {
  const privacyCheckbox = page.getByRole('checkbox').first()
  await privacyCheckbox.check().catch(async () => {
    await page.getByText('I agree to the placeholder privacy policy', { exact: false }).click().catch(() => {})
  })

  await page
    .waitForFunction(() => {
      const button = Array.from(document.querySelectorAll('button')).find((node) =>
        node.textContent?.includes('Create my profile'),
      )
      return !!button && !button.disabled
    })
    .catch(() => {})
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

    await page.getByRole('banner').getByRole('link', { name: 'Login' }).click()
    await wait(page, 1000)
    await closeLoginModal(page)

    await page.getByText('Student journey').scrollIntoViewIfNeeded()
    await wait(page, 1200)

    await page.getByRole('main').getByRole('link', { name: 'Sign up' }).click()
    await settle(page, 1200)

    await page.getByText('Student setup').scrollIntoViewIfNeeded()
    await wait(page, 1000)

    await clickContinue(page)
    await clickContinue(page)
    await clickContinue(page)

    await ensureCanFinishSignup(page)

    const createProfile = page.getByRole('button', { name: 'Create my profile' })
    if (await createProfile.isEnabled()) {
      await createProfile.click()
      await settle(page, 1500)
    } else {
      await page.goto(`${baseUrl}/dashboard?mode=demo`, { waitUntil: 'networkidle' })
      await wait(page, 1200)
    }

    await page.goto(`${baseUrl}/student-dashboard/tutoring?mode=demo`, { waitUntil: 'networkidle' })
    await wait(page, 1200)
    await page.getByText('Your profile').scrollIntoViewIfNeeded()
    await wait(page, 900)

    await page.getByRole('link', { name: 'Find a tutor' }).click()
    await settle(page, 1200)

    await page.getByRole('button', { name: 'Submit' }).click()
    await wait(page, 3000)

    await page.goto(`${baseUrl}/student-dashboard/tutoring?mode=demo`, { waitUntil: 'networkidle' })
    await wait(page, 1200)
    await page.getByText('Upcoming sessions').scrollIntoViewIfNeeded()
    await wait(page, 900)

    await page.goto(`${baseUrl}/student-dashboard/activities?mode=demo`, { waitUntil: 'networkidle' })
    await wait(page, 1200)
    await page.getByText('Your goals').scrollIntoViewIfNeeded()
    await wait(page, 900)

    await page.locator('textarea').first().click()
    await wait(page, 700)

    const activityFinder = page.getByRole('button', { name: 'Run activity finder' })
    if (await activityFinder.isVisible().catch(() => false)) {
      await activityFinder.click()
      await wait(page, 3200)
    }

    const analysisButton = page.getByRole('button', { name: 'Run analysis' })
    if (await analysisButton.isVisible().catch(() => false)) {
      await analysisButton.click()
      await wait(page, 3200)
    }
  } finally {
    await context.close()
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
