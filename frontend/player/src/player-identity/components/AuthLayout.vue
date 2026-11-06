<script setup lang="ts">
import { VLayer, VPicture } from '@bamboom/common'
import bambooExplosion from '../../../resource/image/layout/bamboo/bamboo-explosion-1.png?as=picture'
import pandaSitting from '../../../resource/image/layout/panda/panda-sitting-1.png?as=picture'
import logo from '../../../resource/image/layout/logo/logo-2.png?as=picture'

defineSlots<{
    default(): unknown
    footer?(): unknown
}>()
</script>

<template>
    <VLayer class="auth-layout h-full">
        <template #base>
            <div class="hidden h-full items-end justify-start pb-(--bamboo-bottom) pl-(--bamboo-left) lg:flex">
                <VPicture :picture="bambooExplosion" alt="" sizes="20vw" class="h-(--bamboo-height) w-auto" />
            </div>
        </template>

        <div class="mx-auto flex h-full w-full max-w-(--card-width) flex-col items-center gap-[2dvh] px-4 py-[2dvh]">
            <VPicture :picture="logo" alt="Bamboom" sizes="36rem" priority class="h-auto w-(--logo-width) shrink-0" />
            <div class="min-h-0 w-full overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-lg">
                <slot />
            </div>
            <div v-if="$slots.footer" class="flex shrink-0 items-center justify-center gap-2">
                <slot name="footer" />
            </div>
        </div>

        <template #overlay>
            <div class="hidden h-full items-end justify-end pb-(--panda-bottom) pr-(--panda-right) lg:flex">
                <VPicture :picture="pandaSitting" alt="" sizes="20vw" class="h-(--panda-height) w-auto" />
            </div>
        </template>
    </VLayer>
</template>

<style scoped>
/* Every size of the layout is decided here. */
.auth-layout {
    --card-width: 32rem;
    /* Logo width. Its height is half of it (1526x765), so the last term also decides how much height it takes from the card. */
    --logo-width: min(calc(100vw - 2rem), 36rem, 48dvh);

    /* Distance of each side image from the screen edge and from the bottom. */
    --bamboo-left: 3rem;
    --bamboo-bottom: 12dvh;
    --panda-right: 3rem;
    --panda-bottom: 20dvh;

    /* Height of each side image: the first number is the wanted height. The second is a cap, the free width beside the card
       times height/width of the picture, so on a narrow window the image cannot reach the form. */
    --side-space: calc((100vw - var(--card-width)) / 2);
    --bamboo-height: min(42dvh, calc(var(--side-space) * 1278 / 745));
    --panda-height: min(32dvh, calc(var(--side-space) * 1354 / 1097));
}
</style>
