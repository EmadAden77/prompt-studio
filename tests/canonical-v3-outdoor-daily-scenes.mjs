import assert from "node:assert/strict";
import {
  SCENES, LIGHTING_OPTIONS, ROOFTOP_MOODS, STREET_FOOTBALL_MOODS, GAS_STATION_MOODS
} from "../js/data.js";
import { buildOpenAIImagePrompt, describePlaceRealism, describeSaudiStreetRealism } from "../js/canonical/openai-image-adapter.js";

const forbidden = /\b(?:landmark|tower|monument|kingdom|faisaliah|ramadan|fanous|lantern|crescent)\b|mosque\s+minaret/iu;
const namedHumanLife = /(?:blurred|soft-focus|soft|distant)\s+(?:worker|barber|cashier|shopkeeper|attendant|player)\b/iu;
const wordCount = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;

function canonicalFor(sceneId, period = "night") {
  const config = SCENES[sceneId];
  const light = LIGHTING_OPTIONS[sceneId][period][0];
  const mood = sceneId === "rooftop" ? "sunset" : sceneId === "streetFootball" ? "playing" : "fueling";
  return {
    schema_version: "realistic-image-generator/canonical-v3",
    identity: { reference_mode: "none", preserve: [] },
    capture: { type: "third_person", operator: "photographer" },
    subjects: { count: 1, primary: { pose: "relaxed standing", expression: "natural", clothing: { garment: config.clothing[0].text, fabric: "natural fabric" }, body_scale: { preserve_environment_scale: true } } },
    scene: { id: sceneId, type: "outdoor", description: config.environment, facts: { mood } },
    camera: { device_profile: "Xiaomi 15 Ultra real camera", camera_type: "rear_camera", geometry: { distance_cm: 130, crop: "half" } },
    lighting: { source_type: period === "day" ? "daylight" : "practical", description: light.text, direction: "side light", intensity: "moderate" },
    hard_constraints: {
      identity: { preserve_reference_identity: false },
      anatomy: { physically_possible: true, limb_ownership_integrity: true, contact_consistency: true, gravity_consistency: true, occlusion_consistency: true },
      capture_physics: { physically_possible_camera_position: true, physically_possible_operator: true, single_capture_event: true }
    },
    preferences: { realism: "documentary", imperfection_level: "natural" }
  };
}

assert.equal(SCENES.rooftop.label, "سطح المنزل");
assert.equal(SCENES.streetFootball.label, "ملعب حارة");
assert.equal(SCENES.gasStation.label, "محطة وقود");
for (const id of ["rooftop", "streetFootball", "gasStation"]) assert.equal(SCENES[id].clothing.length, 6, `${id}: six clothing options required`);
assert.deepEqual(LIGHTING_OPTIONS.rooftop.day.map(x => x.value), ["clear-noon-sun", "late-afternoon-gold"]);
assert.deepEqual(LIGHTING_OPTIONS.rooftop.night.map(x => x.value), ["distant-city-glow", "rooftop-practical-city"]);
assert.deepEqual(LIGHTING_OPTIONS.streetFootball.day.map(x => x.value), ["overhead-sun", "open-shade"]);
assert.deepEqual(LIGHTING_OPTIONS.streetFootball.night.map(x => x.value), ["floodlights", "floodlights-streetlight"]);
assert.deepEqual(LIGHTING_OPTIONS.gasStation.day.map(x => x.value), ["canopy-shade-sun", "overcast-soft-light"]);
assert.deepEqual(LIGHTING_OPTIONS.gasStation.night.map(x => x.value), ["bright-canopy-leds", "canopy-store-glow"]);
assert.deepEqual(ROOFTOP_MOODS.map(x => x.value), ["sunset", "night-chat", "morning-coffee"]);
assert.deepEqual(STREET_FOOTBALL_MOODS.map(x => x.value), ["playing", "resting", "post-game"]);
assert.deepEqual(GAS_STATION_MOODS.map(x => x.value), ["fueling", "convenience", "night-stop"]);

for (const sceneId of ["rooftop", "streetFootball", "gasStation"]) {
  for (const period of ["day", "night"]) {
    const canonical = canonicalFor(sceneId, period);
    const before = JSON.stringify(canonical);
    const hardBefore = JSON.stringify(canonical.hard_constraints);
    const place = describePlaceRealism(canonical);
    const prompt = buildOpenAIImagePrompt(canonical);
    assert.equal(JSON.stringify(canonical), before, `${sceneId}/${period}: canonical mutated`);
    assert.equal(JSON.stringify(canonical.hard_constraints), hardBefore, `${sceneId}/${period}: hard constraints mutated`);
    assert.equal(describeSaudiStreetRealism(canonical), "", `${sceneId}/${period}: Saudi street fallback must be suppressed`);
    assert.equal(forbidden.test(prompt), false, `${sceneId}/${period}: forbidden landmark/Ramadan wording`);
    assert.equal(namedHumanLife.test(place), false, `${sceneId}/${period}: named soft-life role found`);
    assert.match(place, /(?:distant|blurred|soft)/iu, `${sceneId}/${period}: soft-life signal missing`);
    assert.ok(wordCount(prompt) <= 250, `${sceneId}/${period}: ${wordCount(prompt)} words`);
    assert.ok(Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical)).every(v => v === prompt), `${sceneId}/${period}: determinism failed`);
  }
}

const rooftop = buildOpenAIImagePrompt(canonicalFor("rooftop"));
assert.match(rooftop, /water tanks/iu);
assert.match(rooftop, /satellite dishes/iu);
const football = buildOpenAIImagePrompt(canonicalFor("streetFootball"));
assert.match(football, /artificial turf/iu);
assert.match(football, /chain-link/iu);
const gas = buildOpenAIImagePrompt(canonicalFor("gasStation"));
assert.match(gas, /fuel pump/iu);
assert.match(gas, /canopy/iu);

console.log(`PHASE20_ROOFTOP_WORDS=${wordCount(rooftop)}`);
console.log(`PHASE20_ROOFTOP_PROMPT=${rooftop}`);
console.log("✓ Phase 20 Saudi outdoor daily-scene contracts passed");
