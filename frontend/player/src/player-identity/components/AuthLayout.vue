<script setup lang="ts">
import { VExplosionBurst, VLayer, VPicture } from '@bamboom/common'
import bambooExplosion from '../../../resource/image/layout/bamboo/bamboo-explosion-1.png?as=picture'
import pandaSitting from '../../../resource/image/layout/panda/panda-sitting-1.png?as=picture'
import logo from '../../../resource/image/layout/logo/logo-2.png?as=picture'

defineSlots<{
    default(): unknown
    footer?(): unknown
}>()
</script>

<template>
    <VLayer class="auth-layout">
        <template #base>
            <div class="auth-bamboo-side">
                <VPicture :picture="bambooExplosion" alt="" sizes="20vw" class="auth-bamboo" />
            </div>
        </template>

        <div class="auth-column">
            <VExplosionBurst :blast-left-percent="72" :blast-top-percent="35" class="auth-logo-burst">
                <VPicture :picture="logo" alt="Bamboom" sizes="36rem" priority class="auth-logo" />
            </VExplosionBurst>
            <slot />
            <div v-if="$slots.footer" class="auth-footer">
                <slot name="footer" />
            </div>
        </div>

        <template #overlay>
            <div class="auth-panda-side">
                <VPicture :picture="pandaSitting" alt="" sizes="20vw" class="auth-panda" />
            </div>
        </template>
    </VLayer>
</template>

<style scoped src="./style/authLayout.css" />
