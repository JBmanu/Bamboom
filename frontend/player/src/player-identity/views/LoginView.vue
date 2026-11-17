<script setup lang="ts">
import { VButton, VPasswordField, VTextField } from '@bamboom/common'
import { revalidateLogic, useForm } from '@tanstack/vue-form'
import { I18nT, useI18n } from 'vue-i18n'
import LeafIcon from '~icons/ph/leaf'
import LockIcon from '~icons/ph/lock-fill'
import type { TranslatableMessage } from '../errors/validationFailure'
import { formSchemas } from '../schemas/formSchemas'
import { validateInput } from '../schemas/validateInput'
import { useRouter } from 'vue-router'
import { LOGIN_PATH } from '../routePaths'
import { useSessionStore } from '../stores/useSessionStore'
import { useAuthService } from '../useAuthService'

const authService = useAuthService()
const session = useSessionStore()
const router = useRouter()
const { t } = useI18n()

const logInForm = useForm({
    defaultValues: { email: '', password: '' },
    // Nothing is checked before the first submit; after it, every change is checked again, so a fixed field clears at once.
    validationLogic: revalidateLogic(),
    validators: {
        // Our validator, not the bare schema: it keeps the numbers a message needs ({ minimum }) and the first-message rule.
        onDynamic: ({ value }) => {
            const validation = validateInput(formSchemas.logIn, value)
            return validation.ok ? undefined : { fields: validation.failure.fieldMessages }
        }
    },
    onSubmit: async ({ value }) => {
        // TanStack hands over the typed values, not the schema output: validating again gives the trimmed email.
        const validation = validateInput(formSchemas.logIn, value)
        if (!validation.ok) return
        const answer = await authService.logIn(validation.value)
        if (!answer.ok) return // the failures get their banner in the next step
        session.startSession(answer.value)
        // Opening this page again lets the route guard decide where a signed-in person goes: this module does not know the home.
        await router.replace({ path: LOGIN_PATH, force: true })
    }
})

/** TanStack keeps every error of a field in a list: the screen shows the first one, translated. */
function translateFirstError(errors: readonly (TranslatableMessage | undefined)[]) {
    const firstError = errors.find((error) => error !== undefined)
    return firstError ? t(firstError.key, firstError.values) : undefined
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <header class="text-center">
            <h1 class="text-2xl font-bold">{{ t('playerIdentity.login.title') }}</h1>
            <I18nT scope="global" keypath="playerIdentity.login.subtitle" tag="p" class="mt-1 text-foreground-muted">
                <template #highlight>
                    <strong class="font-semibold text-link">{{ t('playerIdentity.login.subtitleHighlight') }}</strong>
                </template>
            </I18nT>
        </header>

        <!-- novalidate: the browser's own bubbles would appear before our messages, in another style and language. -->
        <form novalidate class="flex flex-col gap-4" @submit.prevent="logInForm.handleSubmit()">
            <logInForm.Field v-slot="{ field }" name="email">
                <VTextField
                    :label="t('playerIdentity.login.emailLabel')"
                    :icon="LeafIcon"
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
                    :label="t('playerIdentity.login.passwordLabel')"
                    :icon="LockIcon"
                    autocomplete="current-password"
                    :model-value="field.state.value"
                    :error="translateFirstError(field.state.meta.errors)"
                    @update:model-value="field.handleChange"
                    @blur="field.handleBlur"
                />
            </logInForm.Field>
            <VButton type="submit" class="mt-2 w-full">{{ t('playerIdentity.login.submit') }}</VButton>
        </form>

        <p class="text-center text-sm text-link">{{ t('playerIdentity.login.botFreeNote') }}</p>
    </div>
</template>
