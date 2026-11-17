<script setup lang="ts">
import { LanguageSwitcher, ThemeToggle, VSpinner } from '@bamboom/common'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView, useRouter } from 'vue-router'
import { readSignedInHint } from '../player-identity'

const { t } = useI18n()
const router = useRouter()

// Read once: it only decides how the wait looks, never who may enter (the server decides that).
const wasSignedInLastTime = readSignedInHint()
const isFirstPageReady = ref(false)
const showFirstPage = () => (isFirstPageReady.value = true)
// Also on a failed first navigation: the spinner must not stay forever.
router.isReady().then(showFirstPage, showFirstPage)
</script>

<template>
    <div class="fixed top-2 right-2 z-30 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
    </div>
    <!-- Under lg the strip on top is kept free: the controls would sit over the logo. -->
    <main tabindex="-1" class="h-dvh overflow-hidden bg-background pt-14 text-foreground focus:outline-none lg:pt-0">
        <!-- Someone who was signed in will most likely see the home: a spinner instead of a flash of the login. -->
        <div v-if="!isFirstPageReady && wasSignedInLastTime" class="flex h-full items-center justify-center text-4xl">
            <VSpinner :label="t('app.startup.restoringSession')" />
        </div>
        <RouterView />
    </main>
</template>
