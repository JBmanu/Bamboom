<script setup lang="ts">
import bamboom from '../../../resource/image/element/bamboom-3.png?as=picture'
import { VPicture } from '@bamboom/common'
import GallerySection from '../GallerySection.vue'
import GalleryCase from '../GalleryCase.vue'
</script>

<template>
    <GallerySection title="Pictures">
        <GalleryCase label="picture without priority">
            <VPicture class="size-1/2" alt="bamboom" :picture="bamboom" />
        </GalleryCase>

        <GalleryCase label="picture with priority">
            <VPicture class="size-1/4" alt="bamboom" :picture="bamboom" priority />
        </GalleryCase>
    </GallerySection>
</template>
