# Phase 40 — Section Module Architecture

Status: **PASS**

Phase 40 separates the nine canonical studio sections into independent, deeply frozen modules while keeping the anti-AI Global Core shared. Section-specific routing and UI metadata now originate from the active section module instead of duplicate per-section switch/config tables.

## Architecture

Each file under `js/sections/` exports one frozen `SECTION` object with the contract:

`{ id, label, description, captureType, scenes, clothingSource, poses, lighting, realismLayers, rules }`

`js/sections/index.js` exports the frozen `SECTION_REGISTRY` and `getSection(id)`.

The registry contains exactly these nine ids, in stable order:

`solo`, `group`, `car`, `carExterior`, `bedroom`, `gym`, `street`, `accidental`, `custom`.

Section files import only the shared `_freeze.js` helper and never import another section module. Nested arrays and rule objects are deeply frozen, so a mutation attempt such as changing `gym.poses` throws and cannot change another section's output.

## Routing and UI

- `js/canonical/canonical-v3-pipeline.js` reads `SECTION_REGISTRY`/`getSection()` for capture type, routing metadata, clothing source, poses, lighting and realism-layer keys.
- The compatibility export `SECTION_CAPTURE_ROUTING` is derived from the registry; it is no longer a second hardcoded authority.
- `js/studio-section-engine-v1.js` derives studio options and UI state from the registry instead of its former duplicate `CONFIG` table.
- `js/phase22-ui-runtime.js` reads active-section metadata for scene availability and dedicated controls; the former `SECTION_GARMENT_SCENE` map is removed.
- Existing frozen behavior is preserved: car and carExterior force their canonical scenes, while historical fallback sections retain an explicitly valid existing scene and otherwise use their module default.
- `custom` is now a first-class section and intentionally preserves the user-written place.

## Shared Global Core

The section refactor does not duplicate or relocate the shared identity/anatomy/body/camera foundation. The final adapter continues to enforce the strict reference identity lock, 195 cm / 88 kg lean-athletic body profile, physically plausible anatomy, selfie-arm lock for selfie captures, camera behavior, dedupe, protected lighting/vehicle constraints and the 250-word budget.

The Phase 40 regression verifies the adapter does not mutate canonical hard constraints.

## Regression coverage

`tests/canonical-v3-section-modules-phase40.mjs` verifies:

1. exactly the nine canonical ids;
2. the required SECTION contract for every module;
3. recursive/deep freeze;
4. no cross-section imports;
5. UI section options derived from the registry;
6. pipeline/UI source guards against duplicate hardcoded section routing tables;
7. capture type, clothing source, poses, lighting and realism layers resolved from the active module;
8. one deterministic prompt per section with its module default behavior exercised;
9. strict identity, anatomy and body Global Core evidence in all nine outputs;
10. SELFIE_ARM_LOCK in selfie capture types;
11. hard constraints unchanged after adapter generation;
12. every output at or below 250 words;
13. determinism 10/10;
14. mutation isolation between sections.

The complete GitHub Actions suite passed through the historical Phase 23–39 regressions, the existing Phase 40 carExterior deep audit, and the new Phase 40 section-module architecture test.

## Sample prompts from the passing CI run

### solo

A candid direct selfie. One arm extends toward the camera holding the phone; the other hand stays free or relaxed — never both hands in pockets or both hands occupied. Identity strictly preserved from the reference image: face and head shape, facial proportions, feature spacing, eyes, eyebrows, nose, lips, jaw/chin, ears, skin tone, hairline, beard/moustache pattern, reference-linked eyewear, apparent age and natural asymmetry remain unchanged; no beautification, face slimming/lengthening, symmetry correction or de-aging regardless of angle, distance, clothing or lighting. Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame. No facial alteration/lengthening. Camera near eye level at 45–60 cm, no steep downward angle; relaxed upright posture, spine extension, enough upper torso to communicate the tall athletic frame. His stature reads noticeably above average-height people and everyday objects nearby. Subject wearing heavy black cotton T-shirt with dark blue jeans. an ordinary outdoor street or parking environment. Captured with the selected physically plausible front-camera geometry. mixed lighting from yellow sodium lamps and cool white LED shop signs, glowing cat-eye road reflectors, subtle motion blur from passing cars, light reflecting off dusty windows. soft-focus background characters, people in everyday slightly wrinkled white thobes, casual traditional sandals, some in casually draped red and white shemaghs, women in black abayas walking naturally, passersby in casual work clothes. Lighting follows the selected real-world night source.

### group

