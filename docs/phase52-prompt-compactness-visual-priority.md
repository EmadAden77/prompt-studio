# Phase 52 — Prompt Compactness & Visual Priority Engine

Phase 52 is the current production prompt-output layer for Canonical V3.

## Goal

Make the final ChatGPT Images prompt easier to follow without weakening user authority or physical consistency.

## Pipeline

`Phase 50 selection authority → Phase 51 visual QA contract → Phase 52 compactness + visual priority → final prompt`

Phase 51 remains read-only with respect to the prompt. Phase 52 preserves its QA contract while compiling the final image prompt.

## Visual priority order

1. Capture contract and identity lock.
2. Body plus explicit user selections: clothing, expression, pose, location, time.
3. Vehicle/cabin facts when applicable.
4. Camera and lighting physics, including protected night physics.
5. Secondary realism and environmental detail.

## Compaction rules

- Exact Phase 50 selection-manifest sentences are P0 and may never be removed.
- Identity, selfie-arm contract, 195 cm / 88 kg body authority, required vehicle identity and traditional headwear are protected.
- Night source, ISO behavior, flash/exposure behavior and core camera/vehicle geometry remain protected physical rules.
- Duplicate sentences are removed deterministically.
- Low-value optional detail is trimmed first.
- Secondary realism may be trimmed only to approach the soft target.
- Hard budgets remain unchanged: `<=280` words for `carExterior`, `<=250` for every other section.
- The engine fails instead of silently dropping a protected selection.

## Soft targets

- `carExterior`: 245 words when optional detail can be removed safely.
- all other sections: 225 words when optional detail can be removed safely.

Soft targets are not allowed to override protected content. Hard budgets remain the actual contract.

## Determinism

The same resolved input produces the same Phase 52 prompt. CI requires 10/10 identical outputs for the regression case.

## Scope

This phase optimizes prompt clarity and visual instruction priority for ChatGPT Images. It does not add SDXL/FLUX controls, detector-evasion logic, or external post-processing.
