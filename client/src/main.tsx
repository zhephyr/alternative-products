import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './router/AppRouter'
import { ThemeProvider } from './context/ThemeProvider'

// Mount the React application with ThemeProvider wrapping all routes
import { AuthProvider } from './contexts/AuthContext'

console.info(`[alt.it Client] Environment: ${import.meta.env.MODE}`)
console.info('[alt.it Client] Application successfully mounted to React DOM.')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
