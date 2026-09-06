import { Archive, BookOpenText, FileText, House, Notebook, Tray } from '@phosphor-icons/react'
import type { SidebarSelection } from '../../types'
import { isSelectionActive, NavItem } from '../SidebarParts'
import { translate, type AppLocale } from '../../lib/i18n'

interface SidebarTopNavProps {
  selection: SidebarSelection
  onSelect: (selection: SidebarSelection) => void
  showInbox: boolean
  inboxCount: number
  activeCount: number
  archivedCount: number
  locale?: AppLocale
  loading?: boolean
  showMoraNavigation?: boolean
}

export function SidebarTopNav(options: SidebarTopNavProps) {
  const { selection, onSelect, showInbox, inboxCount, activeCount, archivedCount, locale = 'en', loading = false, showMoraNavigation = false } = options
  return (
    <>
      {showMoraNavigation && <div className="border-b border-border" data-testid="sidebar-mora-nav" style={{ padding: '6px' }}>
        <NavItem
          icon={House}
          label={translate(locale, 'sidebar.nav.home')}
          isActive={isSelectionActive(selection, { kind: 'moraHome' })}
          onClick={() => onSelect({ kind: 'moraHome' })}
        />
        <NavItem
          icon={Notebook}
          label={translate(locale, 'sidebar.nav.memos')}
          isActive={isSelectionActive(selection, { kind: 'moraMemosHome' })}
          onClick={() => onSelect({ kind: 'moraMemosHome' })}
        />
        <NavItem
          icon={BookOpenText}
          label={translate(locale, 'sidebar.nav.learningFeed')}
          isActive={isSelectionActive(selection, { kind: 'moraLearningFeed' })}
          onClick={() => onSelect({ kind: 'moraLearningFeed' })}
        />
        <NavItem
          icon={FileText}
          label={translate(locale, 'sidebar.nav.notes')}
          isActive={isSelectionActive(selection, { kind: 'filter', filter: 'all' })}
          onClick={() => onSelect({ kind: 'filter', filter: 'all' })}
        />
      </div>}
      <div className="border-b border-border" data-testid="sidebar-top-nav" style={{ padding: '4px 6px' }}>
      {showInbox && (
        <NavItem
          icon={Tray}
          label={translate(locale, 'sidebar.nav.inbox')}
          count={inboxCount}
          countLoading={loading}
          isActive={isSelectionActive(selection, {
            kind: 'filter',
            filter: 'inbox',
          })}
          badgeClassName="text-muted-foreground"
          badgeStyle={{ background: 'var(--muted)' }}
          activeBadgeClassName="bg-primary text-primary-foreground"
          onClick={() => onSelect({ kind: 'filter', filter: 'inbox' })}
        />
      )}
      <NavItem
        icon={FileText}
        label={translate(locale, 'sidebar.nav.allNotes')}
        count={activeCount}
        countLoading={loading}
        isActive={isSelectionActive(selection, {
          kind: 'filter',
          filter: 'all',
        })}
        badgeClassName="text-muted-foreground"
        badgeStyle={{ background: 'var(--muted)' }}
        activeBadgeClassName="bg-primary text-primary-foreground"
        onClick={() => onSelect({ kind: 'filter', filter: 'all' })}
      />
      <NavItem
        icon={Archive}
        label={translate(locale, 'sidebar.nav.archive')}
        count={archivedCount}
        countLoading={loading}
        isActive={isSelectionActive(selection, {
          kind: 'filter',
          filter: 'archived',
        })}
        badgeClassName="text-muted-foreground"
        badgeStyle={{ background: 'var(--muted)' }}
        activeBadgeClassName="bg-primary text-primary-foreground"
        onClick={() => onSelect({ kind: 'filter', filter: 'archived' })}
      />
      </div>
      <div className="border-b border-border" data-testid="sidebar-review-nav" style={{ padding: '4px 6px' }}>
        <NavItem
          icon={FileText}
          label={translate(locale, 'sidebar.nav.memoTimeline')}
          isActive={isSelectionActive(selection, { kind: 'moraMemoTimeline' })}
          onClick={() => onSelect({ kind: 'moraMemoTimeline' })}
        />
        <NavItem
          icon={BookOpenText}
          label={translate(locale, 'sidebar.nav.continueReview')}
          isActive={isSelectionActive(selection, { kind: 'moraContinueReview' })}
          onClick={() => onSelect({ kind: 'moraContinueReview' })}
        />
      </div>
    </>
  )
}
