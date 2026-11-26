<script setup lang="ts">
import { I18nT, useI18n } from 'vue-i18n'
import AuthPageHeader from '../components/AuthPageHeader.vue'
import { VBanner, VButton, VIcon, VPasswordField, VStrengthMeter, VTextField, VCollapseTransition } from '@bamboom/common'
import LeafIcon from '~icons/ph/leaf'
import LockIcon from '~icons/ph/lock-fill'
import UserIcon from '~icons/ph/user-fill'
import BambooIcon from '~icons/withicons/bamboo-solid'
import { useSchemaForm } from '../forms/useSchemaForm.ts'
import { formSchemas } from '../schemas/formSchemas.ts'
import { failures } from '../errors/failures.ts'
import { LOGIN_PATH, REGISTER_PATH } from '../routePaths.ts'
import { computed, useTemplateRef } from 'vue'
import { useAuthService } from '../useAuthService.ts'
import { useSessionStore } from '../stores/useSessionStore.ts'
import { useRouter } from 'vue-router'
import AuthAlternativeLink from '../components/AuthAlternativeLink.vue'
import { usePasswordStrength } from '../forms/usePasswordStrength.ts'
import { preloadPasswordStrength } from '../schemas/assessPasswordStrength.ts'
import GoogleSignInSection from '../components/GoogleSignInSection.vue'

const authService = useAuthService()
const session = useSessionStore()
const router = useRouter()
const { t } = useI18n()

const registerFormElement = useTemplateRef('registerFormElement')

const { form, serverFailure, isSubmitting, isFieldValueValid, submitUnlessWaiting, translateFirstError } = useSchemaForm({
    schema: formSchemas.register,
    defaultValues: { username: '', email: '', password: '' },
    formElement: registerFormElement,
    fieldOfFailure: {
        [failures.emailAlreadyRegistered.code]: 'email',
        [failures.usernameAlreadyTaken.code]: 'username'
    },
    submitValidValues: async (newAccount) => {
        const answer = await authService.register(newAccount)
        if (!answer.ok) return answer.failure
        session.startSession(answer.value)
        // Opening this page again lets the route guard decide where a signed-in person goes: this module does not know the home.
        await router.replace({ path: REGISTER_PATH, force: true })
        return undefined
    }
})

const password = form.useSelector((state) => state.values.password)
const nickname = form.useSelector((state) => state.values.username)
const email = form.useSelector((state) => state.values.email)
const personalInputs = computed(() => [nickname.value, email.value])
const { strength } = usePasswordStrength(password, personalInputs)
</script>

<template>
    <div class="auth-page">
        <AuthPageHeader :title="t('playerIdentity.register.title')" has-flanking-leaves>
            <template #subtitle>
                <I18nT scope="global" keypath="playerIdentity.register.subtitle" tag="span">
                    <template #highlight>
                        <strong class="auth-highlight">
                            {{ t('playerIdentity.register.subtitleHighlight') }}
                        </strong>
                    </template>
                </I18nT>
            </template>
        </AuthPageHeader>

        <VCollapseTransition v-slot="{ content: shownFailure }" :content="serverFailure">
            <VBanner variant="error">{{ t(shownFailure.messageKey) }}</VBanner>
        </VCollapseTransition>

        <form ref="registerFormElement" novalidate class="auth-form" @submit.prevent="submitUnlessWaiting">
            <form.Field v-slot="{ field }" name="username">
                <VTextField
                    :label="t('playerIdentity.register.nicknameLabel')"
                    :icon="UserIcon"
                    name="username"
                    type="text"
                    autocomplete="nickname"
                    :model-value="field.state.value"
                    :error="translateFirstError(field.state.meta.errors)"
                    :valid="field.state.meta.isBlurred && isFieldValueValid('username', field.state.value)"
                    @update:model-value="field.handleChange"
                    @blur="field.handleBlur"
                />
            </form.Field>
            <form.Field v-slot="{ field }" name="email">
                <VTextField
                    :label="t('playerIdentity.register.emailLabel')"
                    :icon="LeafIcon"
                    name="email"
                    type="email"
                    autocomplete="email"
                    :model-value="field.state.value"
                    :error="translateFirstError(field.state.meta.errors)"
                    :valid="field.state.meta.isBlurred && isFieldValueValid('email', field.state.value)"
                    @update:model-value="field.handleChange"
                    @blur="field.handleBlur"
                />
            </form.Field>
            <form.Field v-slot="{ field }" name="password">
                <VPasswordField
                    :label="t('playerIdentity.register.passwordLabel')"
                    :icon="LockIcon"
                    name="password"
                    autocomplete="new-password"
                    :model-value="field.state.value"
                    :error="translateFirstError(field.state.meta.errors)"
                    :valid="field.state.meta.isBlurred && isFieldValueValid('password', field.state.value)"
                    @update:model-value="field.handleChange"
                    @blur="field.handleBlur"
                    @focus="preloadPasswordStrength"
                />
                <VStrengthMeter :level="strength.level" :label="strength.labelKey ? t(strength.labelKey) : ''" />
            </form.Field>

            <VButton type="submit" :loading="isSubmitting" class="auth-submit">
                {{ t('playerIdentity.register.submit') }}
                <template #end><VIcon :icon="BambooIcon" /></template>
            </VButton>
        </form>

        <GoogleSignInSection />

        <AuthAlternativeLink
            :question="t('playerIdentity.register.loginQuestion')"
            :link-label="t('playerIdentity.register.loginLink')"
            :to="LOGIN_PATH"
        />
    </div>
</template>

<style scoped src="../components/style/authPage.css" />
