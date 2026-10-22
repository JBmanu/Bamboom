import { describe, expect, it } from 'vitest'
import hero from '../resource/image/element/bamboom-3.png?as=picture'

// Guards the wiring, not the library: if imagePipeline() leaves vite.config.ts, this import stops being a Picture.
describe('player image pipeline', () => {
    it('turns a source image into AVIF and WebP sources', () => {
        expect(Object.keys(hero.sources)).toEqual(['avif', 'webp'])
        expect(hero.sources.avif).toMatch(/\d+w/)
        expect(hero.img.w).toBeGreaterThan(0)
        expect(hero.img.h).toBeGreaterThan(0)
    })
})
