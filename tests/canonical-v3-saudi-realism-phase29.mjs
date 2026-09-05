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
const alley = buildStreet("alley");
const construction = buildStreet("construction");
const bufia = buildStreet("bufia");
const night = buildStreet("auto", "night");
const autoNight = buildStreet("auto", "night");
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
assert.equal(autoNight.scene.street_mood_request, "auto");
for (const [name, canonical] of [["cafe", cafe], ["normal", normal], ["rush", rush]]) {
  const realism = describeSaudiRealism(canonical);
  assert.match(realism, /Saudi residential street|Saudi street/iu, `${name}: must remain a plain street realism profile`);
  assert.doesNotMatch(realism, /Saudi bufia cafe|service alley|street construction/iu, `${name}: hidden special-place mapping leaked`);
}
assert.match(describeSaudiRealism(alley), /service alley/iu);
assert.match(describeSaudiRealism(alley), /air-conditioning units/iu);
assert.match(describeSaudiRealism(construction), /street construction/iu);
assert.match(describeSaudiRealism(construction), /paving blocks/iu);
assert.match(describeSaudiRealism(bufia), /Saudi bufia cafe/iu);
assert.match(describeSaudiRealism(autoNight), /cat-eye/iu, "auto night must retain generic Phase 28 night realism");
assert.doesNotMatch(describeSaudiRealism(autoNight), /Saudi bufia cafe|service alley|street construction/iu);

const dayArtifact = describePhase29CameraArtifacts(bufia);
assert.match(dayArtifact, /chromatic aberration/iu);
assert.match(dayArtifact, /natural sun flare/iu);
assert.match(dayArtifact, /grainy shadows/iu);
assert.match(dayArtifact, /blown highlights/iu);
assert.equal(describePhase29CameraArtifacts(night), "", "night scene must not receive sun flare");

const speech = describeCandidSpeech(speechSelfie);
assert.match(speech, /mid-sentence/iu);
assert.match(speech, /eyes remain naturally open/iu);
assert.doesNotMatch(speech, /squint/iu);

const cases = Object.freeze({ cafe, normal, rush, alley, construction, bufia, night, speechSelfie });
for (const [name, canonical] of Object.entries(cases)) {
  const before = JSON.stringify(canonical);
  const prompt = buildOpenAIImagePrompt(canonical);
  assert.ok(wordCount(prompt) <= 250, `${name}: ${wordCount(prompt)} words`);
  assert.equal(new Set(Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical))).size, 1, `${name}: determinism failed`);
  assert.equal(JSON.stringify(canonical), before, `${name}: canonical mutated`);
  assert.doesNotMatch(prompt, /squinting eyes|extreme|chaotic|zero beauty filters/iu, `${name}: rejected wording leaked`);
}

for (const canonical of [cafe, normal, rush]) {
  assert.doesNotMatch(buildOpenAIImagePrompt(canonical), /Saudi bufia cafe|service alley|street construction/iu);
}
assert.match(buildOpenAIImagePrompt(alley), /service alley/iu);
assert.match(buildOpenAIImagePrompt(construction), /street construction/iu);
assert.match(buildOpenAIImagePrompt(bufia), /Saudi bufia cafe/iu);
assert.match(buildOpenAIImagePrompt(bufia), /chromatic aberration/iu);
assert.doesNotMatch(buildOpenAIImagePrompt(night), /natural sun flare/iu);
assert.match(buildOpenAIImagePrompt(speechSelfie), /mid-sentence/iu);
assert.match(buildOpenAIImagePrompt(speechSelfie), /identity-preserving shape/iu);

console.log(`PHASE29_BUFIA_WORDS=${wordCount(buildOpenAIImagePrompt(bufia))}`);
console.log(`PHASE29_NORMAL_WORDS=${wordCount(buildOpenAIImagePrompt(normal))}`);
console.log(`PHASE29_ALLEY_WORDS=${wordCount(buildOpenAIImagePrompt(alley))}`);
console.log(`PHASE29_CONSTRUCTION_WORDS=${wordCount(buildOpenAIImagePrompt(construction))}`);
console.log(`PHASE29_SPEECH_WORDS=${wordCount(buildOpenAIImagePrompt(speechSelfie))}`);
console.log("✓ Phase 29 Saudi realism completion passed under Phase 31 explicit-place semantics");
