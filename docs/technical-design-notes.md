# Camper Leveller MVP Technical Design Notes

## Purpose

This document records engineering implications of the approved MVP requirements. The MVP delivery form is a progressive web application (PWA). Its selected implementation stack is Vite, React, and TypeScript; the detailed coordinate transformation, calculation implementation, visual design, and deployment configuration remain to be designed.

## 1. Selected Stack

| Concern | Decision |
| --- | --- |
| Build tooling | Vite with TypeScript |
| User interface | React with plain component-scoped CSS and CSS custom properties |
| Application state | React `useReducer` and focused hooks; no state-management library initially |
| Motion sensing | Browser `DeviceOrientationEvent` and `DeviceMotionEvent` APIs, wrapped by an in-repository sensor adapter |
| Leveling calculation | Pure TypeScript module with no React or browser dependencies |
| Local configuration | `localStorage` |
| Offline support | `vite-plugin-pwa` with Workbox-generated service-worker precaching |
| Tests | Vitest for application and solver logic; Playwright for UI and offline-cache flows |
| Hosting | HTTPS static hosting; no application backend |

The implementation shall not introduce a database, backend, UI component framework, CSS framework, or generic sensor abstraction package for the MVP. The calculation and coordinate transformation are product-critical and must remain owned, explicit, and independently testable.

## 2. Platform Scope

The first product target is Safari on iPhone. Android is a supported product direction, so requirements-facing behavior should remain platform-neutral. The MVP shall be an HTTPS-served PWA and must support:

- A landscape-first measurement experience, including a portrait rotation prompt. Safari does not provide a dependable web-page orientation lock, so the MVP cannot enforce landscape in the way a native application can.
- Built-in device orientation/level sensing through browser APIs, including an explicit user-gesture permission flow where iOS requires it.
- A responsive landscape interface.
- Local persistence of configuration.
- Offline operation after an initial successful online load.
- Accessible text and controls in outdoor use.

Adding the PWA to the Home Screen is optional for the MVP. The application must be usable directly in Safari. A native mobile app remains a later option if real-device testing identifies unacceptable Safari constraints in motion sensing, coordinate behavior, backgrounding, or landscape use.

## 3. Sensor and Coordinate Model

The product requires browser-provided phone orientation data that can be transformed into vehicle-relative pitch and roll when the phone's physical top, at the screen's right edge in the supported landscape hold, points to vehicle front. iOS Safari requires the user to grant motion/orientation access from an explicit interaction; the user interface must explain this before requesting access and provide a usable unavailable-permission state.

The implementation design must define:

- The device coordinate system provided by each platform.
- The vehicle coordinate system used by calculations.
- The conversion between those systems for the prescribed forward orientation.
- The sensing update rate, filtering, and stability criterion.
- A sensing tolerance for describing a vehicle as level.
- Behavior when orientation permission, supported hardware, or reliable readings are unavailable.

Phone position along the vehicle's floor does not alter the ideal rigid-body plane represented by pitch and roll, provided the phone lies flat and remains aligned. Real vehicles have flexible surfaces and local irregularities, so the product should require a fixed, stable, flat placement surface and treat measurements as guidance rather than calibration-grade data.

## 4. Geometry and Calculation Contract

The calculation represents the camper as four wheel locations forming a rectangle:

- Front/rear separation is wheelbase.
- Left/right separation is configured body width.
- Current attitude is defined by vehicle-relative pitch and roll.
- A recommendation gives non-negative vertical lifts at the wheel locations.

A future calculation specification must define angle units, sign conventions, rounding sequence, and how sensor tolerance interacts with whole-centimetre display rounding.

The solver must uphold these product contracts:

- A recommendation never requires lowering a wheel.
- Three-wheel mode seeks a zero-residual plane-level result, subject to permissible rounding and limits.
- Two-wheel mode minimizes a defined combined residual pitch/roll error, then lower maximum lift, then lower total lift, then a stable documented wheel-order tie-break.
- The residual pitch and roll of the selected two-wheel plan are calculated from the unrounded or precisely defined plan, then displayed using documented rounding.
- The configured maximum ramp height produces a warning rather than silently clipping a lift.

The planned model is intended for ordinary four-wheel campers. It must not be silently applied to dual rear wheels, non-rectangular wheel layouts, multi-axle vehicles, or vehicles whose practical jacking/ramp instructions contradict the model.

## 5. User Interface States

At minimum, the UI design must account for these states:

- Initial placement guidance.
- Active live measurement.
- Paused valid result.
- Sensor unavailable, invalid, or unstable.
- Invalid vehicle configuration.
- Lift plan within configured maximum.
- Lift plan exceeding configured maximum.
- No supported recommendation available.

The central camper-symbol control changes from Pause during active measurement to Resume during a frozen result. Its state must be unmistakable. Wheel labels must remain anchored to their physical positions in the top-down vehicle representation.

## 6. Data and Persistence

The application needs local storage for:

- Selected vehicle preset or Custom configuration.
- Custom wheelbase and body width in millimetres.
- Selected two-wheel or three-wheel mode.
- Maximum ramp height in centimetres.

No account, synchronization, telemetry, or network service is required for the MVP. A service worker shall cache the application shell, vehicle presets, calculation logic, instructional graphics, and user-interface assets after the initial online load. A later implementation must not make a runtime network request on the measurement or calculation path, and must define a clear fallback if the first offline visit occurs before the app is cached.

Vehicle presets must be data-driven rather than embedded only in layout or calculation logic, so the verified 2026 Fiat dimensions can be updated independently. The release implementation must record an official source for the final preset values and intended market.

## 7. Validation Strategy

A later implementation plan should provide automated calculation tests for:

- Level, pitch-only, roll-only, and combined slopes.
- Every candidate pair in Two wheels mode, including deterministic tie cases.
- Every candidate three-wheel plan.
- Non-negative-lift enforcement.
- Whole-centimetre rounding boundaries.
- Configured maximum-ramp-height warnings.
- Each vehicle preset and Custom validation boundaries.

Device tests should verify portrait rejection/rotation behavior, phone-forward coordinate interpretation, paused-value freezing, sensor recovery, and the legibility of wheel values at supported phone sizes and accessibility text sizes.

## 8. Deferred Decisions

The following decisions are intentionally deferred until the technical design phase:

- Exact sensor API and filtering approach.
- Mathematical solver implementation.
- Exact visual design system and icon set.
- CI environment.
- Hosting provider, deployment configuration, cache-update strategy, and PWA manifest details.
- Whether future native distribution is warranted after real-device MVP validation.

## 9. Safety Boundary

The software can calculate geometry-based ramp guidance but cannot establish whether the ground, ramp, vehicle, tires, brakes, load distribution, or occupant behavior is safe. The implementation must preserve this distinction in warnings and avoid claiming that a result guarantees stability or safe leveling.