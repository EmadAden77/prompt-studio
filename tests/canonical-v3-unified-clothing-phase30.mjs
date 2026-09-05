import assert from "node:assert/strict";
import fs from "node:fs";
import { SCENES } from "../js/data.js";
import {
  PHASE30_ORIGINAL_CLOTHING_VALUES,
  UNIFIED_CLOTHING_CATALOG,
  UNIFIED_CLOTHING_OPTIONS,
  UNIFIED_CLOTHING_SECTION_ORDER,
  getUnifiedClothingOptions
} from "../js/phase30-clothing-catalog.js";
import { garmentOptionsForSection } from "../js/phase22-ui-runtime.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";

const expectedLabels = ["منزل", "كاجوال", "رسمي", "رياضي", "تقليدي", "خارجي"];
assert.deepEqual(UNIFIED_CLOTHING_SECTION_ORDER, ["home", "casual", "formal", "sport", "traditional", "outdoor"]);
assert.equal(UNIFIED_CLOTHING_CATALOG.length, 6, "Phase 30 must expose exactly six clothing groups");
assert.deepEqual(UNIFIED_CLOTHING_CATALOG.map((section) => section.label), expectedLabels);

for (const section of UNIFIED_CLOTHING_CATALOG) {
  assert.ok(section.options.length > 1, `${section.id}: section must contain real clothing options`);
  assert.equal(section.options[0].value, "", `${section.id}: first option must be the empty default`);
  assert.equal(section.options[0].label, "غير محدد", `${section.id}: empty default must be labeled غير محدد`);
}

const unifiedValues = UNIFIED_CLOTHING_OPTIONS.map((option) => option.value);
assert.equal(unifiedValues.length, new Set(unifiedValues).size, "unified catalog must not duplicate internal values");
for (const value of PHASE30_ORIGINAL_CLOTHING_VALUES.filter(Boolean)) {
  assert.ok(unifiedValues.includes(value), `legacy clothing value lost: ${value}`);
}

const flat = getUnifiedClothingOptions();
for (const [sceneId, scene] of Object.entries(SCENES)) {
  if (!Array.isArray(scene.clothing)) continue;
  assert.deepEqual(scene.clothing.map((option) => option.value), flat.map((option) => option.value), `${sceneId}: scene still has a separate clothing list`);
}

for (const section of ["solo", "street", "bedroom", "gym", "car", "carExterior", "accidental", "custom", "group"]) {
  assert.deepEqual(garmentOptionsForSection(section, "").map((option) => option.value), unifiedValues, `${section}: UI did not receive the unified clothing list`);
}

const uiSource = fs.readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
const catalogSource = fs.readFileSync(new URL("../js/phase30-clothing-catalog.js", import.meta.url), "utf8");
assert.match(uiSource, /createElement\("optgroup"\)/u, "Phase 22 clothing select must render optgroup elements");
assert.match(catalogSource, /createElement\("optgroup"\)/u, "live Phase 30 UI compatibility must render optgroup elements");
assert.equal(/SCENES\[sceneKey\]\?\.clothing/u.test(uiSource), false, "scene-specific clothing lookup must be removed from Phase 22 UI");

const crossSceneCases = [
  { studioSection:"gym", scene:"gym", clothing:"white-thobe" },
  { studioSection:"bedroom", scene:"bedroom", clothing:"sport-tech-tee-pants" },
  { studioSection:"car", scene:"rangeRover", clothing:"sleep-cotton-short" },
  { studioSection:"street", scene:"street", clothing:"work-poplin-charcoal" }
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
console.log(`PHASE30_OPTIONS=${UNIFIED_CLOTHING_OPTIONS.length}`);
console.log("✓ Phase 30 unified clothing catalog and optgroup contracts passed");
