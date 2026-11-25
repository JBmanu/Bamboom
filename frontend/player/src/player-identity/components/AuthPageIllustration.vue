<script setup lang="ts">
import { VPicture, type Picture } from '@bamboom/common'

defineProps<{ picture: Picture }>()
</script>

<template>
    <!-- Decorative: the title already says what the page is about. Hidden on short screens, where the form needs the room. -->
    <VPicture :picture="picture" alt="" sizes="9rem" class="mx-auto h-[min(12dvh,6rem)] w-auto [@media(max-height:40rem)]:hidden" />
</template>
