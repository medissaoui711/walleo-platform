import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

interface UseApiOptions {
  showSuccess?: boolean
  showError?: boolean
  successMessage?: string
}

export function useApi<T = any>() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(
    async (promise: Promise<T>, options: UseApiOptions = {}) => {
      const { showSuccess = false, showError = true, successMessage } = options

      setIsLoading(true)
      setError(null)

      try {
        const result = await promise
        setData(result)
        if (showSuccess) {
          toast.success(successMessage || 'Operation completed successfully')
        }
        return result
      } catch (err: any) {
        const message = err.response?.data?.error || err.message || 'An error occurred'
        setError(message)
        if (showError) {
          toast.error(message)
        }
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { execute, isLoading, error, data, setData }
}
