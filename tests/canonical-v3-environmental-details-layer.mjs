import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import {
  buildOpenAIImagePrompt,
  describeEnvironmentalDetails,
  describeSaudiStreetRealism
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

const ENVIRONMENTAL_DETAIL_PHRASES = Object.freeze({
  directional_dust: "Faint dust particles catch the directional light.",
  surface_smudges: "Subtle fingerprints and smudges appear on glossy surfaces.",
  touched_wear: "Natural wear appears on frequently touched surfaces.",
  lived_in_room: "Lived-in details remain consistent with the room."
});
const SAUDI_STREET_DAY = Object.freeze([
  "date palms line the median with visible drip-irrigation tubing.",
  "weathered asphalt shows patch repairs and sand gathered along the yellow-and-black curb.",
  "a dusty white Toyota Land Cruiser and a silver Camry are parked with dark tinted windows.",
  "Arabic storefront signage for a cafeteria and a pharmacy glows under daylight.",
  "a delivery rider with an insulated food box weaves between lanes.",
  "pedestrians in white thobes and a woman in a black abaya cross at a faded zebra line.",
  "heat haze shimmers over the distant asphalt under a pale blue sky."
]);
const SAUDI_STREET_NIGHT = Object.freeze([
  "sodium-orange streetlights mix with cool white LED poles, leaving dark gaps between light pools.",
  "a shawarma storefront glows with visible grill light and Arabic signage.",
  "parked SUVs show tinted windows reflecting storefront light and lit license plates.",
  "a mosque minaret is softly illuminated in the background.",
  "a group of men in thobes and shemaghs gather near a parked Lexus."
]);

const FORBIDDEN_NEGATIVE_PHRASES = [
  /\bDO NOT\b/iu,
  /\bMUST\b/iu,
  /\bIMPORTANT\b/iu,
  /\bNEVER\b/iu,
  /\bQA\b/iu,
  /\bdebug\b/iu
];

function wordCount(value) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized.split(/\s+/u).length : 0;
}
function count(value, needle) { return String(value).split(needle).length - 1; }
function detailSignals(value) { return Object.values(ENVIRONMENTAL_DETAIL_PHRASES).filter((phrase) => String(value).includes(phrase)); }
function streetSignals(value, set) { return set.filter((phrase) => String(value).includes(phrase)); }
function canonicalFor(input) {
  return buildCanonicalV3({ intentType: "selfie", scene: "street", lighting: "daylight", time: "day", ...input });
}

for (const id of GOLDEN_CASE_IDS) {
  const input = golden.cases[id]?.input;
  assert.ok(input, `${id}: missing golden input`);
  const canonical = buildCanonicalV3(structuredClone(input));
  const beforeCanonical = JSON.stringify(canonical);
  const beforeHardConstraints = JSON.stringify(canonical.hard_constraints);
  const beforeAuthorities = JSON.stringify(canonical.authorities);
  const beforeScene = JSON.stringify(canonical.scene);
  const beforeLighting = JSON.stringify(canonical.lighting);
  const helperOutput = describeEnvironmentalDetails(canonical);
  const streetOutput = describeSaudiStreetRealism(canonical);
  const prompt = buildOpenAIImagePrompt(canonical);
  const signals = detailSignals(helperOutput);

  assert.equal(JSON.stringify(canonical), beforeCanonical, `${id}: adapter must not mutate Canonical V3 state`);
  assert.equal(JSON.stringify(canonical.hard_constraints), beforeHardConstraints, `${id}: adapter must not mutate hard constraints`);
  assert.equal(JSON.stringify(canonical.authorities), beforeAuthorities, `${id}: adapter must not mutate authorities`);
  assert.equal(JSON.stringify(canonical.scene), beforeScene, `${id}: adapter must not mutate scene state`);
  assert.equal(JSON.stringify(canonical.lighting), beforeLighting, `${id}: adapter must not mutate lighting state`);
  assert.equal(Object.isFrozen(canonical.hard_constraints), true, `${id}: hard constraints must remain frozen`);

  assert.ok(signals.length <= 2, `${id}: helper must remain sparse`);
  for (const phrase of signals) {
    assert.equal(count(helperOutput, phrase), 1, `${id}: helper must emit each phrase once`);
    assert.equal(count(prompt, phrase), 1, `${id}: prompt must emit each phrase once`);
  }
  if (canonical.scene?.type === "outdoor") {
    const active = canonical.lighting?.source_type === "daylight" ? SAUDI_STREET_DAY : SAUDI_STREET_NIGHT;
    assert.ok(streetSignals(streetOutput, active).length >= 2, `${id}: street helper must emit at least two active-set signals`);
  } else {
    assert.equal(streetOutput, "", `${id}: street helper must skip non-outdoor scenes`);
  }

  assert.ok(wordCount(prompt) <= 250, `${id}: prompt must stay at or below 250 words`);
  for (const forbidden of FORBIDDEN_NEGATIVE_PHRASES) {
    assert.equal(forbidden.test(helperOutput), false, `${id}: helper contains negative or debug text: ${forbidden}`);
    assert.equal(forbidden.test(streetOutput), false, `${id}: street helper contains negative or debug text: ${forbidden}`);
    assert.equal(forbidden.test(prompt), false, `${id}: prompt contains negative or debug text: ${forbidden}`);
  }
  const repeated = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical));
  assert.equal(repeated.filter((value) => value === repeated[0]).length, 10, `${id}: adapter output must remain deterministic 10/10`);
}

