import { describe, expect, it } from 'vitest'
import * as common from '../../src'

describe('the public API', () => {
    it.each(['VButton', 'VIcon', 'VSpinner', 'VTextField', 'VPasswordField', 'VBanner', 'VStrengthMeter'])('exports %s', (name) => {
        expect(common).toHaveProperty(name)
    })
})
