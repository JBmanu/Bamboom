import { validateInput } from '../schemas/validateInput'
import { type Failure } from '../errors/failures'
import { shallowRef, type ShallowRef } from 'vue'
import * as z from 'zod/mini'
import { revalidateLogic, useForm } from '@tanstack/vue-form'
import { type TranslatableMessage, ValidationFailure } from '../errors/validationFailure'
import { useI18n } from 'vue-i18n'

/** Our own key in the error map of a field: TanStack shows it but never clears it, so we do. */
const SERVER_MESSAGE_KEY = 'onServer'

type FieldName<Schema extends z.ZodMiniObject> = Extract<keyof z.input<Schema>, string>

// Schema is whatever schema the caller passes: field names and value types come from it.
type SchemaFormOptions<Schema extends z.ZodMiniObject> = {
    schema: Schema
    defaultValues: z.input<Schema>
    /** The `<form>` element: it is only used to move the focus to a field by its name. */
    formElement: Readonly<ShallowRef<HTMLFormElement | null>>
    /** Which field each failure is about: the screen knows it, the engine does not. Keyed by failure code. */
    fieldOfFailure?: Readonly<Record<string, FieldName<Schema>>>
    /** Receives the clean values; answers the failure to show, or nothing when it worked. */
    submitValidValues: (values: z.output<Schema>) => Promise<Failure | ValidationFailure<Extract<keyof z.input<Schema>, string>> | undefined>
}

/**
 * The form of one of the module's schemas: checked only after the first submit, then at every change.
 * The screen supplies `submitValidValues`; waiting, refusals and messages are handled here.
 */
export function useSchemaForm<Schema extends z.ZodMiniObject>(options: SchemaFormOptions<Schema>) {
    const { t } = useI18n()
    /** The server's last refusal, shown until the next submit. */
    const serverFailure = shallowRef<Failure>()
    const fieldNames = Object.keys(options.defaultValues) as FieldName<Schema>[]

    const form = useForm({
        defaultValues: options.defaultValues,
        validationLogic: revalidateLogic(),
        // A new edit makes the server's message about that field out of date.
        listeners: {
            onChange: ({ fieldApi }) => setServerMessage(fieldApi.name, undefined)
        },
        validators: {
            // Our validator, not the bare schema: it keeps the numbers a message needs ({ minimum }) and the first-message rule.
            onDynamic: ({ value }) => {
                const validation = validateInput(options.schema, value)
                return validation.ok ? undefined : { fields: validation.failure.fieldMessages }
            }
        },
        onSubmit: async ({ value }) => {
            const validation = validateInput(options.schema, value)
            if (!validation.ok) return
            serverFailure.value = undefined // new attempt: forget the old refusal
            const refusal = await options.submitValidValues(validation.value)
            if (refusal) showRefusal(refusal)
        }
    })

    /** Puts a refusal where the person looks: under its field, or in the banner when it is about no field in particular. */
    function showRefusal(refusal: Failure | ValidationFailure<FieldName<Schema>>) {
        if (refusal.kind === 'validation') {
            // Form order, not the server's: the focus goes to the first field the person sees.
            const refusedFields = fieldNames.filter((fieldName) => refusal.fieldMessages[fieldName])
            for (const fieldName of refusedFields) setServerMessage(fieldName, refusal.fieldMessages[fieldName])
            if (refusedFields[0]) focusField(refusedFields[0])
            return
        }
        const fieldName = options.fieldOfFailure?.[refusal.code]
        if (fieldName) {
            // A failure is a single message key with no numbers: the same shape a field message needs.
            setServerMessage(fieldName, { key: refusal.messageKey, values: {} })
            focusField(fieldName)
            return
        }
        serverFailure.value = refusal
    }

    function setServerMessage(fieldName: string, message: TranslatableMessage | undefined): void {
        form.setFieldMeta(fieldName as never, (meta) => ({
            ...meta,
            errorMap: { ...meta.errorMap, [SERVER_MESSAGE_KEY]: message }
        }))
    }

    function forgetAllServerMessages() {
        for (const fieldName of fieldNames) setServerMessage(fieldName, undefined)
    }

    /** True from the submit until the answer: the button shows a spinner meanwhile. */
    const isSubmitting = form.useSelector((state) => state.isSubmitting)

    /** Enter submits even while the button is loading: this blocks the second submit. */
    function submitUnlessWaiting() {
        if (isSubmitting.value) return
        forgetAllServerMessages() // before the submit: a leftover message would count as an invalid field and block it
        void form.handleSubmit() // isSubmitting already tells when it ends
    }

    /** A field can have several errors: show the first, translated. */
    function translateFirstError(errors: readonly (TranslatableMessage | undefined)[]) {
        const firstError = errors.find((error) => error !== undefined)
        return firstError ? t(firstError.key, firstError.values) : undefined
    }

    /** Focuses the input with this name. */
    function focusField(fieldName: Extract<keyof z.input<Schema>, string>) {
        const input = options.formElement.value?.elements.namedItem(fieldName)
        if (input instanceof HTMLInputElement) input.focus()
    }

    /** Empties a field without validating, or "required" would appear under the error banner. */
    function emptyField(fieldName: Extract<keyof z.input<Schema>, string>) {
        // TanStack wants exact field keys; with a generic schema TypeScript can't prove ours is one.
        form.setFieldValue(fieldName as never, '' as never, { dontValidate: true })
    }

    /** Whether this value alone follows the rule of its field: it does not wait for the first submit. */
    function isFieldValueValid(fieldName: Extract<keyof z.input<Schema>, string>, value: unknown) {
        return z.safeParse(options.schema.shape[fieldName], value).success
    }

    return {
        form,
        serverFailure,
        isSubmitting,
        isFieldValueValid,
        submitUnlessWaiting,
        translateFirstError,
        focusField,
        emptyField
    }
}
