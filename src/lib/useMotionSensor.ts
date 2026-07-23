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

// The calibrated landscape hold is "phone top at screen right" (screen.orientation
// angle 90). The opposite landscape (top at screen left) is a 180 degree in-plane
// flip that negates both tilt axes, so we detect it and flip to keep the numbers
// correct whichever way the phone is rotated.
function landscapeFlip(): number {
  const angle = typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.angle === 'number'
    ? screen.orientation.angle
    : (window as unknown as { orientation?: number }).orientation ?? 90
  return angle === 270 || angle === -90 ? -1 : 1
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
      const flip = landscapeFlip()
      setMeasurement({ pitchDegrees: flip * event.beta, rollDegrees: flip * -event.gamma })
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