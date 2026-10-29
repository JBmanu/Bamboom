<script setup lang="ts">
import { VLayer } from '@bamboom/common'
import GallerySection from '../GallerySection.vue'
import GalleryCase from '../GalleryCase.vue'
</script>

<template>
    <GallerySection title="Layers">
        <GalleryCase label="content only">
            <VLayer class="h-40">
                <template #default>
                    <div class="h-full bg-primary"></div>
                </template>
            </VLayer>
        </GalleryCase>

        <GalleryCase label="base and content">
            <VLayer class="h-40">
                <template #base>
                    <div class="h-full bg-border-strong"></div>
                </template>

                <template #default>
                    <div class="grid size-full place-items-center">
                        <div class="size-3/4 bg-primary"></div>
                    </div>
                </template>
            </VLayer>
        </GalleryCase>

        <GalleryCase label="base, content and overlay">
            <VLayer class="h-40">
                <template #base>
                    <div class="h-full bg-border-strong"></div>
                </template>

                <template #default>
                    <div class="grid size-full place-items-center">
                        <div class="size-3/4 bg-primary"></div>
                    </div>
                </template>

                <template #overlay>
                    <div class="grid size-full place-items-center">
                        <div class="size-1/2 bg-error"></div>
                    </div>
                </template>
            </VLayer>
        </GalleryCase>
    </GallerySection>
</template>
