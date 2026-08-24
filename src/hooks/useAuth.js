import { useCallback, useState } from 'react'
import { hasPassword, resetPassword, setPassword, verifyPassword } from '../lib/auth'

const UNLOCK_KEY = 'studing:unlocked'

export function useAuth() {
  const [isSetup, setIsSetup] = useState(hasPassword)
  const [isUnlocked, setIsUnlocked] = useState(() => sessionStorage.getItem(UNLOCK_KEY) === '1')

  const setup = useCallback(async (password) => {
    await setPassword(password)
    setIsSetup(true)
    sessionStorage.setItem(UNLOCK_KEY, '1')
    setIsUnlocked(true)
  }, [])

  const login = useCallback(async (password) => {
    const ok = await verifyPassword(password)
    if (ok) {
      sessionStorage.setItem(UNLOCK_KEY, '1')
      setIsUnlocked(true)
    }
    return ok
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(UNLOCK_KEY)
    setIsUnlocked(false)
  }, [])

  const forgotPassword = useCallback(() => {
    resetPassword()
    sessionStorage.removeItem(UNLOCK_KEY)
    setIsSetup(false)
    setIsUnlocked(false)
  }, [])

  return { isSetup, isUnlocked, setup, login, logout, forgotPassword }
}
