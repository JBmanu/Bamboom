<script setup lang="ts">
import { VBanner, VButton, VPasswordField, VStrengthMeter, VModal, VIcon, VCollapseTransition } from '@bamboom/common'
import { computed, onMounted, ref, shallowRef, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import LockIcon from '~icons/ph/lock-fill'
import SparkleIcon from '~icons/ph/sparkle-fill'
import AuthAlternativeLink from '../components/AuthAlternativeLink.vue'
import AuthPageHeader from '../components/AuthPageHeader.vue'
import { usePasswordStrength } from '../forms/usePasswordStrength.ts'
import { useSchemaForm } from '../forms/useSchemaForm.ts'
import { FORGOT_PASSWORD_PATH, LOGIN_PATH } from '../routePaths.ts'
import { preloadPasswordStrength } from '../schemas/assessPasswordStrength.ts'
import { formSchemas } from '../schemas/formSchemas.ts'
import { useResetFlowStore } from '../stores/useResetFlowStore.ts'
import { useAuthService } from '../useAuthService.ts'
import lockImage from '../../../resource/image/layout/element/lock.png?as=picture'
import { useRouter } from 'vue-router'
import { failures } from '../errors/failures.ts'
import AuthPageIllustration from '../components/AuthPageIllustration.vue'

const { t } = useI18n()
const router = useRouter()
const authService = useAuthService()
const resetFlow = useResetFlowStore()
const isPasswordUpdatedShown = ref(false)

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
        if (!answer.ok) return answer.failure
        resetFlow.clearFlow()
        isPasswordUpdatedShown.value = true
        return undefined
    }
})

const password = form.useSelector((state) => state.values.password)
const { strength } = usePasswordStrength(password, personalInputs)
const failuresThatNeedANewReset: readonly string[] = [failures.resetProofExpired.code, failures.resetNotConfirmed.code]
const mustStartAgain = computed(() => serverFailure.value !== undefined && failuresThatNeedANewReset.includes(serverFailure.value.code))

/** The reset is over: the person logs in with the new password. Every way out of the pop-up leads here. */
function goToLogin() {
    router.replace(LOGIN_PATH)
}

function startAgain() {
    resetFlow.clearFlow()
    router.replace(FORGOT_PASSWORD_PATH)
}

// The person arrives here from another page, with one thing left to do.
onMounted(() => focusField('password'))
</script>

<template>
    <div class="auth-page">
        <AuthPageIllustration :picture="lockImage" />

        <AuthPageHeader :title="t('playerIdentity.newPassword.title')">
            <template #subtitle>{{ t('playerIdentity.newPassword.subtitle') }}</template>
        </AuthPageHeader>

        <VCollapseTransition v-slot="{ content: shownFailure }" :content="serverFailure">
            <VBanner variant="error">{{ t(shownFailure.messageKey) }}</VBanner>
        </VCollapseTransition>

        <VButton v-if="mustStartAgain" class="auth-submit" @click="startAgain">{{ t('playerIdentity.newPassword.startAgain') }}</VButton>

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

            <VButton type="submit" :loading="isSubmitting" :disabled="mustStartAgain" class="auth-submit">
                {{ t('playerIdentity.newPassword.submit') }}
                <template #end><VIcon :icon="SparkleIcon" /></template>
            </VButton>
        </form>

        <AuthAlternativeLink
            :question="t('playerIdentity.newPassword.backToLoginQuestion')"
            :link-label="t('playerIdentity.newPassword.backToLoginLink')"
            :to="LOGIN_PATH"
        />

        <VModal v-model:open="isPasswordUpdatedShown" :title="t('playerIdentity.newPassword.updatedTitle')" @close="goToLogin">
            <p>{{ t('playerIdentity.newPassword.updatedMessage') }}</p>
            <template #actions>
                <VButton autofocus @click="goToLogin">{{ t('playerIdentity.newPassword.goToLogin') }}</VButton>
            </template>
        </VModal>
    </div>
</template>

<style scoped src="../components/style/authPage.css" />
