import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_STATE,
  buildPromptPack,
  buildStructuredPromptSpec,
  getClothingFitOptions,
  getClothingOptions,
  getFabricOptions,
  getFabricWeightOptions,
  getIronStateOptions,
  getWearStateOptions,
  normalizeState
} from "../js/physics-prompt-engine-v5.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

assert.ok(getClothingOptions("custom").length >= 55);
assert.ok(getClothingOptions("rangeRover").length >= 30);
assert.ok(getClothingOptions("my_bedroom_text").some((item) => item.value === "sleep-striped-pajama"));
assert.ok(getClothingOptions("street").some((item) => item.value === "thobe-linen-offwhite"));
assert.ok(getClothingOptions("gym").some((item) => item.value === "sport-tech-tee-pants"));

const thobeFabrics = getFabricOptions("thobe-poplin-white").map((item) => item.value);
assert.ok(thobeFabrics.includes("polycotton"));
assert.ok(thobeFabrics.includes("cotton-poplin"));
assert.ok(!thobeFabrics.includes("denim"));
assert.ok(!thobeFabrics.includes("technical-poly"));

const sportFabrics = getFabricOptions("sport-tech-tee-pants").map((item) => item.value);
assert.ok(sportFabrics.includes("technical-poly"));
assert.ok(sportFabrics.includes("nylon-stretch"));
assert.ok(!sportFabrics.includes("linen"));
assert.deepEqual(getClothingFitOptions("thobe-poplin-white").map((item) => item.value), ["traditional-straight"]);
assert.ok(getClothingFitOptions("tee-heavy-black").some((item) => item.value === "oversized"));
assert.ok(getIronStateOptions("shirt-poplin-formal").some((item) => item.value === "fresh-pressed"));
assert.ok(getWearStateOptions("sport-tech-tee-pants").some((item) => item.value === "post-workout"));
assert.ok(getFabricWeightOptions("tee-heavy-black", "heavy-cotton-jersey").some((item) => item.value === "heavy"));

const correctedThobe = normalizeState({
  ...DEFAULT_STATE,
  scene:"street",
  poseFamily:"street",
  pose:"street-standing",
  clothing:"thobe-poplin-white",
  fabric:"denim",
  fabricWeight:"heavy",
  clothingFit:"oversized"
});
assert.notEqual(correctedThobe.fabric, "denim");
assert.equal(correctedThobe.clothingFit, "traditional-straight");
assert.ok(["light","medium"].includes(correctedThobe.fabricWeight));

const seatedWorkState = normalizeState({
  ...DEFAULT_STATE,
  studioSection:"car",
  scene:"rangeRover",
  time:"day",
  poseFamily:"car",
  pose:"car-driver-close",
  clothing:"work-oxford-navy",
  fabric:"cotton-oxford",
  fabricWeight:"medium",
  ironState:"fresh-pressed",
  wearState:"hours-worn",
  clothingFit:"regular",
  composition:"close",
  selfieAngle:"eye",
  lighting:"car-day-window"
});
const seatedWorkSpec = buildStructuredPromptSpec(seatedWorkState);
const clothing = seatedWorkSpec.subject.clothing;
assert.equal(clothing.garment.id, "work-oxford-navy");
assert.equal(clothing.fabric.id, "cotton-oxford");
assert.match(clothing.fabric.instruction, /Oxford cotton/u);
assert.equal(clothing.fabric_weight.id, "medium");
assert.equal(clothing.iron_state.id, "fresh-pressed");
assert.match(clothing.iron_state.instruction, /freshly pressed before wear/u);
assert.equal(clothing.wear_state.id, "hours-worn");
assert.match(clothing.wear_state.instruction, /worn for several hours/u);
assert.equal(clothing.fit.id, "regular");
assert.match(clothing.visibility_rule, /head-and-shoulders crop/u);

const seatedWorkPack = buildPromptPack(seatedWorkState);
assert.match(seatedWorkPack.negative, /impossible fabric behavior/u);
assert.match(seatedWorkPack.negative, /silk-like gloss on matte cotton/u);
assert.match(seatedWorkPack.negative, /lower-body clothing forced into tight close-up/u);
assert.ok(seatedWorkPack.qa.some((item) => item.label === "الملابس" && /أكسفورد/u.test(item.value)));

const lyingSleepSpec = buildStructuredPromptSpec({
  ...DEFAULT_STATE,
  scene:"my_bedroom_text",
  poseFamily:"lying",
  pose:"lying-right-close",
  clothing:"sleep-flannel-pajama",
  fabric:"flannel",
  fabricWeight:"heavy",
  ironState:"unpressed",
  wearState:"home-used",
  clothingFit:"relaxed",
  composition:"close"
});
assert.equal(lyingSleepSpec.subject.clothing.fabric.id, "flannel");
assert.match(lyingSleepSpec.subject.clothing.fabric.instruction, /soft flannel/u);
assert.equal(lyingSleepSpec.subject.clothing.fabric_weight.id, "heavy");
assert.match(lyingSleepSpec.subject.clothing.fabric_weight.instruction, /heavy fabric weight/u);
assert.equal(lyingSleepSpec.subject.clothing.iron_state.id, "unpressed");
assert.equal(lyingSleepSpec.subject.clothing.wear_state.id, "home-used");

const index = readFileSync(resolve(root, "index.html"), "utf8");
for (const id of ["fabric","fabric-weight","iron-state","wear-state","clothing-fit"]) {
  assert.match(index, new RegExp(`id="${id}"`, "u"), `Missing clothing physics control: ${id}`);
}
assert.match(index, /نوع القماش/u);
assert.match(index, /حالة الكي/u);
assert.match(index, /حالة الاستعمال/u);

const app = readFileSync(resolve(root, "js/physics-app-v7.js"), "utf8");
assert.match(app, /getFabricOptions/u);
assert.match(app, /getFabricWeightOptions/u);
assert.match(app, /getIronStateOptions/u);
assert.match(app, /getWearStateOptions/u);
assert.match(app, /getClothingFitOptions/u);
assert.match(app, /populateClothingPhysics/u);

console.log("✓ canonical clothing catalogs, compatibility normalization and structured JSON passed");
console.log("✓ clothing physics controls remain wired into the live UI");