A candid group selfie. One arm extends toward the camera holding the phone; the other hand stays free or relaxed — never both hands in pockets or both hands occupied. Identity strictly preserved from the reference image: face and head shape, facial proportions, feature spacing, eyes, eyebrows, nose, lips, jaw/chin, ears, skin tone, hairline, beard/moustache pattern, reference-linked eyewear, apparent age and natural asymmetry remain unchanged; no beautification, face slimming/lengthening, symmetry correction or de-aging regardless of angle, distance, clothing or lighting. Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame. No facial alteration/lengthening. His stature reads noticeably above average-height people and everyday objects nearby. 3 people are present in the group composition. Beside him, thin face light stubble, ~22, calm soft smile, arm around neighbor shoulder, in white thobe with white ghutra. Beside him, oval clean-shaven, ~30, serious relaxed, peace sign, in light blue shirt. Each person is a clearly distinct individual with a unique facial structure, beard style, and apparent age; no two people share the same face, hairstyle, or outfit color, and none resemble the primary subject's reference identity. Blurred ambient streetlight glow fills the background. Subject wearing heavy black cotton T-shirt with dark blue jeans. an ordinary outdoor street or parking environment. Lighting follows the selected real-world night source.

### car

A candid direct selfie. One arm extends toward the camera holding the phone; the other hand stays free or relaxed — never both hands in pockets or both hands occupied. Identity strictly preserved from the reference image: face and head shape, facial proportions, feature spacing, eyes, eyebrows, nose, lips, jaw/chin, ears, skin tone, hairline, beard/moustache pattern, reference-linked eyewear, apparent age and natural asymmetry remain unchanged; no beautification, face slimming/lengthening, symmetry correction or de-aging regardless of angle, distance, clothing or lighting. Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame. No facial alteration/lengthening. Shoulders fill seatback; head nears headliner; steering wheel proportionally smaller for 195 cm driver. Subject wearing heavy black cotton T-shirt with dark blue jeans. Inside stationary 2017 Range Rover Sport Autobiography Dynamic L494, Fuji White; Ivory perforated leather, dark wood veneer, panoramic glass roof. Xiaomi 15 Ultra front camera: 42 cm, 0° yaw, -3° pitch, 2° roll, and 21 mm. LHD vehicle-relative: driver-left; steering directly ahead of torso. In the frame, the driver's door and side window appear on the right side of the image, the center console on the left side of the image, and the steering wheel rim enters the bottom of the frame directly ahead of his torso. Lighting follows the selected real-world night source.

### carExterior

A candid direct selfie. One arm extends toward the camera holding the phone; the other hand stays free or relaxed — never both hands in pockets or both hands occupied. Identity strictly preserved from the reference image: face and head shape, facial proportions, feature spacing, eyes, eyebrows, nose, lips, jaw/chin, ears, skin tone, hairline, beard/moustache pattern, reference-linked eyewear, apparent age and natural asymmetry remain unchanged; no beautification, face slimming/lengthening, symmetry correction or de-aging regardless of angle, distance, clothing or lighting. Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame. No facial alteration/lengthening. Shoulder and head height relative to roofline, door frame, and handle reflect a genuine 195 cm adult. Subject wearing heavy black cotton T-shirt with dark blue jeans. 2017 Range Rover Sport Autobiography Dynamic L494, Fuji White, gloss black grille and vent surrounds, 22-inch dark alloys, quad rectangular exhaust tips, LED DRLs, panoramic glass roof, transparent glass with natural reflections and a faint Ivory-cabin view, never opaque black; Autobiography Dynamic badging and Saudi plate, never legible. Beside a Saudi villa driveway and gate; tires grounded by realistic contact shadow. subject leaning on closed driver door. Lighting follows the selected real-world night source: streetlights create elongated reflections along the hood, roof, and side panels with natural dark gaps between light pools.

### bedroom

A candid direct selfie. One arm extends toward the camera holding the phone; the other hand stays free or relaxed — never both hands in pockets or both hands occupied. Identity strictly preserved from the reference image: face and head shape, facial proportions, feature spacing, eyes, eyebrows, nose, lips, jaw/chin, ears, skin tone, hairline, beard/moustache pattern, reference-linked eyewear, apparent age and natural asymmetry remain unchanged; no beautification, face slimming/lengthening, symmetry correction or de-aging regardless of angle, distance, clothing or lighting. Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame. No facial alteration/lengthening. Camera near eye level at 45–60 cm, no steep downward angle; relaxed upright posture, spine extension, enough upper torso to communicate the tall athletic frame. Subject: relaxed standing pose, neutral expression, wearing winter red-and-black flannel pajama shirt with matching red-and-black pajama pants. Natural hair flyaways and loose strands. Natural fabric wrinkles and folds. an ordinary lived-in bedroom. Lived-in details remain consistent with the room. Captured with the Xiaomi 15 Ultra front camera, using 50 cm subject distance, 0° yaw, 0° pitch, 2° roll, and 21 mm equivalent focal length. Slight lens softness is visible toward the frame edges. Human anatomy is physically plausible, with consistent limb ownership, physical contact, gravity, and occlusion. Lighting follows the selected real-world night source. Localized highlights transition gradually into adjacent shadows.

### gym

