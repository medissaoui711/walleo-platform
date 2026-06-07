import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('merchant_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('merchant_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const merchantLogin = (email: string, password: string) =>
  api.post('/api/v1/merchant/login', { email, password })

export const merchantRegister = (data: { name: string; name_ar: string; email: string; password: string }) =>
  api.post('/api/v1/merchant/register', data)

export const getCampaigns = () => api.get('/api/v1/merchant/campaigns')
export const createCampaign = (data: any) => api.post('/api/v1/merchant/campaigns', data)
export const updateCampaign = (id: number, data: any) => api.put(`/api/v1/merchant/campaigns/${id}`, data)
export const deleteCampaign = (id: number) => api.delete(`/api/v1/merchant/campaigns/${id}`)

export const getMerchantStats = () => api.get('/api/v1/analytics/merchant/stats')
export const getRecentActivity = () => api.get('/api/v1/analytics/merchant/recent-activity')
export const getTopCampaigns = () => api.get('/api/v1/analytics/merchant/top-campaigns')

export default api
