# Phase 45 — Smart Auto Selfie Geometry

## Goal

Every selfie-capable section exposes two user controls: `selfieAngle` and `selfiePose`. Both default to `auto`, while manual selections remain explicit and deterministic.

## Architecture

- `js/canonical/selfie-geometry-authority.js` is the deterministic geometry authority.
- It reads allowed angle and pose declarations from `SECTION_REGISTRY` and does not import section-specific modules or car authority modules.
- Each section owns `rules.selfieGeometry.angles` and `rules.selfieGeometry.poses`.
- `js/canonical/canonical-v3-phase45.js` resolves the selected geometry, routes the chosen pose into the existing Canonical V3 path, and protects the concrete optics/framing sentences under the 250-word output budget.
- `js/phase45-selfie-geometry-ui.js` reuses the existing `selfieAngle` select, mounts `selfiePose`, defaults both to `تلقائي (ذكي)`, and hides legacy pose controls in the live UI.

## Deterministic auto matrix

| Context | Angle | Degrees | Pose | Framing |
| --- | --- | ---: | --- | --- |
| carExterior · night · villa | high | +8° | door-lean | front quarter, DRL visible, slightly awkward car crop |
| carExterior · day · parking | eye | 0° | front-grille | hood edge enters lower frame |
| carExterior · traditional | constrained | deterministic | thobe-safe only | hood-sit forbidden |
| street · night | high | +10° | walking | streetlights behind |
| street · day · alley/bufia | eye | 0° | standing-relaxed | ordinary alley/bufia context |
| gym · night | high | +12° | seated-rest-elbows | elbows on knees |
| bedroom · night | high | +15° | seated-bed | bedside context |
| group | high | +10° | staggered | wide, phone holder centered |
| accidental | low | -12° | low-off-axis | imperfect off-axis crop |

## Prompt locks

Phase 45 inserts two protected prompt sentences:

- `Selfie optics lock: camera about {angleDegrees}° above eye level.`
- `Selfie framing: {resolved framing}.`

Identity, selfie arm, 195/88 anatomy evidence, headwear/shemagh, selected clothing, vehicle specification, scene/pose evidence, and lighting remain protected. The final Phase 45 wrapper keeps output at or below 250 words.

## Regression coverage

`tests/canonical-v3-auto-selfie-geometry-phase45.mjs` verifies:

- every auto rule row,
- manual override behavior,
- 10/10 deterministic geometry and prompts,
- traditional clothing never resolving to `hood-sit`,
- concrete optics and framing text in prompts,
- frozen geometry output,
- section-owned allowed angle/pose declarations,
- leaf authority isolation,
- smart-auto UI labels and fields,
- identity, selfie, shemagh/iqal, lighting, and 250-word budget protection.

CI command: `node tests/canonical-v3-auto-selfie-geometry-phase45.mjs`.
