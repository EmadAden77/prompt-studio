# Phase 36 — Selfie lock + full section routing de-conflict

## Goal
Make `studioSection` the single pre-resolver authority for capture routing and fixed scene routing, then guarantee a selfie-safe first sentence and hand/phone physics in the adapter.

## Routing authority
`SECTION_CAPTURE_ROUTING` in `js/canonical/canonical-v3-pipeline.js` resolves before the conflict resolver:

- `solo`, `selfie`, `studio`, `bedroom`, `gym`, `street`, `carExterior` → `direct_front_camera_selfie`
- `car` → `subject_held_driver_selfie`
- `group` → `group_selfie`
- `accidental` → `accidental_front_camera_capture`

Fixed sections also force their real scene ids (`bedroom`, `gym`, `street`, `rangeRover`, `carExterior`) so stale `custom` browser state cannot produce `a user-defined scene`.

## Selfie lock
`js/canonical/openai-image-adapter-phase36.js` makes the capture sentence the first sentence. Intentional selfie captures add:

`One arm extends toward the camera holding the phone; the other hand stays free or relaxed — never both hands in pockets or both hands occupied.`

Existing later capture/operator sentences are removed rather than duplicated. Only low-priority optional realism sentences may be dropped when required to remain within 250 words.

## Pose compatibility
Before canonical construction, incompatible selfie poses are deterministically replaced:

- both hands in pockets → one hand in a pocket while the other holds the phone
- arms crossed → one hand relaxed at his side
- holding an object with both hands → free hand raising a peace sign

## carExterior guarantee
`carExterior` forces `scene="carExterior"`, preserves selected location and pose facts, and routes the resolved clothing through the existing Phase 34 authority. The adapter therefore retains the frozen 2017 Range Rover Sport Autobiography Dynamic L494 / Fuji White exterior contract and the Phase 25 shemagh + iqal lock.

## Regression test
`tests/canonical-v3-selfie-lock-phase36.mjs` checks every route for:

- correct first capture sentence
- deterministic 10/10 output
- no impossible `both hands in pockets` selfie pose
- no `a user-defined scene` leakage for real sections
- ≤250 words
- unchanged hard constraints under adapter execution
- carExterior contains Range Rover 2017, Fuji White, selected location, thobe, red-and-white fine checkered shemagh, black doubled-cord iqal, and the one-arm selfie lock

The test is wired into `.github/workflows/test.yml`.
