<script setup lang="ts" generic="Value extends string">
import { useId } from 'vue'

type SegmentedOption = { value: Value; name: string }

defineProps<{
    /** Names the group for screen readers; it is not drawn. */
    legend: string
    /** `name` is the full name of the option: read by screen readers and shown as tooltip. */
    options: readonly SegmentedOption[]
}>()

const selectedValue = defineModel<Value>({ required: true })

defineSlots<{
    /** What the option looks like (an icon, a flag...). Without it, the name is drawn. Always hidden from screen readers. */
    option?(props: { option: SegmentedOption }): unknown
}>()

const groupName = useId()
</script>

<template>
    <fieldset class="control">
        <legend class="legend">{{ legend }}</legend>
        <label v-for="option in options" :key="option.value" class="option" :title="option.name">
            <input v-model="selectedValue" type="radio" :name="groupName" :value="option.value" class="radio" />
            <span class="face" aria-hidden="true">
                <slot name="option" :option="option">{{ option.name }}</slot>
            </span>
            <span class="name">{{ option.name }}</span>
        </label>
    </fieldset>
</template>

<style scoped src="./style/VSegmentedControl.css" />
