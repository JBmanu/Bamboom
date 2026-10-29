<script setup lang="ts">
import type { Picture } from '../images/picture.ts'

defineOptions({ inheritAttrs: false })

defineProps<{
    picture: Picture
    alt: string
    sizes?: string
    priority?: boolean
}>()
</script>

<template>
    <picture>
        <source v-for="(srcset, format) in picture.sources" :key="format" :type="`image/${format}`" :srcset="srcset" :sizes="sizes" />
        <img
            v-bind="$attrs"
            :src="picture.img.src"
            :width="picture.img.w"
            :height="picture.img.h"
            :alt="alt"
            :loading="priority ? 'eager' : 'lazy'"
            :fetchpriority="priority ? 'high' : undefined"
            decoding="async"
        />
    </picture>
</template>
