<script setup lang="ts">
import FlankingLeaves from './FlankingLeaves.vue'

defineProps<{
    title: string
    hasFlankingLeaves?: boolean
}>()

defineSlots<{
    subtitle(): unknown
}>()
</script>

<template>
    <header class="text-center">
        <!-- Only the title goes between the leaves: the subtitle keeps the full width. -->
        <component :is="hasFlankingLeaves ? FlankingLeaves : 'div'">
            <h1 class="text-2xl font-bold">
                {{ title }}
            </h1>
        </component>
        <p v-if="$slots.subtitle" class="mt-1 text-foreground-muted">
            <slot name="subtitle" />
        </p>
    </header>
</template>
