import type { RouteRecordRaw } from 'vue-router'
import { accessLevels } from '../../player-identity'

export const HOME_PATH = '/'

export const appRoutes: RouteRecordRaw[] = [
    {
        path: HOME_PATH,
        name: 'home',
        component: () => import('../views/HomeView.vue'),
        meta: { access: accessLevels.signedInOnly }
    },
    {
        path: '/:pathMatch(.*)*', // matches any address no other route claims
        name: 'notFound',
        component: () => import('../views/NotFoundView.vue'),
        meta: { access: accessLevels.anyone }
    }
]
