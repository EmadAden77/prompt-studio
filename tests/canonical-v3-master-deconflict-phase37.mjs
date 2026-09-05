import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import { buildOpenAIImagePrompt } from "../js/canonical/openai-image-adapter-phase36.js";
import { FULL_OUTFITS, TRADITIONAL, resolveClothingText } from "../js/clothing-authority.js";
import { garmentOptionsForSection } from "../js/phase22-ui-runtime.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const firstSentence = (value) => String(value ?? "").match(/^[^.!?]+[.!?]/u)?.[0]?.trim() || "";
const sentences = (value) => String(value ?? "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map((part) => part.replace(/\s+/gu, " ").trim()).filter(Boolean) || [];
const assertNoExactDuplicateSentences = (prompt) => assert.equal(new Set(sentences(prompt)).size, sentences(prompt).length, "Phase 37: exact duplicate sentence found");

assert.equal(fs.readFileSync(new URL("../js/clothing-authority.js", import.meta.url), "utf8").match(/^import\s/gmu), null, "Phase 37 clothing authority must remain a leaf module");
assert.equal(Object.keys(FULL_OUTFITS).length, 6, "Phase 37 must keep six full-outfit sections");
assert.deepEqual(TRADITIONAL.map((item) => item.value), ["thobe-white", "thobe-redshemagh-iqal", "thobe-whiteghutra-iqal", "thobe-bisht"]);
assert.equal(resolveClothingText("custom", { customClothing:"  custom text stays verbatim  " }), "  custom text stays verbatim  ");
assert.equal(resolveClothingText("unknown-value", {}), "", "Phase 37 authority must not manufacture a generic selected-X fallback");

const uiValues = garmentOptionsForSection("carExterior").map((item) => item.value);
assert.ok(uiValues.includes("casual-tee-black-jeans-blue"));
assert.ok(uiValues.includes("thobe-redshemagh-iqal"));
assert.ok(uiValues.includes("custom"));
assert.deepEqual(garmentOptionsForSection("gym").map((item) => item.value), uiValues, "every section must use the same clothing authority list");
const uiSource = fs.readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
assert.doesNotMatch(uiSource, /makeCatalogSelect\("car-exterior-clothing"/u, "Phase 37 must not create a second carExterior clothing select");

const base = {
  studioSection:"carExterior",
  scene:"custom",
  customScene:"a user-defined scene",
  time:"night",
  hasReference:true,
  expression:"neutral",
  pose:"standing-relaxed",
  carExteriorPose:"front-grille",
  carExteriorLocation:"villa",
  carExteriorLighting:"streetlight-reflection",
  fabric:"cotton",
  fabricWeight:"medium",
  ironState:"normal-pressed",
  wearState:"fresh",
  clothingFit:"regular"
};

const coloredRaw = { ...base, clothing:"casual-tee-black-jeans-blue" };
const coloredRuns = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(coloredRaw));
const colored = coloredRuns[0];
assert.ok(coloredRuns.every((item) => item.prompt === colored.prompt), "Phase 37 colored determinism must be 10/10");
assert.match(colored.prompt, /تيشيرت أسود ثقيل \+ جينز أزرق داكن/u, "full colored top+bottom outfit missing");
assert.doesNotMatch(colored.prompt, /selected white thobe|selected\s+[^.]*thobe/iu);
assertNoExactDuplicateSentences(colored.prompt);
assert.match(colored.prompt, /\bLighting (?:uses|follows)\b/iu, "night lighting sentence missing");
assert.equal(firstSentence(colored.prompt), "A candid direct selfie.");
assert.match(colored.prompt, /2017 Range Rover Sport Autobiography Dynamic/iu);
assert.ok(words(colored.prompt) <= 250, `Phase 37 colored prompt exceeds 250 words (${words(colored.prompt)})`);

const customText = "جاكيت كحلي خفيف + تيشيرت أبيض + بنطلون تشينو بيج";
const customRaw = { ...base, clothing:"custom", customClothing:customText };
const customRuns = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(customRaw));
assert.ok(customRuns.every((item) => item.prompt === customRuns[0].prompt), "Phase 37 custom determinism must be 10/10");
assert.ok(customRuns[0].prompt.includes(customText), "custom text must survive verbatim");
assert.equal(customRuns[0].canonical.subjects.primary.clothing.garment, customText, "custom garment changed before adapter");
assert.doesNotMatch(customRuns[0].prompt, /selected white thobe/iu);
assertNoExactDuplicateSentences(customRuns[0].prompt);
assert.match(customRuns[0].prompt, /\bLighting (?:uses|follows)\b/iu);
assert.match(customRuns[0].prompt, /2017 Range Rover Sport Autobiography Dynamic/iu);
assert.ok(words(customRuns[0].prompt) <= 250);

const thobeRaw = { ...base, clothing:"thobe-redshemagh-iqal" };
const thobeRuns = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(thobeRaw));
const thobe = thobeRuns[0];
assert.ok(thobeRuns.every((item) => item.prompt === thobe.prompt), "Phase 37 thobe determinism must be 10/10");
assert.equal(thobe.canonical.subjects.primary.clothing.garment, resolveClothingText("thobe-redshemagh-iqal", thobeRaw));
assert.match(thobe.prompt, /crisp white thobe/iu);
assert.match(thobe.prompt, /red-and-white fine checkered shemagh/iu);
assert.match(thobe.prompt, /black doubled-cord iqal/iu);
assert.match(thobe.prompt, /\bLighting (?:uses|follows)\b/iu);
assertNoExactDuplicateSentences(thobe.prompt);
assert.equal(firstSentence(thobe.prompt), "A candid direct selfie.");
assert.match(thobe.prompt, /2017 Range Rover Sport Autobiography Dynamic/iu);
assert.ok(words(thobe.prompt) <= 250, `Phase 37 thobe prompt exceeds 250 words (${words(thobe.prompt)})`);

const hardBefore = JSON.stringify(thobe.canonical.hard_constraints);
void buildOpenAIImagePrompt(thobe.canonical);
assert.equal(JSON.stringify(thobe.canonical.hard_constraints), hardBefore, "Phase 37 adapter mutated hard constraints");

console.log(`PHASE37_COLORED_WORDS=${words(colored.prompt)}`);
console.log(`PHASE37_CUSTOM_WORDS=${words(customRuns[0].prompt)}`);
console.log(`PHASE37_THOBE_WORDS=${words(thobe.prompt)}`);
console.log("PHASE37_DETERMINISM=10/10");
console.log(`PHASE37_NIGHT_CAR_EXTERIOR_SAMPLE=${thobe.prompt}`);
console.log("✓ Phase 37 master de-conflict passed");
