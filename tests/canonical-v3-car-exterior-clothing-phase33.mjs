import assert from "node:assert/strict";
import fs from "node:fs";
import { CAR_EXTERIOR_CLOTHING_CATALOG, CAR_EXTERIOR_CLOTHING_OPTIONS } from "../js/car-exterior-clothing-phase33.js";
import { buildCanonicalV3UserOutput, CAR_EXTERIOR_PROMPT_WORD_BUDGET } from "../js/canonical/canonical-v3-pipeline.js";
import { HEADWEAR_LOCK } from "../js/canonical/openai-image-adapter.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
assert.equal(CAR_EXTERIOR_PROMPT_WORD_BUDGET, 280, "legacy exported Phase 33 budget remains stable; Phase 37 final adapter cap is 250");
assert.ok(CAR_EXTERIOR_CLOTHING_OPTIONS.length >= 20);
assert.deepEqual(CAR_EXTERIOR_CLOTHING_CATALOG.map((section) => section.label), ["منزل", "كاجوال", "رسمي", "رياضي", "تقليدي", "خارجي"]);
for (const value of ["thobe-redshemagh-iqal", "thobe-whiteghutra-iqal", "thobe-bisht", "custom", "casual-tee-black-jeans-blue"]) {
  assert.ok(CAR_EXTERIOR_CLOTHING_OPTIONS.some((option) => option.value === value), `${value}: authority option missing`);
}
const uiSource = fs.readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
assert.match(uiSource, /CLOTHING_CATALOG/u);
assert.doesNotMatch(uiSource, /makeCatalogSelect\("car-exterior-clothing"/u, "Phase 37 removed the duplicate carExterior clothing select");

const base = {
  studioSection:"carExterior", scene:"carExterior", time:"night", hasReference:true, expression:"neutral",
  carExteriorLocation:"villa", carExteriorPose:"door-lean", carExteriorLighting:"streetlight-reflection",
  fabric:"cotton", fabricWeight:"light", ironState:"lightly-unpressed", wearState:"normal-day", clothingFit:"regular"
};
const thobeRuns = Array.from({ length:10 }, () => buildCanonicalV3UserOutput({ ...base, clothing:"thobe-redshemagh-iqal" }));
const thobePrompt = thobeRuns[0].prompt;
assert.ok(thobeRuns.every((item) => item.prompt === thobePrompt));
assert.ok(thobePrompt.includes(HEADWEAR_LOCK));
assert.match(thobePrompt, /red-and-white fine checkered shemagh/iu);
assert.match(thobePrompt, /black doubled-cord iqal/iu);
assert.ok(words(thobePrompt) <= 250);

const outfit = buildCanonicalV3UserOutput({ ...base, clothing:"casual-tee-black-jeans-blue" });
assert.match(outfit.prompt, /تيشيرت أسود ثقيل \+ جينز أزرق داكن/u);
assert.ok(words(outfit.prompt) <= 250);
const customText = "جاكيت كحلي خفيف + تيشيرت أبيض + بنطلون تشينو بيج";
const custom = buildCanonicalV3UserOutput({ ...base, clothing:"custom", customClothing:customText });
assert.ok(custom.prompt.includes(customText));
assert.ok(words(custom.prompt) <= 250);
assert.deepEqual(thobeRuns[0].canonical.hard_constraints, outfit.canonical.hard_constraints);
assert.deepEqual(custom.canonical.hard_constraints, outfit.canonical.hard_constraints);

console.log(`PHASE33_OPTIONS=${CAR_EXTERIOR_CLOTHING_OPTIONS.length}`);
console.log("PHASE33_DETERMINISM=10/10");
console.log("✓ Phase 33 clothing compatibility preserved under Phase 37 single authority");
