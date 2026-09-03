import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const engineUrl = new URL("../js/canonical-v3-engine.js", import.meta.url);
if (!fs.existsSync(fileURLToPath(engineUrl))) {
  console.log("○ Phase 1 contract test pending: canonical-v3 engine not implemented yet");
  process.exit(0);
}

const { buildCanonicalV3 } = await import(engineUrl.href);
assert.equal(typeof buildCanonicalV3, "function");

const canonical = buildCanonicalV3({
  studioSection: "car",
  scene: "rangeRover",
  hasReference: true,
  referenceId: "identity-ref",
  selfieAngle: "three-quarter",
  composition: "close",
  lighting: "car-day-window",
  time: "day",
  sceneFacts: {
    identity: { reference_id: "scene-forged-reference" },
    camera: { yaw_deg: 41 },
    lighting: { source_type: "custom", description: "scene-forged light" }
  }
});

assert.equal(canonical.authorities.identity.owner, "identity_reference");
assert.equal(canonical.authorities.scene.owner, "scene_contract");
assert.equal(canonical.authorities.camera.owner, "camera_contract");
assert.equal(canonical.authorities.lighting.owner, "lighting_contract");
assert.equal(canonical.authorities.vehicle_geometry.owner, "hard_constraint");
assert.equal(canonical.authorities.scene.adapter_can_modify, false, "scene contract is read-only to adapters");
assert.equal(canonical.authorities.identity.adapter_can_modify, false);
assert.equal(canonical.identity.reference_id, "identity-ref");
assert.notEqual(canonical.camera.geometry.yaw_deg, 41, "scene.facts must not win a camera authority collision");
assert.ok(canonical.resolution.conflicts.length >= 1, "authority collisions must be recorded deterministically");

console.log("✓ canonical-v3 authority collision contract passed");
