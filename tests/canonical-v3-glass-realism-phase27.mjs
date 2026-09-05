import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_NEGATIVE, CAR_EXTERIOR_SPEC, SCENES } from "../js/data.js";
import { buildOpenAIImagePrompt, describeGlassRealism } from "../js/canonical/openai-image-adapter.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const countWords = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;

function canonical(sceneId, night = false, preserveReference = true) {
  const exterior = sceneId === "carExterior";
  return {
    schema_version: "realistic-image-generator/canonical-v3",
    identity: { reference_mode: preserveReference ? "single_reference" : "none", preserve: preserveReference ? ["facial_structure", "skin_tone", "natural_asymmetry"] : [] },
    capture: { type: exterior ? "direct_front_camera_selfie" : "subject_held_driver_selfie", operator: "subject" },
    subjects: { count: 1, primary: { pose: exterior ? "door-open" : "driver-seated", expression: "neutral", clothing: { garment: exterior ? "clean white cotton thobe" : "white thobe", fabric: exterior ? "cotton" : null } } },
    scene: {
      id: sceneId,
      type: exterior ? "outdoor" : "vehicle",
      description: exterior ? SCENES.carExterior.environment : SCENES.rangeRover.environment,
      facts: exterior ? { carExteriorLocation: "villa", carExteriorPose: "door-open" } : {},
      vehicle: exterior ? null : { state: "stationary", year: 2017, make: "Land Rover", model: "Range Rover Sport Autobiography Dynamic" }
    },
    camera: { device_profile: "Xiaomi 15 Ultra front camera", camera_type: "front_camera", geometry: { distance_cm: 50, yaw_deg: 0, pitch_deg: -3, roll_deg: 2, focal_length_equivalent_mm: 21, crop: exterior ? "full body" : "close" } },
    lighting: { source_type: night ? "practical" : "daylight", description: night ? "night streetlight" : "soft daylight" },
    hard_constraints: {
      identity: { preserve_reference_identity: preserveReference },
      anatomy: { physically_possible: true, limb_ownership_integrity: true, contact_consistency: true, gravity_consistency: true, occlusion_consistency: true },
      selfie_geometry: { applicable: true, subject_operated_camera: true, phone_position_physically_reachable: true },
      capture_physics: { physically_possible_camera_position: true, physically_possible_operator: true, physically_possible_arm_reach: true, single_capture_event: true },
      vehicle_geometry: exterior ? { applicable: false } : { applicable: true, drive_configuration: "left_hand_drive", driver_position: "vehicle_left", steering_relation: "ahead_of_driver_torso" }
    }
  };
}

const dayExterior = canonical("carExterior", false);
const nightExterior = canonical("carExterior", true);
const interior = canonical("rangeRover", true, false);

assert.match(CAR_EXTERIOR_SPEC, /lightly tinted TRANSPARENT glass, never opaque black/iu);
assert.match(CAR_EXTERIOR_SPEC, /natural reflections and faint glimpses of the Ivory interior/iu);

for (const current of [dayExterior, nightExterior, interior]) {
  const before = JSON.stringify(current);
  const hardBefore = JSON.stringify(current.hard_constraints);
  const prompt = buildOpenAIImagePrompt(current);
  assert.match(prompt, /transparent|never opaque black/iu);
  assert.match(prompt, /reflection/iu);
  assert.ok(prompt.includes(describeGlassRealism(current)), `${current.scene.id}: exact glass layer missing`);
  assert.ok(countWords(prompt) <= 250, `${current.scene.id}: ${countWords(prompt)} words`);
  assert.equal(new Set(Array.from({ length: 10 }, () => buildOpenAIImagePrompt(current))).size, 1);
  assert.equal(JSON.stringify(current), before);
  assert.equal(JSON.stringify(current.hard_constraints), hardBefore);
}

assert.match(describeGlassRealism(dayExterior), /clear glass with a light factory tint/iu);
assert.match(describeGlassRealism(dayExterior), /Ivory headliner and seats are faintly visible/iu);
assert.match(describeGlassRealism(nightExterior), /dim view into the cabin instead of black panels/iu);
assert.match(describeGlassRealism(interior), /panoramic glass roof is transparent/iu);
assert.match(describeGlassRealism(interior), /actual sky or night stars/iu);
assert.match(describeGlassRealism(interior), /side windows show the real exterior with natural reflections/iu);

for (const negative of ["opaque black windows", "solid black glass", "blacked-out windows", "black panel roof"]) {
  assert.ok(BASE_NEGATIVE.includes(negative), `missing glass negative: ${negative}`);
}

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(full) : entry.name.endsWith(".js") ? [full] : [];
  });
}
for (const file of sourceFiles(path.join(root, "js"))) {
  assert.doesNotMatch(fs.readFileSync(file, "utf8"), /tinted rear glass/iu, `${path.relative(root, file)} retains forbidden glass wording`);
}

console.log(`PHASE27_EXTERIOR_WORDS=${countWords(buildOpenAIImagePrompt(dayExterior))}`);
console.log(`PHASE27_EXTERIOR_PROMPT=${buildOpenAIImagePrompt(dayExterior)}`);
console.log(`PHASE27_INTERIOR_WORDS=${countWords(buildOpenAIImagePrompt(interior))}`);
console.log(`PHASE27_INTERIOR_PROMPT=${buildOpenAIImagePrompt(interior)}`);
console.log("✓ Phase 27 transparent glass realism lock passed");
