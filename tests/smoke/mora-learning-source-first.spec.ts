import fs from 'fs'
import path from 'path'
import { expect, test } from '@playwright/test'
import {
  createFixtureVaultCopy,
  openFixtureVaultDesktopHarness,
  removeFixtureVaultCopy,
} from '../helpers/fixtureVault'

let tempVaultDir: string

function addDogfoodLearningSource(vaultPath: string): string {
  const sourcePath = path.join(vaultPath, '10 Sources', '20 Articles', 'dogfood-001.md')
  fs.mkdirSync(path.dirname(sourcePath), { recursive: true })
  fs.writeFileSync(sourcePath, '# Dogfood 001 Learning Item\n\nSource-first learning content.\n')
  return sourcePath
}

function itemIdFrom(content: string): string | null {
  return content.match(/^item_id:\s*["']?(item_[^"'\s]+)["']?$/m)?.[1] ?? null
}

test.beforeEach(async ({ page }, testInfo) => {
  testInfo.setTimeout(60_000)
  tempVaultDir = createFixtureVaultCopy()
  addDogfoodLearningSource(tempVaultDir)
  await openFixtureVaultDesktopHarness(page, tempVaultDir)
})

test.afterEach(() => {
  removeFixtureVaultCopy(tempVaultDir)
})

test('@smoke Learning Item persists Review Later and resurfaces the same item after reopening', async ({ page }) => {
  const sourcePath = path.join(tempVaultDir, '10 Sources', '20 Articles', 'dogfood-001.md')

  await page.getByText('All Notes', { exact: true }).click()
  await page.getByText('Dogfood 001 Learning Item', { exact: true }).click()
  await page.getByRole('button', { name: 'Save Learning Item' }).click()
  await expect(page.getByRole('button', { name: 'Review Later' })).toBeVisible()

  await page.getByRole('button', { name: 'Review Later' }).click()
  await expect.poll(() => fs.readFileSync(sourcePath, 'utf8'), { timeout: 10_000 }).toContain('review_later: true')
  await expect.poll(() => fs.readFileSync(sourcePath, 'utf8'), { timeout: 10_000 }).toContain('next_review_at:')
  expect(fs.readFileSync(sourcePath, 'utf8')).toContain('saved: true')
  const persistedItemId = itemIdFrom(fs.readFileSync(sourcePath, 'utf8'))
  expect(persistedItemId).toBeTruthy()

  await page.reload()
  await page.getByText('Continue Review', { exact: true }).click()
  await expect(page.locator('[data-testid="note-list-container"]')).toContainText('Dogfood 001 Learning Item')
  await page.getByText('Dogfood 001 Learning Item', { exact: true }).click()

  expect(itemIdFrom(fs.readFileSync(sourcePath, 'utf8'))).toBe(persistedItemId)
})
