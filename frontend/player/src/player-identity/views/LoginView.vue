<script setup lang="ts">
import { VBanner, VButton, VPasswordField, VTextField } from '@bamboom/common'
import { I18nT, useI18n } from 'vue-i18n'
import LeafIcon from '~icons/ph/leaf'
import LockIcon from '~icons/ph/lock-fill'
import { useTemplateRef } from 'vue'
import { useSchemaForm } from '../forms/useSchemaForm.ts'
import AuthPageHeader from '../components/AuthPageHeader.vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSessionStore } from '../stores/useSessionStore.ts'
import { useAuthService } from '../useAuthService.ts'
import { formSchemas } from '../schemas/formSchemas.ts'
import { failures } from '../errors/failures.ts'
import { FORGOT_PASSWORD_PATH, LOGIN_PATH, REGISTER_PATH } from '../routePaths.ts'
import AuthAlternativeLink from '../components/AuthAlternativeLink.vue'

const authService = useAuthService()
const session = useSessionStore()
const router = useRouter()
const { t } = useI18n()

const logInFormElement = useTemplateRef('logInFormElement')

const { form, serverFailure, isSubmitting, submitUnlessWaiting, translateFirstError, focusField, emptyField } = useSchemaForm({
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
    <div class="auth-page">
        <AuthPageHeader :title="t('playerIdentity.login.title')">
            <template #subtitle>
                <I18nT scope="global" keypath="playerIdentity.login.subtitle" tag="span">
                    <template #highlight>
                        <strong class="auth-highlight">{{ t('playerIdentity.login.subtitleHighlight') }}</strong>
                    </template>
                </I18nT>
            </template>
        </AuthPageHeader>

        <VBanner v-if="serverFailure" variant="error">{{ t(serverFailure.messageKey) }}</VBanner>

        <!-- novalidate: the browser's own bubbles would appear before our messages, in another style and language. -->
        <form ref="logInFormElement" novalidate class="auth-form" @submit.prevent="submitUnlessWaiting">
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
            <RouterLink :to="FORGOT_PASSWORD_PATH" class="self-end text-sm text-link underline">
                {{ t('playerIdentity.login.forgotPasswordLink') }}
            </RouterLink>
            <VButton type="submit" :loading="isSubmitting" class="auth-submit">{{ t('playerIdentity.login.submit') }} </VButton>
        </form>

        <p class="text-center text-sm text-link">{{ t('playerIdentity.login.botFreeNote') }}</p>

        <AuthAlternativeLink
            :question="t('playerIdentity.login.registerQuestion')"
            :link-label="t('playerIdentity.login.registerLink')"
            :to="REGISTER_PATH"
        />
    </div>
</template>

<style scoped src="../components/style/authPage.css" />
