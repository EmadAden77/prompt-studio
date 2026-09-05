import assert from "node:assert/strict";
import fs from "node:fs";
import { SCENES } from "../js/data.js";
import { garmentOptionsForSection, garmentSceneForSection } from "../js/phase22-ui-runtime.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import { buildOpenAIImagePrompt } from "../js/canonical/openai-image-adapter.js";

const wordCount = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const uiSource = fs.readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
const indexSource = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.equal((indexSource.match(/id="clothing"/gu) || []).length, 1, "index must expose exactly one standard garment select");
assert.equal(/carExteriorClothing|car-exterior-clothing/u.test(uiSource), false, "carExterior duplicate garment select must be removed");
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
  assert.ok(garmentOptionsForSection(section, "").length > 0, `${section}: garment list missing`);
}
for (const scene of ["majlis", "kashta", "barbershop", "grocery", "rooftop", "streetFootball", "gasStation"]) {
  assert.equal(garmentSceneForSection("solo", scene), scene, `${scene}: own garment list must override solo street default`);
  assert.deepEqual(garmentOptionsForSection("solo", scene), SCENES[scene].clothing, `${scene}: garment list mismatch`);
}
assert.deepEqual(garmentOptionsForSection("carExterior", ""), SCENES.carExterior.clothing, "carExterior garment list must exactly match SCENES.carExterior.clothing");

const raw = {
  studioSection: "carExterior",
  scene: "carExterior",
  hasReference: true,
  carExteriorLocation: "villa",
  carExteriorPose: "door-open",
  carExteriorLighting: "interior-spill",
  time: "night",
  clothing: "white-thobe",
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
assert.match(clothing.garment, /clean white cotton thobe/iu);
assert.match(clothing.fabric, /cotton poplin/iu);
assert.match(clothing.fabric_weight, /medium fabric weight/iu);
assert.match(clothing.wear_state, /ordinary daily wear/iu);
assert.match(clothing.fit, /regular fit/iu);
assert.match(clothing.custom_modifier, /normally pressed/iu);
assert.match(clothing.custom_modifier, /plain cuffs/iu);
assert.match(output.prompt, /cotton poplin/iu);
assert.match(output.prompt, /medium fabric weight/iu);
assert.match(output.prompt, /ordinary daily wear/iu);
assert.match(output.prompt, /regular fit/iu);
assert.match(output.prompt, /normally pressed/iu);
assert.ok(wordCount(output.prompt) <= 250, `carExterior prompt exceeds 250 words (${wordCount(output.prompt)})`);
const repeated = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(output.canonical));
assert.equal(repeated.every((value) => value === repeated[0]), true, "Phase 23 determinism failed");
assert.equal(JSON.stringify(output.canonical.hard_constraints), hardBefore, "hard constraints changed during adapter runs");

console.log(`PHASE23_CAR_EXTERIOR_WORDS=${wordCount(output.prompt)}`);
console.log("✓ Phase 23 unified clothing panel contracts passed");
