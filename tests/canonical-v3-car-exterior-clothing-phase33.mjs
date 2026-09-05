import assert from "node:assert/strict";
import fs from "node:fs";
import {
  CAR_EXTERIOR_CLOTHING_CATALOG,
  CAR_EXTERIOR_CLOTHING_OPTIONS
} from "../js/car-exterior-clothing-phase33.js";
import { buildCanonicalV3UserOutput, CAR_EXTERIOR_PROMPT_WORD_BUDGET } from "../js/canonical/canonical-v3-pipeline.js";
import { HEADWEAR_LOCK } from "../js/canonical/openai-image-adapter.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;

assert.equal(CAR_EXTERIOR_PROMPT_WORD_BUDGET, 280, "Phase 33 carExterior word budget drifted");
assert.ok(CAR_EXTERIOR_CLOTHING_OPTIONS.length >= 20, `carExterior must expose >=20 clothing options, got ${CAR_EXTERIOR_CLOTHING_OPTIONS.length}`);
assert.deepEqual(
  CAR_EXTERIOR_CLOTHING_CATALOG.map((section) => section.label),
  ["تقليدي سعودي", "كاجوال", "رسمي", "رياضي", "خارجي", "مخصص"],
  "carExterior clothing optgroups drifted"
);

const requiredValues = ["thobe-redshemagh-iqal", "thobe-whiteghutra-iqal", "thobe-bisht", "custom"];
for (const value of requiredValues) {
  assert.ok(CAR_EXTERIOR_CLOTHING_OPTIONS.some((option) => option.value === value), `${value}: required carExterior clothing option missing`);
}

const thobe = CAR_EXTERIOR_CLOTHING_OPTIONS.find((option) => option.value === "thobe-redshemagh-iqal");
assert.equal(thobe.label, "ثوب أبيض + شماغ أحمر + عقال");
assert.match(thobe.text, /red-and-white checkered shemagh/iu);
assert.match(thobe.text, /black iqal/iu);

const indexSource = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const uiSource = fs.readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
assert.equal((indexSource.match(/id="clothing"/gu) || []).length, 1, "exactly one clothing select must exist");
assert.match(uiSource, /CAR_EXTERIOR_CLOTHING_CATALOG/u, "carExterior UI must render from the Phase 33 wide catalog");
assert.doesNotMatch(uiSource, /id\s*=\s*["']car-exterior-clothing["']/u, "Phase 33 must not create a duplicate clothing select");

const base = {
  studioSection:"carExterior",
  intentType:"selfie",
  scene:"carExterior",
  time:"night",
  carExteriorLocation:"villa",
  carExteriorPose:"door-lean",
  hasReference:true,
  expression:"neutral",
  fabric:"cotton",
  fabricWeight:"light",
  ironState:"lightly-unpressed",
  wearState:"normal-day",
  clothingFit:"regular"
};

const thobeRaw = { ...base, clothing:"thobe-redshemagh-iqal" };
const thobeOutputs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(thobeRaw));
const thobePrompt = thobeOutputs[0].prompt;
assert.ok(thobeOutputs.every((item) => item.prompt === thobePrompt), "thobe carExterior determinism failed");
assert.ok(thobePrompt.includes(HEADWEAR_LOCK), "Phase 25 HEADWEAR_LOCK sentence must be emitted for carExterior shemagh + iqal");
assert.match(thobePrompt, /red-and-white fine checkered shemagh/iu, "fine checkered shemagh lock wording missing");
assert.match(thobePrompt, /black doubled-cord iqal/iu, "black doubled-cord iqal lock wording missing");
assert.ok(words(thobePrompt) <= CAR_EXTERIOR_PROMPT_WORD_BUDGET, `thobe carExterior prompt exceeds ${CAR_EXTERIOR_PROMPT_WORD_BUDGET} words (${words(thobePrompt)})`);

const outfitRaw = { ...base, clothing:"casual-tee-black-jeans-blue" };
const outfitOutputs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(outfitRaw));
const outfitPrompt = outfitOutputs[0].prompt;
assert.ok(outfitOutputs.every((item) => item.prompt === outfitPrompt), "full-outfit carExterior determinism failed");
assert.match(outfitPrompt, /تيشيرت أسود ثقيل \+ جينز أزرق داكن/u, "full outfit top + bottom + color must flow into carExterior prompt");
assert.ok(words(outfitPrompt) <= CAR_EXTERIOR_PROMPT_WORD_BUDGET, `full-outfit carExterior prompt exceeds ${CAR_EXTERIOR_PROMPT_WORD_BUDGET} words (${words(outfitPrompt)})`);

const customText = "جاكيت كحلي خفيف + تيشيرت أبيض + بنطلون تشينو بيج";
const customRaw = { ...base, clothing:"custom", customClothing:customText };
const customOutputs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(customRaw));
const customPrompt = customOutputs[0].prompt;
assert.ok(customOutputs.every((item) => item.prompt === customPrompt), "custom carExterior determinism failed");
assert.ok(customPrompt.includes(customText), "custom carExterior clothing must flow into the prompt");
assert.ok(words(customPrompt) <= CAR_EXTERIOR_PROMPT_WORD_BUDGET, `custom carExterior prompt exceeds ${CAR_EXTERIOR_PROMPT_WORD_BUDGET} words (${words(customPrompt)})`);

assert.deepEqual(thobeOutputs[0].canonical.hard_constraints, outfitOutputs[0].canonical.hard_constraints, "carExterior clothing selection must not mutate hard constraints");
assert.deepEqual(customOutputs[0].canonical.hard_constraints, outfitOutputs[0].canonical.hard_constraints, "custom clothing must not mutate hard constraints");

console.log(`PHASE33_OPTIONS=${CAR_EXTERIOR_CLOTHING_OPTIONS.length}`);
console.log(`PHASE33_WORD_BUDGET=${CAR_EXTERIOR_PROMPT_WORD_BUDGET}`);
console.log(`PHASE33_THOBE_WORDS=${words(thobePrompt)}`);
console.log(`PHASE33_CUSTOM_WORDS=${words(customPrompt)}`);
console.log("PHASE33_DETERMINISM=10/10");
console.log(`PHASE33_THOBE_SAMPLE=${thobePrompt}`);
console.log(`PHASE33_CUSTOM_SAMPLE=${customPrompt}`);
console.log("✓ Phase 33 wide carExterior clothing with expanded word budget passed");
