import type { VaultEntry } from '../types'

export const MORA_SOURCE_ROOT = '10 Sources'
export const MORA_MEMO_ROOT = `${MORA_SOURCE_ROOT}/10 Memos`
export const MORA_MEMO_ID_PROPERTY = 'memo_id'

export interface MoraMemoIdentity {
  memoId: string
  path: string
}

function normalizeMemoPath(path: string): string {
  return path.replaceAll('\\', '/').replace(/^\.\//, '')
}

function memoRootStart(path: string): number {
  const normalized = normalizeMemoPath(path)
  if (normalized === MORA_MEMO_ROOT || normalized.startsWith(`${MORA_MEMO_ROOT}/`)) return 0

  const rootedMemoPath = `/${MORA_MEMO_ROOT}`
  const rootOffset = normalized.indexOf(rootedMemoPath)
  if (rootOffset < 0) return -1

  const pathAfterRoot = normalized.slice(rootOffset + rootedMemoPath.length)
  return pathAfterRoot.length === 0 || pathAfterRoot.startsWith('/') ? rootOffset + 1 : -1
}

export function isMoraMemoPath(path: string): boolean {
  return memoRootStart(path) >= 0
}

export function moraMemoRelativePath(path: string): string | null {
  const rootStart = memoRootStart(path)
  if (rootStart < 0) return null

  const afterRoot = normalizeMemoPath(path).slice(rootStart + MORA_MEMO_ROOT.length)
  return afterRoot.replace(/^\//, '')
}

export function moraMemoIdentityFromEntry(
  entry: Pick<VaultEntry, 'path' | 'properties'>,
): MoraMemoIdentity | null {
  const memoId = entry.properties[MORA_MEMO_ID_PROPERTY]
  if (typeof memoId !== 'string' || memoId.trim().length === 0 || !isMoraMemoPath(entry.path)) return null

  return { memoId, path: normalizeMemoPath(entry.path) }
}
