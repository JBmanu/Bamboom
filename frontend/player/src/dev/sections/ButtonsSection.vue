<script setup lang="ts">
import { VButton, VIcon } from '@bamboom/common'
import ArrowRightIcon from '~icons/ph/arrow-right'
import GoogleLogoIcon from '~icons/ph/google-logo'
import GalleryCase from '../GalleryCase.vue'
import GallerySection from '../GallerySection.vue'
</script>

<template>
    <GallerySection title="VButton">
        <GalleryCase label="primary"><VButton>Sign in</VButton></GalleryCase>
        <GalleryCase label="ghost"><VButton variant="ghost">Back to login</VButton></GalleryCase>
        <GalleryCase label="primary, disabled"><VButton disabled>Sign in</VButton></GalleryCase>
        <GalleryCase label="primary, loading"><VButton loading>Sign in</VButton></GalleryCase>
        <GalleryCase label="ghost, loading"><VButton variant="ghost" loading>Back to login</VButton></GalleryCase>
        <GalleryCase label="icon at the start">
            <VButton variant="ghost">
                <template #start><VIcon :icon="GoogleLogoIcon" /></template>
                Continue with Google
            </VButton>
        </GalleryCase>
        <GalleryCase label="icon at the end">
            <VButton>
                Next
                <template #end><VIcon :icon="ArrowRightIcon" /></template>
            </VButton>
        </GalleryCase>
    </GallerySection>
</template>
