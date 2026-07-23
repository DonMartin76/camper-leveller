import { useEffect, useState } from 'react'
import type { Measurement } from './leveling'

type MotionStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'

type MotionSensor = {
  measurement: Measurement | null
  status: MotionStatus
  label: string
  requestAccess: () => Promise<void>
}

type PermissionOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

function labelFor(status: MotionStatus) {
  switch (status) {
    case 'active': return 'Live measurement'
    case 'requesting': return 'Waiting for motion access'
    case 'denied': return 'Motion access denied'
    case 'unsupported': return 'Motion unavailable'
    default: return 'Motion is off'
  }
}

export function useMotionSensor(): MotionSensor {
  const [measurement, setMeasurement] = useState<Measurement | null>(null)
  const [status, setStatus] = useState<MotionStatus>(() =>
    typeof window === 'undefined' || !('DeviceOrientationEvent' in window) ? 'unsupported' : 'idle',
  )

  useEffect(() => {
    if (status !== 'active') return

    function onOrientation(event: DeviceOrientationEvent) {
      if (event.beta === null || event.gamma === null) return
      // The phone's physical top, at screen right in the supported landscape hold, maps to vehicle front.
      // Roll is inverted so a physically raised left side reads as the high side (verified on-device).
      setMeasurement({ pitchDegrees: event.beta, rollDegrees: -event.gamma })
    }

    window.addEventListener('deviceorientation', onOrientation, true)
    return () => window.removeEventListener('deviceorientation', onOrientation, true)
  }, [status])

  async function requestAccess() {
    if (!('DeviceOrientationEvent' in window)) {
      setStatus('unsupported')
      return
    }

    setStatus('requesting')
    try {
      const permissionEvent = DeviceOrientationEvent as PermissionOrientationEvent
      const permission = permissionEvent.requestPermission ? await permissionEvent.requestPermission() : 'granted'
      setStatus(permission === 'granted' ? 'active' : 'denied')
    } catch {
      setStatus('denied')
    }
  }

  return { measurement, status, label: labelFor(status), requestAccess }
}