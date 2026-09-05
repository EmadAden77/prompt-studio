# Phase 38 — English full-outfit prompt texts

Phase 38 keeps all clothing UI labels in Arabic while making the 90 `FULL_OUTFITS` prompt-facing `.text` values English with explicit color words.

## Changes

- Translated every `FULL_OUTFITS` `.text` value to English and preserved every outfit color.
- Kept every `.label` in Arabic for the UI.
- Moved the custom clothing option out of the Home optgroup and made it the first top-level clothing option.
- Preserved the six existing clothing optgroups and the four legacy `TRADITIONAL` options.
- Added a Phase 38 regression test covering all 90 outfits, carExterior routing, the 250-word cap, determinism, and hard-constraint stability.
- Added the Phase 38 test to `.github/workflows/test.yml`.

## Required sample

`casual-tee-black-jeans-blue` resolves to:

> heavy black cotton T-shirt with dark blue jeans

The Phase 38 CI test prints the complete carExterior sample prompt as `PHASE38_SAMPLE_PROMPT`.
