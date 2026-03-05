import { createContext, useContext, useEffect, useState } from 'react'
import { isLoggedIn } from 'src/lib/session'
import { WebSocketClient } from 'src/web-socket-client'
import '../web-socket-client'

export const wsClient = new WebSocketClient(import.meta.env.VITE_APP_WSS_URL)

export type Theme = 'light' | 'dark'

export interface AppContextProps {
  collapsed: boolean
  theme: Theme
  socket: WebSocketClient | null
  isAuthenticated: boolean
  setTheme: (theme: Theme) => void
  setCollapsed: (value: boolean) => void
}

interface AppContextProviderProps {
  children: React.ReactNode
}

export const AppContext = createContext<AppContextProps | null>(null)

const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState<Theme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  useEffect(() => {
    const value = localStorage.getItem('theme') as Theme
    setTheme(value ?? 'light')
  }, [])

  useEffect(() => {
    const value = localStorage.getItem('collapsed')
    setCollapsed(JSON.parse(value ?? 'false'))
  }, [])

  const toggleTheme = (theme: Theme) => {
    localStorage.setItem('theme', theme)
    setTheme(theme)
  }

  const toggleCollapsed = (value: boolean) => {
    localStorage.setItem('collapsed', value?.toString())
    setCollapsed(value)
  }

  return (
    <AppContext.Provider
      value={{
        socket: wsClient,
        collapsed,
        theme,
        isAuthenticated: isLoggedIn(),
        setCollapsed: toggleCollapsed,
        setTheme: toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextProps {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error(
      'useAppContext solo puede ser utilizado dentro del AppContextProvider'
    )
  }

  return context
}

export default AppContextProvider
