import assert from "node:assert/strict";
import { BODY_PROFILE, BASE_NEGATIVE, BASE_SKIN_TEXTURE, ANATOMY_AND_CAPTURE_LOCK, SCENES } from "../js/data.js";
import { buildOpenAIImagePrompt, describeBodyAnatomy, describeSelfiePerspective, describeEnvironmentScale } from "../js/canonical/openai-image-adapter.js";
import { buildNegativePrompt } from "../js/prompt-engine.js";

const countWords = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;

function fixture(sceneId, { type = "outdoor", description = "an ordinary setting", crop = "upper body", clothing = "plain cotton shirt", capture = "direct_front_camera_selfie", preserveReference = true } = {}) {
  return {
    schema_version: "realistic-image-generator/canonical-v3",
    identity: { reference_mode: preserveReference ? "single_reference" : "none", preserve: preserveReference ? ["facial_structure", "head_shape", "skin_tone", "natural_asymmetry"] : [] },
    capture: { type: capture, operator: "subject" },
    subjects: { count: 1, primary: { pose: "relaxed upright", expression: "neutral", clothing: { garment: clothing, fabric: "cotton" }, body_scale: { preserve_environment_scale: true } } },
    scene: { id: sceneId, type, description, facts: sceneId === "carExterior" ? { carExteriorLocation: "villa", carExteriorPose: "door-open" } : {}, vehicle: type === "vehicle" ? { state: "stationary", year: 2017, make: "Land Rover", model: "Range Rover Sport" } : null },
    camera: { device_profile: "Xiaomi 15 Ultra front camera", camera_type: "front_camera", geometry: { distance_cm: 50, yaw_deg: 0, pitch_deg: 0, roll_deg: 2, focal_length_equivalent_mm: 21, crop } },
    lighting: { source_type: "daylight", description: "soft natural daylight" },
    hard_constraints: {
      identity: { preserve_reference_identity: preserveReference },
      anatomy: { physically_possible: true, limb_ownership_integrity: true, contact_consistency: true, gravity_consistency: true, occlusion_consistency: true },
      selfie_geometry: { applicable: true, subject_operated_camera: true, phone_position_physically_reachable: true },
      capture_physics: { physically_possible_camera_position: true, physically_possible_operator: true, physically_possible_arm_reach: true, single_capture_event: true },
      vehicle_geometry: type === "vehicle" ? { applicable: true, drive_configuration: "left_hand_drive", driver_position: "vehicle_left", steering_relation: "ahead_of_driver_torso" } : { applicable: false }
    }
  };
}

assert.deepEqual(BODY_PROFILE, {
  height_cm: 195, weight_kg: 88, bmi: 23.1, build: "lean-athletic",
  frame: "tall skeletal with medium-to-moderate shoulder breadth",
  mass_distribution: "ribcage, shoulders, arms, glutes, thighs, calves"
});
assert.equal(BASE_SKIN_TEXTURE.length, 13);
assert.doesNotMatch(BASE_SKIN_TEXTURE.join(" "), /183|82 kg/u);
assert.doesNotMatch(ANATOMY_AND_CAPTURE_LOCK, /183|82 kg/u);

const carExterior = fixture("carExterior", { description: SCENES.carExterior.environment, crop: "full body", clothing: "clean white cotton thobe" });
const carInterior = fixture("rangeRover", { type: "vehicle", description: "inside a stationary Range Rover", crop: "close", clothing: "plain black cotton T-shirt", capture: "subject_held_driver_selfie", preserveReference: false });
const rooftop = fixture("rooftop", { description: SCENES.rooftop.environment, crop: "three quarter", clothing: "crisp white Saudi thobe" });
const street = fixture("street", { description: SCENES.street.environment });
const barbershop = fixture("barbershop", { type: "room", description: SCENES.barbershop.environment });

