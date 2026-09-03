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
  studioSection: "car",
  scene: "rangeRover",
  time: "day",
  lighting: "car-day-window",
  selfieAngle: "three-quarter",
  composition: "close",
  visualSelfieMonitor: "on",
  selfieDistanceCm: 78,
  selfieYawDeg: -40,
  selfiePitchDeg: 22,
  selfieRollDeg: 9,
  sceneFacts: {
    camera_geometry: {
      distance_cm: 120,
      yaw_deg: 45,
      pitch_deg: 30
    }
  }
});

assert.equal(canonical.authorities.camera.owner, "camera_contract");
assert.equal(canonical.authorities.camera.adapter_can_modify, false);
assert.equal(canonical.hard_constraints.camera_geometry.preserve_resolved_geometry, true);
assert.equal(canonical.hard_constraints.camera_geometry.adapter_can_modify, false);
assert.equal(typeof canonical.camera.geometry, "object");
assert.equal(canonical.camera.geometry.distance_cm <= 80, true);
assert.notEqual(canonical.camera.geometry.distance_cm, 120);
assert.notEqual(canonical.camera.geometry.yaw_deg, 45);
assert.ok(canonical.resolution.conflicts.some((item) => item.property.includes("camera")));

console.log("✓ canonical-v3 camera conflict contract passed");
