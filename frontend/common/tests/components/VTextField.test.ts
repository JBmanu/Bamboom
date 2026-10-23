import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import VTextField from '../../src/components/VTextField.vue'

enableAutoUnmount(afterEach)

const mountField = (props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) =>
    mount(VTextField, { props: { label: 'Email', ...props }, attrs })

describe('VTextField', () => {
    it('labels the input with the label prop', () => {
        const wrapper = mountField()
        const label = wrapper.get('label')

        expect(label.text()).toBe('Email')
        expect(label.attributes('for')).toBe(wrapper.get('input').attributes('id'))
    })

    it('shows the value it is given', () => {
        const wrapper = mountField({ modelValue: 'ada@example.com' })

        expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('ada@example.com')
    })

    it('reports what the person types', async () => {
        const wrapper = mountField()
        await wrapper.get('input').setValue('ada')

        expect(wrapper.emitted('update:modelValue')).toEqual([['ada']])
    })

    it('puts type and autocomplete on the input, not on the outer box', () => {
        const wrapper = mountField({}, { type: 'email', autocomplete: 'email' })

        expect(wrapper.get('input').attributes()).toMatchObject({ type: 'email', autocomplete: 'email' })
        expect(wrapper.attributes('type')).toBeUndefined()
    })

    it('puts class on the outer box so the caller can size the whole field', () => {
        const wrapper = mountField({}, { class: 'w-full' })

        expect(wrapper.classes()).toContain('w-full')
        expect(wrapper.get('input').classes()).not.toContain('w-full')
    })

    // The floating label looks at :placeholder-shown, which only works with a one-space placeholder.
    it('keeps its own placeholder even if the caller passes one', () => {
        const wrapper = mountField({}, { placeholder: 'ada@example.com' })

        expect(wrapper.get('input').attributes('placeholder')).toBe(' ')
    })

    it('gives every field its own id', () => {
        const Pair = defineComponent({ render: () => h('div', [h(VTextField, { label: 'A' }), h(VTextField, { label: 'B' })]) })
        const ids = mount(Pair)
            .findAll('input')
            .map((input) => input.attributes('id'))

        expect(new Set(ids).size).toBe(2)
    })
})
