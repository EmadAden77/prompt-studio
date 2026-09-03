import assert from "node:assert/strict";
import {
  DEFAULT_STATE,
  buildPromptPack,
  buildStructuredPromptSpec,
  getBackgroundVisibility,
  getCarSeatOptions,
  getClothingOptions,
  getCompatibleBedroomWindowOptions,
  getCompositionOptions,
  getHairOptions,
  getLightingOptions,
  getPoseFamilyOptions,
  getPoseOptions,
  getSelfieAngleOptions,
  isBedroomScene,
  isCarScene,
  isCustomScene,
  isTextRoomReference,
  normalizeState
} from "../js/physics-prompt-engine-v5.js";

assert.equal(DEFAULT_STATE.mode, "selfie");
assert.equal(isBedroomScene("my_bedroom_text"), true);
assert.equal(isCarScene("rangeRover"), true);
assert.equal(isCustomScene("custom"), true);
assert.equal(isBedroomScene("custom"), false, "Custom scene must never inherit bedroom behavior from sceneFamily fallback");
assert.equal(isTextRoomReference("my_bedroom_text"), true);

const bedroomFamilies = getPoseFamilyOptions("my_bedroom_text").map((item) => item.value);
assert.ok(bedroomFamilies.includes("lying"));
assert.ok(bedroomFamilies.includes("seated"));
assert.ok(getPoseOptions("my_bedroom_text", "lying").length >= 10);
assert.ok(getHairOptions().length >= 15);
assert.ok(getClothingOptions("rangeRover").length >= 15);
for (const pose of getPoseOptions("my_bedroom_text", "lying")) {
  assert.ok(getSelfieAngleOptions(pose.value).length > 0);
  assert.ok(getCompositionOptions(pose.value).length > 0);
}

const incompatibleWindow = normalizeState({
  ...DEFAULT_STATE,
  scene:"my_bedroom_text",
  time:"day",
  lighting:"day-direct-sun",
  bedroomWindow:"day-charcoal-closed"
});
assert.notEqual(incompatibleWindow.bedroomWindow, "day-charcoal-closed");
assert.ok(getCompatibleBedroomWindowOptions("day", "day-direct-sun").some((item) => item.value === incompatibleWindow.bedroomWindow));

const bedroom = normalizeState({
  ...DEFAULT_STATE,
  studioSection:"bedroom",
  scene:"my_bedroom_text",
  carSeat:"driver-left",
  poseFamily:"lying",
  pose:"lying-right-close",
  time:"night",
  lighting:"night-bedside-3000"
});
assert.equal(bedroom.carSeat, "", "Car seat must be erased outside car scenes");
assert.equal(getBackgroundVisibility(bedroom), "none");
const bedroomSpec = buildStructuredPromptSpec(bedroom);
assert.equal(bedroomSpec.scene.vehicle_geometry, null);
assert.match(bedroomSpec.authority.scene.description, /bed occupies the left side/u, "Text-room topology must survive canonical JSON");
assert.match(bedroomSpec.authority.scene.supporting_details, /BEDROOM TOPOLOGY LOCK/u);

const activeCar = normalizeState({
  ...DEFAULT_STATE,
  studioSection:"car",
  scene:"rangeRover",
  poseFamily:"relaxed",
  pose:"relaxed-close",
  carSeat:"passenger-front-right",
  time:"day",
  lighting:"car-day-window",
  clothing:"thobe-white",
  selfieAngle:"three-quarter",
  composition:"close"
});
assert.equal(activeCar.poseFamily, "car");
assert.equal(activeCar.pose, "car-driver-close");
assert.equal(activeCar.carSeat, "driver-left");
assert.deepEqual(getCarSeatOptions("rangeRover", "car-driver-close").map((item) => item.value), ["driver-left"]);

