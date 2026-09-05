import assert from "node:assert/strict";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import { SAUDI_REALISM_MODIFIERS } from "../js/data.js";
import {
  buildOpenAIImagePrompt,
  describeSaudiRealism,
  describePhase29CameraArtifacts,
  describeCandidSpeech
} from "../js/canonical/openai-image-adapter.js";

const wordCount = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const buildStreet = (streetMood, time = "day") => buildCanonicalV3({
  intentType: "selfie",
  scene: "street",
  lighting: time === "day" ? "daylight" : "street-night",
  time,
  streetMood,
  streetHour: time === "day" ? 12 : 21,
  clothing: "white-thobe",
  hasReference: true
});

const cafe = buildStreet("cafe");
const normal = buildStreet("normal");
const rush = buildStreet("rush");
const night = buildStreet("auto", "night");
const autoCafeNight = buildStreet("auto", "night");
const speechSelfie = structuredClone(buildCanonicalV3({
  intentType: "selfie",
  scene: "bedroom",
  lighting: "daylight",
  time: "day",
  clothing: "white-thobe",
  hasReference: true
}));
speechSelfie.subjects.primary.pose = "candid mid-speech pose";
speechSelfie.subjects.primary.expression = "natural speaking expression";

for (const id of ["saudi_bufia", "old_service_alley", "street_construction"]) {
  assert.ok(SAUDI_REALISM_MODIFIERS.streetsAndPlaces.some((item) => item.id === id), `${id}: missing modifier`);
}

assert.equal(cafe.scene.street_mood_request, "cafe");
assert.equal(autoCafeNight.scene.street_mood_request, "auto");
assert.match(describeSaudiRealism(cafe), /Saudi bufia cafe/iu);
assert.match(describeSaudiRealism(normal), /service alley/iu);
assert.match(describeSaudiRealism(normal), /air-conditioning units/iu);
assert.match(describeSaudiRealism(rush), /street construction/iu);
assert.match(describeSaudiRealism(rush), /paving blocks/iu);
assert.match(describeSaudiRealism(autoCafeNight), /cat-eye/iu, "auto-resolved cafe must retain Phase 28 generic night realism");
assert.doesNotMatch(describeSaudiRealism(autoCafeNight), /Saudi bufia cafe/iu);

const dayArtifact = describePhase29CameraArtifacts(cafe);
assert.match(dayArtifact, /chromatic aberration/iu);
assert.match(dayArtifact, /natural sun flare/iu);
assert.match(dayArtifact, /grainy shadows/iu);
assert.match(dayArtifact, /blown highlights/iu);
assert.equal(describePhase29CameraArtifacts(night), "", "night scene must not receive sun flare");

const speech = describeCandidSpeech(speechSelfie);
assert.match(speech, /mid-sentence/iu);
assert.match(speech, /eyes remain naturally open/iu);
assert.doesNotMatch(speech, /squint/iu);

const cases = Object.freeze({ cafe, normal, rush, night, speechSelfie });
for (const [name, canonical] of Object.entries(cases)) {
  const before = JSON.stringify(canonical);
  const prompt = buildOpenAIImagePrompt(canonical);
  assert.ok(wordCount(prompt) <= 250, `${name}: ${wordCount(prompt)} words`);
  assert.equal(new Set(Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical))).size, 1, `${name}: determinism failed`);
  assert.equal(JSON.stringify(canonical), before, `${name}: canonical mutated`);
  assert.doesNotMatch(prompt, /squinting eyes|extreme|chaotic|zero beauty filters/iu, `${name}: rejected wording leaked`);
}

assert.match(buildOpenAIImagePrompt(cafe), /Saudi bufia cafe/iu);
assert.match(buildOpenAIImagePrompt(normal), /service alley/iu);
assert.match(buildOpenAIImagePrompt(rush), /street construction/iu);
assert.match(buildOpenAIImagePrompt(cafe), /chromatic aberration/iu);
assert.doesNotMatch(buildOpenAIImagePrompt(night), /natural sun flare/iu);
assert.match(buildOpenAIImagePrompt(speechSelfie), /mid-sentence/iu);
assert.match(buildOpenAIImagePrompt(speechSelfie), /identity-preserving shape/iu);

console.log(`PHASE29_CAFE_WORDS=${wordCount(buildOpenAIImagePrompt(cafe))}`);
console.log(`PHASE29_NORMAL_WORDS=${wordCount(buildOpenAIImagePrompt(normal))}`);
console.log(`PHASE29_RUSH_WORDS=${wordCount(buildOpenAIImagePrompt(rush))}`);
console.log(`PHASE29_SPEECH_WORDS=${wordCount(buildOpenAIImagePrompt(speechSelfie))}`);
console.log("✓ Phase 29 Saudi realism completion passed");
