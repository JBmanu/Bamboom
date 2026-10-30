<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
    open: boolean
}>()

const emit = defineEmits<{
    'update:open': [open: boolean]
    close: []
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

// The browser fires this for every closing. If `open` is still true the person closed it; otherwise the parent did.
function reportClosingByPerson() {
    if (!props.open) return
    emit('update:open', false)
    emit('close')
}

// A click on the backdrop has the dialog itself as target; a click on the content does not.
function closeFromBackdrop() {
    dialogElement.value?.close()
}

onMounted(matchDialogToOpenProp)
watch(() => props.open, matchDialogToOpenProp)
</script>

<template>
    <dialog ref="dialogElement" @close="reportClosingByPerson" @click.self="closeFromBackdrop">
        <div>
            <slot />
        </div>
    </dialog>
</template>

<style scoped src="./style/VModal.css" />
