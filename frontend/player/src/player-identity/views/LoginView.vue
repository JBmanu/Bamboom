<script setup lang="ts">
import { VBanner, VButton, VPasswordField, VTextField } from '@bamboom/common'
import { I18nT, useI18n } from 'vue-i18n'
import LeafIcon from '~icons/ph/leaf'
import LockIcon from '~icons/ph/lock-fill'
import { useTemplateRef } from 'vue'
import { useSchemaForm } from '../forms/useSchemaForm.ts'
import AuthPageHeader from '../components/AuthPageHeader.vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/useSessionStore.ts'
import { useAuthService } from '../useAuthService.ts'
import { formSchemas } from '../schemas/formSchemas.ts'
import { failures } from '../errors/failures.ts'
import { LOGIN_PATH } from '../routePaths.ts'

const authService = useAuthService()
const session = useSessionStore()
const router = useRouter()
const { t } = useI18n()

const logInFormElement = useTemplateRef('logInFormElement')

const { form, isSubmitting, serverFailure, submitUnlessWaiting, translateFirstError, focusField, emptyField } = useSchemaForm({
    schema: formSchemas.logIn,
    defaultValues: { email: '', password: '' },
    formElement: logInFormElement,
    submitValidValues: async (credentials) => {
        const answer = await authService.logIn(credentials)
        if (!answer.ok) {
            if (answer.failure.code === failures.invalidCredentials.code) {
                emptyField('password')
                focusField('password')
            }
            return answer.failure
        }
        session.startSession(answer.value)
        // Opening this page again lets the route guard decide where a signed-in person goes: this module does not know the home.
        await router.replace({ path: LOGIN_PATH, force: true })
        return undefined
    }
})
</script>

<template>
    <div class="flex flex-col gap-6">
        <AuthPageHeader :title="t('playerIdentity.login.title')">
            <template #subtitle>
                <I18nT scope="global" keypath="playerIdentity.login.subtitle" tag="span">
                    <template #highlight>
                        <strong class="font-semibold text-link">
                            {{ t('playerIdentity.login.subtitleHighlight') }}
                        </strong>
                    </template>
                </I18nT>
            </template>
        </AuthPageHeader>

        <VBanner v-if="serverFailure" variant="error">{{ t(serverFailure.messageKey) }}</VBanner>

        <!-- novalidate: the browser's own bubbles would appear before our messages, in another style and language. -->
        <form ref="logInFormElement" novalidate class="flex flex-col gap-4" @submit.prevent="submitUnlessWaiting">
            <form.Field v-slot="{ field }" name="email">
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
            </form.Field>
            <form.Field v-slot="{ field }" name="password">
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
            </form.Field>
            <VButton type="submit" :loading="isSubmitting" class="mt-2 w-full">{{ t('playerIdentity.login.submit') }} </VButton>
        </form>

        <p class="text-center text-sm text-link">{{ t('playerIdentity.login.botFreeNote') }}</p>
    </div>
</template>
