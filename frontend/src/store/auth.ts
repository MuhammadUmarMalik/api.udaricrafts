import { create } from 'zustand'
import { AuthApi } from '../api/auth'

type User = {
  id: number
  name: string
  email: string
  role: string
}

type AuthState = {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('auth_token'),
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isAdmin: JSON.parse(localStorage.getItem('auth_user') || 'null')?.role === 'super admin',
  setToken: (token) => set({ token, isAuthenticated: !!token }),
  setUser: (user) => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('auth_user')
    }
    set({ user, isAdmin: user?.role === 'super admin' })
  },
  login: async (email, password) => {
    const data = await AuthApi.login(email, password)
    const token = (data as any)?.data?.token?.token || localStorage.getItem('auth_token')
    const user = (data as any)?.data?.user
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user))
    }
    set({ 
      token, 
      user,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'super admin'
    })
  },
  register: async (name, email, password) => {
    const data = await AuthApi.register(name, email, password)
    const token = (data as any)?.data?.token?.token || localStorage.getItem('auth_token')
    const user = (data as any)?.data?.user
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user))
    }
    set({ 
      token, 
      user,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'super admin'
    })
  },
  logout: () => {
    AuthApi.logout()
    localStorage.removeItem('auth_user')
    set({ token: null, user: null, isAuthenticated: false, isAdmin: false })
  },
}))
