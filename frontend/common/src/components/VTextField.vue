<script setup lang="ts">
import { type Component, computed, type InputHTMLAttributes, type StyleValue, useAttrs, useId } from 'vue'
import ValidIcon from '~icons/ph/check-circle'
import VIcon from '../icons/VIcon.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
    /** Floats above the value once the field is focused or filled. A placeholder is not a label, so it is required. */
    label: string
    /** Decorative icon at the start of the field. */
    icon?: Component
    /** Shows a check at the end. The caller decides when a value is valid: this component only displays it. */
    valid?: boolean
    /** Message already translated. It marks the field as invalid and wins over `valid`. */
    error?: string
}>()

defineSlots<{
    /** Room for an action at the end of the field, such as the show/hide toggle of a password. */
    end?(): unknown
}>()

const model = defineModel<string>({ default: '' })
const attrs = useAttrs()
const id = useId()
const errorId = `${id}-error`
const state = computed(() => {
    if (props.error) return 'invalid'
    return props.valid ? 'valid' : undefined
})

// class and style belong to the outer box; type, autocomplete, disabled… belong to the input.
const inputAttributes = computed(() => Object.fromEntries(Object.entries(attrs).filter(([name]) => name !== 'class' && name !== 'style')))
</script>

<template>
    <div class="field" :class="attrs.class" :style="attrs.style as StyleValue" :data-state="state">
        <div class="control">
            <VIcon v-if="icon" :icon="icon" class="start-icon" />
            <div class="input-area">
                <input
                    v-bind="inputAttributes as InputHTMLAttributes"
                    :id="id"
                    v-model="model"
                    class="input"
                    placeholder=" "
                    :aria-invalid="error ? 'true' : undefined"
                    :aria-describedby="error ? errorId : undefined"
                />
                <label :for="id" class="label">{{ label }}</label>
            </div>
            <VIcon v-if="state === 'valid'" :icon="ValidIcon" class="end-icon" />
            <slot name="end" />
        </div>
        <p v-if="error" :id="errorId" class="error">{{ error }}</p>
    </div>
</template>

<style scoped src="./VTextField.css" />
