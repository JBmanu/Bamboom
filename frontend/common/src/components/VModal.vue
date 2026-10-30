<script setup lang="ts">
import XIcon from '~icons/ph/x'
import { onMounted, ref, useId, watch } from 'vue'
import VButton from './VButton.vue'
import VIcon from './VIcon.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    title: string
    open: boolean
}>()

// `close` must be declared: otherwise the parent's @close would also land on the <dialog> as a native
// listener and run a second time.
const emit = defineEmits<{
    'update:open': [open: boolean]
    close: []
}>()

defineSlots<{
    default(): unknown
    actions(): unknown
}>()

const titleId = useId()
const { t } = useI18n()
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
function closeDialog() {
    dialogElement.value?.close()
}

onMounted(matchDialogToOpenProp)
watch(() => props.open, matchDialogToOpenProp)
</script>

<template>
    <dialog ref="dialogElement" class="modal" :aria-labelledby="titleId" @close="reportClosingByPerson" @click.self="closeDialog">
        <div class="content">
            <header class="header">
                <h2 :id="titleId" class="title">{{ title }}</h2>
                <VButton variant="ghost" :aria-label="t('common.modal.close')" @click="closeDialog">
                    <template #start>
                        <VIcon :icon="XIcon" />
                    </template>
                </VButton>
            </header>
            <slot />
            <footer v-if="$slots.actions" class="actions">
                <slot name="actions" />
            </footer>
        </div>
    </dialog>
</template>

<style scoped src="./style/VModal.css" />
