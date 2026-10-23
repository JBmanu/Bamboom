import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EyeIcon from '~icons/ph/eye'
import VIcon from '../../src/icons/VIcon.vue'

const render = (props: { label?: string } = {}, attrs: Record<string, unknown> = {}) => mount(VIcon, { props: { icon: EyeIcon, ...props }, attrs })

describe('VIcon', () => {
    it('renders the given icon as an svg', () => {
        expect(render().element.tagName.toLowerCase()).toBe('svg')
    })

    // Most icons only decorate a text that already says the same thing.
    it('is hidden from assistive technology by default', () => {
        const icon = render()

        expect(icon.attributes('aria-hidden')).toBe('true')
        expect(icon.attributes('role')).toBeUndefined()
        expect(icon.attributes('aria-label')).toBeUndefined()
    })

    it('is announced as an image with its label when it carries meaning', () => {
        const icon = render({ label: 'Password visible' })

        expect(icon.attributes()).toMatchObject({ role: 'img', 'aria-label': 'Password visible' })
        expect(icon.attributes('aria-hidden')).toBeUndefined()
    })

    it('lets the caller size and color it through classes', () => {
        expect(render({}, { class: 'size-6 text-error' }).classes()).toEqual(expect.arrayContaining(['size-6', 'text-error']))
    })
})
