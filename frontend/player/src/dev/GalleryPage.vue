<script setup lang="ts">
import { LanguageSwitcher, ThemeToggle } from '@bamboom/common'
import ButtonsSection from './sections/ButtonsSection.vue'
import BannersSection from './sections/BannersSection.vue'
import FieldsSection from './sections/FieldsSection.vue'
import SpinnersSection from './sections/SpinnersSection.vue'
import IconsSection from './sections/IconsSection.vue'
import TypographySection from './sections/TypographySection.vue'
</script>

<template>
    <main class="mx-auto flex min-h-screen max-w-5xl flex-col bg-background p-4 text-foreground sm:p-8">
        <header class="flex flex-wrap items-center justify-between gap-4">
            <h1 class="text-2xl font-bold">UI kit gallery</h1>
            <div class="flex flex-wrap gap-4">
                <ThemeToggle />
                <LanguageSwitcher />
            </div>
        </header>
        <TypographySection />
        <SpinnersSection />
        <ButtonsSection />
        <BannersSection />
        <FieldsSection />
        <IconsSection />
    </main>
</template>
