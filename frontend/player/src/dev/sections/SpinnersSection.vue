<script setup lang="ts">
import { VSpinner } from '@bamboom/common'
import GallerySection from '../GallerySection.vue'
import GalleryCase from '../GalleryCase.vue'
</script>

<template>
    <GallerySection title="Spinners">
        <GalleryCase label="small">
            <VSpinner class="text-sm" />
        </GalleryCase>

        <GalleryCase label="medium">
            <VSpinner class="text-2xl" />
        </GalleryCase>

        <GalleryCase label="large">
            <VSpinner class="text-5xl" />
        </GalleryCase>

        <GalleryCase label="custom label">
            <VSpinner label="Saving…"> Saving… </VSpinner>
        </GalleryCase>

        <GalleryCase label="decorative">
            <VSpinner decorative />
        </GalleryCase>
    </GallerySection>
</template>
