<script setup lang="ts">
import { computed, type InputHTMLAttributes, type StyleValue, useAttrs, useId } from 'vue'

defineOptions({ inheritAttrs: false })

defineProps<{
    /** Floats above the value once the field is focused or filled. A placeholder is not a label, so it is required. */
    label: string
}>()

const model = defineModel<string>({ default: '' })
const attrs = useAttrs()
const id = useId()

// class and style belong to the outer box; type, autocomplete, disabled… belong to the input.
const inputAttributes = computed(() => Object.fromEntries(Object.entries(attrs).filter(([name]) => name !== 'class' && name !== 'style')))
</script>

<template>
    <div class="field" :class="attrs.class" :style="attrs.style as StyleValue">
        <div class="control">
            <div class="input-area">
                <!-- Our own attributes come after the caller's: they must win. -->
                <input v-bind="inputAttributes as InputHTMLAttributes" :id="id" v-model="model" class="input" placeholder=" " />
                <label :for="id" class="label">{{ label }}</label>
            </div>
        </div>
    </div>
</template>

<style scoped src="./VTextField.css" />
