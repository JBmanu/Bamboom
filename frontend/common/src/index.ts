// --- TRANSLATIONS ---
export { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, languages } from './translations/language/languageConstants'
export { useLanguage } from './translations/language/useLanguage'
export { createTranslations } from './translations/createTranslations'
export type { Language } from './translations/language/languageConstants'
// --- vue-components ---

// --- COMPONENTS ---
export { default as VIcon } from './components/VIcon.vue'
export { default as VLayer } from './components/VLayer.vue'
export { default as VBanner } from './components/VBanner.vue'
export { default as VButton } from './components/VButton.vue'
export { default as VPicture } from './components/VPicture.vue'
export { default as VSpinner } from './components/VSpinner.vue'
export { default as VTextField } from './components/VTextField.vue'
export { default as ThemeToggle } from './components/ThemeToggle.vue'
export { default as VPasswordField } from './components/VPasswordField.vue'
export { default as VStrengthMeter } from './components/VStrengthMeter.vue'
export { default as LanguageSwitcher } from './components/LanguageSwitcher.vue'

// --- THEME ----
export { THEME_STORAGE_KEY, themes, preferences } from './theme/themeConstants'
export type { Preference, Theme } from './theme/themeConstants'
export { useTheme } from './theme/useTheme'

// --- IMAGE ---
export { RASTER_EXTENSIONS, isRasterFile } from './images/rasterFormats'
export type { Picture } from './images/picture'
