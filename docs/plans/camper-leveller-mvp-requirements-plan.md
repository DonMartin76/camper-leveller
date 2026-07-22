# Camper Leveller MVP Requirements Plan

## Purpose

Capture the agreed product decisions before technical design and implementation. This plan is retained as a decision record; `docs/requirements.md` is the source of truth for product behaviour.

## Agreed Decisions

- The product is a standalone mobile application, beginning on iPhone with Android in scope.
- It provides guidance for driving onto physical leveling ramps. It does not control ramps, jacks, or the vehicle.
- The user places the phone on a stable, flat surface in the camper, in the supported landscape hold where the phone's physical top is at screen right and points to the vehicle front.
- The application is fixed to landscape orientation and shows a symbolic camper in the required placement direction.
- Built-in orientation/level sensing produces live pitch and roll measurements. A central Pause/Resume control freezes and resumes both readings and recommendations.
- Recommendations use whole centimetres and appear next to their corresponding wheel locations.
- Vehicle geometry consists of wheelbase and body width. Presets cover Fiat Ducato panel-van configurations `L2`, `L3`, and `L4`, with a Custom configuration for manual dimensions.
- Two-wheel mode is the default. It recommends the two wheels that best reduce the remaining pitch and roll, reports the residual tilt, and cannot generally provide exact two-axis level.
- Three-wheel mode selects a practical three-wheel plan intended to level both axes.
- A configurable maximum ramp height produces a warning for plans that exceed it.
- The installable app contains every asset, vehicle preset, and calculation capability needed for offline use after download.
- The MVP is delivered as a PWA. It is accessed through Safari over HTTPS, can be added to the Home Screen at the user's discretion, and caches its core experience after an initial successful online load. A native app is a later option if Safari's sensing or orientation limitations prove material.
- The selected MVP stack is Vite, React, and TypeScript with plain component-scoped CSS; native browser motion APIs wrapped in an in-repo adapter; a pure TypeScript geometry solver; `localStorage`; `vite-plugin-pwa` and Workbox precaching; Vitest; and Playwright. It has no backend, database, UI framework, or sensor package.

## Planned Deliverables

1. `docs/requirements.md`: product scope, functional requirements, safety limits, configuration rules, and acceptance criteria.
2. `docs/technical-design-notes.md`: implementation implications and explicitly deferred technical choices.

## Verification Approach

Review the requirements against each stated behavior and test the future implementation against the defined scenarios: level ground, pitch-only, roll-only, combined slope, paused readings, invalid or unstable sensing, invalid Custom dimensions, excessive lift, and each vehicle preset.

Before release, verify the preset values against an official 2026 Fiat Professional specification for the intended sales market and replace the provisional note in the requirements with a citation.
