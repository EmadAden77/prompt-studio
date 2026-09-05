import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildCanonicalV3, hourToMood } from "../js/canonical-v3-engine.js";
import {
  buildOpenAIImagePrompt,
  describeEnvironmentalDetails,
  describeSaudiStreetRealism,
  describeMicroRealism
} from "../js/canonical/openai-image-adapter.js";

const GOLDEN_URL = new URL("./golden/current-engine/legacy-v2-semantic-goldens.json", import.meta.url);
const golden = JSON.parse(fs.readFileSync(fileURLToPath(GOLDEN_URL), "utf8"));
const GOLDEN_CASE_IDS = ["car_lhd_driver_selfie","car_tight_crop","bedroom_direct_selfie","mirror_selfie","group_selfie","accidental_capture","identity_and_eyewear"];
const ENVIRONMENTAL_DETAIL_PHRASES = Object.freeze({
  directional_dust: "Faint dust particles catch the directional light.",
  surface_smudges: "Subtle fingerprints and smudges appear on glossy surfaces.",
  touched_wear: "Natural wear appears on frequently touched surfaces.",
  lived_in_room: "Lived-in details remain consistent with the room."
});
const SAUDI_STREET_DAY = Object.freeze([
  "date palms line the median with visible drip-irrigation tubing.",
  "weathered asphalt shows patch repairs and sand gathered along the yellow-and-black curb.",
  "a dusty white Toyota Land Cruiser and a silver Camry are parked with dark tinted windows."
]);
const SAUDI_STREET_NIGHT = Object.freeze([
  "sodium-orange streetlights mix with cool white LED poles, leaving dark gaps between light pools.",
  "a shawarma storefront glows with visible grill light and Arabic signage.",
  "parked SUVs show tinted windows reflecting storefront light and lit license plates."
]);
const MOOD_DETAILS = Object.freeze({
  rush: Object.freeze([
    "dense commuter traffic fills the lanes around a signalized junction.",
    "white Land Cruisers, Camrys, and compact sedans queue with dark tinted windows.",
    "delivery riders filter between slow cars near active storefronts."
  ]),
  cafe: Object.freeze([
    "busy coffee shops cast warm light onto the sidewalk and parked cars.",
    "SUVs and sedans line the curb with tinted windows reflecting cafe signs.",
    "small groups in thobes gather near outdoor tables and takeaway counters."
  ]),
  dust: Object.freeze([
    "fine beige dust softens distant buildings and roadside contrast.",
    "sand gathers along the curb and lightly coats parked vehicles.",
    "streetlights and headlights diffuse gently through the dusty air."
  ])
});
const FORBIDDEN_NEGATIVE_PHRASES = [/\bDO NOT\b/iu,/\bMUST\b/iu,/\bIMPORTANT\b/iu,/\bNEVER\b/iu,/\bQA\b/iu,/\bdebug\b/iu];
const wordCount = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const count = (value, needle) => String(value).split(needle).length - 1;
const detailSignals = (value) => Object.values(ENVIRONMENTAL_DETAIL_PHRASES).filter((phrase) => String(value).includes(phrase));
const streetSignals = (value, set) => set.filter((phrase) => String(value).includes(phrase));
const canonicalFor = (input) => buildCanonicalV3({ intentType:"selfie", scene:"street", lighting:"daylight", time:"day", ...input });

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
  for (const phrase of signals) assert.equal(count(helperOutput, phrase), 1, `${id}: helper must emit each phrase once`);
  const microSignals = describeMicroRealism(canonical).match(/[^.!?]+[.!?]/gu) ?? [];
  assert.ok(microSignals.some((part) => prompt.includes(part.trim())), `${id}: prompt must retain a micro-realism detail under the 250-word cap`);
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
  assert.equal(repeated.every((value) => value === repeated[0]), true, `${id}: adapter output must remain deterministic 10/10`);
}

assert.equal(hourToMood(4), "dawn");
assert.equal(hourToMood(7), "rush");
assert.equal(hourToMood(10), "normal");
assert.equal(hourToMood(12), "school");
assert.equal(hourToMood(19), "prayer");
assert.equal(hourToMood(21), "cafe");
assert.equal(hourToMood(1), "latenight");

const rushAuto = canonicalFor({ streetMood:"auto", streetHour:7, lighting:"daylight", time:"day" });
assert.equal(rushAuto.scene.facts.street_mood, "rush", "hour 7 auto mode must resolve to rush");
assert.equal(Object.prototype.hasOwnProperty.call(rushAuto.scene.facts, "streetHour"), false, "hour must not be stored in scene facts");
assert.equal(Object.prototype.hasOwnProperty.call(rushAuto.scene.facts, "street_hour"), false, "resolved scene must store no hour fact");
const rushPrompt = buildOpenAIImagePrompt(rushAuto);
assert.deepEqual(streetSignals(describeSaudiStreetRealism(rushAuto), MOOD_DETAILS.rush), MOOD_DETAILS.rush, "rush auto mode must emit the rush detail set");
assert.equal(/street mood is rush/iu.test(rushPrompt), false, "reserved street_mood must not print as a generic fact");

