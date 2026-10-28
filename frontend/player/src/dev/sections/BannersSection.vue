<script setup lang="ts">
import { VBanner } from '@bamboom/common'
import GalleryCase from '../GalleryCase.vue'
import GallerySection from '../GallerySection.vue'
</script>

<template>
    <GallerySection title="VBanner">
        <GalleryCase label="info (default)"><VBanner>Your session will expire soon.</VBanner></GalleryCase>
        <GalleryCase label="success"><VBanner variant="success">Password updated.</VBanner></GalleryCase>
        <GalleryCase label="error"><VBanner variant="error">Wrong email or password.</VBanner></GalleryCase>
        <GalleryCase label="loading"><VBanner variant="loading">Signing you in…</VBanner></GalleryCase>
    </GallerySection>
</template>
