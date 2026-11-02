<script setup lang="ts">
import { VLayer, VPicture } from '@bamboom/common'
import bambooExplosion from '../../../resource/image/layout/bamboo/bamboo-explosion-1.png?as=picture'
import pandaSitting from '../../../resource/image/layout/panda/panda-sitting-1.png?as=picture'
import logo from '../../../resource/image/layout/logo/logo-1.png?as=picture'

defineSlots<{
    default(): unknown
    footer?(): unknown
}>()
</script>

<template>
    <VLayer class="auth-layout h-full">
        <template #base>
            <div class="hidden h-full items-end justify-start pb-(--bamboo-bottom) lg:flex">
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
            <div class="hidden h-full items-end justify-end pb-(--panda-bottom) lg:flex">
                <VPicture :picture="pandaSitting" alt="" sizes="20vw" class="h-(--panda-height) w-auto" />
            </div>
        </template>
    </VLayer>
</template>

<style scoped>
/* Every size of the layout is decided here: tuning the picture means changing these lines. */
.auth-layout {
    --card-width: 32rem;
    --logo-height: 24dvh;
    /* The logo is about twice as wide as tall (1526x765); it never gets wider than the card area or the screen. */
    --logo-width: min(calc(100vw - 2rem), 36rem, calc(var(--logo-height) * 2));

    /* Width / height of each side image: the height caps below are computed from them. */
    --bamboo-ratio: calc(745 / 1278);
    --panda-ratio: calc(1097 / 1354);

    /* What you tune: distance from the screen edge and from the bottom, and the height wanted. */
    --bamboo-left: 0rem;
    --bamboo-bottom: 12dvh;
    --panda-right: 0rem;
    --panda-bottom: 20dvh;

    /* Free width between the screen edge and the card, minus the distance the image already keeps from the edge. */
    --bamboo-space: calc((100vw - var(--card-width)) / 2 - var(--bamboo-left));
    --panda-space: calc((100vw - var(--card-width)) / 2 - var(--panda-right));

    /* The first number is the wanted height; the second is the cap that keeps the image off the card. */
    --bamboo-height: min(42dvh, calc(var(--bamboo-space) / var(--bamboo-ratio)));
    --panda-height: min(32dvh, calc(var(--panda-space) / var(--panda-ratio)));
}
</style>
