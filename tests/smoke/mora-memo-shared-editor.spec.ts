import fs from 'fs'
import path from 'path'
import { expect, test } from '@playwright/test'
import {
  createFixtureVaultCopy,
  openFixtureVaultDesktopHarness,
  removeFixtureVaultCopy,
} from '../helpers/fixtureVault'
import { triggerMenuCommand } from './testBridge'

let tempVaultDir: string

function addExistingMemo(vaultPath: string): string {
  const memoPath = path.join(vaultPath, '10 Sources', '10 Memos', '2026', '09', 'existing-memo.md')
  fs.mkdirSync(path.dirname(memoPath), { recursive: true })
  fs.writeFileSync(memoPath, [
    '---',
    'memo_id: memo_01J7X',
    '---',
    '',
    '# Existing Memo',
    '',
    'Original thought.',
    '',
  ].join('\n'))
  return memoPath
}

async function openMemoTimeline(page: Parameters<typeof openFixtureVaultDesktopHarness>[0]) {
  await page.getByText('Memo Timeline', { exact: true }).click()
  await expect(page.locator('[data-testid="note-list-container"]')).toContainText('Existing Memo')
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

test('@smoke Memo Timeline opens an existing Memo in the shared BlockNote editor and preserves identity after restart', async ({ page }) => {
  const memoPath = path.join(tempVaultDir, '10 Sources', '10 Memos', '2026', '09', 'existing-memo.md')
  const appendedText = `Saved through the shared editor ${Date.now()}`

  await openMemoTimeline(page)
  await page.getByText('Existing Memo', { exact: true }).click()
  await expect(page.locator('.bn-editor h1').first()).toHaveText('Existing Memo')

  const bodyBlock = page.locator('.bn-block-content').nth(1)
  await bodyBlock.click()
  await page.keyboard.press('End')
  await page.keyboard.type(` ${appendedText}`)
  await triggerMenuCommand(page, 'file-save')

  await expect.poll(() => fs.readFileSync(memoPath, 'utf8'), { timeout: 10_000 }).toContain(appendedText)
  expect(fs.readFileSync(memoPath, 'utf8')).toContain('memo_id: memo_01J7X')

  await page.reload()
  await openMemoTimeline(page)
  await page.getByText('Existing Memo', { exact: true }).click()

  await expect(page.locator('.bn-editor')).toContainText(appendedText)
  expect(fs.readFileSync(memoPath, 'utf8')).toContain('memo_id: memo_01J7X')
})
