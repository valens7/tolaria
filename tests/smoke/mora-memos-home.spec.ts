import fs from 'fs'
import path from 'path'
import { expect, test } from '@playwright/test'
import {
  createFixtureVaultCopy,
  openFixtureVaultDesktopHarness,
  removeFixtureVaultCopy,
} from '../helpers/fixtureVault'

let tempVaultDir: string

function addExistingMemo(vaultPath: string): string {
  const memoPath = path.join(vaultPath, '10 Sources', '10 Memos', 'existing-memo.md')
  fs.mkdirSync(path.dirname(memoPath), { recursive: true })
  fs.writeFileSync(memoPath, [
    '---',
    'type: Memo',
    'memo_id: memo_existing_01',
    '---',
    '',
    '# Existing Memo',
    '',
    'Original thought.',
    '',
  ].join('\n'))
  return memoPath
}

test.beforeEach(async ({ page }, testInfo) => {
  testInfo.setTimeout(60_000)
  tempVaultDir = createFixtureVaultCopy()
  addExistingMemo(tempVaultDir)
  await openFixtureVaultDesktopHarness(page, tempVaultDir)
})

test.afterEach(() => {
  removeFixtureVaultCopy(tempVaultDir)
})

test('@smoke Mora Home exposes the Memos first vertical slice and writes a canonical Markdown Memo', async ({ page }) => {
  await expect(page.locator('[data-testid="mora-home"]')).toBeVisible()
  await page.getByTestId('sidebar-mora-nav').getByText('Memos', { exact: true }).click()
  await expect(page.locator('[data-testid="mora-memos-home"]')).toBeVisible()

  const capture = page.getByTestId('mora-capture-input')
  await capture.fill('Captured from Mora Memos Home')
  await page.getByTestId('mora-capture-submit').click()

  const memoFolder = path.join(tempVaultDir, '10 Sources', '10 Memos')
  await expect.poll(() => fs.readdirSync(memoFolder).filter((name) => name.startsWith('untitled-memo-') && name.endsWith('.md')), { timeout: 15_000 }).toHaveLength(1)
  const createdPath = path.join(memoFolder, fs.readdirSync(memoFolder).find((name) => name.startsWith('untitled-memo-') && name.endsWith('.md'))!)
  const createdContent = fs.readFileSync(createdPath, 'utf8')
  expect(createdContent).toContain('type: Memo')
  expect(createdContent).toMatch(/memo_id:\s+memo_[A-Za-z0-9-]+/)
  expect(createdContent).toContain('Captured from Mora Memos Home')
  await expect(page.locator('[data-testid="mora-memos-home"]')).toContainText('Captured from Mora Memos Home')
})

test('@smoke Memos Home opens an existing Memo through the shared editor and restores the Memos context', async ({ page }) => {
  await page.getByTestId('sidebar-mora-nav').getByText('Memos', { exact: true }).click()
  await expect(page.locator('[data-testid="mora-memos-home"]')).toContainText('Original thought.')
  await page.locator('[data-memo-path$="existing-memo.md"]').click()

  await expect(page.locator('.bn-editor')).toContainText('Original thought.')
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-testid="mora-memos-home"]')).toBeVisible()
})
