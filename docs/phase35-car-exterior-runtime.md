# Phase 35 — carExterior runtime repair

## Finding

No ESM cycle exists between the Phase 30 clothing catalog and the Canonical V3 pipeline. `phase30-clothing-catalog.js` depends on `data.js`, which continues through the data leaf modules and does not import the pipeline.

The runtime defect was conflicting ownership of the standard `#clothing` element. The legacy refresh path repopulated the standard clothing selector while the Phase 22/33 carExterior path also repopulated the same element. Because both paths run during section activation, carExterior could lose its specialized value before FormData reached Canonical V3.

## Repair

- carExterior now owns a dedicated `select#car-exterior-clothing[name="carExteriorClothing"]` inside `#car-exterior-fields`.
- The standard `select#clothing[name="clothing"]` is hidden and disabled while carExterior is active, so it cannot leak a retained value through FormData.
- The dedicated carExterior selector is hidden and disabled in every other section.
- Location, pose, lighting, and clothing controls are mounted together for carExterior.
- `phase22Input()` still forces `scene:"carExterior"`, preserving the 2017 Range Rover Sport Autobiography Dynamic L494 / Fuji White scene authority.
- `resolveClothingText()` remains defensive for null, unknown, custom, and malformed selection values and always supplies a non-empty fallback.

## Regression coverage

`tests/canonical-v3-car-exterior-runtime-phase35.mjs` checks:

- no Phase 30 → Canonical pipeline import;
- resolver no-throw/fallback behavior;
- dedicated carExterior clothing control and exact-one-active-selector enable/disable contract;
- location / pose / lighting controls remain present;
- `scene:"carExterior"` and carExterior clothing precedence remain wired;
- a real carExterior thobe + red shemagh + iqal smoke prompt is non-empty, includes the 2017 Range Rover spec and Fuji White, excludes sleep clothing, stays at or below 250 words, and is deterministic 10/10.
