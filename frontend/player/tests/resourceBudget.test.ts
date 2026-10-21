// @vitest-environment node
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { isRasterFile } from '@bamboom/common'

const RESOURCE_DIR = fileURLToPath(new URL('../resource/', import.meta.url))
const MAX_BYTES = 2 * 1024 * 1024
const MAX_SIDE = 2560

const sources = readdirSync(RESOURCE_DIR, { recursive: true, encoding: 'utf8' }).filter(isRasterFile)

describe('player source images', () => {
    it('finds the images', () => {
        expect(sources.length).toBeGreaterThan(0)
    })

    it.each(sources)('%s stays within the size budget', async (file) => {
        const path = join(RESOURCE_DIR, file)
        const { width = 0, height = 0 } = await sharp(path).metadata()

        expect(statSync(path).size).toBeLessThanOrEqual(MAX_BYTES)
        expect(Math.max(width, height)).toBeLessThanOrEqual(MAX_SIDE)
    })
})
