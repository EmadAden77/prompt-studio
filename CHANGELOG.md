# Changelog

## v3.1-auto-light — 2026-08-28

### Changed

- Removed the visible manual lighting selector from section 02; the home workspace now exposes only clothing and companions as manual choices.
- Added deterministic automatic lighting selection to `js/engines/autoEngine.js` with strict scene-source eligibility through `lightingAllowed()`, physical-context scoring through `lightingCoherence()`, ranked candidates, and deterministic `altLighting()` alternatives.
- Automatic lighting rejects presets whose `required_features` are absent from the active room reference, preventing cases such as selecting `ceiling_spots` for `sofa_area` when that reference does not contain ceiling spots.
- Added an automatic lighting badge with a 🎲 deterministic alternative control. Lighting is resolved before pose/hair/expression and is written back to the normal `lightingId`, so `generateV2()` and all lighting realism locks continue unchanged.
- Night templates keep their explicitly synchronized lighting preset when that source is physically supported by the reference; otherwise the automatic engine falls back to the highest-ranked compatible source.
- Added `tests/v3.1-auto-light.mjs` and CI coverage while preserving all prior regression tests.

### Preserved

- `car.html`, scene assets and metadata, realism locks, prompt ordering, validators, companion behavior and footer ethics text remain unchanged.
- Legacy v2.9/v3.0 hidden compatibility controls remain available to existing runtimes/tests, but lighting is no longer user-facing on the home page.

## v3.0-auto — 2026-08-28

### Added

- Upgraded `js/engines/autoEngine.js` from heuristic branching to a strict two-stage decision: reference eligibility first (`poseAllowed`), then deterministic physical-context scoring (`coherence`).
- Night detection now includes the full v3 night set, including `lamp_only` and `lamp_and_phone`.
- Section 02 remains exactly three visible manual choices: الملابس / الإضاءة / المرافقون, with the new heading `3 اختيارات فقط — والباقي هندسة تلقائية واقعية`.
- Automatic pose selection now ranks only poses supported by the active scene and its visible features. Night solo favors lying/semi-reclining, daytime solo favors standing/bed-edge sitting, groups favor sofa/standing, and a single child favors seated support.
- Added deterministic `altPose()` for the pose 🎲 control. Hair and expression alternatives keep their separate session offsets, so repeated state is stable until the user explicitly asks for another alternative.
- `js/autoRuntime.js` now exposes `App.prototype.runAuto()` and invokes it before the existing `engineer()` pipeline, so generated prompts receive the resolved pose/hair/expression exactly like manual selections and retain all existing grounding, bedding, camera, muscle-expression and imperfection locks.
- If a template-suggested or shuffled pose fails the active reference gate, v3 automatically moves to the highest-ranked valid pose and displays an Arabic correction toast/status explaining that the reference did not support the rejected pose.
- Added `tests/v3.0-auto.mjs` and CI coverage without deleting prior regression files. Legacy v2.9 API behavior remains supported for existing tests and integrations.

### Preserved

- The personal build already removed SMART QUAD GUIDE in v2.0-personal, so v3 does not reintroduce a marketing/help modal merely to rename it. The three-step workflow is represented directly by the three visible controls.
- `car.html`, all `scenes/` files, the footer ethics line, existing realism locks, companion personas/poses, and all previous tests remain in place.

## v2.9-auto — 2026-08-28

### Added

- Added `js/engines/autoEngine.js` with deterministic `isNight`, `autoPose`, `autoHair`, and `autoExpression` decisions based on the selected scene, lighting and companion set.
- Rebuilt section 02 around exactly three visible manual choices: clothing, lighting and companions. Pose, hair, expression, clutter and aspect compatibility controls remain hidden implementation state rather than user-facing selectors.
- Added three transparent automatic-choice badges for pose, hair and expression, each with a deterministic 🎲 next-alternative control backed by session-persistent offsets.
- Added `js/autoRuntime.js` to resolve the automatic IDs into the existing pose/hair/expression data objects before normal prompt generation, so all existing bedding/grounding, camera, expression-muscle, hair, clothing, lighting, companion and realism locks continue unchanged.
- Automatic pose selection preserves active bedroom/night/sofa template intent and otherwise derives a pose from companion count, scene features and night/day lighting.
- In reference-first or explicit-reference mode, an unsupported automatic pose is replaced by the nearest supported pose before validation, with an Arabic toast/status explanation.
- Added responsive styling in `css/autoV29.css` for the three-choice layout, auto badges and correction toasts.
- Added `tests/v2.9-auto.mjs` and CI coverage for the three-choice interface, load order, deterministic rules, badge shuffles and strict-reference fallback wiring.

