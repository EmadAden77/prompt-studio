import assert from "node:assert/strict";
import fs from "node:fs";
import {
  CLOTHING_CATALOG,
  CLOTHING_OPTIONS,
  CLOTHING_SECTION_ORDER,
  getClothingOptions
} from "../js/clothing-authority.js";
import { CAR_EXTERIOR_CLOTHING_OPTIONS } from "../js/car-exterior-clothing-phase33.js";
import { garmentOptionsForSection } from "../js/phase22-ui-runtime.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";

const expectedLabels = ["منزل", "كاجوال", "رسمي", "رياضي", "تقليدي", "خارجي"];
assert.deepEqual(CLOTHING_SECTION_ORDER, ["home", "casual", "formal", "sport", "traditional", "outdoor"]);
assert.equal(CLOTHING_CATALOG.length, 6, "authority must expose exactly six clothing groups");
assert.deepEqual(CLOTHING_CATALOG.map((section) => section.label), expectedLabels);

for (const section of CLOTHING_CATALOG) {
  assert.ok(section.id, "catalog section must expose id");
  assert.ok(section.label, `${section.id}: catalog section must expose label`);
  assert.ok(Array.isArray(section.options) && section.options.length >= 4, `${section.id}: section must contain curated outfits`);
}

const unifiedValues = CLOTHING_OPTIONS.map((option) => option.value);
assert.equal(unifiedValues.length, new Set(unifiedValues).size, "authority catalog must not duplicate internal values");
assert.ok(unifiedValues.includes("custom"), "custom clothing option must exist");
assert.deepEqual(getClothingOptions().map((option) => option.value), unifiedValues);

for (const section of ["solo", "street", "bedroom", "gym", "car", "accidental", "custom", "group", "carExterior"]) {
  assert.deepEqual(garmentOptionsForSection(section, "").map((option) => option.value), unifiedValues, `${section}: UI did not receive the authority clothing list`);
}
assert.deepEqual(
  CAR_EXTERIOR_CLOTHING_OPTIONS.map((option) => option.value),
  unifiedValues,
  "Phase 33 carExterior wrapper must remain a compatibility view over clothing-authority.js"
);

const uiSource = fs.readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
const pipelineSource = fs.readFileSync(new URL("../js/canonical/canonical-v3-pipeline.js", import.meta.url), "utf8");
assert.match(uiSource, /CLOTHING_CATALOG\s+as\s+UNIFIED_CLOTHING_CATALOG/u, "Phase 22 UI must alias the authority catalog");
assert.match(uiSource, /getClothingOptions\s+as\s+getUnifiedClothingOptions/u, "Phase 22 UI must alias the authority options helper");
assert.match(uiSource, /createElement\("optgroup"\)/u, "Phase 22 clothing select must render optgroup elements");
assert.doesNotMatch(uiSource, /phase30-clothing-catalog\.js/u, "Phase 22 UI must not import the retired Phase 30 catalog");
assert.doesNotMatch(pipelineSource, /phase30-clothing-catalog\.js/u, "canonical pipeline must not import the retired Phase 30 catalog");
assert.equal(fs.existsSync(new URL("../js/phase30-clothing-catalog.js", import.meta.url)), false, "Phase 30 catalog facade must be deleted");

const crossSceneCases = [
  { studioSection:"gym", scene:"gym", clothing:"sport-tee-black-shorts-gray" },
  { studioSection:"bedroom", scene:"bedroom", clothing:"home-henley-gray-navy" },
  { studioSection:"car", scene:"rangeRover", clothing:"casual-tee-black-jeans-blue" },
  { studioSection:"street", scene:"street", clothing:"outdoor-leather-brown-tee-white-jeans-blue" }
];
for (const sample of crossSceneCases) {
  assert.ok(unifiedValues.includes(sample.clothing), `fixture missing from authority catalog: ${sample.clothing}`);
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

console.log(`PHASE30_GROUPS=${CLOTHING_CATALOG.length}`);
console.log(`PHASE39_AUTHORITY_OPTIONS=${CLOTHING_OPTIONS.length}`);
console.log("✓ Historical Phase 30 contracts now resolve directly through clothing-authority.js");
