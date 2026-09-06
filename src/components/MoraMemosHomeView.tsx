import { MagnifyingGlass, Tag } from '@phosphor-icons/react'
import { useMemo, useState, type SyntheticEvent } from 'react'
import type { AppLocale } from '../lib/i18n'
import { translate } from '../lib/i18n'
import type { VaultEntry } from '../types'
import { groupMoraMemos, moraMemoTags, matchesMoraMemoQuery } from '../mora/moraMemos'
import { MoraCaptureComposer } from './MoraCaptureComposer'

interface MoraMemosHomeViewProps {
  entries: VaultEntry[]
  locale: AppLocale
  onCapture: (content: string) => void
  onOpenMemo: (entry: VaultEntry) => void
}

function timelineLabel(locale: AppLocale, key: 'today' | 'yesterday' | 'week' | 'earlier'): string {
  return translate(locale, `mora.memos.timeline.${key}`)
}

function MemoCard({ entry, locale, onOpen }: { entry: VaultEntry; locale: AppLocale; onOpen: () => void }) {
  const tags = moraMemoTags(entry)
  const handleOpen = (event: SyntheticEvent<HTMLElement>) => {
    const selectedText = globalThis.getSelection?.()
    if (selectedText && !selectedText.isCollapsed) return
    onOpen()
    event.currentTarget.blur()
  }

  return (
    <article
      className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
      data-memo-path={entry.path}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') handleOpen(event)
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">{entry.snippet || entry.title}</p>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground" key={tag}>
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {entry.createdAt ? new Intl.DateTimeFormat(locale === 'zh-CN' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }).format(entry.createdAt * 1000) : ''}
        </span>
      </div>
      <span className="sr-only">{translate(locale, 'mora.memos.open')}</span>
    </article>
  )
}

export function MoraMemosHomeView({ entries, locale, onCapture, onOpenMemo }: MoraMemosHomeViewProps) {
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const memoEntries = useMemo(() => entries.filter((entry) => matchesMoraMemoQuery(entry, query)), [entries, query])
  const filteredEntries = useMemo(
    () => (selectedTag ? memoEntries.filter((entry) => moraMemoTags(entry).includes(selectedTag)) : memoEntries),
    [memoEntries, selectedTag],
  )
  const tags = useMemo(
    () => [...new Set(entries.flatMap((entry) => moraMemoTags(entry)))].sort((left, right) => left.localeCompare(right)),
    [entries],
  )
  const groups = useMemo(() => groupMoraMemos(filteredEntries), [filteredEntries])

  return (
    <main className="h-full overflow-y-auto bg-[#fbfaf7] px-8 py-10" data-testid="mora-memos-home">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
        <header>
          <div className="mb-2 text-sm font-medium text-primary">{translate(locale, 'mora.memos.eyebrow')}</div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{translate(locale, 'mora.memos.title')}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{translate(locale, 'mora.memos.description')}</p>
        </header>

        <MoraCaptureComposer locale={locale} onCapture={onCapture} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex min-w-0 flex-1 items-center">
            <MagnifyingGlass className="pointer-events-none absolute left-3 text-muted-foreground" size={17} />
            <input
              aria-label={translate(locale, 'mora.memos.searchPlaceholder')}
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={translate(locale, 'mora.memos.searchPlaceholder')}
              value={query}
            />
          </label>
          <select
            aria-label={translate(locale, 'mora.memos.allTags')}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            onChange={(event) => setSelectedTag(event.target.value)}
            value={selectedTag}
          >
            <option value="">{translate(locale, 'mora.memos.allTags')}</option>
            {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-7">
          {groups.map((group) => (
            <section aria-labelledby={`mora-memos-${group.key}`} className="flex flex-col gap-3" key={group.key}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground" id={`mora-memos-${group.key}`}>
                {timelineLabel(locale, group.key)}
              </h2>
              <div className="flex flex-col gap-3">
                {group.entries.map((entry) => <MemoCard entry={entry} key={entry.path} locale={locale} onOpen={() => onOpenMemo(entry)} />)}
              </div>
            </section>
          ))}
          {groups.length === 0 && <p className="rounded-2xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">{translate(locale, 'mora.memos.empty')}</p>}
        </div>
      </div>
    </main>
  )
}
