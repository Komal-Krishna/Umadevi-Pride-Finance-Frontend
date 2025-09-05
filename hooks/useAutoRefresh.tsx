import { useEffect, useCallback, useRef } from 'react'

interface UseAutoRefreshOptions {
  refreshFunction: () => void | Promise<void>
  enabled?: boolean
  intervalMs?: number
}

export const useAutoRefresh = ({ 
  refreshFunction, 
  enabled = true, 
  intervalMs = 30000 // 30 seconds default
}: UseAutoRefreshOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastRefreshRef = useRef<number>(0)

  const handleFocus = useCallback(() => {
    if (enabled) {
      refreshFunction()
      lastRefreshRef.current = Date.now()
    }
  }, [refreshFunction, enabled])

  const handleVisibilityChange = useCallback(() => {
    if (enabled && !document.hidden) {
      refreshFunction()
      lastRefreshRef.current = Date.now()
    }
  }, [refreshFunction, enabled])

  useEffect(() => {
    // Only add event listeners in browser environment
    if (typeof window !== 'undefined' && enabled) {
      window.addEventListener('focus', handleFocus)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      // Set up interval as fallback for production environments
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        // Only refresh if it's been more than 30 seconds since last refresh
        if (now - lastRefreshRef.current > intervalMs) {
          refreshFunction()
          lastRefreshRef.current = now
        }
      }, intervalMs)
      
      return () => {
        window.removeEventListener('focus', handleFocus)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [handleFocus, handleVisibilityChange, enabled, intervalMs, refreshFunction])
}
