# Phase 37 — MASTER DE-CONFLICT

## Scope
Closes the three CI gaps left after Phase 36: clothing authority drift, exact duplicate sentences, and night-lighting loss under the 250-word budget.

## 1. Clothing authority
`js/clothing-authority.js` is a leaf module with no imports. It owns:

- `FULL_OUTFITS`: the complete colored top+bottom catalog in six sections
- `TRADITIONAL`: `thobe-white`, `thobe-redshemagh-iqal`, `thobe-whiteghutra-iqal`, `thobe-bisht`
- `custom`: `raw.customClothing` is returned verbatim
- deterministic lookup order: FULL_OUTFITS → TRADITIONAL → registered SCENES clothing
- no generated `selected X` fallback and no throws

Phase 30 and Phase 33 remain compatibility facades. The canonical pipeline imports the leaf authority directly and resolves all sections with:

`resolveClothingText(raw.carExteriorClothing || raw.clothing, raw)`

## 2. One clothing select
The live Phase 22 UI now renders one `#clothing` select from the authority catalog for every section. `carExterior` retains location, pose, and lighting controls, but no longer creates a second clothing select.

## 3. Exact-sentence de-duplication
Phase 36 adapter now de-duplicates exact sentences before final budget enforcement, preserving the first occurrence. This removes repeated pose sentences such as `standing beside the front grille` without fuzzy rewriting.

## 4. Protected budget
The final 250-word pass protects:

- capture opening sentence
- identity lock sentence
- 2017 Range Rover Sport Autobiography Dynamic car-spec sentence
- headwear lock sentence
- lighting sentence

Drop order is deterministic: visual preferences → environment details → micro-realism → camera details. If a night prompt arrives without a lighting sentence, the adapter restores a deterministic real-world night-lighting sentence before de-duplication and budgeting.

## 5. Regression coverage
`tests/canonical-v3-master-deconflict-phase37.mjs` verifies:

- full colored carExterior outfit or custom text verbatim
- no `selected white thobe`
- no exact sentence duplicates
- night lighting retained
- first sentence exactly `A candid direct selfie.`
- 2017 Range Rover spec retained
- ≤250 words
- 10/10 determinism
- hard constraints unchanged
- leaf module has zero imports
- one authority-backed clothing list across sections

Legacy Phase 32/33/35 regression tests were updated only where Phase 37 intentionally supersedes their old fallback/duplicate-select assumptions. `.github/workflows/test.yml` runs Phase 37 after Phase 36.
