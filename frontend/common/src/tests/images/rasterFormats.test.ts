import { describe, expect, it } from 'vitest'
import { isRasterFile, RASTER_EXTENSIONS } from '../../images/rasterFormats'

const files = ['hero', 'dir/hero', 'a.b'] as const
const unValidateFormat = ['.svg', 'png', '.png.txt', '.png?as=picture', '.md'] as const

const validateNames = RASTER_EXTENSIONS.flatMap((format) => files.map((file) => file + '.' + format))
const unValidateNames = unValidateFormat.flatMap((format) => files.map((file) => file + format))

describe('isRasterFile', () => {
    it.each(validateNames)('accepts %s', (path) => {
        expect(isRasterFile(path)).toBe(true)
    })

    it.each(unValidateNames)('rejects %s', (path) => {
        expect(isRasterFile(path)).toBe(false)
    })
})
