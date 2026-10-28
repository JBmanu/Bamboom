<script setup lang="ts">
import GallerySection from '../GallerySection.vue'
import GalleryCase from '../GalleryCase.vue'
</script>

<template>
    <GallerySection title="typography">
        <GalleryCase label="title">
            <p class="text-3xl font-bold">BAMBOOM</p>
        </GalleryCase>

        <GalleryCase label="subtitle">
            <p class="text-lg text-foreground-muted">Ready to blow up the match?</p>
        </GalleryCase>

        <GalleryCase label="body">
            <p class="text-base">Ready to blow up the match?</p>
        </GalleryCase>
    </GallerySection>
</template>
