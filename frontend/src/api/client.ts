import axios from 'axios'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3333'

export class ApiClient {
  private http: AxiosInstance

  constructor(baseURL: string = API_BASE_URL) {
    this.http = axios.create({ baseURL, withCredentials: false })

    this.http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        // Axios v1 headers can be AxiosHeaders or plain object
        const headers: any = config.headers ?? {}
        if (typeof headers.set === 'function') {
          headers.set('Authorization', `Bearer ${token}`)
        } else {
          config.headers = { ...headers, Authorization: `Bearer ${token}` }
        }
      }
      return config
    })
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.get<T>(url, config)
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.post<T>(url, data, config)
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.put<T>(url, data, config)
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.patch<T>(url, data, config)
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.delete<T>(url, config)
  }
}

export const api = new ApiClient()


