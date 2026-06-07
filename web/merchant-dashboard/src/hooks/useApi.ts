import { useState, useCallback } from 'react'
import api from '../lib/api'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T = any>(initialData: T | null = null) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  })

  const fetch = useCallback(async (url: string, params?: Record<string, any>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const res = await api.get(url, { params })
      setState({ data: res.data, loading: false, error: null })
      return res.data as T
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Request failed'
      setState((prev) => ({ ...prev, loading: false, error: msg }))
      return null
    }
  }, [])

  const post = useCallback(async (url: string, body?: any) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const res = await api.post(url, body)
      setState({ data: res.data, loading: false, error: null })
      return res.data
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Request failed'
      setState((prev) => ({ ...prev, loading: false, error: msg }))
      return null
    }
  }, [])

  const put = useCallback(async (url: string, body?: any) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const res = await api.put(url, body)
      setState({ data: res.data, loading: false, error: null })
      return res.data
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Request failed'
      setState((prev) => ({ ...prev, loading: false, error: msg }))
      return null
    }
  }, [])

  const del = useCallback(async (url: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await api.delete(url)
      setState({ data: null, loading: false, error: null })
      return true
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Request failed'
      setState((prev) => ({ ...prev, loading: false, error: msg }))
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null })
  }, [initialData])

  return { ...state, fetch, post, put, del, reset }
}
