import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'
import VButton from '../../src/components/VButton.vue'
import { mountWithTranslations } from '../utils/mountWithTranslations.ts'

enableAutoUnmount(afterEach)

const mountButton = (options = {}) => mountWithTranslations(VButton, {}, options)

describe('VButton', () => {
    it('defaults to type="button" so it never submits a form by accident', async () => {
        const { wrapper } = await mountButton()
        expect(wrapper.attributes('type')).toBe('button')
    })

    it('lets the caller opt in to type="submit"', async () => {
        const { wrapper } = await mountButton({ props: { type: 'submit' } })
        expect(wrapper.attributes('type')).toBe('submit')
    })

    it('is a primary button by default', async () => {
        const { wrapper } = await mountButton()
        expect(wrapper.attributes('data-variant')).toBe('primary')
    })

    it('can be a ghost button', async () => {
        const { wrapper } = await mountButton({ props: { variant: 'ghost' } })
        expect(wrapper.attributes('data-variant')).toBe('ghost')
    })

    it('shows its label', async () => {
        const { wrapper } = await mountButton({ slots: { default: 'Play' } })
        expect(wrapper.text()).toBe('Play')
    })

    it('shows icons before and after the label', async () => {
        const iconStart = 'data-icon="start"'
        const iconEnd = 'data-icon="end"'
        const play = 'Play'

        const { wrapper } = await mountButton({
            slots: {
                start: `<svg ${iconStart} />`,
                default: play,
                end: `<svg ${iconEnd} />`
            }
        })
        const html = wrapper.html()

        expect(html).toContain(iconStart)
        expect(html).toContain(play)
        expect(html).toContain(iconEnd)
        expect(html.indexOf(iconStart)).toBeLessThan(html.indexOf(play))
        expect(html.indexOf(play)).toBeLessThan(html.indexOf(iconEnd))
    })
})
