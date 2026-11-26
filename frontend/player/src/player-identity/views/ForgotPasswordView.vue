<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AuthAlternativeLink from '../components/AuthAlternativeLink.vue'
import AuthPageHeader from '../components/AuthPageHeader.vue'
import ResetCodeStep from '../components/ResetCodeStep.vue'
import ResetEmailStep from '../components/ResetEmailStep.vue'
import { LOGIN_PATH } from '../routePaths.ts'
import { resetFlowSteps, useResetFlowStore } from '../stores/useResetFlowStore.ts'
import explosiveLetter from '../../../resource/image/layout/element/letter.png?as=picture'
import AuthPageIllustration from '../components/AuthPageIllustration.vue'
import { VStepTransition } from '@bamboom/common'

const resetFlow = useResetFlowStore()
const { step } = storeToRefs(resetFlow)
const { t } = useI18n()

const isCodeStepShown = computed(() => step.value !== resetFlowSteps.idle)

if (step.value === resetFlowSteps.codeConfirmed) resetFlow.clearFlow()
</script>

<template>
    <div class="auth-page">
        <AuthPageIllustration :picture="explosiveLetter" />

        <AuthPageHeader
            :title="isCodeStepShown ? t('playerIdentity.forgotPassword.codeStep.title') : t('playerIdentity.forgotPassword.emailStep.title')"
        >
            <template #subtitle>
                {{ isCodeStepShown ? t('playerIdentity.forgotPassword.codeStep.subtitle') : t('playerIdentity.forgotPassword.emailStep.subtitle') }}
            </template>
        </AuthPageHeader>

        <VStepTransition
            v-slot="{ stepName: shownStepName }"
            :step-name="isCodeStepShown ? 'code' : 'email'"
            class="flex flex-col gap-(--collapse-gap)"
        >
            <ResetCodeStep v-if="shownStepName === 'code'" />
            <ResetEmailStep v-else />
        </VStepTransition>

        <AuthAlternativeLink
            :question="t('playerIdentity.forgotPassword.backToLoginQuestion')"
            :link-label="t('playerIdentity.forgotPassword.backToLoginLink')"
            :to="LOGIN_PATH"
        />
    </div>
</template>

<style scoped src="../components/style/authPage.css" />
