import assert from "node:assert/strict";
import {
  UNIFIED_CLOTHING_CATALOG,
  UNIFIED_CLOTHING_OPTIONS,
  resolveClothingText
} from "../js/phase30-clothing-catalog.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
assert.equal(UNIFIED_CLOTHING_CATALOG.length, 6);
assert.deepEqual(UNIFIED_CLOTHING_CATALOG.map((group) => group.label), ["منزل", "كاجوال", "رسمي", "رياضي", "تقليدي", "خارجي"]);
assert.equal(UNIFIED_CLOTHING_OPTIONS.filter((item) => item.value === "custom").length, 1);
for (const group of UNIFIED_CLOTHING_CATALOG) assert.ok(group.options.filter((item) => item.value !== "custom").length >= 6);

const base = {
  studioSection:"street", scene:"street", time:"day", hasReference:true,
  pose:"standing-relaxed", expression:"neutral", fabric:"cotton-jersey",
  fabricWeight:"light", ironState:"lightly-unpressed", wearState:"normal-day", clothingFit:"regular"
};
const curated = Array.from({ length:10 }, () => buildCanonicalV3UserOutput({ ...base, clothing:"casual-tee-black-jeans-blue" }));
assert.ok(curated.every((item) => item.prompt === curated[0].prompt));
assert.match(curated[0].prompt, /تيشيرت أسود ثقيل \+ جينز أزرق داكن/u);
assert.ok(words(curated[0].prompt) <= 250);

const customText = "قميص كتان أبيض واسع + بنطلون كحلي مستقيم";
const customRaw = { ...base, clothing:"custom", customClothing:customText };
const custom = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(customRaw));
assert.ok(custom.every((item) => item.prompt === custom[0].prompt));
assert.ok(custom[0].prompt.includes(customText));
assert.equal(resolveClothingText("custom", customRaw), customText);
assert.equal(resolveClothingText("custom", { customClothing:"" }), "", "Phase 37 supersedes the Phase 32 empty-custom neutral fallback");
assert.ok(words(custom[0].prompt) <= 250);
assert.deepEqual(custom[0].canonical.hard_constraints, curated[0].canonical.hard_constraints);

console.log(`PHASE32_OPTIONS=${UNIFIED_CLOTHING_OPTIONS.length}`);
console.log("PHASE32_DETERMINISM=10/10");
console.log("✓ Phase 32 full-outfit contracts preserved under Phase 37 clothing authority");
