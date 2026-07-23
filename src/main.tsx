import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

registerSW({ immediate: true })

// iOS Safari reports svh/dvh viewport units as stale right after an orientation
// change until a reflow is forced, which mis-sizes the app and mis-aligns fixed
// overlays. Drive the height from the visual viewport, which updates reliably.
function syncViewportHeight() {
  const height = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${height}px`)
}

syncViewportHeight()
window.addEventListener('resize', syncViewportHeight)
window.addEventListener('orientationchange', syncViewportHeight)
window.visualViewport?.addEventListener('resize', syncViewportHeight)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
