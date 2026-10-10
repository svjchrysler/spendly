import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { registerPwa } from '@/lib/register-pwa'
import { armSplashFailsafe } from '@/lib/splash'
import './index.css'

// iOS solo aplica `:active` al tocar si el documento escucha touch: sin esto
// los estados de presionado no pintan (el login no monta ningún otro listener)
document.addEventListener('touchstart', () => {}, { passive: true })

armSplashFailsafe()
registerPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
