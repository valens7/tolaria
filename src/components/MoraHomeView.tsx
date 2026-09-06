import { BookOpenText, FileText, Notebook, Sparkle } from '@phosphor-icons/react'
import type { AppLocale } from '../lib/i18n'
import { translate } from '../lib/i18n'
import type { SidebarSelection } from '../types'
import { MoraCaptureComposer } from './MoraCaptureComposer'

interface MoraHomeViewProps {
  locale: AppLocale
  onCapture: (content: string) => void
  onSelect: (selection: SidebarSelection) => void
}

interface ModuleCardProps {
  description: string
  Icon: typeof Notebook
  onClick: () => void
  title: string
}

function ModuleCard({ description, Icon, onClick, title }: ModuleCardProps) {
  return (
    <button
      className="group rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      onClick={onClick}
      type="button"
    >
      <span className="mb-4 inline-flex rounded-xl bg-muted p-2.5 text-primary">
        <Icon size={22} weight="duotone" />
      </span>
      <span className="block text-base font-semibold text-foreground">{title}</span>
      <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
    </button>
  )
}

export function MoraHomeView({ locale, onCapture, onSelect }: MoraHomeViewProps) {
  return (
    <main className="h-full overflow-y-auto bg-[#fbfaf7] px-8 py-10" data-testid="mora-home">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-9">
        <header className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkle size={17} weight="duotone" />
            <span>{translate(locale, 'mora.home.eyebrow')}</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {translate(locale, 'mora.home.title')}
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            {translate(locale, 'mora.home.description')}
          </p>
        </header>

        <MoraCaptureComposer locale={locale} onCapture={onCapture} testId="mora-home-capture" />

        <section aria-labelledby="mora-home-modules" className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground" id="mora-home-modules">
            {translate(locale, 'mora.home.modules')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <ModuleCard
              description={translate(locale, 'mora.home.memosDescription')}
              Icon={Notebook}
              onClick={() => onSelect({ kind: 'moraMemosHome' })}
              title={translate(locale, 'mora.home.memosTitle')}
            />
            <ModuleCard
              description={translate(locale, 'mora.home.learningDescription')}
              Icon={BookOpenText}
              onClick={() => onSelect({ kind: 'moraLearningFeed' })}
              title={translate(locale, 'mora.home.learningTitle')}
            />
            <ModuleCard
              description={translate(locale, 'mora.home.notesDescription')}
              Icon={FileText}
              onClick={() => onSelect({ kind: 'filter', filter: 'all' })}
              title={translate(locale, 'mora.home.notesTitle')}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