### Preserved

- The full Validator remains active after automatic resolution; the generated prompt receives the resolved values exactly as if they had been selected manually.
- `car.html`, car template data, scene files, room authority, sofa/night/bed template data, companions, clutter physics and the footer ethics line remain unchanged except for the explicitly authorized home-interface automation.

## v2.8-sofa — 2026-08-28

### Added

- Added `js/data/sofaTemplatesData.js` with six sofa-template categories and 13 physically grounded sofa selfie templates.
- Added `أريكة 🛋️` as a third template-library mode beside the existing daytime and night bedroom modes; sofa mode swaps the category chips/cards to the six sofa families without changing the seven manual choices.
- Added `SOFA GROUNDING LOCK` for 3–5 cm seat-cushion compression, hip-side bulge, backrest/armrest deformation, foot or raised-leg contact shadows, non-pristine throw pillows, gravity-driven throws, clothing tension and seated eye-height perspective.
- Sofa template selection sets `pose = sitting_sofa`; lighting is only suggested when no lighting choice already exists, so manual lighting remains authoritative.
- `PromptEngine.generateV2()` injects `SOFA TEMPLATE` after `POSE & PHYSICS`, followed by `SOFA GROUNDING LOCK` and the existing `GROUNDING.sitting`; the existing camera emulator, single pipeline and imperfection manifest remain active for every sofa prompt.
- Added a strict sofa-reference gate: if an active sofa template uses a scene whose `visible_features` does not contain `sofa`, validation blocks with `المرجع لا يحتوي أريكة` and proposes compatible sofa references or a non-sofa pose.
- Added `tests/v2.8-sofa.mjs` and CI coverage for catalog size, sofa-lock content, prompt order, mode UI, sitting-sofa synchronization and strict reference validation.

### Preserved

- `car.html`, car template data, scene files, companion behavior, clutter behavior, night/day data and all previously frozen controls remain unchanged.
- Sofa templates change pose/camera/support instructions only; room furniture authority remains with IMAGE B and ROOM LOCK.

## v2.7 — 2026-08-28

### Added

- Added `js/data/companionPosesData.js` with deterministic woman/child micro-poses, four irregular group arrangements, `SPONTANEITY LOCK`, seeded assignment, pose-safety resolution and prompt-section generation.
- Companion groups now inject `COMPANION SPONTANEOUS POSES` immediately after the v2.6 `COMPANIONS` section. Empty companion selection injects no spontaneity block.
- Added 🎲 `عفوية مختلفة` beside the companion selector. The same set and seed produce the same spontaneous assignment; pressing the button increments `companionSeedExtra` and deterministically produces a different assignment.
- Added automatic safety fallbacks for incompatible or persona-specific micro-poses, including tight-lying camera reach, child-only/adult-required contact, C7-only missing-tooth grin, and toddler-specific sleepy behavior.
- Added the Arabic compatibility summary under the companion selector. When a micro-pose is replaced, it reports `استبدال آمن` with the original pose, replacement and physical reason.
- Expanded the final negative constraints against evenly spaced group lineups, identical companion smiles and every person staring perfectly at the lens.
- Added `tests/v2.7-companion-poses.mjs` and CI coverage for deterministic seeding, shuffle variation, empty-set behavior, prompt order, spontaneity-lock injection and safe fallback wiring.

### Preserved

- `car.html`, car template data, scene files, room/clutter/day-night behavior, fixed companion personas, modest-family constraints and all previously frozen controls remain unchanged.
- Companion spontaneity changes timing, gaze, micro-motion and contact behavior only; it never changes IMAGE A identity authority or the fixed face/persona specifications from v2.6.

## v2.6-companions — 2026-08-28

### Added

- Added `js/data/companionsData.js` with six fixed, visually distinct companion personas and 12 selectable companion sets, including women, children and family groups.
- Expanded section 02 from six to seven choices with `7. المرافقون`; the default remains `بدون مرافقين`, with optgroups for نساء / أطفال / مجموعات.
- Added `COMPANION & GROUP SELFIE REALISM LOCK` for one reachable phone capture, natural overlap/occlusion, varied gaze, distinct faces and clothing, shared lighting, height/age logic, real body contact and one phone-processing pipeline.
- `PromptEngine.generateV2()` now injects the companion section immediately after the main `CLOTHING LOCK` and before lighting, while IMAGE A remains authority for the main subject only.
- Companion attire collision handling now works on copied persona data rather than mutating the fixed persona catalog; colliding companion colors are swapped to an alternate olive outfit while facial identity remains fixed.
- Added explicit modest-family rules: all companions are fully clothed, children use age-appropriate full clothing, and family framing remains respectful and non-sexual.
- Added a validator warning `المجموعة أوسع من مدى الذراع` for companion sets above four people, with guidance to loosen crop only within a physically reachable selfie field of view or reduce the group size.
- Added `tests/v2.6-companions.mjs` and CI coverage for persona markers, color-collision handling, prompt order, group-lock injection, UI groups and arm-reach validation wording.

