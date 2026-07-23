import { describe, expect, it } from 'vitest'
import { createLevelingPlan, estimateTrackWidthMm } from './leveling'

const ducatoL3 = { wheelbaseMm: 4035, widthMm: 2050 }

describe('createLevelingPlan', () => {
  it('keeps a level vehicle at zero lift', () => {
    const plan = createLevelingPlan({ pitchDegrees: 0, rollDegrees: 0 }, ducatoL3, 'three', 15)

    expect(plan.liftsCm).toEqual({
      frontLeft: 0,
      frontRight: 0,
      rearLeft: 0,
      rearRight: 0,
    })
    expect(plan.selectedWheels).toEqual([])
  })

  it('raises the lower axle in three-wheel mode for a pitch-only slope', () => {
    const plan = createLevelingPlan({ pitchDegrees: 2, rollDegrees: 0 }, ducatoL3, 'three', 15)

    expect(plan.liftsCm.rearLeft).toBeGreaterThan(0)
    expect(plan.liftsCm.rearRight).toBeGreaterThan(0)
    expect(plan.liftsCm.frontLeft).toBe(0)
    expect(plan.liftsCm.frontRight).toBe(0)
  })

  it('raises the lower side in three-wheel mode for a roll-only slope', () => {
    const plan = createLevelingPlan({ pitchDegrees: 0, rollDegrees: 2 }, ducatoL3, 'three', 15)

    expect(plan.liftsCm.frontLeft).toBeGreaterThan(0)
    expect(plan.liftsCm.rearLeft).toBeGreaterThan(0)
    expect(plan.liftsCm.frontRight).toBe(0)
    expect(plan.liftsCm.rearRight).toBe(0)
  })

  it('uses 88 percent of body width as the estimated track width for roll calculations', () => {
    const plan = createLevelingPlan({ pitchDegrees: 0, rollDegrees: 2 }, ducatoL3, 'three', 15)

    expect(estimateTrackWidthMm(ducatoL3.widthMm)).toBe(1804)
    expect(plan.liftsCm.frontLeft).toBe(6)
    expect(plan.liftsCm.rearLeft).toBe(6)
  })

  it('returns two selected candidate positions and residual tilt in two-wheel mode', () => {
    const plan = createLevelingPlan({ pitchDegrees: 2, rollDegrees: 1 }, ducatoL3, 'two', 15)

    expect(plan.selectedWheels).toHaveLength(2)
    expect(Math.hypot(plan.residual.pitchDegrees, plan.residual.rollDegrees)).toBeGreaterThan(0)
  })

  it('warns when a recommendation exceeds the maximum lift', () => {
    const plan = createLevelingPlan({ pitchDegrees: 4, rollDegrees: 0 }, ducatoL3, 'three', 5)

    expect(plan.exceedsMaximum).toBe(true)
  })
})