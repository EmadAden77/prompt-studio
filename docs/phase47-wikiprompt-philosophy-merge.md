# Phase 47 — WikiPrompt philosophy merge

Phase 47 adopts action-based scene language, contextual consistency, positive authentic imperfections, and correct mirror-selfie geometry while preserving Canonical V3 authority, identity locking, deterministic selfie optics, and word budgets.

## Architecture

- Every registered section now exposes `actionDescription`, `imperfections`, and `rules.contextualRules` through the frozen section registry.
- `mirror` is a selfie specialization, not a new intent. It uses `mirror_selfie`, correct reflection geometry, and forward-legible clothing text rules.
- `canonical-v3-phase47.js` wraps Phase 46 rather than duplicating the Canonical pipeline.
- Contextual consistency is lower authority than explicit user input. Gym formalwear is detected and recorded but preserved when explicitly selected; only missing/default gym clothing is auto-resolved.
- Action and imperfection semantic sentences are protected by the Phase 47 budget pass. carExterior remains <=280 words; other sections remain <=250 words.

## Protected foundations

Identity Lock, 195 cm / 88 kg body authority, front-camera/selfie optics, Range Rover hard constraints, and determinism 10/10 remain protected.

## Mirror rule

`mirror_rules: text on clothing reads forward and legible to the viewer; reflections follow correct geometry; the camera is pointed at the mirror and the subject is represented through the reflection.`

## CI

`tests/canonical-v3-wikiprompt-phase47.mjs` verifies section profiles, action language, positive imperfections, mirror geometry, authority-safe contextual resolution, body/identity protection, budgets, and determinism. The test is registered in `.github/workflows/test.yml`.

## Samples

### carExterior night
He naturally leans one side of his upper body against the closed driver door while extending one arm toward the camera to hold the phone; his other arm remains relaxed and naturally positioned. Fine skin pores, faint tonal variation, realistic beard detail, natural hair flyaways, and shirt wrinkles from leaning remain visible without waxy smoothing.

### mirror selfie
He holds the phone toward the mirror and looks at the reflected framing while his free arm stays naturally relaxed beside his body. mirror_rules: text on clothing reads forward and legible to the viewer; reflections follow correct geometry; the camera is pointed at the mirror and the subject is represented through the reflection.

### gym + formal outfit
An explicitly selected formal outfit is preserved and the resolver records `preserve_explicit_user`; an absent/default outfit is resolved to a plain breathable athletic T-shirt with training pants.