### Preserved

- `car.html`, `js/data/carTemplatesData.js`, scene files, `scenes/README.md`, room geometry, clutter behavior, day/night template behavior and all previously frozen controls remain unchanged except for the explicitly authorized seventh choice.
- Existing persona markers remain distinct: W40 mole/age lines, W42 rectangular glasses/deeper laugh lines, C7 missing front tooth, and C2 large forehead/short neck/baby cheeks.

## v2.5-clutter — 2026-08-28

### Added

- Added `js/data/clutterData.js` with four clutter-density levels and 14 movable-prop presets; default selection is `just_woke`.
- Expanded section 02 from five to six choices with `6. الفوضى`, grouped as مرتبة / خفيفة / متوسطة / كثيفة.
- Added `CLUTTER REALISM LOCK` to enforce gravity, contact shadows, natural overlap/occlusion, coherent density, unreadable generic labels, non-repeating repeated items, lighting consistency, and one shared phone-processing pipeline.
- `PromptEngine.generateV2()` injects the user-selected clutter immediately after `ROOM LOCK` and before `POSE & PHYSICS`; fixed furniture remains under ROOM LOCK authority and never moves.
- Added a clutter/support validator warning, `الفوضى تلامس سطح الارتكاز`, for clear bed/floor/chair support conflicts, with a suggestion to move only the movable props away from the body's contact zone.
- Day/night bedroom templates now surface a non-binding clutter-density suggestion; selecting a template does not overwrite the user's clutter choice.
- Added `tests/v2.5-clutter.mjs` and CI coverage for data levels, default choice, prompt order, lock content, UI wiring, validator warning text, and non-forcing template suggestions.

### Preserved

- `car.html`, `js/data/carTemplatesData.js`, scene files, `scenes/README.md`, fixed room furniture geometry, and all previously frozen controls remain unchanged except for the explicitly authorized sixth choice.
- Clutter affects movable props only and cannot relocate fixed furniture, body support surfaces, room geometry, walls, doors, windows, fixtures, bed frame, wardrobe, vanity or other ROOM LOCK landmarks.

## v2.4-night — 2026-08-28

### Added

- Added `js/data/nightTemplatesData.js` with five night-template categories and the supplied 20 bedroom night templates.
- Added a `نهاري ☀️ / ليلي 🌙` switch above the bedroom template categories. Night mode replaces the daytime chips/cards with `NIGHT_CATEGORIES` and `NIGHT_TEMPLATES`; daytime mode preserves the v2.1 library.
- Added `NIGHT REALISM LOCK` to `realismLocks.js` for noisy low-light blacks, screen falloff, physically valid catchlights, imperfect mixed white balance, low-light pupil/skin behavior, non-lighting emissive micro-dots, and unchanged bedding physics.
- Night templates inject `NIGHT BEDROOM TEMPLATE` immediately after pose physics, then the night realism lock and the existing family grounding/bedding locks.
- `dark` night templates automatically trigger `PHONE_SCREEN_ONLY_STRICT`, keeping the bedside lamp unlit unless a template explicitly selects a lamp source.
- Night-template selection now reverse-synchronizes the five-choice lighting selector to the matching v2.3 lighting preset, including hallway/bathroom/street spill, lamp, blue-hour, moonlight, pre-dawn, TV glow, and pitch-dark screen-only mappings.
- Added `tests/v2.4-night.mjs` and CI coverage for the supplied catalog, night-lock injection, strict dark behavior, family locks, UI mode switch, and lighting synchronization.

### Preserved

- `car.html`, `js/data/carTemplatesData.js`, scene files, `scenes/README.md`, and the existing five-choice controls remain structurally unchanged.
- Night `mood` remains UI-only. The English prompt receives source/physics, anatomy, camera, framing, gaze and anti-artifact constraints without cinematic mood grading.

## v2.3-light — 2026-08-28

### Added

