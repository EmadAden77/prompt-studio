import assert from "node:assert/strict";
import {
  DEFAULT_STATE,
  buildPromptPack,
  buildStructuredPromptSpec,
  getBackgroundVisibility,
  getLightingOptions,
  getPoseFamilyOptions,
  getPoseOptions,
  getSceneOptions,
  isBedroomScene,
  isCustomScene,
  normalizeState
} from "../js/physics-prompt-engine-v5.js";

assert.equal(isCustomScene("custom"), true);
assert.equal(isBedroomScene("custom"), false, "Custom scene must stay isolated from bedroom fallback behavior");
assert.ok(getSceneOptions().some((item) => item.value === "custom" && /مشهد مخصص/u.test(item.label)));

const families = getPoseFamilyOptions("custom").map((item) => item.value);
assert.ok(families.includes("relaxed"));
assert.ok(families.includes("standing"));
assert.ok(families.includes("seated"));
assert.ok(families.includes("activity"));
assert.ok(getPoseOptions("custom").length >= 5);
assert.ok(getLightingOptions("custom", "day").length >= 4);
assert.ok(getLightingOptions("custom", "night").length >= 4);

const opticalStore = normalizeState({
  ...DEFAULT_STATE,
  studioSection:"custom",
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
  messiness:"natural",
  bedroomWindow:"day-charcoal-open-skylight"
});

assert.equal(opticalStore.scene, "custom");
assert.equal(opticalStore.bedroomWindow, "", "Bedroom-window state must not leak into custom locations");
assert.equal(getBackgroundVisibility(opticalStore), "conditional");

const spec = buildStructuredPromptSpec(opticalStore);
assert.equal(spec.authority.scene.id, "custom");
assert.match(spec.authority.scene.description, /modern medical optical store/u);
assert.match(spec.authority.scene.supporting_details, /eyeglass display racks/u);
assert.equal(spec.scene.vehicle_geometry, null);

assert.equal(spec.background.scene_family, "custom");
assert.match(spec.background.elements.visibility_rule, /Omit optional context before widening/u);
assert.doesNotMatch(JSON.stringify(spec), /BEDROOM TOPOLOGY LOCK/u);
assert.doesNotMatch(JSON.stringify(spec), /left_hand_drive/u);

const pack = buildPromptPack(opticalStore);
assert.match(pack.positive, /modern medical optical store/u);
assert.doesNotMatch(pack.positive, /\[VEHICLE GEOMETRY\]/u);
assert.match(pack.negative, /scene leakage from another studio section/u);
assert.ok(pack.qa.some((item) => item.label === "التعارضات"));

const tightGrocery = normalizeState({
  ...DEFAULT_STATE,
  studioSection:"custom",
  scene:"custom",
  customScene:"inside a small neighborhood grocery store in Saudi Arabia",
  customSceneDetails:"ordinary shelves and one cashier",
  time:"night",
  poseFamily:"relaxed",
  pose:"custom-relaxed-close",
  selfieAngle:"eye",
  composition:"tight",
  lighting:"custom-night-auto-practical",
  clothing:"tee-black"
});
assert.equal(getBackgroundVisibility(tightGrocery), "minimal");
const grocerySpec = buildStructuredPromptSpec(tightGrocery);
assert.match(grocerySpec.authority.scene.description, /grocery store/u);
assert.match(grocerySpec.authority.scene.supporting_details, /ordinary shelves/u);

const normalizedBedroom = normalizeState({
  ...DEFAULT_STATE,
  scene:"bedroom",
  customScene:"this must be cleared",
  customSceneDetails:"also cleared"
});
assert.equal(normalizedBedroom.customScene, "");
assert.equal(normalizedBedroom.customSceneDetails, "");

console.log("✓ canonical custom-scene isolation, catalogs and visibility passed");
