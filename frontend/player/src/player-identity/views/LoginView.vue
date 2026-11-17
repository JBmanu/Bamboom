<script setup lang="ts">
import { VBanner, VButton, VPasswordField, VTextField } from '@bamboom/common'
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
import { ref, useTemplateRef } from 'vue'
import { failures, type Failure } from '../errors/failures'

const authService = useAuthService()
const session = useSessionStore()
const router = useRouter()
const { t } = useI18n()

/** The last refusal of the server, shown in the banner until the next submit. */
const KEY_TEMPLATE_REF: string = 'logInFormElement'
const serverFailure = ref<Failure>()
const logInFormElement = useTemplateRef(KEY_TEMPLATE_REF)

/** After wrong credentials the person retypes the password: it is emptied and focused, the email stays. */
function prepareForAnotherPassword() {
    // dontValidate: after a submit every change is checked, and an empty password would add "required" under the banner.
    logInForm.setFieldValue('password', '', { dontValidate: true })
    const passwordInput = logInFormElement.value?.elements.namedItem('password')
    if (passwordInput instanceof HTMLInputElement) passwordInput.focus()
}

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
        serverFailure.value = undefined // a new attempt: the old answer no longer applies
        const answer = await authService.logIn(validation.value)
        if (!answer.ok) {
            serverFailure.value = answer.failure
            if (answer.failure.code === failures.invalidCredentials.code) prepareForAnotherPassword()
            return
        }
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

        <VBanner v-if="serverFailure" variant="error">{{ t(serverFailure.messageKey) }}</VBanner>

        <!-- novalidate: the browser's own bubbles would appear before our messages, in another style and language. -->
        <form ref="{{KEY_TEMPLATE_REF}}" novalidate class="flex flex-col gap-4" @submit.prevent="logInForm.handleSubmit()">
            <logInForm.Field v-slot="{ field }" name="email">
                <VTextField
                    :label="t('playerIdentity.login.emailLabel')"
                    :icon="LeafIcon"
                    name="email"
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
                    name="password"
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
