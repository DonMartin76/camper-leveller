import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

registerSW({ immediate: true })

// iOS Safari (especially installed PWAs) reports stale viewport dimensions right
// after an orientation change and often updates visualViewport.height as a
// property WITHOUT firing a reliable follow-up event. A one-shot read therefore
// captures the wrong (portrait) height. Instead, keep polling for a short window
// after each orientation/resize event so we catch the settled value on our own.
function applyViewportHeight() {
  const height = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`)
  return Math.round(height)
}

let eventCount = 0
let debugEl: HTMLDivElement | null = null

function renderDebug() {
  if (!debugEl) return
  const vv = window.visualViewport
  const orientation = matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait'
  const appHeight = getComputedStyle(document.documentElement).getPropertyValue('--app-height').trim()
  debugEl.textContent =
    `${orientation} | win ${window.innerWidth}x${window.innerHeight}` +
    ` | vv ${vv ? `${Math.round(vv.width)}x${Math.round(vv.height)}` : 'n/a'}` +
    ` | appH ${appHeight} | scrollY ${Math.round(window.scrollY)} | ev ${eventCount}`
}

let settleRaf = 0
function settleViewportHeight() {
  eventCount += 1
  cancelAnimationFrame(settleRaf)
  const start = performance.now()
  const tick = () => {
    applyViewportHeight()
    window.scrollTo(0, 0)
    renderDebug()
    if (performance.now() - start < 1500) settleRaf = requestAnimationFrame(tick)
  }
  settleRaf = requestAnimationFrame(tick)
}

applyViewportHeight()
window.addEventListener('resize', settleViewportHeight)
window.addEventListener('orientationchange', settleViewportHeight)
window.visualViewport?.addEventListener('resize', settleViewportHeight)
matchMedia('(orientation: landscape)').addEventListener('change', settleViewportHeight)

if (location.hash.includes('debug') || localStorage.getItem('camper-leveller.debug') === '1') {
  debugEl = document.createElement('div')
  debugEl.style.cssText =
    'position:fixed;top:0;left:0;z-index:9999;background:rgba(0,0,0,.78);color:#3f6;' +
    'font:10px/1.4 ui-monospace,Menlo,monospace;padding:3px 6px;pointer-events:none;white-space:nowrap;'
  document.body.appendChild(debugEl)
  renderDebug()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