- Added 12 physically described lighting scenes to `js/data/lightingData.js`: four isolation presets, three spill presets, four dramatic daylight/pre-dawn presets, and one mixed lamp-rim + phone preset.
- Added UI lighting groups `عزل ليلي 🌑`, `تسرب ضوء 🚪`, and `نهاري درامي ☀️` through `js/lightingV23Runtime.js`; `mood_ar` is shown only in the selector label and is not injected as cinematic English prompt language.
- Every v2 lighting prompt now includes both `LIGHTING PHYSICS LOCK` and the existing `LIGHTING REALISM (anti-AI)` block.
- Isolation presets inject declared ISO plus visible luminance noise and restrained chroma noise in shadow regions.
- `ac_led_micro` explicitly enforces `emissive dots that cast NO light` so micro LEDs can glow without illuminating surrounding materials.
- `phone_dark_closeup` automatically receives `PHONE_SCREEN_ONLY_STRICT`, keeping every other source off and any visible bedside lamp as an unlit decorative prop.
- Added `tests/v2.3-light.mjs` and CI coverage for catalog presence, UI groups, strict phone-dark behavior, low-light noise, and micro-source constraints.

### Preserved

- `js/engines/realismLocks.js`, `car.html`, car template data, scene files, and the existing five-choice behavior remain unchanged.
- `mood_ar` stays UI-only; prompt generation uses source geometry, physics, shadows, catchlights, room response and exposure data.

## v2.1-bed — 2026-08-28

### Added

- Added `js/data/bedTemplatesData.js` with seven bedroom selfie categories and the supplied 18 physically described bedroom templates.
- Added a category-chip bar and template-card grid at the top of section 02 without changing the existing five-choice controls.
- Template cards show the Arabic name, camera angle, framing/face share, mood, short anti-artifact rule, and a derived `ليلي 🌙 / نهاري ☀️ / محايد` badge based on the template lighting text.
- Added `js/bedTemplatesRuntime.js` to map a selected template to the appropriate existing pose while preserving all five manual choices as editable controls.
- `PromptEngine.generateV2()` now injects one `BEDROOM TEMPLATE` line immediately after `POSE & PHYSICS` and before family bedding/grounding locks.
- Added dedicated v2.1-bed regression coverage for template data integrity, prompt insertion order, UI wiring, and car-page isolation.

### Preserved

- `car.html`, `js/data/carTemplatesData.js`, `js/engines/realismLocks.js`, all scene files, `scenes/README.md`, and `tests/run-tests.mjs` remain unchanged.
- The existing five-choice behavior remains authoritative after template prefill; changing the pose manually clears the active bedroom template rather than forcing it back.
- Existing v2 identity, room, bedding/grounding, camera, lighting, single-pipeline, imperfection, and final-check locks remain unchanged.

## v2.0-personal — 2026-08-28

### Added

- Replaced the home workspace with a compact personal-production interface and removed the Smart Quad guide, marketing-style brand strip, long welcome copy, and non-functional badges.
- Added Pose-First / Reference-First workflow switching. Reference-First filters the pose selector against the chosen built-in scene while Pose-First restores automatic scene engineering.
- Added five one-click quick-fix blocks: identity drift, selfie-arm leak, lighting leak, seat/anatomy error, and background-cleaner-than-face error.
- Added a one-session export that creates three related prompts with the same appearance/lighting settings and family-compatible pose variants separated by `SESSION BREAK`.
- Added local prompt history capped at 50 entries, local favorites, and five recent configuration slots.
- Added keyboard shortcuts: N new, C copy, R rebuild, F favorite, H history, and 1–5 recent configurations.
- Kept the section-03 attach chip, direct scene-reference download, colored confidence badge, and strict-filter transparency line.
- `realismLocks.js` now exports `IMPERFECTIONS` and the five `QUICK_FIXES` blocks for the personal controller.
- Updated the v2 deployment regression contract to cover the personal UI and productivity tools.

### Preserved

- `car.html`, `js/data/carTemplatesData.js`, all scene assets and `scenes/README.md` remain untouched.
- `tests/run-tests.mjs` remains untouched by this deployment.
- The v2 `generateV2()` prompt order remains TASK → SELFIE VIEWPOINT LOCK → natural five-part brief → IDENTITY LOCK → ROOM LOCK → POSE & PHYSICS + bedding/grounding → CAMERA EMULATOR → muscle-only EXPRESSION → HAIR → CLOTHING → LIGHTING PHYSICS (+ strict phone-screen-only block) → SINGLE PIPELINE → IMPERFECTION MANIFEST → FINAL CHECK + NEGATIVE.
- Footer ethics rule remains explicit: no EXIF spoofing, no C2PA removal, and no PRNU simulation.

## v2.0 — 2026-08-28

### Added

