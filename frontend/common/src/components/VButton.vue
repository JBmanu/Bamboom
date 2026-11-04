<script setup lang="ts">
import VSpinner from './VSpinner.vue'

const props = withDefaults(
    defineProps<{
        variant?: 'primary' | 'ghost'
        /** Turns the button off: the browser then blocks clicks and keyboard focus on its own. */
        disabled?: boolean
        /** Shows a spinner and ignores clicks. Not `disabled`: a disabled button loses keyboard focus while the person waits. */
        loading?: boolean
        /** Makes it a link to this address that looks like a button. */
        href?: string
    }>(),
    {
        variant: 'primary'
    }
)

defineSlots<{
    default(): unknown
    start?(): unknown
    end?(): unknown
}>()

// Our handler runs before the caller's own one, so stopping it here also silences theirs.
function blockClickWhileLoading(event: MouseEvent) {
    if (props.href || !props.loading) return
    event.preventDefault() // a submit button must not send the form
    event.stopImmediatePropagation()
}
</script>
<template>
    <component
        :is="href ? 'a' : 'button'"
        class="button"
        :data-variant="variant"
        v-bind="href ? { href } : { type: 'button', disabled, 'aria-busy': loading ? 'true' : undefined }"
        @click="blockClickWhileLoading"
    >
        <span v-if="loading && !href" class="icon"><VSpinner decorative /></span>
        <span v-else-if="$slots.start" class="icon"><slot name="start" /></span>
        <slot />
        <span v-if="$slots.end" class="icon"><slot name="end" /></span>
    </component>
</template>

<style scoped src="./style/VButton.css" />
