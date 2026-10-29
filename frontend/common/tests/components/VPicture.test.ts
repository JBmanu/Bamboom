import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VPicture from '../../src/components/VPicture.vue'
import type { Picture } from '../../src/images/picture.ts'

const picture: Picture = {
    sources: {
        avif: '/hero-480.avif 480w, /hero-745.avif 745w',
        webp: '/hero-480.webp 480w, /hero-745.webp 745w'
    },
    img: { src: '/hero-745.webp', w: 745, h: 1278 }
}

const render = (props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) =>
    mount(VPicture, { props: { picture, alt: 'A hero', ...props }, attrs })

describe('VPicture', () => {
    it('renders one <source> per format, AVIF before WebP', () => {
        const sources = render().findAll('source')

        expect(sources.map((s) => s.attributes('type'))).toEqual(['image/avif', 'image/webp'])
        expect(sources[0].attributes('srcset')).toBe(picture.sources.avif)
    })

    it('uses the fallback image with its intrinsic size, so the layout does not jump', () => {
        const img = render().get('img')

        expect(img.attributes()).toMatchObject({ src: '/hero-745.webp', width: '745', height: '1278' })
    })

    it('renders the alt text, and an empty one for decorative images', () => {
        expect(render().get('img').attributes('alt')).toBe('A hero')
        expect(render({ alt: '' }).get('img').attributes('alt')).toBe('')
    })

    it('loads lazily and decodes off the main thread by default', () => {
        const img = render().get('img')

        expect(img.attributes()).toMatchObject({ loading: 'lazy', decoding: 'async' })
        expect(img.attributes('fetchpriority')).toBeUndefined()
    })

    it('loads a priority image right away, at high priority', () => {
        const img = render({ priority: true }).get('img')

        expect(img.attributes()).toMatchObject({ loading: 'eager', fetchpriority: 'high' })
    })

    it('forwards sizes to every <source>, and omits it when not given', () => {
        const sized = render({ sizes: '(min-width: 768px) 50vw, 100vw' }).findAll('source')
        expect(sized.map((s) => s.attributes('sizes'))).toEqual(Array(2).fill('(min-width: 768px) 50vw, 100vw'))

        expect(render().get('source').attributes('sizes')).toBeUndefined()
    })

    it('renders only the <img> when the picture has a single format', () => {
        const single: Picture = { sources: {}, img: picture.img }
        const wrapper = render({ picture: single })

        expect(wrapper.findAll('source')).toHaveLength(0)
        expect(wrapper.find('img').exists()).toBe(true)
    })

    it('puts class and other attributes on the <img>, not on <picture>', () => {
        const wrapper = render({}, { class: 'rounded', 'data-testid': 'hero' })

        expect(wrapper.get('img').classes()).toContain('rounded')
        expect(wrapper.get('img').attributes('data-testid')).toBe('hero')
        expect(wrapper.get('picture').classes()).not.toContain('rounded')
    })
})

describe('VPicture props (checked by vue-tsc, not at runtime)', () => {
    it('requires an alt text', () => {
        // @ts-expect-error alt is required: pass "" for a decorative image
        mount(VPicture, { props: { picture } })
    })
})
