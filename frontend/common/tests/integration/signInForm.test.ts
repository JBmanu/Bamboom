import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { VButton, VPasswordField, VTextField } from '../../src'
import { mountWithTranslations } from '../utils/mountWithTranslations.ts'

enableAutoUnmount(afterEach)

// A form like the login screen will be: it only reports that it was submitted.
const SignInForm = defineComponent({
    props: { loading: Boolean },
    emits: ['submit'],
    setup(props, { emit }) {
        return () =>
            h(
                'form',
                {
                    onSubmit: (event: Event) => {
                        event.preventDefault()
                        emit('submit')
                    }
                },
                [
                    h(VTextField, { label: 'Email', name: 'email' }),
                    h(VPasswordField, { label: 'Password', name: 'password' }),
                    h(VButton, { type: 'submit', loading: props.loading }, () => 'Sign in')
                ]
            )
    }
})

const mountForm = (props = {}) => mountWithTranslations(SignInForm, {}, { props })

describe('integration test with sing-in form', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('submits when the button is pressed', async () => {
        const { wrapper } = await mountForm()
        await wrapper.get('button[type="submit"]').trigger('click')
        expect(wrapper.emitted('submit')).toHaveLength(1)
    })

    it('does not submit while the button is loading', async () => {
        const { wrapper } = await mountForm({ loading: true })
        await wrapper.get('button[type="submit"]').trigger('click')
        expect(wrapper.emitted('submit')).toBeUndefined()
    })

    it('does not submit when the password is shown or hidden', async () => {
        const { wrapper } = await mountForm()
        await wrapper.get('button[aria-pressed]').trigger('click')
        expect(wrapper.emitted('submit')).toBeUndefined()
    })

    it('sends what was typed under the field names', async () => {
        const { wrapper } = await mountForm()
        await wrapper.get('input[name="email"]').setValue('ada@example.com')
        await wrapper.get('input[name="password"]').setValue('s3cret')
        const entries = Object.fromEntries(new FormData(wrapper.element as HTMLFormElement))
        expect(entries).toEqual({ email: 'ada@example.com', password: 's3cret' })
    })
})
