# Camper Leveller MVP Requirements

## 1. Purpose

Camper Leveller helps a user place leveling ramps beneath selected wheels so their parked camper is level. It uses the phone's built-in level/orientation sensing and the configured vehicle geometry to provide lift guidance in centimetres.

The MVP is a progressive web application (PWA), initially used through Safari on iPhone, with Android retained in product scope. It is guidance only: it does not operate vehicle equipment or confirm that a vehicle is safe to drive, park, or support.

## 2. Scope

### In scope

- Fixed-landscape phone experience.
- Live fore/aft pitch and left/right roll measurement.
- A vehicle symbol that shows the required phone direction: in the supported landscape hold, the phone's physical top is at the screen's right edge and points to the front of the camper.
- Per-wheel lift recommendations for physical leveling ramps.
- Two-wheel and three-wheel recommendation modes.
- Fiat Ducato panel-van presets and a Custom vehicle configuration.
- Local maximum-ramp-height setting and warnings.
- Pause and Resume of a live measurement and its results.
- PWA installation or offline caching for use without a network connection after an initial successful load.

### Out of scope

- Direct control of leveling ramps, hydraulic jacks, airbags, or any vehicle system.
- Detection that the vehicle has been driven onto a ramp, tire contact, wheel chocking, parking-brake state, or vehicle stability.
- Accounts, cloud synchronization, telemetry, maps, campsite information, or a vehicle catalogue beyond the named presets.
- A guarantee that calculated lift values will level, stabilize, or safely support a vehicle.

## 3. Definitions

| Term | Meaning |
| --- | --- |
| Front | The direction in which the camper is driven forward. |
| Phone forward direction | In the supported landscape hold, the phone's physical top edge is at the screen's right edge and points to the camper front. |
| Pitch | Fore/aft tilt of the camper. |
| Roll | Left/right tilt of the camper. |
| Lift | The vertical height, in cm, by which a wheel should be raised using a ramp. |
| Residual tilt | The pitch and roll remaining after applying a two-wheel recommendation. |
| Wheelbase | Distance between the front and rear wheel axle centres. |
| Body width | Distance between the left and right wheel positions used by the model; configured as vehicle body width excluding mirrors for the supplied presets. |

## 4. User and Operating Conditions

The user is a camper owner preparing to park on uneven ground. The user must:

- Park safely and follow their vehicle and ramp manufacturers' instructions.
- Place the phone on a fixed, stable, and flat surface in the vehicle while measuring.
- Hold the phone in the supported landscape direction, with its physical top at screen right and aligned to the vehicle front, as shown in the application.
- Keep the phone still until they pause the reading.
- Independently decide whether the calculated lift is appropriate for their vehicle, ramps, terrain, and parking situation.

The app shall not imply that the calculation replaces safety checks or manufacturer guidance.

## 5. Functional Requirements

### 5.1 Orientation and Measurement

- FR-1: The application shall be designed for landscape use and shall prompt the user to rotate their device when it is in portrait orientation. It shall not represent portrait use as a supported measurement state.
- FR-2: The application shall display a symbolic top-down camper with its front on the screen's right side, establishing the required phone-forward direction.
- FR-3: The application shall derive current pitch and roll from built-in phone orientation/level data.
- FR-4: The application shall interpret pitch and roll according to the declared phone-forward direction.
- FR-5: The application shall update live measurements and recommendations while measuring is active.
- FR-6: The application shall detect unavailable, invalid, or insufficiently stable sensing data and shall not present it as a valid lift plan.
- FR-7: The measurement flow shall instruct the user to keep the phone stable on a fixed, flat surface in the supported landscape direction, with its physical top at screen right aligned to the vehicle front.

### 5.2 Results and Pause

- FR-8: The camper symbol shall show four fixed wheel positions: front-left, front-right, rear-left, and rear-right, when viewed with the front at the screen's right side.
- FR-9: The application shall show each recommended lift in whole centimetres next to its corresponding wheel position.
- FR-10: The application shall place a Pause control in the centre of the camper symbol while live measurement is active.
- FR-11: When the user pauses, the application shall freeze the measured pitch and roll and all calculated recommendations.
- FR-12: When paused, the central control shall become Resume. Resume shall return to live measurement and live recommendations.
- FR-13: The application shall make it clear whether the displayed result is live or paused.

### 5.3 Vehicle Configuration

- FR-14: The application shall provide a settings area for vehicle configuration.
- FR-15: The settings area shall offer the following provisional Fiat Ducato panel-van presets:

