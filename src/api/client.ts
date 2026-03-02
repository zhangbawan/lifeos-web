import axios from 'axios'
import type { Entry, Analysis, DailyStat, TimelineItem, CreateEntryRequest, ApiResponse } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Entries API
export const entriesApi = {
  list: async (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiResponse<Entry[]>>('/entries', { params })
    return response.data.data
  },

  get: async (id: string) => {
    const response = await api.get<ApiResponse<Entry>>(`/entries/${id}`)
    return response.data.data
  },

  create: async (data: CreateEntryRequest) => {
    const response = await api.post<ApiResponse<Entry>>('/entries', data)
    return response.data.data
  },
}

// Analysis API
export const analysisApi = {
  trigger: async (entryId?: string) => {
    const response = await api.post<ApiResponse<void>>('/analyze/trigger', { entryId })
    return response.data
  },

  getResults: async (params?: { entryId?: string; startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiResponse<Analysis[]>>('/analyze/results', { params })
    return response.data.data
  },
}

// Stats API
export const statsApi = {
  getDaily: async (params?: { date?: string; days?: number }) => {
    const response = await api.get<ApiResponse<DailyStat[]>>('/stats/daily', { params })
    return response.data.data
  },

  getTimeline: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiResponse<TimelineItem[]>>('/stats/timeline', { params })
    return response.data.data
  },
}

export default api
