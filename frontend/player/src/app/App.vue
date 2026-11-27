<script setup lang="ts">
import { LanguageSwitcher, ThemeToggle, VSpinner, VPicture, VLayer } from '@bamboom/common'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView, useRouter } from 'vue-router'
import { readSignedInHint } from '../player-identity'
import meadow from '../../resource/image/background/meadow.png?as=picture'

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
    <VLayer class="h-dvh bg-background">
        <template #base>
            <div class="flex h-full flex-col justify-end">
                <VPicture :picture="meadow" alt="" sizes="100vw" class="h-auto w-full dark:opacity-80 [@media(max-height:30rem)]:hidden" />
            </div>
        </template>

        <main tabindex="-1" class="h-dvh overflow-hidden pt-14 text-foreground focus:outline-none lg:pt-0">
            <div v-if="!isFirstPageReady && wasSignedInLastTime" class="flex h-full items-center justify-center text-4xl">
                <VSpinner :label="t('app.startup.restoringSession')" />
            </div>
            <RouterView />
        </main>
    </VLayer>
</template>
