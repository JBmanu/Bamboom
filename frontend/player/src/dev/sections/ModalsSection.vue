<script setup lang="ts">
import { VButton, VModal, VTextField } from '@bamboom/common'
import GallerySection from '../GallerySection.vue'
import GalleryCase from '../GalleryCase.vue'
import { ref } from 'vue'

const isSimpleModalOpen = ref(false)
const isActionsModalOpen = ref(false)
const isLongModalOpen = ref(false)
const isFieldModalOpen = ref(false)
</script>

<template>
    <GallerySection title="Modal">
        <GalleryCase label="Simple">
            <VButton @click="isSimpleModalOpen = true">Open</VButton>
            <VModal v-model:open="isSimpleModalOpen" title="Simple">Short text.</VModal>
        </GalleryCase>

        <GalleryCase label="With actions">
            <VButton @click="isActionsModalOpen = true">Open</VButton>
            <VModal v-model:open="isActionsModalOpen" title="With actions">
                <template #actions>
                    <VButton @click="isActionsModalOpen = false">yes</VButton>
                    <VButton variant="ghost" @click="isActionsModalOpen = false">no</VButton>
                </template>
            </VModal>
        </GalleryCase>

        <GalleryCase label="Long content">
            <VButton @click="isLongModalOpen = true">Open</VButton>
            <VModal v-model:open="isLongModalOpen" title="Long content">
                <template #default>
                    <p v-for="paragraph in 12" :key="paragraph">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy
                        text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took
                        a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many
                        decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these
                        sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem
                        Ipsum.
                    </p>
                </template>
            </VModal>
        </GalleryCase>

        <GalleryCase label="With field text">
            <VButton @click="isFieldModalOpen = true">Open</VButton>
            <VModal v-model:open="isFieldModalOpen" title="With field text">
                <template #default>
                    <VTextField label="test" autofocus />
                </template>
            </VModal>
        </GalleryCase>
    </GallerySection>
</template>
