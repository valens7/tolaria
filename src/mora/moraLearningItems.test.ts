import { describe, expect, it } from 'vitest'
import type { VaultEntry } from '../types'
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
  shouldContinueMoraReview,
  shouldSurfaceMoraLearningItem,
} from './moraLearningItems'

function entry(properties: VaultEntry['properties'] = {}, path = '10 Sources/20 Articles/dogfood-001.md'): VaultEntry {
  return {
    path,
    filename: 'dogfood-001.md',
    title: 'Dogfood 001 Learning Item',
    isA: null,
    aliases: [],
    belongsTo: [],
    relatedTo: [],
    status: null,
    archived: false,
    modifiedAt: null,
    createdAt: null,
    fileSize: 0,
    snippet: '',
    wordCount: 0,
    relationships: {},
    icon: null,
    color: null,
    order: null,
    sidebarLabel: null,
    template: null,
    sort: null,
    view: null,
    visible: null,
    organized: false,
    favorite: false,
    favoriteIndex: null,
    listPropertiesDisplay: [],
    outgoingLinks: [],
    properties,
    hasH1: true,
  }
}

describe('moraLearningItems', () => {
  it('recognizes source-backed learning items and their complete learner state', () => {
    const source = entry({
      [MORA_LEARNING_ITEM_ID_PROPERTY]: 'item_dogfood_001',
      [MORA_LEARNER_SAVED_PROPERTY]: true,
      [MORA_LEARNER_FAMILIAR_PROPERTY]: false,
      [MORA_LEARNER_REVIEW_LATER_PROPERTY]: true,
      [MORA_LEARNER_READ_ALOUD_COUNT_PROPERTY]: 2,
      [MORA_LEARNER_NEXT_REVIEW_AT_PROPERTY]: '2026-09-06T00:00:00.000Z',
    })

    expect(isMoraLearningSource(source)).toBe(true)
    expect(isMoraLearningSource(entry({}, '/Users/valens/Mora/10 Sources/20 Articles/dogfood-001.md'))).toBe(true)
    expect(moraLearningItemFromEntry(source)).toEqual({
      itemId: 'item_dogfood_001',
      state: {
        saved: true,
        familiar: false,
        reviewLater: true,
        readAloudCount: 2,
        nextReviewAt: '2026-09-06T00:00:00.000Z',
        notForMe: false,
      },
    })
  })

  it('keeps the persisted item_id when a review is resurfaced after reopening', () => {
    const savedOnDisk = entry({
      [MORA_LEARNING_ITEM_ID_PROPERTY]: 'item_dogfood_001',
      [MORA_LEARNER_REVIEW_LATER_PROPERTY]: true,
      [MORA_LEARNER_NEXT_REVIEW_AT_PROPERTY]: '2026-09-06T00:00:00.000Z',
    })
    const reopenedFromDisk = entry({
      [MORA_LEARNING_ITEM_ID_PROPERTY]: 'item_dogfood_001',
      [MORA_LEARNER_REVIEW_LATER_PROPERTY]: true,
      [MORA_LEARNER_NEXT_REVIEW_AT_PROPERTY]: '2026-09-06T00:00:00.000Z',
    })

    expect(moraLearningItemFromEntry(reopenedFromDisk)?.itemId).toBe(
      moraLearningItemFromEntry(savedOnDisk)?.itemId,
    )
    expect(shouldContinueMoraReview(reopenedFromDisk, new Date('2026-09-06T00:00:01.000Z'))).toBe(true)
  })

  it('does not turn non-source files into learning items', () => {
    expect(isMoraLearningSource(entry({}, '20 Projects/dogfood-001.md'))).toBe(false)
    expect(moraLearningItemFromEntry(entry({}, '20 Projects/dogfood-001.md'))).toBeNull()
  })

  it('keeps a corrected item and its item_id on disk while excluding it from normal resurfacing', () => {
    const corrected = entry({
      [MORA_LEARNING_ITEM_ID_PROPERTY]: 'EL-D002-09',
      [MORA_LEARNER_REVIEW_LATER_PROPERTY]: true,
      [MORA_LEARNER_NEXT_REVIEW_AT_PROPERTY]: '2026-09-06T00:00:00.000Z',
      [MORA_LEARNER_NOT_FOR_ME_PROPERTY]: true,
    })

    expect(moraLearningItemFromEntry(corrected)?.itemId).toBe('EL-D002-09')
    expect(moraLearningItemFromEntry(corrected)?.state.notForMe).toBe(true)
    expect(shouldSurfaceMoraLearningItem(corrected)).toBe(false)
    expect(shouldContinueMoraReview(corrected, new Date('2026-09-06T00:00:01.000Z'))).toBe(false)
  })
})
