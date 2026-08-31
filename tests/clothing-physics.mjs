import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_STATE,
  buildPromptPack,
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

assert.ok(getClothingOptions("custom").length >= 55, "Custom scenes should expose the expanded clothing catalog");
assert.ok(getClothingOptions("rangeRover").length >= 30, "Car scenes should have a broad realistic clothing catalog");
assert.ok(getClothingOptions("my_bedroom_text").some((item) => item.value === "sleep-striped-pajama"));
assert.ok(getClothingOptions("street").some((item) => item.value === "thobe-linen-offwhite"));
assert.ok(getClothingOptions("gym").some((item) => item.value === "sport-tech-tee-pants"));

const thobeFabrics = getFabricOptions("thobe-poplin-white").map((item) => item.value);
assert.ok(thobeFabrics.includes("polycotton"));
assert.ok(thobeFabrics.includes("cotton-poplin"));
assert.ok(!thobeFabrics.includes("denim"), "A thobe must never offer denim as a fabric choice");
assert.ok(!thobeFabrics.includes("technical-poly"), "A thobe must never offer sports technical fabric");

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
assert.notEqual(correctedThobe.fabric, "denim", "Invalid fabric combinations must be normalized away");
assert.equal(correctedThobe.clothingFit, "traditional-straight");
assert.ok(["light","medium"].includes(correctedThobe.fabricWeight));

const seatedWorkPack = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"rangeRover",
  time:"day",
  poseFamily:"car",
  pose:"car-driver-close",
  carSeat:"driver-left",
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
assert.match(seatedWorkPack.positive, /\[CLOTHING PHYSICS\]/u);
assert.match(seatedWorkPack.positive, /Selected fabric: Oxford cotton/u);
assert.match(seatedWorkPack.positive, /selected fabric is authoritative/i);
assert.match(seatedWorkPack.positive, /freshly pressed before wear/u);
assert.match(seatedWorkPack.positive, /worn for several hours/u);
assert.match(seatedWorkPack.positive, /Because the body is seated/u);
assert.match(seatedWorkPack.positive, /do not force trousers, knees, waistbands or lower-body folds into frame/i);
assert.match(seatedWorkPack.positive, /Pressing may reduce old wrinkles but never prevents fresh pose creases/u);
assert.match(seatedWorkPack.negative, /impossible fabric behavior/u);
assert.match(seatedWorkPack.negative, /silk-like gloss on matte cotton/u);
assert.match(seatedWorkPack.negative, /lower-body clothing forced into tight close-up/u);
assert.ok(seatedWorkPack.qa.some((item) => item.label === "الملابس" && /أكسفورد/u.test(item.value)));

const lyingSleepPack = buildPromptPack({
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
assert.match(lyingSleepPack.positive, /soft flannel/u);
assert.match(lyingSleepPack.positive, /Because the body is lying or reclining/u);
assert.match(lyingSleepPack.positive, /compresses under the shoulder, side, back or hip/u);
assert.match(lyingSleepPack.positive, /heavy fabric weight/u);

const index = readFileSync(resolve(root, "index.html"), "utf8");
for (const id of ["fabric","fabric-weight","iron-state","wear-state","clothing-fit"]) {
  assert.match(index, new RegExp(`id="${id}"`, "u"), `Missing clothing physics control: ${id}`);
}
assert.match(index, /نوع القماش/u);
assert.match(index, /حالة الكي/u);
assert.match(index, /حالة الاستعمال/u);

const app = readFileSync(resolve(root, "js/physics-app-v5.js"), "utf8");
assert.match(app, /getFabricOptions/u);
assert.match(app, /getFabricWeightOptions/u);
assert.match(app, /getIronStateOptions/u);
assert.match(app, /getWearStateOptions/u);
assert.match(app, /getClothingFitOptions/u);
assert.match(app, /populateClothingPhysics/u);

console.log("✓ expanded clothing catalog passed");
console.log("✓ fabric compatibility and weight filtering passed");
console.log("✓ ironing, wear, fit and pose-linked fold physics passed");
console.log("✓ clothing physics controls are wired into the live UI");