const carSpec = buildStructuredPromptSpec(activeCar, { wikiPromptGuidance:"ordinary candid smartphone realism" });
assert.equal(carSpec.task.capture_type, "subject_held_driver_selfie");
assert.equal(carSpec.task.input_contract, "json_only");
assert.equal(carSpec.authority.policy, "single_authority_per_field");
assert.equal(carSpec.scene.vehicle_geometry.drive_configuration, "left_hand_drive");
assert.equal(carSpec.scene.vehicle_geometry.mirror_state, "unmirrored");
assert.equal(carSpec.scene.vehicle_geometry.occupant_seat, "driver-left");
assert.match(carSpec.scene.vehicle_geometry.spatial_relations.steering_wheel, /ahead of the driver torso/u);
assert.match(carSpec.scene.vehicle_geometry.spatial_relations.center_console, /physical right/u);
assert.match(carSpec.scene.vehicle_geometry.spatial_relations.driver_door_and_window, /physical left/u);
assert.match(carSpec.scene.vehicle_geometry.spatial_relations.projection_rule, /not image-left\/image-right placement/iu);
assert.match(carSpec.scene.vehicle_geometry.visual_evidence_policy, /Do not force a complete steering wheel/u);
assert.equal(typeof carSpec.photography.camera_geometry.camera_to_face_distance_cm, "number");
assert.equal(carSpec.generator.wiki_prompt_calibration.override_permission, false);
const carJson = JSON.stringify(carSpec);
assert.doesNotMatch(carJson, /mandatory.*steering/iu);
assert.doesNotMatch(carJson, /right_hand_drive/iu);
assert.ok(!("positive" in carSpec));
assert.ok(!("negative" in carSpec));
assert.ok(!("qa" in carSpec));

const custom = normalizeState({
  ...DEFAULT_STATE,
  studioSection:"custom",
  scene:"custom",
  customScene:"inside a modern medical optical store in Saudi Arabia",
  customSceneDetails:"eyeglass display racks and one small mirror",
  poseFamily:"relaxed",
  pose:"custom-relaxed-close",
  time:"day",
  lighting:"custom-day-auto-practical",
  clothing:"tee-black"
});
assert.equal(custom.bedroomWindow, "", "Bedroom window must not leak into custom scene");
assert.equal(getBackgroundVisibility(custom), "conditional");
const customSpec = buildStructuredPromptSpec(custom);
assert.equal(customSpec.authority.scene.id, "custom");
assert.match(customSpec.authority.scene.description, /optical store/u);
assert.match(customSpec.authority.scene.supporting_details, /eyeglass display racks/u);
assert.equal(customSpec.scene.vehicle_geometry, null);

const groupSpec = buildStructuredPromptSpec({
  ...DEFAULT_STATE,
  studioSection:"group",
  groupMode:"group",
  groupCount:"4",
  cameraHolder:"A",
  groupArrangement:"mixed-depth",
  groupInteraction:"friends",
  scene:"street",
  poseFamily:"street",
  pose:"street-standing",
  time:"day",
  lighting:"street-day-open-shade",
  clothing:"tee-black"
});
assert.equal(groupSpec.task.capture_type, "subject_held_group_selfie");
assert.equal(groupSpec.subject.group.count, 4);
assert.equal(groupSpec.subject.group.camera_holder, "A");
assert.match(groupSpec.subject.group.identity_policy, /Never clone, blend or transfer/u);
assert.match(groupSpec.subject.group.anatomy_policy, /belongs to exactly one person/u);

const accidentalSpec = buildStructuredPromptSpec({
  ...DEFAULT_STATE,
  studioSection:"accidental",
  captureMode:"accidental",
  accidentalDevice:"iphone",
  accidentalTrigger:"pocket",
  accidentalPhonePosition:"rising",
  accidentalMotion:"subtle",
  accidentalTilt:"right",
  accidentalFocus:"transition-face",
  accidentalExposure:"auto-imperfect",
  accidentalIntensity:"natural",
  scene:"bedroom",
  poseFamily:"relaxed",
  pose:"relaxed-close",
  time:"day",
  lighting:"day-soft-window",
  clothing:"tee-black"
});
assert.equal(accidentalSpec.task.capture_type, "accidental_subject_held_front_camera_capture");
assert.equal(accidentalSpec.photography.device, "iPhone 15 Pro Max front camera");
assert.equal(accidentalSpec.photography.selected_angle, null, "Deliberate selfie angle must not compete with accidental-event geometry");
assert.equal(accidentalSpec.photography.selected_shot_type, null);
assert.equal(accidentalSpec.photography.camera_geometry.authority, "accidental_capture_event");
assert.match(accidentalSpec.photography.camera_geometry.rule, /sole composition and camera-behavior authority/u);

const pack = buildPromptPack(activeCar);
assert.match(pack.positive, /\[VEHICLE GEOMETRY\]/u);
assert.doesNotMatch(pack.positive, /mandatory thin steering-wheel/iu);
assert.match(pack.negative, /right-hand-drive conversion/u);

console.log("✓ canonical prompt engine catalogs and compatibility passed");
console.log("✓ scene isolation, LHD driver mapping, group and accidental capture contracts passed");
