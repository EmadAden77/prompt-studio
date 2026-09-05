import assert from "node:assert/strict";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import { SAUDI_REALISM_MODIFIERS } from "../js/data.js";
import { buildOpenAIImagePrompt, describeSaudiRealism } from "../js/canonical/openai-image-adapter.js";

const wordCount = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const build = (scene, lighting, time) => buildCanonicalV3({
  intentType: "selfie",
  scene,
  lighting,
  time,
  streetMood: "auto",
  streetHour: time === "day" ? 12 : 21,
  clothing: "white-thobe",
  hasReference: true
});

const cases = Object.freeze({
  streetDay: build("street", "daylight", "day"),
  streetNight: build("street", "street-night", "night"),
  barbershop: build("barbershop", "shop-night", "night"),
  bakala: build("grocery", "shop-night", "night")
});

assert.equal(Object.isFrozen(SAUDI_REALISM_MODIFIERS), true);
assert.equal(Object.isFrozen(SAUDI_REALISM_MODIFIERS.streetsAndPlaces), true);
assert.equal(Object.isFrozen(SAUDI_REALISM_MODIFIERS.authenticShops), true);
assert.equal(Object.isFrozen(SAUDI_REALISM_MODIFIERS.backgroundHumans), true);

for (const [name, canonical] of Object.entries(cases)) {
  const before = JSON.stringify(canonical);
  const hardBefore = JSON.stringify(canonical.hard_constraints);
  const helper = describeSaudiRealism(canonical);
  const prompt = buildOpenAIImagePrompt(canonical);
  const sentences = helper.match(/[^.!?]+[.!?]/gu) ?? [];
  assert.ok(sentences.length <= 2, `${name}: helper emitted more than two sentences`);
  assert.ok(prompt.includes(helper), `${name}: exact Saudi realism layer missing`);
  assert.match(prompt, /soft-focus|blurred/iu, `${name}: background humans must remain soft-focus`);
  assert.doesNotMatch(prompt, /Almarai|Pepsi/iu, `${name}: branded text leaked`);
  assert.doesNotMatch(prompt, /broken letters|garbled text|random letters/iu, `${name}: broken text instruction leaked`);
  assert.ok(wordCount(prompt) <= 250, `${name}: ${wordCount(prompt)} words`);
  assert.equal(new Set(Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical))).size, 1, `${name}: determinism failed`);
  assert.equal(JSON.stringify(canonical), before, `${name}: canonical mutated`);
  assert.equal(JSON.stringify(canonical.hard_constraints), hardBefore, `${name}: hard constraints mutated`);
}

assert.match(buildOpenAIImagePrompt(cases.streetDay), /heat haze/iu);
assert.match(buildOpenAIImagePrompt(cases.streetDay), /jersey barriers/iu);
assert.match(buildOpenAIImagePrompt(cases.streetNight), /cat-eye/iu);
assert.match(buildOpenAIImagePrompt(cases.streetNight), /sodium/iu);
assert.match(buildOpenAIImagePrompt(cases.barbershop), /flickering neon/iu);
assert.match(buildOpenAIImagePrompt(cases.bakala), /local Saudi bakala facade/iu);
assert.match(buildOpenAIImagePrompt(cases.bakala), /generic faded dairy and soft drink color stickers/iu);
assert.match(buildOpenAIImagePrompt(cases.bakala), /soft-focus and unreadable/iu);

console.log(`PHASE28_STREET_DAY_WORDS=${wordCount(buildOpenAIImagePrompt(cases.streetDay))}`);
console.log(`PHASE28_STREET_DAY_PROMPT=${buildOpenAIImagePrompt(cases.streetDay)}`);
console.log(`PHASE28_STREET_NIGHT_WORDS=${wordCount(buildOpenAIImagePrompt(cases.streetNight))}`);
console.log(`PHASE28_STREET_NIGHT_PROMPT=${buildOpenAIImagePrompt(cases.streetNight)}`);
console.log(`PHASE28_BAKALA_WORDS=${wordCount(buildOpenAIImagePrompt(cases.bakala))}`);
console.log(`PHASE28_BAKALA_PROMPT=${buildOpenAIImagePrompt(cases.bakala)}`);
console.log("✓ Phase 28 Saudi realism modifiers passed");
