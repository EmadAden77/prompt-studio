# Phase 33 — Wide carExterior clothing with thobe and shemagh

## Scope

- carExterior uses one clothing select only.
- The carExterior clothing source is grouped as: تقليدي سعودي / كاجوال / رسمي / رياضي / خارجي / مخصص.
- Saudi traditional options include:
  - `thobe-redshemagh-iqal`
  - `thobe-whiteghutra-iqal`
  - `thobe-bisht`
  - `thobe-white`
- Casual, formal, sport, and outdoor groups reuse the full colored-outfit options from the Phase 32 unified catalog.
- `custom` remains available and routes through `raw.customClothing`.

## Phase 25 compatibility

`thobe-redshemagh-iqal` uses clothing text containing a red-and-white checkered shemagh and black iqal. The existing Phase 25 adapter detector therefore emits the same `HEADWEAR_LOCK`; no parallel headwear logic was added.

## Regression gates

`tests/canonical-v3-car-exterior-clothing-phase33.mjs` verifies:

- >=20 carExterior clothing options.
- required traditional thobe options plus custom.
- exact Phase 25 headwear lock emission for red shemagh + iqal.
- complete colored outfit routing.
- custom outfit routing.
- <=250 words.
- 10/10 determinism.
- unchanged hard constraints.
- exactly one `#clothing` select.
