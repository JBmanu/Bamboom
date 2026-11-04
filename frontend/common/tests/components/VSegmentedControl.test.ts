import { type Component, defineComponent, h, type VNodeChild } from 'vue'
import { type DOMWrapper, enableAutoUnmount, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import VSegmentedControl from '../../src/components/VSegmentedControl.vue'

enableAutoUnmount(afterEach)

const options = [
    { value: 'first', name: 'First one' },
    { value: 'second', name: 'Second one' }
]

type MountControlOptions = { modelValue?: string; optionSlot?: () => VNodeChild; copies?: number }

/** Mounts `copies` controls in the same app, as a page would: one by default, two to check what they share. */
function mountControl({ modelValue = 'first', optionSlot, copies = 1 }: MountControlOptions = {}) {
    const props = { legend: 'Pick one', options, modelValue }
    const slots = optionSlot ? { option: optionSlot } : {}
    const Page = defineComponent({
        render: () => h('div', Array.from({ length: copies }, () => h(VSegmentedControl as Component, props, slots)))
    })
    return mount(Page)
}

const radio = (wrapper: VueWrapper, value: string) => wrapper.get<HTMLInputElement>(`input[value="${ value }"]`)
const nameOf = (label: DOMWrapper<Element>) => label.element.lastElementChild?.textContent

describe('VSegmentedControl', () => {
    it('is a group named by its legend, with one radio per option', () => {
        const wrapper = mountControl()

        expect(wrapper.get('fieldset legend').text()).toBe('Pick one')
        expect(wrapper.findAll('input[type="radio"]')).toHaveLength(2)
    })

    it('puts the options in one radio group, a different one for every control', () => {
        const wrapper = mountControl({ copies: 2 })
        const [first, second] = wrapper.findAll('fieldset').map((fieldset) => fieldset.findAll('input').map((input) => input.attributes('name')))

        expect(new Set(first).size).toBe(1)
        expect(first[0]).not.toBe(second[0])
    })

    it('checks the option given by the model', () => {
        const wrapper = mountControl({ modelValue: 'second' })

        expect(radio(wrapper, 'second').element.checked).toBe(true)
        expect(radio(wrapper, 'first').element.checked).toBe(false)
    })

    it('announces the option chosen', async () => {
        const wrapper = mountControl()

        await radio(wrapper, 'second').setValue()

        expect(wrapper.getComponent(VSegmentedControl).emitted('update:modelValue')).toEqual([['second']])
    })

    it('gives every option a readable name and the same name as tooltip', () => {
        const labels = mountControl().findAll('label')

        expect(labels.map(nameOf)).toEqual(['First one', 'Second one'])
        expect(labels.map((label) => label.attributes('title'))).toEqual(['First one', 'Second one'])
    })

    it('shows what the option slot gives, hidden from screen readers, and keeps the name readable', () => {
        const [label] = mountControl({ optionSlot: () => h('span', { class: 'icon' }, '★') }).findAll('label')

        expect(label.get('[aria-hidden="true"]').text()).toBe('★')
        expect(nameOf(label)).toBe('First one')
    })

    it('shows the name as face when no slot is given', () => {
        const [label] = mountControl().findAll('label')

        expect(label.get('[aria-hidden="true"]').text()).toBe('First one')
    })
})