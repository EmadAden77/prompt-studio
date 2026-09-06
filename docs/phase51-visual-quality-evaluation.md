# Phase 51 — Visual Quality Evaluation Engine

Phase 51 extends the live Phase 50 user-selection authority pipeline without changing the final image prompt. It produces a deterministic visual-quality contract that can be applied to a generated image once visual observations are available.

## Purpose

The evaluator checks image quality and adherence rather than AI-detector evasion. It verifies the rendered result against the same canonical/user-authority state that produced the prompt.

## Core checks

- reference identity preservation
- physically plausible selfie geometry
- 195 cm / 88 kg body scale
- selected clothing
- selected expression
- selected pose
- selected location
- selected time of day
- night-source physics when time is night
- Range Rover identity/geometry for car sections
- section-aware background behavior
- hand, limb, contact, and occlusion integrity

## Section-aware background rules

- `carExterior`: background people/vehicles remain secondary and context-appropriate
- `gym`: background people continue independent activity and do not pose for the selfie
- `bedroom` / `mirror`: private-room continuity, with no unrelated people or vehicles
- other sections: background life remains plausible and secondary

## Evaluation states

Each criterion is `pass`, `fail`, or `unknown`. Missing observations keep the evaluation in `pending`; a failed required criterion yields `fail`. Failed criteria return focused repair hints for a later repair/regeneration workflow.

## Prompt invariance

Phase 51 does not append QA wording to the image prompt. `canonical-v3-phase51.js` returns the exact Phase 50 prompt and adds only `phase51.visualQualityContract` metadata. Existing word budgets and Phase 50 user-authority guarantees therefore remain unchanged.

## Safety and scope

The evaluator is explicitly for visual adherence and physical plausibility. It does not score, benchmark, or optimize images for evasion of AI-image detectors.

## Tests

`tests/canonical-v3-visual-quality-phase51.mjs` verifies prompt invariance, dynamic criteria for carExterior/gym/bedroom/day, pass/fail/pending scoring, focused repair hints, word-budget preservation, and 10/10 deterministic contracts.
