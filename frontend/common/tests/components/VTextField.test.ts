import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import EnvelopeIcon from '~icons/ph/envelope'
import VIcon from '../../src/icons/VIcon.vue'
import VTextField from '../../src/components/VTextField.vue'

enableAutoUnmount(afterEach)

const mountField = (props = {}, attrs = {}, slots = {}) => mount(VTextField, { props: { label: 'Email', ...props }, attrs, slots })

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

    it('is not invalid by default', () => {
        const wrapper = mountField()

        expect(wrapper.attributes('data-state')).toBeUndefined()
        expect(wrapper.get('input').attributes('aria-invalid')).toBeUndefined()
        expect(wrapper.find('p').exists()).toBe(false)
    })

    it('shows the error and links it to the input', () => {
        const wrapper = mountField({ error: 'Enter a valid email' })
        const message = wrapper.get('p')
        const input = wrapper.get('input')

        expect(message.text()).toBe('Enter a valid email')
        expect(input.attributes('aria-invalid')).toBe('true')
        expect(input.attributes('aria-describedby')).toBe(message.attributes('id'))
        expect(wrapper.attributes('data-state')).toBe('invalid')
    })

    it('shows a check at the end when the value is valid', () => {
        const wrapper = mountField({ valid: true })

        expect(wrapper.attributes('data-state')).toBe('valid')
        expect(wrapper.findAllComponents(VIcon)).toHaveLength(1)
    })

    it('shows no check when nothing says the value is valid', () => {
        expect(mountField().findAllComponents(VIcon)).toHaveLength(0)
    })

    it('prefers the error over the check', () => {
        const wrapper = mountField({ valid: true, error: 'Too short' })

        expect(wrapper.attributes('data-state')).toBe('invalid')
        expect(wrapper.findAllComponents(VIcon)).toHaveLength(0)
    })

    it('shows the icon at the start when it is given one', () => {
        expect(mountField({ icon: EnvelopeIcon }).findComponent(VIcon).exists()).toBe(true)
    })

    it('passes disabled and readonly to the input', () => {
        const wrapper = mountField({}, { disabled: true, readonly: true })

        expect(wrapper.get('input').attributes('disabled')).toBeDefined()
        expect(wrapper.get('input').attributes('readonly')).toBeDefined()
    })

    it('shows what the caller puts at the end, after the input', () => {
        const endAction = 'data-action="end"'
        const wrapper = mountField({}, {}, { end: `<button ${endAction} />` })
        const html = wrapper.html()

        expect(html).toContain(endAction)
        expect(html.indexOf('<input')).toBeLessThan(html.indexOf(endAction))
    })
})
