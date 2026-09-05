import { describe, expect, it } from 'vitest'
import {
  MORA_MEMO_ID_PROPERTY,
  MORA_MEMO_ROOT,
  isMoraMemoPath,
  moraMemoIdentityFromEntry,
  moraMemoRelativePath,
} from './moraMemoSourcePaths'

describe('moraMemoSourcePaths', () => {
  it('uses the canonical Memo source path', () => {
    expect(MORA_MEMO_ROOT).toBe('10 Sources/10 Memos')
  })

  it('recognizes logical, absolute, and Windows-form Memo paths', () => {
    expect(isMoraMemoPath('10 Sources/10 Memos/2026/idea.md')).toBe(true)
    expect(isMoraMemoPath('/Users/valens/Mora/10 Sources/10 Memos/2026/idea.md')).toBe(true)
    expect(isMoraMemoPath('10 Sources\\10 Memos\\2026\\idea.md')).toBe(true)
    expect(isMoraMemoPath('10 Sources/20 Meetings/idea.md')).toBe(false)
  })

  it('keeps an existing memo id attached to its canonical Markdown path across a restart', () => {
    const firstRead = moraMemoIdentityFromEntry({
      path: '10 Sources/10 Memos/2026/09/idea.md',
      properties: { [MORA_MEMO_ID_PROPERTY]: 'memo_01J7X' },
    })
    const restartRead = moraMemoIdentityFromEntry({
      path: '10 Sources/10 Memos/2026/09/idea.md',
      properties: { [MORA_MEMO_ID_PROPERTY]: 'memo_01J7X' },
    })

    expect(moraMemoRelativePath(firstRead?.path ?? '')).toBe('2026/09/idea.md')
    expect(restartRead).toEqual(firstRead)
  })

  it('rejects non-Memo Markdown and missing ids', () => {
    expect(moraMemoIdentityFromEntry({
      path: '10 Sources/20 Meetings/standup.md',
      properties: { [MORA_MEMO_ID_PROPERTY]: 'memo_01J7X' },
    })).toBeNull()
    expect(moraMemoIdentityFromEntry({
      path: '10 Sources/10 Memos/2026/idea.md',
      properties: {},
    })).toBeNull()
  })
})
