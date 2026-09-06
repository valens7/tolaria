import { useState } from 'react'
import type { AppLocale } from '../lib/i18n'
import { translate } from '../lib/i18n'

interface MoraCaptureComposerProps {
  locale: AppLocale
  onCapture: (content: string) => void
  testId?: string
}

export function MoraCaptureComposer({ locale, onCapture, testId = 'mora-capture-composer' }: MoraCaptureComposerProps) {
  const [value, setValue] = useState('')
  const placeholder = translate(locale, 'mora.memos.capturePlaceholder')

  const submit = () => {
    const content = value.trim()
    if (!content) return
    onCapture(content)
    setValue('')
  }

  return (
    <form
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
      data-testid={testId}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <textarea
        aria-label={placeholder}
        className="min-h-24 w-full resize-y border-0 bg-transparent p-0 text-[16px] leading-7 text-foreground outline-none placeholder:text-muted-foreground"
        data-testid="mora-capture-input"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' || (!event.metaKey && !event.ctrlKey)) return
          event.preventDefault()
          submit()
        }}
        placeholder={placeholder}
        value={value}
      />
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">{translate(locale, 'mora.memos.captureHint')}</span>
        <button
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
          data-testid="mora-capture-submit"
          disabled={!value.trim()}
          type="submit"
        >
          {translate(locale, 'mora.memos.captureAction')}
        </button>
      </div>
    </form>
  )
}
