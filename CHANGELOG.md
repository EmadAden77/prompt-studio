# Changelog

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
- `car.html` now loads the unified v1.22 data file before the car module runtimes.
- Removed template arrays from `js/carPosesData.js`; it now acts only as a compatibility adapter for the unified browser data source.
- Preserved every supplied v1.22 category, template, zone, angle, distance, framing, gaze, mood, anatomy, lighting string, and helper exactly in the canonical data file.
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

## v1.11 — 2026-08-26

### Added

- Added a new **قالب جاهز (اختياري)** field to Smart Quad.
- Added scene-aware preset groups for bed, sitting, standing, and vanity-mirror captures.
- Templates set one coherent value for pose, hair, lighting, expression, clothing, and aspect ratio; they never inject multiple poses or multiple choice lists into the final prompt.
- Templates are filtered against the currently selected IMAGE B reference. A template is shown only when its pose is supported by that reference and at least one of its preferred lighting choices is physically supported by the reference metadata.
- Added adaptive lighting fallback inside templates: the first physically supported declared source is selected rather than forcing an unsupported lamp, window, or ceiling source.
- Added dedicated template regression tests and CI coverage.

### Camera corrections

- Removed the generic fixed-distance wording from the front Camera Emulator. The emulator now defers to the pose-specific SELFIE VIEWPOINT LOCK and its mapped reach, avoiding conflicts between supine, side-lying, seated, and standing distances.
- Removed baked-in generic harsh face-light behavior from the camera description; exposure and highlights now explicitly follow the selected lighting event.
- Added a dedicated **MIRROR SELFIE CAMERA — REAR CAMERA, SUBJECT-HELD** path so mirror selfies no longer inherit the contradictory “another person or tripod operates the rear camera” wording.
- Mirror selfies now require one consistent subject → mirror → rear-camera ray path with correct handedness, gaze, phone occlusion, reflection scale, and room/mirror perspective.

### Preserved

- The final prompt still contains exactly one selected pose family and its matching grounding/camera/arm logic.
- Existing identity, room, clothing realism, lighting realism, CPR-01, pose grounding, and negative constraints remain unchanged.
- Manual controls remain available after applying a template; changing any manual control returns the template field to **تخصيص يدوي**.

## v1.10 — 2026-08-26

### Added

- Added `PHOTOGRAPHIC BRIEF — NATURAL LANGUAGE (read this first)` directly after `CHATGPT IMAGE TASK` and before all prompt-engineering policies.
- The natural brief summarizes the five guide elements in six ordinary English sentences: subject, setting, action/pose, photographic style, and lighting/camera.
- The brief deliberately avoids repeating the strict technical details that remain authoritative in the existing identity, room, pose/grounding, lighting, camera, processing, and negative sections.
- Added an aspect-ratio output control with `9:16`, `1:1`, and `16:9`; the default remains `9:16`.
- Added a dynamic final brief line for the selected ratio: `Aspect ratio: 9:16 vertical phone selfie.`, `Aspect ratio: 1:1 square phone selfie.`, or `Aspect ratio: 16:9 horizontal phone selfie.`
- Added the fixed send instruction above the copy controls, telling the user to attach IMAGE A and the selected room reference as IMAGE B, read the natural brief first, then execute the strict sections in order and return only one final image.

### Preserved

- All existing frozen strict prompt sections remain in their prior order and wording after the new natural brief.
- Existing identity, room/reference, pose-family grounding, selfie viewpoint, camera, lighting, processing, realism, forbidden-result, and negative-prompt behavior remains authoritative.
- Mirror-selfie camera behavior stays on its existing rear-camera path; the natural brief reflects the actual configured camera instead of forcing front-camera wording onto a rear-camera pose.

## v1.9 — 2026-08-26

### Changed

