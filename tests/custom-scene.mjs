import assert from "node:assert/strict";
import {
  DEFAULT_STATE,
  buildPromptPack,
  getBackgroundVisibility,
  getLightingOptions,
  getPoseFamilyOptions,
  getPoseOptions,
  getSceneOptions,
  isCustomScene,
  normalizeState
} from "../js/physics-prompt-engine-v5.js";

assert.equal(isCustomScene("custom"), true);
assert.ok(getSceneOptions().some((item) => item.value === "custom" && /مشهد مخصص/u.test(item.label)));

const families = getPoseFamilyOptions("custom").map((item) => item.value);
assert.ok(families.includes("relaxed"));
assert.ok(families.includes("standing"));
assert.ok(families.includes("seated"));
assert.ok(families.includes("activity"));
assert.ok(getPoseOptions("custom").length >= 5);
assert.ok(getLightingOptions("custom", "day").length >= 4);
assert.ok(getLightingOptions("custom", "night").length >= 4);

const opticalStore = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"custom",
  customScene:"inside a modern medical optical store in Saudi Arabia",
  customSceneDetails:"eyeglass display racks, one small mirror, one staff member in the background",
  city:"riyadh",
  time:"day",
  poseFamily:"relaxed",
  pose:"custom-relaxed-close",
  selfieAngle:"eye",
  composition:"close",
  lighting:"custom-day-auto-practical",
  clothing:"tee-black",
  messiness:"natural"
});

assert.equal(opticalStore.state.scene, "custom");
assert.equal(getBackgroundVisibility(opticalStore.state), "conditional");
assert.match(opticalStore.positive, /\[CUSTOM SCENE AUTHORITY\]/u);
assert.match(opticalStore.positive, /modern medical optical store/u);
assert.match(opticalStore.positive, /Requested supporting details/u);
assert.match(opticalStore.positive, /eyeglass display racks/u);
assert.match(opticalStore.positive, /do not force every requested item into frame/iu);
assert.match(opticalStore.positive, /Use the selected selfie angle and crop to decide which parts of the user-defined location are truly visible/u);
assert.match(opticalStore.positive, /Staff or customers may appear only when the selected angle and crop leave real background space/u);
assert.match(opticalStore.positive, /Cars, pedestrians or street detail may appear only if a real doorway, storefront window, open frontage or exterior portion is physically visible/u);
assert.match(opticalStore.positive, /Do not silently replace the requested place with a bedroom, car, gym, street or unrelated generic interior/u);
assert.doesNotMatch(opticalStore.positive, /\[TEXT ROOM AUTHORITY\]/u);
assert.doesNotMatch(opticalStore.positive, /\[CAR SEAT POSITION\]/u);
assert.match(opticalStore.negative, /duplicated shelves/u);
assert.match(opticalStore.negative, /floating merchandise/u);
assert.match(opticalStore.negative, /outdoor traffic behind opaque interior wall/u);
assert.ok(opticalStore.qa.some((item) => item.label === "المشهد" && /optical store/u.test(item.value)));
assert.ok(opticalStore.qa.some((item) => item.label === "الخلفية" && /زاوية السيلفي/u.test(item.value)));

const tightGrocery = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"custom",
  customScene:"inside a small neighborhood grocery store in Saudi Arabia",
  customSceneDetails:"ordinary shelves and one cashier",
  time:"night",
  poseFamily:"relaxed",
  pose:"custom-relaxed-close",
  selfieAngle:"eye",
  composition:"tight",
  lighting:"custom-night-auto-practical"
});
assert.equal(getBackgroundVisibility(tightGrocery.state), "minimal");
assert.match(tightGrocery.positive, /The tight selfie crop dominates/u);
assert.match(tightGrocery.positive, /do not force a wide view of the custom scene/u);

const normalizedBedroom = normalizeState({
  ...DEFAULT_STATE,
  scene:"bedroom",
  customScene:"this must be cleared",
  customSceneDetails:"also cleared"
});
assert.equal(normalizedBedroom.customScene, "");
assert.equal(normalizedBedroom.customSceneDetails, "");

console.log("✓ custom scene selector, pose and lighting catalogs passed");
console.log("✓ custom optical-store and grocery realism guards passed");
console.log("✓ angle-aware custom background visibility passed");