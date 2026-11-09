import type { InjectionKey } from 'vue'
import type { AuthService } from './api/authService.ts'

/** Key under which the app provides the AuthService to its components. */
export const authServiceKey: InjectionKey<AuthService> = Symbol('AuthService')
