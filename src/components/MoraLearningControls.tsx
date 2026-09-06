import { useRef, useState } from 'react'
import type { AppLocale } from '../lib/i18n'
import { translate } from '../lib/i18n'
import type { VaultEntry } from '../types'
import { Button } from './ui/button'
import {
  MORA_LEARNING_ITEM_ID_PROPERTY,
  MORA_LEARNER_FAMILIAR_PROPERTY,
  MORA_LEARNER_NEXT_REVIEW_AT_PROPERTY,
  MORA_LEARNER_NOT_FOR_ME_PROPERTY,
  MORA_LEARNER_READ_ALOUD_COUNT_PROPERTY,
  MORA_LEARNER_REVIEW_LATER_PROPERTY,
  MORA_LEARNER_SAVED_PROPERTY,
  isMoraLearningSource,
  moraLearningItemFromEntry,
} from '../mora/moraLearningItems'

type UpdateFrontmatter = (path: string, key: string, value: string | number | boolean, options?: { silent?: boolean }) => Promise<void>

interface MoraLearningControlsProps {
  entry: VaultEntry | null
  locale: AppLocale
  onUpdateFrontmatter: UpdateFrontmatter
}

function newLearningItemId(): string {
  return `item_${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`}`
}

export function MoraLearningControls({ entry, locale, onUpdateFrontmatter }: MoraLearningControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const pendingItemId = useRef<string | null>(null)
  if (!entry || !isMoraLearningSource(entry)) return null

  const item = moraLearningItemFromEntry(entry)
  const persist = async (updates: Array<[string, string | number | boolean]>) => {
    setIsUpdating(true)
    try {
      for (const [key, value] of updates) {
        await onUpdateFrontmatter(entry.path, key, value, { silent: true })
      }
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-2 border-b border-border px-3 py-2" data-testid="mora-learning-controls">
      {!item ? (
        <Button
          disabled={isUpdating}
          onClick={() => {
            pendingItemId.current ??= newLearningItemId()
            void persist([[MORA_LEARNING_ITEM_ID_PROPERTY, pendingItemId.current]])
          }}
          size="xs"
          type="button"
        >
          {translate(locale, 'mora.learning.saveItem')}
        </Button>
      ) : (
        <>
          {!item.state.saved && (
            <Button
              disabled={isUpdating}
              onClick={() => void persist([[MORA_LEARNER_SAVED_PROPERTY, true]])}
              size="xs"
              type="button"
              variant="outline"
            >
              {translate(locale, 'mora.learning.saveItem')}
            </Button>
          )}
          <Button
            disabled={isUpdating}
            onClick={() => void persist([
              [MORA_LEARNER_SAVED_PROPERTY, true],
              [MORA_LEARNER_REVIEW_LATER_PROPERTY, true],
              [MORA_LEARNER_NEXT_REVIEW_AT_PROPERTY, new Date().toISOString()],
            ])}
            size="xs"
            type="button"
          >
            {translate(locale, 'mora.learning.reviewLater')}
          </Button>
          <Button
            disabled={isUpdating}
            onClick={() => void persist([
              [MORA_LEARNER_SAVED_PROPERTY, true],
              [MORA_LEARNER_READ_ALOUD_COUNT_PROPERTY, item.state.readAloudCount + 1],
            ])}
            size="xs"
            type="button"
            variant="outline"
          >
            {translate(locale, 'mora.learning.readAloud')}
          </Button>
          <Button
            disabled={isUpdating}
            onClick={() => void persist([
              [MORA_LEARNER_SAVED_PROPERTY, true],
              [MORA_LEARNER_FAMILIAR_PROPERTY, true],
              [MORA_LEARNER_REVIEW_LATER_PROPERTY, false],
            ])}
            size="xs"
            type="button"
            variant="outline"
          >
            {translate(locale, 'mora.learning.memorize')}
          </Button>
          <Button
            disabled={isUpdating}
            onClick={() => void persist([
              [MORA_LEARNER_NOT_FOR_ME_PROPERTY, true],
              [MORA_LEARNER_REVIEW_LATER_PROPERTY, false],
            ])}
            size="xs"
            type="button"
            variant="ghost"
          >
            {translate(locale, 'mora.learning.notForMe')}
          </Button>
        </>
      )}
    </div>
  )
}
