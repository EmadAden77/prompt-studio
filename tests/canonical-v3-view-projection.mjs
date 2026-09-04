import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import { buildOpenAIImagePrompt, describeVehicleViewProjection } from "../js/canonical/openai-image-adapter.js";

const GOLDEN_URL = new URL("./golden/current-engine/legacy-v2-semantic-goldens.json", import.meta.url);
const golden = JSON.parse(fs.readFileSync(fileURLToPath(GOLDEN_URL), "utf8"));
const IDS = ["car_lhd_driver_selfie","car_tight_crop","bedroom_direct_selfie","mirror_selfie","group_selfie","accidental_capture","identity_and_eyewear"];

const RIGHT = "In the frame, the driver's door and side window appear on the right side of the image, the center console on the left side of the image, and the steering wheel rim enters the bottom of the frame directly ahead of his torso.";
const LEFT = "In the frame, the driver's door and side window appear on the left side of the image, the center console on the right side of the image, and the steering wheel rim enters the bottom of the frame directly ahead of his torso.";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const count = (value, needle) => String(value).split(needle).length - 1;

const baseCar = buildCanonicalV3({ intentType:"car", scene:"rangeRover", hasReference:true, pose:"relaxed-close", time:"day", lighting:"car-day-window", composition:"close" });
assert.equal(describeVehicleViewProjection(baseCar, "photographic"), RIGHT, "LHD photographic must map door/window to frame right");
assert.equal(describeVehicleViewProjection(baseCar), RIGHT, "photographic must be the default convention");
assert.equal(describeVehicleViewProjection(baseCar, "mirror_preview"), LEFT, "LHD mirror preview must map door/window to frame left");

const makeRhd = (canonical) => {
  const clone = structuredClone(canonical);
  clone.hard_constraints.vehicle_geometry.drive_configuration = "right_hand_drive";
  clone.hard_constraints.vehicle_geometry.driver_position = "vehicle_right";
  clone.hard_constraints.vehicle_geometry.console_relation = "driver_physical_left";
  clone.hard_constraints.vehicle_geometry.door_window_relation = "driver_physical_right";
  return clone;
};
const rhd = makeRhd(baseCar);
assert.equal(describeVehicleViewProjection(rhd, "photographic"), LEFT, "RHD photographic must flip the anchors");
assert.equal(describeVehicleViewProjection(rhd, "mirror_preview"), RIGHT, "RHD mirror preview must flip the anchors again");

const room = buildCanonicalV3({ intentType:"room", scene:"bedroom", time:"day", lighting:"day-soft-window" });
assert.equal(describeVehicleViewProjection(room), "", "non-vehicle scenes must skip projection");

const nonDriverVehicle = structuredClone(baseCar);
nonDriverVehicle.capture.type = "third_person";
assert.equal(describeVehicleViewProjection(nonDriverVehicle), "", "non-driver vehicle captures must skip projection");

for (const id of IDS) {
  const canonical = buildCanonicalV3(structuredClone(golden.cases[id].input));
  const before = {
    canonical: JSON.stringify(canonical),
    hard: JSON.stringify(canonical.hard_constraints),
    authorities: JSON.stringify(canonical.authorities)
  };
  const prompt = buildOpenAIImagePrompt(canonical);
  assert.equal(JSON.stringify(canonical), before.canonical, `${id}: canonical mutated`);
  assert.equal(JSON.stringify(canonical.hard_constraints), before.hard, `${id}: hard constraints mutated`);
  assert.equal(JSON.stringify(canonical.authorities), before.authorities, `${id}: authorities mutated`);
  assert.equal(Object.isFrozen(canonical.hard_constraints), true, `${id}: hard constraints must remain frozen`);
  assert.ok(words(prompt) <= 250, `${id}: prompt exceeds 250 words (${words(prompt)})`);
  const repeated = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical));
  assert.equal(repeated.every((value) => value === repeated[0]), true, `${id}: determinism failed`);
}

const goldenCar = buildCanonicalV3(structuredClone(golden.cases.car_lhd_driver_selfie.input));
const defaultPrompt = buildOpenAIImagePrompt(goldenCar);
const mirroredPrompt = buildOpenAIImagePrompt(goldenCar, { mirrorConvention: "mirror_preview" });
assert.equal(count(defaultPrompt, RIGHT), 1, "default photographic anchor must appear exactly once");
assert.equal(count(defaultPrompt, LEFT), 0, "default photographic prompt must not include mirrored anchor");
assert.equal(count(mirroredPrompt, LEFT), 1, "mirror preview anchor must appear exactly once");
assert.equal(count(mirroredPrompt, RIGHT), 0, "mirror preview prompt must not include photographic anchor");
assert.equal(/center console is at the driver's physical/iu.test(defaultPrompt), false, "console relation must not be duplicated in vehicle-relative sentence");
assert.equal(/driver door\/window is at the driver's physical/iu.test(defaultPrompt), false, "door relation must not be duplicated in vehicle-relative sentence");

console.log("✓ canonical-v3 deterministic vehicle view projection contract passed");
