<script setup lang="ts">
import { LanguageSwitcher, ThemeToggle } from '@bamboom/common'
import { RouterView } from 'vue-router'
</script>

<template>
    <div class="fixed top-2 right-2 z-30 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
    </div>
    <!-- Under lg the strip on top is kept free: the controls would sit over the logo. -->
    <main class="h-dvh overflow-hidden bg-background pt-14 text-foreground lg:pt-0">
        <RouterView />
    </main>
</template>
