# Phase 40 — carExterior Deep Audit

## Scope

Deep audit of the **سيلفي بجانب السيارة / carExterior** path only. The goal is a coherent subject-held smartphone selfie beside the fixed 2017 Range Rover Sport Autobiography Dynamic L494 without conflicting UI authorities, stale hidden values, impossible hand use, dropped selected lighting, or reference-identity drift.

## Proven gaps found

1. **Canonical V3 was not guaranteed for carExterior.** The default engine remained legacy, while the strict selfie arm lock, final identity lock, de-conflict budget and protected lighting live in Canonical V3.
2. **Two lighting authorities were visible.** carExterior had a dedicated lighting select while the generic lighting select remained visible.
3. **Custom-scene and legacy realism/context controls could appear active although the hardened carExterior pipeline did not consume them as authorities.**
4. **A stale legacy `carExteriorClothing` value could override the visible unified `clothing` selection.**
5. **Night lighting choices could contradict location or pose.** Villa porch lighting could be selected away from a villa; interior light spill could be selected without an open driver door.
6. **`key-fob` consumed the only free hand in a strict subject-held selfie.**
7. **Selected carExterior lighting could collapse to a generic final sentence.** Different visible lighting choices could therefore become indistinguishable in the final prompt.
8. **Selected location/pose text was not protected from the final 250-word budget.** A visible choice could disappear under a dense prompt.
9. **Hair/skin styling controls competed conceptually with a reference-identity-first carExterior path even though Canonical V3 did not use them as final identity authorities.**

## Repairs

### Dedicated carExterior authority

Added `js/car-exterior-authority.js`:

- validates all 6 locations;
- exposes only selfie-safe poses;
- removes `key-fob` from the hardened selfie catalog;
- filters lighting by time, location and pose;
- allows `villa-porch` only at `villa`;
- allows `interior-spill` only for `door-open`;
- deterministically falls back from stale/invalid combinations.

### UI authority cleanup

`js/phase22-ui-runtime.js` now:

- builds carExterior location/pose/lighting from the dedicated authority;
- refreshes lighting when time, location or pose changes;
- hides and disables the generic lighting control in carExterior;
- hides/disables legacy custom-scene, manual Realism Core, Advanced Realism, post-processing and generic context controls while carExterior is active;
- keeps the automatic Canonical realism layers active in the adapter;
- hides/disables hair and skin styling controls in carExterior so the reference identity remains authoritative;
- keeps expression, clothing, fabric, fabric weight, iron state, wear state and fit active;
- preserves the single unified clothing select and custom clothing field.

Hidden controls are disabled, so `FormData` cannot leak stale values into the Canonical resolver.

### Engine routing

`js/canonical/engine-feature-flag.js` now forces carExterior through Canonical V3 even when the global/default engine selection is legacy.

### Pipeline de-conflict

`js/canonical/canonical-v3-pipeline.js` now:

- validates carExterior time/location/pose/lighting through the dedicated authority before conflict resolution;
- makes visible `clothing` authoritative;
- retains `carExteriorClothing` only as a historical fallback when `clothing` is absent;
- writes the resolved location, pose and lighting IDs into canonical scene facts;
- uses the resolved location/pose/lighting English text in the final Canonical path.

### Final prompt hardening

`js/canonical/openai-image-adapter-phase36.js` now:

- retains the required one-arm subject-held selfie lock;
- strengthens identity preservation to explicitly freeze facial/head shape, facial proportions, feature spacing, eyes, brows, nose, lips, jaw/chin, ears, skin tone, hairline, beard/moustache pattern, reference eyewear, apparent age and natural asymmetry;
- explicitly forbids beautification, face slimming/lengthening, symmetry correction and de-aging;
- protects the selected carExterior scene description so location and pose survive the 250-word budget;
- protects the selected lighting text itself instead of collapsing every choice to a generic lighting sentence;
- retains exact-sentence deduplication and hard-constraint immutability.

## Realism policy

The hardened prompt keeps a physically plausible front-camera selfie, one coherent capture event, natural smartphone perspective, real contact/weight, transparent glass/reflections, ordinary surface variation and practical real-world lighting. It avoids studio-light wording and synthetic presentation cues. This is a realism target, not a claim that any external AI detector can be guaranteed to classify an image in a particular way.

## Regression coverage

`tests/canonical-v3-car-exterior-deep-audit-phase40.mjs` checks:

- carExterior always uses Canonical V3;
- all six locations;
- every allowed pose;
- all compatible day/night lighting combinations;
- impossible lighting combinations are filtered;
- `key-fob` is excluded from the strict selfie pose catalog;
- visible clothing beats stale legacy clothing;
- legacy clothing fallback still works when the unified value is absent;
- reference identity preservation fields remain present;
- strict identity sentence and selfie arm lock survive every matrix case;
- no impossible two-hand pose leaks outside the negative lock;
- selected location, pose, lighting and clothing all reach the final prompt;
- Range Rover 2017 / Fuji White remain present;
- no ring-light/softbox/studio-light artifact leaks;
- no exact duplicate sentences;
- every prompt remains at or below 250 words;
- representative output is deterministic 10/10;
- changing a valid location, pose or lighting changes the final prompt;
- custom clothing and thobe+shemagh+iqal remain supported;
- adapter does not mutate hard constraints.

The test is wired into `.github/workflows/test.yml` after the Phase 39 master pass.
