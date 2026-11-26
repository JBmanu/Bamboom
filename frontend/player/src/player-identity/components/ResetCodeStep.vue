<script setup lang="ts">
import { VBanner, VButton, VTextField, VCollapseTransition } from '@bamboom/common'
import { storeToRefs } from 'pinia'
import { onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import KeyIcon from '~icons/ph/key-fill'
import LeafIcon from '~icons/ph/leaf'
import { failures } from '../errors/failures.ts'
import { useResendCountdown } from '../forms/useResendCountdown.ts'
import { useSchemaForm } from '../forms/useSchemaForm.ts'
import { NEW_PASSWORD_PATH } from '../routePaths.ts'
import { formSchemas, RESET_CODE_LENGTH } from '../schemas/formSchemas.ts'
import { useResetFlowStore } from '../stores/useResetFlowStore.ts'
import { useAuthService } from '../useAuthService.ts'

const authService = useAuthService()
const resetFlow = useResetFlowStore()
const { email, resendAllowedAt } = storeToRefs(resetFlow)
const router = useRouter()
const { t } = useI18n()
const { secondsLeft, canResend } = useResendCountdown(resendAllowedAt)

const codeFormElement = useTemplateRef('codeFormElement')
const isResending = ref(false)

const { form, serverFailure, isSubmitting, submitUnlessWaiting, translateFirstError, focusField } = useSchemaForm({
    schema: formSchemas.codeConfirmation,
    defaultValues: { code: '' },
    formElement: codeFormElement,
    // A wrong code is about the field: it shows under it. Expired and too many attempts are about the whole reset: they go to the banner.
    fieldOfFailure: { [failures.resetCodeInvalid.code]: 'code' },
    submitValidValues: async ({ code }) => {
        const answer = await authService.confirmResetCode({ code })
        if (!answer.ok) return answer.failure
        resetFlow.markCodeConfirmed()
        await router.push(NEW_PASSWORD_PATH)
        return undefined
    }
})

// The email form has just disappeared with the focus on it: the person is taken to the next thing to do.
onMounted(() => focusField('code'))

async function resendCode() {
    serverFailure.value = undefined // one banner for both actions: the old refusal is out of date as soon as a new attempt starts
    isResending.value = true
    const answer = await authService.requestResetCode({ email: email.value })
    isResending.value = false
    if (!answer.ok) {
        serverFailure.value = answer.failure
        return
    }
    resetFlow.markCodeRequested(email.value)
    // The button turns off for the new wait and would drop the focus with it.
    focusField('code')
}

function changeEmail() {
    resetFlow.clearFlow()
}
</script>

<template>
    <VBanner variant="info">{{ t('playerIdentity.forgotPassword.codeStep.codeSent', { email, length: RESET_CODE_LENGTH }) }}</VBanner>

    <VCollapseTransition v-slot="{ content: shownFailure }" :content="serverFailure">
        <VBanner variant="error">{{ t(shownFailure.messageKey) }}</VBanner>
    </VCollapseTransition>

    <form ref="codeFormElement" novalidate class="auth-form" @submit.prevent="submitUnlessWaiting">
        <!-- Shown so the person can see where the code went; it is not part of the form values. -->
        <VTextField :label="t('playerIdentity.forgotPassword.codeStep.emailLabel')" :icon="LeafIcon" type="email" :model-value="email" readonly />
        <form.Field v-slot="{ field }" name="code">
            <VTextField
                :label="t('playerIdentity.forgotPassword.codeStep.codeLabel')"
                :icon="KeyIcon"
                name="code"
                autocomplete="one-time-code"
                inputmode="numeric"
                :model-value="field.state.value"
                :error="translateFirstError(field.state.meta.errors)"
                @update:model-value="field.handleChange"
                @blur="field.handleBlur"
            />
        </form.Field>
        <VButton type="submit" :loading="isSubmitting" class="auth-submit">{{ t('playerIdentity.forgotPassword.codeStep.submit') }}</VButton>

        <VButton variant="ghost" :disabled="!canResend" :loading="isResending" @click="resendCode">
            {{
                canResend
                    ? t('playerIdentity.forgotPassword.codeStep.resend')
                    : t('playerIdentity.forgotPassword.codeStep.resendIn', { seconds: secondsLeft })
            }}
        </VButton>
        <VButton variant="ghost" @click="changeEmail">{{ t('playerIdentity.forgotPassword.codeStep.changeEmail') }}</VButton>

        <!-- The countdown is not read every second: only the moment the button becomes available is announced. -->
        <p class="sr-only" role="status">{{ canResend ? t('playerIdentity.forgotPassword.codeStep.resendReady') : '' }}</p>
    </form>
</template>

<style scoped src="../components/style/authPage.css" />
