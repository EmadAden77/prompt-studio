import assert from "node:assert/strict";
import {
  DEFAULT_STATE,
  buildStructuredPromptSpec
} from "../js/physics-prompt-engine-v5.js";

const standalone = buildStructuredPromptSpec({
  ...DEFAULT_STATE,
  hasReference:true,
  expression:"soft-smile",
  clothing:"shirt-poplin-formal",
  fabric:"cotton-poplin",
  fabricWeight:"light",
  ironState:"lightly-unpressed",
  wearState:"fresh",
  clothingFit:"slim"
}, {
  wikiPromptGuidance:"calibration only"
});

assert.equal(standalone.schema_version, "realistic-image-generator/v1");
assert.equal(standalone.task.capture_type, "subject_held_front_camera_selfie");
assert.equal(standalone.authority.identity_reference.source, "attached_reference_image");
assert.equal(standalone.authority.identity_reference.role, "identity_only");
assert.equal(standalone.subject.expression.id, "soft-smile");
assert.equal(standalone.subject.clothing.garment.id, "shirt-poplin-formal");
assert.equal(standalone.subject.clothing.fabric.id, "cotton-poplin");
assert.equal(standalone.accessories.headwear, null, "JSON must not invent a cap");
assert.equal(standalone.accessories.jewelry, null, "JSON must not invent jewelry");
assert.equal(standalone.accessories.prop, null, "JSON must not invent a prop");
assert.equal(standalone.photography.aspect_ratio, null, "An unspecified aspect ratio must remain null");
assert.equal(standalone.subject.mirror_rules.applicable, false, "A direct selfie is not silently converted into a mirror selfie");
assert.equal(standalone.generator.input_mode, "json_only");
assert.equal(standalone.generator.wiki_prompt_calibration.enabled, true);
assert.equal(standalone.generator.wiki_prompt_calibration.role, "realism_calibration_only; never override explicit JSON fields");
assert.ok(!Object.hasOwn(standalone, "compiled_prompt"), "Direct JSON must not embed a duplicate long-form prompt");
assert.ok(!Object.hasOwn(standalone, "qa"), "Direct JSON must not embed UI-only QA diagnostics");
assert.ok(!Object.hasOwn(standalone, "automatic_conflict_corrections"), "Direct JSON must not embed implementation traces");

const driver = buildStructuredPromptSpec({
  ...DEFAULT_STATE,
  scene:"rangeRover",
  time:"night",
  poseFamily:"car",
  pose:"car-driver-close",
  carSeat:"driver-left",
  composition:"close",
  selfieAngle:"eye",
  lighting:"car-night-parking-led",
  clothing:"shirt-poplin-formal",
  fabric:"cotton-poplin",
  fabricWeight:"light",
  ironState:"lightly-unpressed",
  wearState:"fresh",
  clothingFit:"slim"
});

assert.equal(driver.task.capture_type, "subject_held_driver_selfie");
assert.equal(driver.scene.seat_position.id, "driver-left");
assert.equal(driver.scene.vehicle_orientation, "unmirrored_left_hand_drive");
assert.equal(driver.scene.stationary, true);
assert.equal(driver.photography.camera_geometry.authority, "car_driver_selfie_geometry_sole_authority");
assert.equal(driver.photography.camera_geometry.distance_cm, 42);
assert.equal(driver.photography.camera_geometry.phone_yaw_deg, 0);
assert.equal(driver.photography.camera_geometry.phone_pitch_deg, -3);
assert.ok(driver.photography.camera_geometry.driver_constraints.includes("thin_upper_steering_wheel_arc_in_lower_foreground"));
assert.ok(driver.photography.camera_geometry.driver_constraints.includes("no_full_wheel_hub_spokes_or_broad_holding_forearm"));
assert.match(driver.background.elements.required[0], /at most 8% of image height/u);
assert.equal(driver.background.wall_color, null);

const normalizedCarStudio = buildStructuredPromptSpec({
  ...DEFAULT_STATE,
  studioSection:"car",
  scene:"rangeRover",
  poseFamily:"relaxed",
  pose:"relaxed-close",
  carSeat:"driver-left"
});
assert.equal(normalizedCarStudio.scene.selected_pose.id, "car-driver-close", "The car studio must reject a retained generic pose");
assert.equal(normalizedCarStudio.scene.seat_position.id, "driver-left");

console.log("✓ structured JSON is clean, direct and keeps the driver-only car workflow");
