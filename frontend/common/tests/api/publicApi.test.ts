import { describe, expect, it } from 'vitest'
import * as common from '../../src'

describe('the public API', () => {
    it.each([
        'VIcon',
        'VModal',
        'VLayer',
        'VBanner',
        'VButton',
        'VSpinner',
        'VPicture',
        'VTextField',
        'ThemeToggle',
        'VPasswordField',
        'VStrengthMeter',
        'LanguageSwitcher'
    ])('exports %s', (name) => {
        expect(common).toHaveProperty(name)
    })
})