for (const canonical of [carExterior, carInterior, rooftop, street, barbershop]) {
  const before = JSON.stringify(canonical);
  const hardBefore = JSON.stringify(canonical.hard_constraints);
  const prompt = buildOpenAIImagePrompt(canonical);
  assert.match(prompt, /195 cm/u);
  assert.match(prompt, /88 kg/u);
  assert.match(prompt, /lean-athletic/u);
  assert.doesNotMatch(prompt, /183|82 kg/u);
  assert.match(prompt, /shoulders visibly wider than the waist|chest with subtle deltoid roundness/iu);
  assert.match(prompt, /long proportional limbs with filled-not-thin arms/iu);
  assert.match(prompt, /near eye level at 45[–-]60 cm/iu);
  assert.ok(countWords(prompt) <= 250, `${canonical.scene.id}: ${countWords(prompt)} words`);
  const identityIndex = prompt.indexOf("The primary subject preserves");
  const bodyIndex = prompt.indexOf("Tall 195 cm");
  const perspectiveIndex = prompt.indexOf("Camera near eye level");
  const environmentIndex = describeEnvironmentScale(canonical) ? prompt.indexOf(describeEnvironmentScale(canonical)) : perspectiveIndex;
  const clothingIndex = prompt.indexOf("wearing ");
  const sceneNeedle = canonical.scene.id === "carExterior" ? "Range Rover Sport Autobiography Dynamic" : canonical.scene.id === "rangeRover" ? "Inside stationary 2017 Range Rover" : canonical.scene.description;
  const sceneIndex = prompt.indexOf(sceneNeedle);
  const lightingIndex = Math.max(prompt.lastIndexOf("Lighting uses "), prompt.lastIndexOf("Lighting follows "));
  if (identityIndex >= 0) assert.ok(identityIndex < bodyIndex, `${canonical.scene.id}: identity must precede body`);
  assert.ok(bodyIndex < perspectiveIndex && perspectiveIndex <= environmentIndex, `${canonical.scene.id}: body authority order drifted`);
  if (clothingIndex >= 0) assert.ok(environmentIndex < clothingIndex, `${canonical.scene.id}: body/environment must precede clothing`);
  assert.ok(sceneIndex >= 0 && (clothingIndex < 0 || clothingIndex < sceneIndex), `${canonical.scene.id}: clothing must precede scene`);
  assert.ok(lightingIndex > sceneIndex, `${canonical.scene.id}: lighting must follow scene`);
  assert.equal(new Set(Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical))).size, 1);
  assert.equal(JSON.stringify(canonical), before);
  assert.equal(JSON.stringify(canonical.hard_constraints), hardBefore);
}

assert.match(describeBodyAnatomy(carExterior), /No facial alteration\/lengthening/iu);
assert.match(describeSelfiePerspective(carExterior), /near eye level at 45[–-]60 cm/iu);
assert.match(describeEnvironmentScale(carExterior), /roofline, door frame, and handle/iu);
assert.match(describeEnvironmentScale(carInterior), /seatback.*headliner.*steering wheel/iu);
assert.match(describeEnvironmentScale(rooftop), /perimeter wall height/iu);
assert.match(describeEnvironmentScale(street), /above average-height people/iu);
assert.equal(describeEnvironmentScale(barbershop), "");

const negative = buildNegativePrompt({});
const requiredNegatives = ["short-looking body proportions", "skinny frame", "narrow skeletal frame", "pencil-thin arms", "thin neck", "collapsed chest", "oversized head relative to body", "large-head-small-body proportions", "compressed torso", "fashion-model thinness", "bodybuilder bulk", "camera-induced shoulder narrowing", "camera-induced height compression"];
assert.ok(requiredNegatives.filter((item) => negative.includes(item)).length >= 6);
assert.ok(requiredNegatives.every((item) => BASE_NEGATIVE.includes(item)));

console.log(`PHASE26_CAR_EXTERIOR_WORDS=${countWords(buildOpenAIImagePrompt(carExterior))}`);
console.log(`PHASE26_CAR_EXTERIOR_PROMPT=${buildOpenAIImagePrompt(carExterior)}`);
console.log(`PHASE26_CAR_INTERIOR_WORDS=${countWords(buildOpenAIImagePrompt(carInterior))}`);
console.log(`PHASE26_CAR_INTERIOR_PROMPT=${buildOpenAIImagePrompt(carInterior)}`);
console.log(`PHASE26_ROOFTOP_WORDS=${countWords(buildOpenAIImagePrompt(rooftop))}`);
console.log(`PHASE26_ROOFTOP_PROMPT=${buildOpenAIImagePrompt(rooftop)}`);
console.log("✓ Phase 26 body anatomy authority passed");
