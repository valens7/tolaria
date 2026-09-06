import fs from 'fs'
import path from 'path'
import { expect, test } from '@playwright/test'
import {
  createFixtureVaultCopy,
  openFixtureVaultDesktopHarness,
  removeFixtureVaultCopy,
} from '../helpers/fixtureVault'

let tempVaultDir: string

function itemIdFrom(content: string): string | null {
  return content.match(/^item_id:\s*["']?(item_[^"'\s]+)["']?$/m)?.[1] ?? null
}

test.beforeEach(async ({ page }, testInfo) => {
  testInfo.setTimeout(60_000)
  tempVaultDir = createFixtureVaultCopy()
  await openFixtureVaultDesktopHarness(page, tempVaultDir)
})

test.afterEach(() => {
  removeFixtureVaultCopy(tempVaultDir)
})

test('@smoke Dogfood 002 source appears in Learning Feed and writes learner state to its Markdown frontmatter', async ({ page }) => {
  const sourcePath = path.join(
    tempVaultDir,
    '10 Sources',
    '20 Articles',
    'dogfood-002-supplier-accountability.md',
  )

  await page.getByText('All Notes', { exact: true }).click()
  await page.getByTitle('Search notes').click()
  await page.getByPlaceholder('Search notes...').fill('Dogfood 002 · Supplier Accountability')
  await expect(page.getByTestId('note-list-container').getByText('Dogfood 002 · Supplier Accountability', { exact: true })).toBeVisible()
  await page.getByTestId('note-list-container').getByText('Dogfood 002 · Supplier Accountability', { exact: true }).click()
  await expect(page.getByRole('button', { name: 'Save Learning Item' })).toBeVisible()
  await page.getByRole('button', { name: 'Save Learning Item' }).click()
  await expect(page.getByRole('button', { name: 'Read Aloud' })).toBeVisible()
  await page.getByRole('button', { name: 'Save Learning Item' }).click()
  await expect.poll(() => fs.readFileSync(sourcePath, 'utf8'), { timeout: 10_000 }).toContain('saved: true')

  await page.getByText('Learning Feed', { exact: true }).click()
  await expect(page.locator('[data-testid="note-list-container"]')).toContainText(
    'Dogfood 002 · Supplier Accountability',
  )
  await page.getByTestId('note-list-container').getByText('Dogfood 002 · Supplier Accountability', { exact: true }).click()

  await page.getByRole('button', { name: 'Read Aloud' }).click()
  await expect.poll(() => fs.readFileSync(sourcePath, 'utf8'), { timeout: 10_000 }).toContain('read_aloud_count: 1')

  await page.getByRole('button', { name: 'Familiar' }).click()
  await expect.poll(() => fs.readFileSync(sourcePath, 'utf8'), { timeout: 10_000 }).toContain('familiar: true')

  await page.getByRole('button', { name: 'Review Later' }).click()
  await expect.poll(() => fs.readFileSync(sourcePath, 'utf8'), { timeout: 10_000 }).toContain('review_later: true')

  const persistedSource = fs.readFileSync(sourcePath, 'utf8')
  expect(itemIdFrom(persistedSource)).toBeTruthy()
  expect(persistedSource).toMatch(/^source_id:\s*["']?mora-source-supplier-accountability-20260710["']?$/m)
  expect(persistedSource).toMatch(/^source_url:\s*["']?https:\/\/app\.notion\.com\/p\/39903e40d5f8804584b9ea42ff804760\?pvs=204["']?$/m)
  expect(persistedSource).toMatch(/^source_definition_url:\s*["']?https:\/\/app\.notion\.com\/p\/3d203e40d5f8810fa031d6fc4ad51ef7\?pvs=204["']?$/m)
})
