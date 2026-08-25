# Changelog

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
