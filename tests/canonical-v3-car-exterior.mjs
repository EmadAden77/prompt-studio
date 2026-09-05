import assert from "node:assert/strict";
import { SCENES, LIGHTING_OPTIONS, CAR_EXTERIOR_LOCATIONS, CAR_EXTERIOR_POSES } from "../js/data.js";
import { buildOpenAIImagePrompt, describeCarExterior, describeCarExteriorRealism, describeSaudiStreetRealism } from "../js/canonical/openai-image-adapter.js";

const forbidden = /\b(?:landmark|tower|monument|kingdom|faisaliah|ramadan|fanous|lantern|crescent)\b|mosque\s+minaret/iu;
const wordCount = (v) => String(v ?? "").trim().split(/\s+/u).filter(Boolean).length;

function canonicalFor(period = "day", pose = "door-lean", location = "villa", damp = false) {
  const light = LIGHTING_OPTIONS.carExterior[period][0];
  return {
    schema_version: "realistic-image-generator/canonical-v3",
    identity: { reference_mode: "single_reference", preserve: ["facial_structure", "skin_tone", "natural_asymmetry"] },
    capture: { type: "direct_front_camera_selfie", operator: "subject" },
    subjects: { count: 1, primary: { pose: "natural exterior selfie", expression: "neutral", clothing: { garment: SCENES.carExterior.clothing[0].text, fabric: "cotton" } } },
    scene: { id: "carExterior", type: "outdoor", description: SCENES.carExterior.environment, facts: { carExteriorPose: pose, carExteriorLocation: location, ...(damp ? { surface: "damp ground" } : {}) } },
    camera: { device_profile: "Xiaomi 15 Ultra real camera", camera_type: "front_camera", geometry: { distance_cm: 48, yaw_deg: 4, pitch_deg: -2, roll_deg: 2, focal_length_equivalent_mm: 21, crop: "close" } },
    lighting: { source_type: period === "day" ? "daylight" : "practical", description: light.text, direction: "side light", intensity: "moderate" },
    hard_constraints: {
      identity: { preserve_reference_identity: true },
      anatomy: { physically_possible: true, limb_ownership_integrity: true, contact_consistency: true, gravity_consistency: true, occlusion_consistency: true },
      capture_physics: { physically_possible_camera_position: true, physically_possible_operator: true, single_capture_event: true }
    },
    preferences: { realism: "documentary", imperfection_level: "natural" }
  };
}

assert.equal(SCENES.carExterior.label, "سيلفي بجانب السيارة");
assert.equal(CAR_EXTERIOR_LOCATIONS.length, 6);
assert.equal(CAR_EXTERIOR_POSES.length, 8);
assert.deepEqual(LIGHTING_OPTIONS.carExterior.day.map(x => x.value), ["harsh-noon", "golden-low", "overcast-soft"]);
assert.deepEqual(LIGHTING_OPTIONS.carExterior.night.map(x => x.value), ["streetlight-reflection", "villa-porch", "interior-spill", "drl-on"]);

for (const [period, pose, location, damp] of [["day", "front-fender", "villa", false], ["night", "door-open", "parking", true]]) {
  const canonical = canonicalFor(period, pose, location, damp);
  const before = JSON.stringify(canonical);
  const hardBefore = JSON.stringify(canonical.hard_constraints);
  const exterior = describeCarExterior(canonical);
  const realism = describeCarExteriorRealism(canonical);
  const prompt = buildOpenAIImagePrompt(canonical);

  assert.equal(JSON.stringify(canonical), before, `${period}: canonical mutated`);
  assert.equal(JSON.stringify(canonical.hard_constraints), hardBefore, `${period}: hard constraints mutated`);
  assert.equal(describeSaudiStreetRealism(canonical), "", `${period}: Saudi street fallback leaked`);
  assert.match(prompt, /Fuji White/iu);
  assert.match(prompt, /Autobiography Dynamic/iu);
  assert.match(prompt, /quad rectangular exhaust tips/iu);
  assert.match(prompt, /contact shadow/iu);
  assert.match(prompt, /reflection/iu);
  assert.match(prompt, /never legible/iu);
  assert.equal(forbidden.test(prompt), false, `${period}: forbidden wording`);
  assert.ok(wordCount(prompt) <= 250, `${period}: ${wordCount(prompt)} words`);
  assert.ok(Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical)).every(v => v === prompt), `${period}: determinism failed`);
  assert.match(exterior, /never legible/iu);
  assert.match(realism, /contact shadow/iu);
}

const closed = buildOpenAIImagePrompt(canonicalFor("day", "door-lean", "villa"));
assert.doesNotMatch(closed, /Ivory perforated leather/iu, "interior facts leaked into closed-door pose");
const openNight = buildOpenAIImagePrompt(canonicalFor("night", "door-open", "villa"));
assert.match(openNight, /Ivory perforated leather/iu);
assert.match(openNight, /black-and-Ivory wheel/iu);
assert.match(openNight, /interior light spilling at night/iu);

console.log(`PHASE21_DAY_WORDS=${wordCount(closed)}`);
console.log(`PHASE21_DAY_PROMPT=${closed}`);
console.log(`PHASE21_NIGHT_WORDS=${wordCount(openNight)}`);
console.log(`PHASE21_NIGHT_PROMPT=${openNight}`);
console.log("✓ Phase 21 exterior Range Rover realism contracts passed");
