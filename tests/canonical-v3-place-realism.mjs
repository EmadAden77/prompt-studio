import assert from "node:assert/strict";
import { SCENES, LIGHTING_OPTIONS, MAJLIS_MOODS, KASHTA_MOODS } from "../js/data.js";
import { buildOpenAIImagePrompt, describePlaceRealism, describeSaudiStreetRealism } from "../js/canonical/openai-image-adapter.js";

const wordCount = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const hardConstraints = () => ({
  anatomy: { physically_possible: true, limb_ownership_integrity: true, contact_consistency: true, gravity_consistency: true, occlusion_consistency: true },
  capture_physics: { physically_possible_camera_position: true, physically_possible_operator: true, single_capture_event: true }
});

function canonicalFor(sceneId, period = "night") {
  const isDay = period === "day";
  const config = SCENES[sceneId];
  const light = LIGHTING_OPTIONS[sceneId][period][0];
  return {
    schema_version: "realistic-image-generator/canonical-v3",
    identity: { reference_mode: "none", preserve: [] },
    capture: { type: "third_person", operator: "photographer" },
    subjects: { count: 1, primary: { pose: "relaxed seated", expression: "natural", clothing: { garment: sceneId === "majlis" ? "white Saudi thobe" : "heavy hoodie with dark jeans", fabric: "natural fabric" }, body_scale: { preserve_environment_scale: true } } },
    scene: sceneId === "majlis"
      ? { id: "majlis", type: "room", room: { description: config.environment }, facts: { mood: "hosting" } }
      : { id: "kashta", type: "outdoor", description: config.environment, facts: { mood: isDay ? "sunset" : "fire-night" } },
    camera: { device_profile: "Xiaomi 15 Ultra real camera", camera_type: "rear_camera", geometry: { distance_cm: 120, crop: "half" } },
    lighting: { source_type: isDay ? "daylight" : "practical", description: light.value, direction: isDay ? "low side light" : "uneven practical light", intensity: isDay ? "moderate" : "low" },
    hard_constraints: hardConstraints(),
    preferences: { realism: "documentary", imperfection_level: "natural" }
  };
}

assert.equal(SCENES.majlis.label, "مجلس سعودي");
assert.equal(SCENES.kashta.label, "كشتة بر");
assert.equal(SCENES.majlis.clothing.length, 7);
assert.equal(SCENES.kashta.clothing.length, 6);
assert.deepEqual(LIGHTING_OPTIONS.majlis.night.map(x => x.value), ["warm-sconces", "incense-glow", "mixed-warm"]);
assert.deepEqual(LIGHTING_OPTIONS.majlis.day.map(x => x.value), ["window-daylight", "open-shade"]);
assert.deepEqual(LIGHTING_OPTIONS.kashta.night.map(x => x.value), ["campfire", "starlight", "fire-stars"]);
assert.deepEqual(LIGHTING_OPTIONS.kashta.day.map(x => x.value), ["golden-sunset", "cold-dawn", "hazy-morning"]);
assert.deepEqual(MAJLIS_MOODS.map(x => x.value), ["hosting", "family", "reading", "after-meal", "night-chat"]);
assert.deepEqual(KASHTA_MOODS.map(x => x.value), ["fire-night", "dawn", "sunset", "foggy"]);

const cases = [canonicalFor("majlis"), canonicalFor("kashta"), canonicalFor("kashta", "day")];
for (const canonical of cases) {
  const hardBefore = JSON.stringify(canonical.hard_constraints);
  const stateBefore = JSON.stringify(canonical);
  const prompt = buildOpenAIImagePrompt(canonical);
  assert.equal(JSON.stringify(canonical.hard_constraints), hardBefore);
  assert.equal(JSON.stringify(canonical), stateBefore);
  assert.ok(wordCount(prompt) <= 250, `prompt exceeds 250 words: ${wordCount(prompt)}`);
  assert.equal(/tea glass held by/iu.test(prompt), false);
  const repeated = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical));
  assert.equal(repeated.every(value => value === repeated[0]), true, "determinism must be 10/10");
}

const majlisPrompt = buildOpenAIImagePrompt(cases[0]);
assert.match(majlisPrompt, /half-empty tea glass/iu);
assert.match(majlisPrompt, /brass dallah/iu);
assert.match(describePlaceRealism(cases[0]), /slightly compressed cushion/iu);

const kashtaNightPrompt = buildOpenAIImagePrompt(cases[1]);
assert.match(kashtaNightPrompt, /weathered kettle/iu);
assert.match(kashtaNightPrompt, /firelight/iu);
assert.match(kashtaNightPrompt, /(?:soft-focus|blurred|blurs|distant|background)/iu);
assert.equal(describeSaudiStreetRealism(cases[1]), "");

const kashtaDayPrompt = buildOpenAIImagePrompt(cases[2]);
assert.match(kashtaDayPrompt, /weathered kettle/iu);
assert.match(kashtaDayPrompt, /golden/iu);
assert.match(kashtaDayPrompt, /(?:soft-focus|blurred|blurs|distant|background)/iu);
assert.equal(/tea glass held by/iu.test([majlisPrompt, kashtaNightPrompt, kashtaDayPrompt].join("\n")), false);

console.log("✓ canonical-v3 Phase 17 place-realism contracts passed");
