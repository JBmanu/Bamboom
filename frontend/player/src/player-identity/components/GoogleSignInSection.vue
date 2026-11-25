<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { VBanner, VButton } from '@bamboom/common'
import GoogleIcon from '~icons/logos/google-icon'
import { googleSignInStatuses } from '../api/authService.ts'
import type { Failure } from '../errors/failures.ts'
import { COMPLETE_GOOGLE_PROFILE_PATH, LOGIN_PATH } from '../routePaths.ts'
import { useSessionStore } from '../stores/useSessionStore.ts'
import { useAuthService } from '../useAuthService.ts'
import OrDivider from './OrDivider.vue'

const authService = useAuthService()
const session = useSessionStore()
const router = useRouter()
const { t } = useI18n()

const isWaitingForGoogle = ref(false)
const googleFailure = shallowRef<Failure>()

async function continueWithGoogle() {
    googleFailure.value = undefined
    isWaitingForGoogle.value = true
    const answer = await authService.continueWithGoogle()
    isWaitingForGoogle.value = false
    if (!answer.ok) {
        googleFailure.value = answer.failure
        return
    }
    if (answer.value.status === googleSignInStatuses.profileToComplete) {
        await router.push(COMPLETE_GOOGLE_PROFILE_PATH)
        return
    }
    session.startSession(answer.value.player)
    // Opening the login again lets the route guard decide where a signed-in person goes: this module does not know the home.
    await router.replace({ path: LOGIN_PATH, force: true })
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <OrDivider :label="t('playerIdentity.orDivider')" />
        <VBanner v-if="googleFailure" variant="error">{{ t(googleFailure.messageKey) }}</VBanner>
        <VButton :loading="isWaitingForGoogle" class="google-button" @click="continueWithGoogle">
            <template #start><GoogleIcon aria-hidden="true" /></template>
            {{ t('playerIdentity.continueWithGoogle') }}
        </VButton>
    </div>
</template>

<style scoped src="./style/googleSignInSection.css" />
