import assert from "node:assert/strict";
import fs from "node:fs";
import {
  PHASE32_NEUTRAL_CUSTOM_OUTFIT,
  UNIFIED_CLOTHING_CATALOG,
  UNIFIED_CLOTHING_OPTIONS
} from "../js/phase30-clothing-catalog.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const COLOR_RE = /أبيض|بيضاء|أسود|رمادي|أزرق|بني|بيج|أحمر|زيتي|كحلي/u;

assert.equal(UNIFIED_CLOTHING_CATALOG.length, 6, "Phase 32 must preserve the six visible clothing sections");
assert.deepEqual(UNIFIED_CLOTHING_CATALOG.map((group) => group.label), ["منزل", "كاجوال", "رسمي", "رياضي", "تقليدي", "خارجي"]);

const customOptions = UNIFIED_CLOTHING_OPTIONS.filter((item) => item.value === "custom");
assert.equal(customOptions.length, 1, "exactly one custom clothing option must exist");
assert.equal(customOptions[0].label, "✍️ مخصص — اكتب ملابسك");

for (const option of UNIFIED_CLOTHING_OPTIONS.filter((item) => item.value !== "custom")) {
  assert.match(option.text, /\+/u, `${option.value}: every outfit must contain at least two coordinated pieces`);
  assert.match(option.text, COLOR_RE, `${option.value}: every outfit must state at least one explicit color`);
  assert.equal(option.label, option.text, `${option.value}: visible label and positive garment text should describe the same full outfit`);
}

for (const group of UNIFIED_CLOTHING_CATALOG) {
  assert.ok(group.options.filter((item) => item.value !== "custom").length >= 6, `${group.id}: expected 6-8 curated outfits`);
}

const catalogSource = fs.readFileSync(new URL("../js/phase30-clothing-catalog.js", import.meta.url), "utf8");
const pipelineSource = fs.readFileSync(new URL("../js/canonical/canonical-v3-pipeline.js", import.meta.url), "utf8");
assert.match(catalogSource, /name = "customClothing"/u, "custom clothing input must be named customClothing");
assert.match(catalogSource, /field\.hidden = select\.value !== "custom"/u, "custom input must only show for custom selection");
assert.match(pipelineSource, /selectedGarment === "custom"/u, "pipeline must explicitly resolve custom clothing");
assert.match(pipelineSource, /raw\.customClothing/u, "pipeline must read raw.customClothing");

const base = {
  studioSection:"street",
  intentType:"selfie",
  scene:"street",
  streetMood:"normal",
  time:"day",
  hasReference:true,
  pose:"standing-relaxed",
  expression:"neutral",
  fabric:"cotton-jersey",
  fabricWeight:"light",
  ironState:"lightly-unpressed",
  wearState:"normal-day",
  clothingFit:"regular"
};

const curatedRaw = { ...base, clothing:"casual-tee-black-jeans-blue" };
const curatedOutputs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(curatedRaw));
assert.equal(curatedOutputs.every((item) => item.prompt === curatedOutputs[0].prompt), true, "curated outfit determinism failed");
assert.match(curatedOutputs[0].prompt, /تيشيرت أسود ثقيل \+ جينز أزرق داكن/u);
assert.ok(words(curatedOutputs[0].prompt) <= 250, `curated prompt exceeds 250 words (${words(curatedOutputs[0].prompt)})`);

const customText = "قميص كتان أبيض واسع + بنطلون كحلي مستقيم";
const customRaw = { ...base, clothing:"custom", customClothing:customText };
const customOutputs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(customRaw));
assert.equal(customOutputs.every((item) => item.prompt === customOutputs[0].prompt), true, "custom outfit determinism failed");
assert.ok(customOutputs[0].prompt.includes(customText), "custom clothing text must flow into the positive prompt verbatim");
assert.equal(customOutputs[0].canonical.subjects.primary.clothing.garment, customText, "custom garment must remain verbatim in canonical state");
assert.ok(words(customOutputs[0].prompt) <= 250, `custom prompt exceeds 250 words (${words(customOutputs[0].prompt)})`);

const emptyCustom = buildCanonicalV3UserOutput({ ...base, clothing:"custom", customClothing:"" });
assert.equal(emptyCustom.canonical.subjects.primary.clothing.garment, PHASE32_NEUTRAL_CUSTOM_OUTFIT, "empty custom clothing must use the neutral fallback outfit");
assert.ok(emptyCustom.prompt.includes(PHASE32_NEUTRAL_CUSTOM_OUTFIT));

assert.deepEqual(
  customOutputs[0].canonical.hard_constraints,
  curatedOutputs[0].canonical.hard_constraints,
  "clothing selection must not mutate canonical hard constraints"
);

console.log(`PHASE32_GROUPS=${UNIFIED_CLOTHING_CATALOG.length}`);
console.log(`PHASE32_OPTIONS=${UNIFIED_CLOTHING_OPTIONS.length}`);
console.log(`PHASE32_CURATED_WORDS=${words(curatedOutputs[0].prompt)}`);
console.log(`PHASE32_CUSTOM_WORDS=${words(customOutputs[0].prompt)}`);
console.log("PHASE32_DETERMINISM=10/10");
console.log("✓ Phase 32 full-outfit colored clothing + custom input contracts passed");
