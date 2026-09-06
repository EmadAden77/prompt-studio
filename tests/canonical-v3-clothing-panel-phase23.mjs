import assert from "node:assert/strict";
import fs from "node:fs";
import { garmentOptionsForSection, garmentSceneForSection } from "../js/phase22-ui-runtime.js";
import { getClothingOptions } from "../js/clothing-authority.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import { buildOpenAIImagePrompt } from "../js/canonical/openai-image-adapter.js";
import { CAR_EXTERIOR_CLOTHING_OPTIONS } from "../js/car-exterior-clothing-phase33.js";

const wordCount = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const uiSource = fs.readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
const indexSource = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const authorityOptions = getClothingOptions();

assert.equal((indexSource.match(/id="clothing"/gu) || []).length, 1, "index must expose exactly one standard garment select");
assert.doesNotMatch(uiSource, /id\s*=\s*["']car-exterior-clothing["']/u, "carExterior duplicate garment select must be removed");
for (const id of ["fabric", "fabric-weight", "iron-state", "wear-state", "clothing-fit"]) {
  assert.match(indexSource, new RegExp(`id="${id}"`, "u"), `${id} must exist in the fixed clothing panel`);
}

const sectionExpectations = {
  solo: "street",
  street: "street",
  bedroom: "bedroom",
  gym: "gym",
  car: "rangeRover",
  carExterior: "carExterior",
  accidental: "street",
  custom: "street",
  group: "street"
};
for (const [section, scene] of Object.entries(sectionExpectations)) {
  assert.equal(garmentSceneForSection(section, ""), scene, `${section}: wrong garment scene`);
  assert.deepEqual(
    garmentOptionsForSection(section, "").map((option) => option.value),
    authorityOptions.map((option) => option.value),
    `${section}: garment list must come from clothing-authority.js`
  );
}
for (const scene of ["majlis", "kashta", "barbershop", "grocery", "rooftop", "streetFootball", "gasStation"]) {
  assert.equal(garmentSceneForSection("solo", scene), scene, `${scene}: selected scene must still route correctly`);
  assert.deepEqual(
    garmentOptionsForSection("solo", scene).map((option) => option.value),
    authorityOptions.map((option) => option.value),
    `${scene}: UI must keep the unified authority clothing list instead of scene-specific clothing`
  );
}
assert.deepEqual(
  garmentOptionsForSection("carExterior", "").map((option) => option.value),
  CAR_EXTERIOR_CLOTHING_OPTIONS.map((option) => option.value),
  "carExterior Phase 33 wrapper must mirror the authority catalog"
);
assert.ok(garmentOptionsForSection("carExterior", "").length >= 90, "carExterior must expose the 90+ authority catalog");

const raw = {
  studioSection: "carExterior",
  scene: "carExterior",
  hasReference: true,
  carExteriorLocation: "villa",
  carExteriorPose: "door-open",
  carExteriorLighting: "interior-spill",
  time: "night",
  clothing: "traditional-thobe-white-shemagh-red-iqal-black",
  fabric: "cotton-poplin",
  fabricWeight: "medium",
  ironState: "normal-pressed",
  wearState: "normal-day",
  clothingFit: "regular",
  clothingCustom: "plain cuffs"
};
const output = buildCanonicalV3UserOutput(raw);
const hardBefore = JSON.stringify(output.canonical.hard_constraints);
const clothing = output.canonical.subjects.primary.clothing;
assert.match(clothing.garment, /white thobe with red-and-white shemagh and black iqal/iu);
assert.match(clothing.fabric, /cotton poplin/iu);
assert.match(clothing.fabric_weight, /medium fabric weight/iu);
assert.match(clothing.wear_state, /ordinary daily wear/iu);
assert.match(clothing.fit, /regular fit/iu);
assert.match(clothing.custom_modifier, /normally pressed/iu);
assert.match(clothing.custom_modifier, /plain cuffs/iu);
assert.match(output.prompt, /white thobe/iu);
assert.match(output.prompt, /red-and-white/iu);
assert.match(output.prompt, /black iqal/iu);
console.log(`PHASE23_CAR_EXTERIOR_WORDS=${wordCount(output.prompt)}`);
console.log(`PHASE23_CAR_EXTERIOR_PROMPT=${output.prompt}`);
assert.ok(wordCount(output.prompt) <= 250, `carExterior prompt exceeds 250 words (${wordCount(output.prompt)})`);
const repeated = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(output.canonical));
assert.equal(repeated.every((value) => value === repeated[0]), true, "Phase 23 determinism failed");
assert.equal(JSON.stringify(output.canonical.hard_constraints), hardBefore, "hard constraints changed during adapter runs");

console.log("✓ Phase 23 clothing panel contracts passed under Phase 39 unified authority UI");
