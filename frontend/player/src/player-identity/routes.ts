import type { RouteRecordRaw } from 'vue-router'
import { accessLevels } from './guards/routeAccess'
import { AUTH_LAYOUT_PATH, LOGIN_PATH } from './routePaths'

export const playerIdentityRoutes: RouteRecordRaw[] = [
    {
        // A parent without its own path would capture "/" and hide the home: it gets an address that only redirects.
        path: AUTH_LAYOUT_PATH,
        component: () => import('./views/AuthPagesView.vue'),
        redirect: LOGIN_PATH,
        meta: { access: accessLevels.signedOutOnly }, // inherited by every page below
        children: [{ path: LOGIN_PATH, name: 'login', component: () => import('./views/LoginView.vue') }]
    }
]