A candid direct selfie. One arm extends toward the camera holding the phone; the other hand stays free or relaxed — never both hands in pockets or both hands occupied. Identity strictly preserved from the reference image: face and head shape, facial proportions, feature spacing, eyes, eyebrows, nose, lips, jaw/chin, ears, skin tone, hairline, beard/moustache pattern, reference-linked eyewear, apparent age and natural asymmetry remain unchanged; no beautification, face slimming/lengthening, symmetry correction or de-aging regardless of angle, distance, clothing or lighting. Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame. No facial alteration/lengthening. Camera near eye level at 45–60 cm, no steep downward angle; relaxed upright posture, spine extension, enough upper torso to communicate the tall athletic frame. His stature reads noticeably above average-height people and everyday objects nearby. Subject wearing olive training hoodie with matching olive jogger pants with cotton, light fabric weight, regular fit, ordinary daily wear, and lightly unpressed. an ordinary gym environment. Localized sweat sheen appears on the forehead, temples, and neck only. Chrome bars show fine scratches and worn knurling from grip. A water bottle and a draped towel rest on the bench beside him. A blurred figure mid-lift softens in the far rack background. Slight lens softness is visible toward the frame edges. Lighting follows the selected real-world night source.

### street

A candid direct selfie. One arm extends toward the camera holding the phone; the other hand stays free or relaxed — never both hands in pockets or both hands occupied. Identity strictly preserved from the reference image: face and head shape, facial proportions, feature spacing, eyes, eyebrows, nose, lips, jaw/chin, ears, skin tone, hairline, beard/moustache pattern, reference-linked eyewear, apparent age and natural asymmetry remain unchanged; no beautification, face slimming/lengthening, symmetry correction or de-aging regardless of angle, distance, clothing or lighting. Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame. No facial alteration/lengthening. His stature reads noticeably above average-height people and everyday objects nearby. Subject: relaxed standing pose, neutral, wearing crisp white thobe with a red-and-white checkered shemagh and black iqal, youthful style with one end casually thrown over the shoulder. a red-and-white fine checkered shemagh with one end casually thrown over the shoulder and the other hanging at the chest, held by a black doubled-cord iqal seated firmly on the crown, relaxed youthful drape, the shemagh lies flat under the iqal, not a turban. an ordinary outdoor street or parking environment. mixed lighting from yellow sodium lamps and cool white LED shop signs, glowing cat-eye road reflectors, subtle motion blur from passing cars, light reflecting off dusty windows. Lighting follows the selected real-world night source.

### accidental

An accidental front-camera capture. Identity strictly preserved from the reference image: face and head shape, facial proportions, feature spacing, eyes, eyebrows, nose, lips, jaw/chin, ears, skin tone, hairline, beard/moustache pattern, reference-linked eyewear, apparent age and natural asymmetry remain unchanged; no beautification, face slimming/lengthening, symmetry correction or de-aging regardless of angle, distance, clothing or lighting. Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame. No facial alteration/lengthening. His stature reads noticeably above average-height people and everyday objects nearby. A candid accidental smartphone capture. Subject: relaxed standing pose, neutral expression, wearing heavy black cotton T-shirt with dark blue jeans. an ordinary outdoor street or parking environment. Captured with the Xiaomi 15 Ultra front camera, using 21 mm equivalent focal length. Human anatomy is physically plausible, with consistent limb ownership, physical contact, gravity, and occlusion. The capture uses a physically possible camera position, a physically possible camera operator, and one coherent capture event. mixed lighting from yellow sodium lamps and cool white LED shop signs, glowing cat-eye road reflectors, subtle motion blur from passing cars, light reflecting off dusty windows. soft-focus background characters, people in everyday slightly wrinkled white thobes, casual traditional sandals, some in casually draped red and white shemaghs, women in black abayas walking naturally, passersby in casual work clothes. Lighting follows the selected real-world night source.

### custom

A candid direct selfie. One arm extends toward the camera holding the phone; the other hand stays free or relaxed — never both hands in pockets or both hands occupied. Identity strictly preserved from the reference image: face and head shape, facial proportions, feature spacing, eyes, eyebrows, nose, lips, jaw/chin, ears, skin tone, hairline, beard/moustache pattern, reference-linked eyewear, apparent age and natural asymmetry remain unchanged; no beautification, face slimming/lengthening, symmetry correction or de-aging regardless of angle, distance, clothing or lighting. Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame. No facial alteration/lengthening. Camera near eye level at 45–60 cm, no steep downward angle; relaxed upright posture, spine extension, enough upper torso to communicate the tall athletic frame. Subject: relaxed standing pose, neutral expression, wearing heavy black cotton T-shirt with dark blue jeans. Natural hair flyaways and loose strands. Natural fabric wrinkles and folds. A single soft catchlight in each eye matches the dominant light source. an ordinary user-defined outdoor scene. Captured with the Xiaomi 15 Ultra front camera, using 50 cm subject distance, 0° yaw, 0° pitch, 2° roll, and 21 mm equivalent focal length. Slight lens softness is visible toward the frame edges. Human anatomy is physically plausible, with consistent limb ownership, physical contact, gravity, and occlusion. Lighting follows the selected real-world night source. Localized highlights transition gradually into adjacent shadows.

## CI result

- `PHASE40_SECTION_IDS=solo,group,car,carExterior,bedroom,gym,street,accidental,custom`
- `PHASE40_DETERMINISM=10/10`
- `✓ Phase 40 section module architecture passed`
- Existing Phase 40 carExterior matrix also remains green at 223 cases with a 250-word maximum and 10/10 determinism.
