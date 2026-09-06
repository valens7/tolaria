import type { VaultEntry, VaultPropertyValue } from '../types'
import { moraMemoIdentityFromEntry } from './moraMemoSourcePaths'

export type MoraMemoTimelineKey = 'today' | 'yesterday' | 'week' | 'earlier'

export interface MoraMemoTimelineGroup {
  key: MoraMemoTimelineKey
  entries: VaultEntry[]
}

export function createMoraMemoId(): string {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `memo_${id}`
}

export function buildMoraMemoContent(memoId: string, content: string): string {
  return `---\ntype: Memo\nmemo_id: ${memoId}\n---\n\n${content.trim()}\n`
}

function memoTimestamp(entry: Pick<VaultEntry, 'createdAt' | 'modifiedAt'>): number {
  return entry.createdAt ?? entry.modifiedAt ?? 0
}

function scalarTagValues(value: VaultPropertyValue | undefined): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  if (typeof value !== 'string') return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export function moraMemoEntries(entries: VaultEntry[]): VaultEntry[] {
  return entries
    .filter((entry) => !entry.archived && moraMemoIdentityFromEntry(entry) !== null)
    .sort((left, right) => memoTimestamp(right) - memoTimestamp(left))
}

export function moraMemoTags(entry: Pick<VaultEntry, 'properties'>): string[] {
  const values = ['tags', 'keywords', 'categories', 'labels'].flatMap((key) => scalarTagValues(entry.properties[key]))
  return [...new Set(values)]
}

export function matchesMoraMemoQuery(entry: Pick<VaultEntry, 'title' | 'snippet' | 'properties'>, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  if (!normalizedQuery) return true
  const haystack = [entry.title, entry.snippet ?? '', ...moraMemoTags(entry)].join(' ').toLocaleLowerCase()
  return haystack.includes(normalizedQuery)
}

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function timelineKey(timestamp: number, now: number): MoraMemoTimelineKey {
  const dayDelta = Math.floor((startOfDay(now) - startOfDay(timestamp)) / 86_400_000)
  if (dayDelta <= 0) return 'today'
  if (dayDelta === 1) return 'yesterday'
  if (dayDelta < 7) return 'week'
  return 'earlier'
}

const TIMELINE_ORDER: MoraMemoTimelineKey[] = ['today', 'yesterday', 'week', 'earlier']

export function groupMoraMemos(entries: VaultEntry[], now = Date.now()): MoraMemoTimelineGroup[] {
  const groups = new Map<MoraMemoTimelineKey, VaultEntry[]>()
  for (const entry of moraMemoEntries(entries)) {
    const key = timelineKey(memoTimestamp(entry) * 1000, now)
    const group = groups.get(key) ?? []
    group.push(entry)
    groups.set(key, group)
  }
  return TIMELINE_ORDER.flatMap((key) => {
    const groupedEntries = groups.get(key)
    return groupedEntries && groupedEntries.length > 0 ? [{ key, entries: groupedEntries }] : []
  })
}
