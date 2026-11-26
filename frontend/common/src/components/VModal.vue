<script setup lang="ts">
import XIcon from '~icons/ph/x'
import { onMounted, ref, useId, watch } from 'vue'
import VButton from './VButton.vue'
import VIcon from './VIcon.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    /** Visible heading; also the accessible name of the dialog. */
    title: string
    /** Whether the dialog is open. Bind it with `v-model:open`: the modal asks to close through `update:open`. */
    open: boolean
}>()

// `close` must be declared: otherwise the parent's @close would also land on the <dialog> as a native
// listener and run a second time.
const emit = defineEmits<{
    /** The person closed the modal (Escape, backdrop or close button). Not sent when the parent sets `open` to false. */
    'update:open': [open: boolean]
    /** Same moment as `update:open`: use it for what must follow a closing, such as a redirect. */
    close: []
}>()

defineSlots<{
    /** The body of the modal. */
    default(): unknown
    /** Buttons for the footer. Without them the footer is not rendered. `close` closes like the close button: with the exit, then `update:open` and `close`. */
    actions(slotProps: { close: () => void }): unknown
}>()

const titleId = useId()
const { t } = useI18n()
const dialogElement = ref<HTMLDialogElement>()
const CLOSING_ATTRIBUTE = 'data-closing'

function matchDialogToOpenProp() {
    const dialog = dialogElement.value
    if (!dialog) return
    if (props.open) {
        dialog.removeAttribute(CLOSING_ATTRIBUTE) // reopened during its exit: the styles reverse and the pending close does nothing
        if (!dialog.open) dialog.showModal()
    } else {
        closeAfterExit()
    }
}

function reportClosingByPerson() {
    if (!props.open) return
    emit('update:open', false)
    emit('close')
}

function closeAfterExit() {
    const dialog = dialogElement.value
    if (!dialog?.open) return
    dialog.setAttribute(CLOSING_ATTRIBUTE, '')
    const exitAnimations = dialog.getAnimations()
    if (exitAnimations.length === 0) closeIfStillClosing(dialog)
    else Promise.allSettled(exitAnimations.map((animation) => animation.finished)).then(() => closeIfStillClosing(dialog))
}

function closeIfStillClosing(dialog: HTMLDialogElement) {
    if (!dialog.hasAttribute(CLOSING_ATTRIBUTE)) return
    dialog.removeAttribute(CLOSING_ATTRIBUTE)
    dialog.close() // the `close` event reaches reportClosingByPerson
}

onMounted(matchDialogToOpenProp)
watch(() => props.open, matchDialogToOpenProp)
</script>

<template>
    <dialog
        ref="dialogElement"
        class="modal"
        :aria-labelledby="titleId"
        @cancel.prevent="closeAfterExit"
        @close="reportClosingByPerson"
        @click.self="closeAfterExit"
    >
        <div class="content">
            <header class="header">
                <h2 :id="titleId" class="title">{{ title }}</h2>
                <VButton variant="ghost" :aria-label="t('common.modal.close')" @click="closeAfterExit">
                    <template #start>
                        <VIcon :icon="XIcon" />
                    </template>
                </VButton>
            </header>
            <slot />
            <footer v-if="$slots.actions" class="actions">
                <slot name="actions" :close="closeAfterExit" />
            </footer>
        </div>
    </dialog>
</template>

<style scoped src="./style/VModal.css" />
