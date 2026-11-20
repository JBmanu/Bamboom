import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, useTemplateRef } from 'vue'
import { createI18n } from 'vue-i18n'
import { type Failure, failures } from '../../../src/player-identity/errors/failures'
import { useSchemaForm } from '../../../src/player-identity/forms/useSchemaForm'
import { formSchemas, type FormValues } from '../../../src/player-identity/schemas/formSchemas'

type LogInValues = FormValues['logIn']
type SubmitValidValues = (values: LogInValues) => Promise<Failure | undefined>
type LogInSchemaForm = ReturnType<typeof useSchemaForm<typeof formSchemas.logIn>>

/** Mounts a tiny form that uses the composable, because a composable can only run inside a component. */
function mountForm(submitValidValues: SubmitValidValues) {
    // Definite assignment: setup() runs while mounting, so the value exists once `mount` returns.
    let schemaForm!: LogInSchemaForm
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { tooShort: 'at least {minimum}' } } })
    const Host = defineComponent({
        setup() {
            const formElement = useTemplateRef<HTMLFormElement>('formElement')
            schemaForm = useSchemaForm({
                schema: formSchemas.logIn,
                defaultValues: { email: '', password: '' },
                formElement,
                submitValidValues
            })
            return () =>
                h(
                    'form',
                    {
                        ref: 'formElement',
                        onSubmit: (event: Event) => {
                            event.preventDefault()
                            schemaForm.submitUnlessWaiting()
                        }
                    },
                    [h('input', { name: 'email' }), h('input', { name: 'password' })]
                )
        }
    })
    // attachTo: focus only works on elements that are in the page.
    const wrapper = mount(Host, { global: { plugins: [i18n] }, attachTo: document.body })
    return { wrapper, schemaForm }
}

describe('useSchemaForm', () => {
    it('forgets the old refusal as soon as a new attempt starts', async () => {
        let answerTheServer!: () => void
        const submitValidValues = vi
            .fn<SubmitValidValues>()
            .mockResolvedValueOnce(failures.invalidCredentials) // 1st attempt: refused
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        answerTheServer = () => resolve(undefined)
                    })
            ) // 2nd: waits
        const { wrapper, schemaForm } = mountForm(submitValidValues)

        schemaForm.form.setFieldValue('email', 'ada@example.com')
        schemaForm.form.setFieldValue('password', 'correct-horse-9')

        await wrapper.find('form').trigger('submit')
        await flushPromises()
        expect(schemaForm.serverFailure.value).toBe(failures.invalidCredentials)

        await wrapper.find('form').trigger('submit') // the 2nd attempt now waits for the server
        await flushPromises()
        expect(schemaForm.serverFailure.value).toBeUndefined() // the old refusal is already gone
        answerTheServer() // lets the pending attempt finish
        await flushPromises()
    })

    it('translates the first error, skipping the empty entries and filling in the numbers', () => {
        const { schemaForm } = mountForm(async () => undefined)
        expect(schemaForm.translateFirstError([undefined, { key: 'tooShort', values: { minimum: 3 } }])).toBe('at least 3')
        expect(schemaForm.translateFirstError([])).toBeUndefined()
    })

    it.each<['email' | 'password', string, boolean]>([
        ['email', 'ada@example.com', true],
        ['email', ' ada@example.com ', true], // the schema trims: spaces do not make it invalid
        ['email', 'ada', false],
        ['password', '', false]
    ])('says whether %s "%s" follows the rule of its field: %s', (fieldName, value, expected) => {
        const { schemaForm } = mountForm(async () => undefined)

        expect(schemaForm.isFieldValueValid(fieldName, value)).toBe(expected)
    })
})
