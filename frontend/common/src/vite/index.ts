// Build-time plugins only. Node loads this from vite.config.ts, so keep the ".ts" extensions.

export { iconsPlugin } from './iconsPlugin.ts'
export { themeInitPlugin } from '../theme/themeInit.ts'
export { imagePipelinePlugin } from './imagePipelinePlugin.ts'
export { translationsPlugin } from '../translations/translationsPlugin.ts'
