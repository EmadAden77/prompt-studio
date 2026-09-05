import assert from "node:assert/strict";
import { resolveClothingText, TRADITIONAL_CAR_OPTIONS } from "../js/phase30-clothing-catalog.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import { HEADWEAR_LOCK, describeHeadwear } from "../js/canonical/openai-image-adapter.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;

assert.equal(TRADITIONAL_CAR_OPTIONS.length, 4, "Phase 34 traditional car authority must expose four options");
assert.equal(
  resolveClothingText("thobe-redshemagh-iqal"),
  "crisp white thobe with a red-and-white checkered shemagh and black iqal, youthful style with one end casually thrown over the shoulder",
  "traditional car clothing text authority drifted"
);
assert.equal(resolveClothingText("missing-value"), "casual cotton clothing", "unknown clothing must use neutral fallback");

const base = {
  studioSection:"carExterior",
  scene:"carExterior",
  intentType:"selfie",
  time:"night",
  hasReference:false,
  expression:"neutral",
  carExteriorLocation:"reststop",
  carExteriorPose:"front-grille",
  carExteriorLighting:"streetlight-reflection",
  fabric:"cotton",
  fabricWeight:"light",
  ironState:"lightly-unpressed",
  wearState:"normal-day",
  clothingFit:"regular"
};

function stable(raw) {
  const outputs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(raw));
  assert.ok(outputs.every((item) => item.prompt === outputs[0].prompt), "Phase 34 determinism failed");
  return outputs[0];
}

const thobe = stable({
  ...base,
  clothing:"home-sleep-white-gray",
  carExteriorClothing:"thobe-redshemagh-iqal"
});
const thobePrompt = thobe.prompt;
assert.match(thobe.canonical.subjects.primary.clothing.garment, /crisp white thobe/iu, "resolved thobe must reach canonical garment text");
assert.equal(describeHeadwear(thobe.canonical), HEADWEAR_LOCK, "HEADWEAR_LOCK must read resolved garment text");
assert.match(thobePrompt, /white thobe/iu, "white thobe missing from carExterior prompt");
assert.match(thobePrompt, /red-and-white fine checkered shemagh/iu, "fine checkered shemagh lock missing from carExterior prompt");
assert.match(thobePrompt, /black doubled-cord iqal/iu, "black doubled-cord iqal lock missing from carExterior prompt");
assert.doesNotMatch(thobePrompt, /sleep/iu, "hidden sleep-set default leaked into carExterior prompt");
assert.ok(words(thobePrompt) <= 250, `Phase 34 thobe prompt exceeds 250 words (${words(thobePrompt)})`);

const outfit = stable({ ...base, clothing:"casual-tee-black-jeans-blue" });
assert.match(outfit.prompt, /تيشيرت أسود ثقيل \+ جينز أزرق داكن/u, "unified full outfit top + bottom + color did not reach carExterior prompt");
assert.doesNotMatch(outfit.prompt, /sleep/iu, "sleep fallback leaked into unified outfit prompt");
assert.ok(words(outfit.prompt) <= 250, `Phase 34 full-outfit prompt exceeds 250 words (${words(outfit.prompt)})`);

const customText = "جاكيت كحلي خفيف + تيشيرت أبيض + بنطلون تشينو بيج";
const custom = stable({ ...base, clothing:"custom", customClothing:customText });
assert.equal(custom.canonical.subjects.primary.clothing.garment, customText, "custom clothing must remain verbatim in canonical garment text");
assert.ok(custom.prompt.includes(customText), "custom clothing must flow verbatim into prompt");
assert.doesNotMatch(custom.prompt, /sleep/iu, "sleep fallback leaked into custom prompt");
assert.ok(words(custom.prompt) <= 250, `Phase 34 custom prompt exceeds 250 words (${words(custom.prompt)})`);

assert.deepEqual(thobe.canonical.hard_constraints, outfit.canonical.hard_constraints, "thobe routing changed hard constraints");
assert.deepEqual(custom.canonical.hard_constraints, outfit.canonical.hard_constraints, "custom routing changed hard constraints");

console.log(`PHASE34_THOBE_WORDS=${words(thobePrompt)}`);
console.log(`PHASE34_OUTFIT_WORDS=${words(outfit.prompt)}`);
console.log(`PHASE34_CUSTOM_WORDS=${words(custom.prompt)}`);
console.log("PHASE34_DETERMINISM=10/10");
console.log(`PHASE34_THOBE_SAMPLE=${thobePrompt}`);
console.log("✓ Phase 34 clothing routing authority contracts passed");
