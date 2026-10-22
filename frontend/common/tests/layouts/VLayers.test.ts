import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VLayers from '../../src/layouts/VLayers.vue'
import VPicture from '../../src/images/VPicture.vue'

// Reads the layer roles in DOM order, so tests assert on structure and not on CSS.
const layersOf = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('[data-layer]').map((layer) => (layer.element as HTMLElement).dataset.layer)

describe('VLayers', () => {
    it('renders the default slot as the content layer', () => {
        const wrapper = mount(VLayers, { slots: { default: '<p>Hello</p>' } })

        expect(wrapper.get('[data-layer="content"]').text()).toBe('Hello')
    })

    it('keeps base, content and overlay in this DOM order', () => {
        const wrapper = mount(VLayers, {
            slots: { overlay: 'o', default: 'c', base: 'b' } // given out of order on purpose
        })

        expect(layersOf(wrapper)).toEqual(['base', 'content', 'overlay'])
    })

    it('does not render base and overlay when their slots are missing', () => {
        const wrapper = mount(VLayers, { slots: { default: 'c' } })

        expect(layersOf(wrapper)).toEqual(['content'])
    })

    it('forwards class and attributes to the root element', () => {
        const wrapper = mount(VLayers, {
            attrs: { class: 'card', 'data-testid': 'card' },
            slots: { default: 'c' }
        })

        expect(wrapper.classes()).toContain('card')
        expect(wrapper.attributes('data-testid')).toBe('card')
    })

    it('hosts a decorative picture in base while the content stays readable', () => {
        const picture = { sources: { webp: 'a.webp 480w' }, img: { src: 'a.webp', w: 480, h: 640 } }
        const wrapper = mount(VLayers, {
            slots: {
                base: () => h(VPicture, { picture, alt: '' }),
                default: 'Card title'
            }
        })

        expect(wrapper.get('[data-layer="base"] img').attributes('alt')).toBe('')
        expect(wrapper.get('[data-layer="content"]').text()).toBe('Card title')
    })
})
