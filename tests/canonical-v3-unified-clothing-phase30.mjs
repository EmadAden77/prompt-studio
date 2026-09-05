import assert from "node:assert/strict";
import fs from "node:fs";
import { SCENES } from "../js/data.js";
import {
  UNIFIED_CLOTHING_CATALOG,
  UNIFIED_CLOTHING_OPTIONS,
  UNIFIED_CLOTHING_SECTION_ORDER,
  getUnifiedClothingOptions
} from "../js/phase30-clothing-catalog.js";
import { CAR_EXTERIOR_CLOTHING_OPTIONS } from "../js/car-exterior-clothing-phase33.js";
import { garmentOptionsForSection } from "../js/phase22-ui-runtime.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";

const expectedLabels = ["منزل", "كاجوال", "رسمي", "رياضي", "تقليدي", "خارجي"];
assert.deepEqual(UNIFIED_CLOTHING_SECTION_ORDER, ["home", "casual", "formal", "sport", "traditional", "outdoor"]);
assert.equal(UNIFIED_CLOTHING_CATALOG.length, 6, "Phase 30/32 must expose exactly six clothing groups");
assert.deepEqual(UNIFIED_CLOTHING_CATALOG.map((section) => section.label), expectedLabels);

for (const section of UNIFIED_CLOTHING_CATALOG) {
  assert.ok(section.options.length >= 6, `${section.id}: section must contain a curated outfit set`);
}

const unifiedValues = UNIFIED_CLOTHING_OPTIONS.map((option) => option.value);
assert.equal(unifiedValues.length, new Set(unifiedValues).size, "unified catalog must not duplicate internal values");
assert.ok(unifiedValues.includes("custom"), "custom clothing option must exist");

const flat = getUnifiedClothingOptions();
for (const [sceneId, scene] of Object.entries(SCENES)) {
  if (!Array.isArray(scene.clothing)) continue;
  assert.deepEqual(scene.clothing.map((option) => option.value), flat.map((option) => option.value), `${sceneId}: scene still has a separate clothing list`);
}

for (const section of ["solo", "street", "bedroom", "gym", "car", "accidental", "custom", "group"]) {
  assert.deepEqual(garmentOptionsForSection(section, "").map((option) => option.value), unifiedValues, `${section}: UI did not receive the unified clothing list`);
}
assert.deepEqual(
  garmentOptionsForSection("carExterior", "").map((option) => option.value),
  CAR_EXTERIOR_CLOTHING_OPTIONS.map((option) => option.value),
  "carExterior must use the Phase 33 wide catalog while the base unified catalog remains unchanged"
);
for (const value of ["casual-tee-black-jeans-blue", "formal-poplin-white-suit-black", "sport-tee-black-shorts-gray", "outdoor-leather-brown-tee-white-jeans-blue", "custom"]) {
  assert.ok(garmentOptionsForSection("carExterior", "").some((option) => option.value === value), `carExterior Phase 33 catalog lost unified option ${value}`);
}

const uiSource = fs.readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
const catalogSource = fs.readFileSync(new URL("../js/phase30-clothing-catalog.js", import.meta.url), "utf8");
assert.match(uiSource, /createElement\("optgroup"\)/u, "Phase 22 clothing select must render optgroup elements");
assert.match(catalogSource, /createElement\("optgroup"\)/u, "live unified UI compatibility must render optgroup elements");
assert.equal(/SCENES\[sceneKey\]\?\.clothing/u.test(uiSource), false, "scene-specific clothing lookup must be removed from Phase 22 UI");

const crossSceneCases = [
  { studioSection:"gym", scene:"gym", clothing:"sport-tee-black-shorts-gray" },
  { studioSection:"bedroom", scene:"bedroom", clothing:"home-henley-gray-navy" },
  { studioSection:"car", scene:"rangeRover", clothing:"casual-tee-black-jeans-blue" },
  { studioSection:"street", scene:"street", clothing:"outdoor-leather-brown-tee-white-jeans-blue" }
];
for (const sample of crossSceneCases) {
  assert.ok(unifiedValues.includes(sample.clothing), `fixture missing from unified catalog: ${sample.clothing}`);
  const output = buildCanonicalV3UserOutput({
    ...sample,
    time:"day",
    hasReference:true,
    fabric:"cotton-jersey",
    fabricWeight:"light",
    ironState:"lightly-unpressed",
    wearState:"normal-day",
    clothingFit:"regular"
  });
  assert.notEqual(output.canonical.subjects.primary.clothing.garment, "", `${sample.scene}: cross-scene clothing was discarded`);
}

console.log(`PHASE30_GROUPS=${UNIFIED_CLOTHING_CATALOG.length}`);
console.log(`PHASE32_OUTFITS=${UNIFIED_CLOTHING_OPTIONS.length}`);
console.log("✓ Unified clothing catalog and optgroup contracts passed with Phase 33 carExterior specialization");
