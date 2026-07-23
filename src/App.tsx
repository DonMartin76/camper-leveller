import { Pause, Play, Settings, Signal, SignalZero, TriangleAlert, X } from 'lucide-react'
import { useEffect, useReducer, useRef, useState } from 'react'
import './App.css'
import { defaultVehiclePreset, vehiclePresetLabel, vehiclePresets, type VehiclePreset } from './data/vehiclePresets'
import { createLevelingPlan, estimateTrackWidthMm, type LevelingMode, type Measurement, type VehicleGeometry, type Wheel } from './lib/leveling'
import { useMotionSensor } from './lib/useMotionSensor'

type PresetId = string | 'custom'
type AppState = { presetId: PresetId; vehicle: VehicleGeometry; mode: LevelingMode; maximumLiftCm: number }
type Action =
  | { type: 'preset'; value: PresetId }
  | { type: 'vehicle'; field: keyof VehicleGeometry; value: number }
  | { type: 'mode'; value: LevelingMode }
  | { type: 'maximum'; value: number }

const defaultState: AppState = { presetId: defaultVehiclePreset.id, vehicle: defaultVehiclePreset, mode: 'two', maximumLiftCm: 15 }
const wheels: Wheel[] = ['frontLeft', 'frontRight', 'rearLeft', 'rearRight']
const wheelLabels: Record<Wheel, string> = { frontLeft: 'Front left', frontRight: 'Front right', rearLeft: 'Rear left', rearRight: 'Rear right' }
const legacyPresetIds: Record<string, string> = { L2: 'fiat-ducato-l2', L3: 'fiat-ducato-l3', L4: 'fiat-ducato-l4' }
const presetsByManufacturer = vehiclePresets.reduce<Record<string, VehiclePreset[]>>((groups, preset) => {
  groups[preset.manufacturer] ??= []
  groups[preset.manufacturer].push(preset)
  return groups
}, {})

function toggleDebug() {
  if (window.localStorage.getItem('camper-leveller.debug') === '1') {
    window.localStorage.removeItem('camper-leveller.debug')
  } else {
    window.localStorage.setItem('camper-leveller.debug', '1')
  }
  window.location.reload()
}

function loadState(): AppState {
  try {
    const stored = window.localStorage.getItem('camper-leveller.settings')
    if (!stored) return defaultState
    const parsed = JSON.parse(stored) as AppState
    const presetId = legacyPresetIds[parsed.presetId] ?? parsed.presetId
    if (presetId === 'custom' && parsed.vehicle) return { ...parsed, presetId }
    const preset = vehiclePresets.find((candidate) => candidate.id === presetId)
    return preset ? { ...parsed, presetId: preset.id, vehicle: preset } : defaultState
  } catch { return defaultState }
}

function reducer(state: AppState, action: Action): AppState {
  if (action.type === 'preset') {
    if (action.value === 'custom') return { ...state, presetId: 'custom' }
    const preset = vehiclePresets.find((candidate) => candidate.id === action.value)
    return preset ? { ...state, presetId: preset.id, vehicle: preset } : state
  }
  if (action.type === 'vehicle') return { ...state, presetId: 'custom', vehicle: { ...state.vehicle, [action.field]: action.value } }
  if (action.type === 'mode') return { ...state, mode: action.value }
  return { ...state, maximumLiftCm: action.value }
}

function WheelValue({ wheel, lift, active }: { wheel: Wheel; lift: number | null; active: boolean }) {
  return <div className={`wheel-value ${wheel} ${active ? 'active' : ''}`}><span>{wheelLabels[wheel]}</span><strong>{lift === null ? '--' : `${lift} cm`}</strong></div>
}

