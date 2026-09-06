import fs from 'fs'
import path from 'path'
import { expect, test, type Page } from '@playwright/test'
import { createFixtureVaultCopy, openFixtureVault, removeFixtureVaultCopy } from '../helpers/fixtureVault'

let tempVaultDir: string

async function openAlphaProject(page: Page): Promise<void> {
  await page.getByText('All Notes', { exact: true }).first().click()
  await page.getByTestId('note-list-container').getByText('Alpha Project', { exact: true }).click()
  await expect(page.locator('.bn-editor')).toBeVisible({ timeout: 5_000 })
}

async function createToggleBlock(page: Page): Promise<void> {
  await page.locator('.bn-block-content').last().click()
  await page.keyboard.press('Enter')
  await page.keyboard.type('/tog')
  await page.getByRole('option', { name: /^Toggle$/i }).click()
}

test.beforeEach(async ({ page }, testInfo) => {
  testInfo.setTimeout(60_000)
  tempVaultDir = createFixtureVaultCopy()
  await openFixtureVault(page, tempVaultDir)
})

test.afterEach(() => {
  removeFixtureVaultCopy(tempVaultDir)
})

test('@smoke Toggle Block collapses, saves Mora Markdown, and restores its state after reload', async ({ page }) => {
  await openAlphaProject(page)
  await createToggleBlock(page)

  const title = page.locator('.mora-toggle__content').last()
  await title.click()
  await page.keyboard.type('Project context')
  await page.keyboard.press('Enter')
  const toggleBlock = title.locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " bn-block ")][1]')
  await expect(toggleBlock.locator(':scope > .bn-block-group')).toHaveCount(1)
  await page.keyboard.type('Hidden detail')

  const collapse = page.getByRole('button', { name: 'Collapse toggle' })
  await expect(collapse).toHaveAttribute('aria-expanded', 'true')
  await collapse.click()

  await expect(page.getByRole('button', { name: 'Expand toggle' })).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByText('Hidden detail', { exact: true })).toBeHidden()

  const notePath = path.join(tempVaultDir, 'project', 'alpha-project.md')
  await expect.poll(() => fs.readFileSync(notePath, 'utf8'), { timeout: 5_000 }).toContain([
    '> [!mora-toggle]- Project context',
    '> Hidden detail',
  ].join('\n'))

  await page.reload({ waitUntil: 'domcontentloaded' })
  await openAlphaProject(page)

  await expect(page.getByRole('button', { name: 'Expand toggle' })).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByText('Hidden detail', { exact: true })).toBeHidden()
})
