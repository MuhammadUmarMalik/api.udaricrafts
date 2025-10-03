import { api } from './client'
import { endpoints } from './endpoints'

export type LoginResponse = {
  message: string
  data: { user: any; token: { type: string; token: string } }
}

export const AuthApi = {
  async login(email: string, password: string) {
    const res = await api.post<LoginResponse>(endpoints.login, { email, password })
    const token = res.data?.data?.token?.token
    if (token) localStorage.setItem('auth_token', token)
    return res.data
  },
  async register(name: string, email: string, password: string, role: string = 'user') {
    const res = await api.post(endpoints.register, { name, email, password, role })
    const token = (res.data as any)?.data?.token?.token
    if (token) localStorage.setItem('auth_token', token)
    return res.data
  },
  async logout() {
    try {
      // Call the backend logout endpoint to invalidate the token
      await api.post(endpoints.logout)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always remove the token from localStorage
      localStorage.removeItem('auth_token')
    }
  },
}


