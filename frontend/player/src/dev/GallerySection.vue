<script setup lang="ts">
defineProps<{
    title: string
}>()
</script>

<template>
    <section class="space-y-4 border-b border-border py-6">
        <h2 class="text-xl font-semibold">{{ title }}</h2>
        <div class="flex flex-wrap items-start gap-6">
            <slot />
        </div>
    </section>
</template>
