<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import { type AuthPageTransition, chooseAuthPageTransition } from '../transitions/chooseAuthPageTransition.ts'

const currentRoute = useRoute()
const cardTransition = shallowRef<AuthPageTransition>('card-fade')

watch(
    () => currentRoute.path,
    (openedPath, leftPath) => {
        cardTransition.value = chooseAuthPageTransition(leftPath, openedPath)
    }
)
</script>

<template>
    <AuthLayout>
        <RouterView v-slot="{ Component: AccessPage, route }">
            <!-- out-in: the old card leaves before the new one arrives, so there are never two cards or two forms. -->
            <Transition :name="cardTransition" mode="out-in">
                <!-- The key makes every page a new card: without it Vue would reuse the div and nothing would turn. -->
                <div
                    v-if="AccessPage"
                    :key="route.path"
                    class="auth-card min-h-0 w-full overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-lg"
                >
                    <component :is="AccessPage" />
                </div>
            </Transition>
        </RouterView>
    </AuthLayout>
</template>

<style scoped src="../components/style/authCardTransitions.css" />