- Restored the full lighting catalog in the Smart Quad selector instead of hiding room-incompatible choices from the user.
- Lighting choices are no longer silently replaced by scene filtering; the user-selected preset remains the authoritative lighting request, while the validator may still flag a source that the chosen reference cannot support.
- Added explicit `CPR-01 — SELECTED LIGHTING AUTHORITY` to every generated lighting section.
- The selected lighting preset is now passed literally into the final prompt and is the only authoritative lighting-source description; conflicting lighting text is ignored.
- Lighting changes are explicitly forbidden from moving, resizing, recoloring, cleaning, replacing, redesigning, adding, or removing furniture, landmarks, fixtures, clutter, walls, floors, ceilings, bedding, mirrors, curtains, windows, or materials.
- Added stricter real-phone photometric behavior for shadows, catchlights, reflections, mixed color temperatures, daylight patches, night darkness, ISO/chroma noise, HDR, white balance, and one unified exposure/tone-mapping pipeline.
- Corrected the strict phone-screen-only light distance to the same physically reachable 45–70 cm front-selfie distance used by the camera geometry.
- Expanded the pose selector into three `optgroup` families: **🛏️ bed**, **🛋️ sitting**, and **🧍 standing** while preserving the existing bed poses.
- Activated `sitting_sofa`, `sitting_chair`, `sitting_floor`, `standing_center`, `standing_bedside`, `standing_sofa`, `standing_vanity`, and `standing_wardrobe` as selectable deterministic poses.
- Added mandatory `SITTING GROUNDING` with seat/support load, sofa compression, chair/floor contact shadows, supported legs/feet, gravity folds, and natural seated asymmetry.
- Added mandatory `STANDING GROUNDING` with full foot-floor contact, contrapposto weight shift, gravity drape, light-consistent floor shadow, and near-vertical room lines.
- Added family camera/arm rules: sitting selfies use 50–70 cm at actual seated eye height; standing selfies use 45–60 cm near ~1.5 m eye height; the holding elbow remains naturally relaxed and the opposite arm must rest on a real support, thigh, pocket, hip, or equivalent grounded position.
- Added dynamic sitting negatives: `floating above cushion`, `uncompressed sofa cushion`, `feet without floor contact`, `mannequin sitting posture`, and `seat hidden by impossible crop`.
- Added dynamic standing negatives: `floating feet`, `missing foot contact shadow`, `hovering heels`, `symmetrical mannequin stance`, and `bent room lines without lens reason`.
- Preserved the frozen bed prompt path; the new family placement, framing, grounding, and final physical checks are injected only for sitting/standing families.
- Added and executed `libraryCoverageReport`; all new pose families have real local references already present in the repository, so no invented scenes were added.

### Library coverage

- `sitting_sofa` → `sofa_area`
- `sitting_chair` → `chair_area`
- `sitting_floor` → `room_center`
- `standing_center` → `room_center`
- `standing_bedside` → three valid bed references, with `bed_front_overview` selected as the primary automatic reference
- `standing_sofa` → `sofa_area`
- `standing_vanity` → `vanity_mirror`
- `standing_wardrobe` → `wardrobe_area`

## v1.8 — 2026-08-26

### Changed

- Added mandatory `LYING GROUNDING` for every pose whose ID starts with `lying`.
- Grounding now requires a body plane on the mattress, 4–6 cm pillow compression, mattress load deformation, contact shadows, gravity cues, and bed-surrounding camera geometry.
- Added forbidden upright/backdrop poses and a final re-render grounding check before output.

## v1.7 — 2026-08-26

### Changed

- Added a strict phone-screen-only enforcement block whenever `phone_screen_only` is selected.
- Declared visible bedside lamps, shades, and bulbs as unlit decorative props with zero emitted light for that preset.
- Added dynamic phone-screen-only negative constraints against warm lamp glow, amber/orange cast, illuminated shades, studio warm fill, and cinematic grading.

## v1.6 — 2026-08-25

### Changed

- Replaced the lighting catalog with the 13 supplied v1.6 presets, grouped in the UI as screen, ceiling, lamp, daylight, mixed, and night.
- Preserved the existing default lighting selection: `lamp_and_phone`.
- Injected the full **LIGHTING REALISM (anti-AI)** block into every generated prompt.
- Replaced the front-camera prompt section with the supplied **Camera Emulator** and aligned the front focal range to 22–24 mm equivalent.
- Kept all non-lighting and non-front-camera behavior unchanged.

## v1.4 — 2026-08-25

### Changed
- Switched Smart Quad to **reference-first selection**: the user now chooses the built-in room reference first, then the app proposes the suitable pose.
- The pose selector is filtered to the poses supported by that reference; unsupported room references are not offered in Smart Quad.
- The selected reference remains built-in, so IMAGE B still never requires an upload.
- Updated prompt wording, validation guidance, the reference picker, and the help flow to reflect user-selected room references.

## v1.3.1 — 2026-08-25

### Changed
- Added automatic room-reference selection: Smart Quad now chooses IMAGE B from the built-in scene library based on the selected pose.
- Removed all IMAGE B upload and filename-match requirements, including the `image_b_missing` warning.
- The interface now displays the automatically selected reference and keeps only IMAGE A as a user upload.

### Prompt behavior
- Generated prompts identify the selected built-in room reference instead of claiming that the user attached IMAGE B.

## v1.3 — 2026-08-25

