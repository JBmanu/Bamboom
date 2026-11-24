<script setup lang="ts">
import { VBanner, VButton, VPasswordField, VPicture, VStrengthMeter } from '@bamboom/common'
import { onMounted, shallowRef, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import LockIcon from '~icons/ph/lock-fill'
import AuthAlternativeLink from '../components/AuthAlternativeLink.vue'
import AuthPageHeader from '../components/AuthPageHeader.vue'
import { usePasswordStrength } from '../forms/usePasswordStrength.ts'
import { useSchemaForm } from '../forms/useSchemaForm.ts'
import { LOGIN_PATH } from '../routePaths.ts'
import { preloadPasswordStrength } from '../schemas/assessPasswordStrength.ts'
import { formSchemas } from '../schemas/formSchemas.ts'
import { useResetFlowStore } from '../stores/useResetFlowStore.ts'
import { useAuthService } from '../useAuthService.ts'
import lockImage from '../../../resource/image/layout/element/lock.png?as=picture'

const authService = useAuthService()
const resetFlow = useResetFlowStore()
const { t } = useI18n()

// Read once, on purpose: the email of the reset is a personal input for the strength meter, and the flow is
// cleared when the password is saved. Following the store would empty the input and make the meter re-evaluate.
const personalInputs = shallowRef<readonly string[]>([resetFlow.email])

const newPasswordFormElement = useTemplateRef('newPasswordFormElement')

const { form, serverFailure, isSubmitting, isFieldValueValid, submitUnlessWaiting, translateFirstError, focusField } = useSchemaForm({
    schema: formSchemas.passwordReset,
    defaultValues: { password: '' },
    formElement: newPasswordFormElement,
    submitValidValues: async (newPassword) => {
        const answer = await authService.setNewPassword(newPassword)
        // What follows a saved password is the next step: a refusal goes to the banner, or under the field if the server says so.
        return answer.ok ? undefined : answer.failure
    }
})

const password = form.useSelector((state) => state.values.password)
const { strength } = usePasswordStrength(password, personalInputs)

// The person arrives here from another page, with one thing left to do.
onMounted(() => focusField('password'))
</script>

<template>
    <div class="auth-page">
        <VPicture :picture="lockImage" alt="" sizes="9rem" class="mx-auto h-[min(13.5dvh,6.75rem)] w-auto [@media(max-height:40rem)]:hidden" />

        <AuthPageHeader :title="t('playerIdentity.newPassword.title')">
            <template #subtitle>{{ t('playerIdentity.newPassword.subtitle') }}</template>
        </AuthPageHeader>

        <VBanner v-if="serverFailure" variant="error">{{ t(serverFailure.messageKey) }}</VBanner>

        <form ref="newPasswordFormElement" novalidate class="auth-form" @submit.prevent="submitUnlessWaiting">
            <form.Field v-slot="{ field }" name="password">
                <VPasswordField
                    :label="t('playerIdentity.newPassword.passwordLabel')"
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

            <VButton type="submit" :loading="isSubmitting" class="auth-submit">{{ t('playerIdentity.newPassword.submit') }} </VButton>
        </form>

        <AuthAlternativeLink
            :question="t('playerIdentity.newPassword.backToLoginQuestion')"
            :link-label="t('playerIdentity.newPassword.backToLoginLink')"
            :to="LOGIN_PATH"
        />
    </div>
</template>

<style scoped src="../components/style/authPage.css" />
