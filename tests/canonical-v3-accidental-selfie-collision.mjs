import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const engineUrl = new URL("../js/canonical-v3-engine.js", import.meta.url);
if (!fs.existsSync(fileURLToPath(engineUrl))) {
  console.log("○ Phase 1 contract test pending: canonical-v3 engine not implemented yet");
  process.exit(0);
}

const { buildCanonicalV3 } = await import(engineUrl.href);

const canonical = buildCanonicalV3({
  studioSection: "accidental",
  captureMode: "accidental",
  accidentalDevice: "iphone",
  accidentalTrigger: "pocket",
  accidentalPhonePosition: "rising",
  accidentalMotion: "subtle",
  accidentalTilt: "right",
  accidentalFocus: "transition-face",
  accidentalExposure: "auto-imperfect",
  accidentalIntensity: "natural",
  scene: "bedroom",
  selfieAngle: "eye",
  composition: "close",
  visualSelfieMonitor: "on",
  selfieDistanceCm: 50,
  selfieYawDeg: 0,
  selfiePitchDeg: 0
});

assert.equal(canonical.intent.type, "accidental");
assert.equal(canonical.capture.type, "accidental_front_camera_capture");
assert.equal(canonical.capture.intentional, false);
assert.equal(canonical.capture.single_capture_event, true);
assert.equal(canonical.authorities.capture.owner, "capture_contract");
assert.equal(canonical.hard_constraints.selfie_geometry.applicable, false);
assert.equal(canonical.hard_constraints.capture_physics.single_capture_event, true);
assert.equal(canonical.camera.camera_type, "front_camera");
assert.ok(canonical.resolution.conflicts.some((item) => item.property.includes("capture") || item.property.includes("camera")));

console.log("✓ canonical-v3 accidental/selfie collision contract passed");
