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
  hasReference: true,
  time: "day",
  lighting: "car-day-window",
  selfieAngle: "three-quarter",
  composition: "close",
  mirrorPreview: true,
  sceneFacts: {
    drive_configuration: "right_hand_drive",
    driver_position: "vehicle_right",
    console_relation: "driver_physical_left"
  }
});

const vehicle = canonical.hard_constraints.vehicle_geometry;
assert.equal(vehicle.applicable, true);
assert.equal(vehicle.drive_configuration, "left_hand_drive");
assert.equal(vehicle.driver_position, "vehicle_left");
assert.equal(vehicle.steering_relation, "ahead_of_driver_torso");
assert.equal(vehicle.cluster_relation, "behind_steering_wheel");
assert.equal(vehicle.console_relation, "driver_physical_right");
assert.equal(vehicle.door_window_relation, "driver_physical_left");
assert.equal(vehicle.coordinate_system, "vehicle_relative");
assert.equal(vehicle.mirror_may_swap_physical_sides, false);
assert.equal(vehicle.adapter_can_modify, false);

console.log("✓ canonical-v3 LHD driver-side inversion contract passed");
