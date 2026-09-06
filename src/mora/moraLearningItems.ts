import type { VaultEntry, VaultPropertyValue } from '../types'
import { MORA_SOURCE_ROOT } from './moraMemoSourcePaths'

export const MORA_LEARNING_ITEM_ID_PROPERTY = 'item_id'
export const MORA_LEARNER_SAVED_PROPERTY = 'saved'
export const MORA_LEARNER_FAMILIAR_PROPERTY = 'familiar'
export const MORA_LEARNER_REVIEW_LATER_PROPERTY = 'review_later'
export const MORA_LEARNER_READ_ALOUD_COUNT_PROPERTY = 'read_aloud_count'
export const MORA_LEARNER_NEXT_REVIEW_AT_PROPERTY = 'next_review_at'
export const MORA_LEARNER_NOT_FOR_ME_PROPERTY = 'not_for_me'

export interface MoraLearnerState {
  saved: boolean
  familiar: boolean
  reviewLater: boolean
  readAloudCount: number
  nextReviewAt: string | null
  notForMe: boolean
}

export interface MoraLearningItem {
  itemId: string
  state: MoraLearnerState
}

function sourcePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '')
}

function stringProperty(value: VaultPropertyValue | undefined): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function booleanProperty(value: VaultPropertyValue | undefined): boolean {
  return value === true || value === 'true'
}

function countProperty(value: VaultPropertyValue | undefined): number {
  const count = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0
}

export function isMoraLearningSource(entry: Pick<VaultEntry, 'path'>): boolean {
  const path = sourcePath(entry.path)
  if (path === MORA_SOURCE_ROOT || path.startsWith(`${MORA_SOURCE_ROOT}/`)) return true
  const rootedSourcePath = `/${MORA_SOURCE_ROOT}`
  return path.includes(`${rootedSourcePath}/`)
}

export function moraLearningItemFromEntry(entry: Pick<VaultEntry, 'path' | 'properties'>): MoraLearningItem | null {
  if (!isMoraLearningSource(entry)) return null

  const itemId = stringProperty(entry.properties[MORA_LEARNING_ITEM_ID_PROPERTY])
  if (!itemId) return null

  return {
    itemId,
    state: {
      saved: booleanProperty(entry.properties[MORA_LEARNER_SAVED_PROPERTY]),
      familiar: booleanProperty(entry.properties[MORA_LEARNER_FAMILIAR_PROPERTY]),
      reviewLater: booleanProperty(entry.properties[MORA_LEARNER_REVIEW_LATER_PROPERTY]),
      readAloudCount: countProperty(entry.properties[MORA_LEARNER_READ_ALOUD_COUNT_PROPERTY]),
      nextReviewAt: stringProperty(entry.properties[MORA_LEARNER_NEXT_REVIEW_AT_PROPERTY]),
      notForMe: booleanProperty(entry.properties[MORA_LEARNER_NOT_FOR_ME_PROPERTY]),
    },
  }
}

export function shouldContinueMoraReview(entry: Pick<VaultEntry, 'path' | 'properties'>, now = new Date()): boolean {
  const item = moraLearningItemFromEntry(entry)
  if (item?.state.notForMe) return false
  if (!item?.state.reviewLater) return false
  if (!item.state.nextReviewAt) return true

  const nextReviewAt = Date.parse(item.state.nextReviewAt)
  return Number.isNaN(nextReviewAt) || nextReviewAt <= now.getTime()
}

export function shouldSurfaceMoraLearningItem(entry: Pick<VaultEntry, 'path' | 'properties'>): boolean {
  const item = moraLearningItemFromEntry(entry)
  return item !== null && !item.state.notForMe
}