const outdoorCanonical = canonicalFor({ scene: "street", lightDirection: null });
assert.equal(describeEnvironmentalDetails(outdoorCanonical), "", "ordinary outdoor scenes without a directional source must skip the environmental layer");
const directionalOutdoorCanonical = canonicalFor({ scene: "street", lightDirection: "camera-left" });
assert.deepEqual(detailSignals(describeEnvironmentalDetails(directionalOutdoorCanonical)), [ENVIRONMENTAL_DETAIL_PHRASES.directional_dust], "directional outdoor light may add only the light-causal dust detail");

const dayStreet = canonicalFor({ scene: "street", lighting: "daylight", time: "day" });
const dayBefore = JSON.stringify(dayStreet.hard_constraints);
const dayDetails = describeSaudiStreetRealism(dayStreet);
assert.deepEqual(streetSignals(dayDetails, SAUDI_STREET_DAY), SAUDI_STREET_DAY.slice(0, 3), "daylight street must deterministically use the first three day signals");
assert.equal(streetSignals(dayDetails, SAUDI_STREET_NIGHT).length, 0, "daylight street must not use night signals");
assert.equal(JSON.stringify(dayStreet.hard_constraints), dayBefore, "day street helper must not mutate hard constraints");

const nightStreet = canonicalFor({ scene: "street", lighting: "street-night", time: "night" });
const nightBefore = JSON.stringify(nightStreet.hard_constraints);
const nightDetails = describeSaudiStreetRealism(nightStreet);
assert.deepEqual(streetSignals(nightDetails, SAUDI_STREET_NIGHT), SAUDI_STREET_NIGHT.slice(0, 3), "non-daylight street must deterministically use the first three night signals");
assert.equal(streetSignals(nightDetails, SAUDI_STREET_DAY).length, 0, "night street must not use day signals");
assert.equal(JSON.stringify(nightStreet.hard_constraints), nightBefore, "night street helper must not mutate hard constraints");
assert.equal(describeSaudiStreetRealism(canonicalFor({ intentType: "room", scene: "bedroom" })), "", "street helper must skip non-outdoor scenes");

const vehicleCanonical = canonicalFor({ intentType: "car", scene: "rangeRover", vehicleInteriorDescription: "glossy center display and glass side windows", lightDirection: null });
assert.deepEqual(detailSignals(describeEnvironmentalDetails(vehicleCanonical)), [ENVIRONMENTAL_DETAIL_PHRASES.surface_smudges, ENVIRONMENTAL_DETAIL_PHRASES.touched_wear], "vehicle interiors with glass or screens must use sparse surface details");
const directionalVehicleCanonical = canonicalFor({ intentType: "car", scene: "rangeRover", vehicleInteriorDescription: "glossy center display and glass side windows", lightDirection: "driver-left" });
assert.deepEqual(detailSignals(describeEnvironmentalDetails(directionalVehicleCanonical)), [ENVIRONMENTAL_DETAIL_PHRASES.directional_dust, ENVIRONMENTAL_DETAIL_PHRASES.surface_smudges], "the two-phrase cap must prioritize directional dust and supported glass or screen detail");

const plainRoomCanonical = canonicalFor({ intentType: "room", scene: "bedroom", lightDirection: null });
assert.equal(describeEnvironmentalDetails(plainRoomCanonical), ENVIRONMENTAL_DETAIL_PHRASES.lived_in_room, "a room without a more specific supported detail must use the lived-in fallback");
const mirrorRoomCanonical = canonicalFor({ intentType: "room", scene: "bedroom", mirrorSelfie: true, customScene: "a lived-in bedroom with a wardrobe mirror and bedside table", lightDirection: null });
assert.deepEqual(detailSignals(describeEnvironmentalDetails(mirrorRoomCanonical)), [ENVIRONMENTAL_DETAIL_PHRASES.surface_smudges, ENVIRONMENTAL_DETAIL_PHRASES.touched_wear], "room scenes with mirror or touched-surface evidence may use smudges and natural wear");
const storeWithoutGlassCanonical = canonicalFor({ scene: "custom", customScene: "an indoor optical store with matte shelving", lightDirection: null });
assert.equal(describeEnvironmentalDetails(storeWithoutGlassCanonical), "", "indoor scenes without glass or screen evidence must not invent glossy-surface details");
const storeWithGlassCanonical = canonicalFor({ scene: "custom", customScene: "an indoor optical store with a glass display and digital screen", lightDirection: null });
assert.equal(describeEnvironmentalDetails(storeWithGlassCanonical), ENVIRONMENTAL_DETAIL_PHRASES.surface_smudges, "indoor scenes with explicit glass or screen evidence may add subtle smudges");

console.log("✓ canonical-v3 environmental details and Saudi street realism contracts passed");
