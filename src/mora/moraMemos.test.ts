import { describe, expect, it } from 'vitest'
import type { VaultEntry } from '../types'
import {
  buildMoraMemoContent,
  createMoraMemoId,
  groupMoraMemos,
  moraMemoEntries,
  moraMemoTags,
  matchesMoraMemoQuery,
} from './moraMemos'

function memo(path: string, createdAt: number, snippet: string, properties: VaultEntry['properties'] = {}): VaultEntry {
  return {
    path,
    filename: path.split('/').at(-1) ?? 'memo.md',
    title: snippet,
    isA: 'Memo',
    aliases: [],
    belongsTo: [],
    relatedTo: [],
    relationships: {},
    outgoingLinks: [],
    status: null,
    noteWidth: null,
    modifiedAt: createdAt,
    createdAt,
    fileSize: snippet.length,
    wordCount: snippet.length,
    snippet,
    archived: false,
    trashed: false,
    trashedAt: null,
    properties: { memo_id: `memo-${createdAt}`, ...properties },
  }
}

describe('Mora memo projections', () => {
  it('builds canonical Markdown for a captured Memo without changing the Vault contract', () => {
    expect(buildMoraMemoContent('memo_123', 'A quick thought')).toBe('---\ntype: Memo\nmemo_id: memo_123\n---\n\nA quick thought\n')
  })

  it('creates a non-empty stable-looking Memo identity', () => {
    expect(createMoraMemoId()).toMatch(/^memo_[0-9a-f-]{36}$/)
  })

  it('keeps only canonical Memo entries and sorts newest first', () => {
    const older = memo('10 Sources/10 Memos/older.md', 100, 'older')
    const newer = memo('10 Sources/10 Memos/newer.md', 200, 'newer')
    const other = memo('notes/other.md', 300, 'other')
    const archived = { ...newer, path: '10 Sources/10 Memos/archived.md', archived: true }

    expect(moraMemoEntries([older, other, archived, newer])).toEqual([newer, older])
  })

  it('extracts stable unique tags from scalar and array metadata', () => {
    const entry = memo('10 Sources/10 Memos/tagged.md', 100, 'tagged', {
      tags: ['Work', 'memos'],
      labels: 'Work, Focus',
    })

    expect(moraMemoTags(entry)).toEqual(['Work', 'memos', 'Focus'])
  })

  it('matches memo text and tags case-insensitively', () => {
    const entry = memo('10 Sources/10 Memos/tagged.md', 100, 'Ship the release', { tags: ['Work'] })

    expect(matchesMoraMemoQuery(entry, 'release')).toBe(true)
    expect(matchesMoraMemoQuery(entry, 'work')).toBe(true)
    expect(matchesMoraMemoQuery(entry, 'unrelated')).toBe(false)
  })

  it('groups entries into Today, Yesterday, This week, and Earlier', () => {
    const now = new Date('2026-09-06T12:00:00Z').getTime()
    const entries = [
      memo('10 Sources/10 Memos/today.md', now / 1000 - 60, 'today'),
      memo('10 Sources/10 Memos/yesterday.md', now / 1000 - 86_400, 'yesterday'),
      memo('10 Sources/10 Memos/week.md', now / 1000 - 3 * 86_400, 'week'),
      memo('10 Sources/10 Memos/earlier.md', now / 1000 - 10 * 86_400, 'earlier'),
    ]

    expect(groupMoraMemos(entries, now).map((group) => [group.key, group.entries.map((entry) => entry.title)])).toEqual([
      ['today', ['today']],
      ['yesterday', ['yesterday']],
      ['week', ['week']],
      ['earlier', ['earlier']],
    ])
  })
})
