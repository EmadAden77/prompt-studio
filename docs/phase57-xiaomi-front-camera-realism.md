# Phase 57 — Xiaomi 15 Ultra front-camera realism contract

## Scope

Phase 57 adds one deterministic, reusable front-camera contract to Canonical V3. It is intentionally a **realism constraint**, not an image-quality enhancer.

## Applied changes

- New module: `js/canonical/xiaomi15-ultra-front-camera-phase57.js`.
- Camera profile: Xiaomi 15 Ultra front camera; 21 mm-equivalent view, about 90° field of view, f/2.0, 32 MP, 1/3.6-inch-class sensor.
- The Canonical output always exposes the camera contract in metadata. Set `xiaomiFrontCameraProfile: true` to add the compact camera clause to direct-selfie prompt text without changing legacy defaults.
- Daylight: restrained HDR, directional shadows preserved, no flattened face.
- Mixed lighting: local warm/cool casts remain local; no global shadow lifting.
- Night: mild luminance/chroma noise, modest dark-color desaturation, source-matched white balance and limited denoising.
- No synthetic portrait blur is permitted; depth behavior remains consistent with a wide smartphone front camera.
- Car prompts preserve their 280-word hard limit and receive the same camera contract in Phase 56 metadata, without destabilizing the LHD/cabin locks.
- New regression test: `tests/canonical-v3-xiaomi-front-camera-phase57.mjs`.

## Before / after

| Area | Before | After |
| --- | --- | --- |
| Device behavior | 21 mm geometry existed, but no reusable image-processing profile | Centralized Xiaomi front-camera profile and deterministic mode resolver |
| Daylight | General lighting physics | Preserved highlight roll-off and directional contrast in phone rendering |
| Night | General ISO/noise rules | Adds bounded denoising, chroma/luminance noise and no daytime-like lifting |
| Mixed light | General source rules | Keeps separate local casts and visible exposure compromise |
| Depth | Could be interpreted as portrait optics | Explicitly rejects artificial portrait blur |
| Car interiors | Strong cabin locks but no explicit device contract | Phase 56 metadata exposes the Xiaomi contract without breaching the prompt budget |

## WikiPrompt alignment

The implementation follows the linked WikiPrompt methodology: action and context remain primary; imperfections are subtle and physically caused; the camera language stays plain; mirror rules remain section-specific; and no camera detail overrides identity, selected scene, or capture physics.