- Added `js/engines/realismLocks.js` with the v2 selfie viewpoint, Xiaomi front-camera emulator, lighting physics, strict phone-screen-only lighting, single-pipeline, hair, clothing, expression, bedding, sitting/standing grounding, and deterministic imperfection-manifest locks.
- Replaced the expression source with the five v2 muscle-state expressions: neutral, smile, serious, relaxed, and confident. Existing module consumers retain a compatibility alias while the v2 source of truth is `EXPRESSIONS`.
- Added `PromptEngine.generateV2()` and made it the active prompt path.
- Enforced the v2 prompt order: TASK → SELFIE VIEWPOINT LOCK → natural five-part brief → IDENTITY LOCK → ROOM LOCK → POSE & PHYSICS + bedding/grounding → CAMERA EMULATOR → muscle-only EXPRESSION → HAIR → CLOTHING → LIGHTING PHYSICS + strict phone-screen block when selected → SINGLE PIPELINE → IMPERFECTION MANIFEST → FINAL CHECK + NEGATIVE.
- Smart engineering now runs immediately on initialization/load instead of leaving the scene in a waiting-for-engineering state.
- Added the section-03 attach chip with reference filename/path and direct reference download button.
- Added a colored confidence badge plus strict-filter transparency line (`passed X of Y references`).
- Pose options are rendered in bed, sitting, and standing optgroups using the v2 placement classification.

### Preserved

- The five-choice interface, sections 01–04 ordering, existing action buttons, scene/help dialogs, and footer wording remain unchanged except for the explicitly requested section-03 v2 indicators.
- `car.html` was not modified by the v2 deployment.
- `js/data/lightingData.js`, `js/data/posesData.js`, and `js/data/carTemplatesData.js` remain unchanged.

## v1.22 — 2026-08-28

### Changed

- Replaced the scattered car-template data sources with one canonical file: `js/data/carTemplatesData.js`.
- `car.html` now loads the unified v1.22 data file before car module runtimes.
- Removed template arrays from `js/carPosesData.js`; it now acts only as a compatibility adapter for the unified browser data source.
- Preserved every supplied v1.22 category/template/zone/angle/distance/framing/gaze/mood/anatomy/lighting/helper data exactly in the canonical data file.
- No `CAR_TEMPLATES` + `NEW_CAR_TEMPLATES` merge path is used.

## v1.17 — 2026-08-26

### Added

- Rebuilt `car.html` as a fully independent car-selfie workspace; no frozen `index.html` item was modified in this release.
- Added a sticky horizontally scrollable category bar with eight car-selfie groups: front close-up, side, high, low, Dutch/candid, mirror check, wheel, and passenger seat.
- Added `js/carPosesData.js` containing the supplied `CAR_CATEGORIES`, `CAR_TEMPLATES`, and `ANGLE_ANATOMY` map.
- Each template card now shows name, camera angle, distance, face/framing share, gaze direction, and a short seated-anatomy line; clicking a card immediately selects it and rebuilds the prompt.
- Added mandatory `ARM-FREE FRAMING LOCK`: the phone, hand, and complete selfie arm stay outside the final frame; authenticity comes from shoulder mechanics, near-field face geometry, off-center framing, restrained roll, and physically supported catchlights instead of a visible arm.
- Added mandatory `DRIVER SEAT ANATOMY SOLVER`, executed before camera placement, with seat-wheel axis, legs-first solving, angle-specific torso/head behavior, headrest alignment, sleeve consistency, seat compression, and Saudi left-hand-drive geometry.
- Added angle-specific anatomy injection through `ANGLE_ANATOMY` for frontal, side, high, low, Dutch, mirror, wheel, and passenger templates.
- Added required `IMAGE A` identity upload plus an optional cabin-reference upload. When the cabin reference is supplied it becomes IMAGE B and locks the environment; without it the car page builds the default coherent white 2022 Range Rover Sport cabin.
- Added the reduced car-only lighting selector: N1 sodium+LED, N2 shop-sign spill, N3 gas station, N4 midday, N5 dusk, N6 underground parking, and D2 shaded daylight.
- Kept only car-relevant appearance controls on this page: hair, facial expression, and clothing; sleepwear is filtered out from the car clothing selector.
- Added direct Copy, Download TXT, and Back actions.

### Prompt order

1. CAR CORE
2. CABIN SELFIE CAMERA LOCK
3. ARM-FREE FRAMING LOCK
4. DRIVER SEAT ANATOMY SOLVER + angle-specific anatomy
5. Selected template line
6. Selected lighting
7. STREET LIFE + GLASS & REFLECTION + SINGLE PIPELINE + IMPERFECTION MANIFEST
8. CHOICES
