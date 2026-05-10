import { createContext, useContext } from 'react'

export const GestureContext = createContext(null)

export function useGesture() {
  const value = useContext(GestureContext)
  if (!value) throw new Error('useGesture must be used inside <GestureContext.Provider>')
  return value
}