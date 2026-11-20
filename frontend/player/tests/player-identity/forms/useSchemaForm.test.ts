import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, useTemplateRef } from 'vue'
import { createI18n } from 'vue-i18n'
import { type Failure, failures } from '../../../src/player-identity/errors/failures'
import { useSchemaForm } from '../../../src/player-identity/forms/useSchemaForm'
import { formSchemas, type FormValues } from '../../../src/player-identity/schemas/formSchemas'
import { ValidationFailure } from '../../../src/player-identity/errors/validationFailure.ts'

type LogInValues = FormValues['logIn']
type LogInFieldName = keyof LogInValues
type SubmitValidValues = (values: LogInValues) => Promise<Failure | ValidationFailure<LogInFieldName> | undefined>
type FieldOfFailure = Readonly<Record<string, LogInFieldName>>
type LogInSchemaForm = ReturnType<typeof useSchemaForm<typeof formSchemas.logIn>>

/** A field mounted the way the screens do it: without a mounted field, TanStack never runs the change listeners. */
function renderField(form: LogInSchemaForm['form'], name: LogInFieldName) {
    return h(
        form.Field,
        { name },
        {
            default: ({ field }: { field: { state: { value: string }; handleChange: (value: string) => void } }) =>
                h('input', {
                    name,
                    value: field.state.value,
                    onInput: (event: Event) => field.handleChange((event.target as HTMLInputElement).value)
                })
        }
    )
}

/** Mounts a tiny form that uses the composable, because a composable can only run inside a component. */
function mountForm(submitValidValues: SubmitValidValues, fieldOfFailure?: FieldOfFailure) {
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
                fieldOfFailure,
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
                    [renderField(schemaForm.form, 'email'), renderField(schemaForm.form, 'password')]
                )
        }
    })
    // attachTo: focus only works on elements that are in the page.
    const wrapper = mount(Host, { global: { plugins: [i18n] }, attachTo: document.body })
    return { wrapper, schemaForm }
}

/** Fills valid values and submits, as the person would. */
async function submitFormWithValidValues({ wrapper, schemaForm }: ReturnType<typeof mountForm>) {
    schemaForm.form.setFieldValue('email', 'ada@example.com')
    schemaForm.form.setFieldValue('password', 'correct-horse-9')
    await wrapper.find('form').trigger('submit')
    await flushPromises() // the server's answer and the messages arrive asynchronously
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

describe('useSchemaForm: the server refuses', () => {
    const emailRefusedMessage = { key: 'emailRefused', values: {} }
    const passwordRefusedMessage = { key: 'passwordRefused', values: {} }
    const failureOnBothFields: ValidationFailure<LogInFieldName> = {
        kind: 'validation',
        fieldMessages: { email: emailRefusedMessage, password: passwordRefusedMessage }
    }

    it('given a failure that has no field, when the form is submitted, then it goes to the banner and no field is marked', async () => {
        const mounted = mountForm(async () => failures.networkUnreachable)

        await submitFormWithValidValues(mounted)

        const { form, serverFailure } = mounted.schemaForm
        expect(serverFailure.value).toBe(failures.networkUnreachable)
        expect(form.getFieldMeta('email')?.errors).toEqual([])
        expect(form.getFieldMeta('password')?.errors).toEqual([])
    })

    it('given messages from the server, when the person edits one field, then only that message goes away', async () => {
        const mounted = mountForm(async () => failureOnBothFields)
        await submitFormWithValidValues(mounted)
        const { form } = mounted.schemaForm

        await mounted.wrapper.find('input[name="email"]').setValue('other@example.com') // typing, as a person does
        await flushPromises()

        expect(form.getFieldMeta('email')?.errors).toEqual([])
        expect(form.getFieldMeta('password')?.errors).toEqual([passwordRefusedMessage])
    })

    it('given a message from the server, when the form is submitted again, then the old message is forgotten and the new attempt reaches the server', async () => {
        const submitValidValues = vi.fn<SubmitValidValues>().mockResolvedValueOnce(failures.emailAlreadyRegistered).mockResolvedValueOnce(undefined)
        const mounted = mountForm(submitValidValues, { [failures.emailAlreadyRegistered.code]: 'email' })
        await submitFormWithValidValues(mounted)
        const { form } = mounted.schemaForm
        expect(form.getFieldMeta('email')?.errors).toHaveLength(1) // precondition: without it the test could pass without ever showing the message

        await mounted.wrapper.find('form').trigger('submit')
        await flushPromises()

        expect(submitValidValues).toHaveBeenCalledTimes(2)
        expect(form.getFieldMeta('email')?.errors).toEqual([])
    })

    it('given a validation failure from the server, when the form is submitted, then each field shows its own message and the first one has the focus', async () => {
        // Password first on purpose: the focus must follow the order of the form, not the order of the server's answer.
        const passwordListedFirst: ValidationFailure<LogInFieldName> = {
            kind: 'validation',
            fieldMessages: { password: passwordRefusedMessage, email: emailRefusedMessage }
        }
        const mounted = mountForm(async () => passwordListedFirst)

        await submitFormWithValidValues(mounted)

        const { form } = mounted.schemaForm
        expect(form.getFieldMeta('email')?.errors).toEqual([emailRefusedMessage])
        expect(form.getFieldMeta('password')?.errors).toEqual([passwordRefusedMessage])
        expect(document.activeElement).toBe(mounted.wrapper.find('input[name="email"]').element)
    })
})
