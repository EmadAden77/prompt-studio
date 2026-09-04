import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import {
  buildOpenAIImagePrompt,
  describeLightingPhysics
} from "../js/canonical/openai-image-adapter.js";

const GOLDEN_URL = new URL("./golden/current-engine/legacy-v2-semantic-goldens.json", import.meta.url);
const golden = JSON.parse(fs.readFileSync(fileURLToPath(GOLDEN_URL), "utf8"));

const GOLDEN_CASE_IDS = [
  "car_lhd_driver_selfie",
  "car_tight_crop",
  "bedroom_direct_selfie",
  "mirror_selfie",
  "group_selfie",
  "accidental_capture",
  "identity_and_eyewear"
];

const LIGHTING_PHYSICS_PHRASES = Object.freeze({
  daylight: "Gentle directional contrast creates gradual shadow falloff across the scene.",
  practical: "Localized highlights transition gradually into adjacent shadows.",
  mixed: "Subtle color variation follows the overlapping illumination across the scene.",
  phone_screen: "Concentrated illumination falls off across the nearby subject.",
  ambient: "Soft low-contrast transitions extend across the scene."
});

const FORBIDDEN_PHRASES = [
  /\bDO NOT\b/iu,
  /\bMUST\b/iu,
  /\bIMPORTANT\b/iu,
  /\bNEVER\b/iu,
  /\bQA\b/iu,
  /\bdebug\b/iu,
  /camera artifacts?/iu,
  /sensor noise/iu,
  /compression artifacts?/iu,
  /post-processing/iu,
  /dust in light beams/iu
];

function wordCount(value) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized.split(/\s+/u).length : 0;
}

function count(value, needle) {
  return String(value).split(needle).length - 1;
}

function canonicalWithLighting(lighting, time = "night") {
  return buildCanonicalV3({
    intentType: "selfie",
    scene: "street",
    lighting,
    time
  });
}

for (const id of GOLDEN_CASE_IDS) {
  const input = golden.cases[id]?.input;
  assert.ok(input, `${id}: missing golden input`);

  const canonical = buildCanonicalV3(structuredClone(input));
  const beforeCanonical = JSON.stringify(canonical);
  const beforeHardConstraints = JSON.stringify(canonical.hard_constraints);
  const beforeAuthorities = JSON.stringify(canonical.authorities);
  const beforeCameraGeometry = JSON.stringify(canonical.camera.geometry);
  const beforeIdentity = JSON.stringify(canonical.identity);
  const beforeVehicleGeometry = JSON.stringify(canonical.hard_constraints.vehicle_geometry);
  const helperOutput = describeLightingPhysics(canonical);
  const prompt = buildOpenAIImagePrompt(canonical);

  assert.equal(JSON.stringify(canonical), beforeCanonical, `${id}: adapter must not mutate Canonical V3 state`);
  assert.equal(JSON.stringify(canonical.hard_constraints), beforeHardConstraints, `${id}: adapter must not mutate hard constraints`);
  assert.equal(JSON.stringify(canonical.authorities), beforeAuthorities, `${id}: adapter must not mutate authorities`);
  assert.equal(JSON.stringify(canonical.camera.geometry), beforeCameraGeometry, `${id}: adapter must not mutate camera geometry`);
  assert.equal(JSON.stringify(canonical.identity), beforeIdentity, `${id}: adapter must not mutate identity`);
  assert.equal(JSON.stringify(canonical.hard_constraints.vehicle_geometry), beforeVehicleGeometry, `${id}: adapter must not mutate vehicle geometry`);
  assert.equal(Object.isFrozen(canonical.hard_constraints), true, `${id}: hard constraints must remain frozen`);

  assert.equal(helperOutput, LIGHTING_PHYSICS_PHRASES.daylight, `${id}: daylight input must select the daylight lighting-physics sentence`);
  assert.equal(count(prompt, helperOutput), 1, `${id}: prompt must include its lighting-physics sentence exactly once`);
  assert.ok(wordCount(prompt) <= 250, `${id}: prompt must stay at or below 250 words`);

  for (const forbidden of FORBIDDEN_PHRASES) {
    assert.equal(forbidden.test(helperOutput), false, `${id}: helper contains an out-of-scope or negative phrase: ${forbidden}`);
    assert.equal(forbidden.test(prompt), false, `${id}: prompt contains an out-of-scope or negative phrase: ${forbidden}`);
  }

  const repeated = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical));
  assert.equal(repeated.filter((value) => value === repeated[0]).length, 10, `${id}: adapter output must remain deterministic 10/10`);
}

for (const [sourceType, expected] of Object.entries(LIGHTING_PHYSICS_PHRASES)) {
  const lighting = sourceType === "phone_screen"
    ? "phone screen"
    : sourceType === "mixed"
      ? "mixed visible lighting"
      : sourceType;
  const canonical = canonicalWithLighting(lighting, sourceType === "daylight" ? "day" : "night");
  assert.equal(canonical.lighting.source_type, sourceType, `${sourceType}: fixture must resolve the expected source type`);
  assert.equal(describeLightingPhysics(canonical), expected, `${sourceType}: helper must emit one source-appropriate sentence`);
}

const noLightingCanonical = structuredClone(canonicalWithLighting("daylight", "day"));
noLightingCanonical.lighting = {
  source_type: null,
  description: null,
  color_temperature_k: null,
  direction: null,
  intensity: null
};
assert.equal(describeLightingPhysics(noLightingCanonical), "", "helper must omit itself when no recognized lighting source applies");

console.log("✓ canonical-v3 lighting physics layer contract passed");
