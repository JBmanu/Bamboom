<script setup lang="ts">
import SpinnerIcon from '~icons/ph/circle-notch'
import VIcon from './VIcon.vue'
import { useI18n } from 'vue-i18n'

defineProps<{
    /** Text announced to assistive technology; replaces the translated "Loading…". */
    label?: string
    /** Hides the spinner from assistive technology: use it where the surrounding text already says that something is loading. */
    decorative?: boolean
}>()

const { t } = useI18n()
</script>

<template>
    <span class="spinner" :role="decorative ? undefined : 'status'" :aria-hidden="decorative ? 'true' : undefined">
        <VIcon :icon="SpinnerIcon" class="icon" />
        <span v-if="!decorative" class="announcement">{{ label ?? t('common.spinner.loading') }}</span>
    </span>
</template>

<style scoped src="./style/VSpinner.css" />
