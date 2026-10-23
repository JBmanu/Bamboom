import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'
import VButton from '../../src/components/VButton.vue'
import { mountWithTranslations } from '../utils/mountWithTranslations.ts'
import VSpinner from '../../src/components/VSpinner.vue'

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
            slots: { start: `<svg ${iconStart} />`, default: play, end: `<svg ${iconEnd} />` }
        })
        const html = wrapper.html()

        expect(html.indexOf(iconStart)).toBeLessThan(html.indexOf(play))
        expect(html.indexOf(play)).toBeLessThan(html.indexOf(iconEnd))
    })

    it('is natively disabled when asked', async () => {
        const { wrapper } = await mountButton({ props: { disabled: true } })
        expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('does not call click handlers when disabled', async () => {
        const handleClick = vi.fn()
        const { wrapper } = await mountButton({ props: { disabled: true, onClick: handleClick } })
        await wrapper.trigger('click')
        expect(handleClick).not.toHaveBeenCalled()
    })

    it('is not busy by default', async () => {
        const { wrapper } = await mountButton()
        expect(wrapper.attributes('aria-busy')).toBeUndefined()
    })

    it('announces that it is busy while loading', async () => {
        const { wrapper } = await mountButton({ props: { loading: true } })
        expect(wrapper.attributes('aria-busy')).toBe('true')
    })

    it('keeps its label while loading', async () => {
        const play = 'Play'
        const { wrapper } = await mountButton({ props: { loading: true }, slots: { default: play } })
        expect(wrapper.text()).toBe(play)
    })

    it('shows a spinner instead of the start icon while loading', async () => {
        const iconStart = 'data-icon="start"'
        const iconEnd = 'data-icon="end"'
        const play = 'Play'

        const { wrapper } = await mountButton({
            props: { loading: true },
            slots: { start: `<svg ${iconStart} />`, default: play, end: `<svg ${iconEnd} />` }
        })

        const html = wrapper.html()
        expect(html).toContain(iconEnd)
        expect(html).not.toContain(iconStart)
        expect(wrapper.findComponent(VSpinner).exists()).toBe(true)
    })

    it('stays focusable while loading', async () => {
        const { wrapper } = await mountButton({ props: { loading: true } })
        expect(wrapper.attributes('disabled')).toBeUndefined()
    })

    it('ignores clicks while loading', async () => {
        const handleClick = vi.fn()
        const { wrapper } = await mountButton({ props: { loading: true, onclick: handleClick } })
        await wrapper.trigger('click')
        expect(handleClick).not.toHaveBeenCalled()
    })

    it('cancels the browser default while loading', async () => {
        const click = new MouseEvent('click', { bubbles: true, cancelable: true })
        const { wrapper } = await mountButton({ props: { loading: true } })
        expect(wrapper.element.dispatchEvent(click)).toBe(false)
    })

    it('passes its own attributes to the button', async () => {
        const classValue = 'wide'
        const ariaLabelValue = 'Go'

        const { wrapper } = await mountButton({
            props: { class: classValue, 'aria-label': ariaLabelValue }
        })

        expect(wrapper.classes()).toContain(classValue)
        expect(wrapper.attributes('aria-label')).toBe(ariaLabelValue)
    })
})
