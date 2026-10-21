import { describe, expect, it } from 'vitest'
import { createImageDirectives } from '../../images/imagePipelinePlugin.ts'

const PLAYER_PATH = '/player/resource/'

const root = new URL('file://' + PLAYER_PATH)
const at = (path: string) => new URL(`file://${path}`)
const directivesFor = createImageDirectives(root)

describe('createImageDirectives', () => {
    it('serves AVIF first and WebP last for images under the resource root', () => {
        const result = directivesFor(at(PLAYER_PATH + 'player-identity/hero.png'))

        expect(result.get('format')).toBe('avif;webp')
    })

    it('requests several ascending widths', () => {
        const widths =
            directivesFor(at(PLAYER_PATH + 'hero.png'))
                .get('w')
                ?.split(';')
                .map(Number) ?? []

        expect(widths.length).toBeGreaterThan(1)
        expect(widths).toEqual([...widths].sort((a, b) => a - b))
    })

    it('leaves images outside the resource root untouched', () => {
        expect([...directivesFor(at('/player/src/assets/logo.png'))]).toEqual([])
    })

    it('does not match a sibling folder that merely shares the prefix', () => {
        expect([...directivesFor(at('/player/resource-old/hero.png'))]).toEqual([])
    })
})
