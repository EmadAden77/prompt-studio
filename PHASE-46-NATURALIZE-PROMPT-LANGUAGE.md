# Phase 46 — Naturalize Prompt Language

Phase 46 removes nine prompt-language regressions that can make otherwise realistic image instructions sound synthetic, contradictory, or like internal engine diagnostics.

## Nine targeted fixes

| # | Regression | Phase 46 behavior |
|---|---|---|
| 1 | Clothing mechanics stack contradictory fabric, fit, wear and iron terms | Final output uses one coherent outfit sentence, one fabric note, and natural standing folds. |
| 2 | Height phrased as a proof demand | carExterior uses a positive proportional-height sentence relative to the door and roofline. |
| 3 | Framing leaks internal `manual ... composition` language | Final framing is described as naturally imperfect one-handed photography. |
| 4 | carExterior pose repeats in compact and location sentences | The redundant compact door-lean sentence is removed. |
| 5 | Angles read like engine telemetry (`0° above eye level`) | Final text uses natural photographic language: close to, slightly above, or slightly below eye level. |
| 6 | Exterior vehicle spec lists details not visible from side/door poses | door-lean/door-open/front-fender/side-view omit quad exhaust details while retaining the visible Range Rover identity cues. |
| 7 | Skin realism depends on negative-only guards | Every Phase 46 selfie prompt includes fine pores, tonal variation, beard detail, and a restrained anti-waxy cue. |
| 8 | Glass realism uses negative `never opaque black` wording | Final car prompts describe transparent glass positively through natural reflections and a faint Ivory-cabin view where lighting allows. |
| 9 | Night lighting is abstract | Villa, parking and street night prompts state concrete dominant/secondary practical light sources. |

## Architecture

`canonical-v3-phase46.js` is a deterministic final-language projection on top of the frozen Phase 45 geometry output. This preserves the Phase 45 rule engine and historical regression contracts while ensuring the live Canonical V3 output is human photographic language rather than internal diagnostics.

`canonical-v3-pipeline.js` exposes the Phase 46 natural height sentence and single-fabric-note resolver. `openai-image-adapter-phase36.js` exposes the positive skin/glass language and scene-aware night-light authority. The live `engine-gate.js` routes Canonical V3 output through Phase 46.

## Regression contract

`tests/canonical-v3-natural-prompt-language-phase46.mjs` checks:

- no pressed/unpressed contradiction;
- no two distinct fabric names in the final clothing sentence;
- no `Vehicle scale confirms` wording;
- no `manual ... composition` internal tag;
- no numeric `camera about N° above eye level` text;
- no quad-exhaust detail for carExterior door-lean;
- positive skin detail in every tested prompt;
- positive glass wording in car prompts and no `never opaque black` / `not a black panel` wording;
- concrete villa, parking, and street night sources;
- identity, selfie-arm, shemagh/iqal and naturalized optics protection;
- maximum 280 words for carExterior and 250 for other sections;
- 10/10 deterministic output for every Phase 46 regression case.

CI runs the Phase 46 suite after the existing Phase 45 smart selfie geometry suite so the old frozen contracts remain independently verified.