| Display name | Chassis-length mapping | Wheelbase | Body width excluding mirrors |
| --- | --- | ---: | ---: |
| L2 | Approximately 5,413 mm overall length | 3,450 mm | 2,050 mm |
| L3 | Approximately 5,998 mm overall length | 4,035 mm | 2,050 mm |
| L4 | Approximately 6,363 mm overall length | 4,035 mm | 2,050 mm |

- FR-16: The application shall provide a Custom option that lets the user enter wheelbase and body width in millimetres.
- FR-17: Custom wheelbase shall be accepted only from 2,000 mm through 6,000 mm, inclusive. Custom body width shall be accepted only from 1,500 mm through 3,000 mm, inclusive.
- FR-18: The settings area shall identify body width as excluding mirrors.
- FR-19: The application shall retain the last valid vehicle configuration and maximum ramp height locally on the device.

The preset dimensions are provisional. Before release, their values must be verified against an official 2026 Fiat Professional specification for the intended market, then this table must cite that source.

### 5.4 Ramp Plan Modes

- FR-20: The application shall offer Two wheels and Three wheels modes. Two wheels shall be the default.
- FR-21: A recommended lift shall always be zero or positive; the application shall never ask the user to lower a wheel.
- FR-22: In Three wheels mode, the application shall select a practical plan affecting three wheels and target zero residual pitch and roll, subject to rounding and configured limits.
- FR-23: In Two wheels mode, the application shall evaluate eligible pairs and select the plan that best reduces combined residual pitch and roll with non-negative lifts.
- FR-24: In Two wheels mode, the application shall display the residual pitch and residual roll for the selected plan.
- FR-25: The selection order for otherwise valid plans shall be: lowest combined residual level error; then lowest maximum lift; then lowest total lift; then a stable, documented wheel-order tie-break.
- FR-26: The application shall visually distinguish wheels selected for a lift from wheels that remain at zero lift.

Exact simultaneous correction of pitch and roll is not generally possible by raising only two independent wheels of a four-wheel vehicle. This limitation is expected behavior in Two wheels mode, not an error.

### 5.5 Ramp-Height Warnings

- FR-27: The user shall be able to configure a maximum supported ramp height in centimetres.
- FR-28: The application shall show a conspicuous warning when any selected wheel lift exceeds the configured maximum.
- FR-29: A high-lift warning shall leave the values visible but shall state that the user must not use a ramp plan beyond the capabilities of their equipment or vehicle.
- FR-30: When no plan is feasible within calculation constraints, the application shall state that no supported recommendation is available and retain the last paused valid result, if one exists, distinctly from the unavailable result.

## 6. Quality and UX Requirements

- QR-1: The primary readout shall remain legible in bright outdoor use and at common phone accessibility text sizes.
- QR-2: Wheel labels and lift values shall remain associated with the correct wheel in every supported landscape size.
- QR-3: All calculation results shall be deterministic for identical sensor readings, configuration, mode, and rounding rules.
- QR-4: The application shall be accessible over HTTPS without an account and shall work without a network connection after a successful online load that caches its core application resources.
- QR-5: The cached application shall include all required vehicle presets, calculation logic, instructional graphics, and user-interface assets. It shall not require a network request for a subsequent offline launch, measurement, configuration, or calculation.
- QR-6: Sensor failure, invalid configuration, and excessive lift conditions shall be understandable without technical terminology.

## 7. Acceptance Criteria

| Scenario | Expected result |
| --- | --- |
| Vehicle is level | All wheel lifts are 0 cm; pitch and roll are shown as level within the defined sensing tolerance. |
| Pitch-only slope | A plan uses vehicle wheelbase to recommend positive lifts for the lower end, subject to selected mode and rounding. |
| Roll-only slope | A plan uses vehicle body width to recommend positive lifts for the lower side, subject to selected mode and rounding. |
| Combined pitch and roll | Three-wheel mode targets an all-axis level result; Two wheels mode chooses its best pair and shows remaining pitch and roll. |
| User changes mode | The new plan, selected wheels, values, and two-wheel residual status update from the same current reading. |
| User presses Pause | Measured angles, selected wheels, lift values, warnings, and residual display remain unchanged until Resume. |
| Sensor data is unavailable or unstable | No live plan is represented as valid; the user receives clear placement/stability guidance. |
| A lift exceeds configured maximum | The lift remains displayed with a conspicuous maximum-ramp-height warning. |
| Custom dimensions are invalid | The application rejects them and explains the accepted units and bounds. |
| A Fiat preset is selected | Its stored wheelbase and width populate the active vehicle configuration. |
| Device is offline after an initial successful online load | The application launches and supports configuration, live measurement, pause/resume, and lift calculation without a network request. |

## 8. Open Release Gate

The named vehicle-preset dimensions and the width basis used in calculation must be reconciled with the official 2026 Fiat Professional documentation for the intended market before release.