function App() {
  const [state, dispatch] = useReducer(reducer, defaultState, loadState)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [paused, setPaused] = useState<Measurement | null>(null)
  const [pausePending, setPausePending] = useState(false)
  const latestMeasurement = useRef<Measurement | null>(null)
  const pauseTimer = useRef<number | null>(null)
  const motion = useMotionSensor()
  const measurement = paused ?? motion.measurement
  const plan = measurement ? createLevelingPlan(measurement, state.vehicle, state.mode, state.maximumLiftCm) : null
  const isPaused = paused !== null

  useEffect(() => { window.localStorage.setItem('camper-leveller.settings', JSON.stringify(state)) }, [state])
  useEffect(() => { latestMeasurement.current = motion.measurement }, [motion.measurement])
  useEffect(() => () => {
    if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current)
  }, [])

  function toggleMeasurement() {
    if (isPaused) setPaused(null)
    else if (pausePending) return
    else if (motion.status === 'active' && motion.measurement) {
      setPausePending(true)
      pauseTimer.current = window.setTimeout(() => {
        setPaused(latestMeasurement.current)
        setPausePending(false)
        pauseTimer.current = null
      }, 1000)
    }
    else {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        void document.documentElement.requestFullscreen().catch(() => undefined)
      }
      void motion.requestAccess()
    }
  }

  const controlText = isPaused ? 'Resume' : pausePending ? 'Pausing...' : motion.status === 'active' ? 'Pause' : 'Enable motion'

  return (
    <main className="app-shell">
      <div className="portrait-notice" role="status">
        <div>
          <p className="portrait-app-name">Camper Leveller</p>
          <p className="portrait-message">Rotate your phone to landscape to measure.</p>
          <p className="portrait-copyright">(c) 2026 Martin Danielsson</p>
          <button className="portrait-build" type="button" onClick={toggleDebug} title="Tap to toggle diagnostics">build {__BUILD_SHA__} &middot; {__BUILD_DATE__}</button>
        </div>
      </div>
      <div className="landscape-app">
        {!settingsOpen && <button className="icon-button settings-button" type="button" onClick={() => setSettingsOpen(true)} aria-label="Open settings" title="Settings"><Settings size={22} /></button>}
        <section className="workspace" aria-label="Live leveling guidance">
          <aside className="measurement-panel">
            <div className="status-line">{motion.status === 'active' ? <Signal size={18} /> : <SignalZero size={18} />}<span>{isPaused ? 'Paused reading' : motion.label}</span></div>
            <div className="angles"><div><span>Pitch</span><strong>{measurement ? `${measurement.pitchDegrees.toFixed(1)} deg` : '--'}</strong></div><div><span>Roll</span><strong>{measurement ? `${measurement.rollDegrees.toFixed(1)} deg` : '--'}</strong></div></div>
            <div className="mode-control" aria-label="Ramp plan mode"><button className={state.mode === 'two' ? 'active' : ''} type="button" onClick={() => dispatch({ type: 'mode', value: 'two' })}>2 wheels</button><button className={state.mode === 'three' ? 'active' : ''} type="button" onClick={() => dispatch({ type: 'mode', value: 'three' })}>3 wheels</button></div>
            {state.mode === 'two' && plan && <p className="residual">Remaining: {plan.residual.pitchDegrees.toFixed(1)} deg pitch, {plan.residual.rollDegrees.toFixed(1)} deg roll</p>}
          </aside>
          <section className="vehicle-stage" aria-label="Place the physical top of your phone, at the right edge in landscape, toward the front of the camper">
            <p className="orientation-label">Phone top at right points to vehicle front</p>
            <div className="vehicle-layout">
              {wheels.map((wheel) => <WheelValue key={wheel} wheel={wheel} lift={plan?.liftsCm[wheel] ?? null} active={plan?.selectedWheels.includes(wheel) ?? false} />)}
              <div className="camper-symbol" aria-hidden="true"><div className="front-arrow">Front</div><div className="windscreen" /><div className="cab" /><div className="living-area" /><div className="phone-guide">TOP</div></div>
              <button className={`measurement-button ${isPaused ? 'paused' : ''} ${pausePending ? 'delaying' : ''}`} type="button" onClick={toggleMeasurement} disabled={pausePending}>{isPaused ? <Play size={25} fill="currentColor" /> : motion.status === 'active' ? <Pause size={25} fill="currentColor" /> : <Signal size={25} />}<span>{controlText}</span></button>
            </div>
            <p className="vehicle-summary">{state.presetId === 'custom' ? 'Custom' : vehiclePresetLabel(vehiclePresets.find((preset) => preset.id === state.presetId)!)} | {state.vehicle.wheelbaseMm} mm wheelbase | {state.vehicle.widthMm} mm body width | {Math.round(estimateTrackWidthMm(state.vehicle.widthMm))} mm estimated track | {state.maximumLiftCm} cm ramp limit</p>
            <div className="warning-slot">{plan?.exceedsMaximum && <div className="warning" role="alert"><TriangleAlert size={20} /><span>One or more lifts exceed your {state.maximumLiftCm} cm ramp limit.</span></div>}</div>
          </section>
        </section>
        {motion.status === 'denied' && <p className="sensor-message" role="alert">Motion access is off. Allow Motion & Orientation Access in Safari, then try again.</p>}
        {motion.status === 'unsupported' && <p className="sensor-message" role="alert">This browser does not provide the motion data needed for a live measurement.</p>}
      </div>
      {settingsOpen && <div className="settings-scrim" onClick={() => setSettingsOpen(false)}><aside className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(event) => event.stopPropagation()}><div className="settings-header"><div><p className="eyebrow">Configuration</p><h2 id="settings-title">Vehicle settings</h2></div><button className="icon-button" type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings" title="Close settings"><X size={22} /></button></div><label>Vehicle preset<select value={state.presetId} onChange={(event) => dispatch({ type: 'preset', value: event.target.value as PresetId })}>{Object.entries(presetsByManufacturer).map(([manufacturer, presets]) => <optgroup key={manufacturer} label={manufacturer}>{presets.map((preset) => <option key={preset.id} value={preset.id}>{vehiclePresetLabel(preset)}</option>)}</optgroup>)}<option value="custom">Custom dimensions</option></select></label><label>Wheelbase (mm)<input type="number" min="2000" max="6000" value={state.vehicle.wheelbaseMm} onChange={(event) => dispatch({ type: 'vehicle', field: 'wheelbaseMm', value: Number(event.target.value) })} /></label><label>Body width, excluding mirrors (mm)<input type="number" min="1500" max="3000" value={state.vehicle.widthMm} onChange={(event) => dispatch({ type: 'vehicle', field: 'widthMm', value: Number(event.target.value) })} /></label><p className="settings-note">Estimated track width: {Math.round(estimateTrackWidthMm(state.vehicle.widthMm))} mm (88% of body width).</p><label>Maximum ramp height (cm)<input type="number" min="1" max="100" value={state.maximumLiftCm} onChange={(event) => dispatch({ type: 'maximum', value: Number(event.target.value) })} /></label></aside></div>}
    </main>
  )
}

export default App