import type { RouteRecordRaw } from 'vue-router'
import { accessLevels } from './guards/routeAccess'
import { LOGIN_PATH } from './routePaths.ts'

export const playerIdentityRoutes: RouteRecordRaw[] = [
    {
        path: LOGIN_PATH,
        name: 'login',
        component: () => import('./views/LoginView.vue'), // loaded only when someone opens the page: keeps the first download small
        meta: { access: accessLevels.signedOutOnly }
    }
]
