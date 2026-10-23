import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EyeIcon from '~icons/ph/eye'

describe('iconsPlugin', () => {
    it('turns an Iconify import into a component that renders an svg', () => {
        expect(mount(EyeIcon).element.tagName.toLowerCase()).toBe('svg')
    })

    // Why 1em: an icon must grow with the text around it, not with a fixed size.
    it('sizes icons relative to the surrounding text', () => {
        expect(mount(EyeIcon).element.getAttribute('width')).toBe('1em')
    })
})
