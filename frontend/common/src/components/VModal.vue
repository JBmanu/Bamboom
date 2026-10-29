<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
    open: boolean
}>()

defineSlots<{ default(): unknown }>()

const dialogElement = ref<HTMLDialogElement>()

// One comparison covers both directions and keeps showModal() from throwing on a dialog that is already open.
function matchDialogToOpenProp() {
    const dialog = dialogElement.value
    if (!dialog || dialog.open === props.open) return
    if (props.open) dialog.showModal()
    else dialog.close()
}

onMounted(matchDialogToOpenProp)
watch(() => props.open, matchDialogToOpenProp)
</script>

<template>
    <dialog ref="dialogElement">
        <slot />
    </dialog>
</template>

<style scoped src="./style/VModal.css" />
