<script setup lang="ts">
// SPIKE (throwaway): TanStack Form with our schema, the kit fields and the port. Not for main.
import { VButton, VPasswordField, VTextField } from '@bamboom/common'
import { useForm } from '@tanstack/vue-form'
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { authServiceKey } from '../authServiceKey'
import type { TranslatableMessage } from '../errors/validationFailure'
import { formSchemas } from '../schemas/formSchemas'
import { validateInput } from '../schemas/validateInput'

const { t } = useI18n()
const authService = inject(authServiceKey)

const logInForm = useForm({
    defaultValues: { email: '', password: '' },
    validators: {
        // Our validator instead of the bare schema: it keeps the numbers a message needs ({ minimum }).
        onSubmit: ({ value }) => {
            const validation = validateInput(formSchemas.logIn, value)
            return validation.ok ? undefined : { fields: validation.failure.fieldMessages }
        }
    },
    onSubmit: async ({ value }) => {
        // TanStack hands over the raw values, not the schema output: validate again to get the trimmed email.
        const validation = validateInput(formSchemas.logIn, value)
        if (!validation.ok || !authService) return
        console.log('[spike] log-in answer', await authService.logIn(validation.value))
    }
})

const isSubmitting = logInForm.useStore((state) => state.isSubmitting)

/** TanStack keeps every error of a field in an array: the screen shows the first one, translated. */
function translateFirstError(errors: readonly (TranslatableMessage | undefined)[]) {
    const firstError = errors.find((error) => error !== undefined)
    return firstError ? t(firstError.key, firstError.values) : undefined
}
</script>

<template>
    <h1 class="text-center text-2xl font-bold">{{ t('playerIdentity.login.title') }}</h1>
    <!-- novalidate: the browser's own bubbles would show before our messages. -->
    <form novalidate class="mt-6 flex flex-col gap-4" @submit.prevent="logInForm.handleSubmit()">
        <logInForm.Field v-slot="{ field }" name="email">
            <VTextField
                label="Email"
                type="email"
                autocomplete="email"
                :model-value="field.state.value"
                :error="translateFirstError(field.state.meta.errors)"
                @update:model-value="field.handleChange"
                @blur="field.handleBlur"
            />
        </logInForm.Field>
        <logInForm.Field v-slot="{ field }" name="password">
            <VPasswordField
                label="Password"
                autocomplete="current-password"
                :model-value="field.state.value"
                :error="translateFirstError(field.state.meta.errors)"
                @update:model-value="field.handleChange"
                @blur="field.handleBlur"
            />
        </logInForm.Field>
        <VButton type="submit" :loading="isSubmitting">Log in</VButton>
    </form>
</template>
