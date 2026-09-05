import assert from "node:assert/strict";
import { SCENES, LIGHTING_OPTIONS, BARBERSHOP_MOODS, GROCERY_MOODS } from "../js/data.js";
import { buildOpenAIImagePrompt, describePlaceRealism, describeSaudiStreetRealism } from "../js/canonical/openai-image-adapter.js";

const forbidden = /\b(?:landmark|tower|monument|kingdom|faisaliah|ramadan|fanous|lantern|crescent)\b|mosque\s+minaret/iu;
const namedHumanLife = /(?:blurred|soft|distant)\s+(?:worker|barber|cashier|shopkeeper|attendant)\b/iu;
const wordCount = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;

function canonicalFor(sceneId, period = "night") {
  const config = SCENES[sceneId];
  const light = LIGHTING_OPTIONS[sceneId][period][0];
  return {
    schema_version: "realistic-image-generator/canonical-v3",
    identity: { reference_mode: "none", preserve: [] },
    capture: { type: "third_person", operator: "photographer" },
    subjects: { count: 1, primary: { pose: "relaxed standing", expression: "natural", clothing: { garment: config.clothing[0].text, fabric: "natural fabric" }, body_scale: { preserve_environment_scale: true } } },
    scene: { id: sceneId, type: "room", room: { description: config.environment }, facts: { mood: sceneId === "barbershop" ? "fresh-cut" : "quick-stop" } },
    camera: { device_profile: "Xiaomi 15 Ultra real camera", camera_type: "rear_camera", geometry: { distance_cm: 120, crop: "half" } },
    lighting: { source_type: period === "day" ? "daylight" : "practical", description: light.text, direction: "soft overhead light", intensity: "moderate" },
    hard_constraints: {
      identity: { preserve_reference_identity: false },
      anatomy: { physically_possible: true, limb_ownership_integrity: true, contact_consistency: true, gravity_consistency: true, occlusion_consistency: true },
      capture_physics: { physically_possible_camera_position: true, physically_possible_operator: true, single_capture_event: true }
    },
    preferences: { realism: "documentary", imperfection_level: "natural" }
  };
}

assert.equal(SCENES.barbershop.label, "صالون حلاقة سعودي");
assert.equal(SCENES.grocery.label, "بقالة سعودية");
assert.equal(SCENES.barbershop.clothing.length, 6);
assert.equal(SCENES.grocery.clothing.length, 7);
assert.deepEqual(LIGHTING_OPTIONS.barbershop.day.map(x => x.value), ["overhead-led", "window-daylight"]);
assert.deepEqual(LIGHTING_OPTIONS.barbershop.night.map(x => x.value), ["overhead-fluorescent", "mixed-warm-fixtures"]);
assert.deepEqual(LIGHTING_OPTIONS.grocery.day.map(x => x.value), ["ceiling-fluorescent", "window-interior"]);
assert.deepEqual(LIGHTING_OPTIONS.grocery.night.map(x => x.value), ["cooler-warm-counter", "fluorescent-only"]);
assert.deepEqual(BARBERSHOP_MOODS.map(x => x.value), ["fresh-cut", "waiting", "styling"]);
assert.deepEqual(GROCERY_MOODS.map(x => x.value), ["quick-stop", "browsing", "paying"]);

for (const sceneId of ["barbershop", "grocery"]) {
  for (const period of ["day", "night"]) {
    const canonical = canonicalFor(sceneId, period);
    const before = JSON.stringify(canonical);
    const hardBefore = JSON.stringify(canonical.hard_constraints);
    const prompt = buildOpenAIImagePrompt(canonical);
    const place = describePlaceRealism(canonical);
    assert.equal(JSON.stringify(canonical), before, `${sceneId}/${period}: canonical mutated`);
    assert.equal(JSON.stringify(canonical.hard_constraints), hardBefore, `${sceneId}/${period}: hard constraints mutated`);
    assert.equal(describeSaudiStreetRealism(canonical), "", `${sceneId}/${period}: street realism must be suppressed`);
    assert.equal(forbidden.test(prompt), false, `${sceneId}/${period}: forbidden landmark/Ramadan word`);
    assert.equal(namedHumanLife.test(place), false, `${sceneId}/${period}: soft life contains a named human role`);
    assert.equal(/tea glass held by/iu.test(prompt), false);
    assert.match(place, /(?:blurred|soft focus|background)/iu, `${sceneId}/${period}: soft life missing`);
    assert.ok(wordCount(prompt) <= 250, `${sceneId}/${period}: ${wordCount(prompt)} words`);
    assert.ok(Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical)).every(v => v === prompt), `${sceneId}/${period}: determinism failed`);
  }
}

const barbershop = buildOpenAIImagePrompt(canonicalFor("barbershop"));
assert.match(barbershop, /hair clippings/iu);
assert.match(barbershop, /mirror/iu);
const grocery = buildOpenAIImagePrompt(canonicalFor("grocery"));
assert.match(grocery, /date boxes/iu);
assert.match(grocery, /beverage cooler/iu);

console.log(`PHASE19_BARBERSHOP_WORDS=${wordCount(barbershop)}`);
console.log(`PHASE19_BARBERSHOP_PROMPT=${barbershop}`);
console.log("✓ Phase 19 Saudi indoor daily-scene contracts passed");
