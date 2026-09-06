import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import {
  buildOpenAIImagePrompt,
  SELFIE_ARM_LOCK,
  IDENTITY_STRICT_LOCK,
  PROTECTED_LIGHTING_PREFIX
} from "../js/canonical/openai-image-adapter-phase36.js";
import { garmentOptionsForSection } from "../js/phase22-ui-runtime.js";
import { getCarExteriorClothingOptions } from "../js/car-exterior-clothing-phase33.js";
import { resolveClothingText } from "../js/clothing-authority.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const withoutLock = (value) => String(value ?? "").replace(SELFIE_ARM_LOCK, "");
const selfieType = (value) => /selfie|driver_selfie|mirror_selfie/iu.test(String(value ?? ""));
const sections = ["solo", "group", "car", "carExterior", "bedroom", "gym", "street", "accidental", "custom"];

const phase22Source = fs.readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
assert.match(phase22Source, /CLOTHING_CATALOG\s+as\s+UNIFIED_CLOTHING_CATALOG/u, "Phase 39 master: UI must use clothing-authority catalog");
assert.match(phase22Source, /getClothingOptions\s+as\s+getUnifiedClothingOptions/u, "Phase 39 master: UI must use clothing-authority option helper");
assert.doesNotMatch(phase22Source, /phase30-clothing-catalog\.js/u, "Phase 39 master: legacy Phase 30 catalog import must remain removed");
assert.equal(fs.existsSync(new URL("../js/phase30-clothing-catalog.js", import.meta.url)), false, "Phase 39 master: legacy Phase 30 catalog file must remain deleted");

for (const section of sections) {
  const options = garmentOptionsForSection(section, "");
  assert.ok(options.length >= 90, `${section}: clothing select must expose 90+ authority options, got ${options.length}`);
  assert.equal(options[0]?.value, "custom", `${section}: custom must remain first`);
}
const carExteriorOptions = getCarExteriorClothingOptions();
assert.ok(carExteriorOptions.length >= 90, "carExterior Phase 33 wrapper must remain populated");
assert.ok(carExteriorOptions.some((item) => item.value === "sport-tracksuit-olive"), "carExterior wrapper must expose authority outfits");

const shared = {
  time:"night",
  hasReference:true,
  expression:"neutral",
  pose:"both hands occupied",
  lighting:"ordinary practical light",
  fabric:"cotton",
  fabricWeight:"light",
  ironState:"lightly-unpressed",
  wearState:"normal-day",
  clothingFit:"regular"
};

const inputs = Object.freeze({
  solo:{ ...shared, studioSection:"solo", scene:"street", clothing:"casual-tee-black-jeans-blue" },
  group:{ ...shared, studioSection:"group", scene:"street", clothing:"casual-tee-black-jeans-blue", groupCount:"3" },
  car:{ ...shared, studioSection:"car", clothing:"casual-tee-black-jeans-blue" },
  carExterior:{ ...shared, studioSection:"carExterior", clothing:"casual-tee-black-jeans-blue", carExteriorLocation:"villa", carExteriorPose:"door-lean", carExteriorLighting:"streetlight-reflection" },
  bedroom:{ ...shared, studioSection:"bedroom", scene:"bedroom", clothing:"home-flannel-red-black" },
  gym:{ ...shared, studioSection:"gym", scene:"gym", clothing:"sport-tracksuit-olive" },
  street:{ ...shared, studioSection:"street", scene:"street", clothing:"thobe-redshemagh-iqal" },
  accidental:{ ...shared, studioSection:"accidental", scene:"street", clothing:"casual-tee-black-jeans-blue" },
  custom:{ ...shared, studioSection:"custom", scene:"street", customScene:"an ordinary user-defined outdoor scene", clothing:"casual-tee-black-jeans-blue" }
});

