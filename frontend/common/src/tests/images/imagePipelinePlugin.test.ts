// @vitest-environment node
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp, { type Metadata } from 'sharp'
import { build, type Rolldown } from 'vite'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { Picture } from '../../images/picture'
import { imagePipelinePlugin } from '../../images/imagePipelinePlugin'

vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 })

const SOURCE = { width: 800, height: 600 }

type Asset = Rolldown.OutputAsset
type Built = { assets: Asset[]; picture: Picture }

let dir: string
let link: string
let hero: Built
let overridden: Built
let outside: Built
let viaLink: Built
let heroFiles: Metadata[]

const withExt = (assets: Asset[], ext: string) => assets.filter((a) => a.fileName.endsWith(ext))

const allOf = <T>(items: T[], check: (item: T) => boolean) => items.length > 0 && items.every(check)

async function bundle(entry: string, root = dir): Promise<Built> {
    const result = await build({
        root,
        logLevel: 'silent',
        configFile: false,
        plugins: [imagePipelinePlugin(pathToFileURL(join(root, 'resource/')))],
        build: {
            write: false,
            assetsInlineLimit: 0, // small files would be inlined as base64, hiding the ones we count
            rolldownOptions: { input: join(root, entry), preserveEntrySignatures: 'exports-only' }
        }
    })
    const { output } = (Array.isArray(result) ? result[0] : result) as Rolldown.RolldownOutput
    const chunk = output.find((o): o is Rolldown.OutputChunk => o.type === 'chunk')!
    const assets = output.filter((o): o is Asset => o.type === 'asset')
    const picture = (await import(`data:text/javascript,${encodeURIComponent(chunk.code)}`)).default
    return { assets, picture }
}

beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'image-pipeline-'))
    link = `${dir}-link`
    await Promise.all([mkdir(join(dir, 'resource')), mkdir(join(dir, 'elsewhere'))])

    const png = await sharp({ create: { ...SOURCE, channels: 4, background: { r: 200, g: 30, b: 30, alpha: 0 } } })
        .png()
        .toBuffer()

    await Promise.all([
        writeFile(join(dir, 'resource/hero.png'), png),
        writeFile(join(dir, 'elsewhere/logo.png'), png),
        writeFile(join(dir, 'picture.js'), "export { default } from './resource/hero.png?as=picture'"),
        writeFile(join(dir, 'override.js'), "export { default } from './resource/hero.png?as=picture&format=webp&w=300'"),
        writeFile(join(dir, 'outside.js'), "export { default } from './elsewhere/logo.png'"),
        symlink(dir, link)
    ])

    hero = await bundle('picture.js')
    overridden = await bundle('override.js')
    outside = await bundle('outside.js')
    viaLink = await bundle('picture.js', link)
    const converted = [...withExt(hero.assets, '.avif'), ...withExt(hero.assets, '.webp')]
    heroFiles = await Promise.all(converted.map((a) => sharp(Buffer.from(a.source)).metadata()))
})

afterAll(() => Promise.all([rm(dir, { recursive: true, force: true }), rm(link, { force: true })]))

describe('imagePipeline (integration)', () => {
    it('emits AVIF and WebP files for an image under the resource root', () => {
        expect(new Set(heroFiles.map((f) => f.format))).toEqual(new Set(['heif', 'webp']))
    })

    it('never enlarges the source', () => {
        expect(allOf(heroFiles, (f) => f.width <= SOURCE.width)).toBe(true)
    })

    it('keeps the alpha channel', () => {
        expect(allOf(heroFiles, (f) => f.hasAlpha)).toBe(true)
    })

    it('lets an explicit query override the defaults', () => {
        expect(withExt(overridden.assets, '.avif')).toHaveLength(0)
        expect(overridden.picture.sources.avif).toBeUndefined()
        expect(overridden.picture.img.w).toBe(300)
    })

    it('leaves images outside the resource root alone', () => {
        expect(withExt(outside.assets, '.avif')).toHaveLength(0)
        expect(withExt(outside.assets, '.webp')).toHaveLength(0)
        expect(withExt(outside.assets, '.png')).toHaveLength(1)
    })

    it('gives the same result when the resource root is reached through a symlink', () => {
        expect(viaLink.picture).toEqual(hero.picture)
    })
})

describe('?as=picture contract', () => {
    it('exposes sources per format plus a WebP fallback with intrinsic size', () => {
        const { sources, img } = hero.picture

        expect(Object.keys(sources)).toEqual(['avif', 'webp'])
        expect(sources.avif).toMatch(/\.avif \d+w/)
        expect(img).toEqual({ src: expect.stringMatching(/\.webp$/), w: expect.any(Number), h: expect.any(Number) })
        expect(img.h).toBeGreaterThan(0)
    })
})
