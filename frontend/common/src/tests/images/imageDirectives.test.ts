import { describe, expect, it } from 'vitest'
import { createImageDirectives } from '../../images/imageDirectives'

// Same shape the plugin passes in: a file:// URL built from the module id.
const root = new URL('file:///app/player/resource/')
const directivesFor = createImageDirectives(root)
const at = (path: string) => new URL(`file://${path}`)

describe('createImageDirectives', () => {
    it('serves AVIF first and WebP last for images under the resource root', () => {
        const result = directivesFor(at('/app/player/resource/player-identity/hero.png'))

        // The LAST format becomes the <img> fallback in ?as=picture.
        expect(result.get('format')).toBe('avif;webp')
    })

    it('requests several ascending widths', () => {
        const widths = directivesFor(at('/app/player/resource/hero.png')).get('w')?.split(';').map(Number) ?? []

        expect(widths.length).toBeGreaterThan(1)
        expect(widths).toEqual([...widths].sort((a, b) => a - b))
    })

    it('leaves images outside the resource root untouched', () => {
        expect([...directivesFor(at('/app/player/src/assets/logo.png'))]).toEqual([])
    })

    it('does not match a sibling folder that merely shares the prefix', () => {
        expect([...directivesFor(at('/app/player/resource-old/hero.png'))]).toEqual([])
    })
})
