import fs from 'fs'
import path from 'path'
import { expect, test } from '@playwright/test'
import {
  createFixtureVaultCopy,
  openFixtureVaultDesktopHarness,
  removeFixtureVaultCopy,
} from '../helpers/fixtureVault'

let tempVaultDir: string

function addCorrectionSource(vaultPath: string): string {
  const sourcePath = path.join(vaultPath, '10 Sources', '20 Articles', 'dogfood-not-for-me.md')
  fs.mkdirSync(path.dirname(sourcePath), { recursive: true })
  fs.writeFileSync(sourcePath, [
    '---',
    'title: "Dogfood correction item"',
    'source_ref_id: "mora-source-solo-weekly-0903-20260901"',
    'source_url: "https://docs.google.com/document/d/1LHvfciSQhzqQRShXVSnVYylUu6_S5RYq/edit"',
    '---',
    '',
    '# Dogfood correction item',
    '',
    'This is not guaranteed to solve all the problems, but hopefully it will.',
  ].join('\n'))
  return sourcePath
}

function itemIdFrom(content: string): string | null {
  return content.match(/^item_id:\s*["']?(item_[^"'\s]+)["']?$/m)?.[1] ?? null
}

test.beforeEach(async ({ page }, testInfo) => {
  testInfo.setTimeout(60_000)
  tempVaultDir = createFixtureVaultCopy()
  addCorrectionSource(tempVaultDir)
  await openFixtureVaultDesktopHarness(page, tempVaultDir)
})

test.afterEach(() => {
  removeFixtureVaultCopy(tempVaultDir)
})

test('@smoke Not for me persists the same item_id and prevents normal resurfacing', async ({ page }) => {
  const sourcePath = path.join(tempVaultDir, '10 Sources', '20 Articles', 'dogfood-not-for-me.md')

  await page.getByText('All Notes', { exact: true }).click()
  await page.getByText('Dogfood correction item', { exact: true }).click()
  await page.getByRole('button', { name: 'Save Learning Item' }).click()
  await page.getByRole('button', { name: 'Review Later' }).click()
  await expect.poll(() => fs.readFileSync(sourcePath, 'utf8'), { timeout: 10_000 }).toContain('review_later: true')
  const persistedItemId = itemIdFrom(fs.readFileSync(sourcePath, 'utf8'))
  expect(persistedItemId).toBeTruthy()

  await page.getByRole('button', { name: 'Not for me' }).click()
  await expect.poll(() => fs.readFileSync(sourcePath, 'utf8'), { timeout: 10_000 }).toContain('not_for_me: true')
  await expect.poll(() => fs.readFileSync(sourcePath, 'utf8'), { timeout: 10_000 }).toContain('review_later: false')

  await page.reload()
  expect(itemIdFrom(fs.readFileSync(sourcePath, 'utf8'))).toBe(persistedItemId)
  await page.getByText('Learning Feed', { exact: true }).click()
  await expect(page.getByTestId('note-list-container')).not.toContainText('Dogfood correction item')
  await page.getByText('Continue Review', { exact: true }).click()
  await expect(page.getByTestId('note-list-container')).not.toContainText('Dogfood correction item')
})
