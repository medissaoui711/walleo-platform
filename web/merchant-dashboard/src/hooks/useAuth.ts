import { useState, useEffect } from 'react'
import { merchantLogin, merchantRegister } from '../lib/api'
import toast from 'react-hot-toast'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [merchant, setMerchant] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('merchant_token')
    if (token) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await merchantLogin(email, password)
      const { access_token, merchant: merchantData } = response.data
      localStorage.setItem('merchant_token', access_token)
      setMerchant(merchantData)
      setIsAuthenticated(true)
      toast.success('Login successful!')
      return true
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed')
      return false
    }
  }

  const register = async (data: { name: string; name_ar: string; email: string; password: string }) => {
    try {
      const response = await merchantRegister(data)
      const { access_token, merchant: merchantData } = response.data
      localStorage.setItem('merchant_token', access_token)
      setMerchant(merchantData)
      setIsAuthenticated(true)
      toast.success('Registration successful!')
      return true
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('merchant_token')
    setIsAuthenticated(false)
    setMerchant(null)
    toast.success('Logged out')
  }

  return { isAuthenticated, isLoading, merchant, login, register, logout }
}
