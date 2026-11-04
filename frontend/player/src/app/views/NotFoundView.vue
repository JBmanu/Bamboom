<script setup lang="ts">
import { VButton } from '@bamboom/common'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

const { t } = useI18n()
</script>

<template>
    <section class="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 class="text-3xl font-bold">{{ t('app.notFound.title') }}</h1>
        <p class="text-foreground-muted">{{ t('app.notFound.description') }}</p>
        <!-- The route is named, not imported by path: the route table loads this view, so importing it here would make a loop. -->
        <RouterLink v-slot="{ href, navigate }" :to="{ name: 'home' }" custom>
            <VButton :href="href" @click="navigate">{{ t('app.notFound.backHome') }}</VButton>
        </RouterLink>
    </section>
</template>
