import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AuthContextType, User, AuthTokens, LoginCredentials, RegisterData } from '@/types/auth'
import { loginUser, registerUser, resetPasswordRequest, saveAuthData, clearAuthData, loadAuthData } from '@/services/authService'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const data = loadAuthData()
    if (data.user && data.tokens) {
      setUser(data.user)
      setTokens(data.tokens)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await loginUser(credentials)
    setUser(result.user)
    setTokens(result.tokens)
    saveAuthData(result.user, result.tokens)
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    await registerUser(data)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setTokens(null)
    clearAuthData()
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await resetPasswordRequest(email)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isLoading,
        isAuthenticated: !!user && !!tokens,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
