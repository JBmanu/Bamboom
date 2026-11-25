import type { RouteRecordRaw } from 'vue-router'
import { accessLevels } from './guards/routeAccess'
import { AUTH_LAYOUT_PATH, COMPLETE_GOOGLE_PROFILE_PATH, FORGOT_PASSWORD_PATH, LOGIN_PATH, NEW_PASSWORD_PATH, REGISTER_PATH } from './routePaths'
import { resetFlowSteps } from './stores/useResetFlowStore.ts'

export const playerIdentityRoutes: RouteRecordRaw[] = [
    {
        // A parent without its own path would capture "/" and hide the home: it gets an address that only redirects.
        path: AUTH_LAYOUT_PATH,
        component: () => import('./views/AuthPagesView.vue'),
        redirect: LOGIN_PATH,
        meta: { access: accessLevels.signedOutOnly },
        children: [
            { path: LOGIN_PATH, name: 'login', component: () => import('./views/LoginView.vue') },
            { path: REGISTER_PATH, name: 'register', component: () => import('./views/RegisterView.vue') },
            {
                path: FORGOT_PASSWORD_PATH,
                name: 'forgotPassword',
                component: () => import('./views/ForgotPasswordView.vue')
            },
            {
                path: NEW_PASSWORD_PATH,
                name: 'newPassword',
                component: () => import('./views/NewPasswordView.vue'),
                meta: { requiredResetStep: resetFlowSteps.codeConfirmed }
            },
            {
                path: COMPLETE_GOOGLE_PROFILE_PATH,
                name: 'completeGoogleProfile',
                component: () => import('./views/CompleteGoogleProfileView.vue')
            }
        ]
    }
]
