<script setup lang="ts">
import { VPicture } from '@bamboom/common'
import sideLeaves from '../../../resource/image/layout/element/side-leaves-1.png?as=picture'

defineSlots<{
    /** What the leaves frame. */
    default(): unknown
}>()
</script>

<template>
    <div class="flex items-center justify-center gap-1 sm:gap-3">
        <VPicture :picture="sideLeaves" alt="" sizes="3rem" class="h-12 w-auto sm:h-16" />
        <slot />
        <VPicture :picture="sideLeaves" alt="" sizes="3rem" class="h-12 w-auto -scale-x-100 sm:h-16" />
    </div>
</template>
