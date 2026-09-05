import { describe, expect, it } from 'vitest'
import {
  APP_LOCALES,
  localeCatalogLocales,
  localeDisplayName,
  normalizeUiLanguagePreference,
  resolveEffectiveLocale,
  serializeUiLanguagePreference,
  translate,
} from './i18n'

describe('i18n', () => {
  it('uses supported system languages before falling back to English', () => {
    expect(resolveEffectiveLocale(null, ['zh-CN'])).toBe('zh-CN')
    expect(resolveEffectiveLocale(null, ['zh-TW'])).toBe('en')
    expect(resolveEffectiveLocale(null, ['es-MX'])).toBe('en')
    expect(resolveEffectiveLocale('system', ['fr-FR'])).toBe('en')
  })

  it('normalizes Simplified Chinese preferences and rejects retired locales', () => {
    expect(normalizeUiLanguagePreference(' zh-cn ')).toBe('zh-CN')
    expect(normalizeUiLanguagePreference('zh-Hans')).toBe('zh-CN')
    expect(normalizeUiLanguagePreference('zh-Hant')).toBeNull()
    expect(normalizeUiLanguagePreference('fr-FR')).toBeNull()
  })

  it('serializes system preference as the settings default', () => {
    expect(serializeUiLanguagePreference('system')).toBeNull()
    expect(serializeUiLanguagePreference('zh-Hans')).toBe('zh-CN')
  })

  it('exposes English and Simplified Chinese only', () => {
    expect(APP_LOCALES).toEqual(['en', 'zh-CN'])
    expect(localeDisplayName('en', 'en')).toBe('English')
    expect(localeDisplayName('zh-CN', 'en')).toBe('Simplified Chinese')
    expect(localeDisplayName('en', 'zh-CN')).toBe('英文')
  })

  it('loads a translation catalog for every configured locale', () => {
    expect(localeCatalogLocales()).toEqual(APP_LOCALES)
  })

  it('keeps shared editor labels in English and Simplified Chinese', () => {
    expect(translate('en', 'editor.callout.defaultHeading')).toBe('Note')
    expect(translate('zh-CN', 'editor.callout.defaultHeading')).toBe('备注')
    expect(translate('zh-CN', 'sidebar.nav.memoTimeline')).toBe('Memo 时间线')
  })
})
