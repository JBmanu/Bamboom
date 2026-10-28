<script setup lang="ts">
import AppleIcon from '~icons/ph/apple-logo'
import { VIcon } from '@bamboom/common'
import GallerySection from '../GallerySection.vue'
import GalleryCase from '../GalleryCase.vue'
</script>

<template>
    <GallerySection title="Icons">
        <GalleryCase label="decorative (aria-hidden) e with label (announced)">
            <VIcon :icon="AppleIcon" />
        </GalleryCase>

        <GalleryCase label="icon with label">
            <VIcon label="appleLabel" :icon="AppleIcon" />
        </GalleryCase>
    </GallerySection>
</template>
