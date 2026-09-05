# Phase 34 — Clothing routing authority

## Bug fixed

A carExterior selection could be lost before Canonical V3 and the prompt could inherit a hidden/default sleep outfit. Phase 34 introduces one clothing text resolver and routes explicit carExterior selections through it before Canonical construction.

## Authority

`js/phase30-clothing-catalog.js` now exports:

- `TRADITIONAL_CAR_OPTIONS`
- `resolveClothingText(value, raw)`
- neutral unknown/custom-empty fallback: `casual cotton clothing`

Resolution order:

1. Phase 32 unified full-outfit catalog.
2. Phase 33 Saudi traditional car options.
3. existing scene clothing values.
4. neutral fallback.

## carExterior routing

`js/canonical/canonical-v3-pipeline.js` resolves carExterior clothing from:

`raw.carExteriorClothing || raw.clothing`

Other sections resolve from `raw.clothing`.

An explicit selection is therefore resolved before Canonical V3 construction and cannot fall back to a hidden sleep-set default.

## Headwear

The resolved garment text is stored in `canonical.subjects.primary.clothing.garment`. The existing Phase 25 `describeHeadwear()` reads this resolved garment text, so `thobe-redshemagh-iqal` emits the existing `HEADWEAR_LOCK` sentence with the red-and-white fine checkered shemagh and black doubled-cord iqal.

## Regression gate

`tests/canonical-v3-clothing-routing-phase34.mjs` verifies:

- carExterior + `thobe-redshemagh-iqal` reaches the prompt as white thobe + HEADWEAR_LOCK and never emits `sleep`.
- carExterior + a Phase 32 full colored outfit preserves top + bottom + color.
- custom clothing text reaches Canonical and prompt verbatim.
- Phase 34 sample prompts stay at or below 250 words.
- determinism is 10/10.
- hard constraints remain unchanged.
