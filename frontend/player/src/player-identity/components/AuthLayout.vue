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
            <div class="hidden h-full items-end justify-end pr-(--bamboo-from-center) pb-(--bamboo-bottom) lg:flex">
                <VPicture :picture="bambooExplosion" alt="" sizes="20vw" class="h-(--bamboo-height) w-auto" />
            </div>
        </template>

        <div class="mx-auto flex h-full w-full max-w-(--card-width) flex-col items-center gap-[2dvh] overflow-clip px-4 py-[2dvh]">
            <VPicture :picture="logo" alt="Bamboom" sizes="36rem" priority class="h-auto w-(--logo-width) shrink-0" />
            <slot />
            <div v-if="$slots.footer" class="flex shrink-0 items-center justify-center gap-2">
                <slot name="footer" />
            </div>
        </div>

        <template #overlay>
            <div class="hidden h-full items-end justify-start pb-(--panda-bottom) pl-(--panda-from-center) lg:flex">
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

    /* Space between each side image and the card, and distance from the bottom. */
    --bamboo-gap: -4rem;
    --bamboo-bottom: 10dvh;
    --panda-gap: -2rem;
    --panda-bottom: 17dvh;

    /* Measured from the center of the page, like the card: the images stay beside it when the window is resized. */
    --bamboo-from-center: calc(50% + var(--card-width) / 2 + var(--bamboo-gap));
    --panda-from-center: calc(50% + var(--card-width) / 2 + var(--panda-gap));

    /* Height of each side image: the first number is the wanted height. The second is a cap, the free width left of
       the gap times height/width of the picture, so on a narrow window the image shrinks instead of being squeezed. */
    --side-space: calc((100vw - var(--card-width)) / 2);
    --bamboo-height: min(54dvh, calc((var(--side-space) - var(--bamboo-gap)) * 1278 / 745));
    --panda-height: min(39dvh, calc((var(--side-space) - var(--panda-gap)) * 1354 / 1097));
}
</style>