### Added
- Integrated the uploaded **SELFIE BEDROOM REALISM ENGINE** into the bed-selfie pipeline only.
- Added explicit bed-realism profiles for `lying_back`, `lying_stomach`, `lying_right_side`, `lying_left_side`, and `semi_reclining`.
- Updated front-camera reach geometry to ordinary handheld ranges: typically 45–70 cm, with extended reach only when anatomy physically supports it.
- Updated right-side and left-side lying camera geometry to 45–70 cm with physically modest yaw/pitch instead of a forced Dutch angle.
- Updated supine camera geometry to 45–75 cm with approximately 15–35° downward pitch and restrained yaw.
- Expanded the strict reference gate to require: pose support, mandatory bed geometry, near-selfie camera feasibility, and selected lighting-source support before ranking.
- Added portable-light metadata so the subject's own phone screen is allowed as a light source without needing to pre-exist in IMAGE B.
- Changed auto-engineering so the user's selected lighting is never silently replaced to make a scene pass.
- Updated the validator to use the same v1.3 hard gate and to stop treating IMAGE B's original external camera angle as a camera lock for true generated bed selfies.

### Decision order
1. Pose and required bed surface.
2. Body support and contact physics.
3. Head / neck orientation.
4. Free-arm detection and selfie-arm selection.
5. Reachable front-camera zone.
6. Scene hard gate: room geometry + selfie feasibility + selected lighting support.
7. Background ranking among passing references only.
8. Lighting / pose coherence.
9. Smartphone exposure, white balance, processing, crop, and validation.

### Preserved
- IMAGE A identity-only authority and IMAGE B room-geometry authority.
- SELFIE VIEWPOINT LOCK and third-person-view prohibition.
- TRUE LATERAL ENFORCEMENT and body-relative left/right rules.
- BODY FIRST, CAMERA SECOND.
- Expression lock, hair lock, clothing lock, and FABRIC REALISM.
- Existing five-choice Smart Quad interface.
- Mirror selfie remains on its rear-camera mirror pipeline and is outside the bed-realism engine.
- No EXIF spoofing, C2PA removal, PRNU simulation, or forensic countermeasures.

## v1.2 — 2026-08-25

### Added
- Added a strict Pass/Fail scene hard gate that runs before any ranking or preferred-scene logic.
- Added deterministic `POSE_REQUIREMENTS` for mandatory room features and preferred regions.
- Added strict filtering statistics: `مرشح صارم: اجتاز X من Y مرجعًا`.
- Added strict confidence labels: high, medium, and low.
- Added automatic scene switching feedback when a pose change invalidates the current automatic reference.
- Added explicit no-match UI with two paths: change the pose or use a manual override under warning.
- Added a yellow warning state for manual overrides that fail the hard gate.
- Added blocking validator conflict `reference_pose_mismatch` for a reference that does not support the pose or lacks mandatory features.
- Added an Arabic summary warning for invalid manual overrides while keeping the English prompt itself unchanged.

### Hard-gate order
1. The scene must list the pose in `supported_poses`.
2. The scene must contain **all** mandatory features for the pose.
3. Only scenes that pass both checks can enter ranking.
4. Ranking then considers preferred region, body direction, camera angle, camera distance, and default-for-pose status.
5. If zero scenes pass, no automatic scene is selected.

### Preserved
- Final English prompt structure and content rules.
- Authority hierarchy and identity/reference separation.
- SELFIE VIEWPOINT LOCK.
- TRUE LATERAL ENFORCEMENT.
- BODY FIRST, CAMERA SECOND.
- Existing camera, lighting, processing, clothing/fabric, forbidden-results, and negative-prompt rules.
- No EXIF spoofing, C2PA removal, PRNU simulation, or forensic countermeasures.

## v1.1 — 2026-08-25

### Added
- Added the fifth Smart Quad user choice: **Clothing**.
- Added categorized clothing groups: sleepwear, casual, sport, winter, and traditional.
- Added the exact v1.1 clothing catalog with `cotton_pajama` as the default selection.
- Added garment-specific fabric properties to the final prompt: material, weight, sheen, drape, folds, texture, and wear.
- Added the mandatory `FABRIC REALISM` block for non-repeating weave/knit, load-driven folds, material-correct sheen, subtle construction imperfections, localized compression response, restrained wear, and one unified phone-camera processing pipeline.
- Added clothing to the Arabic selection summary.

### Preserved
- Authority hierarchy and identity/reference separation.
- SELFIE VIEWPOINT LOCK.
- TRUE LATERAL ENFORCEMENT.
- BODY FIRST, CAMERA SECOND.
- Existing camera, lighting, processing, validator, forbidden-results, and negative-prompt rules.
- No EXIF spoofing, C2PA removal, PRNU simulation, or forensic countermeasures.