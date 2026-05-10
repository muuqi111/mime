import { useCallback, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const updated = typeof next === 'function' ? next(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(updated))
        } catch {
          // ignore quota / privacy errors
        }
        return updated
      })
    },
    [key],
  )

  return [value, set]
}