const outputs = {};
for (const section of sections) {
  const runs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(inputs[section]));
  const first = runs[0];
  outputs[section] = first;
  assert.ok(first.prompt.trim(), `${section}: prompt must be non-empty`);
  assert.ok(runs.every((item) => item.prompt === first.prompt), `${section}: determinism must be 10/10`);
  assert.ok(first.prompt.includes(IDENTITY_STRICT_LOCK), `${section}: strict identity lock missing`);
  assert.ok(first.prompt.includes(PROTECTED_LIGHTING_PREFIX), `${section}: protected night lighting sentence missing`);
  assert.ok(words(first.prompt) <= 250, `${section}: prompt exceeds 250 words (${words(first.prompt)})`);

  if (selfieType(first.canonical?.capture?.type)) {
    assert.ok(first.prompt.includes(SELFIE_ARM_LOCK), `${section}: selfie arm lock missing`);
    const poseText = withoutLock(first.prompt);
    assert.doesNotMatch(poseText, /both\s+hands?\s+(?:in\s+)?(?:the\s+)?pockets?|arms?\s+crossed|crossed\s+arms?|both\s+hands?\s+(?:are\s+)?occupied/iu, `${section}: impossible two-hand pose leaked outside the required negative lock`);
  }

  const hardBefore = JSON.stringify(first.canonical.hard_constraints);
  void buildOpenAIImagePrompt(first.canonical);
  assert.equal(JSON.stringify(first.canonical.hard_constraints), hardBefore, `${section}: adapter must not mutate hard constraints`);
}

assert.match(outputs.carExterior.prompt, /2017 Range Rover Sport Autobiography Dynamic/iu, "carExterior spec missing");
assert.match(outputs.carExterior.prompt, /Fuji White/iu, "carExterior Fuji White lock missing");

const guardedCanonical = structuredClone(outputs.gym.canonical);
guardedCanonical.capture.type = "direct_front_camera_selfie";
guardedCanonical.subjects.primary.pose = "arms crossed with both hands occupied";
const guardedPrompt = buildOpenAIImagePrompt(guardedCanonical);
assert.ok(guardedPrompt.includes(SELFIE_ARM_LOCK), "explicit selfie guard sample must keep SELFIE_ARM_LOCK");
assert.doesNotMatch(withoutLock(guardedPrompt), /arms?\s+crossed|both\s+hands?\s+(?:are\s+)?occupied/iu, "adapter pose guard must replace crossed/occupied two-hand pose text");

const bedroomSample = buildCanonicalV3UserOutput({ ...shared, studioSection:"bedroom", scene:"bedroom", clothing:"home-flannel-red-black", pose:"relaxed standing pose" });
const gymSample = buildCanonicalV3UserOutput({ ...shared, studioSection:"gym", scene:"gym", clothing:"sport-tracksuit-olive", pose:"seated rest pose" });
const streetSample = buildCanonicalV3UserOutput({ ...shared, studioSection:"street", scene:"street", clothing:"thobe-redshemagh-iqal", pose:"relaxed standing pose" });

assert.ok(bedroomSample.prompt.includes(resolveClothingText("home-flannel-red-black", { clothing:"home-flannel-red-black" })), "bedroom pajamas text missing");
assert.ok(gymSample.prompt.includes(resolveClothingText("sport-tracksuit-olive", { clothing:"sport-tracksuit-olive" })), "gym sports outfit text missing");
assert.ok(streetSample.prompt.includes(resolveClothingText("thobe-redshemagh-iqal", { clothing:"thobe-redshemagh-iqal" })), "street thobe+shemagh text missing");
for (const sample of [bedroomSample, gymSample, streetSample]) assert.ok(words(sample.prompt) <= 250, `sample exceeds 250 words (${words(sample.prompt)})`);

console.log(`PHASE39_MASTER_SECTIONS=${sections.length}`);
console.log(`PHASE39_MASTER_OPTIONS=${garmentOptionsForSection("bedroom", "").length}`);
console.log("PHASE39_MASTER_DETERMINISM=10/10");
console.log(`PHASE39_BEDROOM_NIGHT_SAMPLE=${bedroomSample.prompt}`);
console.log(`PHASE39_GYM_SAMPLE=${gymSample.prompt}`);
console.log(`PHASE39_STREET_THOBE_SAMPLE=${streetSample.prompt}`);
console.log("✓ Phase 39 master unification passed");
