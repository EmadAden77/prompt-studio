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
  studioSection: "bedroom",
  scene: "my_bedroom_text",
  hasReference: true,
  time: "day",
  lighting: "day-soft-window",
  selfieAngle: "eye",
  composition: "close",
  sceneFacts: {
    source: "bedroom-reference",
    vehicle_geometry: {
      drive_configuration: "right_hand_drive",
      driver_position: "vehicle_right"
    },
    identity: { reference_id: "scene-must-not-own-identity" },
    camera: { yaw_deg: 35 },
    lighting: { source_type: "custom" }
  }
});

assert.equal(canonical.authorities.scene.owner, "scene_contract");
assert.equal(canonical.authorities.scene.adapter_can_modify, false, "scene.facts must remain read-only");
assert.equal(canonical.scene.type, "room");
assert.equal(canonical.hard_constraints.vehicle_geometry.applicable, false);
assert.equal(canonical.identity.reference_id !== "scene-must-not-own-identity", true);
assert.notEqual(canonical.camera.geometry.yaw_deg, 35);
assert.notEqual(canonical.lighting.source_type, "custom");
assert.equal(canonical.validation.scene_leakage_detected, true);

console.log("✓ canonical-v3 scene leakage contract passed");
