<script setup lang="ts">
import EnvelopeIcon from '~icons/ph/envelope'
import LockIcon from '~icons/ph/lock'
import { VPasswordField, VStrengthMeter, VTextField } from '@bamboom/common'
import { ref } from 'vue'
import GalleryCase from '../GalleryCase.vue'
import GallerySection from '../GallerySection.vue'

// `as const` makes the numbers literal types, so they fit VStrengthMeter's level.
const STRENGTH_LEVELS = [0, 1, 2, 3, 4] as const
const STRENGTH_LABELS = { 0: '', 1: 'Weak', 2: 'Fair', 3: 'Good', 4: 'Strong' } as const

const liveEmail = ref('')
</script>

<template>
    <GallerySection title="Fields">
        <GalleryCase label="empty">
            <VTextField label="Email" />
        </GalleryCase>

        <GalleryCase label="filled">
            <VTextField label="Email" model-value="ada@example.com" />
        </GalleryCase>

        <GalleryCase label="with icon">
            <VTextField label="Email" :icon="EnvelopeIcon" />
        </GalleryCase>

        <GalleryCase label="live (v-model)">
            <VTextField v-model="liveEmail" label="Email" />
            <p class="text-sm">You typed: {{ liveEmail }}</p>
        </GalleryCase>

        <GalleryCase label="valid">
            <VTextField label="Email" model-value="ada@example.com" valid />
        </GalleryCase>

        <GalleryCase label="error">
            <VTextField label="Email" model-value="ada@" error="Enter a valid email address." />
        </GalleryCase>

        <GalleryCase label="disabled">
            <VTextField label="Email" model-value="ada@example.com" disabled />
        </GalleryCase>

        <GalleryCase label="readonly">
            <VTextField label="Email" model-value="ada@example.com" readonly />
        </GalleryCase>

        <GalleryCase label="Password">
            <VPasswordField label="Password" :icon="LockIcon" />
        </GalleryCase>

        <GalleryCase label="Password Error">
            <VPasswordField label="Password" error="Use at least 8 characters." :icon="LockIcon" />
        </GalleryCase>

        <GalleryCase label="Password disabled">
            <VPasswordField label="Password" :icon="LockIcon" disabled />
        </GalleryCase>

        <GalleryCase v-for="level in STRENGTH_LEVELS" :key="level" :label="`level ${level}`">
            <VStrengthMeter :level="level" :label="STRENGTH_LABELS[level]" />
        </GalleryCase>
    </GallerySection>
</template>