const cafeAuto = canonicalFor({ streetMood:"auto", streetHour:21, lighting:"street-night", time:"night" });
assert.equal(cafeAuto.scene.facts.street_mood, "cafe", "hour 21 auto mode must resolve to cafe");
assert.deepEqual(streetSignals(describeSaudiStreetRealism(cafeAuto), MOOD_DETAILS.cafe), MOOD_DETAILS.cafe, "cafe auto mode must emit the cafe detail set");

const manualDust = canonicalFor({ streetMood:"dust", streetHour:7, lighting:"street-night", time:"night" });
assert.equal(manualDust.scene.facts.street_mood, "dust", "manual mood must override the hour mapping");
assert.deepEqual(streetSignals(describeSaudiStreetRealism(manualDust), MOOD_DETAILS.dust), MOOD_DETAILS.dust, "manual dust must emit dust details");

for (const [name, canonical] of [["rush", rushAuto],["cafe", cafeAuto],["manual", manualDust]]) {
  const beforeHard = JSON.stringify(canonical.hard_constraints);
  const prompt = buildOpenAIImagePrompt(canonical);
  assert.ok(wordCount(prompt) <= 250, `${name}: street prompt exceeds 250 words (${wordCount(prompt)})`);
  assert.equal(JSON.stringify(canonical.hard_constraints), beforeHard, `${name}: hard constraints changed`);
  const repeated = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical));
  assert.equal(repeated.every((value) => value === repeated[0]), true, `${name}: determinism failed`);
}

const outdoorCanonical = canonicalFor({ scene:"street", lightDirection:null });
assert.equal(describeEnvironmentalDetails(outdoorCanonical), "", "ordinary outdoor scenes without a directional source must skip the environmental layer");
const directionalOutdoorCanonical = canonicalFor({ scene:"street", lightDirection:"camera-left" });
assert.deepEqual(detailSignals(describeEnvironmentalDetails(directionalOutdoorCanonical)), [ENVIRONMENTAL_DETAIL_PHRASES.directional_dust], "directional outdoor light may add only the light-causal dust detail");

const dayStreet = canonicalFor({ scene:"street", lighting:"daylight", time:"day" });
assert.deepEqual(streetSignals(describeSaudiStreetRealism(dayStreet), SAUDI_STREET_DAY), SAUDI_STREET_DAY, "street without mood keeps deterministic Phase 10 day fallback");
const nightStreet = canonicalFor({ scene:"street", lighting:"street-night", time:"night" });
assert.deepEqual(streetSignals(describeSaudiStreetRealism(nightStreet), SAUDI_STREET_NIGHT), SAUDI_STREET_NIGHT, "street without mood keeps deterministic Phase 10 night fallback");
assert.equal(describeSaudiStreetRealism(canonicalFor({ intentType:"room", scene:"bedroom" })), "", "street helper must skip non-outdoor scenes");

const vehicleCanonical = canonicalFor({ intentType:"car", scene:"rangeRover", vehicleInteriorDescription:"glossy center display and glass side windows", lightDirection:null });
assert.deepEqual(detailSignals(describeEnvironmentalDetails(vehicleCanonical)), [ENVIRONMENTAL_DETAIL_PHRASES.surface_smudges, ENVIRONMENTAL_DETAIL_PHRASES.touched_wear], "vehicle interiors with glass or screens must use sparse surface details");
const directionalVehicleCanonical = canonicalFor({ intentType:"car", scene:"rangeRover", vehicleInteriorDescription:"glossy center display and glass side windows", lightDirection:"driver-left" });
assert.deepEqual(detailSignals(describeEnvironmentalDetails(directionalVehicleCanonical)), [ENVIRONMENTAL_DETAIL_PHRASES.directional_dust, ENVIRONMENTAL_DETAIL_PHRASES.surface_smudges], "the two-phrase cap must prioritize directional dust and supported glass or screen detail");
const plainRoomCanonical = canonicalFor({ intentType:"room", scene:"bedroom", lightDirection:null });
assert.equal(describeEnvironmentalDetails(plainRoomCanonical), ENVIRONMENTAL_DETAIL_PHRASES.lived_in_room, "a room without a more specific supported detail must use the lived-in fallback");

console.log("✓ canonical-v3 environmental details, Saudi street moods, and Phase 12 auto-hour contracts passed with Phase 18 cap arbitration");
