# Phase 39 — Unified UI clothing authority

Phase 39 removes the remaining UI dependency on the retired Phase 30 clothing facade and makes `js/clothing-authority.js` the single catalog authority used by the live clothing select.

## Implementation

- `js/phase22-ui-runtime.js` now aliases `CLOTHING_CATALOG` as `UNIFIED_CLOTHING_CATALOG` and `getClothingOptions()` as `getUnifiedClothingOptions()` directly from `clothing-authority.js`.
- The Phase 22 select renderer consumes the authority catalog structure (`id`, `label`, `options`) and renders all six optgroups.
- The top-level custom option is inserted before every optgroup, and the Phase 22 runtime now owns creation/visibility of the `customClothing` input.
- `js/phase30-clothing-catalog.js` is deleted.
- The canonical pipeline no longer imports the Phase 30 facade for side effects.
- `js/car-exterior-clothing-phase33.js` remains unchanged as a compatibility wrapper over the authority catalog.

## Regression coverage

`tests/canonical-v3-ui-clothing-authority-phase39.mjs` verifies:

- bedroom, gym, street, and carExterior receive the same populated 90+ option authority catalog;
- custom is the first option and selecting it enables the custom input contract;
- an authority outfit resolves to English prompt text and reaches the final carExterior prompt;
- prompt length stays at or below 250 words;
- output is deterministic 10/10;
- hard constraints are unchanged;
- no live UI or canonical pipeline import remains for `phase30-clothing-catalog.js`.

The historical Phase 30 regression now reads directly from `clothing-authority.js` so the old phase remains covered without preserving a parallel catalog module.
