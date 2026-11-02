import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import VSegmentedControl from '../../src/components/VSegmentedControl.vue'

enableAutoUnmount(afterEach)

const options = [
    { value: 'first', name: 'First one' },
    { value: 'second', name: 'Second one' }
]

const mountControl = (modelValue = 'first', slots = {}) => mount(VSegmentedControl, { props: { legend: 'Pick one', options, modelValue }, slots })

const radio = (wrapper: ReturnType<typeof mountControl>, value: string) => wrapper.get<HTMLInputElement>(`input[value="${value}"]`)

describe('VSegmentedControl', () => {
    it('is a group named by its legend, with one radio per option', () => {
        const wrapper = mountControl()

        expect(wrapper.get('fieldset legend').text()).toBe('Pick one')
        expect(wrapper.findAll('input[type="radio"]')).toHaveLength(2)
    })

    it('puts the options in one radio group, a different one for every control', () => {
        const first = mountControl()
            .findAll('input')
            .map((input) => input.attributes('name'))
        const second = mountControl()
            .findAll('input')
            .map((input) => input.attributes('name'))

        expect(new Set(first).size).toBe(1)
        expect(first[0]).not.toBe(second[0])
    })

    it('checks the option given by the model', () => {
        const wrapper = mountControl('second')

        expect(radio(wrapper, 'second').element.checked).toBe(true)
        expect(radio(wrapper, 'first').element.checked).toBe(false)
    })

    it('announces the option chosen', async () => {
        const wrapper = mountControl()

        await radio(wrapper, 'second').setValue()

        expect(wrapper.emitted('update:modelValue')).toEqual([['second']])
    })

    it('gives every option a readable name and the same name as tooltip', () => {
        const labels = mountControl().findAll('label')

        expect(labels.map((label) => label.text())).toEqual(['First one', 'Second one'])
        expect(labels.map((label) => label.attributes('title'))).toEqual(['First one', 'Second one'])
    })

    it('shows what the option slot gives, hidden from screen readers, and keeps the name readable', () => {
        const wrapper = mountControl('first', { option: '<span class="icon">★</span>' })
        const label = wrapper.findAll('label')[0]

        expect(label.get('[aria-hidden="true"]').text()).toBe('★')
        expect(label.text()).toContain('First one')
    })

    it('shows the name as face when no slot is given', () => {
        const label = mountControl().findAll('label')[0]

        expect(label.get('[aria-hidden="true"]').text()).toBe('First one')
    })
})
