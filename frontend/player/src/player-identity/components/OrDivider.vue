<script setup lang="ts">
defineProps<{
    label: string
}>()
</script>

<template>
    <div role="separator" class="flex items-center gap-3 text-sm text-foreground-muted">
        <span class="h-px flex-1 bg-border" aria-hidden="true" />
        {{ label }}
        <span class="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
</template>
