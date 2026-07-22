export type Wheel = 'frontLeft' | 'frontRight' | 'rearLeft' | 'rearRight'

export type WheelLifts = Record<Wheel, number>

export type Measurement = {
  pitchDegrees: number
  rollDegrees: number
}

export type VehicleGeometry = {
  wheelbaseMm: number
  widthMm: number
}

export type LevelingMode = 'two' | 'three'

export type LevelingPlan = {
  liftsCm: WheelLifts
  selectedWheels: Wheel[]
  residual: Measurement
  exceedsMaximum: boolean
}

const wheels: Wheel[] = ['frontLeft', 'frontRight', 'rearLeft', 'rearRight']

const wheelOrder = new Map(wheels.map((wheel, index) => [wheel, index]))

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function radiansToDegrees(radians: number) {
  return (radians * 180) / Math.PI
}

function roundCentimetres(valueMm: number) {
  return Math.max(0, Math.round(valueMm / 10))
}

function emptyLifts(): WheelLifts {
  return {
    frontLeft: 0,
    frontRight: 0,
    rearLeft: 0,
    rearRight: 0,
  }
}

function wheelHeights(measurement: Measurement, vehicle: VehicleGeometry) {
  const frontHeight = Math.tan(degreesToRadians(measurement.pitchDegrees)) * (vehicle.wheelbaseMm / 2)
  const rightHeight = Math.tan(degreesToRadians(measurement.rollDegrees)) * (vehicle.widthMm / 2)

  return {
    frontLeft: frontHeight - rightHeight,
    frontRight: frontHeight + rightHeight,
    rearLeft: -frontHeight - rightHeight,
    rearRight: -frontHeight + rightHeight,
  } satisfies Record<Wheel, number>
}

function fullLevelLifts(measurement: Measurement, vehicle: VehicleGeometry): WheelLifts {
  const heights = wheelHeights(measurement, vehicle)
  const highestWheel = Math.max(...Object.values(heights))

  return Object.fromEntries(
    wheels.map((wheel) => [wheel, roundCentimetres(highestWheel - heights[wheel])]),
  ) as WheelLifts
}

function residualAfterLifts(
  measurement: Measurement,
  vehicle: VehicleGeometry,
  liftsCm: WheelLifts,
): Measurement {
  const heights = wheelHeights(measurement, vehicle)
  const adjustedHeights = Object.fromEntries(
    wheels.map((wheel) => [wheel, heights[wheel] + liftsCm[wheel] * 10]),
  ) as Record<Wheel, number>

  const frontAverage = (adjustedHeights.frontLeft + adjustedHeights.frontRight) / 2
  const rearAverage = (adjustedHeights.rearLeft + adjustedHeights.rearRight) / 2
  const leftAverage = (adjustedHeights.frontLeft + adjustedHeights.rearLeft) / 2
  const rightAverage = (adjustedHeights.frontRight + adjustedHeights.rearRight) / 2

  return {
    pitchDegrees: radiansToDegrees(Math.atan((frontAverage - rearAverage) / vehicle.wheelbaseMm)),
    rollDegrees: radiansToDegrees(Math.atan((rightAverage - leftAverage) / vehicle.widthMm)),
  }
}

function combinations(items: Wheel[], size: number): Wheel[][] {
  if (size === 0) return [[]]
  if (items.length < size) return []

  const [first, ...rest] = items
  return [
    ...combinations(rest, size - 1).map((combination) => [first, ...combination]),
    ...combinations(rest, size),
  ]
}

function comparePlans(first: LevelingPlan, second: LevelingPlan) {
  const firstError = Math.hypot(first.residual.pitchDegrees, first.residual.rollDegrees)
  const secondError = Math.hypot(second.residual.pitchDegrees, second.residual.rollDegrees)
  if (firstError !== secondError) return firstError - secondError

  const firstMaximum = Math.max(...Object.values(first.liftsCm))
  const secondMaximum = Math.max(...Object.values(second.liftsCm))
  if (firstMaximum !== secondMaximum) return firstMaximum - secondMaximum

  const firstTotal = Object.values(first.liftsCm).reduce((sum, lift) => sum + lift, 0)
  const secondTotal = Object.values(second.liftsCm).reduce((sum, lift) => sum + lift, 0)
  if (firstTotal !== secondTotal) return firstTotal - secondTotal

  return first.selectedWheels
    .map((wheel) => wheelOrder.get(wheel) ?? 0)
    .join(',')
    .localeCompare(second.selectedWheels.map((wheel) => wheelOrder.get(wheel) ?? 0).join(','))
}

export function createLevelingPlan(
  measurement: Measurement,
  vehicle: VehicleGeometry,
  mode: LevelingMode,
  maximumLiftCm: number,
): LevelingPlan {
  const idealLifts = fullLevelLifts(measurement, vehicle)

  if (mode === 'three') {
    const liftsCm = idealLifts
    const selectedWheels = wheels.filter((wheel) => liftsCm[wheel] > 0)
    return {
      liftsCm,
      selectedWheels,
      residual: residualAfterLifts(measurement, vehicle, liftsCm),
      exceedsMaximum: Math.max(...Object.values(liftsCm)) > maximumLiftCm,
    }
  }

  const candidates = combinations(wheels, 2).map((selectedWheels) => {
    const liftsCm = emptyLifts()
    for (const wheel of selectedWheels) liftsCm[wheel] = idealLifts[wheel]

    return {
      liftsCm,
      selectedWheels,
      residual: residualAfterLifts(measurement, vehicle, liftsCm),
      exceedsMaximum: Math.max(...Object.values(liftsCm)) > maximumLiftCm,
    }
  })

  return candidates.sort(comparePlans)[0]
}