# Phase 39 — Master unification

Phase 39 makes `js/clothing-authority.js` the single clothing catalog authority used by the live UI, then strengthens the active Canonical V3 selfie/identity/lighting locks without mutating canonical hard constraints.

## Clothing authority

- `js/phase22-ui-runtime.js` aliases `CLOTHING_CATALOG` as `UNIFIED_CLOTHING_CATALOG` and `getClothingOptions()` as `getUnifiedClothingOptions()` directly from `clothing-authority.js`.
- The Phase 22 select renderer consumes the authority catalog structure (`id`, `label`, `options`) and renders all six optgroups.
- The top-level custom option is inserted before every optgroup, and the runtime owns creation/visibility of the `customClothing` input.
- `js/phase30-clothing-catalog.js` remains deleted.
- `js/car-exterior-clothing-phase33.js` remains a compatibility wrapper over the same authority catalog.
- All studio sections use the same 90+ clothing options.

## Active adapter locks

The live pipeline imports `openai-image-adapter-phase36.js`, which wraps `openai-image-adapter.js`. The master pass is therefore enforced in that active final adapter layer so earlier Phase 25–38 behavior remains intact.

- `SELFIE_ARM_LOCK` is applied to every capture type whose canonical type contains `selfie`, including direct, driver, group and mirror selfies.
- A final pose guard replaces selfie pose text that asks for both hands in pockets, crossed arms, or both hands occupied with a one-hand-relaxed instruction. The negative wording inside `SELFIE_ARM_LOCK` itself is intentionally preserved.
- Every final prompt receives the strict identity sentence covering facial structure, feature spacing, jaw width, nose shape, eye size, lip shape, ear shape, skin tone, hairline, beard pattern and natural asymmetry.
- Night captures normalize their protected lighting sentence to `Lighting follows the selected real-world night source.`.
- The budget protector treats the strict identity lock, selfie arm lock, clothing sentence, headwear lock, 2017 Range Rover specification and the `Lighting follows the selected real-world` prefix as non-droppable.

## Regression coverage

`tests/canonical-v3-master-phase39.mjs` verifies:

1. solo, group, car, carExterior, bedroom, gym, street, accidental and custom sections expose 90+ clothing options;
2. the Phase 33 carExterior wrapper still exposes the authority catalog;
3. every intentional selfie contains `SELFIE_ARM_LOCK`;
4. impossible two-hand/crossed-arm pose text cannot survive outside the required negative lock sentence;
5. every tested night capture contains the protected `Lighting follows the selected real-world` sentence;
6. every prompt contains the strict identity lock;
7. carExterior retains `2017 Range Rover Sport Autobiography Dynamic` and `Fuji White`;
8. every tested prompt remains at or below 250 words, deterministic 10/10, and adapter generation does not mutate canonical hard constraints;
9. three logged samples cover bedroom/night pajamas, gym/sports outfit, and street thobe+shemagh.

The historical Phase 39 UI regression remains in CI, and the master regression is added immediately after it.
